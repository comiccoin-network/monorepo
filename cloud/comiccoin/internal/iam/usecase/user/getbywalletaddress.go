package user

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
)

type UserGetByWalletAddressUseCase interface {
	Execute(ctx context.Context, walletAddress *common.Address) (*dom_user.User, error)
}

type userGetByWalletAddressUseCaseImpl struct {
	logger     *slog.Logger
	repository dom_user.Repository
}

func NewUserGetByWalletAddressUseCase(
	logger *slog.Logger,
	repository dom_user.Repository,
) UserGetByWalletAddressUseCase {
	return &userGetByWalletAddressUseCaseImpl{
		logger:     logger,
		repository: repository,
	}
}

func (uc *userGetByWalletAddressUseCaseImpl) Execute(ctx context.Context, walletAddress *common.Address) (*dom_user.User, error) {
	e := make(map[string]string)
	if walletAddress == nil {
		e["wallet_address"] = "Wallet address is required"
	} else {
		if walletAddress.Hex() == "0x0000000000000000000000000000000000000000" {
			e["wallet_address"] = "Wallet address cannot be burn address"
		}
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validation",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	uc.logger.Debug("getting user by wallet address",
		slog.String("wallet_address", walletAddress.String()))

	user, err := uc.repository.GetByWalletAddress(ctx, walletAddress)
	if err != nil {
		uc.logger.Error("failed getting user by wallet address",
			slog.String("wallet_address", walletAddress.String()),
			slog.Any("error", err))
		return nil, err
	}

	return user, nil
}
