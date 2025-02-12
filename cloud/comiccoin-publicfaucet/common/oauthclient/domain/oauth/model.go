// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/model.go
package oauth

import (
	"time"
)

type AuthorizationResponse struct {
	Code  string
	State string
}

type TokenResponse struct {
	AccessToken  string    `json:"access_token"`
	TokenType    string    `json:"token_type"`
	ExpiresIn    int       `json:"expires_in"`
	ExpiresAt    time.Time `json:"expires_at"`
	RefreshToken string    `json:"refresh_token"`
	Scope        string    `json:"scope"`
}

type IntrospectionResponse struct {
	Active    bool   `json:"active"`              // Indicates if the token is valid and active
	Scope     string `json:"scope,omitempty"`     // The scope associated with the token
	ClientID  string `json:"client_id,omitempty"` // Client ID the token was issued to
	Username  string `json:"username,omitempty"`  // Username of the resource owner
	ExpiresAt int64  `json:"exp,omitempty"`       // Token expiration timestamp
	IssuedAt  int64  `json:"iat,omitempty"`       // When the token was issued
	UserID    string `json:"user_id,omitempty"`
	Email     string `json:"email,omitempty"`
	FirstName string `json:"first_name,omitempty"`
	LastName  string `json:"last_name,omitempty"`
}
