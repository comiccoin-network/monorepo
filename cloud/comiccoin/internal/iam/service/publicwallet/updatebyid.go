// cloud/comiccoin/internal/iam/service/publicwallet/updatebyid.go
package publicwallet

import (
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UpdatePublicWalletByIDService interface {
	UpdateByID(sessCtx mongo.SessionContext, req *UpdatePublicWalletRequestIDO) error
}

type updatePublicWalletByIDServiceImpl struct {
	config                        *config.Configuration
	logger                        *slog.Logger
	publicWalletGetByIDUseCase    uc.PublicWalletGetByIDUseCase
	publicWalletUpdateByIDUseCase uc.PublicWalletUpdateByIDUseCase
	userGetByIDUseCase            uc_user.UserGetByIDUseCase
	userUpdateUseCase             uc_user.UserUpdateUseCase
}

func NewUpdatePublicWalletByIDService(
	config *config.Configuration,
	logger *slog.Logger,
	publicWalletGetByIDUseCase uc.PublicWalletGetByIDUseCase,
	publicWalletUpdateByIDUseCase uc.PublicWalletUpdateByIDUseCase,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
	userUpdateUseCase uc_user.UserUpdateUseCase,
) UpdatePublicWalletByIDService {
	return &updatePublicWalletByIDServiceImpl{
		config:                        config,
		logger:                        logger,
		publicWalletGetByIDUseCase:    publicWalletGetByIDUseCase,
		publicWalletUpdateByIDUseCase: publicWalletUpdateByIDUseCase,
		userGetByIDUseCase:            userGetByIDUseCase,
		userUpdateUseCase:             userUpdateUseCase,
	}
}

func (svc *updatePublicWalletByIDServiceImpl) UpdateByID(sessCtx mongo.SessionContext, req *UpdatePublicWalletRequestIDO) error {
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

	e := make(map[string]string)
	if req.Name == "" {
		e["name"] = "Name is required"
	}
	if req.Description == "" {
		e["description"] = "Description is required"
	}
	if req.ID.IsZero() {
		e["id"] = "ID is required"
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

	//
	// Get from our database.
	//

	existingPublicWallet, err := svc.publicWalletGetByIDUseCase.Execute(sessCtx, req.ID)
	if err != nil {
		e["id"] = fmt.Sprintf("Public wallet lookup generated error: %v", err)
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

	if err := svc.publicWalletUpdateByIDUseCase.Execute(sessCtx, existingPublicWallet); err != nil {
		svc.logger.Error("failed to update public wallet",
			slog.Any("error", err))
		return err
	}

	return nil
}
