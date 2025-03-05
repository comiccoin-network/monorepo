package user

import (
	"context"
	"log/slog"

	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/user"
)


type UserGetByWalletAddressUseCase interface {
	Execute(ctx context.Context, walletAddress string) (*dom_user.User, error)
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

func (uc *userGetByWalletAddressUseCaseImpl) Execute(ctx context.Context, walletAddress string) (*dom_user.User, error) {
	uc.logger.Debug("getting user by wallet address",
		slog.String("wallet_address", walletAddress))

	user, err := uc.repository.GetByWalletAddress(ctx, walletAddress)
	if err != nil {
		uc.logger.Error("failed getting user by wallet address",
			slog.String("wallet_address", walletAddress),
			slog.Any("error", err))
		return nil, err
	}

	return user, nil
} 