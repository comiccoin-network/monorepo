// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/domain/nameservice/interface.go
package nameservice

import (
	"context"
)

// Repository Interface for Faucet.
type Repository interface {
	Create(ctx context.Context, m *Faucet) error
	CreateFaucetForMainNetBlockchain(ctx context.Context) error
	GetByChainID(ctx context.Context, chainID uint16) (*Faucet, error)
	UpdateByChainID(ctx context.Context, f *Faucet) error
	CheckIfExistsByChainID(ctx context.Context, chainID uint16) (bool, error)
}
