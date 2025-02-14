// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/usecase/authorization/storecode.go
package authorization

import (
	"context"
	"log/slog"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/authorization"
)

type AuthorizationStoreCodeUseCase interface {
	Execute(ctx context.Context, code *dom_auth.AuthorizationCode) error
}

type authorizationStoreCodeUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_auth.Repository
}

func NewAuthorizationStoreCodeUseCase(config *config.Configuration, logger *slog.Logger, repo dom_auth.Repository) AuthorizationStoreCodeUseCase {
	return &authorizationStoreCodeUseCaseImpl{config, logger, repo}
}

func (uc *authorizationStoreCodeUseCaseImpl) Execute(ctx context.Context, code *dom_auth.AuthorizationCode) error {
	// STEP 1: Validation
	e := make(map[string]string)
	if code == nil {
		e["code"] = "missing value"
	} else {
		if code.Code == "" {
			e["code"] = "missing value"
		}
		if code.AppID == "" {
			e["app_id"] = "missing value"
		}
		if code.FederatedIdentityID == "" {
			e["federatedidentity_id"] = "missing value"
		}
		if code.RedirectURI == "" {
			e["redirect_uri"] = "missing value"
		}
		if code.Scope == "" {
			e["scope"] = "missing value"
		}
		// PKCE is optional, so we don't validate code_challenge
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for authorization code creation",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	// STEP 2: Set timestamps and defaults
	code.CreatedAt = time.Now()
	code.ExpiresAt = time.Now().Add(10 * time.Minute) // Authorization codes expire in 10 minutes
	code.IsUsed = false

	// STEP 3: Store in database
	if err := uc.repo.StoreCode(ctx, code); err != nil {
		uc.logger.Error("failed to store authorization code",
			slog.String("app_id", code.AppID),
			slog.String("federatedidentity_id", code.FederatedIdentityID),
			slog.Any("error", err))
		return err
	}

	return nil
}
