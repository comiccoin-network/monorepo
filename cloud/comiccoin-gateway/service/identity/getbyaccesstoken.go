// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/identity/get.go
package identity

import (
	"context"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/storage/database/mongodbcache"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config/constants"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/user"
	uc_ratelimit "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/ratelimiter"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/user"
)

type GetIdentityService interface {
	Execute(ctx context.Context, accessToken string) (*dom_user.User, error)
}

type getIdentityServiceImpl struct {
	cfg                  *config.Configuration
	logger               *slog.Logger
	cache                mongodbcache.Cacher
	tokenFindByIDUseCase uc_token.TokenFindByIDUseCase
	userGetByIDUseCase   uc_user.UserGetByIDUseCase
	isAllowedUseCase     uc_ratelimit.IsAllowedUseCase
	recordFailureUseCase uc_ratelimit.RecordFailureUseCase
	resetFailuresUseCase uc_ratelimit.ResetFailuresUseCase
}

func NewGetIdentityService(
	cfg *config.Configuration,
	logger *slog.Logger,
	cache mongodbcache.Cacher,
	tokenFindByIDUseCase uc_token.TokenFindByIDUseCase,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
	isAllowedUseCase uc_ratelimit.IsAllowedUseCase,
	recordFailureUseCase uc_ratelimit.RecordFailureUseCase,
	resetFailuresUseCase uc_ratelimit.ResetFailuresUseCase,
) GetIdentityService {
	return &getIdentityServiceImpl{
		cfg:                  cfg,
		logger:               logger,
		cache:                cache,
		tokenFindByIDUseCase: tokenFindByIDUseCase,
		userGetByIDUseCase:   userGetByIDUseCase,
		isAllowedUseCase:     isAllowedUseCase,
		recordFailureUseCase: recordFailureUseCase,
		resetFailuresUseCase: resetFailuresUseCase,
	}
}

func (s *getIdentityServiceImpl) Execute(ctx context.Context, accessToken string) (*dom_user.User, error) {
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

	s.logger.Debug("Fetching identity via access token...",
		slog.String("ip_address", ipAddress))

	// Find the token in our storage
	tokenInfo, err := s.tokenFindByIDUseCase.Execute(ctx, accessToken)
	if err != nil {
		s.logger.Error("failed to find token",
			slog.Any("error", err))
		return nil, nil
	}
	if tokenInfo == nil {
		s.logger.Warn("token not found")

		// Record the failed attempt
		if err := s.recordFailureUseCase.Execute(ctx, ipAddress); err != nil {
			s.logger.Error("failed to record authentication failure",
				slog.String("ip_address", ipAddress),
				slog.Any("error", err))
			// Continue despite error recording failure
		}

		return nil, httperror.NewForUnauthorizedWithSingleField("access_token", "incorrect")
	}

	// Check if the token is still valid
	isActive := !tokenInfo.IsRevoked && time.Now().Before(tokenInfo.ExpiresAt)
	if !isActive {
		s.logger.Info("token is not active",
			slog.Bool("revoked", tokenInfo.IsRevoked),
			slog.Time("expires_at", tokenInfo.ExpiresAt))

		// Record failure for expired/revoked token
		if err := s.recordFailureUseCase.Execute(ctx, ipAddress); err != nil {
			s.logger.Error("failed to record authentication failure",
				slog.String("ip_address", ipAddress),
				slog.Any("error", err))
		}

		return nil, nil
	}

	// Only try to fetch user info if we have a user ID
	if tokenInfo.UserID != "" && tokenInfo.UserID != "pending" {
		// Convert the user ID string to ObjectID
		userID, err := primitive.ObjectIDFromHex(tokenInfo.UserID)
		if err != nil {
			s.logger.Error("failed to parse user ID",
				slog.String("user_id", tokenInfo.UserID),
				slog.Any("error", err))
			return nil, nil
		}

		// Fetch user information
		user, err := s.userGetByIDUseCase.Execute(ctx, userID)
		if err != nil {
			s.logger.Error("failed to fetch user",
				slog.String("user_id", tokenInfo.UserID),
				slog.Any("error", err))
			return nil, nil
		}

		if user != nil {
			s.logger.Debug("found user",
				slog.String("user_id", user.ID.Hex()),
				slog.String("email", user.Email))

			// Reset failures on successful authentication
			if err := s.resetFailuresUseCase.Execute(ctx, ipAddress); err != nil {
				s.logger.Error("failed to reset authentication failures",
					slog.String("ip_address", ipAddress),
					slog.Any("error", err))
				// Continue despite error resetting failures
			}

			return user, nil
		} else {
			s.logger.Warn("user not found",
				slog.String("user_id", tokenInfo.UserID))

			// Record failure for non-existent user
			if err := s.recordFailureUseCase.Execute(ctx, ipAddress); err != nil {
				s.logger.Error("failed to record authentication failure",
					slog.String("ip_address", ipAddress),
					slog.Any("error", err))
			}
		}
	} else {
		s.logger.Info("token has no associated user ID or is pending",
			slog.String("user_id", tokenInfo.UserID))
	}

	return nil, nil
}
