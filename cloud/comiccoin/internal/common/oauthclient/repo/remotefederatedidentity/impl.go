// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/remotefederatedidentity/impl.go
package remotefederatedidentity

import (
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/remotefederatedidentity"
)

type remoteFederatedIdentityImpl struct {
	Logger     *slog.Logger
	Config     *config.Configuration
	HttpClient *http.Client
}

func NewRepository(appCfg *config.Configuration, loggerp *slog.Logger) dom.Repository {
	return &remoteFederatedIdentityImpl{
		Logger:     loggerp,
		Config:     appCfg,
		HttpClient: &http.Client{},
	}
}
