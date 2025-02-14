// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/authorization/findbycode.go
package authorization

import (
	"context"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/authorization"
)

type AuthorizationFindByCodeUseCase interface {
	Execute(ctx context.Context, code string) (*dom_auth.AuthorizationCode, error)
}

type authorizationFindByCodeUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_auth.Repository
}

func NewAuthorizationFindByCodeUseCase(config *config.Configuration, logger *slog.Logger, repo dom_auth.Repository) AuthorizationFindByCodeUseCase {
	return &authorizationFindByCodeUseCaseImpl{config, logger, repo}
}

func (uc *authorizationFindByCodeUseCaseImpl) Execute(ctx context.Context, code string) (*dom_auth.AuthorizationCode, error) {
	// STEP 1: Validation
	e := make(map[string]string)
	if code == "" {
		e["code"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for authorization code lookup",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	// STEP 2: Retrieve from database
	authCode, err := uc.repo.FindByCode(ctx, code)
	if err != nil {
		uc.logger.Error("failed to find authorization code",
			slog.String("code", code),
			slog.Any("error", err))
		return nil, err
	}

	// STEP 3: Validate expiration and usage
	if authCode != nil {
		if authCode.IsUsed {
			uc.logger.Warn("authorization code has already been used",
				slog.String("code", code))
			return nil, httperror.NewForBadRequest(&map[string]string{
				"code": "already used",
			})
		}
		if authCode.ExpiresAt.Before(time.Now()) {
			uc.logger.Warn("authorization code has expired",
				slog.String("code", code))
			return nil, httperror.NewForBadRequest(&map[string]string{
				"code": "expired",
			})
		}
	}

	return authCode, nil
}
