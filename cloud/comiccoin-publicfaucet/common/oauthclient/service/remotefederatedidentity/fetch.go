// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/remotefederatedidentity/fetch.go
package remotefederatedidentity

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_fi "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/federatedidentity"
	dom_rfi "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/remotefederatedidentity"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/federatedidentity"
	uc_remotefederatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/remotefederatedidentity"
)

type FetchRemoteFederdatedIdentityService interface {
	Execute(ctx context.Context, accessToken string) (*dom_rfi.RemoteFederatedIdentityDTO, error)
}

type fetchRemoteFederdatedIdentityServiceImpl struct {
	config                               *config.Configuration
	logger                               *slog.Logger
	fetchRemoteFederdatedIdentityUseCase uc_remotefederatedidentity.FetchRemoteFederdatedIdentityUseCase
	federatedIdentityGetByIDUseCase      uc_federatedidentity.FederatedIdentityGetByIDUseCase
	federatedIdentityCreateUseCase       uc_federatedidentity.FederatedIdentityCreateUseCase
	federatedIdentityUpdateUseCase       uc_federatedidentity.FederatedIdentityUpdateUseCase
}

func NewFetchRemoteFederdatedIdentityService(
	config *config.Configuration,
	logger *slog.Logger,
	fetchRemoteFederdatedIdentityUseCase uc_remotefederatedidentity.FetchRemoteFederdatedIdentityUseCase,
	federatedIdentityGetByIDUseCase uc_federatedidentity.FederatedIdentityGetByIDUseCase,
	federatedIdentityCreateUseCase uc_federatedidentity.FederatedIdentityCreateUseCase,
	federatedIdentityUpdateUseCase uc_federatedidentity.FederatedIdentityUpdateUseCase,
) FetchRemoteFederdatedIdentityService {
	return &fetchRemoteFederdatedIdentityServiceImpl{
		config:                               config,
		logger:                               logger,
		fetchRemoteFederdatedIdentityUseCase: fetchRemoteFederdatedIdentityUseCase,
		federatedIdentityGetByIDUseCase:      federatedIdentityGetByIDUseCase,
		federatedIdentityCreateUseCase:       federatedIdentityCreateUseCase,
		federatedIdentityUpdateUseCase:       federatedIdentityUpdateUseCase,
	}
}

func (svc *fetchRemoteFederdatedIdentityServiceImpl) Execute(ctx context.Context, accessToken string) (*dom_rfi.RemoteFederatedIdentityDTO, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if accessToken == "" {
		e["access_token"] = "Access token is required"
	}
	if len(e) != 0 {
		svc.logger.Warn("Validation failed",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from remote.
	//

	rfi, err := svc.fetchRemoteFederdatedIdentityUseCase.Execute(ctx, accessToken)
	if err != nil {
		svc.logger.Error("failed fetching from remote gateway",
			slog.Any("error", err))
		return nil, err
	}

	//
	// STEP 3: Find local copy (if it exists.)
	//

	fi, err := svc.federatedIdentityGetByIDUseCase.Execute(ctx, rfi.ID)
	if err != nil {
		svc.logger.Error("failed fetching local copy from database",
			slog.Any("error", err))
		return nil, err
	}
	if fi == nil {
		// Create a new local copy.
		fi := &dom_fi.FederatedIdentity{
			ID:                                    rfi.ID,
			Email:                                 rfi.Email,
			FirstName:                             rfi.FirstName,
			LastName:                              rfi.LastName,
			Name:                                  rfi.Name,
			LexicalName:                           rfi.LexicalName,
			Role:                                  rfi.Role,
			WasEmailVerified:                      rfi.WasEmailVerified,
			EmailVerificationCode:                 rfi.EmailVerificationCode,
			EmailVerificationExpiry:               rfi.EmailVerificationExpiry,
			Phone:                                 rfi.Phone,
			Country:                               rfi.Country,
			Timezone:                              rfi.Timezone,
			Region:                                rfi.Region,
			City:                                  rfi.City,
			PostalCode:                            rfi.PostalCode,
			AddressLine1:                          rfi.AddressLine1,
			AddressLine2:                          rfi.AddressLine2,
			HasShippingAddress:                    rfi.HasShippingAddress,
			ShippingName:                          rfi.ShippingName,
			ShippingPhone:                         rfi.ShippingPhone,
			ShippingCountry:                       rfi.ShippingCountry,
			ShippingRegion:                        rfi.ShippingRegion,
			ShippingCity:                          rfi.ShippingCity,
			ShippingPostalCode:                    rfi.ShippingPostalCode,
			ShippingAddressLine1:                  rfi.ShippingAddressLine1,
			ShippingAddressLine2:                  rfi.ShippingAddressLine2,
			HowDidYouHearAboutUs:                  rfi.HowDidYouHearAboutUs,
			HowDidYouHearAboutUsOther:             rfi.HowDidYouHearAboutUsOther,
			AgreeTermsOfService:                   rfi.AgreeTermsOfService,
			AgreePromotions:                       rfi.AgreePromotions,
			CreatedFromIPAddress:                  rfi.CreatedFromIPAddress,
			CreatedByFederatedIdentityID:          rfi.CreatedByFederatedIdentityID,
			CreatedAt:                             rfi.CreatedAt,
			CreatedByName:                         rfi.CreatedByName,
			ModifiedFromIPAddress:                 rfi.ModifiedFromIPAddress,
			ModifiedByFederatedIdentityID:         rfi.ModifiedByFederatedIdentityID,
			ModifiedAt:                            rfi.ModifiedAt,
			ModifiedByName:                        rfi.ModifiedByName,
			Status:                                rfi.Status,
			PaymentProcessorName:                  rfi.PaymentProcessorName,
			PaymentProcessorCustomerID:            rfi.PaymentProcessorCustomerID,
			OTPEnabled:                            rfi.OTPEnabled,
			OTPVerified:                           rfi.OTPVerified,
			OTPValidated:                          rfi.OTPValidated,
			OTPSecret:                             rfi.OTPSecret,
			OTPAuthURL:                            rfi.OTPAuthURL,
			OTPBackupCodeHash:                     rfi.OTPBackupCodeHash,
			OTPBackupCodeHashAlgorithm:            rfi.OTPBackupCodeHashAlgorithm,
			HowLongCollectingComicBooksForGrading: rfi.HowLongCollectingComicBooksForGrading,
			HasPreviouslySubmittedComicBookForGrading:       rfi.HasPreviouslySubmittedComicBookForGrading,
			HasOwnedGradedComicBooks:                        rfi.HasOwnedGradedComicBooks,
			HasRegularComicBookShop:                         rfi.HasRegularComicBookShop,
			HasPreviouslyPurchasedFromAuctionSite:           rfi.HasPreviouslyPurchasedFromAuctionSite,
			HasPreviouslyPurchasedFromFacebookMarketplace:   rfi.HasPreviouslyPurchasedFromFacebookMarketplace,
			HasRegularlyAttendedComicConsOrCollectibleShows: rfi.HasRegularlyAttendedComicConsOrCollectibleShows,
			WalletAddress:             rfi.WalletAddress,
			LastCoinsDepositAt:        rfi.LastCoinsDepositAt,
			ProfileVerificationStatus: rfi.ProfileVerificationStatus,
		}

		if err := svc.federatedIdentityCreateUseCase.Execute(ctx, fi); err != nil {
			svc.logger.Error("failed creating local copy in database",
				slog.Any("error", err))
			return nil, err
		}
	} else {
		// Update the local copy.
		fi.Email = rfi.Email
		fi.FirstName = rfi.FirstName
		fi.LastName = rfi.LastName
		fi.Name = rfi.Name
		fi.LexicalName = rfi.LexicalName
		fi.WasEmailVerified = rfi.WasEmailVerified
		fi.EmailVerificationCode = rfi.EmailVerificationCode
		fi.EmailVerificationExpiry = rfi.EmailVerificationExpiry
		fi.Phone = rfi.Phone
		fi.Country = rfi.Country
		fi.Timezone = rfi.Timezone
		fi.Region = rfi.Region
		fi.City = rfi.City
		fi.PostalCode = rfi.PostalCode
		fi.AddressLine1 = rfi.AddressLine1
		fi.AddressLine2 = rfi.AddressLine2
		fi.HasShippingAddress = rfi.HasShippingAddress
		fi.ShippingName = rfi.ShippingName
		fi.ShippingPhone = rfi.ShippingPhone
		fi.ShippingCountry = rfi.ShippingCountry
		fi.ShippingRegion = rfi.ShippingRegion
		fi.ShippingCity = rfi.ShippingCity
		fi.ShippingPostalCode = rfi.ShippingPostalCode
		fi.ShippingAddressLine1 = rfi.ShippingAddressLine1
		fi.ShippingAddressLine2 = rfi.ShippingAddressLine2
		fi.HowDidYouHearAboutUs = rfi.HowDidYouHearAboutUs
		fi.HowDidYouHearAboutUsOther = rfi.HowDidYouHearAboutUsOther
		fi.AgreeTermsOfService = rfi.AgreeTermsOfService
		fi.AgreePromotions = rfi.AgreePromotions
		fi.CreatedFromIPAddress = rfi.CreatedFromIPAddress
		fi.CreatedByFederatedIdentityID = rfi.CreatedByFederatedIdentityID
		fi.CreatedAt = rfi.CreatedAt
		fi.CreatedByName = rfi.CreatedByName
		fi.ModifiedFromIPAddress = rfi.ModifiedFromIPAddress
		fi.ModifiedByFederatedIdentityID = rfi.ModifiedByFederatedIdentityID
		fi.ModifiedAt = rfi.ModifiedAt
		fi.ModifiedByName = rfi.ModifiedByName
		fi.Status = rfi.Status
		fi.PaymentProcessorName = rfi.PaymentProcessorName
		fi.PaymentProcessorCustomerID = rfi.PaymentProcessorCustomerID
		fi.OTPEnabled = rfi.OTPEnabled
		fi.OTPVerified = rfi.OTPVerified
		fi.OTPValidated = rfi.OTPValidated
		fi.OTPSecret = rfi.OTPSecret
		fi.OTPAuthURL = rfi.OTPAuthURL
		fi.OTPBackupCodeHash = rfi.OTPBackupCodeHash
		fi.OTPBackupCodeHashAlgorithm = rfi.OTPBackupCodeHashAlgorithm
		fi.HowLongCollectingComicBooksForGrading = rfi.HowLongCollectingComicBooksForGrading
		fi.HasPreviouslySubmittedComicBookForGrading = rfi.HasPreviouslySubmittedComicBookForGrading
		fi.HasOwnedGradedComicBooks = rfi.HasOwnedGradedComicBooks
		fi.HasRegularComicBookShop = rfi.HasRegularComicBookShop
		fi.HasPreviouslyPurchasedFromAuctionSite = rfi.HasPreviouslyPurchasedFromAuctionSite
		fi.HasPreviouslyPurchasedFromFacebookMarketplace = rfi.HasPreviouslyPurchasedFromFacebookMarketplace
		fi.HasRegularlyAttendedComicConsOrCollectibleShows = rfi.HasRegularlyAttendedComicConsOrCollectibleShows
		fi.WalletAddress = rfi.WalletAddress
		fi.LastCoinsDepositAt = rfi.LastCoinsDepositAt
		fi.ProfileVerificationStatus = rfi.ProfileVerificationStatus

		if err := svc.federatedIdentityUpdateUseCase.Execute(ctx, fi); err != nil {
			svc.logger.Error("failed updating local copy in database",
				slog.Any("error", err))
			return nil, err
		}

	}

	return rfi, nil
}
