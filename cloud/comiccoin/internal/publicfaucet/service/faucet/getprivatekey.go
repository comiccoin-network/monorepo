// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/faucet/getprivatekey.go
package faucet

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/walletutil"
)

type GetPublicFaucetPrivateKeyService interface {
	Execute(ctx context.Context) (*ecdsa.PrivateKey, error)
}

type getPublicFaucetPrivateKeyServiceImpl struct {
	config                        *config.Configuration
	logger                        *slog.Logger
	privateKeyFromHDWalletUseCase uc_walletutil.PrivateKeyFromHDWalletUseCase
}

func NewGetPublicFaucetPrivateKeyService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc1 uc_walletutil.PrivateKeyFromHDWalletUseCase,
) GetPublicFaucetPrivateKeyService {
	return &getPublicFaucetPrivateKeyServiceImpl{cfg, logger, uc1}
}

func (s *getPublicFaucetPrivateKeyServiceImpl) Execute(ctx context.Context) (*ecdsa.PrivateKey, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if s.config.Blockchain.PublicFaucetWalletMnemonic == nil {
		e["COMICCOIN_BLOCKCHAIN_PUBLICFAUCET_WALLET_MNEMONIC"] = "missing environment value"
	}
	if s.config.Blockchain.PublicFaucetWalletPath == "" {
		e["COMICCOIN_BLOCKCHAIN_PUBLICFAUCET_WALLET_PATH"] = "missing environment value"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating get key parameters",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get private key
	//

	privateKey, err := s.privateKeyFromHDWalletUseCase.Execute(ctx, s.config.Blockchain.PublicFaucetWalletMnemonic, s.config.Blockchain.PublicFaucetWalletPath)
	if err != nil {
		s.logger.Error("failed getting wallet private key",
			slog.Any("error", err))
		return nil, fmt.Errorf("failed getting wallet private key: %s", err)
	}

	return privateKey, nil
}
