// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/oauth/model.go
package oauth

import "time"

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
	Active    bool   `json:"active"`
	Scope     string `json:"scope"`
	ClientID  string `json:"client_id"`
	ExpiresAt int64  `json:"exp"` // Change to int64 for Unix timestamp
	IssuedAt  int64  `json:"iat"` // Change to int64 for Unix timestamp
}
