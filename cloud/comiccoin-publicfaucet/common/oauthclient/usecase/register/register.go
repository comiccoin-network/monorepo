// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/registration/register.go
package registration

import (
	"context"
	"errors"
	"log/slog"
	"regexp"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/registration"
)

type RegisterUseCase interface {
	Execute(ctx context.Context, req *dom_registration.RegistrationRequest) (*dom_registration.RegistrationResponse, error)
}

type registerUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	client dom_registration.Client
}

func NewRegisterUseCase(config *config.Configuration, logger *slog.Logger, client dom_registration.Client) RegisterUseCase {
	return &registerUseCaseImpl{config, logger, client}
}

var (
	emailRegex    = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	phoneRegex    = regexp.MustCompile(`^\+?[1-9]\d{1,14}$`)
	timezoneRegex = regexp.MustCompile(`^[A-Za-z_]+/[A-Za-z_]+$`)
)

func (uc *registerUseCaseImpl) Execute(ctx context.Context, req *dom_registration.RegistrationRequest) (*dom_registration.RegistrationResponse, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if req == nil {
		e["request"] = "missing value"
	} else {
		// Email validation
		if req.Email == "" {
			e["email"] = "missing value"
		} else if !emailRegex.MatchString(req.Email) {
			e["email"] = "invalid format"
		}

		// Password validation
		if req.Password == "" {
			e["password"] = "missing value"
		} else if len(req.Password) < 8 {
			e["password"] = "must be at least 8 characters"
		}

		// Name validation
		if req.FirstName == "" {
			e["first_name"] = "missing value"
		} else if len(strings.TrimSpace(req.FirstName)) < 2 {
			e["first_name"] = "must be at least 2 characters"
		}

		if req.LastName == "" {
			e["last_name"] = "missing value"
		} else if len(strings.TrimSpace(req.LastName)) < 2 {
			e["last_name"] = "must be at least 2 characters"
		}

		// Phone validation
		if req.Phone == "" {
			e["phone"] = "missing value"
		} else if !phoneRegex.MatchString(req.Phone) {
			e["phone"] = "invalid format"
		}

		// Country validation
		if req.Country == "" {
			e["country"] = "missing value"
		} else if len(req.Country) != 2 {
			e["country"] = "must be ISO 2-letter code"
		}

		// Timezone validation
		if req.Timezone == "" {
			e["timezone"] = "missing value"
		} else if !timezoneRegex.MatchString(req.Timezone) {
			e["timezone"] = "invalid format"
		}

		// Terms of Service validation
		if !req.AgreeTOS {
			e["agree_tos"] = "must agree to terms of service"
		}

		// AppID validation
		if req.AppID == "" {
			e["app_id"] = "missing value"
		} else if req.AppID != uc.config.OAuth.ClientID {
			e["app_id"] = "invalid client id"
		}

		// AuthFlow validation
		if req.AuthFlow == "" {
			e["auth_flow"] = "missing value"
		} else if req.AuthFlow != "auto" && req.AuthFlow != "manual" {
			e["auth_flow"] = "must be 'auto' or 'manual'"
		}
	}

	if len(e) != 0 {
		uc.logger.Warn("validation failed for registration",
			slog.Any("errors", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Register federatedidentity.
	//

	response, err := uc.client.Register(ctx, req)
	if err != nil {
		uc.logger.Error("failed to register federatedidentity",
			slog.String("email", req.Email),
			slog.Any("error", err))
		return nil, err
	}

	if response == nil {
		err := errors.New("empty response from gateway")
		uc.logger.Error("failed to register federatedidentity",
			slog.String("email", req.Email),
			slog.Any("error", err))
		return nil, err
	}

	uc.logger.Info("federatedidentity registered successfully",
		slog.String("email", req.Email),
		slog.Any("federatedidentity_id", response.FederatedIdentityID))

	return response, nil
}
