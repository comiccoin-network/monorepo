package faucet

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
)

func (impl faucetImpl) CheckIfExistsByChainID(ctx context.Context, chainID uint16) (bool, error) {
	filter := bson.M{"chain_id": chainID}
	count, err := impl.Collection.CountDocuments(ctx, filter)
	if err != nil {
		return false, fmt.Errorf("failed to check if chainID exists: %w", err)
	}
	return count > 0, nil
}
