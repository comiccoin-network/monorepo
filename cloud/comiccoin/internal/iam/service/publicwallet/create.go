// cloud/comiccoin/internal/iam/service/publicwallet/create.go
package publicwallet

import (
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
}

func NewCreatePublicWalletService(
	config *config.Configuration,
	logger *slog.Logger,
	uc1 uc.PublicWalletCreateUseCase,
	uc2 uc.PublicWalletGetByAddressUseCase,
) CreatePublicWalletService {
	return &createPublicWalletServiceImpl{
		config:                          config,
		logger:                          logger,
		publicWalletCreateUseCase:       uc1,
		publicWalletGetByAddressUseCase: uc2,
	}
}

func (svc *createPublicWalletServiceImpl) Create(sessCtx mongo.SessionContext, req *CreatePublicWalletRequestIDO) (*CreatePublicWalletResponseIDO, error) {
	//
	// Extract authenticated user information from context.
	//

	userID, _ := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	userName, _ := sessCtx.Value(constants.SessionUserName).(string)

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
	// Create public wallet address in our database.
	//

	id := primitive.NewObjectID()

	pw := &dom.PublicWallet{
		Address:          &walletAddress,
		ChainID:          req.ChainID,
		Name:             req.Name,
		Description:      req.Description,
		ThumbnailS3Key:   "",
		ViewCount:        0,
		ID:               id,
		CreatedAt:        time.Now(),
		CreatedByUserID:  userID,
		CreatedByName:    userName,
		ModifiedAt:       time.Now(),
		ModifiedByUserID: userID,
		ModifiedByName:   userName,
		Status:           dom.PublicWalletStatusActive,
	}

	err := svc.publicWalletCreateUseCase.Execute(sessCtx, pw)
	if err != nil {
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
