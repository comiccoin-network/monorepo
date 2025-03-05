// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/user/service.go
package me

import (
	"errors"
	"fmt"
	"log/slog"
	"strings"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
	"github.com/ethereum/go-ethereum/common"
)

type UpdateMeRequestDTO struct {
	ID            primitive.ObjectID `bson:"_id" json:"id"`
	Email         string             `bson:"email" json:"email"`
	FirstName     string             `bson:"first_name" json:"first_name"`
	LastName      string             `bson:"last_name" json:"last_name"`
	Phone         string             `bson:"phone" json:"phone,omitempty"`
	Country       string             `bson:"country" json:"country,omitempty"`
	Timezone      string             `bson:"timezone" json:"timezone"`
	WalletAddress string             `bson:"wallet_address" json:"wallet_address"`
}

type UpdateMeService interface {
	Execute(sessCtx mongo.SessionContext, req *UpdateMeRequestDTO) (*MeResponseDTO, error)
}

type updateMeServiceImpl struct {
	config                        *config.Configuration
	logger                        *slog.Logger
	userGetByWalletAddressUseCase uc_user.UserGetByWalletAddressUseCase
	userGetByIDUseCase            uc_user.UserGetByIDUseCase
	userUpdateUseCase             uc_user.UserUpdateUseCase
}

func NewUpdateMeService(
	config *config.Configuration,
	logger *slog.Logger,
	userGetByWalletAddressUseCase uc_user.UserGetByWalletAddressUseCase,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
	userUpdateUseCase uc_user.UserUpdateUseCase,
) UpdateMeService {
	return &updateMeServiceImpl{
		config:                        config,
		logger:                        logger,
		userGetByWalletAddressUseCase: userGetByWalletAddressUseCase,
		userGetByIDUseCase:            userGetByIDUseCase,
		userUpdateUseCase:             userUpdateUseCase,
	}
}

func (svc *updateMeServiceImpl) Execute(sessCtx mongo.SessionContext, req *UpdateMeRequestDTO) (*MeResponseDTO, error) {
	//
	// STEP 2: Validation
	//

	if req == nil {
		svc.logger.Warn("Failed validation with nothing received")
		return nil, httperror.NewForBadRequestWithSingleField("non_field_error", "Wallet address is required in submission")
	}

	// Sanitization
	req.WalletAddress = strings.TrimSpace(req.WalletAddress)

	e := make(map[string]string)
	if req.WalletAddress == "" {
		e["wallet_address"] = "Wallet address is required"
	} else {
		walletAddress := common.HexToAddress(strings.ToLower(req.WalletAddress))
		if walletAddress.Hex() == "0x0000000000000000000000000000000000000000" {
			e["wallet_address"] = "Wallet address cannot be burn address"
		}
	}
	if len(e) != 0 {
		svc.logger.Warn("Failed validation",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

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

	//
	// Check if the wallet address is already used by another user
	//

	// Convert into our format.
	walletAddress := common.HexToAddress(strings.ToLower(req.WalletAddress))

	// Lookup if another user already owns this wallet address.
	// Check if wallet is owned by another user
	existingUser, err := svc.userGetByWalletAddressUseCase.Execute(sessCtx, &walletAddress)
	if err != nil {
		svc.logger.Error("Failed checking wallet address existence", slog.Any("error", err))
		return nil, err
	}
	if existingUser != nil {
		svc.logger.Warn("Existing user found whom already owns this wallet address",
			slog.String("wallet_address", walletAddress.Hex()),
			slog.Any("current_user_id", user.ID),
			slog.Any("existing_user_id", existingUser.ID))

		// Check if the existing user is the same as the current user.
		if user.ID.String() != existingUser.ID.String() {
			svc.logger.Warn("Wallet address already in use by another user",
				slog.String("wallet_address", walletAddress.Hex()),
				slog.Any("existing_user_id", existingUser.ID))
			return nil, httperror.NewForBadRequestWithSingleField("message", "wallet address is already in use by another user")
		} else {
			svc.logger.Debug("User already owns this wallet address",
				slog.String("wallet_address", walletAddress.Hex()),
				slog.Any("user_id", user.ID))
		}
	} else {
		svc.logger.Debug("No existing user found whom already owns this wallet address",
			slog.String("wallet_address", walletAddress.Hex()),
			slog.Any("current_user_id", user.ID))
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
