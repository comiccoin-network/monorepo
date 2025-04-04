package main

import (
	"fmt"
	"log"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) GetDefaultDataDirectory() string {
	return GetDefaultDataDirectory()
}

func (a *App) GetDataDirectoryFromPreferences() string {
	preferences := PreferencesInstance()
	dataDir := preferences.DataDirectory
	return dataDir
}
func (a *App) GetDataDirectoryFromDialog() string {
	// Initialize Wails runtime
	result, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Please select were to save the blockchain",
	})
	if err != nil {
		a.logger.Error("Failed opening directory dialog",
			slog.Any("error", err))
		log.Fatalf("%v", err)
	}
	return result
}

func (a *App) SaveDataDirectory(newDataDirectory string) error {
	// Defensive code
	if newDataDirectory == "" {
		return fmt.Errorf("failed saving data directory because: %v", "data directory is empty")
	}

	a.logger.Debug("User picked directory path",
		slog.Any("path", newDataDirectory))

	preferences := PreferencesInstance()
	err := preferences.SetDataDirectory(newDataDirectory)
	if err != nil {
		a.logger.Error("Failed setting data directory",
			slog.Any("error", err))
		return err
	}

	// Re-attempt the startup now that we have the data directory set.
	a.logger.Debug("Data directory was set by user",
		slog.Any("data_directory", newDataDirectory))

	// Add the remaining configuration settings.
	if err := preferences.SetChainID(ComicCoinChainID); err != nil {
		a.logger.Error("Failed setting chain ID",
			slog.Any("error", err))
		return err
	}
	if err := preferences.SetAuthorityAddress(ComicCoinAuthorityAddress); err != nil {
		a.logger.Error("Failed setting authority address",
			slog.Any("error", err))
		return err
	}
	if err := preferences.SetNFTStorageAddress(ComicCoinNFTStorageAddress); err != nil {
		a.logger.Error("Failed setting NFT storage address",
			slog.Any("error", err))
		return err
	}

	a.startup(a.ctx)
	return nil
}

func (a *App) GetNFTStorageAPIKeyFromPreferences() string {
	preferences := PreferencesInstance()
	nftStorageAPIKey := preferences.NFTStorageAPIKey
	return nftStorageAPIKey
}

func (a *App) SetNFTStorageAPIKey(nftStorageAPIKey string) error {
	// Defensive code
	if nftStorageAPIKey == "" {
		return fmt.Errorf("failed saving nft storage API key because: %v", "value is empty")
	}
	preferences := PreferencesInstance()
	err := preferences.SetNFTStorageAPIKey(nftStorageAPIKey)
	if err != nil {
		a.logger.Error("Failed setting nft storage address",
			slog.Any("nft_storage_address", nftStorageAPIKey),
			slog.Any("error", err))
		return err
	}

	// Re-attempt the startup now that we have value set.
	a.logger.Debug("NFT storage address was set by user",
		slog.Any("nft_storage_address", nftStorageAPIKey))
	return nil
}

func (a *App) GetNFTStorageAddressFromPreferences() string {
	preferences := PreferencesInstance()
	nftStoreRemoteAddress := preferences.NFTStorageAddress
	return nftStoreRemoteAddress
}

func (a *App) SetNFTStorageAddress(nftStorageAddress string) error {
	// Defensive code
	if nftStorageAddress == "" {
		return fmt.Errorf("failed saving nft storage address because: %v", "value is empty")
	}
	preferences := PreferencesInstance()
	err := preferences.SetNFTStorageAddress(nftStorageAddress)
	if err != nil {
		a.logger.Error("Failed setting nft storage address",
			slog.Any("nft_storage_address", nftStorageAddress),
			slog.Any("error", err))
		return err
	}

	// Re-attempt the startup now that we have value set.
	a.logger.Debug("NFT storage address was set by user",
		slog.Any("nft_storage_address", nftStorageAddress))
	return nil
}

func (a *App) SetAuthorityAddress(authorityAddress string) error {
	// Defensive code
	if authorityAddress == "" {
		return fmt.Errorf("failed saving authority address because: %v", "value is empty")
	}
	preferences := PreferencesInstance()
	err := preferences.SetAuthorityAddress(authorityAddress)
	if err != nil {
		a.logger.Error("Failed setting authority address",
			slog.Any("authority_address", authorityAddress),
			slog.Any("error", err))
		return err
	}

	// Re-attempt the startup now that we have value set.
	a.logger.Debug("Authority address was set by user",
		slog.Any("authority_address", authorityAddress))
	return nil
}

func (a *App) SetAuthorityAPIKey(authorityAPIKey string) error {
	// Defensive code
	if authorityAPIKey == "" {
		return fmt.Errorf("failed saving authority API Key because: %v", "value is empty")
	}
	preferences := PreferencesInstance()
	err := preferences.SetAuthorityAPIKey(authorityAPIKey)
	if err != nil {
		a.logger.Error("Failed setting authority address",
			slog.Any("authority_api_key", authorityAPIKey),
			slog.Any("error", err))
		return err
	}

	// Re-attempt the startup now that we have value set.
	a.logger.Debug("Authority address was set by user",
		slog.Any("authority_api_key", authorityAPIKey))
	return nil
}

func (a *App) ShutdownApp() {
	runtime.Quit(a.ctx)
}

func (a *App) GetIsBlockhainNodeRunning() bool {
	return true //TODO: REMOVE
}

func (a *App) GetPreferences() *Preferences {
	return PreferencesInstance()
}

func (a *App) SaveNFTStoreConfigVariables(nftStoreAPIKey string, nftStoreRemoteAddress string) error {
	//
	// STEP 1:
	// Validation.
	//

	e := make(map[string]string)
	if nftStoreAPIKey == "" {
		e["nftStoreAPIKey"] = "missing value"
	}
	if nftStoreRemoteAddress == "" {
		e["nftStoreRemoteAddress"] = "missing value"
	}
	if len(e) != 0 {
		// If any fields are missing, log an error and return a bad request error.
		a.logger.Warn("Failed validating",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2:
	// Confirm the remote address works.
	//

	tempNFTAssetRepo := NewNFTAssetRepoWithConfiguration(a.logger, nftStoreRemoteAddress, nftStoreAPIKey)
	version, err := tempNFTAssetRepo.Version(a.ctx)
	if err != nil {
		return httperror.NewForBadRequestWithSingleField("nftStoreRemoteAddress", fmt.Sprintf("%v", err))
	}
	if version != "1.0" {
		return httperror.NewForBadRequestWithSingleField("nftStoreRemoteAddress", fmt.Sprintf("Wrong version: %v", version))
	}

	//
	// STEP 3:
	// Save to preferences.
	//

	if err := a.SetNFTStorageAddress(nftStoreRemoteAddress); err != nil {
		a.logger.Error("Failed setting nft storage remote address",
			slog.Any("error", err))
		return err
	}
	if err := a.SetNFTStorageAPIKey(nftStoreAPIKey); err != nil {
		a.logger.Error("Failed setting nft storage api key",
			slog.Any("error", err))
		return err
	}

	//
	// STEP 4: Startup...
	//

	a.startup(a.ctx)
	return nil

}

func (a *App) SaveAuthorityStoreConfigVariables(authorityAPIKey string, authorityRemoteAddress string) error {
	//
	// STEP 1:
	// Validation.
	//

	e := make(map[string]string)
	if authorityAPIKey == "" {
		e["authorityAPIKey"] = "missing value"
	}
	if authorityRemoteAddress == "" {
		e["authorityRemoteAddress"] = "missing value"
	}
	if len(e) != 0 {
		// If any fields are missing, log an error and return a bad request error.
		a.logger.Warn("Failed validating",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// STEP 2:
	// Save to preferences.
	//

	if err := a.SetAuthorityAddress(authorityRemoteAddress); err != nil {
		a.logger.Error("Failed setting authority remote address",
			slog.Any("error", err))
		return err
	}
	if err := a.SetAuthorityAPIKey(authorityAPIKey); err != nil {
		a.logger.Error("Failed setting authority api key",
			slog.Any("error", err))
		return err
	}

	//
	// STEP 4: Startup...
	//

	a.startup(a.ctx)
	return nil

}
