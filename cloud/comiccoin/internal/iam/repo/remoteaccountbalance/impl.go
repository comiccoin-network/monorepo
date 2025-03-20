// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/remoteaccountbalance/repo/fetch.go
package remoteaccountbalance

import (
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/remoteaccountbalance"
)

type remoteAccountBalanceImpl struct {
	Logger     *slog.Logger
	Config     *config.Configuration
	HttpClient *http.Client
}

func NewRepository(appCfg *config.Configuration, loggerp *slog.Logger) dom.Repository {
	return &remoteAccountBalanceImpl{
		Logger:     loggerp,
		Config:     appCfg,
		HttpClient: &http.Client{},
	}
}
