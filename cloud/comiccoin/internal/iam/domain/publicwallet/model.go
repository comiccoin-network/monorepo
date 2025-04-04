// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet/model.go
package publicwallet

import (
	"time"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	PublicWalletStatusActive   = 1
	PublicWalletStatusArchived = 2
	PublicWalletStatusLocked   = 3
)

type PublicWallet struct {
	// The public address of the account.
	Address *common.Address `bson:"address" json:"address"`

	// The unique identifier for this blockchain that we are managing the state for.
	ChainID uint16 `bson:"chain_id" json:"chain_id"`

	// The name of the public wallet's account.
	Name string `bson:"name" json:"name"`

	// The description of the public wallet's account.
	Description string `bson:"description" json:"description"`

	// The S3 key of the thumbnail image for the public wallet.
	ThumbnailS3Key string `bson:"thumbnail_s3_key" json:"thumbnail_s3_key,omitempty"`

	// The number of times this public wallet has been viewed.
	ViewCount uint64 `bson:"view_count" json:"view_count"`

	// The number of times this public wallet has been viewed.
	UniqueViewCount uint64 `bson:"unique_view_count" json:"unique_view_count"`

	// The unique IP addresses that have viewed this public wallet. (Do not show in API responses because of the `json:"-"`.)
	UniqueIPAddresses []string `bson:"unique_ip_addresses" json:"-"`

	ID                    primitive.ObjectID `bson:"_id" json:"id"`
	CreatedFromIPAddress  string             `bson:"created_from_ip_address" json:"created_from_ip_address"`
	CreatedByUserID       primitive.ObjectID `bson:"created_by_user_id" json:"created_by_user_id"`
	CreatedAt             time.Time          `bson:"created_at" json:"created_at,omitempty"`
	CreatedByName         string             `bson:"created_by_name" json:"created_by_name"`
	ModifiedFromIPAddress string             `bson:"modified_from_ip_address" json:"modified_from_ip_address"`
	ModifiedByUserID      primitive.ObjectID `bson:"modified_by_user_id" json:"modified_by_user_id"`
	ModifiedAt            time.Time          `bson:"modified_at" json:"modified_at,omitempty"`
	ModifiedByName        string             `bson:"modified_by_name" json:"modified_by_name"`

	// The status of the public wallet.
	Status int8 `bson:"status" json:"status"`
}

type PublicWalletFilter struct {
	CreatedByUserID primitive.ObjectID `bson:"created_by_user_id,omitempty" json:"created_by_user_id,omitempty"`
	CreatedAtStart  *time.Time         `json:"created_at_start,omitempty"`
	CreatedAtEnd    *time.Time         `json:"created_at_end,omitempty"`
	Value           *string            `bson:"value" json:"value"`
	Status          int8               `bson:"status" json:"status"`

	// Cursor-based pagination
	LastID        *primitive.ObjectID `json:"last_id,omitempty"`
	LastCreatedAt *time.Time          `json:"last_created_at,omitempty"`
	Limit         int64               `json:"limit"`
}

type PublicWalletFilterResult struct {
	PublicWallets []*PublicWallet    `json:"public_wallets"`
	HasMore       bool               `json:"has_more"`
	LastID        primitive.ObjectID `json:"last_id,omitempty"`
	LastCreatedAt time.Time          `json:"last_created_at,omitempty"`
}
