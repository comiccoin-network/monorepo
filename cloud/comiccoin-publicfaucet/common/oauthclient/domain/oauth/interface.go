// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/interface.go
package oauth

import "context"

type Client interface {
	// Initiates OAuth flow
	GetAuthorizationURL(state string) string

	// Exchanges authorization code for tokens
	ExchangeCode(ctx context.Context, code string) (*TokenResponse, error)

	// Validates token with authorization server
	IntrospectToken(ctx context.Context, token string) (*IntrospectionResponse, error)

	// Refreshes access token using refresh token
	RefreshToken(ctx context.Context, refreshToken string) (*TokenResponse, error)

	GetRegistrationURL(state string) string
}
