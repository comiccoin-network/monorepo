// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/faucet/model.go
package domain

import (
	"math/big"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Faucet struct {
	ID                         primitive.ObjectID `bson:"_id" json:"id"`
	ChainID                    uint16             `bson:"chain_id" json:"chain_id"`
	Balance                    *big.Int           `bson:"balance" json:"balance"`
	UsersCount                 uint16             `bson:"users_count" json:"users_count"`
	TotalCoinsDistributed      *big.Int           `bson:"total_coins_distributed" json:"total_coins_distributed"`
	TotalTransactions          uint16             `bson:"total_transactions" json:"total_transactions"`
	DistributationRatePerDay   uint16             `bson:"distribution_rate_per_day" json:"distribution_rate_per_day"`
	TotalCoinsDistributedToday uint16             `bson:"total_coins_distributed_today" json:"total_coins_distributed_today"`
	TotalTransactionsToday     uint16             `bson:"total_transactions_today" json:"total_transactions_today"`
	CreatedAt                  time.Time          `bson:"created_at,omitempty" json:"created_at,omitempty"`
	LastModifiedAt             time.Time          `bson:"last_modified_at,omitempty" json:"last_modified_at,omitempty"`
}
