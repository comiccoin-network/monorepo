// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/me/verifyprofile.go
package me

import (
	"errors"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	domain "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

type VerifyProfileRequestDTO struct {
	// Common fields
	Country                   string `json:"country,omitempty"`
	Region                    string `json:"region,omitempty"`
	City                      string `json:"city,omitempty"`
	PostalCode                string `json:"postal_code,omitempty"`
	AddressLine1              string `json:"address_line1,omitempty"`
	AddressLine2              string `json:"address_line2,omitempty"`
	HasShippingAddress        bool   `json:"has_shipping_address,omitempty"`
	ShippingName              string `json:"shipping_name,omitempty"`
	ShippingPhone             string `json:"shipping_phone,omitempty"`
	ShippingCountry           string `json:"shipping_country,omitempty"`
	ShippingRegion            string `json:"shipping_region,omitempty"`
	ShippingCity              string `json:"shipping_city,omitempty"`
	ShippingPostalCode        string `json:"shipping_postal_code,omitempty"`
	ShippingAddressLine1      string `json:"shipping_address_line1,omitempty"`
	ShippingAddressLine2      string `json:"shipping_address_line2,omitempty"`
	HowDidYouHearAboutUs      int8   `json:"how_did_you_hear_about_us,omitempty"`
	HowDidYouHearAboutUsOther string `json:"how_did_you_hear_about_us_other,omitempty"`

	// Customer specific fields
	HowLongCollectingComicBooksForGrading           int8 `json:"how_long_collecting_comic_books_for_grading,omitempty"`
	HasPreviouslySubmittedComicBookForGrading       int8 `json:"has_previously_submitted_comic_book_for_grading,omitempty"`
	HasOwnedGradedComicBooks                        int8 `json:"has_owned_graded_comic_books,omitempty"`
	HasRegularComicBookShop                         int8 `json:"has_regular_comic_book_shop,omitempty"`
	HasPreviouslyPurchasedFromAuctionSite           int8 `json:"has_previously_purchased_from_auction_site,omitempty"`
	HasPreviouslyPurchasedFromFacebookMarketplace   int8 `json:"has_previously_purchased_from_facebook_marketplace,omitempty"`
	HasRegularlyAttendedComicConsOrCollectibleShows int8 `json:"has_regularly_attended_comic_cons_or_collectible_shows,omitempty"`

	// Retailer specific fields
	ComicBookStoreName           string `json:"comic_book_store_name,omitempty"`
	StoreLogo                    string `json:"store_logo,omitempty"`
	HowLongStoreOperating        int8   `json:"how_long_store_operating,omitempty"`
	GradingComicsExperience      string `json:"grading_comics_experience,omitempty"`
	RetailPartnershipReason      string `json:"retail_partnership_reason,omitempty"`
	CPSPartnershipReason         string `json:"cps_partnership_reason,omitempty"`
	WebsiteURL                   string `json:"website_url,omitempty"`
	EstimatedSubmissionsPerMonth int8   `json:"estimated_submissions_per_month,omitempty"`
	HasOtherGradingService       int8   `json:"has_other_grading_service,omitempty"`
	OtherGradingServiceName      string `json:"other_grading_service_name,omitempty"`
	RequestWelcomePackage        int8   `json:"request_welcome_package,omitempty"`
}

type VerifyProfileResponseDTO struct {
	Message  string `json:"message"`
	UserRole int8   `json:"user_role"`
	Status   int8   `json:"profile_verification_status"`
}

type VerifyProfileService interface {
	Execute(sessCtx mongo.SessionContext, req *VerifyProfileRequestDTO) (*VerifyProfileResponseDTO, error)
}

type verifyProfileServiceImpl struct {
	config             *config.Configuration
	logger             *slog.Logger
	userGetByIDUseCase uc_user.UserGetByIDUseCase
	userUpdateUseCase  uc_user.UserUpdateUseCase
}

func NewVerifyProfileService(
	config *config.Configuration,
	logger *slog.Logger,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
	userUpdateUseCase uc_user.UserUpdateUseCase,
) VerifyProfileService {
	return &verifyProfileServiceImpl{
		config:             config,
		logger:             logger,
		userGetByIDUseCase: userGetByIDUseCase,
		userUpdateUseCase:  userUpdateUseCase,
	}
}

func (s *verifyProfileServiceImpl) Execute(
	sessCtx mongo.SessionContext,
	req *VerifyProfileRequestDTO,
) (*VerifyProfileResponseDTO, error) {
	//
	// STEP 1: Get required from context.
	//
	userID, ok := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	if !ok {
		s.logger.Error("Failed getting local user id",
			slog.Any("error", "Not found in context: user_id"))
		return nil, errors.New("user id not found in context")
	}

	//
	// STEP 2: Retrieve user from database
	//
	user, err := s.userGetByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		s.logger.Error("Failed retrieving user", slog.Any("error", err))
		return nil, err
	}
	if user == nil {
		s.logger.Error("User not found", slog.Any("userID", userID))
		return nil, httperror.NewForBadRequestWithSingleField("non_field_error", "User not found")
	}

	//
	// STEP 3: Validate request based on user role
	//
	e := make(map[string]string)

	// Validate common fields
	if req.Country == "" {
		e["country"] = "Country is required"
	}
	if req.City == "" {
		e["city"] = "City is required"
	}
	if req.AddressLine1 == "" {
		e["address_line1"] = "Address is required"
	}
	if req.HowDidYouHearAboutUs == 0 {
		e["how_did_you_hear_about_us"] = "This field is required"
	}
	if req.HowDidYouHearAboutUs == 7 && req.HowDidYouHearAboutUsOther == "" { // Assuming 7 is "Other"
		e["how_did_you_hear_about_us_other"] = "Please specify how you heard about us"
	}

	// Validate shipping address if it's enabled
	if req.HasShippingAddress {
		if req.ShippingName == "" {
			e["shipping_name"] = "Shipping name is required"
		}
		if req.ShippingPhone == "" {
			e["shipping_phone"] = "Shipping phone is required"
		}
		if req.ShippingCountry == "" {
			e["shipping_country"] = "Shipping country is required"
		}
		if req.ShippingCity == "" {
			e["shipping_city"] = "Shipping city is required"
		}
		if req.ShippingAddressLine1 == "" {
			e["shipping_address_line1"] = "Shipping address is required"
		}
	}

	// Role-specific validation
	if user.Role == domain.UserRoleCustomer {
		// Validate customer-specific fields
		if req.HowLongCollectingComicBooksForGrading == 0 {
			e["how_long_collecting_comic_books_for_grading"] = "This field is required"
		}
		if req.HasPreviouslySubmittedComicBookForGrading == 0 {
			e["has_previously_submitted_comic_book_for_grading"] = "This field is required"
		}
		if req.HasOwnedGradedComicBooks == 0 {
			e["has_owned_graded_comic_books"] = "This field is required"
		}
		if req.HasRegularComicBookShop == 0 {
			e["has_regular_comic_book_shop"] = "This field is required"
		}
		if req.HasPreviouslyPurchasedFromAuctionSite == 0 {
			e["has_previously_purchased_from_auction_site"] = "This field is required"
		}
		if req.HasPreviouslyPurchasedFromFacebookMarketplace == 0 {
			e["has_previously_purchased_from_facebook_marketplace"] = "This field is required"
		}
		if req.HasRegularlyAttendedComicConsOrCollectibleShows == 0 {
			e["has_regularly_attended_comic_cons_or_collectible_shows"] = "This field is required"
		}
	} else if user.Role == domain.UserRoleRetailer {
		// Validate retailer-specific fields
		if req.ComicBookStoreName == "" {
			e["comic_book_store_name"] = "Store name is required"
		}
		if req.HowLongStoreOperating == 0 {
			e["how_long_store_operating"] = "This field is required"
		}
		if req.GradingComicsExperience == "" {
			e["grading_comics_experience"] = "This field is required"
		}
		if req.RetailPartnershipReason == "" {
			e["retail_partnership_reason"] = "This field is required"
		}
		if req.CPSPartnershipReason == "" {
			e["cps_partnership_reason"] = "This field is required"
		}
		if req.EstimatedSubmissionsPerMonth == 0 {
			e["estimated_submissions_per_month"] = "This field is required"
		}
		if req.HasOtherGradingService == 0 {
			e["has_other_grading_service"] = "This field is required"
		}
		if req.HasOtherGradingService == 1 && req.OtherGradingServiceName == "" {
			e["other_grading_service_name"] = "Please specify the grading service"
		}
		if req.RequestWelcomePackage == 0 {
			e["request_welcome_package"] = "This field is required"
		}
	}

	if len(e) != 0 {
		s.logger.Warn("Failed validation", slog.Any("errors", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 4: Update user profile based on role
	//

	// Update common fields
	user.Country = req.Country
	user.Region = req.Region
	user.City = req.City
	user.PostalCode = req.PostalCode
	user.AddressLine1 = req.AddressLine1
	user.AddressLine2 = req.AddressLine2
	user.HasShippingAddress = req.HasShippingAddress
	user.ShippingName = req.ShippingName
	user.ShippingPhone = req.ShippingPhone
	user.ShippingCountry = req.ShippingCountry
	user.ShippingRegion = req.ShippingRegion
	user.ShippingCity = req.ShippingCity
	user.ShippingPostalCode = req.ShippingPostalCode
	user.ShippingAddressLine1 = req.ShippingAddressLine1
	user.ShippingAddressLine2 = req.ShippingAddressLine2
	user.HowDidYouHearAboutUs = req.HowDidYouHearAboutUs
	user.HowDidYouHearAboutUsOther = req.HowDidYouHearAboutUsOther

	// Update role-specific fields
	if user.Role == domain.UserRoleCustomer {
		user.HowLongCollectingComicBooksForGrading = req.HowLongCollectingComicBooksForGrading
		user.HasPreviouslySubmittedComicBookForGrading = req.HasPreviouslySubmittedComicBookForGrading
		user.HasOwnedGradedComicBooks = req.HasOwnedGradedComicBooks
		user.HasRegularComicBookShop = req.HasRegularComicBookShop
		user.HasPreviouslyPurchasedFromAuctionSite = req.HasPreviouslyPurchasedFromAuctionSite
		user.HasPreviouslyPurchasedFromFacebookMarketplace = req.HasPreviouslyPurchasedFromFacebookMarketplace
		user.HasRegularlyAttendedComicConsOrCollectibleShows = req.HasRegularlyAttendedComicConsOrCollectibleShows
	} else if user.Role == domain.UserRoleRetailer {
		// Store logo would need to be handled separately with file upload
		// For retailer-specific fields, we could store some in user model
		// and others might need a separate retailer profile model
		s.logger.Info("Retailer profile details captured, additional handling might be needed for retailer-specific fields")
	}

	//
	// STEP 5: Update profile verification status and timestamps
	//
	user.ProfileVerificationStatus = domain.UserProfileVerificationStatusSubmittedForReview
	user.ModifiedAt = time.Now()
	user.ModifiedFromIPAddress, _ = sessCtx.Value(constants.SessionIPAddress).(string)

	//
	// STEP 6: Save updated user to database
	//
	if err := s.userUpdateUseCase.Execute(sessCtx, user); err != nil {
		s.logger.Error("Failed to update user", slog.Any("error", err))
		return nil, err
	}

	//
	// STEP 7: Generate appropriate response
	//
	var responseMessage string
	if user.Role == domain.UserRoleCustomer {
		responseMessage = "Your profile has been submitted for verification. You'll be notified once it's been reviewed."
	} else if user.Role == domain.UserRoleRetailer {
		responseMessage = "Your retailer profile has been submitted for verification. Our team will review your application and contact you soon."
	} else {
		responseMessage = "Your profile has been submitted for verification."
	}

	return &VerifyProfileResponseDTO{
		Message:  responseMessage,
		UserRole: user.Role,
		Status:   user.ProfileVerificationStatus,
	}, nil
}
