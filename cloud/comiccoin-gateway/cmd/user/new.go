// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/user/new.go
package user

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"time"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/user"
	repo_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/user"
)

var (
	flagEmail               string
	flagFirstName           string
	flagLastName            string
	flagPassword            string
	flagPhone               string
	flagCountry             string
	flagTimezone            string
	flagRole                int8
	flagStatus              int8
	flagAgreeTermsOfService bool
	flagAgreePromotions     bool
	flagIPAddress           string
	flagCreatedByUserID     string
	flagCreatedByName       string
)

func NewCreateUserCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "create",
		Short: "Creates a new user account",
		Run: func(cmd *cobra.Command, args []string) {
			doRunCreateUser()
		},
	}

	// Required flags
	cmd.Flags().StringVar(&flagEmail, "email", "", "User's email address")
	cmd.MarkFlagRequired("email")
	cmd.Flags().StringVar(&flagFirstName, "first-name", "", "User's first name")
	cmd.MarkFlagRequired("first-name")
	cmd.Flags().StringVar(&flagLastName, "last-name", "", "User's last name")
	cmd.MarkFlagRequired("last-name")
	cmd.Flags().StringVar(&flagPassword, "password", "", "User's password")
	cmd.MarkFlagRequired("password")
	cmd.Flags().StringVar(&flagPhone, "phone", "", "User's phone number")
	cmd.MarkFlagRequired("phone")
	cmd.Flags().StringVar(&flagCountry, "country", "", "User's country")
	cmd.MarkFlagRequired("country")
	cmd.Flags().StringVar(&flagTimezone, "timezone", "", "User's timezone")
	cmd.MarkFlagRequired("timezone")
	cmd.Flags().Int8Var(&flagRole, "role", dom_user.UserRoleCustomer, "User's role (1=Root, 2=Retailer, 3=Customer)")
	cmd.Flags().Int8Var(&flagStatus, "status", dom_user.UserStatusActive, "User's status (1=Active, 50=Locked, 100=Archived)")
	cmd.Flags().BoolVar(&flagAgreeTermsOfService, "agree-tos", false, "User agrees to terms of service")
	cmd.MarkFlagRequired("agree-tos")
	cmd.Flags().BoolVar(&flagAgreePromotions, "agree-promotions", false, "User agrees to receive promotions")
	cmd.Flags().StringVar(&flagIPAddress, "ip-address", "", "IP address of the request")
	cmd.MarkFlagRequired("ip-address")
	cmd.Flags().StringVar(&flagCreatedByUserID, "created-by-user-id", "", "ObjectID of the user creating this account")
	cmd.MarkFlagRequired("created-by-user-id")
	cmd.Flags().StringVar(&flagCreatedByName, "created-by-name", "", "Name of the user creating this account")
	cmd.MarkFlagRequired("created-by-name")

	return cmd
}

func doRunCreateUser() {
	// Initialize dependencies
	logger := logger.NewProvider()
	cfg := config.NewProviderUsingEnvironmentVariables()
	dbClient := mongodb.NewProvider(cfg, logger)

	// Initialize repository and use case
	userRepo := repo_user.NewRepository(cfg, logger, dbClient)
	userCreateUseCase := uc_user.NewUserCreateUseCase(cfg, logger, userRepo)

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Start MongoDB session
	session, err := dbClient.StartSession()
	if err != nil {
		logger.Error("start session error",
			slog.Any("error", err))
		log.Fatalf("Failed starting session: %v\n", err)
	}
	defer session.EndSession(ctx)

	logger.Debug("Starting MongoDB transaction...")

	// Define transaction function
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		// Parse created by user ID
		createdByUserID, err := primitive.ObjectIDFromHex(flagCreatedByUserID)
		if err != nil {
			return nil, fmt.Errorf("invalid created-by-user-id: %w", err)
		}

		// Create user object
		user := &dom_user.User{
			ID:                    primitive.NewObjectID(),
			Email:                 flagEmail,
			FirstName:             flagFirstName,
			LastName:              flagLastName,
			Name:                  fmt.Sprintf("%s %s", flagFirstName, flagLastName),
			LexicalName:           fmt.Sprintf("%s, %s", flagLastName, flagFirstName),
			Role:                  flagRole,
			Phone:                 flagPhone,
			Country:               flagCountry,
			Timezone:              flagTimezone,
			Status:                flagStatus,
			AgreeTermsOfService:   flagAgreeTermsOfService,
			AgreePromotions:       flagAgreePromotions,
			CreatedFromIPAddress:  flagIPAddress,
			CreatedByUserID:       createdByUserID,
			CreatedByName:         flagCreatedByName,
			CreatedAt:             time.Now(),
			ModifiedFromIPAddress: flagIPAddress,
			ModifiedByUserID:      createdByUserID,
			ModifiedByName:        flagCreatedByName,
			ModifiedAt:            time.Now(),
		}

		// Execute creation
		err = userCreateUseCase.Execute(sessCtx, user)
		if err != nil {
			sessCtx.AbortTransaction(ctx)
			return nil, fmt.Errorf("failed to create user: %w", err)
		}

		logger.Debug("Committing transaction")
		if err := sessCtx.CommitTransaction(ctx); err != nil {
			return nil, err
		}
		logger.Debug("Transaction committed")

		return user, nil
	}

	// Execute transaction
	res, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		logger.Error("transaction failed",
			slog.Any("error", err))
		log.Fatalf("Failed creating user: %v\n", err)
	}

	user := res.(*dom_user.User)
	logger.Info("User created successfully",
		slog.String("id", user.ID.Hex()),
		slog.String("email", user.Email),
		slog.String("name", user.Name))
}
