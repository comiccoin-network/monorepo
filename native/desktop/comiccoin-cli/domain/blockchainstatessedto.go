package domain

import (
	"context"
)

//
// Copied from `github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain`
//

// BlockchainStateChangeEventRepository is an interface that defines the methods for
// handling the blockchain state via the network using server sent events (SSE).
type BlockchainStateServerSentEventsDTORepository interface {
	SubscribeToBlockchainAuthority(ctx context.Context, chainID uint16) (<-chan string, error)
}
