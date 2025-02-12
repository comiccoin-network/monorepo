// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/api/refresh.go
package api

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/logger"
	common_oauth_config "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	r_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/oauth"
	r_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/token"
	svc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/token"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
)

func RefreshTokenCmd() *cobra.Command {
	var userID, refreshToken string

	var cmd = &cobra.Command{
		Use:   "refresh-token",
		Short: "Refresh an expired access token using a refresh token",
		Run: func(cmd *cobra.Command, args []string) {
			doRunTokenRefresh(userID, refreshToken)
		},
	}

	cmd.Flags().StringVarP(&userID, "user-id", "u", "", "User ID (required)")
	cmd.Flags().StringVarP(&refreshToken, "refresh-token", "r", "", "Refresh token (required)")
	cmd.MarkFlagRequired("user-id")
	cmd.MarkFlagRequired("refresh-token")

	return cmd
}

func doRunTokenRefresh(userID, refreshToken string) {
	// Initialize logger and configuration
	logger := logger.NewProvider()
	originalCfg := config.NewProviderUsingEnvironmentVariables()
	cfg := &common_oauth_config.Configuration{
		OAuth: common_oauth_config.OAuthConfig{
			ServerURL:         originalCfg.OAuth.ServerURL,
			ClientID:          originalCfg.OAuth.ClientID,
			ClientSecret:      originalCfg.OAuth.ClientSecret,
			ClientRedirectURI: originalCfg.OAuth.ClientRedirectURI,
			ClientSuccessURI:  originalCfg.OAuth.ClientSuccessURI,
			ClientCancelURI:   originalCfg.OAuth.ClientCancelURI,
		},
		DB: common_oauth_config.DBConfig{
			URI:  originalCfg.DB.URI,
			Name: originalCfg.DB.Name,
		},
	}
	logger.Debug("configuration ready")

	// Initialize MongoDB client with error checking
	mongoClient := mongodb.NewProvider(originalCfg, logger)
	if mongoClient == nil {
		logger.Error("failed to initialize MongoDB client")
		log.Fatal("MongoDB client initialization failed")
	}

	defer func() {
		if err := mongoClient.Disconnect(context.Background()); err != nil {
			logger.Error("failed to disconnect from MongoDB", slog.Any("error", err))
		}
	}()
	logger.Debug("mongodb client initialized")

	// Initialize repositories with error checking
	oauthRepo := r_oauth.NewRepository(cfg, logger)
	if oauthRepo == nil {
		logger.Error("failed to initialize OAuth repository")
		log.Fatal("OAuth repository initialization failed")
	}

	tokenRepo := r_token.NewRepository(cfg, logger, mongoClient)
	if tokenRepo == nil {
		logger.Error("failed to initialize token repository")
		log.Fatal("Token repository initialization failed")
	}
	logger.Debug("repositories initialized")

	// Initialize use cases with error checking
	refreshTokenUseCase := uc_oauth.NewRefreshTokenUseCase(cfg, logger, oauthRepo)
	if refreshTokenUseCase == nil {
		logger.Error("failed to initialize refresh token use case")
		log.Fatal("Refresh token use case initialization failed")
	}

	tokenGetUseCase := uc_token.NewTokenGetByUserIDUseCase(cfg, logger, tokenRepo)
	if tokenGetUseCase == nil {
		logger.Error("failed to initialize token get use case")
		log.Fatal("Token get use case initialization failed")
	}

	tokenUpsertUseCase := uc_token.NewTokenUpsertByUserIDUseCase(cfg, logger, tokenRepo)
	if tokenUpsertUseCase == nil {
		logger.Error("failed to initialize token upsert use case")
		log.Fatal("Token upsert use case initialization failed")
	}
	logger.Debug("use cases initialized")

	// Initialize refresh token service with error checking
	refreshService := svc_token.NewRefreshTokenService(
		cfg,
		logger,
		refreshTokenUseCase,
		tokenGetUseCase,
		tokenUpsertUseCase,
	)
	if refreshService == nil {
		logger.Error("failed to initialize refresh service")
		log.Fatal("Refresh service initialization failed")
	}
	logger.Debug("refresh service initialized")

	// Parse user ID with error checking
	userObjectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		logger.Error("invalid user ID format",
			slog.String("user_id", userID),
			slog.Any("error", err))
		log.Fatal(err)
	}

	// Create and execute refresh request
	request := &svc_token.RefreshRequest{
		UserID:       userObjectID,
		RefreshToken: refreshToken,
	}

	// Add debug logging before the refresh call
	logger.Debug("attempting token refresh",
		slog.String("user_id", userID),
		slog.String("refresh_token_length", fmt.Sprintf("%d", len(refreshToken))))

	response, err := refreshService.RefreshToken(context.Background(), request)
	if err != nil {
		logger.Error("token refresh failed",
			slog.String("user_id", userID),
			slog.Any("error", err))
		log.Fatal(err)
	}

	fmt.Printf("\nToken Refresh Successful\n")
	fmt.Printf("Access Token: %s\n", response.AccessToken)
	fmt.Printf("Refresh Token: %s\n", response.RefreshToken)
	fmt.Printf("Token Type: %s\n", response.TokenType)
	fmt.Printf("Expires In: %d seconds\n", response.ExpiresIn)
}
