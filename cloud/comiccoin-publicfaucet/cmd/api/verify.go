// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/api/verify.go
package api

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	r_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/oauth"
	r_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/token"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/repo/user"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/introspection"
	svc_introspection "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/introspection"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/oauth"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/user"
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
	cfg := config.NewProviderUsingEnvironmentVariables()
	logger.Debug("configuration ready")

	// Initialize MongoDB client
	dbClient := mongodb.NewProvider(cfg, logger)
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
	if introspectTokenUseCase == nil {
		logger.Error("failed to initialize introspect token use case")
		log.Fatal("introspect token use case is nil")
	}
	logger.Debug("introspect token use case initialized")

	tokenGetUseCase := uc_token.NewTokenGetByUserIDUseCase(cfg, logger, tokenRepo)
	if tokenGetUseCase == nil {
		logger.Error("failed to initialize token get use case")
		log.Fatal("token get use case is nil")
	}
	logger.Debug("token get use case initialized")

	userGetByIDUseCase := uc_user.NewUserGetByIDUseCase(cfg, logger, userRepo)
	if userGetByIDUseCase == nil {
		logger.Error("failed to initialize user get use case")
		log.Fatal("user get use case is nil")
	}
	logger.Debug("user get use case initialized")

	// Initialize introspection service with null checks
	introspectionService := svc_introspection.NewIntrospectionService(
		cfg,
		logger,
		introspectTokenUseCase,
		tokenGetUseCase,
		userGetByIDUseCase,
	)
	if introspectionService == nil {
		logger.Error("failed to initialize introspection service")
		log.Fatal("introspection service is nil")
	}
	logger.Debug("introspection service initialized")

	// Create request with logging
	req := &introspection.IntrospectionRequest{
		AccessToken: accessToken,
		UserID:      userID,
	}
	logger.Debug("created introspection request",
		slog.String("access_token", accessToken),
		slog.String("user_id", userID))

	// Verify token with more context in logs
	resp, err := introspectionService.IntrospectToken(context.Background(), req)
	if err != nil {
		logger.Error("failed to verify token",
			slog.String("access_token", accessToken),
			slog.String("user_id", userID),
			slog.Any("error", err))
		log.Fatal(err)
	}

	// Print verification results
	fmt.Printf("\nToken Verification Results\n")
	fmt.Printf("Active: %v\n", resp.Active)
	fmt.Printf("Scope: %s\n", resp.Scope)
	fmt.Printf("Client ID: %s\n", resp.ClientID)
	fmt.Printf("Expires At: %v\n", resp.ExpiresAt)
	fmt.Printf("Issued At: %v\n", resp.IssuedAt)

	if resp.User != nil {
		fmt.Printf("\nUser Information:\n")
		fmt.Printf("User ID: %s\n", resp.User.ID.Hex())
		fmt.Printf("Email: %s\n", resp.User.Email)
		fmt.Printf("Name: %s %s\n", resp.User.FirstName, resp.User.LastName)
		if resp.RequiresOTP {
			fmt.Printf("2FA Status: Requires verification\n")
		}
	}

	// Print token status
	if !resp.Active {
		fmt.Printf("\nWarning: Token is not active!\n")
	} else {
		fmt.Printf("\nToken is valid and active\n")
	}
}
