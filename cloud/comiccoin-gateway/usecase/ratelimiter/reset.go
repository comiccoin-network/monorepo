// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/ratelimit/reset.go
package ratelimit

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_ratelimit "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/ratelimiter"
)

type ResetFailuresUseCase interface {
	Execute(ctx context.Context, ipAddress string) error
}

type resetFailuresUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_ratelimit.RateLimiter
}

func NewResetFailuresUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_ratelimit.RateLimiter,
) ResetFailuresUseCase {
	return &resetFailuresUseCaseImpl{config, logger, repo}
}

func (uc *resetFailuresUseCaseImpl) Execute(ctx context.Context, ipAddress string) error {
	// STEP 1: Validation
	e := make(map[string]string)
	if ipAddress == "" {
		e["ip_address"] = "IP address is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating IP address for reset",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// STEP 2: Reset failures for the IP
	return uc.repo.Reset(ctx, ipAddress)
}
