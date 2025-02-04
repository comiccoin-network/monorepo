package domain

import (
	"context"

	"github.com/ethereum/go-ethereum/common"
)

type GetLatestBlockTransactionByAddressServerSentEventsDTORepository interface {
	SubscribeToBlockchainAuthority(ctx context.Context, address *common.Address) (<-chan string, error)
}
