package service

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/blockchain/signature"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase"
)

type CreateAccountService struct {
	logger                          *slog.Logger
	openHDWalletFromMnemonicUseCase *usecase.OpenHDWalletFromMnemonicUseCase
	privateKeyFromHDWalletUseCase   *usecase.PrivateKeyFromHDWalletUseCase
	encryptWalletUseCase            *usecase.EncryptWalletUseCase
	createWalletUseCase             *usecase.CreateWalletUseCase
	createAccountUseCase            *usecase.CreateAccountUseCase
	getAccountUseCase               *usecase.GetAccountUseCase
}

func NewCreateAccountService(
	logger *slog.Logger,
	uc1 *usecase.OpenHDWalletFromMnemonicUseCase,
	uc2 *usecase.PrivateKeyFromHDWalletUseCase,
	uc3 *usecase.EncryptWalletUseCase,
	uc4 *usecase.CreateWalletUseCase,
	uc5 *usecase.CreateAccountUseCase,
	uc6 *usecase.GetAccountUseCase,
) *CreateAccountService {
	return &CreateAccountService{logger, uc1, uc2, uc3, uc4, uc5, uc6}
}

func (s *CreateAccountService) Execute(ctx context.Context, walletMnemonic *sstring.SecureString, walletPath string, walletPassword *sstring.SecureString, walletLabel string) (*domain.Account, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if walletMnemonic == nil {
		e["wallet_mnemonic"] = "Wallet mnemonic is required"
	}
	if walletPath == "" {
		e["wallet_path"] = "Wallet path is required"
	}
	if walletPassword == nil {
		e["wallet_password"] = "Wallet password is required"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed creating new account",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2:
	// Derive wallet from mnemonic phrase and path.
	//

	ethAccount, _, err := s.openHDWalletFromMnemonicUseCase.Execute(ctx, walletMnemonic, walletPath)
	if err != nil {
		s.logger.Error("failed getting wallet key",
			slog.Any("error", err))
		return nil, fmt.Errorf("failed getting wallet key: %s", err)
	}

	walletAddress := ethAccount.Address.Hex()

	s.logger.Debug("Created new wallet for account",
		slog.Any("wallet_address", walletAddress))

	//
	// STEP 3:
	// Decrypt the wallet so we can extract data from it.
	//

	privateKey, err := s.privateKeyFromHDWalletUseCase.Execute(ctx, walletMnemonic, walletPath)
	if err != nil {
		s.logger.Error("failed getting wallet key",
			slog.Any("error", err))
		return nil, fmt.Errorf("failed getting wallet key: %s", err)
	}

	//
	// STEP 3:
	// Generate a signature and confirm it works.
	//

	val := struct {
		name string
	}{
		name: "ComicCoin Blockchain",
	}

	// Break the signature into the 3 parts: R, S, and V.
	v1, r1, s1, err := signature.Sign(val, privateKey)
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
	if ethAccount.Address.Hex() != addressFromSig {
		s.logger.Error("address from signature does not match the wallet address",
			slog.Any("addressFromSig", addressFromSig),
			slog.Any("walletAddress", ethAccount.Address.Hex()))
		return nil, fmt.Errorf("address from signature at %v does not match the wallet address of %v", addressFromSig, ethAccount.Address.Hex())
	}

	//
	// STEP 4:
	// Create our wallet which will remain encrypted at rest.
	//

	encryptedWalletBytes, err := s.encryptWalletUseCase.Execute(ctx, walletMnemonic, walletPath, walletPassword)
	if err != nil {
		s.logger.Error("failed encrypting wallet",
			slog.Any("error", err))
		return nil, err
	}

	if err := s.createWalletUseCase.Execute(ctx, &ethAccount.Address, encryptedWalletBytes, walletLabel); err != nil {
		s.logger.Error("failed saving encrypted wallet",
			slog.Any("error", err))
		return nil, err
	}

	s.logger.Debug("Saving new wallet to database",
		slog.Any("wallet_address", ethAccount.Address.Hex()))

	//
	// STEP 4: Create the account.
	//

	if err := s.createAccountUseCase.Execute(ctx, &ethAccount.Address); err != nil {
		s.logger.Error("failed saving to database",
			slog.Any("error", err))
		return nil, fmt.Errorf("failed saving account to database: %s", err)
	}

	s.logger.Debug("Saving new account to database",
		slog.Any("wallet_address", ethAccount.Address.Hex()))

	//
	// STEP 5: Return the saved account.
	//

	s.logger.Debug("Finished creating new account",
		slog.Any("address", ethAccount.Address.Hex()))

	acc, err := s.getAccountUseCase.Execute(ctx, &ethAccount.Address)
	if err != nil {
		s.logger.Error("Failed getting newly created account from database",
			slog.Any("error", err))
		return nil, err
	}

	s.logger.Debug("Fetched newly created account",
		slog.Any("acc", acc))

	return acc, nil
}
