// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/federatedidentity/interface.go
package domain

import (
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Repository Interface for federatedidentity.
type Repository interface {
	Create(ctx context.Context, m *FederatedIdentity) error
	GetByID(ctx context.Context, id primitive.ObjectID) (*FederatedIdentity, error)
	GetByEmail(ctx context.Context, email string) (*FederatedIdentity, error)
	GetByVerificationCode(ctx context.Context, verificationCode string) (*FederatedIdentity, error)
	DeleteByID(ctx context.Context, id primitive.ObjectID) error
	CheckIfExistsByEmail(ctx context.Context, email string) (bool, error)
	UpdateByID(ctx context.Context, m *FederatedIdentity) error
	// CountByFilter(ctx context.Context, filter *FederatedIdentityFilter) (uint64, error)
	// ListByFilter(ctx context.Context, filter *FederatedIdentityFilter) (*FederatedIdentityFilterResult, error)
	// // //TODO: Add more...
}
