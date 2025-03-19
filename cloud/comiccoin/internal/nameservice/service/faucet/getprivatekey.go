// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/service/faucet/getprivatekey.go
package faucet

import (
	"crypto/ecdsa"
	"fmt"
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/usecase/walletutil"
)

type GetNameServicePrivateKeyService interface {
	Execute(sessCtx mongo.SessionContext) (*ecdsa.PrivateKey, error)
}

type getNameServicePrivateKeyServiceImpl struct {
	config                        *config.Configuration
	logger                        *slog.Logger
	privateKeyFromHDWalletUseCase uc_walletutil.PrivateKeyFromHDWalletUseCase
}

func NewGetNameServicePrivateKeyService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc1 uc_walletutil.PrivateKeyFromHDWalletUseCase,
) GetNameServicePrivateKeyService {
	return &getNameServicePrivateKeyServiceImpl{cfg, logger, uc1}
}

func (s *getNameServicePrivateKeyServiceImpl) Execute(sessCtx mongo.SessionContext) (*ecdsa.PrivateKey, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if s.config.Blockchain.NameServiceWalletMnemonic == nil {
		e["COMICCOIN_BLOCKCHAIN_PUBLICFAUCET_WALLET_MNEMONIC"] = "missing environment value"
	}
	if s.config.Blockchain.NameServiceWalletPath == "" {
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

	privateKey, err := s.privateKeyFromHDWalletUseCase.Execute(sessCtx, s.config.Blockchain.NameServiceWalletMnemonic, s.config.Blockchain.NameServiceWalletPath)
	if err != nil {
		s.logger.Error("failed getting wallet private key",
			slog.Any("error", err))
		return nil, fmt.Errorf("failed getting wallet private key: %s", err)
	}

	return privateKey, nil
}
