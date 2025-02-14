// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/application/validatecredentials.go
package application

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_app "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/application"
)

type ApplicationValidateCredentialsUseCase interface {
	Execute(ctx context.Context, appID, appSecret string) (bool, error)
}

type applicationValidateCredentialsUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_app.Repository
}

func NewApplicationValidateCredentialsUseCase(config *config.Configuration, logger *slog.Logger, repo dom_app.Repository) ApplicationValidateCredentialsUseCase {
	return &applicationValidateCredentialsUseCaseImpl{config, logger, repo}
}

func (uc *applicationValidateCredentialsUseCaseImpl) Execute(ctx context.Context, appID, appSecret string) (bool, error) {
	// STEP 1: Validation
	e := make(map[string]string)
	if appID == "" {
		e["app_id"] = "missing value"
	}
	if appSecret == "" {
		e["app_secret"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for credential validation",
			slog.Any("error", e))
		return false, httperror.NewForBadRequest(&e)
	}

	// STEP 2: Validate credentials
	valid, err := uc.repo.ValidateCredentials(ctx, appID, appSecret)
	if err != nil {
		return false, err
	}

	// Update last used timestamp on successful validation
	if valid {
		if err := uc.repo.UpdateLastUsed(ctx, appID); err != nil {
			// Log but don't fail the validation
			uc.logger.Warn("failed to update last used timestamp",
				slog.String("app_id", appID),
				slog.Any("error", err))
		}
	}

	return valid, nil
}
