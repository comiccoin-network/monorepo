package publicfaucet

import (
	"context"
	"log"
	"log/slog"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/repo/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

var (
	flagEmailAddress string
)

// Usage:
// go run main.go publicfaucet delete-user --email=xxx@yyy.com
//

func GetDeleteUserCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "delete-user",
		Short: "Delete user by email",
		Run: func(cmd *cobra.Command, args []string) {
			doRunDeleteUserByEmail()
		},
	}

	cmd.Flags().StringVar(&flagEmailAddress, "email", "", "The email value to lookup the account by")
	cmd.MarkFlagRequired("email")

	return cmd
}

func doRunDeleteUserByEmail() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)

	// Repository
	userRepo := r_user.NewRepository(cfg, logger, dbClient)

	// Use-case
	userDeleteUserByEmailUseCase := uc_user.NewUserDeleteUserByEmailUseCase(
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

	logger.Debug("Deleting user...",
		slog.Any("email", flagEmailAddress))

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		err := userDeleteUserByEmailUseCase.Execute(sessCtx, flagEmailAddress)
		if err != nil {
			return nil, err
		}

		return nil, nil
	}

	// Start a transaction
	if _, err := session.WithTransaction(ctx, transactionFunc); err != nil {
		logger.Error("session failed error",
			slog.Any("error", err))
		log.Fatalf("Failed getting account: %v\n", err)
	}

	logger.Debug("User deleted")
}
