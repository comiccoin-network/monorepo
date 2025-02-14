// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/authorization/markcodeasused.go
package authorization

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/authorization"
)

type AuthorizationMarkCodeAsUsedUseCase interface {
	Execute(ctx context.Context, code string) error
}

type authorizationMarkCodeAsUsedUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_auth.Repository
}

func NewAuthorizationMarkCodeAsUsedUseCase(config *config.Configuration, logger *slog.Logger, repo dom_auth.Repository) AuthorizationMarkCodeAsUsedUseCase {
	return &authorizationMarkCodeAsUsedUseCaseImpl{config, logger, repo}
}

func (uc *authorizationMarkCodeAsUsedUseCaseImpl) Execute(ctx context.Context, code string) error {
	// STEP 1: Validation
	e := make(map[string]string)
	if code == "" {
		e["code"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for marking code as used",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// STEP 2: First verify the code exists and is valid
	authCode, err := uc.repo.FindByCode(ctx, code)
	if err != nil {
		return err
	}
	if authCode == nil {
		return httperror.NewForBadRequest(&map[string]string{
			"code": "not found",
		})
	}
	if authCode.IsUsed {
		return httperror.NewForBadRequest(&map[string]string{
			"code": "already used",
		})
	}

	// STEP 3: Mark as used
	return uc.repo.MarkCodeAsUsed(ctx, code)
}
