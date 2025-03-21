package main

import (
	"fmt"
	"log"
	"log/slog"
	"strings"

	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	"github.com/ethereum/go-ethereum/common"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) DefaultWalletAddress() string {
	preferences := PreferencesInstance()
	return preferences.DefaultWalletAddress
}

func (a *App) ListWallets() ([]*domain.Wallet, error) {
	return a.walletsFilterByLocalService.Execute(a.ctx)
}

func (a *App) CreateWallet(walletMnemonic, walletPassword, walletLabel string) (string, error) { //TODO: REPAIR IN FRONTEND
	mnemonic, err := sstring.NewSecureString(walletMnemonic)
	if err != nil {
		log.Fatalf("Failed secure mnemonic phrase: %v", err)
	}
	pass, err := sstring.NewSecureString(walletPassword) //TODO: REPAIR IN FRONTEND
	if err != nil {
		a.logger.Error("Failed securing password",
			slog.Any("error", err))
		return "", err
	}
	// defer pass.Wipe() // Developers Note: Commented out b/c they are causing problems with our app.

	// Developers Note: Use the same as what ethereum uses.
	walletPath := "m/44'/60'/0'/0/0"

	account, err := a.createAccountService.Execute(a.ctx, PreferencesInstance().ChainID, mnemonic, walletPath, pass, walletLabel)
	if err != nil {
		a.logger.Error("failed creating wallet", slog.Any("error", err))
		return "", err
	}
	if account == nil {
		a.logger.Error("failed creating wallet as returned account d.n.e.")
		return "", fmt.Errorf("failed creating wallet: %v", "returned account d.n.e.")
	}

	// Save this newly created wallet address as the default address to
	// load up when the application finishes loading.
	walletAddress := strings.ToLower(account.Address.String())
	preferences.SetDefaultWalletAddress(strings.ToLower(walletAddress))

	// Return our address.
	return walletAddress, nil
}

func (a *App) SetDefaultWalletAddress(walletAddress string) {
	preferences := PreferencesInstance()
	preferences.SetDefaultWalletAddress(strings.ToLower(walletAddress))
}

func (a *App) ExportWalletUsingDialog(walletAddressStr string) error {
	// Initialize Wails runtime
	filepath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Please select were to save the wallet",
		DefaultFilename: "wallet.wal",
	})
	if err != nil {
		a.logger.Error("Failed opening directory dialog",
			slog.Any("wallet_address", walletAddressStr),
			slog.Any("error", err))
		log.Fatalf("%v", err)
	}
	a.logger.Debug("User picked a filepath",
		slog.Any("wallet_address", walletAddressStr),
		slog.Any("filepath", filepath))

	walletAddress := common.HexToAddress(strings.ToLower(walletAddressStr))
	return a.exportWalletService.Execute(a.ctx, &walletAddress, filepath)
}

func (a *App) ImportWalletUsingDialog() error {
	// Initialize Wails runtime
	filepath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title:           "Please select were to open the wallet",
		DefaultFilename: "wallet.wal",
	})
	if err != nil {
		a.logger.Error("Failed opening directory dialog",
			slog.Any("error", err))
		log.Fatalf("%v", err)
	}
	a.logger.Debug("User picked a filepath",
		slog.Any("filepath", filepath))

	return a.importWalletService.Execute(a.ctx, filepath)
}

func (a *App) ExportWalletMnemonicPhrase(walletAddressStr string, walletPassword string) (string, error) {

	var walletAddress *common.Address = nil
	if walletAddressStr != "" {
		walletAddr := common.HexToAddress(walletAddressStr)
		walletAddress = &walletAddr
	}

	password, err := sstring.NewSecureString(walletPassword)
	if err != nil {
		a.logger.Error("Failed securing password",
			slog.Any("error", err))
		return "", err
	}

	mn, _, err := a.walletRecoveryService.Execute(a.ctx, walletAddress, password)
	if err != nil {
		a.logger.Error("Failed recovering",
			slog.Any("error", err))
		return "", err
	}
	return mn.String(), nil
}
