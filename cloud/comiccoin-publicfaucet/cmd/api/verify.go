// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/api/verify.go
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
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/user"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/introspection"
	svc_introspection "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/introspection"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/user"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
)

func VerifyTokenCmd() *cobra.Command {
	var accessToken, userID string

	var cmd = &cobra.Command{
		Use:   "verify-token",
		Short: "Verify an access token's validity",
		Run: func(cmd *cobra.Command, args []string) {
			doRunVerifyToken(accessToken, userID)
		},
	}

	cmd.Flags().StringVarP(&accessToken, "access-token", "t", "", "Access token to verify")
	cmd.Flags().StringVarP(&userID, "user-id", "u", "", "User ID (optional)")
	cmd.MarkFlagRequired("access-token")

	return cmd
}

func doRunVerifyToken(accessToken, userID string) {
	// Setup dependencies
	logger := logger.NewProvider()
	originalCfg := config.NewProviderUsingEnvironmentVariables()
	cfg := &common_oauth_config.Configuration{
		OAuth: common_oauth_config.OAuthConfig{
			ServerURL:    originalCfg.OAuth.ServerURL,
			ClientID:     originalCfg.OAuth.ClientID,
			ClientSecret: originalCfg.OAuth.ClientSecret,
			RedirectURI:  originalCfg.OAuth.RedirectURI,
		},
		DB: common_oauth_config.DBConfig{
			URI:  originalCfg.DB.URI,
			Name: originalCfg.DB.Name,
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

	userRepo := r_user.NewRepository(cfg, logger, dbClient)
	logger.Debug("user repository initialized")

	// Initialize all use cases with debug logging
	introspectTokenUseCase := uc_oauth.NewIntrospectTokenUseCase(cfg, logger, oauthRepo)
	tokenGetUseCase := uc_token.NewTokenGetByUserIDUseCase(cfg, logger, tokenRepo)
	userGetByIDUseCase := uc_user.NewUserGetByIDUseCase(cfg, logger, userRepo)
	tokenGetByUserIDUseCase := uc_token.NewTokenGetByUserIDUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	tokenUpsertByUserIDUseCase := uc_token.NewTokenUpsertByUserIDUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	refreshTokenUseCase := uc_oauth.NewRefreshTokenUseCase(
		cfg,
		logger,
		oauthRepo,
	)

	// Add debug token lookup
	if userID != "" {
		userObjectID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			logger.Error("invalid user ID format",
				slog.String("user_id", userID),
				slog.Any("error", err))
		} else {
			token, err := tokenGetUseCase.Execute(context.Background(), userObjectID)
			if err != nil {
				logger.Error("failed to get token",
					slog.String("user_id", userID),
					slog.Any("error", err))
			} else if token != nil {
				logger.Info("found stored token",
					slog.String("user_id", userID),
					slog.String("access_token", token.AccessToken),
					slog.Time("expires_at", token.ExpiresAt))
			} else {
				logger.Warn("no token found for user",
					slog.String("user_id", userID))
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
		tokenGetByUserIDUseCase,
		tokenUpsertByUserIDUseCase,
		refreshTokenUseCase,
		userGetByIDUseCase,
	)

	// Create request
	req := &introspection.IntrospectionRequest{
		Token:  accessToken,
		UserID: userID,
	}
	// Verify token
	resp, err := introspectionService.IntrospectToken(context.Background(), req)
	if err != nil {
		logger.Error("failed to verify token",
			slog.String("access_token", accessToken),
			slog.String("user_id", userID),
			slog.Any("error", err))
		log.Fatal(err)
	}

	// Print Results
	fmt.Printf("\nToken Verification Results\n")
	fmt.Printf("User ID: %s\n", resp.UserID)
	fmt.Printf("Email: %v\n", resp.Email)
	fmt.Printf("FirstName At: %v\n", resp.FirstName)
	fmt.Printf("LastName: %v\n", resp.LastName)
	if !resp.Active {
		fmt.Printf("\nWarning: Token is not active!\n")
		return
	}

	fmt.Printf("\nToken is valid and active\n")
}
