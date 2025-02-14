// service/federatedidentity/update.go
package federatedidentity

import (
	"context"
	"errors"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/federatedidentity"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/federatedidentity"
	uc_ratelimit "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/ratelimiter"
)

type UpdateFederatedIdentityRequest struct {
	ID primitive.ObjectID `bson:"_id" json:"id"`
	// Email       string `json:"email"`
	// Password    string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone"`
	Country   string `json:"country"`
	Timezone  string `json:"timezone"`
}

type UpdateFederatedIdentityService interface {
	Execute(ctx context.Context, req *UpdateFederatedIdentityRequest) (*dom_federatedidentity.FederatedIdentity, error)
}

type updateFederatedIdentityServiceImpl struct {
	cfg                             *config.Configuration
	logger                          *slog.Logger
	passwordProvider                password.Provider
	federatedIdentityGetByIDUseCase uc_federatedidentity.FederatedIdentityGetByIDUseCase
	federatedIdentityUpdateUseCase  uc_federatedidentity.FederatedIdentityUpdateUseCase
	isAllowedUseCase                uc_ratelimit.IsAllowedUseCase
	recordFailureUseCase            uc_ratelimit.RecordFailureUseCase
	resetFailuresUseCase            uc_ratelimit.ResetFailuresUseCase
}

func NewUpdateFederatedIdentityService(
	cfg *config.Configuration,
	logger *slog.Logger,
	pp password.Provider,
	federatedIdentityGetByIDUseCase uc_federatedidentity.FederatedIdentityGetByIDUseCase,
	federatedIdentityUpdateUseCase uc_federatedidentity.FederatedIdentityUpdateUseCase,
	isAllowedUseCase uc_ratelimit.IsAllowedUseCase,
	recordFailureUseCase uc_ratelimit.RecordFailureUseCase,
	resetFailuresUseCase uc_ratelimit.ResetFailuresUseCase,
) UpdateFederatedIdentityService {
	return &updateFederatedIdentityServiceImpl{
		cfg:                             cfg,
		logger:                          logger,
		passwordProvider:                pp,
		federatedIdentityGetByIDUseCase: federatedIdentityGetByIDUseCase,
		federatedIdentityUpdateUseCase:  federatedIdentityUpdateUseCase,
		isAllowedUseCase:                isAllowedUseCase,
		recordFailureUseCase:            recordFailureUseCase,
		resetFailuresUseCase:            resetFailuresUseCase,
	}
}

func (s *updateFederatedIdentityServiceImpl) Execute(ctx context.Context, req *UpdateFederatedIdentityRequest) (*dom_federatedidentity.FederatedIdentity, error) {
	//
	// STEP 1: Extract from context and apply banning.
	//

	// Extract IP address from context
	ipAddress, _ := ctx.Value(constants.SessionIPAddress).(string)

	// First check if this IP is allowed to make authentication attempts
	allowed, err := s.isAllowedUseCase.Execute(ctx, ipAddress)
	if err != nil {
		s.logger.Error("failed to check rate limit status",
			slog.String("ip_address", ipAddress),
			slog.Any("error", err))
		// Continue processing despite error checking rate limit
	} else if !allowed {
		return nil, httperror.NewForBadRequest(&map[string]string{
			"error": "Authentication temporarily blocked due to too many failed attempts. Please try again later.",
		})
	}

	//
	// STEP 2: Fetch related records.
	//

	// Fetch federatedidentity information
	federatedidentity, err := s.federatedIdentityGetByIDUseCase.Execute(ctx, req.ID)
	if err != nil {
		s.logger.Error("failed to fetch federatedidentity",
			slog.Any("error", err))

		// Record the failed attempt
		if err := s.recordFailureUseCase.Execute(ctx, ipAddress); err != nil {
			s.logger.Error("failed to record authentication failure",
				slog.String("ip_address", ipAddress),
				slog.Any("error", err))
			// Continue despite error recording failure
		}
		return nil, err
	}
	if federatedidentity == nil {
		err := errors.New("Federated identity not found")
		s.logger.Error("failed to fetch federatedidentity",
			slog.Any("error", err))

		// Record the failed attempt
		if err := s.recordFailureUseCase.Execute(ctx, ipAddress); err != nil {
			s.logger.Error("failed to record authentication failure",
				slog.String("ip_address", ipAddress),
				slog.Any("error", err))
			// Continue despite error recording failure
		}
		return nil, err
	}

	//
	// STEP 3: Update database record.
	//

	if err := s.federatedIdentityUpdateUseCase.Execute(ctx, federatedidentity); err != nil {
		s.logger.Error("failed to update federated identity",
			slog.String("ip_address", ipAddress),
			slog.Any("error", err))
		// Record the failed attempt
		if err := s.recordFailureUseCase.Execute(ctx, ipAddress); err != nil {
			s.logger.Error("failed to record authentication failure",
				slog.String("ip_address", ipAddress),
				slog.Any("error", err))
			// Continue despite error recording failure
		}

		return nil, err
	}

	//
	// STEP 4: Reset ban handler.
	//

	// Reset failures on successful execution
	if err := s.resetFailuresUseCase.Execute(ctx, ipAddress); err != nil {
		s.logger.Error("failed to reset authentication failures",
			slog.String("ip_address", ipAddress),
			slog.Any("error", err))
		// Continue despite error resetting failures
	}

	return federatedidentity, nil
}
