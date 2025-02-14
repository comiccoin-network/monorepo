// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/security/oauth/types.go
package oauth

import (
	"errors"
	"time"
)

// Common errors that may occur during OAuth operations
var (
	ErrAuthorizationNotFound = errors.New("authorization not found")
	ErrInvalidClient         = errors.New("invalid client")
	ErrInvalidCredentials    = errors.New("invalid credentials")
)

// PendingAuthorization represents a pending OAuth authorization request
// that is waiting for federatedidentity authentication.
type PendingAuthorization struct {
	ClientID    string    // The ID of the client application requesting authorization
	RedirectURI string    // Where to send the federatedidentity after authorization
	State       string    // CSRF protection token
	Scope       string    // Requested permissions
	ExpiresAt   time.Time // When this authorization request expires
}

// AuthorizationCode represents a code issued after successful federatedidentity authentication
// that can be exchanged for an access token.
type AuthorizationCode struct {
	Code        string    // The authorization code itself
	ClientID    string    // The client this code was issued to
	RedirectURI string    // The redirect URI used in the initial request
	FederatedIdentityID      string    // The ID of the federatedidentity who authorized the request
	Scope       string    // The authorized scope
	ExpiresAt   time.Time // When this code expires
}

// Client represents an OAuth client application registered with our service.
type Client struct {
	ID          string // The client's unique identifier
	Secret      string // The client's secret (should be hashed in production)
	RedirectURI string // The allowed redirect URI for this client
}

// TokenResponse represents the response sent to clients when they exchange
// an authorization code for an access token.
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token,omitempty"`
	Scope        string `json:"scope,omitempty"`
}

// Token represents a stored access or refresh token
type Token struct {
	TokenID   string    // The token itself
	TokenType string    // "access" or "refresh"
	FederatedIdentityID    string    // The federatedidentity this token belongs to
	ClientID  string    // The client this token was issued to
	Scope     string    // The token's authorized scope
	ExpiresAt time.Time // When this token expires
	IsRevoked bool      // Whether this token has been revoked
}

// TokenStore manages access and refresh tokens
type TokenStore interface {
	// StoreToken stores a new token
	StoreToken(token *Token) error

	// GetToken retrieves a token by its ID
	GetToken(tokenID string) (*Token, error)

	// RevokeToken marks a token as revoked
	RevokeToken(tokenID string) error

	// RevokeAllFederatedIdentityTokens revokes all tokens for a federatedidentity
	RevokeAllFederatedIdentityTokens(federatedidentityID string) error
}

// IntrospectionResponse represents the OAuth 2.0 token introspection response
type IntrospectionResponse struct {
	Active    bool   `json:"active"`              // Is the token active?
	Scope     string `json:"scope,omitempty"`     // The token's scope
	ClientID  string `json:"client_id,omitempty"` // Client ID the token was issued to
	Username  string `json:"username,omitempty"`  // Username of the resource owner
	ExpiresAt int64  `json:"exp,omitempty"`       // Token expiration timestamp
	IssuedAt  int64  `json:"iat,omitempty"`       // When the token was issued
}

// ValidationError represents an OAuth 2.0 protocol error
// as defined in RFC 6749 Section 4.1.2.1
type ValidationError struct {
	ErrorCode        string // Standard OAuth error code
	ErrorDescription string // Human-readable error description
	State            string // State parameter from the original request
}

func (e *ValidationError) Error() string {
	if e.ErrorDescription != "" {
		return e.ErrorCode + ": " + e.ErrorDescription
	}
	return e.ErrorCode
}
