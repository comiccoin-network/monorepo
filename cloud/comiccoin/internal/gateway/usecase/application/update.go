// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/application/update.go
package application

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_app "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/application"
)

type ApplicationUpdateUseCase interface {
	Execute(ctx context.Context, app *dom_app.Application) error
}

type applicationUpdateUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_app.Repository
}

func NewApplicationUpdateUseCase(config *config.Configuration, logger *slog.Logger, repo dom_app.Repository) ApplicationUpdateUseCase {
	return &applicationUpdateUseCaseImpl{config, logger, repo}
}

func (uc *applicationUpdateUseCaseImpl) Execute(ctx context.Context, app *dom_app.Application) error {
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
		if len(app.RedirectURIs) == 0 {
			e["redirect_uris"] = "at least one redirect URI required"
		} else {
			for i, uri := range app.RedirectURIs {
				if !strings.HasPrefix(uri, "https://") {
					e[fmt.Sprintf("redirect_uris[%d]", i)] = "must use HTTPS"
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
		uc.logger.Warn("validation failed for application update",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// STEP 2: Update timestamp
	app.UpdatedAt = time.Now()

	// STEP 3: Update in database
	return uc.repo.Update(ctx, app)
}
