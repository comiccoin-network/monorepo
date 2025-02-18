// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd/api/register.go
package api

import (
	"context"
	"fmt"
	"log"
	"log/slog"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	common_oauth_config "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/registration"
	r_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/registration"
	uc_register "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/register"
)

func RegisterCmd() *cobra.Command {
	var email, firstName, lastName, phone, country, timezone, password string
	var agreeTOS bool

	var cmd = &cobra.Command{
		Use:   "register",
		Short: "Register a new federatedidentity",
		Long:  `Register a new federatedidentity in the system with OAuth 2.0 client registration`,
		Run: func(cmd *cobra.Command, args []string) {
			doRunRegisterCmd(email, firstName, lastName, phone, country, timezone, password, agreeTOS)
		},
	}

	// Required flags
	cmd.Flags().StringVarP(&email, "email", "e", "", "FederatedIdentity's email address")
	cmd.Flags().StringVarP(&firstName, "first-name", "f", "", "FederatedIdentity's first name")
	cmd.Flags().StringVarP(&lastName, "last-name", "l", "", "FederatedIdentity's last name")
	cmd.Flags().StringVarP(&phone, "phone", "p", "", "FederatedIdentity's phone number")
	cmd.Flags().StringVarP(&country, "country", "c", "", "FederatedIdentity's country (2-letter code)")
	cmd.Flags().StringVarP(&timezone, "timezone", "t", "", "FederatedIdentity's timezone")
	cmd.Flags().StringVarP(&password, "password", "w", "", "FederatedIdentity's password (min 8 characters)")
	cmd.Flags().BoolVarP(&agreeTOS, "agree-tos", "a", false, "Agree to Terms of Service")

	// Mark required flags
	cmd.MarkFlagRequired("email")
	cmd.MarkFlagRequired("first-name")
	cmd.MarkFlagRequired("last-name")
	cmd.MarkFlagRequired("phone")
	cmd.MarkFlagRequired("country")
	cmd.MarkFlagRequired("timezone")
	cmd.MarkFlagRequired("password")
	cmd.MarkFlagRequired("agree-tos")

	return cmd
}

func doRunRegisterCmd(email, firstName, lastName, phone, country, timezone, password string, agreeTOS bool) {
	// Setup basic dependencies
	logger := logger.NewProvider()
	originalCfg := config.NewProvider()
	cfg := &common_oauth_config.Configuration{
		OAuth: common_oauth_config.OAuthConfig{
			ServerURL:                        originalCfg.PublicFaucetOAuth.ServerURL,
			ClientID:                         originalCfg.PublicFaucetOAuth.ClientID,
			ClientSecret:                     originalCfg.PublicFaucetOAuth.ClientSecret,
			ClientRedirectURI:                originalCfg.PublicFaucetOAuth.ClientRedirectURI,
			ClientRegisterSuccessURI:         originalCfg.PublicFaucetOAuth.ClientRegisterSuccessURI,
			ClientRegisterCancelURI:          originalCfg.PublicFaucetOAuth.ClientRegisterCancelURI,
			ClientAuthorizeOrLoginSuccessURI: originalCfg.PublicFaucetOAuth.ClientAuthorizeOrLoginSuccessURI,
			ClientAuthorizeOrLoginCancelURI:  originalCfg.PublicFaucetOAuth.ClientAuthorizeOrLoginCancelURI,
		},
		DB: common_oauth_config.DBConfig{
			URI:  originalCfg.DB.URI,
			Name: originalCfg.DB.PublicFaucetName,
		},
	}
	logger.Debug("configuration ready")

	// Initialize context
	ctx := context.Background()

	// Initialize registration repository and use case
	registrationRepo := r_registration.NewRepository(cfg, logger)
	registerUseCase := uc_register.NewRegisterUseCase(cfg, logger, registrationRepo)

	// Create registration request
	req := &dom_registration.RegistrationRequest{
		Email:     email,
		Password:  password, // Add the password field
		FirstName: firstName,
		LastName:  lastName,
		Phone:     phone,
		Country:   country,
		Timezone:  timezone,
		AgreeTOS:  agreeTOS,
		AppID:     cfg.OAuth.ClientID,
		AuthFlow:  "auto",
	}

	// Process registration
	resp, err := registerUseCase.Execute(ctx, req)
	if err != nil {
		logger.Error("failed to register federatedidentity",
			slog.String("email", email),
			slog.Any("error", err))
		log.Fatal(err)
	}

	logger.Info("federatedidentity registered successfully",
		slog.String("email", email),
		slog.String("auth_code", resp.AuthCode),
		slog.String("redirect_uri", resp.RedirectURI))

	// Print success message with registration details
	fmt.Printf("\nFederatedIdentity Registration Successful\n")
	fmt.Printf("Email: %s\n", email)
	fmt.Printf("Name: %s %s\n", firstName, lastName)
	fmt.Printf("Auth Code: %s\n", resp.AuthCode)
	fmt.Printf("Redirect URI: %s\n", resp.RedirectURI)
}
