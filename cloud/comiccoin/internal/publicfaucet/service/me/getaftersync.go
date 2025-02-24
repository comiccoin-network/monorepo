// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/user/service.go
package me

import (
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	common_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/user"
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

type GetMeAfterRemoteSyncService interface {
	Execute(sessCtx mongo.SessionContext, shouldSyncNow bool) (*MeResponseDTO, error)
}

type getMeAfterRemoteSyncServiceImpl struct {
	config                              *config.Configuration
	logger                              *slog.Logger
	oauthManager                        common_oauth.Manager
	userGetByFederatedIdentityIDUseCase uc_user.UserGetByFederatedIdentityIDUseCase
	userCreateUseCase                   uc_user.UserCreateUseCase
	userUpdateUseCase                   uc_user.UserUpdateUseCase
	getFaucetByChainIDUseCase           uc_faucet.GetFaucetByChainIDUseCase
	faucetUpdateByChainIDUseCase        uc_faucet.FaucetUpdateByChainIDUseCase
}

func NewGetMeAfterRemoteSyncService(
	config *config.Configuration,
	logger *slog.Logger,
	oauth common_oauth.Manager,
	userGetByFederatedIdentityIDUseCase uc_user.UserGetByFederatedIdentityIDUseCase,
	userCreateUseCase uc_user.UserCreateUseCase,
	userUpdateUseCase uc_user.UserUpdateUseCase,
	getFaucetByChainIDUseCase uc_faucet.GetFaucetByChainIDUseCase,
	faucetUpdateByChainIDUseCase uc_faucet.FaucetUpdateByChainIDUseCase,
) GetMeAfterRemoteSyncService {
	return &getMeAfterRemoteSyncServiceImpl{
		config:                              config,
		logger:                              logger,
		oauthManager:                        oauth,
		userGetByFederatedIdentityIDUseCase: userGetByFederatedIdentityIDUseCase,
		userCreateUseCase:                   userCreateUseCase,
		userUpdateUseCase:                   userUpdateUseCase,
		getFaucetByChainIDUseCase:           getFaucetByChainIDUseCase,
		faucetUpdateByChainIDUseCase:        faucetUpdateByChainIDUseCase,
	}
}

func (svc *getMeAfterRemoteSyncServiceImpl) Execute(sessCtx mongo.SessionContext, shouldSyncNow bool) (*MeResponseDTO, error) {
	svc.logger.Debug("executing...")

	// Get authenticated federatedidentity ID from context. This is loaded in
	// by the `AuthMiddleware` found via:
	// - github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/middleware/auth.go
	federatedidentityID, ok := sessCtx.Value("federatedidentity_id").(primitive.ObjectID)
	if !ok {
		svc.logger.Error("Failed getting federatedidentity_id from local context",
			slog.Any("error", "Not found in context: federatedidentity_id"))
		return nil, errors.New("federatedidentity not found in context")
	}

	// Get the local saved federated identity details that were saved
	// after the successful oAuth 2.0.
	federatedidentity, err := svc.oauthManager.GetLocalFederatedIdentityByFederatedIdentityID(sessCtx, federatedidentityID)
	if err != nil {
		svc.logger.Error("Failed getting local federatedidentity id", slog.Any("error", err))
		return nil, err
	}
	if federatedidentity == nil {
		err := fmt.Errorf("FederatedIdentity does not exist for id: %v", federatedidentityID.Hex())
		svc.logger.Error("Failed getting local federatedidentity id", slog.Any("error", err))
		return nil, err
	}

	// Get the user account (aka "Me") and if it doesn't exist then we will
	// create it immediately here and now.
	user, err := svc.userGetByFederatedIdentityIDUseCase.Execute(sessCtx, federatedidentityID)
	if err != nil {
		svc.logger.Error("Failed getting me", slog.Any("error", err))
		return nil, err
	}
	if user == nil {
		userID := primitive.NewObjectID() // Note: We keep IDs and federated identity IDs different.
		user = &dom_user.User{
			FederateIdentityID:                    federatedidentityID, // Important to keep consistency across the distributed network.
			ID:                                    userID,
			Email:                                 federatedidentity.Email,
			FirstName:                             federatedidentity.FirstName,
			LastName:                              federatedidentity.LastName,
			Name:                                  federatedidentity.Name,
			LexicalName:                           federatedidentity.LexicalName,
			Role:                                  federatedidentity.Role,
			WasEmailVerified:                      federatedidentity.WasEmailVerified,
			EmailVerificationCode:                 federatedidentity.EmailVerificationCode,
			EmailVerificationExpiry:               federatedidentity.EmailVerificationExpiry,
			Phone:                                 federatedidentity.Phone,
			Country:                               federatedidentity.Country,
			Timezone:                              federatedidentity.Timezone,
			Region:                                federatedidentity.Region,
			City:                                  federatedidentity.City,
			PostalCode:                            federatedidentity.PostalCode,
			AddressLine1:                          federatedidentity.AddressLine1,
			AddressLine2:                          federatedidentity.AddressLine2,
			HasShippingAddress:                    federatedidentity.HasShippingAddress,
			ShippingName:                          federatedidentity.ShippingName,
			ShippingPhone:                         federatedidentity.ShippingPhone,
			ShippingCountry:                       federatedidentity.ShippingCountry,
			ShippingRegion:                        federatedidentity.ShippingRegion,
			ShippingCity:                          federatedidentity.ShippingCity,
			ShippingPostalCode:                    federatedidentity.ShippingPostalCode,
			ShippingAddressLine1:                  federatedidentity.ShippingAddressLine1,
			ShippingAddressLine2:                  federatedidentity.ShippingAddressLine2,
			HowDidYouHearAboutUs:                  federatedidentity.HowDidYouHearAboutUs,
			HowDidYouHearAboutUsOther:             federatedidentity.HowDidYouHearAboutUsOther,
			AgreeTermsOfService:                   federatedidentity.AgreeTermsOfService,
			AgreePromotions:                       federatedidentity.AgreePromotions,
			CreatedFromIPAddress:                  federatedidentity.CreatedFromIPAddress,
			CreatedByUserID:                       userID,
			CreatedAt:                             federatedidentity.CreatedAt,
			CreatedByName:                         federatedidentity.CreatedByName,
			ModifiedFromIPAddress:                 federatedidentity.ModifiedFromIPAddress,
			ModifiedByUserID:                      userID,
			ModifiedAt:                            federatedidentity.ModifiedAt,
			ModifiedByName:                        federatedidentity.ModifiedByName,
			Status:                                federatedidentity.Status,
			PaymentProcessorName:                  federatedidentity.PaymentProcessorName,
			PaymentProcessorCustomerID:            federatedidentity.PaymentProcessorCustomerID,
			OTPEnabled:                            federatedidentity.OTPEnabled,
			OTPVerified:                           federatedidentity.OTPVerified,
			OTPValidated:                          federatedidentity.OTPValidated,
			OTPSecret:                             federatedidentity.OTPSecret,
			OTPAuthURL:                            federatedidentity.OTPAuthURL,
			OTPBackupCodeHash:                     federatedidentity.OTPBackupCodeHash,
			OTPBackupCodeHashAlgorithm:            federatedidentity.OTPBackupCodeHashAlgorithm,
			HowLongCollectingComicBooksForGrading: federatedidentity.HowLongCollectingComicBooksForGrading,
			HasPreviouslySubmittedComicBookForGrading:       federatedidentity.HasPreviouslySubmittedComicBookForGrading,
			HasOwnedGradedComicBooks:                        federatedidentity.HasOwnedGradedComicBooks,
			HasRegularComicBookShop:                         federatedidentity.HasRegularComicBookShop,
			HasPreviouslyPurchasedFromAuctionSite:           federatedidentity.HasPreviouslyPurchasedFromAuctionSite,
			HasPreviouslyPurchasedFromFacebookMarketplace:   federatedidentity.HasPreviouslyPurchasedFromFacebookMarketplace,
			HasRegularlyAttendedComicConsOrCollectibleShows: federatedidentity.HasRegularlyAttendedComicConsOrCollectibleShows,
			WalletAddress:             federatedidentity.WalletAddress,
			ProfileVerificationStatus: federatedidentity.ProfileVerificationStatus,
		}
		if err := svc.userCreateUseCase.Execute(sessCtx, user); err != nil {
			svc.logger.Error("Failed creating me", slog.Any("error", err))
			return nil, err
		}

		svc.logger.Debug("Initial user created locally from federated identity",
			slog.Any("user_id", userID))

		//
		// DEVELOPERS Note: We need to keep a record of user count.
		//

		faucet, err := svc.getFaucetByChainIDUseCase.Execute(sessCtx, svc.config.Blockchain.ChainID)
		if err != nil {
			svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
			return nil, err
		}
		if faucet == nil {
			err := fmt.Errorf("faucet d.n.e. for chain ID: %v", svc.config.Blockchain.ChainID)
			svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
			return nil, err
		}

		faucet.LastModifiedAt = time.Date(
			faucet.LastModifiedAt.Year(),
			faucet.LastModifiedAt.Month(),
			faucet.LastModifiedAt.Day(),
			0, 0, 0, 0, time.UTC,
		)
		faucet.UsersCount += 1 // Add one to account for our new user.
		if err := svc.faucetUpdateByChainIDUseCase.Execute(sessCtx, faucet); err != nil {
			svc.logger.Error("Failed to save faucet",
				slog.Any("error", err))
			return nil, err
		}

	}

	// DEVELOPERS NOTE:
	// We want to add this code which will automatically refresh the profile
	// account if we haven't checked in the past 12 hours.

	if user.ModifiedAt.Add(12 * time.Hour).Before(time.Now()) {
		shouldSyncNow = true
		svc.logger.Debug("Forcing refresh of user with remote gateway to maintain close data integrity",
			slog.Any("user_id", user.ID))
	}

	// DEVELOPERS NOTE:
	// If user specified a forced sync or our data is stale then execute this.

	if shouldSyncNow {
		//
		// STEP 1
		//

		// Get access token from context. This is loaded in
		// by the `AuthMiddleware` found via:
		// - github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/middleware/auth.go
		accessToken, ok := sessCtx.Value("access_token").(string)
		if !ok {
			svc.logger.Error("Failed getting access_token from local context",
				slog.Any("error", "Not found in context: federatedidentity_id"))
			return nil, errors.New("access_token not found in context")
		}

		svc.logger.Debug("Beginning to fetch from remote gateway...",
			slog.Any("user_id", user.ID))

		remotefi, err := svc.oauthManager.FetchFederatedIdentityFromRemoteByAccessToken(sessCtx, accessToken)
		if err != nil {
			svc.logger.Debug("Failed fetching remote federated identity", slog.Any("error", err))
			return nil, err
		}
		if remotefi == nil {
			err := errors.New("nil returned for federated identity for the provided access token")
			svc.logger.Debug("Failed fetching remote federated identity", slog.Any("error", err))
			return nil, err
		}

		svc.logger.Debug("Successfully fetched from remote gateway",
			slog.Any("user_id", user.ID))

		//
		// STEP 2
		//

		user.Email = remotefi.Email
		user.Name = remotefi.Name
		user.LexicalName = remotefi.LexicalName
		user.Role = remotefi.Role
		user.WasEmailVerified = remotefi.WasEmailVerified
		user.EmailVerificationCode = remotefi.EmailVerificationCode
		user.EmailVerificationExpiry = remotefi.EmailVerificationExpiry
		user.Phone = remotefi.Phone
		user.Country = remotefi.Country
		user.Timezone = remotefi.Timezone
		user.Region = remotefi.Region
		user.City = remotefi.City
		user.PostalCode = remotefi.PostalCode
		user.AddressLine1 = remotefi.AddressLine1
		user.AddressLine2 = remotefi.AddressLine2
		user.HasShippingAddress = remotefi.HasShippingAddress
		user.ShippingName = remotefi.ShippingName
		user.ShippingPhone = remotefi.ShippingPhone
		user.ShippingCountry = remotefi.ShippingCountry
		user.ShippingRegion = remotefi.ShippingRegion
		user.ShippingCity = remotefi.ShippingCity
		user.ShippingPostalCode = remotefi.ShippingPostalCode
		user.ShippingAddressLine1 = remotefi.ShippingAddressLine1
		user.ShippingAddressLine2 = remotefi.ShippingAddressLine2
		user.HowDidYouHearAboutUs = remotefi.HowDidYouHearAboutUs
		user.HowDidYouHearAboutUsOther = remotefi.HowDidYouHearAboutUsOther
		user.AgreeTermsOfService = remotefi.AgreeTermsOfService
		user.AgreePromotions = remotefi.AgreePromotions
		user.CreatedFromIPAddress = remotefi.CreatedFromIPAddress
		// user.CreatedByUserID = remotefi.CreatedByUserID
		user.CreatedAt = remotefi.CreatedAt
		user.CreatedByName = remotefi.CreatedByName
		user.ModifiedFromIPAddress = remotefi.ModifiedFromIPAddress
		user.ModifiedByUserID = user.ID
		user.ModifiedAt = time.Now()
		user.ModifiedByName = user.Name
		user.Status = remotefi.Status
		user.PaymentProcessorName = remotefi.PaymentProcessorName
		user.PaymentProcessorCustomerID = remotefi.PaymentProcessorCustomerID
		user.OTPEnabled = remotefi.OTPEnabled
		user.OTPVerified = remotefi.OTPVerified
		user.OTPValidated = remotefi.OTPValidated
		user.OTPSecret = remotefi.OTPSecret
		user.OTPAuthURL = remotefi.OTPAuthURL
		user.OTPBackupCodeHash = remotefi.OTPBackupCodeHash
		user.OTPBackupCodeHashAlgorithm = remotefi.OTPBackupCodeHashAlgorithm
		user.HowLongCollectingComicBooksForGrading = remotefi.HowLongCollectingComicBooksForGrading
		user.HasPreviouslySubmittedComicBookForGrading = remotefi.HasPreviouslySubmittedComicBookForGrading
		user.HasOwnedGradedComicBooks = remotefi.HasOwnedGradedComicBooks
		user.HasRegularComicBookShop = remotefi.HasRegularComicBookShop
		user.HasPreviouslyPurchasedFromAuctionSite = remotefi.HasPreviouslyPurchasedFromAuctionSite
		user.HasPreviouslyPurchasedFromFacebookMarketplace = remotefi.HasPreviouslyPurchasedFromFacebookMarketplace
		user.HasRegularlyAttendedComicConsOrCollectibleShows = remotefi.HasRegularlyAttendedComicConsOrCollectibleShows
		user.WalletAddress = remotefi.WalletAddress
		user.ProfileVerificationStatus = remotefi.ProfileVerificationStatus

		if err := svc.userUpdateUseCase.Execute(sessCtx, user); err != nil {
			svc.logger.Debug("Failed updating user after sync with remote service", slog.Any("error", err))
			return nil, err
		}

		svc.logger.Debug("User updated from latest federated identity from the remote gateway",
			slog.Any("user_id", user.ID))
	}

	return &MeResponseDTO{
		FederateIdentityID: user.FederateIdentityID,
		ID:                 user.ID,
		Email:              user.Email,
		FirstName:          user.FirstName,
		LastName:           user.LastName,
		Name:               user.Name,
		LexicalName:        user.LexicalName,
		Phone:              user.Phone,
		Country:            user.Country,
		Timezone:           user.Timezone,
		WalletAddress:      user.WalletAddress,
	}, nil
}
