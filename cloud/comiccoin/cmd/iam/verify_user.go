// github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/iam/verify_user.go
package iam

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"time"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/repo/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

var (
	flagVerifyUserEmail string
)

func VerifyUserEmailCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "verify-user",
		Short: "Manually verify a user's email address",
		Run: func(cmd *cobra.Command, args []string) {
			doRunVerifyUserEmail()
		},
	}

	// Register required flags
	cmd.Flags().StringVar(&flagVerifyUserEmail, "email", "", "The email address to verify")
	cmd.MarkFlagRequired("email")

	return cmd
}

func doRunVerifyUserEmail() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)

	// Repository
	userRepo := r_user.NewRepository(cfg, logger, dbClient)

	// Use-case
	userGetByEmailUseCase := uc_user.NewUserGetByEmailUseCase(
		cfg,
		logger,
		userRepo,
	)
	userUpdateUseCase := uc_user.NewUserUpdateUseCase(
		cfg,
		logger,
		userRepo,
	)

	// Context
	ctx := context.Background()

	// Start the transaction
	session, err := dbClient.StartSession()
	if err != nil {
		logger.Error("start session error",
			slog.Any("error", err))
		log.Fatalf("Failed executing: %v\n", err)
	}
	defer session.EndSession(ctx)

	// Define a transaction function
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		// Find the user by email
		foundUser, err := userGetByEmailUseCase.Execute(sessCtx, flagVerifyUserEmail)
		if err != nil {
			logger.Error("failed to get user by email", slog.Any("error", err))
			return nil, err
		}

		if foundUser == nil {
			return nil, fmt.Errorf("user with email %s not found", flagVerifyUserEmail)
		}

		// Check if user is already verified
		if foundUser.WasEmailVerified {
			return nil, fmt.Errorf("user with email %s is already verified", flagVerifyUserEmail)
		}

		// Update the user to be verified
		foundUser.WasEmailVerified = true
		foundUser.ModifiedAt = time.Now()

		err = userUpdateUseCase.Execute(sessCtx, foundUser)
		if err != nil {
			logger.Error("failed to update user", slog.Any("error", err))
			return nil, err
		}

		return foundUser, nil
	}

	// Execute the transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		logger.Error("transaction failed", slog.Any("error", err))
		log.Fatalf("Failed to verify user: %v\n", err)
	}

	// Get the user from the result
	u := result.(*user.User)

	// Display success message
	fmt.Printf("\nUser verified successfully!\n")
	fmt.Printf("Email: %s\n", u.Email)
	fmt.Printf("Name: %s\n", u.Name)
	fmt.Printf("Email Verified: %v\n", u.WasEmailVerified)
	fmt.Printf("Modified At: %s\n", u.ModifiedAt.Format(time.RFC3339))
	fmt.Printf("\nThe user can now log in without email verification.\n")
}
