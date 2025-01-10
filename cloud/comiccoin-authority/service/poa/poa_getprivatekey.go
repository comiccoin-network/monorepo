package poa

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/walletutil"
)

type GetProofOfAuthorityPrivateKeyService interface {
	Execute(ctx context.Context) (*ecdsa.PrivateKey, error)
}

type getProofOfAuthorityPrivateKeyServiceImpl struct {
	config                        *config.Configuration
	logger                        *slog.Logger
	privateKeyFromHDWalletUseCase uc_walletutil.PrivateKeyFromHDWalletUseCase
}

func NewGetProofOfAuthorityPrivateKeyService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc1 uc_walletutil.PrivateKeyFromHDWalletUseCase,
) GetProofOfAuthorityPrivateKeyService {
	return &getProofOfAuthorityPrivateKeyServiceImpl{cfg, logger, uc1}
}

func (s *getProofOfAuthorityPrivateKeyServiceImpl) Execute(ctx context.Context) (*ecdsa.PrivateKey, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if s.config.Blockchain.ProofOfAuthorityWalletMnemonic == nil {
		e["COMICCOIN_AUTHORITY_BLOCKCHAIN_PROOF_OF_AUTHORITY_WALLET_MNEMONIC"] = "missing environment value"
	}
	if s.config.Blockchain.ProofOfAuthorityWalletPath == "" {
		e["COMICCOIN_AUTHORITY_BLOCKCHAIN_PROOF_OF_AUTHORITY_WALLET_PATH"] = "missing environment value"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating get key parameters",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get private key
	//

	privateKey, err := s.privateKeyFromHDWalletUseCase.Execute(ctx, s.config.Blockchain.ProofOfAuthorityWalletMnemonic, s.config.Blockchain.ProofOfAuthorityWalletPath)
	if err != nil {
		s.logger.Error("failed getting wallet private key",
			slog.Any("error", err))
		return nil, fmt.Errorf("failed getting wallet private key: %s", err)
	}

	return privateKey, nil
}
