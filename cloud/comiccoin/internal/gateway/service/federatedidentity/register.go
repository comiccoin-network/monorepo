// service/federatedidentity/register.go
package federatedidentity

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
	dom_app "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/application"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/federatedidentity"
	domain "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/federatedidentity"
	svc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/service/oauth"
	uc_app "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/application"
	uc_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/authorization"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/federatedidentity"
)

// RegisterRequest represents the data needed to register a new federated identity
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

// RegisterResponse contains the data returned after successful registration
type RegisterResponse struct {
	FederatedIdentityID string `json:"federatedidentity_id"`
	AuthCode            string `json:"auth_code,omitempty"`
	RedirectURI         string `json:"redirect_uri,omitempty"`
}

// RegisterService defines the interface for registration operations
type RegisterService interface {
	Register(ctx context.Context, req *RegisterRequest, ipAddress string) (*RegisterResponse, error)
}

// registerServiceImpl implements the RegisterService interface
type registerServiceImpl struct {
	cfg                                *config.Configuration
	logger                             *slog.Logger
	passwordProvider                   password.Provider
	federatedIdentityGetByEmailUseCase uc_federatedidentity.FederatedIdentityGetByEmailUseCase
	federatedidentityCreateUseCase     uc_federatedidentity.FederatedIdentityCreateUseCase
	appFindByIDUseCase                 uc_app.ApplicationFindByAppIDUseCase
	authFindByCodeUseCase              uc_auth.AuthorizationFindByCodeUseCase
	authorizeService                   svc_oauth.AuthorizeService
}

// NewRegisterService creates a new instance of RegisterService with all required dependencies
func NewRegisterService(
	cfg *config.Configuration,
	logger *slog.Logger,
	pp password.Provider,
	federatedIdentityGetByEmailUseCase uc_federatedidentity.FederatedIdentityGetByEmailUseCase,
	federatedidentityCreateUseCase uc_federatedidentity.FederatedIdentityCreateUseCase,
	appFindByIDUseCase uc_app.ApplicationFindByAppIDUseCase,
	authFindByCodeUseCase uc_auth.AuthorizationFindByCodeUseCase,
	authorizeService svc_oauth.AuthorizeService,
) RegisterService {
	return &registerServiceImpl{
		cfg:                                cfg,
		logger:                             logger,
		passwordProvider:                   pp,
		federatedIdentityGetByEmailUseCase: federatedIdentityGetByEmailUseCase,
		federatedidentityCreateUseCase:     federatedidentityCreateUseCase,
		appFindByIDUseCase:                 appFindByIDUseCase,
		authFindByCodeUseCase:              authFindByCodeUseCase,
		authorizeService:                   authorizeService,
	}
}

// Register handles the registration of a new federated identity
func (s *registerServiceImpl) Register(ctx context.Context, req *RegisterRequest, ipAddress string) (*RegisterResponse, error) {
	// First validate all request fields before proceeding
	if err := s.validateRequestFields(req); err != nil {
		return nil, err
	}

	// Check for existing email to prevent duplicates
	if err := s.checkExistingEmail(ctx, req.Email); err != nil {
		return nil, err
	}

	// If OAuth flow is requested, validate the application and redirect URI
	var app *dom_app.Application
	var err error
	if req.AuthFlow != "none" {
		app, err = s.validateOAuthApplication(ctx, req)
		if err != nil {
			return nil, err
		}
	}

	// Create secure password hash
	passwordHash, err := s.createPasswordHash(req.Password)
	if err != nil {
		return nil, err
	}

	// Create the federated identity record
	federatedidentity, err := s.createFederatedIdentity(req, passwordHash)
	if err != nil {
		return nil, err
	}

	// Save the federated identity to the database
	if err := s.federatedidentityCreateUseCase.Execute(ctx, federatedidentity); err != nil {
		return nil, fmt.Errorf("failed to create federated identity: %w", err)
	}

	// Prepare the response
	response := &RegisterResponse{
		FederatedIdentityID: federatedidentity.ID.Hex(),
	}

	// Handle OAuth flow if requested
	if req.AuthFlow != "none" && app != nil {
		if err := s.handleOAuthFlow(ctx, req, app, federatedidentity.ID.Hex(), response); err != nil {
			s.logger.Error("OAuth flow handling failed", slog.Any("error", err))
			// We still return the response since the user was created successfully
			return response, nil
		}
	}

	return response, nil
}

type ErrorResponse struct {
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
}

// validateRequestFields ensures all required fields are present
func (s *registerServiceImpl) validateRequestFields(req *RegisterRequest) error {
	e := make(map[string]string)

	// Required field validation
	if req.Email == "" {
		e["email"] = "Email is required"
	}
	if req.Password == "" {
		e["password"] = "Password is required"
	}
	if req.FirstName == "" {
		e["first_name"] = "First name is required"
	}
	if req.LastName == "" {
		e["last_name"] = "Last name is required"
	}
	if req.Phone == "" {
		e["phone"] = "Phone is required"
	}
	if req.Country == "" {
		e["country"] = "Country is required"
	}
	if req.Timezone == "" {
		e["timezone"] = "Timezone is required"
	}
	if !req.AgreeToS {
		e["agree_tos"] = "Agreeing to terms of service is required"
	}
	if req.AppID == "" {
		e["app_id"] = "App ID is required"
	}
	if req.RedirectURI == "" {
		e["redirect_uri"] = "Redirect URI is required"
	}
	if req.AuthFlow == "" {
		e["auth_flow"] = "Auth flow is required"
	}
	if req.State == "" {
		e["state"] = "State is required"
	}

	if len(e) != 0 {
		s.logger.Warn("Failed creating new account", slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	return nil
}

// checkExistingEmail verifies that the email is not already registered
func (s *registerServiceImpl) checkExistingEmail(ctx context.Context, email string) error {
	existingIdentity, err := s.federatedIdentityGetByEmailUseCase.Execute(ctx, email)
	if err != nil {
		s.logger.Error("failed getting by email", slog.Any("err", err))
		return err
	}
	if existingIdentity != nil {
		s.logger.Warn("email already exists")
		return httperror.NewForBadRequestWithSingleField("email", "already exists")
	}
	return nil
}

// validateOAuthApplication ensures the application exists and the redirect URI is valid
func (s *registerServiceImpl) validateOAuthApplication(ctx context.Context, req *RegisterRequest) (*dom_app.Application, error) {
	app, err := s.appFindByIDUseCase.Execute(ctx, req.AppID)
	if err != nil {
		s.logger.Error("failed to find application",
			slog.String("app_id", req.AppID),
			slog.Any("error", err))
		return nil, fmt.Errorf("invalid application: %w", err)
	}

	if app == nil {
		return nil, fmt.Errorf("application not found")
	}

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

	return app, nil
}

// createPasswordHash securely hashes the provided password
func (s *registerServiceImpl) createPasswordHash(rawPassword string) (string, error) {
	password, err := sstring.NewSecureString(rawPassword)
	if err != nil {
		s.logger.Error("password securing error", slog.Any("err", err))
		return "", err
	}

	passwordHash, err := s.passwordProvider.GenerateHashFromPassword(password)
	if err != nil {
		s.logger.Error("hashing error", slog.Any("error", err))
		return "", err
	}

	return passwordHash, nil
}

// createFederatedIdentity creates a new federated identity record
func (s *registerServiceImpl) createFederatedIdentity(req *RegisterRequest, passwordHash string) (*dom_federatedidentity.FederatedIdentity, error) {
	federatedidentityID := primitive.NewObjectID()
	return &dom_federatedidentity.FederatedIdentity{
		ID:                            federatedidentityID,
		Email:                         req.Email,
		FirstName:                     req.FirstName,
		LastName:                      req.LastName,
		Name:                          fmt.Sprintf("%v %v", req.FirstName, req.LastName),
		LexicalName:                   fmt.Sprintf("%v, %v", req.LastName, req.FirstName),
		Phone:                         req.Phone,
		Country:                       req.Country,
		Region:                        "",
		City:                          "",
		PostalCode:                    "",
		AddressLine1:                  "",
		AddressLine2:                  "",
		Timezone:                      req.Timezone,
		AgreeTermsOfService:           req.AgreeToS,
		CreatedByFederatedIdentityID:  federatedidentityID,
		CreatedByName:                 fmt.Sprintf("%v %v", req.FirstName, req.LastName),
		CreatedAt:                     time.Now(),
		ModifiedByFederatedIdentityID: federatedidentityID,
		ModifiedByName:                fmt.Sprintf("%v %v", req.FirstName, req.LastName),
		ModifiedAt:                    time.Now(),
		Role:                          dom_federatedidentity.FederatedIdentityRoleCustomer,
		PasswordHash:                  passwordHash,
		PasswordHashAlgorithm:         s.passwordProvider.AlgorithmName(),
		WasEmailVerified:              false,
		EmailVerificationCode:         primitive.NewObjectID().Hex(),
		EmailVerificationExpiry:       time.Now().Add(72 * time.Hour),
		Status:                        domain.FederatedIdentityStatusActive,
		HasShippingAddress:            false,
		ShippingName:                  "",
		ShippingPhone:                 "",
		ShippingCountry:               "",
		ShippingRegion:                "",
		ShippingCity:                  "",
		ShippingPostalCode:            "",
		ShippingAddressLine1:          "",
		ShippingAddressLine2:          "",
		PaymentProcessorName:          "",
		PaymentProcessorCustomerID:    "",
	}, nil
}

// handleOAuthFlow manages the OAuth authorization process
func (s *registerServiceImpl) handleOAuthFlow(ctx context.Context, req *RegisterRequest, app *dom_app.Application, federatedIdentityID string, response *RegisterResponse) error {
	// Validate application scopes
	if len(app.Scopes) == 0 {
		return fmt.Errorf("application has no scopes defined")
	}

	// Create authorization code
	authCode, err := s.authorizeService.CreatePendingAuthorization(
		ctx,
		req.AppID,
		req.RedirectURI,
		req.State,
		app.Scopes[0], // Using first scope since we validated len(app.Scopes) > 0
	)
	if err != nil {
		return fmt.Errorf("failed to create authorization: %w", err)
	}

	// Update the authorization with the federated identity ID
	if err := s.authorizeService.UpdatePendingAuthorization(ctx, authCode, federatedIdentityID); err != nil {
		return fmt.Errorf("failed to update authorization: %w", err)
	}

	// Update response with OAuth details
	response.AuthCode = authCode
	response.RedirectURI = req.RedirectURI

	return nil
}
