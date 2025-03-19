// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/domain/user/interface.go
package user

import (
	"context"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Repository Interface for federatedidentity.
type Repository interface {
	Create(ctx context.Context, m *User) error
	GetByID(ctx context.Context, id primitive.ObjectID) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByVerificationCode(ctx context.Context, verificationCode string) (*User, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
	DeleteByEmail(ctx context.Context, email string) error
	CheckIfExistsByEmail(ctx context.Context, email string) (bool, error)
	GetByWalletAddress(ctx context.Context, walletAddress *common.Address) (*User, error)
	UpdateByID(ctx context.Context, m *User) error
	ListAll(ctx context.Context) ([]*User, error)
	// CountByFilter(ctx context.Context, filter *UserFilter) (uint64, error)
	// ListByFilter(ctx context.Context, filter *UserFilter) (*UserFilterResult, error)
	// // //TODO: Add more...
}
