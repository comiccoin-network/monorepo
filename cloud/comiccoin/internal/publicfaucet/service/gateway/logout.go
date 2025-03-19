package gateway

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodbcache"
)

type GatewayLogoutService interface {
	Execute(ctx context.Context) error
}

type gatewayLogoutServiceImpl struct {
	logger *slog.Logger
	cache  mongodbcache.Cacher
}

func NewGatewayLogoutService(
	logger *slog.Logger,
	cach mongodbcache.Cacher,
) GatewayLogoutService {
	return &gatewayLogoutServiceImpl{logger, cach}
}

func (s *gatewayLogoutServiceImpl) Execute(ctx context.Context) error {
	// Extract from our session the following data.
	sessionID, ok := ctx.Value(constants.SessionID).(string)
	if !ok {
		s.logger.Warn("loggout could not happen - no session in mongo-cache")
		return httperror.NewForBadRequestWithSingleField("session_id", "not logged in")
	}

	if err := s.cache.Delete(ctx, sessionID); err != nil {
		s.logger.Error("cache delete error", slog.Any("err", err))
		return err
	}
	return nil
}
