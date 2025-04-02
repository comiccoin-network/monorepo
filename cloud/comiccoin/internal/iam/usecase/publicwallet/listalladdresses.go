// cloud/comiccoin/internal/iam/usecase/publicwallet/listalladdresses.go
package publicwallet

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	"github.com/ethereum/go-ethereum/common"
)

type PublicWalletListAllAddressesUseCase interface {
	Execute(ctx context.Context) ([]*common.Address, error)
}

type publicWalletListAllAddressesUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom.Repository
}

func NewPublicWalletListAllAddressesUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo dom.Repository,
) PublicWalletListAllAddressesUseCase {
	return &publicWalletListAllAddressesUseCaseImpl{config, logger, repo}
}

func (uc *publicWalletListAllAddressesUseCaseImpl) Execute(ctx context.Context) ([]*common.Address, error) {
	// List all addresses from database
	return uc.repo.ListAllAddresses(ctx)
}
