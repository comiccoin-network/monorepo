package faucet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	svc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/faucet"
)

type UpdateFaucetBalanceByAuthorityTask struct {
	config                                *config.Configuration
	logger                                *slog.Logger
	updateFaucetBalanceByAuthorityService svc_faucet.UpdateFaucetBalanceByAuthorityService
}

func NewUpdateFaucetBalanceByAuthorityTask(
	config *config.Configuration,
	logger *slog.Logger,
	updateFaucetBalanceByAuthorityService svc_faucet.UpdateFaucetBalanceByAuthorityService,
) *UpdateFaucetBalanceByAuthorityTask {
	return &UpdateFaucetBalanceByAuthorityTask{config, logger, updateFaucetBalanceByAuthorityService}
}

func (s *UpdateFaucetBalanceByAuthorityTask) Execute(ctx context.Context) error {
	return s.updateFaucetBalanceByAuthorityService.Execute(ctx)
}
