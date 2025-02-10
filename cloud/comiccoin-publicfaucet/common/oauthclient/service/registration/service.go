// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/registration/service.go
package registration

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	dom_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/registration"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/token"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_register "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/register"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/user"
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
			ID:                  primitive.NewObjectID(),
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

		// Store the tokens
		token := &dom_token.Token{
			ID:           primitive.NewObjectID(),
			UserID:       user.ID,
			AccessToken:  tokenResp.AccessToken,
			RefreshToken: tokenResp.RefreshToken,
			ExpiresAt:    tokenResp.ExpiresAt,
		}

		err = s.tokenUpsertUseCase.Execute(ctx, token)
		if err != nil {
			s.logger.Error("failed to store tokens",
				slog.String("email", req.Email),
				slog.Any("error", err))
			return nil, err
		}
	}

	s.logger.Info("user registration completed successfully",
		slog.String("email", req.Email),
		slog.String("auth_flow", req.AuthFlow))

	return registrationResp, nil
}
