package account

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/blockchain/signature"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"

	uc_account "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/account"
	uc_wallet "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/wallet"
	uc_walletutil "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/usecase/walletutil"
)

type CreateAccountService struct {
	logger                          *slog.Logger
	openHDWalletFromMnemonicUseCase *uc_walletutil.OpenHDWalletFromMnemonicUseCase
	privateKeyFromHDWalletUseCase   *uc_walletutil.PrivateKeyFromHDWalletUseCase
	encryptWalletUseCase            *uc_walletutil.EncryptWalletUseCase
	createWalletUseCase             *uc_wallet.CreateWalletUseCase
	createAccountUseCase            uc_account.CreateAccountUseCase
	getAccountUseCase               uc_account.GetAccountUseCase
}

func NewCreateAccountService(
	logger *slog.Logger,
	uc1 *uc_walletutil.OpenHDWalletFromMnemonicUseCase,
	uc2 *uc_walletutil.PrivateKeyFromHDWalletUseCase,
	uc3 *uc_walletutil.EncryptWalletUseCase,
	uc4 *uc_wallet.CreateWalletUseCase,
	uc5 uc_account.CreateAccountUseCase,
	uc6 uc_account.GetAccountUseCase,
) *CreateAccountService {
	return &CreateAccountService{logger, uc1, uc2, uc3, uc4, uc5, uc6}
}

func (s *CreateAccountService) Execute(ctx context.Context, chainID uint16, walletMnemonic *sstring.SecureString, walletPath string, walletPassword *sstring.SecureString, walletLabel string) (*domain.Account, error) {
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

	if err := s.createAccountUseCase.Execute(ctx, chainID, &ethAccount.Address); err != nil {
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
