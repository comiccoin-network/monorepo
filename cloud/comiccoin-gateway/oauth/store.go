// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/oauth/store.go
package oauth

// AuthorizationStore defines the complete interface for managing OAuth authorizations,
// including both pending authorizations and issued authorization codes.
type AuthorizationStore interface {
	// Pending Authorization Methods
	StorePendingAuth(authID string, auth PendingAuthorization) error
	GetPendingAuth(authID string) (PendingAuthorization, error)
	DeletePendingAuth(authID string) error

	// Authorization Code Methods
	StoreAuthorizationCode(code string, auth AuthorizationCode) error
	GetAuthorizationCode(code string) (AuthorizationCode, error)
	DeleteAuthorizationCode(code string) error
}

// ClientService defines operations for managing and validating OAuth clients.
type ClientService interface {
	// ValidateClient checks if a client ID and redirect URI combination is valid
	ValidateClient(clientID, redirectURI string) (bool, error)

	// ValidateClientCredentials validates a client's credentials during token exchange
	ValidateClientCredentials(clientID, clientSecret string) (bool, error)

	// GetClient retrieves detailed client information
	GetClient(clientID string) (*Client, error)
}

// UserService handles user authentication during the OAuth flow
type UserService interface {
	// ValidateCredentials checks if the provided username and password are valid
	ValidateCredentials(username, password string) (bool, error)
}
