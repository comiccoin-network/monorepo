// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauth/types.go
package oauth

import "fmt"

// oauthErrorResponse represents the OAuth 2.0 error response format from the server
type oauthErrorResponse struct {
	Error            string `json:"error"`             // OAuth 2.0 error code
	ErrorDescription string `json:"error_description"` // Human-readable error description
}

// CodeAlreadyUsedError represents a specific error case where an authorization code
// has already been exchanged for tokens
type CodeAlreadyUsedError struct {
	Code    string // The authorization code that was used
	Message string // The error message from the server
}

// Error implements the error interface for CodeAlreadyUsedError
func (e *CodeAlreadyUsedError) Error() string {
	return fmt.Sprintf("authorization code already used: %s", e.Message)
}
