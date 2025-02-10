// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/oauth/auth_url.go
package oauth

import (
	"fmt"
	"net/url"
)

func (impl *oauthClientImpl) GetAuthorizationURL(state string) string {
	authURL := fmt.Sprintf("%s/oauth/authorize", impl.Config.OAuth.ServerURL)

	params := url.Values{}
	params.Add("response_type", "code")
	params.Add("client_id", impl.Config.OAuth.ClientID)
	params.Add("redirect_uri", impl.Config.OAuth.RedirectURI)
	params.Add("state", state)

	return authURL + "?" + params.Encode()
}
