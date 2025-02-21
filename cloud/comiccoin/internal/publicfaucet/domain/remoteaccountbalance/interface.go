// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/remoteaccountbalance/interface.go
package domain

import (
	"context"

	"github.com/ethereum/go-ethereum/common"
)

// Repository Interface for Faucet.
type Repository interface {
	FetchFromAuthority(ctx context.Context, addr *common.Address) (*RemoteAccountBalance, error)
}
