package user

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodbcache"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/user"
)

type UserGetBySessionIDUseCase interface {
	Execute(ctx context.Context, sessionID string) (*dom_user.User, error)
}

type userGetBySessionIDUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	cache  mongodbcache.Cacher
}

func NewUserGetBySessionIDUseCase(config *config.Configuration, logger *slog.Logger, ca mongodbcache.Cacher) UserGetBySessionIDUseCase {
	return &userGetBySessionIDUseCaseImpl{config, logger, ca}
}

func (uc *userGetBySessionIDUseCaseImpl) Execute(ctx context.Context, sessionID string) (*dom_user.User, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if sessionID == "" {
		e["session_id"] = "missing value"
	} else {
		//TODO: IMPL.
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed for upsert",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2:
	//

	uc.logger.Debug("publicfaucet controller initialization started...")

	userBytes, err := uc.cache.Get(ctx, sessionID)
	if err != nil {
		return nil, err
	}
	if userBytes == nil {
		uc.logger.Warn("record not found")
		return nil, errors.New("record not found")
	}
	var user dom_user.User
	err = json.Unmarshal(userBytes, &user)
	if err != nil {
		uc.logger.Error("unmarshalling failed", slog.Any("err", err))
		return nil, err
	}

	uc.logger.Debug("publicfaucet controller initialized")

	return &user, nil
}
