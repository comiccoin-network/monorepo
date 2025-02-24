// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/user/service.go
package me

import (
	"errors"
	"fmt"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	common_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

type UpdateMeRequestDTO struct {
	FederateIdentityID primitive.ObjectID `bson:"federatedidentity_id" json:"federatedidentity_id"`
	ID                 primitive.ObjectID `bson:"_id" json:"id"`
	Email              string             `bson:"email" json:"email"`
	FirstName          string             `bson:"first_name" json:"first_name"`
	LastName           string             `bson:"last_name" json:"last_name"`
	Phone              string             `bson:"phone" json:"phone,omitempty"`
	Country            string             `bson:"country" json:"country,omitempty"`
	Timezone           string             `bson:"timezone" json:"timezone"`
	WalletAddress      string             `bson:"wallet_address" json:"wallet_address"`
}

type UpdateMeSyncService interface {
	Execute(sessCtx mongo.SessionContext, req *UpdateMeRequestDTO) (*MeResponseDTO, error)
}

type updateMeSyncServiceImpl struct {
	config                              *config.Configuration
	logger                              *slog.Logger
	oauthManager                        common_oauth.Manager
	userGetByFederatedIdentityIDUseCase uc_user.UserGetByFederatedIdentityIDUseCase
	userUpdateUseCase                   uc_user.UserUpdateUseCase
}

func NewUpdateMeSyncService(
	config *config.Configuration,
	logger *slog.Logger,
	oauth common_oauth.Manager,
	userGetByFederatedIdentityIDUseCase uc_user.UserGetByFederatedIdentityIDUseCase,
	userUpdateUseCase uc_user.UserUpdateUseCase,
) UpdateMeSyncService {
	return &updateMeSyncServiceImpl{
		config:                              config,
		logger:                              logger,
		oauthManager:                        oauth,
		userGetByFederatedIdentityIDUseCase: userGetByFederatedIdentityIDUseCase,
		userUpdateUseCase:                   userUpdateUseCase,
	}
}

func (svc *updateMeSyncServiceImpl) Execute(sessCtx mongo.SessionContext, req *UpdateMeRequestDTO) (*MeResponseDTO, error) {
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
		err := fmt.Errorf("User does not exist for federated identity id: %v", federatedidentityID.Hex())
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
	user.Timezone = req.Timezone

	if err := svc.userUpdateUseCase.Execute(sessCtx, user); err != nil {
		svc.logger.Debug("Failed updating user", slog.Any("error", err))
		return nil, err
	}

	svc.logger.Debug("User updated ",
		slog.Any("user_id", user.ID))

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
