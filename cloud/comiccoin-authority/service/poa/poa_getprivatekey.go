package poa

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	uc_wallet "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/wallet"
)

type GetProofOfAuthorityPrivateKeyService struct {
	config                  *config.Configuration
	logger                  *slog.Logger
	walletDecryptKeyUseCase *uc_wallet.WalletDecryptKeyUseCase
}

func NewGetProofOfAuthorityPrivateKeyService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc1 *uc_wallet.WalletDecryptKeyUseCase,
) *GetProofOfAuthorityPrivateKeyService {
	return &GetProofOfAuthorityPrivateKeyService{cfg, logger, uc1}
}

func (s *GetProofOfAuthorityPrivateKeyService) Execute(ctx context.Context) (*ecdsa.PrivateKey, error) {
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
	// STEP 2: Return the account.
	//

	ethAccount, wallet, err := s.walletDecryptKeyUseCase.Execute(ctx, s.config.Blockchain.ProofOfAuthorityWalletMnemonic, s.config.Blockchain.ProofOfAuthorityWalletPath)
	if err != nil {
		s.logger.Error("failed deriving wallet from mnemonic phrase",
			slog.Any("error", err))
		return nil, fmt.Errorf("failed deriving wallet from mnemonic phrase: %s", err)
	}
	if wallet == nil {
		return nil, fmt.Errorf("failed deriving wallet from mnemonic phrase: %s", "d.n.e.")
	}

	//
	// STEP 3: Get private key
	//

	privateKey, err := wallet.PrivateKey(*ethAccount)
	if err != nil {
		s.logger.Error("failed getting wallet private key",
			slog.Any("error", err))
		return nil, fmt.Errorf("failed getting wallet private key: %s", err)
	}

	return privateKey, nil
}
