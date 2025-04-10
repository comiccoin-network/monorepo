// github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/iam/get_user.go
package iam

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/repo/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

// Command line argument flags
var (
	flagUserID    string
	flagUserEmail string
)

func GetUserCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "get-user",
		Short: "Get detailed information about a specific user",
		Run: func(cmd *cobra.Command, args []string) {
			doRunGetUser()
		},
	}

	// Register flags - allow lookup by either ID or email
	cmd.Flags().StringVar(&flagUserID, "id", "", "User ID to look up")
	cmd.Flags().StringVar(&flagUserEmail, "email", "", "User email to look up")

	return cmd
}

func doRunGetUser() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)

	// Validate inputs - require either ID or email, but not both
	if flagUserID == "" && flagUserEmail == "" {
		logger.Error("Either --id or --email must be specified")
		log.Fatalf("Error: Either --id or --email must be specified\n")
	}

	if flagUserID != "" && flagUserEmail != "" {
		logger.Error("Only one of --id or --email should be specified, not both")
		log.Fatalf("Error: Only one of --id or --email should be specified, not both\n")
	}

	// Repository and Use-case
	userRepo := r_user.NewRepository(cfg, logger, dbClient)
	userGetByIDUseCase := uc_user.NewUserGetByIDUseCase(cfg, logger, userRepo)
	userGetByEmailUseCase := uc_user.NewUserGetByEmailUseCase(cfg, logger, userRepo)

	// Context
	ctx := context.Background()

	// Set up transaction
	session, err := dbClient.StartSession()
	if err != nil {
		logger.Error("start session error", slog.Any("error", err))
		log.Fatalf("Failed executing: %v\n", err)
	}
	defer session.EndSession(ctx)

	// Define transaction function
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		var foundUser *user.User
		var err error

		// Look up user by ID or email
		if flagUserID != "" {
			// Convert string ID to ObjectID
			objectID, err := primitive.ObjectIDFromHex(flagUserID)
			if err != nil {
				logger.Error("Invalid ObjectID format", slog.Any("error", err))
				return nil, fmt.Errorf("invalid ObjectID format: %v", err)
			}
			foundUser, err = userGetByIDUseCase.Execute(sessCtx, objectID)
		} else {
			foundUser, err = userGetByEmailUseCase.Execute(sessCtx, flagUserEmail)
		}

		if err != nil {
			logger.Error("Error retrieving user", slog.Any("error", err))
			return nil, err
		}

		if foundUser == nil {
			return nil, fmt.Errorf("user not found")
		}

		return foundUser, nil
	}

	// Execute transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		logger.Error("Transaction failed", slog.Any("error", err))
		log.Fatalf("Failed to retrieve user: %v\n", err)
	}

	// Display user details
	u := result.(*user.User)
	displayUserDetails(u)
}

func displayUserDetails(u *user.User) {
	// Format role as a readable string
	roleStr := "Unknown"
	switch u.Role {
	case user.UserRoleRoot:
		roleStr = "Admin (Root)"
	case user.UserRoleCompany:
		roleStr = "Company"
	case user.UserRoleIndividual:
		roleStr = "Individual"
	}

	// Format status as a readable string
	statusStr := "Unknown"
	switch u.Status {
	case user.UserStatusActive:
		statusStr = "Active"
	case user.UserStatusLocked:
		statusStr = "Locked"
	case user.UserStatusArchived:
		statusStr = "Archived"
	}

	// Format profile verification status
	verificationStr := "Unknown"
	switch u.ProfileVerificationStatus {
	case user.UserProfileVerificationStatusUnverified:
		verificationStr = "Unverified"
	case user.UserProfileVerificationStatusSubmittedForReview:
		verificationStr = "Submitted for Review"
	case user.UserProfileVerificationStatusApproved:
		verificationStr = "Approved"
	case user.UserProfileVerificationStatusRejected:
		verificationStr = "Rejected"
	}

	// Display user details
	fmt.Println("\n===== User Details =====")
	fmt.Printf("ID: %s\n", u.ID.Hex())
	fmt.Printf("Name: %s\n", u.Name)
	fmt.Printf("Email: %s\n", u.Email)
	fmt.Printf("Role: %s\n", roleStr)
	fmt.Printf("Status: %s\n", statusStr)
	fmt.Printf("Created: %s\n", u.CreatedAt.Format(time.RFC3339))
	fmt.Printf("Last Modified: %s\n", u.ModifiedAt.Format(time.RFC3339))
	fmt.Printf("Email Verified: %v\n", u.WasEmailVerified)
	fmt.Printf("Profile Verification: %s\n", verificationStr)

	// Contact Information
	fmt.Println("\n--- Contact Information ---")
	fmt.Printf("Phone: %s\n", u.Phone)
	fmt.Printf("Country: %s\n", u.Country)
	fmt.Printf("Region: %s\n", u.Region)
	fmt.Printf("City: %s\n", u.City)
	fmt.Printf("Address: %s %s\n", u.AddressLine1, u.AddressLine2)
	fmt.Printf("Postal Code: %s\n", u.PostalCode)
	fmt.Printf("Timezone: %s\n", u.Timezone)

	// Wallet Information
	fmt.Println("\n--- Blockchain Information ---")
	fmt.Printf("Chain ID: %d\n", u.ChainID)
	if u.WalletAddress != nil {
		fmt.Printf("Wallet Address: %s\n", u.WalletAddress.Hex())
	} else {
		fmt.Printf("Wallet Address: Not connected\n")
	}

	// Additional Profile Information
	fmt.Println("\n--- Additional Information ---")
	fmt.Printf("Website: %s\n", u.WebsiteURL)
	if u.Description != "" {
		fmt.Printf("Description: %s\n", u.Description)
	}

	// Company-specific information if available
	if u.Role == user.UserRoleCompany && u.ComicBookStoreName != "" {
		fmt.Println("\n--- Company Information ---")
		fmt.Printf("Store Name: %s\n", u.ComicBookStoreName)
	}

	fmt.Println(strings.Repeat("-", 50))
}
