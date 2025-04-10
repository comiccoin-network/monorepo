// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/user/dto.go
package user

import (
	"time"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CreateUserRequestDTO represents the request data for creating a user
type CreateUserRequestDTO struct {
	Email                                          string `json:"email"`
	FirstName                                      string `json:"first_name"`
	LastName                                       string `json:"last_name"`
	Password                                       string `json:"password"`
	Role                                           int8   `json:"role"`
	Phone                                          string `json:"phone,omitempty"`
	Country                                        string `json:"country,omitempty"`
	Timezone                                       string `json:"timezone"`
	Region                                         string `json:"region,omitempty"`
	City                                           string `json:"city,omitempty"`
	PostalCode                                     string `json:"postal_code,omitempty"`
	AddressLine1                                   string `json:"address_line1,omitempty"`
	AddressLine2                                   string `json:"address_line2,omitempty"`
	WalletAddress                                  string `json:"wallet_address,omitempty"`
	IsEmailVerified                                bool   `json:"is_email_verified"`
	ProfileVerificationStatus                      int8   `json:"profile_verification_status,omitempty"`
	WebsiteURL                                     string `json:"website_url,omitempty"`
	Description                                    string `json:"description,omitempty"`
	ComicBookStoreName                             string `json:"comic_book_store_name,omitempty"`
	AgreeTermsOfService                            bool   `json:"agree_terms_of_service"`
	AgreePromotions                                bool   `json:"agree_promotions,omitempty"`
	AgreeToTrackingAcrossThirdPartyAppsAndServices bool   `json:"agree_to_tracking_across_third_party_apps_and_services,omitempty"`
}

// UpdateUserRequestDTO represents the request data for updating a user
type UpdateUserRequestDTO struct {
	Email                                          string `json:"email,omitempty"`
	FirstName                                      string `json:"first_name,omitempty"`
	LastName                                       string `json:"last_name,omitempty"`
	Password                                       string `json:"password,omitempty"` // Optional - only updated if provided
	Role                                           int8   `json:"role,omitempty"`
	Phone                                          string `json:"phone,omitempty"`
	Country                                        string `json:"country,omitempty"`
	Timezone                                       string `json:"timezone,omitempty"`
	Region                                         string `json:"region,omitempty"`
	City                                           string `json:"city,omitempty"`
	PostalCode                                     string `json:"postal_code,omitempty"`
	AddressLine1                                   string `json:"address_line1,omitempty"`
	AddressLine2                                   string `json:"address_line2,omitempty"`
	WalletAddress                                  string `json:"wallet_address,omitempty"`
	IsEmailVerified                                *bool  `json:"is_email_verified,omitempty"`
	ProfileVerificationStatus                      *int8  `json:"profile_verification_status,omitempty"`
	WebsiteURL                                     string `json:"website_url,omitempty"`
	Description                                    string `json:"description,omitempty"`
	ComicBookStoreName                             string `json:"comic_book_store_name,omitempty"`
	Status                                         *int8  `json:"status,omitempty"`
	AgreePromotions                                *bool  `json:"agree_promotions,omitempty"`
	AgreeToTrackingAcrossThirdPartyAppsAndServices *bool  `json:"agree_to_tracking_across_third_party_apps_and_services,omitempty"`
}

// UserResponseDTO represents the response data for user operations
type UserResponseDTO struct {
	ID                                             primitive.ObjectID `json:"id"`
	Email                                          string             `json:"email"`
	FirstName                                      string             `json:"first_name"`
	LastName                                       string             `json:"last_name"`
	Name                                           string             `json:"name"`
	LexicalName                                    string             `json:"lexical_name"`
	Role                                           int8               `json:"role"`
	Phone                                          string             `json:"phone,omitempty"`
	Country                                        string             `json:"country,omitempty"`
	Timezone                                       string             `json:"timezone"`
	Region                                         string             `json:"region,omitempty"`
	City                                           string             `json:"city,omitempty"`
	PostalCode                                     string             `json:"postal_code,omitempty"`
	AddressLine1                                   string             `json:"address_line1,omitempty"`
	AddressLine2                                   string             `json:"address_line2,omitempty"`
	WalletAddress                                  *common.Address    `json:"wallet_address,omitempty"`
	WasEmailVerified                               bool               `json:"was_email_verified"`
	ProfileVerificationStatus                      int8               `json:"profile_verification_status,omitempty"`
	WebsiteURL                                     string             `json:"website_url,omitempty"`
	Description                                    string             `json:"description,omitempty"`
	ComicBookStoreName                             string             `json:"comic_book_store_name,omitempty"`
	CreatedAt                                      time.Time          `json:"created_at"`
	ModifiedAt                                     time.Time          `json:"modified_at"`
	Status                                         int8               `json:"status"`
	ChainID                                        uint16             `json:"chain_id"`
	AgreeTermsOfService                            bool               `json:"agree_terms_of_service"`
	AgreePromotions                                bool               `json:"agree_promotions,omitempty"`
	AgreeToTrackingAcrossThirdPartyAppsAndServices bool               `json:"agree_to_tracking_across_third_party_apps_and_services,omitempty"`
}

// ListUsersRequestDTO represents the request data for listing users
type ListUsersRequestDTO struct {
	Page       int    `json:"page"`
	PageSize   int    `json:"page_size"`
	SearchTerm string `json:"search_term,omitempty"`
	Role       int8   `json:"role,omitempty"`
	Status     int8   `json:"status,omitempty"`
	SortBy     string `json:"sort_by,omitempty"`
	SortOrder  string `json:"sort_order,omitempty"`
}

// ListUsersResponseDTO represents the response data for listing users
type ListUsersResponseDTO struct {
	Users        []*UserResponseDTO `json:"users"`
	TotalCount   int64              `json:"total_count"`
	TotalPages   int                `json:"total_pages"`
	CurrentPage  int                `json:"current_page"`
	HasNextPage  bool               `json:"has_next_page"`
	HasPrevPage  bool               `json:"has_prev_page"`
	NextPage     int                `json:"next_page,omitempty"`
	PreviousPage int                `json:"previous_page,omitempty"`
}
