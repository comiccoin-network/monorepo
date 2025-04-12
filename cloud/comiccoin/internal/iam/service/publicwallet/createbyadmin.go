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
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

type CreatePublicWalletByAdminRequestIDO struct {
	// The public address of the account.
	Address string `json:"address"`

	// The unique identifier for this blockchain that we are managing the state for.
	ChainID uint16 `json:"chain_id"`

	// The name of the public wallet's account.
	Name string `json:"name"`

	// The description of the public wallet's account.
	Description string `json:"description"`

	// UserID is the user to attach the public wallet to.
	UserID primitive.ObjectID `json:"user_id,omitempty"`

	// The status of the public wallet.
	Status int8 `bson:"status" json:"status"`

	// Status indicates that the someone from the ComicCoin Authority verified this user profile.
	IsVerified bool `bson:"is_verified" json:"is_verified"`
}

type CreatePublicWalletByAdminResponseIDO struct {
	ID primitive.ObjectID `json:"id"`
}

type CreatePublicWalletByAdminService interface {
	Create(sessCtx mongo.SessionContext, req *CreatePublicWalletByAdminRequestIDO) (*CreatePublicWalletByAdminResponseIDO, error)
}

type createPublicWalletByAdminImpl struct {
	config                          *config.Configuration
	logger                          *slog.Logger
	publicWalletCreateUseCase       uc.PublicWalletCreateUseCase
	publicWalletGetByAddressUseCase uc.PublicWalletGetByAddressUseCase
	userGetByIDUseCase              uc_user.UserGetByIDUseCase
	userUpdateUseCase               uc_user.UserUpdateUseCase
}

func NewCreatePublicWalletByAdminService(
	config *config.Configuration,
	logger *slog.Logger,
	uc1 uc.PublicWalletCreateUseCase,
	uc2 uc.PublicWalletGetByAddressUseCase,
	uc3 uc_user.UserGetByIDUseCase,
	uc4 uc_user.UserUpdateUseCase,
) CreatePublicWalletByAdminService {
	return &createPublicWalletByAdminImpl{
		config:                          config,
		logger:                          logger,
		publicWalletCreateUseCase:       uc1,
		publicWalletGetByAddressUseCase: uc2,
		userGetByIDUseCase:              uc3,
		userUpdateUseCase:               uc4,
	}
}

func (svc *createPublicWalletByAdminImpl) Create(sessCtx mongo.SessionContext, req *CreatePublicWalletByAdminRequestIDO) (*CreatePublicWalletByAdminResponseIDO, error) {
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
	sessionUserRole, _ := sessCtx.Value(constants.SessionUserRole).(int8)
	if sessionUserRole != dom_user.UserRoleRoot {
		svc.logger.Warn("only admin is allowed to run this service",
			slog.Any("error", ""))
		return nil, httperror.NewForForbiddenWithSingleField("message", "admins are only allowed to create public wallets via this function")
	}

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
	if req.UserID.IsZero() {
		e["user_id"] = "User ID is required"
	} else {
		user, err := svc.userGetByIDUseCase.Execute(sessCtx, req.UserID)
		if err != nil {
			e["user_id"] = fmt.Sprintf("User lookup generated error: %v", err)
		} else if user == nil {
			e["user_id"] = "User not found"
		} else if user.ID != userID {
			e["user_id"] = "User ID does not match session user ID"
		}
	}
	if req.Status == 0 {
		e["status"] = "Status is required"
	} else {
		if req.Status != 1 && req.Status != 2 && req.Status != 3 {
			e["status"] = "Status must be active or inactive"
		}
	}
	if len(e) != 0 {
		svc.logger.Warn("Failed validation",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	// Convert into our format.
	walletAddress := common.HexToAddress(strings.ToLower(req.Address))
	svc.logger.Debug("Converted",
		slog.Any("fromAddress", req.Address),
		slog.Any("toAddress", walletAddress))

	//
	// Retrieve related user information.
	//

	user, err := svc.userGetByIDUseCase.Execute(sessCtx, req.UserID)
	if err != nil {
		svc.logger.Error("Failed retrieving user",
			slog.Any("userID", req.UserID),
			slog.Any("error", err))
		return nil, err
	}
	if user == nil {
		svc.logger.Error("User not found", slog.Any("userID", req.UserID))
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
		IsVerified:            req.IsVerified,
		ThumbnailS3Key:        "",
		ViewCount:             0,
		UniqueViewCount:       0,
		UniqueIPAddresses:     make([]string, 0),
		ID:                    id,
		CreatedAt:             time.Now(),
		CreatedFromIPAddress:  userIPAddress,
		CreatedByUserID:       userID, // Created by admin
		CreatedByName:         userName,
		ModifiedAt:            time.Now(),
		ModifiedFromIPAddress: userIPAddress,
		ModifiedByUserID:      userID, // Modified by admin
		ModifiedByName:        userName,
		Status:                req.Status,
	}
	if req.IsVerified {
		pw.VerifiedOn = time.Now()
	}

	if err := svc.publicWalletCreateUseCase.Execute(sessCtx, pw); err != nil {
		svc.logger.Error("failed to create public wallet",
			slog.Any("error", err))
		return nil, err
	}

	svc.logger.Debug("Saved public wallet by admin",
		slog.Any("Type", pw.Type),
		slog.Any("Address", pw.Address),
		slog.Any("ChainID", pw.ChainID),
		slog.Any("Name", pw.Name),
		slog.Any("Name [req]", req.Name),
		slog.Any("Description", pw.Description),
		slog.Any("Description [req]", req.Description),
		slog.Any("WebsiteURL", pw.WebsiteURL),
		slog.Any("Phone", pw.Phone),
		slog.Any("Country", pw.Country),
		slog.Any("Region", pw.Region),
		slog.Any("City", pw.City),
		slog.Any("PostalCode", pw.PostalCode),
		slog.Any("AddressLine1", pw.AddressLine1),
		slog.Any("AddressLine2", pw.AddressLine2),
		slog.Any("IsVerified", pw.IsVerified),
		slog.Any("ThumbnailS3Key", pw.ThumbnailS3Key),
		slog.Any("ViewCount", pw.ViewCount),
		slog.Any("UniqueViewCount", pw.UniqueViewCount),
		slog.Any("UniqueIPAddresses", pw.UniqueIPAddresses),
		slog.Any("ID", pw.ID),
		slog.Any("CreatedAt", pw.CreatedAt),
		slog.Any("CreatedFromIPAddress", pw.CreatedFromIPAddress),
		slog.Any("CreatedByUserID", pw.CreatedByUserID),
		slog.Any("CreatedByName", pw.CreatedByName),
		slog.Any("ModifiedAt", pw.ModifiedAt),
		slog.Any("ModifiedFromIPAddress", pw.ModifiedFromIPAddress),
		slog.Any("ModifiedByUserID", pw.ModifiedByUserID),
		slog.Any("ModifiedByName", pw.ModifiedByName),
		slog.Any("Status", pw.Status))

	//
	// Return the created public wallet unique identifier.
	//

	return &CreatePublicWalletByAdminResponseIDO{
		ID: pw.ID,
	}, nil
}
