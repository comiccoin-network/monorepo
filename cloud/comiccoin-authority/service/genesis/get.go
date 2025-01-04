package genesis

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	uc_genesisblockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/genesisblockdata"
)

type GetGenesisBlockDataService struct {
	config                     *config.Configuration
	logger                     *slog.Logger
	getGenesisBlockDataUseCase *uc_genesisblockdata.GetGenesisBlockDataUseCase
}

func NewGetGenesisBlockDataService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc *uc_genesisblockdata.GetGenesisBlockDataUseCase,
) *GetGenesisBlockDataService {
	return &GetGenesisBlockDataService{cfg, logger, uc}
}

func (s *GetGenesisBlockDataService) Execute(ctx context.Context, chainID uint16) (*domain.GenesisBlockData, error) {
	genesis, err := s.getGenesisBlockDataUseCase.Execute(ctx, chainID)
	if err != nil {
		s.logger.Error("Failed getting genesis block data", slog.Any("error", err))
		return nil, err
	}
	if genesis == nil {
		errStr := fmt.Sprintf("Genesis block data does not exist for chain ID: %v", chainID)
		s.logger.Error("Failed getting genesis block data", slog.Any("error", errStr))
		return nil, httperror.NewForNotFoundWithSingleField("chain_id", errStr)
	}
	return genesis, nil
}
