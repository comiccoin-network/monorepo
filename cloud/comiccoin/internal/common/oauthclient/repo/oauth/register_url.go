// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauth/auth_url.go
package oauth

import (
	"fmt"
	"net/url"
)

func (impl *oauthClientImpl) GetRegistrationURL(state string) string {
	authURL := fmt.Sprintf("%s/gateway/ui/v1/register", impl.Config.OAuth.ServerURL)

	params := url.Values{}
	params.Add("redirect_uri", impl.Config.OAuth.ClientRedirectURI)
	params.Add("cancel_url", impl.Config.OAuth.ClientRegisterCancelURI)
	params.Add("success_uri", impl.Config.OAuth.ClientRegisterSuccessURI)
	params.Add("client_id", impl.Config.OAuth.ClientID)
	params.Add("state", state)

	return authURL + "?" + params.Encode()
}
