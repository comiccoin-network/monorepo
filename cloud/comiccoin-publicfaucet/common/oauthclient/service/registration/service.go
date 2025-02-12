// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/registration/service.go
package registration

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/registration"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/token"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/user"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_register "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/register"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/user"
)

type RegistrationService interface {
	ProcessRegistration(ctx context.Context, req *dom_registration.RegistrationRequest) (*dom_registration.RegistrationResponse, error)
}

type registrationServiceImpl struct {
	config                *config.Configuration
	logger                *slog.Logger
	registerUseCase       uc_register.RegisterUseCase
	exchangeUseCase       uc_oauth.ExchangeCodeUseCase
	userCreateUseCase     uc_user.UserCreateUseCase
	userGetByEmailUseCase uc_user.UserGetByEmailUseCase
	tokenUpsertUseCase    uc_token.TokenUpsertByUserIDUseCase
}

func NewRegistrationService(
	config *config.Configuration,
	logger *slog.Logger,
	registerUseCase uc_register.RegisterUseCase,
	exchangeUseCase uc_oauth.ExchangeCodeUseCase,
	userCreateUseCase uc_user.UserCreateUseCase,
	userGetByEmailUseCase uc_user.UserGetByEmailUseCase,
	tokenUpsertUseCase uc_token.TokenUpsertByUserIDUseCase,
) RegistrationService {
	return &registrationServiceImpl{
		config:                config,
		logger:                logger,
		registerUseCase:       registerUseCase,
		exchangeUseCase:       exchangeUseCase,
		userCreateUseCase:     userCreateUseCase,
		userGetByEmailUseCase: userGetByEmailUseCase,
		tokenUpsertUseCase:    tokenUpsertUseCase,
	}
}

func (s *registrationServiceImpl) ProcessRegistration(ctx context.Context, req *dom_registration.RegistrationRequest) (*dom_registration.RegistrationResponse, error) {
	// First, check if user already exists
	existingUser, err := s.userGetByEmailUseCase.Execute(ctx, req.Email)
	if err == nil && existingUser != nil {
		s.logger.Warn("user already exists",
			slog.String("email", req.Email))
		return nil, err
	}

	// Register the user with OAuth server
	registrationResp, err := s.registerUseCase.Execute(ctx, req)
	if err != nil {
		s.logger.Error("failed to register user with OAuth server",
			slog.String("email", req.Email),
			slog.Any("error", err))
		return nil, err
	}

	if registrationResp == nil {
		err := errors.New("nil registration response returned from OAuth server")
		s.logger.Error("failed to register user with OAuth server",
			slog.String("email", req.Email),
			slog.Any("error", err))
		return nil, err
	}

	// Important: We want the same ID distributed across all our web-services
	// so must enforce getting non-zero values need to be thrown out.
	if registrationResp.UserID.IsZero() {
		err := errors.New("registration response returned `user_id` with zero value")
		s.logger.Error("failed to register user with OAuth server",
			slog.String("email", req.Email),
			slog.Any("error", err))
		return nil, err
	}
	s.logger.Debug("received new user_id from OAuth server",
		slog.Any("user_id", registrationResp.UserID))

	// If auth flow is automatic, exchange the code for tokens
	if req.AuthFlow == "auto" {
		// Exchange the authorization code for tokens
		tokenResp, err := s.exchangeUseCase.Execute(ctx, registrationResp.AuthCode)
		if err != nil {
			s.logger.Error("failed to exchange authorization code",
				slog.String("email", req.Email),
				slog.Any("error", err))
			return nil, err
		}

		// Create the user in our database
		user := &dom_user.User{
			ID:                  registrationResp.UserID, // Important: We want the same ID distributed across all our web-services!
			Email:               req.Email,
			FirstName:           req.FirstName,
			LastName:            req.LastName,
			Name:                req.FirstName + " " + req.LastName,
			LexicalName:         req.LastName + ", " + req.FirstName,
			Phone:               req.Phone,
			Country:             req.Country,
			Timezone:            req.Timezone,
			Status:              dom_user.UserStatusActive,
			Role:                dom_user.UserRoleCustomer,
			CreatedAt:           time.Now(),
			ModifiedAt:          time.Now(),
			AgreeTermsOfService: req.AgreeTOS,
		}

		err = s.userCreateUseCase.Execute(ctx, user)
		if err != nil {
			s.logger.Error("failed to create user in database",
				slog.String("email", req.Email),
				slog.Any("error", err))
			return nil, err
		}

		s.logger.Debug("successfully stored new user",
			slog.Any("user_id", user.ID))

		// Store the tokens
		token := &dom_token.Token{
			ID:           primitive.NewObjectID(),
			UserID:       user.ID,
			AccessToken:  tokenResp.AccessToken,
			RefreshToken: tokenResp.RefreshToken,
			ExpiresAt:    tokenResp.ExpiresAt,
		}

		s.logger.Info("storing new access and refresh token",
			slog.String("token_id", token.ID.Hex()[:5]+"..."),
			slog.String("user_id", token.UserID.Hex()),
			slog.Time("expires_at", token.ExpiresAt))

		err = s.tokenUpsertUseCase.Execute(ctx, token)
		if err != nil {
			s.logger.Error("failed to store tokens",
				slog.String("email", req.Email),
				slog.Any("error", err))
			return nil, err
		}

		s.logger.Info("successfully stored access and refresh token",
			slog.String("token_id", token.ID.Hex()[:5]+"..."))

	}

	s.logger.Info("user registration completed successfully",
		slog.String("email", req.Email),
		slog.String("auth_flow", req.AuthFlow))

	return registrationResp, nil
}
