// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/user/service.go
package me

import (
	"errors"
	"fmt"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	uc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/faucet"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

type MeResponseDTO struct {
	FederateIdentityID primitive.ObjectID `bson:"federatedidentity_id" json:"federatedidentity_id"`
	ID                 primitive.ObjectID `bson:"_id" json:"id"`
	Email              string             `bson:"email" json:"email"`
	FirstName          string             `bson:"first_name" json:"first_name"`
	LastName           string             `bson:"last_name" json:"last_name"`
	Name               string             `bson:"name" json:"name"`
	LexicalName        string             `bson:"lexical_name" json:"lexical_name"`
	// Role                    int8               `bson:"role" json:"role"`
	// WasEmailVerified        bool               `bson:"was_email_verified" json:"was_email_verified,omitempty"`
	// EmailVerificationCode   string             `bson:"email_verification_code,omitempty" json:"email_verification_code,omitempty"`
	// EmailVerificationExpiry time.Time          `bson:"email_verification_expiry,omitempty" json:"email_verification_expiry,omitempty"`
	Phone    string `bson:"phone" json:"phone,omitempty"`
	Country  string `bson:"country" json:"country,omitempty"`
	Timezone string `bson:"timezone" json:"timezone"`
	// Region                  string             `bson:"region" json:"region,omitempty"`
	// City                    string             `bson:"city" json:"city,omitempty"`
	// PostalCode                                      string             `bson:"postal_code" json:"postal_code,omitempty"`
	// AddressLine1                                    string             `bson:"address_line1" json:"address_line1,omitempty"`
	// AddressLine2                                    string             `bson:"address_line2" json:"address_line2,omitempty"`
	// HasShippingAddress                              bool               `bson:"has_shipping_address" json:"has_shipping_address,omitempty"`
	// ShippingName                                    string             `bson:"shipping_name" json:"shipping_name,omitempty"`
	// ShippingPhone                                   string             `bson:"shipping_phone" json:"shipping_phone,omitempty"`
	// ShippingCountry                                 string             `bson:"shipping_country" json:"shipping_country,omitempty"`
	// ShippingRegion                                  string             `bson:"shipping_region" json:"shipping_region,omitempty"`
	// ShippingCity                                    string             `bson:"shipping_city" json:"shipping_city,omitempty"`
	// ShippingPostalCode                              string             `bson:"shipping_postal_code" json:"shipping_postal_code,omitempty"`
	// ShippingAddressLine1                            string             `bson:"shipping_address_line1" json:"shipping_address_line1,omitempty"`
	// ShippingAddressLine2                            string             `bson:"shipping_address_line2" json:"shipping_address_line2,omitempty"`
	// HowDidYouHearAboutUs                            int8               `bson:"how_did_you_hear_about_us" json:"how_did_you_hear_about_us,omitempty"`
	// HowDidYouHearAboutUsOther                       string             `bson:"how_did_you_hear_about_us_other" json:"how_did_you_hear_about_us_other,omitempty"`
	// AgreeTermsOfService                             bool               `bson:"agree_terms_of_service" json:"agree_terms_of_service,omitempty"`
	// AgreePromotions                                 bool               `bson:"agree_promotions" json:"agree_promotions,omitempty"`
	// CreatedFromIPAddress                            string             `bson:"created_from_ip_address" json:"created_from_ip_address"`
	// CreatedByFederatedIdentityID                    primitive.ObjectID `bson:"created_by_federatedidentity_id" json:"created_by_federatedidentity_id"`
	// CreatedAt                                       time.Time          `bson:"created_at" json:"created_at,omitempty"`
	// CreatedByName                                   string             `bson:"created_by_name" json:"created_by_name"`
	// ModifiedFromIPAddress                           string             `bson:"modified_from_ip_address" json:"modified_from_ip_address"`
	// ModifiedByFederatedIdentityID                   primitive.ObjectID `bson:"modified_by_federatedidentity_id" json:"modified_by_federatedidentity_id"`
	// ModifiedAt                                      time.Time          `bson:"modified_at" json:"modified_at,omitempty"`
	// ModifiedByName                                  string             `bson:"modified_by_name" json:"modified_by_name"`
	// Status                                          int8               `bson:"status" json:"status"`
	// PaymentProcessorName                            string             `bson:"payment_processor_name" json:"payment_processor_name"`
	// PaymentProcessorCustomerID                      string             `bson:"payment_processor_customer_id" json:"payment_processor_customer_id"`
	// OTPEnabled                                      bool               `bson:"otp_enabled" json:"otp_enabled"`
	// OTPVerified                                     bool               `bson:"otp_verified" json:"otp_verified"`
	// OTPValidated                                    bool               `bson:"otp_validated" json:"otp_validated"`
	// OTPSecret                                       string             `bson:"otp_secret" json:"-"`
	// OTPAuthURL                                      string             `bson:"otp_auth_url" json:"-"`
	// OTPBackupCodeHash                               string             `bson:"otp_backup_code_hash" json:"-"`
	// OTPBackupCodeHashAlgorithm                      string             `bson:"otp_backup_code_hash_algorithm" json:"-"`
	// HowLongCollectingComicBooksForGrading           int8               `bson:"how_long_collecting_comic_books_for_grading" json:"how_long_collecting_comic_books_for_grading"`
	// HasPreviouslySubmittedComicBookForGrading       int8               `bson:"has_previously_submitted_comic_book_for_grading" json:"has_previously_submitted_comic_book_for_grading"`
	// HasOwnedGradedComicBooks                        int8               `bson:"has_owned_graded_comic_books" json:"has_owned_graded_comic_books"`
	// HasRegularComicBookShop                         int8               `bson:"has_regular_comic_book_shop" json:"has_regular_comic_book_shop"`
	// HasPreviouslyPurchasedFromAuctionSite           int8               `bson:"has_previously_purchased_from_auction_site" json:"has_previously_purchased_from_auction_site"`
	// HasPreviouslyPurchasedFromFacebookMarketplace   int8               `bson:"has_previously_purchased_from_facebook_marketplace" json:"has_previously_purchased_from_facebook_marketplace"`
	// HasRegularlyAttendedComicConsOrCollectibleShows int8               `bson:"has_regularly_attended_comic_cons_or_collectible_shows" json:"has_regularly_attended_comic_cons_or_collectible_shows"`
	WalletAddress *common.Address `bson:"wallet_address" json:"wallet_address"`
	// ProfileVerificationStatus                       int8               `bson:"profile_verification_status" json:"profile_verification_status,omitempty"`
}

type GetMeService interface {
	Execute(sessCtx mongo.SessionContext) (*MeResponseDTO, error)
}

type getMeServiceImpl struct {
	config                       *config.Configuration
	logger                       *slog.Logger
	userGetByIDUseCase           uc_user.UserGetByIDUseCase
	userCreateUseCase            uc_user.UserCreateUseCase
	userUpdateUseCase            uc_user.UserUpdateUseCase
	getFaucetByChainIDUseCase    uc_faucet.GetFaucetByChainIDUseCase
	faucetUpdateByChainIDUseCase uc_faucet.FaucetUpdateByChainIDUseCase
}

func NewGetMeService(
	config *config.Configuration,
	logger *slog.Logger,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
	userCreateUseCase uc_user.UserCreateUseCase,
	userUpdateUseCase uc_user.UserUpdateUseCase,
	getFaucetByChainIDUseCase uc_faucet.GetFaucetByChainIDUseCase,
	faucetUpdateByChainIDUseCase uc_faucet.FaucetUpdateByChainIDUseCase,
) GetMeService {
	return &getMeServiceImpl{
		config:                       config,
		logger:                       logger,
		userGetByIDUseCase:           userGetByIDUseCase,
		userCreateUseCase:            userCreateUseCase,
		userUpdateUseCase:            userUpdateUseCase,
		getFaucetByChainIDUseCase:    getFaucetByChainIDUseCase,
		faucetUpdateByChainIDUseCase: faucetUpdateByChainIDUseCase,
	}
}

func (svc *getMeServiceImpl) Execute(sessCtx mongo.SessionContext) (*MeResponseDTO, error) {
	//
	// Get required from context.
	//

	userID, ok := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	if !ok {
		svc.logger.Error("Failed getting local user id",
			slog.Any("error", "Not found in context: user_id"))
		return nil, errors.New("user id not found in context")
	}

	// Get the user account (aka "Me") and if it doesn't exist then we will
	// create it immediately here and now.
	user, err := svc.userGetByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		svc.logger.Error("Failed getting me", slog.Any("error", err))
		return nil, err
	}
	if user == nil {
		err := fmt.Errorf("User does not exist for federated identity id: %v", userID.Hex())
		svc.logger.Error("Failed getting me", slog.Any("error", err))
		return nil, err
	}

	return &MeResponseDTO{
		ID:            user.ID,
		Email:         user.Email,
		FirstName:     user.FirstName,
		LastName:      user.LastName,
		Name:          user.Name,
		LexicalName:   user.LexicalName,
		Phone:         user.Phone,
		Country:       user.Country,
		Timezone:      user.Timezone,
		WalletAddress: user.WalletAddress,
	}, nil
}
