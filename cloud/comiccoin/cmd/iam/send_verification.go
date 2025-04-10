// github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/iam/send_verification.go
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
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/emailer/mailgun"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/random"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/repo/templatedemailer"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/repo/user"
	uc_emailer "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/emailer"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

var (
	flagVerificationEmail string
	flagGenerateNewCode   bool
)

func SendVerificationCodeCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "send-verification",
		Short: "Send verification code to a user's email address",
		Run: func(cmd *cobra.Command, args []string) {
			doRunSendVerificationCode()
		},
	}

	// Register required flags
	cmd.Flags().StringVar(&flagVerificationEmail, "email", "", "The email address to send verification code to")
	cmd.MarkFlagRequired("email")

	// Optional flag to generate a new code
	cmd.Flags().BoolVar(&flagGenerateNewCode, "new-code", false, "Generate a new verification code instead of using existing one")

	return cmd
}

func doRunSendVerificationCode() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)

	// Set up emailer
	mailgunConfigurationProvider := mailgun.NewMailgunConfigurationProvider(
		cfg.IAMEmailer.SenderEmail,
		cfg.IAMEmailer.Domain,
		cfg.IAMEmailer.APIBase,
		cfg.IAMEmailer.MaintenanceEmail,
		cfg.IAMEmailer.FrontendDomain,
		cfg.IAMEmailer.BackendDomain,
		cfg.IAMEmailer.APIKey,
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
	userUpdateUseCase := uc_user.NewUserUpdateUseCase(
		cfg,
		logger,
		userRepo,
	)
	sendUserVerificationEmailUseCase := uc_emailer.NewSendUserVerificationEmailUseCase(
		cfg,
		logger,
		templatedEmailer,
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
		foundUser, err := userGetByEmailUseCase.Execute(sessCtx, flagVerificationEmail)
		if err != nil {
			logger.Error("failed to get user by email", slog.Any("error", err))
			return nil, err
		}

		if foundUser == nil {
			return nil, fmt.Errorf("user with email %s not found", flagVerificationEmail)
		}

		// Check if user is already verified
		if foundUser.WasEmailVerified {
			return nil, fmt.Errorf("user with email %s is already verified", flagVerificationEmail)
		}

		// Generate a new verification code if requested or if the current one is missing
		if flagGenerateNewCode || foundUser.EmailVerificationCode == "" {
			// Generate a new 6-digit code
			verificationCode, err := random.GenerateSixDigitCode()
			if err != nil {
				logger.Error("failed to generate verification code", slog.Any("error", err))
				return nil, err
			}

			// Update the user with the new code
			foundUser.EmailVerificationCode = verificationCode
			foundUser.EmailVerificationExpiry = time.Now().Add(72 * time.Hour) // 3 days expiry
			foundUser.ModifiedAt = time.Now()

			err = userUpdateUseCase.Execute(sessCtx, foundUser)
			if err != nil {
				logger.Error("failed to update user", slog.Any("error", err))
				return nil, err
			}

			logger.Info("generated new verification code",
				slog.String("email", foundUser.Email),
				slog.String("code", foundUser.EmailVerificationCode))
		}

		// Send the verification email
		err = sendUserVerificationEmailUseCase.Execute(ctx, foundUser)
		if err != nil {
			logger.Error("failed to send verification email", slog.Any("error", err))
			return nil, err
		}

		return foundUser, nil
	}

	// Execute the transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		logger.Error("transaction failed", slog.Any("error", err))
		log.Fatalf("Failed to send verification code: %v\n", err)
	}

	// Get the user from the result
	u := result.(*user.User)

	// Display success message
	fmt.Printf("\nVerification code sent successfully!\n")
	fmt.Printf("Email: %s\n", u.Email)
	fmt.Printf("Name: %s\n", u.Name)
	fmt.Printf("Verification Code: %s\n", u.EmailVerificationCode)
	fmt.Printf("Expiry: %s\n", u.EmailVerificationExpiry.Format(time.RFC3339))
	fmt.Printf("\nThe user should check their email and use this code to verify their account.\n")
}
