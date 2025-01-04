package service

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/blockchain/signature"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/account"
	uc_wallet "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/wallet"
)

type CreateAccountService struct {
	config                  *config.Configuration
	logger                  *slog.Logger
	walletEncryptKeyUseCase *uc_wallet.WalletEncryptKeyUseCase
	walletDecryptKeyUseCase *uc_wallet.WalletDecryptKeyUseCase
	createWalletUseCase     *uc_wallet.CreateWalletUseCase
	createAccountUseCase    *uc_account.CreateAccountUseCase
	getAccountUseCase       *uc_account.GetAccountUseCase
}

func NewCreateAccountService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc1 *uc_wallet.WalletEncryptKeyUseCase,
	uc2 *uc_wallet.WalletDecryptKeyUseCase,
	uc3 *uc_wallet.CreateWalletUseCase,
	uc4 *uc_account.CreateAccountUseCase,
	uc5 *uc_account.GetAccountUseCase,
) *CreateAccountService {
	return &CreateAccountService{cfg, logger, uc1, uc2, uc3, uc4, uc5}
}

func (s *CreateAccountService) Execute(ctx context.Context, walletPassword *sstring.SecureString, walletPasswordRepeated *sstring.SecureString, walletLabel string) (*domain.Account, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if walletPassword == nil {
		e["wallet_password"] = "missing value"
	}
	if walletPasswordRepeated == nil {
		e["wallet_password_repeated"] = "missing value"
	}
	if walletPassword.String() != walletPasswordRepeated.String() {
		e["wallet_password"] = "do not match"
		e["wallet_password_repeated"] = "do not match"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed creating new account",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2:
	// Create the encryted physical wallet on file.
	//

	walletAddress, walletBytes, err := s.walletEncryptKeyUseCase.Execute(ctx, walletPassword)
	if err != nil {
		s.logger.Error("failed creating new keystore",
			slog.Any("error", err))
		return nil, fmt.Errorf("failed creating new keystore: %s", err)
	}

	s.logger.Debug("Created new wallet for account",
		slog.Any("wallet_address", walletAddress),
		slog.Any("wallet_bytes", walletBytes))

	//
	// STEP 3:
	// Decrypt the wallet so we can extract data from it.
	//

	walletKey, err := s.walletDecryptKeyUseCase.Execute(ctx, walletBytes, walletPassword)
	if err != nil {
		s.logger.Error("failed getting wallet key",
			slog.Any("error", err))
		return nil, fmt.Errorf("failed getting wallet key: %s", err)
	}

	val := struct {
		name string
	}{
		name: "ComicCoin Blockchain",
	}

	// Break the signature into the 3 parts: R, S, and V.
	v1, r1, s1, err := signature.Sign(val, walletKey.PrivateKey)
	if err != nil {
		s.logger.Error("failed signing",
			slog.Any("error", err))
		return nil, err
	}
	// Recombine and get our address from the signature.
	addressFromSig, err := signature.FromAddress(val, v1, r1, s1)
	if err != nil {
		s.logger.Error("failed getting from address",
			slog.Any("error", err))
		return nil, err
	}

	// Defensive Code: Do a check to ensure our signer to be working correctly.
	if walletAddress.Hex() != addressFromSig {
		s.logger.Error("address from signature does not match the wallet address",
			slog.Any("addressFromSig", addressFromSig),
			slog.Any("walletAddress", walletAddress.Hex()))
		return nil, fmt.Errorf("address from signature at %v does not match the wallet address of %v", addressFromSig, walletAddress.Hex())
	}

	//
	// STEP 4:
	// Converts the wallet's public key to an account value.
	//

	// // DEVELOPERS NOTE:
	// // AccountID represents an account id that is used to sign transactions and is
	// // associated with transactions on the blockchain. This will be the last 20
	// // bytes of the public key.
	// privateKey := walletKey.PrivateKey
	// publicKey := privateKey.PublicKey
	// accountID := crypto.PubkeyToAddress(publicKey).String()

	//
	// STEP 3:
	// Save wallet to our database.
	//

	s.logger.Debug("Saving new (encrypted) wallet to database",
		slog.Any("wallet_address", walletAddress))

	if err := s.createWalletUseCase.Execute(ctx, walletAddress, walletBytes, walletLabel); err != nil {
		s.logger.Error("failed saving to database",
			slog.Any("error", err))
		return nil, fmt.Errorf("failed saving wallet to database: %s", err)
	}

	//
	// STEP 4: Create the account.
	//

	s.logger.Debug("Saving new account to database for the (encrypted) wallet",
		slog.Any("wallet_address", walletAddress))

	if err := s.createAccountUseCase.Execute(ctx, walletAddress); err != nil {
		s.logger.Error("failed saving to database",
			slog.Any("error", err))
		return nil, fmt.Errorf("failed saving account to database: %s", err)
	}

	//
	// STEP 5: Return the saved account.
	//

	s.logger.Debug("Finished creating new account",
		slog.Any("address", walletAddress))

	acc, err := s.getAccountUseCase.Execute(ctx, walletAddress)
	if err != nil {
		s.logger.Error("Failed getting newly created account from database",
			slog.Any("error", err))
		return nil, err
	}

	s.logger.Debug("Fetched newly created account",
		slog.Any("acc", acc))

	return acc, nil
}
