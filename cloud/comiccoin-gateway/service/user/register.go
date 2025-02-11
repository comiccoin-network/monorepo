// service/user/register.go
package user

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/application"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/user"
	domain "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/user"
	svc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth"
	uc_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/application"
	uc_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/authorization"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/user"
)

type RegisterRequest struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Phone       string `json:"phone"`
	Country     string `json:"country"`
	Timezone    string `json:"timezone"`
	AgreeToS    bool   `json:"agree_tos"`
	AppID       string `json:"app_id"`       // Required for OAuth flow
	RedirectURI string `json:"redirect_uri"` // Required for OAuth flow
	AuthFlow    string `json:"auth_flow"`    // none, auto, manual
	State       string `json:"state"`
}

type RegisterResponse struct {
	UserID      string `json:"user_id"`
	AuthCode    string `json:"auth_code,omitempty"`
	RedirectURI string `json:"redirect_uri,omitempty"`
}

type RegisterService interface {
	Register(ctx context.Context, req *RegisterRequest, ipAddress string) (*RegisterResponse, error)
}

type registerServiceImpl struct {
	cfg                   *config.Configuration
	logger                *slog.Logger
	passwordProvider      password.Provider
	userCreateUseCase     uc_user.UserCreateUseCase
	appFindByIDUseCase    uc_app.ApplicationFindByAppIDUseCase
	authFindByCodeUseCase uc_auth.AuthorizationFindByCodeUseCase
	authorizeService      svc_oauth.AuthorizeService
}

func NewRegisterService(
	cfg *config.Configuration,
	logger *slog.Logger,
	pp password.Provider,
	userCreateUseCase uc_user.UserCreateUseCase,
	appFindByIDUseCase uc_app.ApplicationFindByAppIDUseCase,
	authorizeService svc_oauth.AuthorizeService,
) RegisterService {
	return &registerServiceImpl{
		cfg:                cfg,
		logger:             logger,
		passwordProvider:   pp,
		userCreateUseCase:  userCreateUseCase,
		appFindByIDUseCase: appFindByIDUseCase,
		authorizeService:   authorizeService,
	}
}

func (s *registerServiceImpl) Register(ctx context.Context, req *RegisterRequest, ipAddress string) (*RegisterResponse, error) {
	// Validate OAuth application if auth flow requested
	var app *dom_app.Application
	if req.AuthFlow != "none" {
		var err error
		app, err = s.appFindByIDUseCase.Execute(ctx, req.AppID)
		if err != nil {
			return nil, fmt.Errorf("invalid application: %w", err)
		}

		// Log the validation process
		s.logger.Debug("validating application registration",
			slog.String("app_id", req.AppID),
			slog.String("redirect_uri", req.RedirectURI),
			slog.String("auth_flow", req.AuthFlow))

		// Validate redirect URI
		validRedirect := false
		for _, uri := range app.RedirectURIs {
			if uri == req.RedirectURI {
				validRedirect = true
				break
			}
		}
		if !validRedirect {
			s.logger.Error("invalid redirect URI",
				slog.String("provided_uri", req.RedirectURI),
				slog.Any("allowed_uris", app.RedirectURIs))
			return nil, fmt.Errorf("invalid redirect URI")
		}
	}

	password, err := sstring.NewSecureString(req.Password)
	if err != nil {
		s.logger.Error("password securing error", slog.Any("err", err))
		return nil, err
	}

	passwordHash, err := s.passwordProvider.GenerateHashFromPassword(password)
	if err != nil {
		s.logger.Error("hashing error", slog.Any("error", err))
		return nil, err
	}

	userID := primitive.NewObjectID()
	user := &dom_user.User{
		ID:                         userID,
		Email:                      req.Email,
		FirstName:                  req.FirstName,
		LastName:                   req.LastName,
		Name:                       fmt.Sprintf("%v %v", req.FirstName, req.LastName),
		LexicalName:                fmt.Sprintf("%v, %v", req.LastName, req.FirstName),
		Phone:                      req.Phone,
		Country:                    req.Country,
		Region:                     "",
		City:                       "",
		PostalCode:                 "",
		AddressLine1:               "",
		AddressLine2:               "",
		Timezone:                   req.Timezone,
		AgreeTermsOfService:        req.AgreeToS,
		CreatedByUserID:            userID,
		CreatedByName:              fmt.Sprintf("%v %v", req.FirstName, req.LastName),
		CreatedAt:                  time.Now(),
		ModifiedByUserID:           userID,
		ModifiedByName:             fmt.Sprintf("%v %v", req.FirstName, req.LastName),
		ModifiedAt:                 time.Now(),
		Role:                       dom_user.UserRoleCustomer,
		PasswordHash:               passwordHash,
		PasswordHashAlgorithm:      s.passwordProvider.AlgorithmName(),
		WasEmailVerified:           false,
		EmailVerificationCode:      primitive.NewObjectID().Hex(),
		EmailVerificationExpiry:    time.Now().Add(72 * time.Hour),
		Status:                     domain.UserStatusActive,
		HasShippingAddress:         false,
		ShippingName:               "",
		ShippingPhone:              "",
		ShippingCountry:            "",
		ShippingRegion:             "",
		ShippingCity:               "",
		ShippingPostalCode:         "",
		ShippingAddressLine1:       "",
		ShippingAddressLine2:       "",
		PaymentProcessorName:       "",
		PaymentProcessorCustomerID: "",
	}

	if err := s.userCreateUseCase.Execute(ctx, user); err != nil {
		return nil, err
	}

	response := &RegisterResponse{
		UserID: user.ID.Hex(),
	}

	// Handle OAuth flow if requested
	if req.AuthFlow != "none" {
		// First validate we have scopes available
		if len(app.Scopes) == 0 {
			s.logger.Error("application has no scopes defined",
				slog.String("app_id", req.AppID))
			return nil, fmt.Errorf("application has no scopes defined")
		}

		// Create authorization code
		authCode, err := s.authorizeService.CreatePendingAuthorization(
			ctx,
			req.AppID,
			req.RedirectURI,
			req.State,
			app.Scopes[0], // Now this is safe because we checked len(app.Scopes)
		)
		if err != nil {
			s.logger.Error("failed to create authorization",
				slog.Any("error", err))
			return response, nil
		}

		// Update the authorization code with the user ID using the service method
		if err := s.authorizeService.UpdatePendingAuthorization(ctx, authCode, user.ID.Hex()); err != nil {
			s.logger.Error("failed to update authorization",
				slog.Any("error", err))
			return response, nil
		}

		response.AuthCode = authCode
		response.RedirectURI = req.RedirectURI
	}

	return response, nil
}
