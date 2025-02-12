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
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/federatedidentity"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_register "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/register"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/federatedidentity"
)

type RegistrationService interface {
	ProcessRegistration(ctx context.Context, req *dom_registration.RegistrationRequest) (*dom_registration.RegistrationResponse, error)
}

type registrationServiceImpl struct {
	config                *config.Configuration
	logger                *slog.Logger
	registerUseCase       uc_register.RegisterUseCase
	exchangeUseCase       uc_oauth.ExchangeCodeUseCase
	federatedidentityCreateUseCase     uc_federatedidentity.FederatedIdentityCreateUseCase
	federatedidentityGetByEmailUseCase uc_federatedidentity.FederatedIdentityGetByEmailUseCase
	tokenUpsertUseCase    uc_token.TokenUpsertByFederatedIdentityIDUseCase
}

func NewRegistrationService(
	config *config.Configuration,
	logger *slog.Logger,
	registerUseCase uc_register.RegisterUseCase,
	exchangeUseCase uc_oauth.ExchangeCodeUseCase,
	federatedidentityCreateUseCase uc_federatedidentity.FederatedIdentityCreateUseCase,
	federatedidentityGetByEmailUseCase uc_federatedidentity.FederatedIdentityGetByEmailUseCase,
	tokenUpsertUseCase uc_token.TokenUpsertByFederatedIdentityIDUseCase,
) RegistrationService {
	return &registrationServiceImpl{
		config:                config,
		logger:                logger,
		registerUseCase:       registerUseCase,
		exchangeUseCase:       exchangeUseCase,
		federatedidentityCreateUseCase:     federatedidentityCreateUseCase,
		federatedidentityGetByEmailUseCase: federatedidentityGetByEmailUseCase,
		tokenUpsertUseCase:    tokenUpsertUseCase,
	}
}

func (s *registrationServiceImpl) ProcessRegistration(ctx context.Context, req *dom_registration.RegistrationRequest) (*dom_registration.RegistrationResponse, error) {
	// First, check if federatedidentity already exists
	existingFederatedIdentity, err := s.federatedidentityGetByEmailUseCase.Execute(ctx, req.Email)
	if err == nil && existingFederatedIdentity != nil {
		s.logger.Warn("federatedidentity already exists",
			slog.String("email", req.Email))
		return nil, err
	}

	// Register the federatedidentity with OAuth server
	registrationResp, err := s.registerUseCase.Execute(ctx, req)
	if err != nil {
		s.logger.Error("failed to register federatedidentity with OAuth server",
			slog.String("email", req.Email),
			slog.Any("error", err))
		return nil, err
	}

	if registrationResp == nil {
		err := errors.New("nil registration response returned from OAuth server")
		s.logger.Error("failed to register federatedidentity with OAuth server",
			slog.String("email", req.Email),
			slog.Any("error", err))
		return nil, err
	}

	// Important: We want the same ID distributed across all our web-services
	// so must enforce getting non-zero values need to be thrown out.
	if registrationResp.FederatedIdentityID.IsZero() {
		err := errors.New("registration response returned `federatedidentity_id` with zero value")
		s.logger.Error("failed to register federatedidentity with OAuth server",
			slog.String("email", req.Email),
			slog.Any("error", err))
		return nil, err
	}
	s.logger.Debug("received new federatedidentity_id from OAuth server",
		slog.Any("federatedidentity_id", registrationResp.FederatedIdentityID))

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

		// Create the federatedidentity in our database
		federatedidentity := &dom_federatedidentity.FederatedIdentity{
			ID:                  registrationResp.FederatedIdentityID, // Important: We want the same ID distributed across all our web-services!
			Email:               req.Email,
			FirstName:           req.FirstName,
			LastName:            req.LastName,
			Name:                req.FirstName + " " + req.LastName,
			LexicalName:         req.LastName + ", " + req.FirstName,
			Phone:               req.Phone,
			Country:             req.Country,
			Timezone:            req.Timezone,
			Status:              dom_federatedidentity.FederatedIdentityStatusActive,
			Role:                dom_federatedidentity.FederatedIdentityRoleCustomer,
			CreatedAt:           time.Now(),
			ModifiedAt:          time.Now(),
			AgreeTermsOfService: req.AgreeTOS,
		}

		err = s.federatedidentityCreateUseCase.Execute(ctx, federatedidentity)
		if err != nil {
			s.logger.Error("failed to create federatedidentity in database",
				slog.String("email", req.Email),
				slog.Any("error", err))
			return nil, err
		}

		s.logger.Debug("successfully stored new federatedidentity",
			slog.Any("federatedidentity_id", federatedidentity.ID))

		// Store the tokens
		token := &dom_token.Token{
			ID:           primitive.NewObjectID(),
			FederatedIdentityID:       federatedidentity.ID,
			AccessToken:  tokenResp.AccessToken,
			RefreshToken: tokenResp.RefreshToken,
			ExpiresAt:    tokenResp.ExpiresAt,
		}

		s.logger.Info("storing new access and refresh token",
			slog.String("token_id", token.ID.Hex()[:5]+"..."),
			slog.String("federatedidentity_id", token.FederatedIdentityID.Hex()),
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

	s.logger.Info("federatedidentity registration completed successfully",
		slog.String("email", req.Email),
		slog.String("auth_flow", req.AuthFlow))

	return registrationResp, nil
}
