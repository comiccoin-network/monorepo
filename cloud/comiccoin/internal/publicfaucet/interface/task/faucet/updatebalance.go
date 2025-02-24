package faucet

import (
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

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

func (s *UpdateFaucetBalanceByAuthorityTask) Execute(sessCtx mongo.SessionContext) error {
	return s.updateFaucetBalanceByAuthorityService.Execute(sessCtx)
}
