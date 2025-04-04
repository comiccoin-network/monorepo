package publicwallet

import (
	"context"
	"errors"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"

	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
)

// GetTotalViewCountByFilter calculates the total ViewCount for wallets matching the given filter
func (impl publicWalletImpl) GetTotalViewCountByFilter(ctx context.Context, filter *dom.PublicWalletFilter) (uint64, error) {
	if filter == nil {
		return 0, errors.New("filter cannot be nil")
	}

	// Create a copy of the filter without pagination data to get all matches
	filterCopy := *filter
	filterCopy.LastID = nil
	filterCopy.LastCreatedAt = nil

	// Build the aggregation pipeline
	pipeline := make([]bson.D, 0)

	// Match stage - initial filtering (using existing buildMatchStage without pagination)
	matchStage := bson.D{{"$match", impl.buildMatchStage(&filterCopy)}}
	pipeline = append(pipeline, matchStage)

	// Group stage - sum the view_count field
	groupStage := bson.D{{"$group", bson.D{
		{"_id", nil},
		{"total_view_count", bson.D{{"$sum", "$view_count"}}},
	}}}
	pipeline = append(pipeline, groupStage)

	// Execute aggregation
	opts := options.Aggregate().SetAllowDiskUse(true)
	cursor, err := impl.Collection.Aggregate(ctx, pipeline, opts)
	if err != nil {
		impl.Logger.Error("database get total view count error", slog.Any("error", err))
		return 0, err
	}
	defer cursor.Close(ctx)

	// Decode result
	var results []struct {
		TotalViewCount int64 `bson:"total_view_count"`
	}
	if err := cursor.All(ctx, &results); err != nil {
		impl.Logger.Error("database decode total view count error", slog.Any("error", err))
		return 0, err
	}

	// If no results, return 0
	if len(results) == 0 {
		return 0, nil
	}

	return uint64(results[0].TotalViewCount), nil
}
