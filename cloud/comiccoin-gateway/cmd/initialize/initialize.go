// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/initialize/initialize.go
package initialize

import (
	"context"
	"log"
	"log/slog"
	"os"
	"time"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/logger"
	passwordp "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	repo_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/federatedidentity"
	sv_gateway "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/service/gateway"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/federatedidentity"
)

var (
	flagEmail    string
	flagPassword string
)

func InitCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "init",
		Short: "Initialize the application",
		Run: func(cmd *cobra.Command, args []string) {
			doRunGatewayInit()
		},
	}
	cmd.Flags().StringVar(&flagEmail, "email", "", "The email of the administrator")
	cmd.MarkFlagRequired("email")
	cmd.Flags().StringVar(&flagPassword, "password", "", "The password of the administrators account")
	cmd.MarkFlagRequired("password")

	return cmd
}

func getEnv(key string, required bool) string {
	value := os.Getenv(key)
	if required && value == "" {
		log.Fatalf("Environment variable not found: %s", key)
	}
	return value
}

func doRunGatewayInit() {
	//
	// STEP 1
	// Load up our dependencies and configuration
	//

	// Common
	logger := logger.NewProvider()
	// kmutex := kmutexutil.NewKMutexProvider()
	cfg := &config.Configuration{
		DB: config.DBConfig{
			URI:  getEnv("COMICCOIN_GATEWAY_DB_URI", true),
			Name: getEnv("COMICCOIN_GATEWAY_DB_NAME", true),
		},
	}
	dbClient := mongodb.NewProvider(cfg, logger)
	passp := passwordp.NewProvider()
	// blackp := blacklist.NewProvider()

	//
	// Repository
	//

	federatedidentityRepo := repo_federatedidentity.NewRepository(cfg, logger, dbClient)

	// //
	// // Use-case
	// //
	//
	//
	// FederatedIdentity
	federatedidentityGetByEmailUseCase := uc_federatedidentity.NewFederatedIdentityGetByEmailUseCase(
		cfg,
		logger,
		federatedidentityRepo,
	)
	federatedidentityCreateUseCase := uc_federatedidentity.NewFederatedIdentityCreateUseCase(
		cfg,
		logger,
		federatedidentityRepo,
	)

	//
	// Service
	//

	initService := sv_gateway.NewGatewayInitService(
		cfg,
		logger,
		passp,
		federatedidentityGetByEmailUseCase,
		federatedidentityCreateUseCase,
	)

	// //
	// Interface.
	//

	// (Nothing...)

	//
	// Execute.
	//

	// Minor formatting of input.
	pass, err := sstring.NewSecureString(flagPassword)
	if err != nil {
		log.Fatalf("Failed securing flagPassword: %v\n", err)
	}

	// defer mnemonic.Wipe() // Developers Note: Commented out b/c they are causing the hang in the program to exit?

	////
	//// Start the transaction.
	////

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	session, err := dbClient.StartSession()

	if err != nil {
		logger.Error("start session error",
			slog.Any("error", err))
		log.Fatalf("Failed executing: %v\n", err)
	}

	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations

	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		logger.Debug("Transaction started")
		err := initService.Execute(sessCtx, flagEmail, pass)
		if err != nil {
			return nil, err
		}

		logger.Debug("Committing transaction")
		if err := sessCtx.CommitTransaction(ctx); err != nil {
			return nil, err
		}
		logger.Debug("Transaction committed")

		return nil, nil
	}

	// Start a transaction

	if _, err := session.WithTransaction(ctx, transactionFunc); err != nil {
		logger.Error("session failed error",
			slog.Any("error", err))
		log.Fatalf("Failed creating account: %v\n", err)
	}
}
