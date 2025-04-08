// cloud/comiccoin/internal/iam/service/publicwallet/create.go
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
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

type CreatePublicWalletRequestIDO struct {
	// The public address of the account.
	Address string `json:"address"`

	// The unique identifier for this blockchain that we are managing the state for.
	ChainID uint16 `json:"chain_id"`

	// The name of the public wallet's account.
	Name string `json:"name"`

	// The description of the public wallet's account.
	Description string `json:"description"`
}

type CreatePublicWalletResponseIDO struct {
	ID primitive.ObjectID `json:"id"`
}

type CreatePublicWalletService interface {
	Create(sessCtx mongo.SessionContext, req *CreatePublicWalletRequestIDO) (*CreatePublicWalletResponseIDO, error)
}

type createPublicWalletServiceImpl struct {
	config                          *config.Configuration
	logger                          *slog.Logger
	publicWalletCreateUseCase       uc.PublicWalletCreateUseCase
	publicWalletGetByAddressUseCase uc.PublicWalletGetByAddressUseCase
	userGetByIDUseCase              uc_user.UserGetByIDUseCase
	userUpdateUseCase               uc_user.UserUpdateUseCase
}

func NewCreatePublicWalletService(
	config *config.Configuration,
	logger *slog.Logger,
	uc1 uc.PublicWalletCreateUseCase,
	uc2 uc.PublicWalletGetByAddressUseCase,
	uc3 uc_user.UserGetByIDUseCase,
	uc4 uc_user.UserUpdateUseCase,
) CreatePublicWalletService {
	return &createPublicWalletServiceImpl{
		config:                          config,
		logger:                          logger,
		publicWalletCreateUseCase:       uc1,
		publicWalletGetByAddressUseCase: uc2,
		userGetByIDUseCase:              uc3,
		userUpdateUseCase:               uc4,
	}
}

func (svc *createPublicWalletServiceImpl) Create(sessCtx mongo.SessionContext, req *CreatePublicWalletRequestIDO) (*CreatePublicWalletResponseIDO, error) {
	//
	// Extract authenticated user information from context.
	//

	userID, ok := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	if !ok {
		svc.logger.Error("Failed getting local user id",
			slog.Any("error", "Not found in context: user_id"))
		return nil, errors.New("user id not found in context")
	}
	userName, _ := sessCtx.Value(constants.SessionUserName).(string)
	userIPAddress := sessCtx.Value(constants.SessionIPAddress).(string)

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
		} else {
			// Lookup in our database.
			existingPublicWallet, err := svc.publicWalletGetByAddressUseCase.Execute(sessCtx, &walletAddress)
			if err != nil {
				e["wallet_address"] = fmt.Sprintf("Public wallet lookup generated error: %v", err)
			}
			if existingPublicWallet != nil {
				e["wallet_address"] = "Wallet address was already registered"
			}
		}
	}
	if req.ChainID == 0 {
		e["chain_id"] = "Chain ID is required"
	} else {
		if req.ChainID != svc.config.Blockchain.ChainID {
			e["chain_id"] = "Chain ID must match the blockchain chain ID"
		}
	}
	if len(e) != 0 {
		svc.logger.Warn("Failed validation",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	// Convert into our format.
	walletAddress := common.HexToAddress(strings.ToLower(req.Address))

	//
	// Retrieve related user information.
	//

	user, err := svc.userGetByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		svc.logger.Error("Failed retrieving user", slog.Any("error", err))
		return nil, err
	}
	if user == nil {
		svc.logger.Error("User not found", slog.Any("userID", userID))
		return nil, httperror.NewForBadRequestWithSingleField("non_field_error", "User not found")
	}

	//
	// Create public wallet address in our database.
	//

	id := primitive.NewObjectID()

	pw := &dom.PublicWallet{
		Type:                  user.Role, // Not an error - this is correct!
		Address:               &walletAddress,
		ChainID:               req.ChainID,
		Name:                  req.Name,
		Description:           req.Description,
		WebsiteURL:            user.WebsiteURL,
		Phone:                 user.Phone,
		Country:               user.Country,
		Region:                user.Region,
		City:                  user.City,
		PostalCode:            user.PostalCode,
		AddressLine1:          user.AddressLine1,
		AddressLine2:          user.AddressLine2,
		IsVerified:            false,
		ThumbnailS3Key:        "",
		ViewCount:             0,
		UniqueViewCount:       0,
		UniqueIPAddresses:     make([]string, 0),
		ID:                    id,
		CreatedAt:             time.Now(),
		CreatedFromIPAddress:  userIPAddress,
		CreatedByUserID:       userID,
		CreatedByName:         userName,
		ModifiedAt:            time.Now(),
		ModifiedFromIPAddress: userIPAddress,
		ModifiedByUserID:      userID,
		ModifiedByName:        userName,
		Status:                dom.PublicWalletStatusActive,
	}

	if err := svc.publicWalletCreateUseCase.Execute(sessCtx, pw); err != nil {
		svc.logger.Error("failed to create public wallet",
			slog.Any("error", err))
		return nil, err
	}

	//
	// Return the created public wallet unique identifier.
	//

	return &CreatePublicWalletResponseIDO{
		ID: pw.ID,
	}, nil
}
