// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/federatedidentity/new.go
package federatedidentity

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/logger"
	passwordp "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/federatedidentity"
	repo_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/federatedidentity"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/federatedidentity"
	"github.com/spf13/cobra"
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
	flagCreatedByFederatedIdentityID     string
	flagCreatedByName       string
)

func NewCreateFederatedIdentityCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "create",
		Short: "Creates a new federatedidentity account",
		Run: func(cmd *cobra.Command, args []string) {
			doRunCreateFederatedIdentity()
		},
	}

	// Required flags
	cmd.Flags().StringVar(&flagEmail, "email", "", "FederatedIdentity's email address")
	cmd.MarkFlagRequired("email")
	cmd.Flags().StringVar(&flagFirstName, "first-name", "", "FederatedIdentity's first name")
	cmd.MarkFlagRequired("first-name")
	cmd.Flags().StringVar(&flagLastName, "last-name", "", "FederatedIdentity's last name")
	cmd.MarkFlagRequired("last-name")
	cmd.Flags().StringVar(&flagPassword, "password", "", "FederatedIdentity's password")
	cmd.MarkFlagRequired("password")
	cmd.Flags().StringVar(&flagPhone, "phone", "", "FederatedIdentity's phone number")
	cmd.MarkFlagRequired("phone")
	cmd.Flags().StringVar(&flagCountry, "country", "", "FederatedIdentity's country")
	cmd.MarkFlagRequired("country")
	cmd.Flags().StringVar(&flagTimezone, "timezone", "", "FederatedIdentity's timezone")
	cmd.MarkFlagRequired("timezone")
	cmd.Flags().Int8Var(&flagRole, "role", dom_federatedidentity.FederatedIdentityRoleCustomer, "FederatedIdentity's role (1=Root, 2=Retailer, 3=Customer)")
	cmd.Flags().Int8Var(&flagStatus, "status", dom_federatedidentity.FederatedIdentityStatusActive, "FederatedIdentity's status (1=Active, 50=Locked, 100=Archived)")
	cmd.Flags().BoolVar(&flagAgreeTermsOfService, "agree-tos", false, "FederatedIdentity agrees to terms of service")
	cmd.MarkFlagRequired("agree-tos")
	cmd.Flags().BoolVar(&flagAgreePromotions, "agree-promotions", false, "FederatedIdentity agrees to receive promotions")
	cmd.Flags().StringVar(&flagIPAddress, "ip-address", "", "IP address of the request")
	cmd.MarkFlagRequired("ip-address")
	cmd.Flags().StringVar(&flagCreatedByFederatedIdentityID, "created-by-federatedidentity-id", "", "ObjectID of the federatedidentity creating this account")
	cmd.MarkFlagRequired("created-by-federatedidentity-id")
	cmd.Flags().StringVar(&flagCreatedByName, "created-by-name", "", "Name of the federatedidentity creating this account")
	cmd.MarkFlagRequired("created-by-name")

	return cmd
}

func doRunCreateFederatedIdentity() {
	// Initialize dependencies
	logger := logger.NewProvider()
	cfg := config.NewProviderUsingEnvironmentVariables()
	dbClient := mongodb.NewProvider(cfg, logger)

	// Initialize the password provider for secure password handling
	passp := passwordp.NewProvider()

	// Initialize repository and use case
	federatedidentityRepo := repo_federatedidentity.NewRepository(cfg, logger, dbClient)
	federatedidentityCreateUseCase := uc_federatedidentity.NewFederatedIdentityCreateUseCase(cfg, logger, federatedidentityRepo)

	// Create a secure string from the password input
	// This ensures the password is handled securely in memory
	pass, err := sstring.NewSecureString(flagPassword)
	if err != nil {
		log.Fatalf("Failed securing password: %v\n", err)
	}
	// Note: We're not using defer pass.Wipe() here as it can cause hangs,
	// similar to the note in the initialize.go code

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
		// Generate password hash using the password provider
		// This uses argon2id under the hood for secure password hashing
		passHash, err := passp.GenerateHashFromPassword(pass)
		if err != nil {
			return nil, fmt.Errorf("failed generating password hash: %w", err)
		}

		// Parse created by federatedidentity ID
		createdByFederatedIdentityID, err := primitive.ObjectIDFromHex(flagCreatedByFederatedIdentityID)
		if err != nil {
			return nil, fmt.Errorf("invalid created-by-federatedidentity-id: %w", err)
		}

		// Create federatedidentity object
		federatedidentity := &dom_federatedidentity.FederatedIdentity{
			ID:                    primitive.NewObjectID(),
			Email:                 flagEmail,
			WasEmailVerified:      true,
			FirstName:             flagFirstName,
			LastName:              flagLastName,
			Name:                  fmt.Sprintf("%s %s", flagFirstName, flagLastName),
			LexicalName:           fmt.Sprintf("%s, %s", flagLastName, flagFirstName),
			PasswordHash:          passHash,              // Store the secure password hash
			PasswordHashAlgorithm: passp.AlgorithmName(), // Store the algorithm name for future reference
			Role:                  flagRole,
			Phone:                 flagPhone,
			Country:               flagCountry,
			Timezone:              flagTimezone,
			Status:                flagStatus,
			AgreeTermsOfService:   flagAgreeTermsOfService,
			AgreePromotions:       flagAgreePromotions,
			CreatedFromIPAddress:  flagIPAddress,
			CreatedByFederatedIdentityID:       createdByFederatedIdentityID,
			CreatedByName:         flagCreatedByName,
			CreatedAt:             time.Now(),
			ModifiedFromIPAddress: flagIPAddress,
			ModifiedByFederatedIdentityID:      createdByFederatedIdentityID,
			ModifiedByName:        flagCreatedByName,
			ModifiedAt:            time.Now(),
		}

		// Execute federatedidentity creation through the use case
		err = federatedidentityCreateUseCase.Execute(sessCtx, federatedidentity)
		if err != nil {
			sessCtx.AbortTransaction(ctx)
			return nil, fmt.Errorf("failed to create federatedidentity: %w", err)
		}

		logger.Debug("Committing transaction")
		if err := sessCtx.CommitTransaction(ctx); err != nil {
			return nil, err
		}
		logger.Debug("Transaction committed")

		return federatedidentity, nil
	}

	// Execute transaction
	res, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		logger.Error("transaction failed",
			slog.Any("error", err))
		log.Fatalf("Failed creating federatedidentity: %v\n", err)
	}

	federatedidentity := res.(*dom_federatedidentity.FederatedIdentity)
	logger.Info("FederatedIdentity created successfully",
		slog.String("id", federatedidentity.ID.Hex()),
		slog.String("email", federatedidentity.Email),
		slog.String("name", federatedidentity.Name))
}
