// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauth/auth_url.go
package oauth

import (
	"fmt"
	"net/url"
)

func (impl *oauthClientImpl) GetAuthorizationURL(state string) string {
	authURL := fmt.Sprintf("%s/gateway/ui/v1/authorize-or-login", impl.Config.OAuth.ServerURL)

	params := url.Values{}
	params.Add("response_type", "code")
	params.Add("client_id", impl.Config.OAuth.ClientID)
	params.Add("redirect_uri", impl.Config.OAuth.ClientRedirectURI)
	params.Add("cancel_url", impl.Config.OAuth.ClientAuthorizeOrLoginCancelURI)
	params.Add("success_uri", impl.Config.OAuth.ClientAuthorizeOrLoginSuccessURI)
	params.Add("state", state)

	return authURL + "?" + params.Encode()
}
