// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/api/verify.go
package api

import (
	"context"
	"fmt"
	"log"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/logger"
	common_oauth_config "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	r_profile "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/profile"
	svc_profile "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/profile"
	uc_profile "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/profile"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
)

func FetchProfileCmd() *cobra.Command {
	var accessToken, userID string

	var cmd = &cobra.Command{
		Use:   "fetch-profile",
		Short: "Fetch profile of user",
		Run: func(cmd *cobra.Command, args []string) {
			doRunFetchProfile(accessToken, userID)
		},
	}

	cmd.Flags().StringVarP(&accessToken, "access-token", "a", "", "Access token of the user profile")
	cmd.MarkFlagRequired("access-token")

	return cmd
}

func doRunFetchProfile(accessToken, userID string) {
	// Setup dependencies
	logger := logger.NewProvider()
	originalCfg := config.NewProviderUsingEnvironmentVariables()
	cfg := &common_oauth_config.Configuration{
		OAuth: common_oauth_config.OAuthConfig{
			ServerURL:                originalCfg.OAuth.ServerURL,
			ClientID:                 originalCfg.OAuth.ClientID,
			ClientSecret:             originalCfg.OAuth.ClientSecret,
			ClientRedirectURI:        originalCfg.OAuth.ClientRedirectURI,
			ClientRegisterSuccessURI: originalCfg.OAuth.ClientRegisterSuccessURI,
			ClientRegisterCancelURI:  originalCfg.OAuth.ClientRegisterCancelURI,
			ClientAuthorizeOrLoginSuccessURI:    originalCfg.OAuth.ClientAuthorizeOrLoginSuccessURI,
			ClientAuthorizeOrLoginCancelURI:     originalCfg.OAuth.ClientAuthorizeOrLoginCancelURI,
		},
		DB: common_oauth_config.DBConfig{
			URI:  originalCfg.DB.URI,
			Name: originalCfg.DB.Name,
		},
	}
	logger.Debug("configuration ready")
	ctx := context.Background()

	// Initialize all repositories with debug logging
	profileRepo := r_profile.NewRepository(cfg, logger)
	logger.Debug("repository initialized")

	fetchProfileFromComicCoinGatewayUseCase := uc_profile.NewFetchProfileFromComicCoinGatewayUseCase(cfg, logger, profileRepo)
	fetchProfileFromComicCoinGatewayService := svc_profile.NewFetchProfileFromComicCoinGatewayService(cfg, logger, fetchProfileFromComicCoinGatewayUseCase)

	profile, err := fetchProfileFromComicCoinGatewayService.Execute(ctx, accessToken)
	if err != nil {
		log.Fatalf("Does not exist for err: %v", err)
	}
	if profile != nil {
		fmt.Printf("user_id: %v\n", profile.ID)
		fmt.Printf("email: %v\n", profile.Email)
		fmt.Printf("first_name: %v\n", profile.FirstName)
		fmt.Printf("last_name: %v\n", profile.LastName)
		fmt.Printf("name: %v\n", profile.Name)
		fmt.Printf("lexical_name: %v\n", profile.LexicalName)
		fmt.Printf("password_hash_algorithm: %v\n", profile.PasswordHashAlgorithm)
		fmt.Printf("password_hash: %v\n", profile.PasswordHash)
		fmt.Printf("role: %v\n", profile.Role)
		fmt.Printf("was_email_verified: %v\n", profile.WasEmailVerified)
		fmt.Printf("email_verification_code: %v\n", profile.EmailVerificationCode)
		fmt.Printf("email_verification_expiry: %v\n", profile.EmailVerificationExpiry)
		fmt.Printf("phone: %v\n", profile.Phone)
		fmt.Printf("country: %v\n", profile.Country)
		fmt.Printf("timezone: %v\n", profile.Timezone)
		fmt.Printf("region: %v\n", profile.Region)
		fmt.Printf("city: %v\n", profile.City)
		fmt.Printf("postal_code: %v\n", profile.PostalCode)
		fmt.Printf("address_line1: %v\n", profile.AddressLine1)
		fmt.Printf("address_line2: %v\n", profile.AddressLine2)
		fmt.Printf("has_shipping_address: %v\n", profile.HasShippingAddress)
		fmt.Printf("shipping_name: %v\n", profile.ShippingName)
		fmt.Printf("shipping_phone: %v\n", profile.ShippingPhone)
		fmt.Printf("shipping_country: %v\n", profile.ShippingCountry)
		fmt.Printf("shipping_region: %v\n", profile.ShippingRegion)
		fmt.Printf("shipping_city: %v\n", profile.ShippingCity)
		fmt.Printf("shipping_postal_code: %v\n", profile.ShippingPostalCode)
		fmt.Printf("shipping_address_line1: %v\n", profile.ShippingAddressLine1)
		fmt.Printf("shipping_address_line2: %v\n", profile.ShippingAddressLine2)
		fmt.Printf("how_did_you_hear_about_us: %v\n", profile.HowDidYouHearAboutUs)
		fmt.Printf("how_did_you_hear_about_us_other: %v\n", profile.HowDidYouHearAboutUsOther)
		fmt.Printf("agree_terms_of_service: %v\n", profile.AgreeTermsOfService)
		fmt.Printf("agree_promotions: %v\n", profile.AgreePromotions)
		fmt.Printf("created_from_ip_address: %v\n", profile.CreatedFromIPAddress)
		fmt.Printf("created_by_user_id: %v\n", profile.CreatedByUserID)
		fmt.Printf("created_at: %v\n", profile.CreatedAt)
		fmt.Printf("created_by_name: %v\n", profile.CreatedByName)
		fmt.Printf("modified_from_ip_address: %v\n", profile.ModifiedFromIPAddress)
		fmt.Printf("modified_by_user_id: %v\n", profile.ModifiedByUserID)
		fmt.Printf("modified_at: %v\n", profile.ModifiedAt)
		fmt.Printf("modified_by_name: %v\n", profile.ModifiedByName)
		fmt.Printf("status: %v\n", profile.Status)
		fmt.Printf("payment_processor_name: %v\n", profile.PaymentProcessorName)
		fmt.Printf("payment_processor_customer_id: %v\n", profile.PaymentProcessorCustomerID)
		fmt.Printf("otp_enabled: %v\n", profile.OTPEnabled)
		fmt.Printf("otp_verified: %v\n", profile.OTPVerified)
		fmt.Printf("otp_validated: %v\n", profile.OTPValidated)
		fmt.Printf("otp_secret: %v\n", profile.OTPSecret)
		fmt.Printf("otp_auth_url: %v\n", profile.OTPAuthURL)
		fmt.Printf("otp_backup_code_hash: %v\n", profile.OTPBackupCodeHash)
		fmt.Printf("otp_backup_code_hash_algorithm: %v\n", profile.OTPBackupCodeHashAlgorithm)
		fmt.Printf("how_long_collecting_comic_books_for_grading: %v\n", profile.HowLongCollectingComicBooksForGrading)
		fmt.Printf("has_previously_submitted_comic_book_for_grading: %v\n", profile.HasPreviouslySubmittedComicBookForGrading)
		fmt.Printf("has_owned_graded_comic_books: %v\n", profile.HasOwnedGradedComicBooks)
		fmt.Printf("has_regular_comic_book_shop: %v\n", profile.HasRegularComicBookShop)
		fmt.Printf("has_previously_purchased_from_auction_site: %v\n", profile.HasPreviouslyPurchasedFromAuctionSite)
		fmt.Printf("has_previously_purchased_from_facebook_marketplace: %v\n", profile.HasPreviouslyPurchasedFromFacebookMarketplace)
		fmt.Printf("has_regularly_attended_comic_cons_or_collectible_shows: %v\n", profile.HasRegularlyAttendedComicConsOrCollectibleShows)
		fmt.Printf("wallet_address: %v\n", profile.WalletAddress)
		fmt.Printf("last_coins_deposit_at: %v\n", profile.LastCoinsDepositAt)
		fmt.Printf("profile_verification_status: %v\n", profile.ProfileVerificationStatus)
	}
}
