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

	PublicWalletTypeIndividual = 3 // Matches `UserRoleIndividual` in user/model.go
	PublicWalletTypeCompany    = 2 // Matches `UserRoleRetailer` in user/model.go
)

type PublicWallet struct {
	// The public address of the account.
	Address *common.Address `bson:"address" json:"address"`

	// ChainID is the specific blockchain that this public wallet belongs to.
	ChainID uint16 `bson:"chain_id" json:"chain_id"`

	// The name of the public wallet's account. Typically this would either be the name of individual or the name of the company.
	Name string `bson:"name" json:"name"`

	// The description of the public wallet's account. Typically this would either be the terse description of individual or the terse description of the company.
	Description string `bson:"description" json:"description"`

	// Website URL of the individualuser's website/blog/etc or user's company website.
	WebsiteURL string `bson:"website_url" json:"website_url"`

	// The following fields are taken from the user's profile.

	Phone        string `bson:"phone" json:"phone,omitempty"`
	Country      string `bson:"country" json:"country,omitempty"`
	Timezone     string `bson:"timezone" json:"timezone"`
	Region       string `bson:"region" json:"region,omitempty"`
	City         string `bson:"city" json:"city,omitempty"`
	PostalCode   string `bson:"postal_code" json:"postal_code,omitempty"`
	AddressLine1 string `bson:"address_line1" json:"address_line1,omitempty"`
	AddressLine2 string `bson:"address_line2" json:"address_line2,omitempty"`

	// Status indicates that the someone from the ComicCoin Authority verified this user profile.
	IsVerified bool `bson:"is_verified" json:"is_verified"`

	// VerifiedOn indicates the time when the user profile was verified by the ComicCoin Authority.
	VerifiedOn time.Time `bson:"verified_on" json:"verified_on"`

	Type int8 `bson:"type" json:"type"`

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
	Type            *int8              `bson:"type,omitempty" json:"type,omitempty"`
	IsVerified      *bool              `bson:"is_verified,omitempty" json:"is_verified,omitempty"`
	Location        *string            `json:"location,omitempty"`

	// Pagination fields
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
