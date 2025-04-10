// github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/iam/delete_user.go
package iam

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/repo/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

var (
	flagDeleteUserID    string
	flagDeleteUserEmail string
	flagForceDelete     bool
)

func DeleteUserCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "delete-user",
		Short: "Delete a user from the system",
		Run: func(cmd *cobra.Command, args []string) {
			doRunDeleteUser()
		},
	}

	// Register flags - allow deletion by either ID or email
	cmd.Flags().StringVar(&flagDeleteUserID, "id", "", "User ID to delete")
	cmd.Flags().StringVar(&flagDeleteUserEmail, "email", "", "User email to delete")
	cmd.Flags().BoolVar(&flagForceDelete, "force", false, "Force deletion without confirmation prompt")

	return cmd
}

func doRunDeleteUser() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)

	// Validate inputs - require either ID or email, but not both
	if flagDeleteUserID == "" && flagDeleteUserEmail == "" {
		logger.Error("Either --id or --email must be specified")
		log.Fatalf("Error: Either --id or --email must be specified\n")
	}

	if flagDeleteUserID != "" && flagDeleteUserEmail != "" {
		logger.Error("Only one of --id or --email should be specified, not both")
		log.Fatalf("Error: Only one of --id or --email should be specified, not both\n")
	}

	// Repository and Use-case
	userRepo := r_user.NewRepository(cfg, logger, dbClient)
	userGetByIDUseCase := uc_user.NewUserGetByIDUseCase(cfg, logger, userRepo)
	userGetByEmailUseCase := uc_user.NewUserGetByEmailUseCase(cfg, logger, userRepo)
	userDeleteByIDUseCase := uc_user.NewUserDeleteByIDUseCase(cfg, logger, userRepo)

	// Context
	ctx := context.Background()

	// Start the transaction
	session, err := dbClient.StartSession()
	if err != nil {
		logger.Error("start session error", slog.Any("error", err))
		log.Fatalf("Failed executing: %v\n", err)
	}
	defer session.EndSession(ctx)

	// Define transaction function
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		var userID primitive.ObjectID
		var userName, userEmail string

		// Look up user by ID or email to get details and confirm existence
		if flagDeleteUserID != "" {
			// Convert string ID to ObjectID
			objectID, err := primitive.ObjectIDFromHex(flagDeleteUserID)
			if err != nil {
				logger.Error("Invalid ObjectID format", slog.Any("error", err))
				return nil, fmt.Errorf("invalid ObjectID format: %v", err)
			}

			user, err := userGetByIDUseCase.Execute(sessCtx, objectID)
			if err != nil {
				logger.Error("Error retrieving user", slog.Any("error", err))
				return nil, err
			}

			if user == nil {
				return nil, fmt.Errorf("user with ID %s not found", flagDeleteUserID)
			}

			userID = user.ID
			userName = user.Name
			userEmail = user.Email
		} else {
			user, err := userGetByEmailUseCase.Execute(sessCtx, flagDeleteUserEmail)
			if err != nil {
				logger.Error("Error retrieving user", slog.Any("error", err))
				return nil, err
			}

			if user == nil {
				return nil, fmt.Errorf("user with email %s not found", flagDeleteUserEmail)
			}

			userID = user.ID
			userName = user.Name
			userEmail = user.Email
		}

		// Unless force flag is set, prompt for confirmation
		if !flagForceDelete {
			fmt.Printf("\nWARNING: You are about to delete the following user:\n")
			fmt.Printf("ID: %s\n", userID.Hex())
			fmt.Printf("Name: %s\n", userName)
			fmt.Printf("Email: %s\n", userEmail)
			fmt.Printf("\nThis action cannot be undone. Are you sure? (y/N): ")

			var confirmation string
			fmt.Scanln(&confirmation)

			if confirmation != "y" && confirmation != "Y" {
				fmt.Println("User deletion cancelled.")
				return nil, fmt.Errorf("user deletion cancelled by administrator")
			}
		}

		// Delete the user
		err := userDeleteByIDUseCase.Execute(sessCtx, userID)
		if err != nil {
			logger.Error("Failed to delete user", slog.Any("error", err))
			return nil, err
		}

		return map[string]interface{}{
			"id":    userID.Hex(),
			"name":  userName,
			"email": userEmail,
		}, nil
	}

	// Execute transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		logger.Error("Transaction failed", slog.Any("error", err))
		log.Fatalf("Failed to delete user: %v\n", err)
	}

	// Display success message
	details := result.(map[string]interface{})
	fmt.Printf("\nUser deleted successfully!\n")
	fmt.Printf("ID: %s\n", details["id"])
	fmt.Printf("Name: %s\n", details["name"])
	fmt.Printf("Email: %s\n", details["email"])
}
