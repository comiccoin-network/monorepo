// github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/iam/createadmin.go
package iam

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"time"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/repo/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

// Command flags
var (
	flagAdminEmail           string
	flagAdminPassword        string
	flagAdminPasswordConfirm string
	flagAdminFirstName       string
	flagAdminLastName        string
	flagAdminPhone           string
	flagAdminCountry         string
	flagAdminRegion          string
	flagAdminTimezone        string
	flagAdminPreVerified     bool
)

func GetCreateAdminUserCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "create-admin",
		Short: "Create a new administrator user with root privileges",
		Run: func(cmd *cobra.Command, args []string) {
			doRunCreateAdminUser()
		},
	}

	// Register required flags
	cmd.Flags().StringVar(&flagAdminEmail, "email", "", "Admin user's email address")
	cmd.MarkFlagRequired("email")

	cmd.Flags().StringVar(&flagAdminPassword, "password", "", "Admin user's password")
	cmd.MarkFlagRequired("password")

	cmd.Flags().StringVar(&flagAdminPasswordConfirm, "password-confirm", "", "Confirm password")
	cmd.MarkFlagRequired("password-confirm")

	cmd.Flags().StringVar(&flagAdminFirstName, "first-name", "", "Admin user's first name")
	cmd.MarkFlagRequired("first-name")

	cmd.Flags().StringVar(&flagAdminLastName, "last-name", "", "Admin user's last name")
	cmd.MarkFlagRequired("last-name")

	cmd.Flags().StringVar(&flagAdminPhone, "phone", "", "Admin user's phone number")
	cmd.MarkFlagRequired("phone")

	cmd.Flags().StringVar(&flagAdminCountry, "country", "", "Admin user's country")
	cmd.MarkFlagRequired("country")

	cmd.Flags().StringVar(&flagAdminRegion, "region", "", "Admin user's region")
	cmd.MarkFlagRequired("region")

	cmd.Flags().StringVar(&flagAdminTimezone, "timezone", "", "Admin user's timezone")
	cmd.MarkFlagRequired("timezone")

	cmd.Flags().BoolVar(&flagAdminPreVerified, "pre-verified", true, "Mark admin as already verified (defaults to true)")

	return cmd
}

func doRunCreateAdminUser() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)
	passp := password.NewProvider()

	// Validate password confirmation
	if flagAdminPassword != flagAdminPasswordConfirm {
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
		// Check if admin email already exists
		exists, err := userRepo.CheckIfExistsByEmail(sessCtx, flagAdminEmail)
		if err != nil {
			logger.Error("Failed checking if email exists", slog.Any("error", err))
			return nil, err
		}
		if exists {
			logger.Error("Admin with email already exists", slog.String("email", flagAdminEmail))
			return nil, fmt.Errorf("admin with email %s already exists", flagAdminEmail)
		}

		// Create a secure string from the password
		securePassword, err := sstring.NewSecureString(flagAdminPassword)
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

		// Create user ID
		userID := primitive.NewObjectID()

		// Build user object
		adminUser := &user.User{
			ID:                        userID,
			FirstName:                 flagAdminFirstName,
			LastName:                  flagAdminLastName,
			Name:                      fmt.Sprintf("%s %s", flagAdminFirstName, flagAdminLastName),
			LexicalName:               fmt.Sprintf("%s, %s", flagAdminLastName, flagAdminFirstName),
			Email:                     flagAdminEmail,
			PasswordHash:              passwordHash,
			PasswordHashAlgorithm:     passp.AlgorithmName(),
			Role:                      user.UserRoleRoot, // Set as Root/Admin user
			Phone:                     flagAdminPhone,
			Country:                   flagAdminCountry,
			Region:                    flagAdminRegion,
			Timezone:                  flagAdminTimezone,
			WasEmailVerified:          flagAdminPreVerified, // Admin is automatically verified
			AgreeTermsOfService:       true,                 // Admin users implicitly agree
			CreatedByUserID:           userID,
			CreatedAt:                 time.Now(),
			CreatedByName:             fmt.Sprintf("%s %s", flagAdminFirstName, flagAdminLastName),
			CreatedFromIPAddress:      "127.0.0.1", // CLI command, using localhost
			ModifiedByUserID:          userID,
			ModifiedAt:                time.Now(),
			ModifiedByName:            fmt.Sprintf("%s %s", flagAdminFirstName, flagAdminLastName),
			ModifiedFromIPAddress:     "127.0.0.1", // CLI command, using localhost
			Status:                    user.UserStatusActive,
			ChainID:                   cfg.Blockchain.ChainID,
			ProfileVerificationStatus: user.UserProfileVerificationStatusApproved, // Admin is pre-approved
		}

		// Create the user
		err = userCreateUseCase.Execute(sessCtx, adminUser)
		if err != nil {
			logger.Error("database create error", slog.Any("error", err))
			return nil, err
		}

		logger.Info("Admin user created successfully",
			slog.Any("id", adminUser.ID),
			slog.String("email", adminUser.Email),
			slog.String("name", adminUser.Name))

		return adminUser, nil
	}

	// Start a transaction
	res, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		logger.Error("session failed error",
			slog.Any("error", err))
		log.Fatalf("Failed creating admin user: %v\n", err)
	}

	createdUser := res.(*user.User)

	logger.Debug("Admin user created successfully",
		slog.Any("id", createdUser.ID),
		slog.String("email", createdUser.Email),
		slog.String("name", createdUser.Name))

	fmt.Printf("Admin user created successfully:\n")
	fmt.Printf("  ID: %s\n", createdUser.ID.Hex())
	fmt.Printf("  Email: %s\n", createdUser.Email)
	fmt.Printf("  Name: %s\n", createdUser.Name)
	fmt.Printf("  Role: Root/Admin (1)\n")
	fmt.Printf("  Status: Active\n")
}
