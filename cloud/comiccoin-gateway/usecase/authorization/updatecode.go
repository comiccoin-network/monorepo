// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/usecase/authorization/updatecode.go
package authorization

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	dom_auth "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain/authorization"
)

type AuthorizationUpdateCodeUseCase interface {
	Execute(ctx context.Context, code *dom_auth.AuthorizationCode) error
}

type authorizationUpdateCodeUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_auth.Repository
}

func NewAuthorizationUpdateCodeUseCase(config *config.Configuration, logger *slog.Logger, repo dom_auth.Repository) AuthorizationUpdateCodeUseCase {
	return &authorizationUpdateCodeUseCaseImpl{config, logger, repo}
}

func (uc *authorizationUpdateCodeUseCaseImpl) Execute(ctx context.Context, code *dom_auth.AuthorizationCode) error {
	if code == nil {
		return fmt.Errorf("authorization code is required")
	}
	return uc.repo.UpdateCode(ctx, code)
}
