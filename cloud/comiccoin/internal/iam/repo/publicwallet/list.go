package publicwallet

import (
	"context"
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
	"github.com/ethereum/go-ethereum/common"
)

// hasActiveFilters checks if any filters besides tenant_id are active
func (impl publicWalletImpl) hasActiveFilters(filter *dom.PublicWalletFilter) bool {
	return !filter.CreatedByUserID.IsZero() ||
		filter.CreatedAtStart != nil ||
		filter.CreatedAtEnd != nil
}

// buildCountMatchStage creates the match stage for the aggregation pipeline
func (impl publicWalletImpl) buildCountMatchStage(filter *dom.PublicWalletFilter) bson.M {
	match := bson.M{}

	if !filter.CreatedByUserID.IsZero() {
		match["created_by_user_id"] = filter.CreatedByUserID
	}

	// Date range filtering
	if filter.CreatedAtStart != nil || filter.CreatedAtEnd != nil {
		createdAtFilter := bson.M{}
		if filter.CreatedAtStart != nil {
			createdAtFilter["$gte"] = filter.CreatedAtStart
		}
		if filter.CreatedAtEnd != nil {
			createdAtFilter["$lte"] = filter.CreatedAtEnd
		}
		match["created_at"] = createdAtFilter
	}

	// Filter by the status.
	if filter.Status != 0 {
		match["status"] = filter.Status
	}
	return match
}

func (impl publicWalletImpl) CountByFilter(ctx context.Context, filter *dom.PublicWalletFilter) (uint64, error) {
	if filter == nil {
		return 0, errors.New("filter cannot be nil")
	}

	// For exact counts with filters
	if impl.hasActiveFilters(filter) {
		pipeline := []bson.D{
			{{Key: "$match", Value: impl.buildCountMatchStage(filter)}},
			{{Key: "$count", Value: "total"}},
		}

		// Use aggregation with allowDiskUse for large datasets
		opts := options.Aggregate().SetAllowDiskUse(true)
		cursor, err := impl.Collection.Aggregate(ctx, pipeline, opts)
		if err != nil {
			return 0, err
		}
		defer cursor.Close(ctx)

		// Decode the result
		var results []struct {
			Total int64 `bson:"total"`
		}
		if err := cursor.All(ctx, &results); err != nil {
			return 0, err
		}

		if len(results) == 0 {
			return 0, nil
		}

		return uint64(results[0].Total), nil
	}

	// For unfiltered counts (much faster for basic tenant-only filtering)
	countOpts := options.Count().SetHint("created_at_-1")
	match := bson.M{}

	count, err := impl.Collection.CountDocuments(ctx, match, countOpts)
	if err != nil {
		return 0, err
	}

	return uint64(count), nil
}

func (impl publicWalletImpl) buildMatchStage(filter *dom.PublicWalletFilter) bson.M {
	match := bson.M{}

	// Handle cursor-based pagination
	if filter.LastID != nil && filter.LastCreatedAt != nil {
		match["$or"] = []bson.M{
			{
				"created_at": bson.M{"$lt": filter.LastCreatedAt},
			},
			{
				"created_at": filter.LastCreatedAt,
				"_id":        bson.M{"$lt": filter.LastID},
			},
		}
	}

	// Add other filters
	if !filter.CreatedByUserID.IsZero() {
		match["created_by_user_id"] = filter.CreatedByUserID
	}

	if filter.CreatedAtStart != nil || filter.CreatedAtEnd != nil {
		createdAtFilter := bson.M{}
		if filter.CreatedAtStart != nil {
			createdAtFilter["$gte"] = filter.CreatedAtStart
		}
		if filter.CreatedAtEnd != nil {
			createdAtFilter["$lte"] = filter.CreatedAtEnd
		}
		match["created_at"] = createdAtFilter
	}

	// Filter by status
	if filter.Status != 0 {
		match["status"] = filter.Status
	}

	// Filter by type (individual or company)
	if filter.Type != nil {
		match["type"] = *filter.Type
	}

	// Filter by verification status
	if filter.IsVerified != nil {
		match["is_verified"] = *filter.IsVerified
	}

	// Handle text search and location filters
	orConditions := []bson.M{}
	locationOrConditions := []bson.M{}

	// Text search for name, description, and address
	if filter.Value != nil && *filter.Value != "" {
		searchValue := strings.TrimSpace(*filter.Value)
		if searchValue != "" {
			// For partial matches and case insensitivity, we use regex
			regexPattern := primitive.Regex{Pattern: searchValue, Options: "i"} // "i" for case insensitive

			// Add search conditions
			orConditions = append(orConditions,
				bson.M{"name": bson.M{"$regex": regexPattern}},
				bson.M{"description": bson.M{"$regex": regexPattern}},
				bson.M{"address": bson.M{"$regex": regexPattern}},
			)
		}
	}

	// Location search in city, region, country
	if filter.Location != nil && *filter.Location != "" {
		locationValue := strings.TrimSpace(*filter.Location)
		if locationValue != "" {
			regexPattern := primitive.Regex{Pattern: locationValue, Options: "i"}

			// Add location search conditions
			locationOrConditions = append(locationOrConditions,
				bson.M{"city": bson.M{"$regex": regexPattern}},
				bson.M{"region": bson.M{"$regex": regexPattern}},
				bson.M{"country": bson.M{"$regex": regexPattern}},
			)
		}
	}

	// Combine the search conditions appropriately
	if len(orConditions) > 0 {
		if len(locationOrConditions) > 0 {
			// If we have both text search and location filters, we need to use $and to combine them
			match["$and"] = []bson.M{
				{"$or": orConditions},
				{"$or": locationOrConditions},
			}
		} else {
			// If we only have text search, just use $or
			match["$or"] = orConditions
		}
	} else if len(locationOrConditions) > 0 {
		// If we only have location filters, just use $or
		match["$or"] = locationOrConditions
	}

	return match
}

func (impl publicWalletImpl) ListByFilter(ctx context.Context, filter *dom.PublicWalletFilter) (*dom.PublicWalletFilterResult, error) {
	if filter == nil {
		return nil, errors.New("filter cannot be nil")
	}

	// Default limit if not specified
	if filter.Limit <= 0 {
		filter.Limit = 100
	}

	// Request one more document than needed to determine if there are more results
	limit := filter.Limit + 1

	// Build the aggregation pipeline
	pipeline := make([]bson.D, 0)

	// Match stage - initial filtering
	matchStage := bson.D{{"$match", impl.buildMatchStage(filter)}}
	pipeline = append(pipeline, matchStage)

	// Sort stage
	sortStage := bson.D{{"$sort", bson.D{
		{"created_at", -1},
		{"_id", -1},
	}}}
	pipeline = append(pipeline, sortStage)

	// Limit stage
	limitStage := bson.D{{"$limit", limit}}
	pipeline = append(pipeline, limitStage)

	// Execute aggregation
	opts := options.Aggregate().SetAllowDiskUse(true)
	cursor, err := impl.Collection.Aggregate(ctx, pipeline, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	// Decode results
	var publicWallets []*dom.PublicWallet
	if err := cursor.All(ctx, &publicWallets); err != nil {
		return nil, err
	}

	// Handle empty results case
	if len(publicWallets) == 0 {
		// impl.Logger.Debug("Empty list", slog.Any("filter", filter))
		return &dom.PublicWalletFilterResult{
			PublicWallets: make([]*dom.PublicWallet, 0),
			HasMore:       false,
		}, nil
	}

	// Check if there are more results
	hasMore := false
	if len(publicWallets) > int(filter.Limit) {
		hasMore = true
		publicWallets = publicWallets[:len(publicWallets)-1]
	}

	// Get last document info for next page
	lastDoc := publicWallets[len(publicWallets)-1]

	return &dom.PublicWalletFilterResult{
		PublicWallets: publicWallets,
		HasMore:       hasMore,
		LastID:        lastDoc.ID,
		LastCreatedAt: lastDoc.CreatedAt,
	}, nil
}

func (impl publicWalletImpl) ListAllAddresses(ctx context.Context) ([]*common.Address, error) {
	// Create an empty collection to hold our results
	var results []dom.PublicWallet

	// Set up our find options to only get the "address" field
	opts := options.Find().SetProjection(bson.D{{Key: "address", Value: 1}})

	// Execute the find operation
	cursor, err := impl.Collection.Find(ctx, bson.D{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	// Decode all documents into our struct
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	// Extract the addresses and convert them to common.Address pointers
	addresses := make([]*common.Address, len(results))
	for i, result := range results {
		addresses[i] = result.Address
	}

	return addresses, nil
}
