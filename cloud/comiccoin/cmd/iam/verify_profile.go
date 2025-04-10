// github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/iam/verify_profile.go
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
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/repo/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

var (
	flagVerifyProfileUserID    string
	flagVerifyProfileUserEmail string
	flagVerificationStatus     int
)

func VerifyProfileCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "verify-profile",
		Short: "Change a user's profile verification status",
		Run: func(cmd *cobra.Command, args []string) {
			doRunVerifyProfile()
		},
	}

	// Register flags - allow lookup by either ID or email
	cmd.Flags().StringVar(&flagVerifyProfileUserID, "id", "", "User ID")
	cmd.Flags().StringVar(&flagVerifyProfileUserEmail, "email", "", "User email")

	// Status flag
	cmd.Flags().IntVar(&flagVerificationStatus, "status", user.UserProfileVerificationStatusApproved,
		"Verification status (1: Unverified, 2: Submitted for Review, 3: Approved, 4: Rejected)")

	return cmd
}

func doRunVerifyProfile() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)

	// Validate inputs - require either ID or email, but not both
	if flagVerifyProfileUserID == "" && flagVerifyProfileUserEmail == "" {
		logger.Error("Either --id or --email must be specified")
		log.Fatalf("Error: Either --id or --email must be specified\n")
	}

	if flagVerifyProfileUserID != "" && flagVerifyProfileUserEmail != "" {
		logger.Error("Only one of --id or --email should be specified, not both")
		log.Fatalf("Error: Only one of --id or --email should be specified, not both\n")
	}

	// Validate verification status
	if flagVerificationStatus < 1 || flagVerificationStatus > 4 {
		logger.Error("Invalid verification status")
		log.Fatalf("Error: Verification status must be between 1 and 4\n")
	}

	// Repository and Use-case
	userRepo := r_user.NewRepository(cfg, logger, dbClient)
	userGetByIDUseCase := uc_user.NewUserGetByIDUseCase(cfg, logger, userRepo)
	userGetByEmailUseCase := uc_user.NewUserGetByEmailUseCase(cfg, logger, userRepo)
	userUpdateUseCase := uc_user.NewUserUpdateUseCase(cfg, logger, userRepo)

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
		var foundUser *user.User
		var err error

		// Look up user by ID or email
		if flagVerifyProfileUserID != "" {
			// Convert string ID to ObjectID
			objectID, err := primitive.ObjectIDFromHex(flagVerifyProfileUserID)
			if err != nil {
				logger.Error("Invalid ObjectID format", slog.Any("error", err))
				return nil, fmt.Errorf("invalid ObjectID format: %v", err)
			}
			foundUser, err = userGetByIDUseCase.Execute(sessCtx, objectID)
		} else {
			foundUser, err = userGetByEmailUseCase.Execute(sessCtx, flagVerifyProfileUserEmail)
		}

		if err != nil {
			logger.Error("Error retrieving user", slog.Any("error", err))
			return nil, err
		}

		if foundUser == nil {
			return nil, fmt.Errorf("user not found")
		}

		// Get the old status for logging
		oldStatus := foundUser.ProfileVerificationStatus

		// Update the profile verification status
		foundUser.ProfileVerificationStatus = int8(flagVerificationStatus)
		foundUser.ModifiedAt = time.Now()

		// If we're approving a profile, make sure email is also verified
		if flagVerificationStatus == user.UserProfileVerificationStatusApproved && !foundUser.WasEmailVerified {
			foundUser.WasEmailVerified = true
		}

		// Update the user
		err = userUpdateUseCase.Execute(sessCtx, foundUser)
		if err != nil {
			logger.Error("Failed to update user", slog.Any("error", err))
			return nil, err
		}

		return map[string]interface{}{
			"user":       foundUser,
			"old_status": oldStatus,
		}, nil
	}

	// Execute transaction
	result, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		logger.Error("Transaction failed", slog.Any("error", err))
		log.Fatalf("Failed to verify user profile: %v\n", err)
	}

	// Get the results
	details := result.(map[string]interface{})
	u := details["user"].(*user.User)
	oldStatus := details["old_status"].(int8)

	// Get status name maps for display
	statusNames := map[int8]string{
		user.UserProfileVerificationStatusUnverified:         "Unverified",
		user.UserProfileVerificationStatusSubmittedForReview: "Submitted for Review",
		user.UserProfileVerificationStatusApproved:           "Approved",
		user.UserProfileVerificationStatusRejected:           "Rejected",
	}

	// Display success message
	fmt.Printf("\nUser profile verification status updated successfully!\n")
	fmt.Printf("ID: %s\n", u.ID.Hex())
	fmt.Printf("Name: %s\n", u.Name)
	fmt.Printf("Email: %s\n", u.Email)
	fmt.Printf("Old Status: %s (%d)\n", statusNames[oldStatus], oldStatus)
	fmt.Printf("New Status: %s (%d)\n", statusNames[u.ProfileVerificationStatus], u.ProfileVerificationStatus)
	fmt.Printf("Modified At: %s\n", u.ModifiedAt.Format(time.RFC3339))

	// Special message for approved status
	if u.ProfileVerificationStatus == user.UserProfileVerificationStatusApproved {
		fmt.Printf("\nThe user's profile is now approved. Email verification was also automatically set to true.\n")
	}
}
