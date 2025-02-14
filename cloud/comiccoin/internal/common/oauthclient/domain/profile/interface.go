// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/profile/interface.go
package domain

import (
	"context"
)

// Repository Interface for federatedidentity.
type Repository interface {
	FetchProfileFromComicCoinGateway(ctx context.Context, accessToken string) (*ComicCoinProfile, error)
}
