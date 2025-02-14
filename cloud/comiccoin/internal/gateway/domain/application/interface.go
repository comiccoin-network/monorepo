// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/application/interface.go
package application

import (
	"context"
)

// Repository defines the interface for application persistence operations.
// This interface follows the repository pattern and provides methods for
// managing OAuth application registrations.
type Repository interface {
	// Create registers a new application
	Create(ctx context.Context, app *Application) error

	// FindByAppID retrieves an application by its public identifier
	FindByAppID(ctx context.Context, appID string) (*Application, error)

	// Update modifies an existing application's details
	Update(ctx context.Context, app *Application) error

	// Delete removes an application registration
	Delete(ctx context.Context, appID string) error

	// ValidateCredentials verifies application credentials
	ValidateCredentials(ctx context.Context, appID, appSecret string) (bool, error)

	// FindByScope retrieves all applications with a specific scope
	FindByScope(ctx context.Context, scope string) ([]*Application, error)

	// UpdateLastUsed updates the LastUsedAt timestamp
	UpdateLastUsed(ctx context.Context, appID string) error
}
