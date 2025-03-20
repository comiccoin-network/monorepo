// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/iam/model.go
package iam

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Faucet struct {
	ID         primitive.ObjectID `bson:"_id" json:"id"`
	ChainID    uint16             `bson:"chain_id" json:"chain_id"`
	Balance    uint64             `bson:"balance" json:"balance"`
	UsersCount uint64             `bson:"users_count" json:"users_count"`

	TotalCoinsDistributed uint64 `bson:"total_coins_distributed" json:"total_coins_distributed"`
	TotalTransactions     uint64 `bson:"total_transactions" json:"total_transactions"`

	DistributationRatePerDay   uint64 `bson:"distribution_rate_per_day" json:"distribution_rate_per_day"`
	TotalCoinsDistributedToday uint64 `bson:"total_coins_distributed_today" json:"total_coins_distributed_today"`
	TotalTransactionsToday     uint64 `bson:"total_transactions_today" json:"total_transactions_today"`

	CreatedAt      time.Time `bson:"created_at,omitempty" json:"created_at,omitempty"`
	LastModifiedAt time.Time `bson:"last_modified_at,omitempty" json:"last_modified_at,omitempty"`
}
