// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/remotefederatedidentity/interface.go
package domain

import (
	"context"
)

// Repository Interface for remotefederatedidentity.
type Repository interface {
	FetchFromRemoteByAccessToken(ctx context.Context, accessToken string) (*RemoteFederatedIdentityDTO, error)
	PostUpdateToRemote(ctx context.Context, req *RemoteFederatedIdentityDTO, accessToken string) error
}
