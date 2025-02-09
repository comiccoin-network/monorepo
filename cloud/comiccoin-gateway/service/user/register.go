// service/user/register.go
package user

import (
	"context"
	"fmt"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/password"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/application"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/user"
	svc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/oauth"
	uc_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/application"
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
	cfg                *config.Configuration
	logger             *slog.Logger
	passwordProvider   password.Provider
	userCreateUseCase  uc_user.UserCreateUseCase
	appFindByIDUseCase uc_app.ApplicationFindByAppIDUseCase
	authorizeService   svc_oauth.AuthorizeService
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

	// Create user as before...
	user := &dom_user.User{
		ID: primitive.NewObjectID(),
		// ... other fields ...
	}

	if err := s.userCreateUseCase.Execute(ctx, user); err != nil {
		return nil, err
	}

	response := &RegisterResponse{
		UserID: user.ID.Hex(),
	}

	// Handle OAuth flow if requested
	if req.AuthFlow != "none" {
		// Create authorization code
		authCode, err := s.authorizeService.CreatePendingAuthorization(
			ctx,
			req.AppID,
			req.RedirectURI,
			"",            // state
			app.Scopes[0], // use first available scope
		)
		if err != nil {
			s.logger.Error("failed to create authorization",
				slog.Any("error", err))
			return response, nil
		}

		response.AuthCode = authCode
		response.RedirectURI = req.RedirectURI
	}

	return response, nil
}
