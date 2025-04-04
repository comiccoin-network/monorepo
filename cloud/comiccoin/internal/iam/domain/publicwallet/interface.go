// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet/interface.go
package publicwallet

import (
	"context"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Repository Interface for Faucet.
type Repository interface {
	Create(ctx context.Context, m *PublicWallet) error
	GetByID(ctx context.Context, id primitive.ObjectID) (*PublicWallet, error)
	GetByAddress(ctx context.Context, address *common.Address) (*PublicWallet, error)
	UpdateByID(ctx context.Context, m *PublicWallet) error
	UpdateByAddress(ctx context.Context, m *PublicWallet) error
	CheckIfExistsByID(ctx context.Context, id primitive.ObjectID) (bool, error)
	CheckIfExistsByAddress(ctx context.Context, address *common.Address) (bool, error)
	CountByFilter(ctx context.Context, filter *PublicWalletFilter) (uint64, error)
	ListByFilter(ctx context.Context, filter *PublicWalletFilter) (*PublicWalletFilterResult, error)
	GetTotalViewCountByFilter(ctx context.Context, filter *PublicWalletFilter) (uint64, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
	DeleteByAddress(ctx context.Context, address *common.Address) error
	ListAllAddresses(ctx context.Context) ([]*common.Address, error)
}
