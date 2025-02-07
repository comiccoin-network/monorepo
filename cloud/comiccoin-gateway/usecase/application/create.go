// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/application/create.go
package application

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_app "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/application"
)

type ApplicationCreateUseCase interface {
	Execute(ctx context.Context, app *dom_app.Application) error
}

type applicationCreateUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_app.Repository
}

func NewApplicationCreateUseCase(config *config.Configuration, logger *slog.Logger, repo dom_app.Repository) ApplicationCreateUseCase {
	return &applicationCreateUseCaseImpl{config, logger, repo}
}

func (uc *applicationCreateUseCaseImpl) Execute(ctx context.Context, app *dom_app.Application) error {
	// STEP 1: Validation
	e := make(map[string]string)
	if app == nil {
		e["application"] = "missing value"
	} else {
		if app.AppID == "" {
			e["app_id"] = "missing value"
		}
		if app.Name == "" {
			e["name"] = "missing value"
		}
		if app.AppSecret == "" {
			e["app_secret"] = "missing value"
		}
		if len(app.RedirectURIs) == 0 {
			e["redirect_uris"] = "at least one redirect URI required"
		} else {
			// DEVELOPERS NOTE:
			// `TrustedApp=true` would indicate this is a first-party app, but in
			// our case to simplify our development, we will use it to enforce
			// `https` in the url, else if  `TrustedApp=false` then don't
			// enforce it.
			if app.TrustedApp {
				for i, uri := range app.RedirectURIs {
					if !strings.HasPrefix(uri, "https://") {
						e[fmt.Sprintf("redirect_uris[%d]", i)] = "must use HTTPS"
					}
				}
			}
		}
		if len(app.GrantTypes) == 0 {
			e["grant_types"] = "at least one grant type required"
		}
		if app.ContactEmail == "" {
			e["contact_email"] = "missing value"
		}
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for application creation",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// STEP 2: Set default values
	app.CreatedAt = time.Now()
	app.UpdatedAt = time.Now()
	app.Active = true // New applications are active by default
	if app.RateLimit == 0 {
		app.RateLimit = 60 // Default to 60 requests per minute
	}

	// STEP 3: Insert into database
	return uc.repo.Create(ctx, app)
}
