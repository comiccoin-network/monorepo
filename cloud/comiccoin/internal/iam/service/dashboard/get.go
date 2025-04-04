// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/dashboard/get.go
package dashboard

import (
	"errors"
	"fmt"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	dom_publicwallet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	uc_publicwallet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

type DashboardDTO struct {
	ChainID               uint16                           `bson:"chain_id" json:"chain_id"`
	TotalWalletsCount     uint64                           `bson:"total_wallets_count" json:"total_wallets_count"`
	ActiveWalletsCount    uint64                           `bson:"active_wallets_count" json:"active_wallets_count"`
	TotalWalletViewsCount uint64                           `bson:"total_wallet_views_count" json:"total_wallet_views_count"`
	PublicWallets         []*dom_publicwallet.PublicWallet `bson:"public_wallets" json:"public_wallets"`
}

type GetDashboardService interface {
	Execute(sessCtx mongo.SessionContext) (*DashboardDTO, error)
}

type getDashboardServiceImpl struct {
	config                                       *config.Configuration
	logger                                       *slog.Logger
	userGetByIDUseCase                           uc_user.UserGetByIDUseCase
	publicWalletCountByFilterUseCase             uc_publicwallet.PublicWalletCountByFilterUseCase
	publicWalletListByFilterUseCase              uc_publicwallet.PublicWalletListByFilterUseCase
	publicWalletGetTotalViewCountByFilterUseCase uc_publicwallet.PublicWalletGetTotalViewCountByFilterUseCase
}

func NewGetDashboardService(
	config *config.Configuration,
	logger *slog.Logger,
	userGetByIDUseCase uc_user.UserGetByIDUseCase,
	publicWalletCountByFilterUseCase uc_publicwallet.PublicWalletCountByFilterUseCase,
	publicWalletListByFilterUseCase uc_publicwallet.PublicWalletListByFilterUseCase,
	publicWalletGetTotalViewCountByFilterUseCase uc_publicwallet.PublicWalletGetTotalViewCountByFilterUseCase,
) GetDashboardService {
	return &getDashboardServiceImpl{
		config:                           config,
		logger:                           logger,
		userGetByIDUseCase:               userGetByIDUseCase,
		publicWalletCountByFilterUseCase: publicWalletCountByFilterUseCase,
		publicWalletListByFilterUseCase:  publicWalletListByFilterUseCase,
		publicWalletGetTotalViewCountByFilterUseCase: publicWalletGetTotalViewCountByFilterUseCase,
	}
}

func (svc *getDashboardServiceImpl) Execute(sessCtx mongo.SessionContext) (*DashboardDTO, error) {
	//
	// Get required from context.
	//

	userID, ok := sessCtx.Value(constants.SessionUserID).(primitive.ObjectID)
	if !ok {
		svc.logger.Error("Failed getting local user id",
			slog.Any("error", "Not found in context: user_id"))
		return nil, errors.New("user id not found in context")
	}
	svc.logger.Debug("Extracted from local context",
		slog.Any("userID", userID))

	//
	// Get related records.
	//

	user, err := svc.userGetByIDUseCase.Execute(sessCtx, userID)
	if err != nil {
		svc.logger.Error("failed getting user error", slog.Any("err", err))
		return nil, err
	}
	if user == nil {
		err := fmt.Errorf("User does not exist for user id: %v", userID.Hex())
		svc.logger.Error("Failed getting user by user id", slog.Any("error", err))
		return nil, err
	}

	//
	// Get public wallet count.
	//

	totalPublicWalletCount, err := svc.publicWalletCountByFilterUseCase.Execute(sessCtx, &dom_publicwallet.PublicWalletFilter{
		CreatedByUserID: userID,
	})
	if err != nil {
		svc.logger.Error("failed getting public wallet count error", slog.Any("err", err))
		return nil, err
	}
	activeWalletsCount, err := svc.publicWalletCountByFilterUseCase.Execute(sessCtx, &dom_publicwallet.PublicWalletFilter{
		CreatedByUserID: userID,
		Status:          dom_publicwallet.PublicWalletStatusActive,
	})
	if err != nil {
		svc.logger.Error("failed getting public wallet count error", slog.Any("err", err))
		return nil, err
	}
	totalWalletViewsCount, err := svc.publicWalletGetTotalViewCountByFilterUseCase.Execute(sessCtx, &dom_publicwallet.PublicWalletFilter{
		CreatedByUserID: userID,
	})
	if err != nil {
		svc.logger.Error("failed getting public wallet total view count error", slog.Any("err", err))
		return nil, err
	}

	//
	// Get public wallet list.
	//

	publicWalletList, err := svc.publicWalletListByFilterUseCase.Execute(sessCtx, &dom_publicwallet.PublicWalletFilter{
		CreatedByUserID: userID,
		Status:          dom_publicwallet.PublicWalletStatusActive,
		Limit:           10,
	})
	if err != nil {
		svc.logger.Error("failed getting public wallet list error", slog.Any("err", err))
		return nil, err
	}

	svc.logger.Debug("Dashboard fetched",
		slog.Any("createdByUserID", userID),
		slog.Any("totalPublicWalletCount", totalPublicWalletCount),
		slog.Any("activeWalletsCount", activeWalletsCount),
		slog.Any("totalWalletViewsCount", totalWalletViewsCount),
		slog.Any("publicWalletList", publicWalletList))

	// Return our dashboard response.
	return &DashboardDTO{
		ChainID:               user.ChainID,
		TotalWalletsCount:     totalPublicWalletCount,
		ActiveWalletsCount:    activeWalletsCount,
		TotalWalletViewsCount: totalWalletViewsCount,
		PublicWallets:         publicWalletList.PublicWallets,
	}, nil
}
