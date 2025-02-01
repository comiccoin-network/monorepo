package repo

import (
	"bytes"
	"context"
	"encoding/hex"
	"fmt"
	"log"
	"log/slog"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type BlockDataRepo struct {
	config     *config.Configuration
	logger     *slog.Logger
	dbClient   *mongo.Client
	collection *mongo.Collection
}

func NewBlockDataRepo(cfg *config.Configuration, logger *slog.Logger, client *mongo.Client) *BlockDataRepo {
	// ctx := context.Background()
	uc := client.Database(cfg.DB.Name).Collection("blockdata")

	// // For debugging purposes only or if you are going to recreate new indexes.
	// if _, err := uc.Indexes().DropAll(context.TODO()); err != nil {
	// 	logger.Warn("failed deleting all indexes for blockdata",
	// 		slog.Any("err", err))
	//
	// 	// Do not crash app, just continue.
	// }

	// Note:
	// * 1 for ascending
	// * -1 for descending
	// * "text" for text indexes

	// The following few lines of code will create the index for our app for this
	// colleciton.
	_, err := uc.Indexes().CreateMany(context.TODO(), []mongo.IndexModel{
		{Keys: bson.D{{Key: "hash", Value: 1}}},
		{Keys: bson.D{{Key: "header.chain_id", Value: 1}}},
		{Keys: bson.D{{Key: "header.number", Value: 1}}},
		{Keys: bson.D{{Key: "header.timestamp", Value: 1}}},
		{Keys: bson.D{{Key: "trans.signedtransaction.transaction.nonce_bytes", Value: 1}}},
		{Keys: bson.D{
			{Key: "hash", Value: "text"},
		}},
	})
	if err != nil {
		// It is important that we crash the app on startup to meet the
		// requirements of `google/wire` framework.
		log.Fatal(err)
	}

	return &BlockDataRepo{
		config:     cfg,
		logger:     logger,
		dbClient:   client,
		collection: uc,
	}
}

// includeJSONStrings method will include the `_string` fields in our domain model.
func (r *BlockDataRepo) includeJSONStrings(blockData *domain.BlockData) {
	if blockData != nil {
		// Header remains the same
		blockData.Header.NumberString = blockData.Header.GetNumber().String()
		blockData.Header.NonceString = blockData.Header.GetNonce().String()
		blockData.Header.LatestTokenIDString = blockData.Header.GetLatestTokenID().String()

		// Transactions - key change is using index-based iteration
		for i := range blockData.Trans {
			// Get pointer to the actual transaction in the slice
			tx := &blockData.Trans[i]

			if !tx.SignedTransaction.Transaction.IsNonceZero() {
				tx.SignedTransaction.Transaction.NonceString = tx.SignedTransaction.Transaction.GetNonce().String()
			}

			if !tx.SignedTransaction.Transaction.IsTokenIDZero() {
				tx.SignedTransaction.Transaction.TokenIDString = tx.SignedTransaction.Transaction.GetTokenID().String()
			}
			if !tx.SignedTransaction.Transaction.IsTokenNonceZero() {
				tx.SignedTransaction.Transaction.TokenNonceString = tx.SignedTransaction.Transaction.GetTokenNonce().String()
			}
			if tx.SignedTransaction.Transaction.Data != nil {
				tx.SignedTransaction.Transaction.DataString = string(tx.SignedTransaction.Transaction.Data)
			}
		}
	}
}

func (r *BlockDataRepo) Upsert(ctx context.Context, blockdata *domain.BlockData) error {
	opts := options.Update().SetUpsert(true)
	_, err := r.collection.UpdateOne(ctx, bson.M{"hash": blockdata.Hash}, bson.M{"$set": blockdata}, opts)
	return err
}

func (r *BlockDataRepo) GetByHash(ctx context.Context, hash string) (*domain.BlockData, error) {
	var blockData domain.BlockData
	err := r.collection.FindOne(ctx, bson.M{"hash": hash}).Decode(&blockData)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	r.includeJSONStrings(&blockData)
	return &blockData, nil
}

func (r *BlockDataRepo) GetByHeaderNumber(ctx context.Context, headerNumber *big.Int) (*domain.BlockData, error) {
	var blockData domain.BlockData
	err := r.collection.FindOne(ctx, bson.M{"header.number_bytes": headerNumber.Bytes()}).Decode(&blockData)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	r.includeJSONStrings(&blockData)
	return &blockData, nil
}

func (r *BlockDataRepo) GetByTransactionNonce(ctx context.Context, txNonce *big.Int) (*domain.BlockData, error) {
	if txNonce == nil {
		return nil, fmt.Errorf("transaction nonce cannot be nil")
	}

	// Convert big.Int to bytes for matching against BinData in MongoDB
	nonceBytes := txNonce.Bytes()

	// Create filter to search for transactions with matching nonce
	filter := bson.M{
		"trans": bson.M{
			"$elemMatch": bson.M{
				"signedtransaction.transaction.nonce_bytes": nonceBytes,
			},
		},
	}

	var blockData domain.BlockData
	err := r.collection.FindOne(ctx, filter).Decode(&blockData)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // No document found
		}
		return nil, fmt.Errorf("failed to get block by transaction nonce: %v", err)
	}

	r.includeJSONStrings(&blockData)

	// Validate that we actually found a matching transaction
	for _, trans := range blockData.Trans {
		if bytes.Equal(trans.SignedTransaction.Transaction.NonceBytes, nonceBytes) {
			return &blockData, nil
		}
	}

	// This case shouldn't happen if the index and query are working correctly,
	// but it's good practice to verify
	return nil, fmt.Errorf("inconsistent state: matching block found but no matching transaction")

}

func (r *BlockDataRepo) ListByChainID(ctx context.Context, chainID uint16) ([]*domain.BlockData, error) {
	blockDatas := make([]*domain.BlockData, 0)
	filter := bson.M{"header.chain_id": chainID}
	cur, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	for cur.Next(ctx) {
		var blockData domain.BlockData
		err := cur.Decode(&blockData)
		if err != nil {
			return nil, err
		}
		r.includeJSONStrings(&blockData)
		blockDatas = append(blockDatas, &blockData)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return blockDatas, nil
}

// ListInHashes method is deprecated.
func (r *BlockDataRepo) ListInHashes(ctx context.Context, hashes []string) ([]*domain.BlockData, error) {
	blockDatas := make([]*domain.BlockData, 0)
	filter := bson.M{
		"hash": bson.M{
			"$in": hashes,
		},
	}
	cur, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	for cur.Next(ctx) {
		var blockData domain.BlockData
		err := cur.Decode(&blockData)
		if err != nil {
			return nil, err
		}
		r.includeJSONStrings(&blockData)
		blockDatas = append(blockDatas, &blockData)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return blockDatas, nil
}

// ListInBetweenBlockNumbersForChainID method is deprecated.
func (r *BlockDataRepo) ListInBetweenBlockNumbersForChainID(ctx context.Context, startBlockNumber, finishBlockNumber uint64, chainID uint16) ([]*domain.BlockData, error) {
	blockDatas := make([]*domain.BlockData, 0)
	filter := bson.M{
		"header.chain_id": chainID,
		"header.number": bson.M{
			"$gte": startBlockNumber,
			"$lte": finishBlockNumber,
		},
	}
	cur, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	for cur.Next(ctx) {
		var blockData domain.BlockData
		err := cur.Decode(&blockData)
		if err != nil {
			return nil, err
		}
		r.includeJSONStrings(&blockData)
		blockDatas = append(blockDatas, &blockData)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return blockDatas, nil
}

func (r *BlockDataRepo) DeleteByHash(ctx context.Context, hash string) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"hash": hash})
	return err
}

// ListBlockNumberByHashArrayForChainID method is deprecated.
func (r *BlockDataRepo) ListBlockNumberByHashArrayForChainID(ctx context.Context, chainID uint16) ([]domain.BlockNumberByHash, error) {
	blockNumberByHashArray := make([]domain.BlockNumberByHash, 0)
	projection := bson.M{
		"_id":    0,
		"number": 1,
		"hash":   1,
	}
	filter := bson.M{
		"header.chain_id": chainID,
	}
	opts := options.Find().SetProjection(projection)
	cur, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var blockData domain.BlockNumberByHash
	for cur.Next(ctx) {
		err := cur.Decode(&blockData)
		if err != nil {
			return nil, err
		}
		blockNumberByHashArray = append(blockNumberByHashArray, blockData)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return blockNumberByHashArray, nil
}

// ListUnorderedHashArrayForChainID method is deprecated.
func (r *BlockDataRepo) ListUnorderedHashArrayForChainID(ctx context.Context, chainID uint16) ([]string, error) {
	hashArray := make([]string, 0)
	projection := bson.M{
		"_id":  0,
		"hash": 1,
	}
	filter := bson.M{
		"header.chain_id": chainID,
	}
	opts := options.Find().SetProjection(projection)
	cur, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var blockData struct {
		Hash string `bson:"hash"`
	}
	for cur.Next(ctx) {
		err := cur.Decode(&blockData)
		if err != nil {
			return nil, err
		}
		hashArray = append(hashArray, blockData.Hash)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return hashArray, nil
}

func (r *BlockDataRepo) ListBlockTransactionsByAddress(ctx context.Context, address *common.Address) ([]*domain.BlockTransaction, error) {
	// Result slice
	var blockTransactions []*domain.BlockTransaction

	// Dereference the address pointer for the query
	if address == nil {
		return nil, fmt.Errorf("address cannot be nil")
	}
	// Decode the hex string (strip "0x" prefix)
	addressBytes, err := hex.DecodeString(address.Hex()[2:])
	if err != nil {
		return nil, fmt.Errorf("failed to decode address: %v", err)
	}

	// MongoDB filter
	filter := bson.M{
		"trans": bson.M{
			"$elemMatch": bson.M{
				"$or": []bson.M{
					{"signedtransaction.transaction.from": addressBytes},
					{"signedtransaction.transaction.to": addressBytes},
				},
			},
		},
	}

	// Execute the query
	cur, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	// Iterate over the cursor
	for cur.Next(ctx) {
		var blockData domain.BlockData
		if err := cur.Decode(&blockData); err != nil {
			return nil, err
		}

		// Filter transactions by `from` or `to` address
		for _, blocktx := range blockData.Trans {
			if (blocktx.SignedTransaction.Transaction.From != nil && bytes.Equal(blocktx.SignedTransaction.Transaction.From.Bytes(), addressBytes)) ||
				(blocktx.SignedTransaction.Transaction.To != nil && bytes.Equal(blocktx.SignedTransaction.Transaction.To.Bytes(), addressBytes)) {

				if !blocktx.SignedTransaction.IsNonceZero() {
					blocktx.SignedTransaction.NonceString = blocktx.SignedTransaction.GetNonce().String()
				}

				if !blocktx.IsTokenIDZero() {
					blocktx.SignedTransaction.TokenIDString = blocktx.SignedTransaction.GetTokenID().String()
				}
				if !blocktx.IsTokenNonceZero() {
					blocktx.SignedTransaction.TokenNonceString = blocktx.SignedTransaction.GetTokenNonce().String()
				}

				blockTransactions = append(blockTransactions, &blocktx)
			}
		}
	}

	// Check for cursor errors
	if err := cur.Err(); err != nil {
		return nil, err
	}

	return blockTransactions, nil
}

func (r *BlockDataRepo) ListWithLimitForBlockTransactionsByAddress(ctx context.Context, address *common.Address, limit int64) ([]*domain.BlockTransaction, error) {
	// Result slice
	// Result slice
	var blockTransactions []*domain.BlockTransaction

	// Dereference the address pointer for the query
	if address == nil {
		return nil, fmt.Errorf("address cannot be nil")
	}
	// Decode the hex string (strip "0x" prefix)
	addressBytes, err := hex.DecodeString(address.Hex()[2:])
	if err != nil {
		return nil, fmt.Errorf("failed to decode address: %v", err)
	}

	// MongoDB filter
	filter := bson.M{
		"trans": bson.M{
			"$elemMatch": bson.M{
				"$or": []bson.M{
					{"signedtransaction.transaction.from": addressBytes},
					{"signedtransaction.transaction.to": addressBytes},
				},
			},
		},
	}
	options := options.Find().SetLimit(limit)

	// Execute the query
	cur, err := r.collection.Find(ctx, filter, options)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	// Iterate over the cursor
	for cur.Next(ctx) {
		var blockData domain.BlockData
		if err := cur.Decode(&blockData); err != nil {
			return nil, err
		}

		// Filter transactions by `from` or `to` address
		for _, blocktx := range blockData.Trans {
			if (blocktx.SignedTransaction.Transaction.From != nil && bytes.Equal(blocktx.SignedTransaction.Transaction.From.Bytes(), addressBytes)) ||
				(blocktx.SignedTransaction.Transaction.To != nil && bytes.Equal(blocktx.SignedTransaction.Transaction.To.Bytes(), addressBytes)) {

				if !blocktx.SignedTransaction.IsNonceZero() {
					blocktx.SignedTransaction.NonceString = blocktx.SignedTransaction.GetNonce().String()
				}

				if !blocktx.IsTokenIDZero() {
					blocktx.SignedTransaction.TokenIDString = blocktx.SignedTransaction.GetTokenID().String()
				}
				if !blocktx.IsTokenNonceZero() {
					blocktx.SignedTransaction.TokenNonceString = blocktx.SignedTransaction.GetTokenNonce().String()
				}

				blockTransactions = append(blockTransactions, &blocktx)
			}
		}
	}

	// Check for cursor errors
	if err := cur.Err(); err != nil {
		return nil, err
	}

	return blockTransactions, nil
}

func (r *BlockDataRepo) GetByBlockTransactionTimestamp(ctx context.Context, timestamp uint64) (*domain.BlockData, error) {
	var blockData domain.BlockData
	err := r.collection.FindOne(ctx, bson.M{"trans": bson.M{"$elemMatch": bson.M{"signed_transaction.timestamp": timestamp}}}).
		Decode(&blockData)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	r.includeJSONStrings(&blockData)
	return &blockData, nil
}

func (r *BlockDataRepo) GetLatestBlockTransactionByAddress(ctx context.Context, address *common.Address) (*domain.BlockTransaction, error) {
	// Dereference the address pointer for the query
	if address == nil {
		return nil, fmt.Errorf("address cannot be nil")
	}

	// Decode the hex string (strip "0x" prefix)
	addressBytes, err := hex.DecodeString(address.Hex()[2:])
	if err != nil {
		return nil, fmt.Errorf("failed to decode address: %v", err)
	}

	// MongoDB aggregation pipeline to:
	// 1. Unwind the `trans` array to work with individual transactions.
	// 2. Match transactions involving the given address.
	// 3. Sort transactions by timestamp in descending order.
	// 4. Limit the result to 1 (latest transaction).
	pipeline := []bson.M{
		{"$unwind": "$trans"},
		{"$match": bson.M{
			"$or": []bson.M{
				{"trans.signedtransaction.transaction.from": addressBytes},
				{"trans.signedtransaction.transaction.to": addressBytes},
			},
		}},
		{"$sort": bson.M{"trans.timestamp": -1}},
		{"$limit": 1},
		{"$replaceRoot": bson.M{"newRoot": "$trans"}}, // Promote the transaction to the root level
	}

	// Execute the aggregation pipeline
	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("failed to execute aggregation pipeline: %v", err)
	}
	defer cursor.Close(ctx)

	// Decode the result into a BlockTransaction
	if cursor.Next(ctx) {
		var blockTx domain.BlockTransaction
		if err := cursor.Decode(&blockTx); err != nil {
			return nil, fmt.Errorf("failed to decode transaction: %v", err)
		}

		// Set additional fields if needed
		if !blockTx.SignedTransaction.IsNonceZero() {
			blockTx.SignedTransaction.NonceString = blockTx.SignedTransaction.GetNonce().String()
		}
		if !blockTx.IsTokenIDZero() {
			blockTx.SignedTransaction.TokenIDString = blockTx.SignedTransaction.GetTokenID().String()
		}
		if !blockTx.IsTokenNonceZero() {
			blockTx.SignedTransaction.TokenNonceString = blockTx.SignedTransaction.GetTokenNonce().String()
		}

		return &blockTx, nil
	}

	// If no matching transaction is found
	return nil, nil
}

func (r *BlockDataRepo) GetLatestTokenIDByChainID(ctx context.Context, chainID uint16) (*big.Int, error) {
	// Create an aggregation pipeline to find the latest token ID
	pipeline := []bson.M{
		// Unwind the transactions array to work with individual transactions
		{"$unwind": "$trans"},

		// Match only token transactions for the specified chain ID
		{"$match": bson.M{
			"trans.signedtransaction.transaction.chain_id": chainID,
			"trans.signedtransaction.transaction.type":     "token",
			"trans.signedtransaction.transaction.token_id_bytes": bson.M{
				"$exists": true,
				"$ne":     nil,
			},
		}},

		// Sort by token_id_bytes in descending order to get the highest token ID
		{"$sort": bson.M{"trans.signedtransaction.transaction.token_id_bytes": -1}},

		// Take only the first result (highest token ID)
		{"$limit": 1},

		// Project only the token_id_bytes field
		{"$project": bson.M{
			"token_id_bytes": "$trans.signedtransaction.transaction.token_id_bytes",
		}},
	}

	// Execute the aggregation pipeline
	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("failed to execute aggregation pipeline: %v", err)
	}
	defer cursor.Close(ctx)

	// Check if we found any results
	if !cursor.Next(ctx) {
		// No tokens found for this chain ID - return zero
		return big.NewInt(0), nil
	}

	// Decode the result
	var result struct {
		TokenIDBytes []byte `bson:"token_id_bytes"`
	}
	if err := cursor.Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode token ID: %v", err)
	}

	// Convert the bytes back to a big.Int
	if len(result.TokenIDBytes) == 0 {
		return big.NewInt(0), nil
	}

	tokenID := new(big.Int)
	tokenID.SetBytes(result.TokenIDBytes)

	return tokenID, nil
}

func (r *BlockDataRepo) OpenTransaction() error {
	defer log.Fatal("Unsupported feature in the `comiccoin-authority` repository.")
	return nil
}

func (r *BlockDataRepo) CommitTransaction() error {
	defer log.Fatal("Unsupported feature in the `comiccoin-authority` repository.")
	return nil
}

func (r *BlockDataRepo) DiscardTransaction() {
	log.Fatal("Unsupported feature in the `comiccoin-authority` repository.")
}
