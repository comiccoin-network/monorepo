// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/identity/service/me/connectwallet.go
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
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/identity/usecase/user"
	"github.com/ethereum/go-ethereum/common"
)

type MeConnectWalletRequestDTO struct {
	WalletAddress string `bson:"wallet_address" json:"wallet_address"`
}

type MeConnectWalletService interface {
	Execute(sessCtx mongo.SessionContext, req *MeConnectWalletRequestDTO) (*MeResponseDTO, error)
}

type meConnectWalletServiceImpl struct {
	config                        *config.Configuration
	logger                        *slog.Logger
	userGetByIDUseCase            uc_user.UserGetByIDUseCase
	userUpdateUseCase             uc_user.UserUpdateUseCase
	userGetByWalletAddressUseCase uc_user.UserGetByWalletAddressUseCase
}

func NewMeConnectWalletService(
	config *config.Configuration,
	logger *slog.Logger,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
	userUpdateUseCase uc_user.UserUpdateUseCase,
	userGetByWalletAddressUseCase uc_user.UserGetByWalletAddressUseCase,
) MeConnectWalletService {
	return &meConnectWalletServiceImpl{
		config:                        config,
		logger:                        logger,
		userGetByIDUseCase:            userGetByIDUseCase,
		userUpdateUseCase:             userUpdateUseCase,
		userGetByWalletAddressUseCase: userGetByWalletAddressUseCase,
	}
}

func (s *meConnectWalletServiceImpl) Execute(sessCtx mongo.SessionContext, req *MeConnectWalletRequestDTO) (*MeResponseDTO, error) {
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
	// STEP 2: Validation
	//

	if req == nil {
		s.logger.Warn("Failed validation with nothing received")
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
		s.logger.Warn("Failed validation",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 3: Get related.
	//

	// Get the user account (aka "Me") and if it doesn't exist then we will
	// create it immediately here and now.
	user, err := s.userGetByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		s.logger.Error("Failed getting me", slog.Any("error", err))
		return nil, err
	}
	if user == nil {
		err := fmt.Errorf("User does not exist for id: %v", userID.Hex())
		s.logger.Error("Failed getting local user id", slog.Any("error", err))
		return nil, err
	}

	// Convert into our format.
	walletAddress := common.HexToAddress(strings.ToLower(req.WalletAddress))

	//
	// STEP 4: Check if the wallet address is already used by another user
	//

	// Lookup if another user already owns this wallet address.
	// Check if wallet is owned by another user
	existingUser, err := s.userGetByWalletAddressUseCase.Execute(sessCtx, &walletAddress)
	if err != nil {
		s.logger.Error("Failed checking wallet address existence", slog.Any("error", err))
		return nil, err
	}
	if existingUser != nil {
		s.logger.Warn("Existing user found whom already owns this wallet address",
			slog.String("wallet_address", walletAddress.Hex()),
			slog.Any("current_user_id", user.ID),
			slog.Any("existing_user_id", existingUser.ID))

		// Check if the existing user is the same as the current user.
		if user.ID.String() != existingUser.ID.String() {
			s.logger.Warn("Wallet address already in use by another user",
				slog.String("wallet_address", walletAddress.Hex()),
				slog.Any("existing_user_id", existingUser.ID))
			return nil, httperror.NewForBadRequestWithSingleField("message", "wallet address is already in use by another user")
		} else {
			s.logger.Debug("User already owns this wallet address",
				slog.String("wallet_address", walletAddress.Hex()),
				slog.Any("user_id", user.ID))
		}
	} else {
		s.logger.Debug("No existing user found whom already owns this wallet address",
			slog.String("wallet_address", walletAddress.Hex()),
			slog.Any("current_user_id", user.ID))
	}

	//
	// STEP 5: Update database.
	//

	user.WalletAddress = &walletAddress
	if err := s.userUpdateUseCase.Execute(sessCtx, user); err != nil {
		s.logger.Debug("Failed updating user", slog.Any("error", err))
		return nil, err
	}

	s.logger.Debug("Updated wallet address in database for user",
		slog.Any("user_id", userID.Hex()))

	//
	// STEP 6: Retur results
	//

	s.logger.Debug("Successfully updated",
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
