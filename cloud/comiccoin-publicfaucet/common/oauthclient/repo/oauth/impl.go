// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/oauth/impl.go
package oauth

import (
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/oauth"
)

type oauthClientImpl struct {
	Logger     *slog.Logger
	Config     *config.Configuration
	HttpClient *http.Client
}

func NewRepository(appCfg *config.Configuration, loggerp *slog.Logger) dom_oauth.Client {
	if appCfg == nil {
		panic("configuration is required")
	}
	if loggerp == nil {
		panic("logger is required")
	}
	return &oauthClientImpl{
		Logger:     loggerp,
		Config:     appCfg,
		HttpClient: &http.Client{},
	}
}
