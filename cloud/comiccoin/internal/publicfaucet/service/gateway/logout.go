package gateway

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
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
	sessionID := ctx.Value(constants.SessionID).(string)

	if err := s.cache.Delete(ctx, sessionID); err != nil {
		s.logger.Error("cache delete error", slog.Any("err", err))
		return err
	}
	return nil
}
