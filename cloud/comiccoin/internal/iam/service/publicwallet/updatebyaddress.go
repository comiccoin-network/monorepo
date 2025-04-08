// cloud/comiccoin/internal/iam/service/publicwallet/updatebyaddress.go
package publicwallet

import (
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

type UpdatePublicWalletRequestIDO struct {
	// The unique identifier for the public wallet.
	ID primitive.ObjectID `json:"id"`

	// The public address of the account.
	Address string `json:"address"`

	// The unique identifier for this blockchain that we are managing the state for.
	ChainID uint16 `json:"chain_id"`

	// The name of the public wallet's account.
	Name string `json:"name"`

	// The description of the public wallet's account.
	Description string `json:"description"`

	// The status of the public wallet.
	Status int8 `bson:"status" json:"status"`
}

type UpdatePublicWalletByAddressService interface {
	UpdateByAddress(sessCtx mongo.SessionContext, req *UpdatePublicWalletRequestIDO) error
}

type updatePublicWalletByAddressServiceImpl struct {
	config                             *config.Configuration
	logger                             *slog.Logger
	publicWalletGetByAddressUseCase    uc.PublicWalletGetByAddressUseCase
	publicWalletUpdateByAddressUseCase uc.PublicWalletUpdateByAddressUseCase
	userGetByIDUseCase                 uc_user.UserGetByIDUseCase
	userUpdateUseCase                  uc_user.UserUpdateUseCase
}

func NewUpdatePublicWalletByAddressService(
	config *config.Configuration,
	logger *slog.Logger,
	publicWalletGetByAddressUseCase uc.PublicWalletGetByAddressUseCase,
	publicWalletUpdateByAddressUseCase uc.PublicWalletUpdateByAddressUseCase,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
	userUpdateUseCase uc_user.UserUpdateUseCase,
) UpdatePublicWalletByAddressService {
	return &updatePublicWalletByAddressServiceImpl{
		config:                             config,
		logger:                             logger,
		publicWalletGetByAddressUseCase:    publicWalletGetByAddressUseCase,
		publicWalletUpdateByAddressUseCase: publicWalletUpdateByAddressUseCase,
		userGetByIDUseCase:                 userGetByIDUseCase,
		userUpdateUseCase:                  userUpdateUseCase,
	}
}

func (svc *updatePublicWalletByAddressServiceImpl) UpdateByAddress(sessCtx mongo.SessionContext, req *UpdatePublicWalletRequestIDO) error {
	//
	// Extract authenticated user information from context.
	//

	userID, ok := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	if !ok {
		svc.logger.Error("Failed getting local user id",
			slog.Any("error", "Not found in context: user_id"))
		return errors.New("user id not found in context")
	}
	userName, _ := sessCtx.Value(constants.SessionUserName).(string)
	userIPAddress := sessCtx.Value(constants.SessionIPAddress).(string)

	//
	// Santize and validate input fields.
	//

	// Defensive Code: For security purposes we need to remove all whitespaces from the email and lower the characters.
	req.Address = strings.ToLower(req.Address)
	req.Address = strings.ReplaceAll(req.Address, " ", "")

	//
	// Santize and validate input fields.
	//

	// Defensive Code: For security purposes we need to remove all whitespaces from the email and lower the characters.
	req.Address = strings.ToLower(req.Address)
	req.Address = strings.ReplaceAll(req.Address, " ", "")

	e := make(map[string]string)
	if req.Name == "" {
		e["name"] = "Name is required"
	}
	if req.Description == "" {
		e["description"] = "Description is required"
	}
	if req.Address == "" {
		e["address"] = "Wallet address is required"
	} else {
		walletAddress := common.HexToAddress(strings.ToLower(req.Address))
		if walletAddress.Hex() == "0x0000000000000000000000000000000000000000" {
			e["wallet_address"] = "Wallet address cannot be burn address"
		}
	}
	if req.ChainID == 0 {
		e["chain_id"] = "Chain ID is required"
	} else {
		if req.ChainID != svc.config.Blockchain.ChainID {
			e["chain_id"] = "Chain ID must match the blockchain chain ID"
		}
	}
	if req.Status == 0 {
		e["status"] = "Status is required"
	} else {
		if req.Status != 1 && req.Status != 2 {
			e["status"] = "Status must be active or inactive"
		}
	}
	if len(e) != 0 {
		svc.logger.Warn("Failed validation",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// Convert into our format.
	walletAddress := common.HexToAddress(strings.ToLower(req.Address))

	//
	// Get from our database.
	//

	existingPublicWallet, err := svc.publicWalletGetByAddressUseCase.Execute(sessCtx, &walletAddress)
	if err != nil {
		e["wallet_address"] = fmt.Sprintf("Public wallet lookup generated error: %v", err)
		svc.logger.Warn("Failed validation",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}
	if existingPublicWallet == nil {
		e["wallet_address"] = "Wallet address was not registered"
		svc.logger.Warn("Failed validation",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}
	if existingPublicWallet.CreatedByUserID != userID {
		e["wallet_address"] = "Wallet address was already registered by another user"
		svc.logger.Warn("Failed validation",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	user, err := svc.userGetByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		svc.logger.Error("Failed retrieving user", slog.Any("error", err))
		return err
	}
	if user == nil {
		svc.logger.Error("User not found", slog.Any("userID", userID))
		return httperror.NewForBadRequestWithSingleField("non_field_error", "User not found")
	}

	//
	// Update our record.
	//

	existingPublicWallet.ModifiedFromIPAddress = userIPAddress
	existingPublicWallet.ModifiedAt = time.Now().UTC()
	existingPublicWallet.ModifiedByName = userName
	existingPublicWallet.ModifiedByUserID = userID
	existingPublicWallet.Name = req.Name
	existingPublicWallet.Description = req.Description
	existingPublicWallet.Status = req.Status
	existingPublicWallet.WebsiteURL = user.WebsiteURL
	existingPublicWallet.Phone = user.Phone
	existingPublicWallet.Country = user.Country
	existingPublicWallet.Region = user.Region
	existingPublicWallet.City = user.City
	existingPublicWallet.PostalCode = user.PostalCode
	existingPublicWallet.AddressLine1 = user.AddressLine1
	existingPublicWallet.AddressLine2 = user.AddressLine2

	if err := svc.publicWalletUpdateByAddressUseCase.Execute(sessCtx, existingPublicWallet); err != nil {
		svc.logger.Error("failed to update public wallet",
			slog.Any("error", err))
		return err
	}

	return nil
}
