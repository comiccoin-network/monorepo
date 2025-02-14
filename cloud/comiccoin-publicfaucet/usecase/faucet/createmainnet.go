// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/faucet/create.go
package faucet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config/constants"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/faucet"
)

type CreateIfFaucetDNEForMainNetBlockchainUseCase interface {
	Execute(ctx context.Context) error
}

type createIfFaucetDNEForMainNetBlockchainUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewCreateIfFaucetDNEForMainNetBlockchainUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) CreateIfFaucetDNEForMainNetBlockchainUseCase {
	return &createIfFaucetDNEForMainNetBlockchainUseCaseImpl{config, logger, repo}
}

func (uc *createIfFaucetDNEForMainNetBlockchainUseCaseImpl) Execute(ctx context.Context) error {
	uc.logger.Debug("Checking if MainNet Faucet exists...")
	mainnetFaucetExists, err := uc.repo.CheckIfExistsByChainID(ctx, constants.ChainIDMainNet)
	if err != nil {
		uc.logger.Error("Failed checking if chain id exists for mainnet",
			slog.Any("error", err))
		return err
	}

	if !mainnetFaucetExists {
		uc.logger.Debug("MainNet Faucet D.N.E. proceeding to create...")
		return uc.repo.CreateFaucetForMainNetBlockchain(ctx)
	}
	return nil
}
