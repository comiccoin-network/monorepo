package publicfaucet

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/emailer/mailgun"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/random"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/nameservice/repo/templatedemailer"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/user"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/repo/user"
	uc_emailer "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/emailer"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

var (
	flagEmail                 string
	flagPassword              string
	flagPasswordConfirm       string
	flagFirstName             string
	flagLastName              string
	flagPhone                 string
	flagCountry               string
	flagCountryOther          string
	flagTimezone              string
	flagAgreeTerms            bool
	flagAgreePromotions       bool
	flagWalletAddress         string
	flagPreVerified           bool
	flagSkipVerificationEmail bool
)

// Usage:
// Standard usage with email verification:
// go run main.go publicfaucet create-user --email=user@example.com --password=password123 --password-confirm=password123 --first-name=John --last-name=Doe --phone="+12345678901" --country="United States" --timezone="America/New_York" --agree-terms=true --wallet-address=0x1234567890123456789012345678901234567890
//
// To create a pre-verified user (no email verification needed):
// go run main.go publicfaucet create-user --email=user@example.com --password=password123 --password-confirm=password123 --first-name=John --last-name=Doe --phone="+12345678901" --country="United States" --timezone="America/New_York" --agree-terms=true --wallet-address=0x1234567890123456789012345678901234567890 --pre-verified

func GetCreateUserCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "create-user",
		Short: "Create a new user for the public faucet",
		Run: func(cmd *cobra.Command, args []string) {
			doRunCreateUser()
		},
	}

	// Register required flags
	cmd.Flags().StringVar(&flagEmail, "email", "", "User's email address")
	cmd.MarkFlagRequired("email")

	cmd.Flags().StringVar(&flagPassword, "password", "", "User's password")
	cmd.MarkFlagRequired("password")

	cmd.Flags().StringVar(&flagPasswordConfirm, "password-confirm", "", "Confirm password")
	cmd.MarkFlagRequired("password-confirm")

	cmd.Flags().StringVar(&flagFirstName, "first-name", "", "User's first name")
	cmd.MarkFlagRequired("first-name")

	cmd.Flags().StringVar(&flagLastName, "last-name", "", "User's last name")
	cmd.MarkFlagRequired("last-name")

	cmd.Flags().StringVar(&flagPhone, "phone", "", "User's phone number")
	cmd.MarkFlagRequired("phone")

	cmd.Flags().StringVar(&flagCountry, "country", "", "User's country")
	cmd.MarkFlagRequired("country")

	cmd.Flags().StringVar(&flagCountryOther, "country-other", "", "User's country (if not in standard list)")

	cmd.Flags().StringVar(&flagTimezone, "timezone", "", "User's timezone")
	cmd.MarkFlagRequired("timezone")

	cmd.Flags().BoolVar(&flagAgreeTerms, "agree-terms", false, "User agrees to terms of service")
	cmd.Flags().BoolVar(&flagAgreePromotions, "agree-promotions", false, "User agrees to receive promotions")

	cmd.Flags().StringVar(&flagWalletAddress, "wallet-address", "", "User's ComicCoin wallet address (Ethereum format)")
	cmd.MarkFlagRequired("wallet-address")

	cmd.Flags().BoolVar(&flagPreVerified, "pre-verified", false, "Mark the user as already verified (no email verification needed)")
	cmd.Flags().BoolVar(&flagSkipVerificationEmail, "skip-verification-email", false, "Skip sending verification email")

	return cmd
}

func doRunCreateUser() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)
	passp := password.NewProvider()

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

	// Validate password confirmation
	if flagPassword != flagPasswordConfirm {
		logger.Error("Passwords do not match")
		log.Fatalf("Passwords do not match")
	}

	// Repository
	userRepo := r_user.NewRepository(cfg, logger, dbClient)

	// Use-case
	userCreateUseCase := uc_user.NewUserCreateUseCase(
		cfg,
		logger,
		userRepo,
	)

	sendUserVerificationEmailUseCase := uc_emailer.NewSendUserVerificationEmailUseCase(
		cfg,
		logger,
		templatedEmailer,
	)

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
		// Create a secure string from the password
		securePassword, err := sstring.NewSecureString(flagPassword)
		if err != nil {
			logger.Error("password securing error", slog.Any("err", err))
			return nil, err
		}

		// Generate password hash
		passwordHash, err := passp.GenerateHashFromPassword(securePassword)
		if err != nil {
			logger.Error("hashing error", slog.Any("error", err))
			return nil, err
		}

		// Generate email verification code
		emailVerificationCode, err := random.GenerateSixDigitCode()
		if err != nil {
			logger.Error("generating email verification code error", slog.Any("error", err))
			return nil, err
		}

		// Create user ID
		userID := primitive.NewObjectID()

		// Convert `flagWalletAddress` to ethereum address for our app.
		ethereumAddress := common.HexToAddress(strings.ToLower(flagWalletAddress))

		// Build user object
		newUser := &user.User{
			ID:                      userID,
			FirstName:               flagFirstName,
			LastName:                flagLastName,
			Name:                    fmt.Sprintf("%s %s", flagFirstName, flagLastName),
			LexicalName:             fmt.Sprintf("%s, %s", flagLastName, flagFirstName),
			Email:                   flagEmail,
			PasswordHash:            passwordHash,
			PasswordHashAlgorithm:   passp.AlgorithmName(),
			Role:                    user.UserRoleCustomer,
			Phone:                   flagPhone,
			Country:                 flagCountry,
			Timezone:                flagTimezone,
			AgreeTermsOfService:     flagAgreeTerms,
			AgreePromotions:         flagAgreePromotions,
			CreatedByUserID:         userID,
			CreatedAt:               time.Now(),
			CreatedByName:           fmt.Sprintf("%s %s", flagFirstName, flagLastName),
			CreatedFromIPAddress:    "127.0.0.1", // CLI command, using localhost
			ModifiedByUserID:        userID,
			ModifiedAt:              time.Now(),
			ModifiedByName:          fmt.Sprintf("%s %s", flagFirstName, flagLastName),
			ModifiedFromIPAddress:   "127.0.0.1",     // CLI command, using localhost
			WasEmailVerified:        flagPreVerified, // Set verification status based on flag
			EmailVerificationCode:   fmt.Sprintf("%s", emailVerificationCode),
			EmailVerificationExpiry: time.Now().Add(72 * time.Hour),
			Status:                  user.UserStatusActive,
			ChainID:                 cfg.Blockchain.ChainID,
			WalletAddress:           &ethereumAddress,
		}

		// Apply country override if specified
		if flagCountryOther != "" {
			newUser.Country = flagCountryOther
		}

		// Create the user
		err = userCreateUseCase.Execute(sessCtx, newUser)
		if err != nil {
			logger.Error("database create error", slog.Any("error", err))
			return nil, err
		}

		// Send verification email only if user is not pre-verified and email sending is not skipped
		if !newUser.WasEmailVerified && !flagSkipVerificationEmail {
			logger.Info("Sending verification email to user",
				slog.String("email", newUser.Email),
				slog.String("verification_code", newUser.EmailVerificationCode))

			err = sendUserVerificationEmailUseCase.Execute(context.Background(), newUser)
			if err != nil {
				logger.Error("failed sending verification email with error", slog.Any("err", err))
				// Don't fail the transaction if email sending fails
			} else {
				logger.Info("Verification email sent successfully")
			}
		} else {
			logger.Info("Skipping verification email",
				slog.Bool("pre_verified", newUser.WasEmailVerified),
				slog.Bool("skip_email", flagSkipVerificationEmail))
		}

		logger.Info("User created successfully",
			slog.Any("id", newUser.ID),
			slog.String("email", newUser.Email),
			slog.String("name", newUser.Name),
			slog.Bool("verified", newUser.WasEmailVerified))

		return newUser, nil
	}

	// Start a transaction
	res, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		logger.Error("session failed error",
			slog.Any("error", err))
		log.Fatalf("Failed creating user: %v\n", err)
	}

	createdUser := res.(*user.User)

	logger.Debug("User created successfully",
		slog.Any("id", createdUser.ID),
		slog.String("email", createdUser.Email),
		slog.String("name", createdUser.Name))

	fmt.Printf("User created successfully:\n")
	fmt.Printf("  ID: %s\n", createdUser.ID.Hex())
	fmt.Printf("  Email: %s\n", createdUser.Email)
	fmt.Printf("  Name: %s\n", createdUser.Name)
	fmt.Printf("  Wallet Address: %s\n", createdUser.WalletAddress.Hex())
	fmt.Printf("  Email Verified: %t\n", createdUser.WasEmailVerified)

	if !createdUser.WasEmailVerified && !flagSkipVerificationEmail {
		fmt.Printf("  Verification email sent. User needs to verify their email.\n")
	} else if !createdUser.WasEmailVerified && flagSkipVerificationEmail {
		fmt.Printf("  Verification email not sent. Verification code: %s\n", createdUser.EmailVerificationCode)
	} else {
		fmt.Printf("  User is pre-verified, no verification needed.\n")
	}
}
