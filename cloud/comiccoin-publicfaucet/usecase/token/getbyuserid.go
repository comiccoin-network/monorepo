// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/token/getbyuserid.go
package token

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/token"
)

type TokenGetByUserIDUseCase interface {
	Execute(ctx context.Context, userID primitive.ObjectID) (*dom_token.Token, error)
}

type tokenGetByUserIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_token.Repository
}

func NewTokenGetByUserIDUseCase(config *config.Configuration, logger *slog.Logger, repo dom_token.Repository) TokenGetByUserIDUseCase {
	return &tokenGetByUserIDUseCaseImpl{config, logger, repo}
}

func (uc *tokenGetByUserIDUseCaseImpl) Execute(ctx context.Context, userID primitive.ObjectID) (*dom_token.Token, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if userID.IsZero() {
		e["user_id"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("validation failed for get token",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get from database.
	//

	return uc.repo.GetByUserID(ctx, userID)
}
