// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/application/new.go
package application

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/application"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/repo/application"
	uc_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/application"
)

var (
	flagAppID        string
	flagAppSecret    string
	flagName         string
	flagDescription  string
	flagRedirectURIs string
	flagGrantTypes   string
	flagScopes       string
	flagRateLimit    int
	flagTrustedApp   bool
	flagContactEmail string
	flagLogoURL      string
	flagTermsURL     string
	flagPrivacyURL   string
)

func NewCreateApplicationCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "create",
		Short: "Creates a new OAuth 2.0 application registration",
		Run: func(cmd *cobra.Command, args []string) {
			doRunCreateApplication()
		},
	}

	// Required flags
	cmd.Flags().StringVar(&flagAppID, "app-id", "", "Unique identifier for the application")
	cmd.MarkFlagRequired("app-id")
	cmd.Flags().StringVar(&flagAppSecret, "app-secret", "", "Secret key for application authentication")
	cmd.MarkFlagRequired("app-secret")
	cmd.Flags().StringVar(&flagName, "name", "", "Human-readable application name")
	cmd.MarkFlagRequired("name")
	cmd.Flags().StringVar(&flagRedirectURIs, "redirect-uris", "", "Comma-separated list of allowed callback URLs")
	cmd.MarkFlagRequired("redirect-uris")
	cmd.Flags().StringVar(&flagGrantTypes, "grant-types", "", "Comma-separated list of supported OAuth grant types")
	cmd.MarkFlagRequired("grant-types")
	cmd.Flags().StringVar(&flagContactEmail, "contact-email", "", "Developer contact email")
	cmd.MarkFlagRequired("contact-email")

	// Optional flags
	cmd.Flags().StringVar(&flagDescription, "description", "", "Application description")
	cmd.Flags().StringVar(&flagScopes, "scopes", "", "Comma-separated list of allowed OAuth scopes")
	cmd.Flags().IntVar(&flagRateLimit, "rate-limit", 60, "API rate limit per minute")
	cmd.Flags().BoolVar(&flagTrustedApp, "trusted-app", false, "Whether this is a first-party application")
	cmd.Flags().StringVar(&flagLogoURL, "logo-url", "", "URL to application logo")
	cmd.Flags().StringVar(&flagTermsURL, "terms-url", "", "URL to terms of service")
	cmd.Flags().StringVar(&flagPrivacyURL, "privacy-url", "", "URL to privacy policy")

	return cmd
}

func doRunCreateApplication() {
	// Initialize dependencies
	logger := logger.NewProvider()
	cfg := config.NewProviderUsingEnvironmentVariables()
	dbClient := mongodb.NewProvider(cfg, logger)

	// Initialize repository and use case
	applicationRepo := application.NewRepository(cfg, logger, dbClient)
	applicationCreateUseCase := uc_app.NewApplicationCreateUseCase(
		cfg,
		logger,
		applicationRepo,
	)

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
		// Parse comma-separated values
		redirectURIs := strings.Split(flagRedirectURIs, ",")
		grantTypes := strings.Split(flagGrantTypes, ",")
		var scopes []string
		if flagScopes != "" {
			scopes = strings.Split(flagScopes, ",")
		}

		// Create application object
		app := &dom_app.Application{
			AppID:        flagAppID,
			AppSecret:    flagAppSecret,
			Name:         flagName,
			Description:  flagDescription,
			RedirectURIs: redirectURIs,
			GrantTypes:   grantTypes,
			Scopes:       scopes,
			Active:       true,
			RateLimit:    flagRateLimit,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
			TrustedApp:   flagTrustedApp,
			ContactEmail: flagContactEmail,
			LogoURL:      flagLogoURL,
			TermsURL:     flagTermsURL,
			PrivacyURL:   flagPrivacyURL,
		}

		// Execute creation
		err := applicationCreateUseCase.Execute(sessCtx, app)
		if err != nil {
			sessCtx.AbortTransaction(ctx)
			return nil, fmt.Errorf("failed to create application: %w", err)
		}

		logger.Debug("Committing transaction")
		if err := sessCtx.CommitTransaction(ctx); err != nil {
			return nil, err
		}
		logger.Debug("Transaction committed")

		return app, nil
	}

	// Execute transaction
	res, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		logger.Error("transaction failed",
			slog.Any("error", err))
		log.Fatalf("Failed creating application: %v\n", err)
	}

	app := res.(*dom_app.Application)
	logger.Info("Application created successfully",
		slog.String("app_id", app.AppID),
		slog.String("name", app.Name))
}
