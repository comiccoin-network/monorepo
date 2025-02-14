// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/application/model.go
package application

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Application represents a registered application that can request access through OAuth 2.0.
// This could be a mobile app, web application, or any other type of application that needs
// to access protected resources on behalf of federatedidentitys.
type Application struct {
	ID           primitive.ObjectID `bson:"_id,omitempty"`
	AppID        string             `bson:"app_id"`        // Public identifier for the application
	AppSecret    string             `bson:"app_secret"`    // Hashed secret used for authentication
	Name         string             `bson:"name"`          // Human-readable application name
	Description  string             `bson:"description"`   // Application description
	RedirectURIs []string           `bson:"redirect_uris"` // List of allowed callback URLs
	GrantTypes   []string           `bson:"grant_types"`   // Supported OAuth grant types
	Scopes       []string           `bson:"scopes"`        // Permissions this app can request
	Active       bool               `bson:"active"`        // Whether this application is enabled
	RateLimit    int                `bson:"rate_limit"`    // API rate limit per minute
	CreatedAt    time.Time          `bson:"created_at"`    // When the application was registered
	UpdatedAt    time.Time          `bson:"updated_at"`    // Last update timestamp
	LastUsedAt   time.Time          `bson:"last_used_at"`  // Last OAuth request timestamp
	TrustedApp   bool               `bson:"trusted_app"`   // Whether this is a first-party application
	ContactEmail string             `bson:"contact_email"` // Developer contact information
	LogoURL      string             `bson:"logo_url"`      // Application logo for consent screens
	TermsURL     string             `bson:"terms_url"`     // Link to application's terms of service
	PrivacyURL   string             `bson:"privacy_url"`   // Link to privacy policy
}
