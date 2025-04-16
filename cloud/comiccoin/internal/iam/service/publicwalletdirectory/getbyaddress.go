// cloud/comiccoin/internal/iam/service/publicwalletdirectory/getbyaddress.go
package publicwalletdirectory

import (
	"context"
	"log/slog"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	uc "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/publicwallet"
)

type GetPublicWalletsFromDirectoryByAddressService interface {
	GetByAddress(ctx context.Context, address *common.Address) (*dom.PublicWallet, error)
}

type getPublicWalletsFromDirectoryByAddressServiceImpl struct {
	config            *config.Configuration
	logger            *slog.Logger
	getByAddressUC    uc.PublicWalletGetByAddressUseCase
	updateByAddressUC uc.PublicWalletUpdateByAddressUseCase
}

func NewGetPublicWalletsFromDirectoryByAddressService(
	config *config.Configuration,
	logger *slog.Logger,
	getByAddressUC uc.PublicWalletGetByAddressUseCase,
	updateByAddressUC uc.PublicWalletUpdateByAddressUseCase,
) GetPublicWalletsFromDirectoryByAddressService {
	return &getPublicWalletsFromDirectoryByAddressServiceImpl{
		config:            config,
		logger:            logger,
		getByAddressUC:    getByAddressUC,
		updateByAddressUC: updateByAddressUC,
	}
}

func (s *getPublicWalletsFromDirectoryByAddressServiceImpl) GetByAddress(ctx context.Context, address *common.Address) (*dom.PublicWallet, error) {
	s.logger.Debug("getting public wallet from directory by address", slog.String("address", address.Hex()))

	// Get the public wallet
	publicWallet, err := s.getByAddressUC.Execute(ctx, address)
	if err != nil {
		s.logger.Error("failed to get public wallet by address",
			slog.String("address", address.Hex()),
			slog.Any("error", err))
		return nil, err
	}

	// If the public wallet doesn't exist, just return nil
	if publicWallet == nil {
		s.logger.Error("failed to get public wallet by address because it doesn't exist",
			slog.String("address", address.Hex()))
		return nil, nil
	}

	// Get the IP address from the context
	ipAddress, ok := ctx.Value(constants.SessionIPAddress).(string)
	if ok && ipAddress != "" {
		// Increment the view count
		publicWallet.ViewCount++

		// Initialize the unique IP addresses map if it doesn't exist
		if publicWallet.UniqueIPAddresses == nil {
			publicWallet.UniqueIPAddresses = make(map[string]bool)
		}

		// Check if this IP address has viewed this wallet before
		if _, exists := publicWallet.UniqueIPAddresses[ipAddress]; !exists {
			// This is a new unique viewer
			publicWallet.UniqueIPAddresses[ipAddress] = true
			publicWallet.UniqueViewCount++

			s.logger.Debug("new unique viewer",
				slog.String("address", address.Hex()),
				slog.String("ip_address", ipAddress),
				slog.Uint64("unique_view_count", publicWallet.UniqueViewCount))
		}

		s.logger.Debug("updating view counts",
			slog.String("address", address.Hex()),
			slog.Uint64("view_count", publicWallet.ViewCount),
			slog.Uint64("unique_view_count", publicWallet.UniqueViewCount))

		// Update the public wallet in the database
		if err := s.updateByAddressUC.Execute(ctx, publicWallet); err != nil {
			s.logger.Error("failed to update public wallet view counts",
				slog.String("address", address.Hex()),
				slog.Any("error", err))
			// Continue anyway to return the wallet, even if updating view counts failed
		}
	} else {
		s.logger.Warn("could not get IP address from context",
			slog.String("address", address.Hex()))
	}

	return publicWallet, nil
}
