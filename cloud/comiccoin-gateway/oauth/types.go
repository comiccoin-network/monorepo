// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/oauth/types.go
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
// that is waiting for user authentication.
type PendingAuthorization struct {
	ClientID    string    // The ID of the client application requesting authorization
	RedirectURI string    // Where to send the user after authorization
	State       string    // CSRF protection token
	Scope       string    // Requested permissions
	ExpiresAt   time.Time // When this authorization request expires
}

// AuthorizationCode represents a code issued after successful user authentication
// that can be exchanged for an access token.
type AuthorizationCode struct {
	Code        string    // The authorization code itself
	ClientID    string    // The client this code was issued to
	RedirectURI string    // The redirect URI used in the initial request
	UserID      string    // The ID of the user who authorized the request
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
	AccessToken string `json:"access_token"` // The issued access token
	TokenType   string `json:"token_type"`   // Always "Bearer" in our implementation
	ExpiresIn   int    `json:"expires_in"`   // Token lifetime in seconds
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
