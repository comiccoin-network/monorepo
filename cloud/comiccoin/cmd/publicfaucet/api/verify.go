// github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/publicfaucet/api/verify.go
package api

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	common_oauth_config "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	r_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/federatedidentity"
	r_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauth"
	r_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/token"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/introspection"
	svc_introspection "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/introspection"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/federatedidentity"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/token"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
)

func VerifyTokenCmd() *cobra.Command {
	var accessToken, federatedidentityID string

	var cmd = &cobra.Command{
		Use:   "verify-token",
		Short: "Verify an access token's validity",
		Run: func(cmd *cobra.Command, args []string) {
			doRunVerifyToken(accessToken, federatedidentityID)
		},
	}

	cmd.Flags().StringVarP(&accessToken, "access-token", "t", "", "Access token to verify")
	cmd.Flags().StringVarP(&federatedidentityID, "federatedidentity-id", "u", "", "FederatedIdentity ID (optional)")
	cmd.MarkFlagRequired("access-token")

	return cmd
}

func doRunVerifyToken(accessToken, federatedidentityID string) {
	// Setup dependencies
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
	dbClient := mongodb.NewProvider(originalCfg, logger)
	logger.Debug("mongodb client initialized")

	// Initialize all repositories with debug logging
	oauthRepo := r_oauth.NewRepository(cfg, logger)
	logger.Debug("oauth repository initialized")

	tokenRepo := r_token.NewRepository(cfg, logger, dbClient)
	logger.Debug("token repository initialized")

	federatedidentityRepo := r_federatedidentity.NewRepository(cfg, logger, dbClient)
	logger.Debug("federatedidentity repository initialized")

	// Initialize all use cases with debug logging
	introspectTokenUseCase := uc_oauth.NewIntrospectTokenUseCase(cfg, logger, oauthRepo)
	tokenGetUseCase := uc_token.NewTokenGetByFederatedIdentityIDUseCase(cfg, logger, tokenRepo)
	federatedidentityGetByIDUseCase := uc_federatedidentity.NewFederatedIdentityGetByIDUseCase(cfg, logger, federatedidentityRepo)
	tokenGetByFederatedIdentityIDUseCase := uc_token.NewTokenGetByFederatedIdentityIDUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	tokenUpsertByFederatedIdentityIDUseCase := uc_token.NewTokenUpsertByFederatedIdentityIDUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	_ = tokenUpsertByFederatedIdentityIDUseCase
	refreshTokenUseCase := uc_oauth.NewRefreshTokenUseCase(
		cfg,
		logger,
		oauthRepo,
	)
	_ = refreshTokenUseCase

	// Add debug token lookup
	if federatedidentityID != "" {
		federatedidentityObjectID, err := primitive.ObjectIDFromHex(federatedidentityID)
		if err != nil {
			logger.Error("invalid federatedidentity ID format",
				slog.String("federatedidentity_id", federatedidentityID),
				slog.Any("error", err))
		} else {
			token, err := tokenGetUseCase.Execute(context.Background(), federatedidentityObjectID)
			if err != nil {
				logger.Error("failed to get token",
					slog.String("federatedidentity_id", federatedidentityID),
					slog.Any("error", err))
			} else if token != nil {
				logger.Info("found stored token",
					slog.String("federatedidentity_id", federatedidentityID),
					slog.String("access_token", token.AccessToken),
					slog.Time("expires_at", token.ExpiresAt))
			} else {
				logger.Warn("no token found for federatedidentity",
					slog.String("federatedidentity_id", federatedidentityID))
			}
		}
	}

	// Get OAuth token info directly
	introspectResp, err := introspectTokenUseCase.Execute(context.Background(), accessToken)
	if err != nil {
		logger.Error("failed to introspect token directly",
			slog.String("access_token", accessToken),
			slog.Any("error", err))
	} else {
		logger.Info("oauth introspection response",
			slog.Bool("active", introspectResp.Active),
			slog.String("client_id", introspectResp.ClientID))
	}

	// Initialize introspection service
	introspectionService := svc_introspection.NewIntrospectionService(
		cfg,
		logger,
		introspectTokenUseCase,
		tokenGetByFederatedIdentityIDUseCase,
		federatedidentityGetByIDUseCase,
	)

	// Create request
	req := &introspection.IntrospectionRequest{
		Token:               accessToken,
		FederatedIdentityID: federatedidentityID,
	}
	// Verify token
	resp, err := introspectionService.IntrospectToken(context.Background(), req)
	if err != nil {
		logger.Error("failed to verify token",
			slog.String("access_token", accessToken),
			slog.String("federatedidentity_id", federatedidentityID),
			slog.Any("error", err))
		log.Fatal(err)
	}

	// Print Results
	fmt.Printf("\nToken Verification Results\n")
	fmt.Printf("FederatedIdentity ID: %s\n", resp.FederatedIdentityID)
	fmt.Printf("Email: %v\n", resp.Email)
	fmt.Printf("FirstName At: %v\n", resp.FirstName)
	fmt.Printf("LastName: %v\n", resp.LastName)
	if !resp.Active {
		fmt.Printf("\nWarning: Token is not active!\n")
		return
	}

	fmt.Printf("\nToken is valid and active\n")
}
