package repo

import (
	"context"
	"errors"
	"log"
	"log/slog"
	"math/big"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type bannedIPAddressImpl struct {
	Logger     *slog.Logger
	DbClient   *mongo.Client
	Collection *mongo.Collection
}

func NewBannedIPAddressRepository(appCfg *config.Configuration, loggerp *slog.Logger, client *mongo.Client) domain.BannedIPAddressRepository {
	// ctx := context.Background()
	uc := client.Database(appCfg.DB.Name).Collection("banned_ip_addresses")

	// // For debugging purposes only or if you are going to recreate new indexes.
	// if _, err := uc.Indexes().DropAll(context.TODO()); err != nil {
	// 	loggerp.Warn("failed deleting all indexes",
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
		{Keys: bson.D{{Key: "user_id", Value: 1}}},
		{Keys: bson.D{
			{Key: "value", Value: "text"},
		}},
	})
	if err != nil {
		// It is important that we crash the app on startup to meet the
		// requirements of `google/wire` framework.
		log.Fatal(err)
	}

	s := &bannedIPAddressImpl{
		Logger:     loggerp,
		DbClient:   client,
		Collection: uc,
	}
	return s
}

func (impl bannedIPAddressImpl) Create(ctx context.Context, u *domain.BannedIPAddress) error {
	// DEVELOPER NOTES:
	// According to mongodb documentaiton:
	//     Non-existent Databases and Collections
	//     If the necessary database and collection don't exist when you perform a write operation, the server implicitly creates them.
	//     Source: https://www.mongodb.com/docs/drivers/go/current/usage-examples/insertOne/

	if u.ID == primitive.NilObjectID {
		u.ID = primitive.NewObjectID()
		impl.Logger.Warn("database insert user transaction not included id value, created id now.", slog.Any("id", u.ID))
	}

	_, err := impl.Collection.InsertOne(ctx, u)

	// check for errors in the insertion
	if err != nil {
		impl.Logger.Error("database failed create error",
			slog.Any("error", err))
		return err
	}

	return nil
}

func (impl bannedIPAddressImpl) GetByID(ctx context.Context, id primitive.ObjectID) (*domain.BannedIPAddress, error) {
	filter := bson.M{"_id": id}

	var result domain.BannedIPAddress
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return nil, nil
		}
		impl.Logger.Error("database get by user transaction id error", slog.Any("error", err))
		return nil, err
	}
	return &result, nil
}

func (impl bannedIPAddressImpl) GetByNonce(ctx context.Context, nonce *big.Int) (*domain.BannedIPAddress, error) {
	filter := bson.M{"transaction.nonce_bytes": nonce.Bytes()}

	var result domain.BannedIPAddress
	err := impl.Collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// This error means your query did not match any documents.
			return nil, nil
		}
		impl.Logger.Error("database get by user transaction nonce error", slog.Any("error", err))
		return nil, err
	}
	return &result, nil
}

func (impl bannedIPAddressImpl) UpdateByID(ctx context.Context, m *domain.BannedIPAddress) error {
	filter := bson.M{"_id": m.ID}

	update := bson.M{ // DEVELOPERS NOTE: https://stackoverflow.com/a/60946010
		"$set": m,
	}

	// execute the UpdateOne() function to update the first matching document
	_, err := impl.Collection.UpdateOne(ctx, filter, update)
	if err != nil {
		impl.Logger.Error("database update user transaction by id error", slog.Any("error", err))
		return err
	}

	// // display the number of documents updated
	// impl.Logger.Debug("number of documents updated", slog.Int64("modified_count", result.ModifiedCount))

	return nil
}

// hasActiveFilters checks if any filters besides tenant_id are active
func (impl bannedIPAddressImpl) hasActiveFilters(filter *domain.BannedIPAddressFilter) bool {
	return !filter.UserID.IsZero() ||
		filter.CreatedAtStart != nil ||
		filter.CreatedAtEnd != nil
}

// buildCountMatchStage creates the match stage for the aggregation pipeline
func (impl bannedIPAddressImpl) buildCountMatchStage(filter *domain.BannedIPAddressFilter) bson.M {
	match := bson.M{}

	if !filter.UserID.IsZero() {
		match["user_id"] = filter.UserID
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

	return match
}

func (impl bannedIPAddressImpl) CountByFilter(ctx context.Context, filter *domain.BannedIPAddressFilter) (uint64, error) {
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

func (impl bannedIPAddressImpl) buildMatchStage(filter *domain.BannedIPAddressFilter) bson.M {
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

	if !filter.UserID.IsZero() {
		match["user_id"] = filter.UserID
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

	// Text search for name
	if filter.Value != nil && *filter.Value != "" {
		match["$text"] = bson.M{"$search": *filter.Value}
	}

	return match
}

func (impl bannedIPAddressImpl) ListByFilter(ctx context.Context, filter *domain.BannedIPAddressFilter) (*domain.BannedIPAddressFilterResult, error) {
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
	var bannedIPAddresss []*domain.BannedIPAddress
	if err := cursor.All(ctx, &bannedIPAddresss); err != nil {
		return nil, err
	}

	// Handle empty results case
	if len(bannedIPAddresss) == 0 {
		// impl.Logger.Debug("Empty list", slog.Any("filter", filter))
		return &domain.BannedIPAddressFilterResult{
			BannedIPAddresses: make([]*domain.BannedIPAddress, 0),
			HasMore:           false,
		}, nil
	}

	// Check if there are more results
	hasMore := false
	if len(bannedIPAddresss) > int(filter.Limit) {
		hasMore = true
		bannedIPAddresss = bannedIPAddresss[:len(bannedIPAddresss)-1]
	}

	// Get last document info for next page
	lastDoc := bannedIPAddresss[len(bannedIPAddresss)-1]

	return &domain.BannedIPAddressFilterResult{
		BannedIPAddresses: bannedIPAddresss,
		HasMore:           hasMore,
		LastID:            lastDoc.ID,
		LastCreatedAt:     lastDoc.CreatedAt,
	}, nil
}

func (impl bannedIPAddressImpl) DeleteByID(ctx context.Context, id primitive.ObjectID) error {
	_, err := impl.Collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		impl.Logger.Error("database failed deletion error",
			slog.Any("error", err))
		return err
	}
	return nil
}

func (impl bannedIPAddressImpl) ListAllValues(ctx context.Context) ([]string, error) {
	// Create an empty collection to hold our results
	var results []domain.BannedIPAddress

	// Set up our find options to only get the "value" field
	opts := options.Find().SetProjection(bson.D{{Key: "value", Value: 1}})

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

	// Extract just the values into a string slice
	values := make([]string, len(results))
	for i, result := range results {
		values[i] = result.Value
	}

	return values, nil
}
