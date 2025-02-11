// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/ratelimit/isallowed.go
package ratelimit

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_ratelimit "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/ratelimiter"
)

type IsAllowedUseCase interface {
	Execute(ctx context.Context, ipAddress string) (bool, error)
}

type isAllowedUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_ratelimit.RateLimiter
}

func NewIsAllowedUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_ratelimit.RateLimiter,
) IsAllowedUseCase {
	return &isAllowedUseCaseImpl{config, logger, repo}
}

func (uc *isAllowedUseCaseImpl) Execute(ctx context.Context, ipAddress string) (bool, error) {
	// STEP 1: Validation
	e := make(map[string]string)
	if ipAddress == "" {
		e["ip_address"] = "IP address is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating IP address for allowance check",
			slog.Any("error", e))
		return false, httperror.NewForBadRequest(&e)
	}

	// STEP 2: Check if IP is allowed
	return uc.repo.IsAllowed(ctx, ipAddress)
}
