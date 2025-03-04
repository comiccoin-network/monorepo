// github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/publicfaucet/list_users.go
package publicfaucet

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
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/repo/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

// Usage:
// go run main.go publicfaucet list-users

func GetListUsersCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "list-users",
		Short: "List all users",
		Run: func(cmd *cobra.Command, args []string) {
			doRunListUsers()
		},
	}
	return cmd
}

func doRunListUsers() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)

	// Repository
	userRepo := r_user.NewRepository(cfg, logger, dbClient)

	// Use-case
	userListAllUseCase := uc_user.NewUserListAllUseCase(
		cfg,
		logger,
		userRepo,
	)

	////
	//// Start the transaction.
	////
	ctx := context.Background()

	session, err := dbClient.StartSession()
	if err != nil {
		logger.Error("start session error",
			slog.Any("error", err))
		log.Fatalf("Failed executing: %v\n", err)
	}
	defer session.EndSession(ctx)

	logger.Debug("Listing all users...")

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		users, err := userListAllUseCase.Execute(sessCtx)
		if err != nil {
			return nil, err
		}

		// Display results
		fmt.Printf("Total users found: %d\n\n", len(users))
		for _, user := range users {
			fmt.Printf("User ID: %s\n", user.ID.Hex())
			fmt.Printf("Name: %s\n", user.Name)
			fmt.Printf("Email: %s\n", user.Email)
			if user.WalletAddress != nil {
				fmt.Printf("Wallet Address: %s\n", user.WalletAddress.Hex())
			}
			fmt.Printf("Total Coins Claimed: %d\n", user.TotalCoinsClaimed)
			fmt.Printf("Status: %d\n", user.Status)
			fmt.Printf("Created At: %s\n", user.CreatedAt.Format(time.RFC3339))
			fmt.Printf("Last Modified At: %s\n", user.ModifiedAt.Format(time.RFC3339))
			fmt.Println("----------------------------------------")
		}

		return nil, nil
	}

	// Start a transaction
	if _, err := session.WithTransaction(ctx, transactionFunc); err != nil {
		logger.Error("session failed error",
			slog.Any("error", err))
		log.Fatalf("Failed listing users: %v\n", err)
	}

	logger.Debug("Users listed successfully")
}
