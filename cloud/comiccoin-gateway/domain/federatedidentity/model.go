// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/federatedidentity/model.go
package domain

import (
	"time"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	FederatedIdentityStatusActive                                = 1
	FederatedIdentityStatusLocked                                = 50
	FederatedIdentityStatusArchived                              = 100
	FederatedIdentityRoleRoot                                    = 1
	FederatedIdentityRoleRetailer                                = 2
	FederatedIdentityRoleCustomer                                = 3
	FederatedIdentityProfileVerificationStatusUnverified         = 1
	FederatedIdentityProfileVerificationStatusSubmittedForReview = 2
	FederatedIdentityProfileVerificationStatusApproved           = 3
	FederatedIdentityProfileVerificationStatusRejected           = 4
)

type FederatedIdentity struct {
	ID                            primitive.ObjectID          `bson:"_id" json:"id"`
	Email                         string                      `bson:"email" json:"email"`
	FirstName                     string                      `bson:"first_name" json:"first_name"`
	LastName                      string                      `bson:"last_name" json:"last_name"`
	Name                          string                      `bson:"name" json:"name"`
	LexicalName                   string                      `bson:"lexical_name" json:"lexical_name"`
	PasswordHashAlgorithm         string                      `bson:"password_hash_algorithm" json:"password_hash_algorithm,omitempty"`
	PasswordHash                  string                      `bson:"password_hash" json:"password_hash,omitempty"`
	Role                          int8                        `bson:"role" json:"role"`
	WasEmailVerified              bool                        `bson:"was_email_verified" json:"was_email_verified,omitempty"`
	EmailVerificationCode         string                      `bson:"email_verification_code,omitempty" json:"email_verification_code,omitempty"`
	EmailVerificationExpiry       time.Time                   `bson:"email_verification_expiry,omitempty" json:"email_verification_expiry,omitempty"`
	Phone                         string                      `bson:"phone" json:"phone,omitempty"`
	Country                       string                      `bson:"country" json:"country,omitempty"`
	Timezone                      string                      `bson:"timezone" json:"timezone"`
	Region                        string                      `bson:"region" json:"region,omitempty"`
	City                          string                      `bson:"city" json:"city,omitempty"`
	PostalCode                    string                      `bson:"postal_code" json:"postal_code,omitempty"`
	AddressLine1                  string                      `bson:"address_line1" json:"address_line1,omitempty"`
	AddressLine2                  string                      `bson:"address_line2" json:"address_line2,omitempty"`
	HasShippingAddress            bool                        `bson:"has_shipping_address" json:"has_shipping_address,omitempty"`
	ShippingName                  string                      `bson:"shipping_name" json:"shipping_name,omitempty"`
	ShippingPhone                 string                      `bson:"shipping_phone" json:"shipping_phone,omitempty"`
	ShippingCountry               string                      `bson:"shipping_country" json:"shipping_country,omitempty"`
	ShippingRegion                string                      `bson:"shipping_region" json:"shipping_region,omitempty"`
	ShippingCity                  string                      `bson:"shipping_city" json:"shipping_city,omitempty"`
	ShippingPostalCode            string                      `bson:"shipping_postal_code" json:"shipping_postal_code,omitempty"`
	ShippingAddressLine1          string                      `bson:"shipping_address_line1" json:"shipping_address_line1,omitempty"`
	ShippingAddressLine2          string                      `bson:"shipping_address_line2" json:"shipping_address_line2,omitempty"`
	HowDidYouHearAboutUs          int8                        `bson:"how_did_you_hear_about_us" json:"how_did_you_hear_about_us,omitempty"`
	HowDidYouHearAboutUsOther     string                      `bson:"how_did_you_hear_about_us_other" json:"how_did_you_hear_about_us_other,omitempty"`
	AgreeTermsOfService           bool                        `bson:"agree_terms_of_service" json:"agree_terms_of_service,omitempty"`
	AgreePromotions               bool                        `bson:"agree_promotions" json:"agree_promotions,omitempty"`
	CreatedFromIPAddress          string                      `bson:"created_from_ip_address" json:"created_from_ip_address"`
	CreatedByFederatedIdentityID  primitive.ObjectID          `bson:"created_by_federatedidentity_id" json:"created_by_federatedidentity_id"`
	CreatedAt                     time.Time                   `bson:"created_at" json:"created_at,omitempty"`
	CreatedByName                 string                      `bson:"created_by_name" json:"created_by_name"`
	ModifiedFromIPAddress         string                      `bson:"modified_from_ip_address" json:"modified_from_ip_address"`
	ModifiedByFederatedIdentityID primitive.ObjectID          `bson:"modified_by_federatedidentity_id" json:"modified_by_federatedidentity_id"`
	ModifiedAt                    time.Time                   `bson:"modified_at" json:"modified_at,omitempty"`
	ModifiedByName                string                      `bson:"modified_by_name" json:"modified_by_name"`
	Status                        int8                        `bson:"status" json:"status"`
	Comments                      []*FederatedIdentityComment `bson:"comments" json:"comments"`
	IsStarred                     bool                        `bson:"is_starred" json:"is_starred,omitempty"`
	// The name of the payment processor we are using to handle payments with
	// this particular member.
	PaymentProcessorName string `bson:"payment_processor_name" json:"payment_processor_name"`
	// The unique identifier used by the payment processor which has a somesort of
	// copy of this member's details saved and we can reference that customer on
	// the payment processor using this `customer_id`.
	PaymentProcessorCustomerID string `bson:"payment_processor_customer_id" json:"payment_processor_customer_id"`

	// OTPEnabled controls whether we force 2FA or not during login.
	OTPEnabled bool `bson:"otp_enabled" json:"otp_enabled"`

	// OTPVerified indicates federatedidentity has successfully validated their opt token afer enabling 2FA thus turning it on.
	OTPVerified bool `bson:"otp_verified" json:"otp_verified"`

	// OTPValidated automatically gets set as `false` on successful login and then sets `true` once successfully validated by 2FA.
	OTPValidated bool `bson:"otp_validated" json:"otp_validated"`

	// OTPSecret the unique one-time password secret to be shared between our
	// backend and 2FA authenticator sort of apps that support `TOPT`.
	OTPSecret string `bson:"otp_secret" json:"-"`

	// OTPAuthURL is the URL used to share.
	OTPAuthURL string `bson:"otp_auth_url" json:"-"`

	// OTPBackupCodeHash is the one-time use backup code which resets the 2FA settings and allow the federatedidentity to setup 2FA from scratch for the federatedidentity.
	OTPBackupCodeHash string `bson:"otp_backup_code_hash" json:"-"`

	// OTPBackupCodeHashAlgorithm tracks the hashing algorithm used.
	OTPBackupCodeHashAlgorithm string `bson:"otp_backup_code_hash_algorithm" json:"-"`

	HowLongCollectingComicBooksForGrading           int8 `bson:"how_long_collecting_comic_books_for_grading" json:"how_long_collecting_comic_books_for_grading"`
	HasPreviouslySubmittedComicBookForGrading       int8 `bson:"has_previously_submitted_comic_book_for_grading" json:"has_previously_submitted_comic_book_for_grading"`
	HasOwnedGradedComicBooks                        int8 `bson:"has_owned_graded_comic_books" json:"has_owned_graded_comic_books"`
	HasRegularComicBookShop                         int8 `bson:"has_regular_comic_book_shop" json:"has_regular_comic_book_shop"`
	HasPreviouslyPurchasedFromAuctionSite           int8 `bson:"has_previously_purchased_from_auction_site" json:"has_previously_purchased_from_auction_site"`
	HasPreviouslyPurchasedFromFacebookMarketplace   int8 `bson:"has_previously_purchased_from_facebook_marketplace" json:"has_previously_purchased_from_facebook_marketplace"`
	HasRegularlyAttendedComicConsOrCollectibleShows int8 `bson:"has_regularly_attended_comic_cons_or_collectible_shows" json:"has_regularly_attended_comic_cons_or_collectible_shows"`

	// WalletAddress variable holds the address of the federatedidentity's wallet
	// which is used by this gateway application to send.
	WalletAddress *common.Address `bson:"wallet_address" json:"wallet_address"`

	// LastCoinsDepositAt variable keeps track of when this gateway sent coins
	// to this federatedidentity's account.
	LastCoinsDepositAt time.Time `bson:"last_coins_deposit_at" json:"last_coins_deposit_at"`

	// ProfileVerificationStatus indicates the profile verification status of this federatedidentity account.
	ProfileVerificationStatus int8 `bson:"profile_verification_status" json:"profile_verification_status,omitempty"`
}

type FederatedIdentityComment struct {
	ID                            primitive.ObjectID `bson:"_id" json:"id"`
	CreatedAt                     time.Time          `bson:"created_at,omitempty" json:"created_at,omitempty"`
	CreatedByFederatedIdentityID  primitive.ObjectID `bson:"created_by_federatedidentity_id" json:"created_by_federatedidentity_id"`
	CreatedByName                 string             `bson:"created_by_name" json:"created_by_name"`
	ModifiedAt                    time.Time          `bson:"modified_at,omitempty" json:"modified_at,omitempty"`
	ModifiedByFederatedIdentityID primitive.ObjectID `bson:"modified_by_federatedidentity_id" json:"modified_by_federatedidentity_id"`
	ModifiedByName                string             `bson:"modified_by_name" json:"modified_by_name"`
	Content                       string             `bson:"content" json:"content"`
}

type FederatedIdentityAsSelectOption struct {
	Value primitive.ObjectID `bson:"_id" json:"value"` // Extract from the database `_id` field and output through API as `value`.
	Label string             `bson:"name" json:"label"`
}

type FederatedIdentityFilter struct {
	Name                      *string    `json:"name,omitempty"`
	Status                    int8       `json:"status,omitempty"`
	CreatedAtStart            *time.Time `json:"created_at_start,omitempty"`
	CreatedAtEnd              *time.Time `json:"created_at_end,omitempty"`
	ProfileVerificationStatus int8       `bson:"profile_verification_status" json:"profile_verification_status,omitempty"`

	// Cursor-based pagination
	LastID        *primitive.ObjectID `json:"last_id,omitempty"`
	LastCreatedAt *time.Time          `json:"last_created_at,omitempty"`
	Limit         int64               `json:"limit"`
}

type FederatedIdentityFilterResult struct {
	FederatedIdentitys []*FederatedIdentity `json:"federatedidentitys"`
	HasMore            bool                 `json:"has_more"`
	LastID             primitive.ObjectID   `json:"last_id,omitempty"`
	LastCreatedAt      time.Time            `json:"last_created_at,omitempty"`
}
