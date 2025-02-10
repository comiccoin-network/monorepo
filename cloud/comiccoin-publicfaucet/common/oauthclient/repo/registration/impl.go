// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/registration/impl.go
package registration

import (
	"log/slog"
	"net/http"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/registration"
)

type registrationClientImpl struct {
	Logger     *slog.Logger
	Config     *config.Configuration
	HttpClient *http.Client
}

func NewRepository(appCfg *config.Configuration, loggerp *slog.Logger) dom_registration.Client {
	return &registrationClientImpl{
		Logger:     loggerp,
		Config:     appCfg,
		HttpClient: &http.Client{},
	}
}
