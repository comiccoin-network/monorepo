// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/user/service.go
package me

import (
	"errors"
	"fmt"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

type UpdateMeRequestDTO struct {
	Email                                          string `bson:"email" json:"email"`
	FirstName                                      string `bson:"first_name" json:"first_name"`
	LastName                                       string `bson:"last_name" json:"last_name"`
	Phone                                          string `bson:"phone" json:"phone,omitempty"`
	Country                                        string `bson:"country" json:"country,omitempty"`
	Region                                         string `bson:"region" json:"region,omitempty"`
	Timezone                                       string `bson:"timezone" json:"timezone"`
	AgreePromotions                                bool   `bson:"agree_promotions" json:"agree_promotions,omitempty"`
	AgreeToTrackingAcrossThirdPartyAppsAndServices bool   `bson:"agree_to_tracking_across_third_party_apps_and_services" json:"agree_to_tracking_across_third_party_apps_and_services,omitempty"`
}

type UpdateMeService interface {
	Execute(sessCtx mongo.SessionContext, req *UpdateMeRequestDTO) (*MeResponseDTO, error)
}

type updateMeServiceImpl struct {
	config             *config.Configuration
	logger             *slog.Logger
	userGetByIDUseCase uc_user.UserGetByIDUseCase
	userUpdateUseCase  uc_user.UserUpdateUseCase
}

func NewUpdateMeService(
	config *config.Configuration,
	logger *slog.Logger,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
	userUpdateUseCase uc_user.UserUpdateUseCase,
) UpdateMeService {
	return &updateMeServiceImpl{
		config:             config,
		logger:             logger,
		userGetByIDUseCase: userGetByIDUseCase,
		userUpdateUseCase:  userUpdateUseCase,
	}
}

func (svc *updateMeServiceImpl) Execute(sessCtx mongo.SessionContext, req *UpdateMeRequestDTO) (*MeResponseDTO, error) {
	//
	// Get required from context.
	//

	userID, ok := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	if !ok {
		svc.logger.Error("Failed getting local user id",
			slog.Any("error", "Not found in context: user_id"))
		return nil, errors.New("user id not found in context")
	}

	//
	// STEP 2: Validation
	//

	if req == nil {
		svc.logger.Warn("Failed validation with nothing received")
		return nil, httperror.NewForBadRequestWithSingleField("non_field_error", "Request is required in submission")
	}

	// Sanitization

	e := make(map[string]string)
	if len(e) != 0 {
		svc.logger.Warn("Failed validation",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// Get related records.
	//

	// Get the user account (aka "Me") and if it doesn't exist then we will
	// create it immediately here and now.
	user, err := svc.userGetByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		svc.logger.Error("Failed getting me", slog.Any("error", err))
		return nil, err
	}
	if user == nil {
		err := fmt.Errorf("User does not exist for id: %v", userID.Hex())
		svc.logger.Error("Failed getting me", slog.Any("error", err))
		return nil, err
	}

	//
	// Update local database.
	//

	user.Email = req.Email
	user.FirstName = req.FirstName
	user.LastName = req.LastName
	user.FirstName = fmt.Sprintf("%v %v", req.FirstName, req.LastName)
	user.LexicalName = fmt.Sprintf("%v, %v", req.LastName, req.FirstName)
	user.Phone = req.Phone
	user.Country = req.Country
	user.Region = req.Region
	user.Timezone = req.Timezone
	user.AgreePromotions = req.AgreePromotions
	user.AgreeToTrackingAcrossThirdPartyAppsAndServices = req.AgreeToTrackingAcrossThirdPartyAppsAndServices

	if err := svc.userUpdateUseCase.Execute(sessCtx, user); err != nil {
		svc.logger.Debug("Failed updating user", slog.Any("error", err))
		return nil, err
	}

	svc.logger.Debug("User updated ",
		slog.Any("user_id", user.ID))

	return &MeResponseDTO{
		ID:              user.ID,
		Email:           user.Email,
		FirstName:       user.FirstName,
		LastName:        user.LastName,
		Name:            user.Name,
		LexicalName:     user.LexicalName,
		Phone:           user.Phone,
		Country:         user.Country,
		Timezone:        user.Timezone,
		AgreePromotions: user.AgreePromotions,
		AgreeToTrackingAcrossThirdPartyAppsAndServices: user.AgreeToTrackingAcrossThirdPartyAppsAndServices,
	}, nil
}
