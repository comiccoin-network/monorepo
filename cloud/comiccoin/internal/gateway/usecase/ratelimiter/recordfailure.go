// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/ratelimit/recordfailure.go
package ratelimit

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_ratelimit "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/ratelimiter"
)

type RecordFailureUseCase interface {
	Execute(ctx context.Context, ipAddress string) error
}

type recordFailureUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_ratelimit.RateLimiter
}

func NewRecordFailureUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom_ratelimit.RateLimiter,
) RecordFailureUseCase {
	return &recordFailureUseCaseImpl{config, logger, repo}
}

func (uc *recordFailureUseCaseImpl) Execute(ctx context.Context, ipAddress string) error {
	// STEP 1: Validation
	e := make(map[string]string)
	if ipAddress == "" {
		e["ip_address"] = "IP address is required"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating IP address for failure recording",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// STEP 2: Record the failure
	return uc.repo.RecordFailure(ctx, ipAddress)
}
