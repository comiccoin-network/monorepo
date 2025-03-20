package publicfaucet

import (
	"context"
	"log"
	"log/slog"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/emailer/mailgun"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/repo/templatedemailer"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/repo/user"
	svc_gateway "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/gateway"
	uc_emailer "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/emailer"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

// Usage:
// go run main.go publicfaucet delete-user --email=xxx@yyy.com
//

func SendVerifyEmailCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "send-verify-email",
		Short: "Send verification code to email",
		Run: func(cmd *cobra.Command, args []string) {
			doRunSendVerifyEmailByEmail()
		},
	}

	cmd.Flags().StringVar(&flagEmailAddress, "email", "", "The email value to lookup the account by")
	cmd.MarkFlagRequired("email")

	return cmd
}

func doRunSendVerifyEmailByEmail() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)

	mailgunConfigurationProvider := mailgun.NewMailgunConfigurationProvider(
		cfg.PublicFaucetEmailer.SenderEmail,
		cfg.PublicFaucetEmailer.Domain,
		cfg.PublicFaucetEmailer.APIBase,
		cfg.PublicFaucetEmailer.MaintenanceEmail,
		cfg.PublicFaucetEmailer.FrontendDomain,
		cfg.PublicFaucetEmailer.BackendDomain,
		cfg.PublicFaucetEmailer.APIKey,
	)
	emailer := mailgun.NewEmailer(mailgunConfigurationProvider, logger)
	templatedEmailer := templatedemailer.NewTemplatedEmailer(logger, emailer)

	// Repository
	userRepo := r_user.NewRepository(cfg, logger, dbClient)

	// Use-case
	userGetByEmailUseCase := uc_user.NewUserGetByEmailUseCase(
		cfg,
		logger,
		userRepo,
	)

	sendUserVerificationEmailUseCase := uc_emailer.NewSendUserVerificationEmailUseCase(
		cfg,
		logger,
		templatedEmailer,
	)

	// Service

	gatewaySendVerifyEmailService := svc_gateway.NewGatewaySendVerifyEmailService(
		logger,
		userGetByEmailUseCase,
		sendUserVerificationEmailUseCase,
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
		ido := &svc_gateway.GatewaySendVerifyEmailRequestIDO{
			Email: flagEmailAddress,
		}
		err := gatewaySendVerifyEmailService.Execute(sessCtx, ido)
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

	logger.Debug("Sent email verification")
}
