// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/api/exchangetoken.go
package api

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	common_oauth_config "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	r_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/federatedidentity"
	r_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauth"
	r_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/token"
	svc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/oauth"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/federatedidentity"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/token"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
)

func TokenExchangeCmd() *cobra.Command {
	var authCode string

	var cmd = &cobra.Command{
		Use:   "exchange-token",
		Short: "Exchange authorization code for access token",
		Run: func(cmd *cobra.Command, args []string) {
			doRunTokenExchange(authCode)
		},
	}

	cmd.Flags().StringVarP(&authCode, "auth-code", "c", "", "Authorization code to exchange")
	cmd.MarkFlagRequired("auth-code")

	return cmd
}

func doRunTokenExchange(authCode string) {
	// Setup basic dependencies
	logger := logger.NewProvider()
	originalCfg := config.NewProvider()
	cfg := &common_oauth_config.Configuration{
		OAuth: common_oauth_config.OAuthConfig{
			ServerURL:                        originalCfg.PublicFaucetOAuth.ServerURL,
			ClientID:                         originalCfg.PublicFaucetOAuth.ClientID,
			ClientSecret:                     originalCfg.PublicFaucetOAuth.ClientSecret,
			ClientRedirectURI:                originalCfg.PublicFaucetOAuth.ClientRedirectURI,
			ClientRegisterSuccessURI:         originalCfg.PublicFaucetOAuth.ClientRegisterSuccessURI,
			ClientRegisterCancelURI:          originalCfg.PublicFaucetOAuth.ClientRegisterCancelURI,
			ClientAuthorizeOrLoginSuccessURI: originalCfg.PublicFaucetOAuth.ClientAuthorizeOrLoginSuccessURI,
			ClientAuthorizeOrLoginCancelURI:  originalCfg.PublicFaucetOAuth.ClientAuthorizeOrLoginCancelURI,
		},
		DB: common_oauth_config.DBConfig{
			URI:  originalCfg.DB.URI,
			Name: originalCfg.DB.PublicFaucetName,
		},
	}
	logger.Debug("configuration ready")

	// Initialize MongoDB client
	mongoClient := mongodb.NewProvider(originalCfg, logger)
	defer func() {
		if err := mongoClient.Disconnect(context.Background()); err != nil {
			logger.Error("failed to disconnect from MongoDB", slog.Any("error", err))
		}
	}()

	// Initialize repositories
	oauthRepo := r_oauth.NewRepository(cfg, logger)
	federatedidentityRepo := r_federatedidentity.NewRepository(cfg, logger, mongoClient)
	tokenRepo := r_token.NewRepository(cfg, logger, mongoClient)

	// Initialize use cases
	exchangeCodeUseCase := uc_oauth.NewExchangeCodeUseCase(cfg, logger, oauthRepo)
	introspectTokenUseCase := uc_oauth.NewIntrospectTokenUseCase(cfg, logger, oauthRepo)
	federatedidentityCreateUseCase := uc_federatedidentity.NewFederatedIdentityCreateUseCase(cfg, logger, federatedidentityRepo)
	federatedidentityGetByEmailUseCase := uc_federatedidentity.NewFederatedIdentityGetByEmailUseCase(cfg, logger, federatedidentityRepo)
	tokenUpsertUseCase := uc_token.NewTokenUpsertByFederatedIdentityIDUseCase(cfg, logger, tokenRepo)

	// Initialize service
	exchangeService := svc_oauth.NewExchangeService(
		cfg,
		logger,
		exchangeCodeUseCase,
		introspectTokenUseCase,
		federatedidentityCreateUseCase,
		federatedidentityGetByEmailUseCase,
		tokenUpsertUseCase,
	)

	// Execute token exchange through the service
	resp, err := exchangeService.ExchangeToken(context.Background(), &svc_oauth.ExchangeTokenRequest{
		Code: authCode,
	})
	if err != nil {
		logger.Error("failed to exchange authorization code",
			slog.Any("error", err))
		log.Fatal(err)
	}

	// Print the token information
	fmt.Printf("\nToken Exchange Successful\n")
	fmt.Printf("Access Token: %s\n", resp.AccessToken)
	fmt.Printf("Refresh Token: %s\n", resp.RefreshToken)
	fmt.Printf("Token Type: %s\n", resp.TokenType)
	fmt.Printf("Expires In: %d seconds\n", resp.ExpiresIn)
	fmt.Printf("FederatedIdentity Email: %s\n", resp.FederatedIdentityEmail) // Now we can show federatedidentity info
	fmt.Printf("FederatedIdentity Name: %s %s\n", resp.FirstName, resp.LastName)
}
