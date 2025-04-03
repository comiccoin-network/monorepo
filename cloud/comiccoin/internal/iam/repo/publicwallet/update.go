package publicwallet

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson"

	dom "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/publicwallet"
)

func (impl publicWalletImpl) UpdateByID(ctx context.Context, m *dom.PublicWallet) error {
	filter := bson.M{"_id": m.ID}

	// Create a map of the fields to update, excluding the immutable _id field.
	// DEVELOPERS NOTE: https://stackoverflow.com/a/60946010 and https://stackoverflow.com/a/49622117
	updatePayload := bson.M{}
	data, err := bson.Marshal(m)
	if err != nil {
		impl.Logger.Error("failed to marshal public wallet for update", slog.Any("error", err), slog.String("id", m.ID.Hex()))
		return err
	}
	err = bson.Unmarshal(data, &updatePayload)
	if err != nil {
		impl.Logger.Error("failed to unmarshal public wallet to map for update", slog.Any("error", err), slog.String("id", m.ID.Hex()))
		return err
	}

	// Remove the immutable _id field from the update payload
	// as MongoDB does not allow modifying it.
	delete(updatePayload, "_id")
	// If there are other fields that should not be updated (e.g., creation timestamp),
	// they can be removed here as well.
	// delete(updatePayload, "createdAt")

	update := bson.M{
		"$set": updatePayload,
	}

	// execute the UpdateOne() function to update the first matching document
	_, err = impl.Collection.UpdateOne(ctx, filter, update)
	if err != nil {
		// Corrected error log message
		impl.Logger.Error("database update public wallet by id error", slog.Any("error", err), slog.String("id", m.ID.Hex()))
		return err
	}

	// // Optional: Capture result to check matched/modified counts
	// result, err := impl.Collection.UpdateOne(ctx, filter, update)
	// if err != nil {
	// 	impl.Logger.Error("database update public wallet by id error", slog.Any("error", err), slog.String("id", m.ID.Hex()))
	// 	return err
	// }
	// // display the number of documents updated
	// impl.Logger.Debug("number of documents updated by id", slog.Int64("modified_count", result.ModifiedCount), slog.String("id", m.ID.Hex()))

	return nil
}

func (impl publicWalletImpl) UpdateByAddress(ctx context.Context, m *dom.PublicWallet) error {
	filter := bson.M{"address": m.Address}

	// Create a map of the fields to update, excluding the immutable _id field.
	// DEVELOPERS NOTE: https://stackoverflow.com/a/60946010 and https://stackoverflow.com/a/49622117
	updatePayload := bson.M{}
	data, err := bson.Marshal(m)
	if err != nil {
		impl.Logger.Error("failed to marshal public wallet for update", slog.Any("error", err), slog.String("address", m.Address.Hex()))
		return err
	}
	err = bson.Unmarshal(data, &updatePayload)
	if err != nil {
		impl.Logger.Error("failed to unmarshal public wallet to map for update", slog.Any("error", err), slog.String("address", m.Address.Hex()))
		return err
	}

	// Remove the immutable _id field from the update payload
	// as MongoDB does not allow modifying it.
	delete(updatePayload, "_id")
	// If there are other fields that should not be updated (e.g., creation timestamp),
	// they can be removed here as well.
	// delete(updatePayload, "createdAt")

	update := bson.M{
		"$set": updatePayload,
	}

	// execute the UpdateOne() function to update the first matching document
	_, err = impl.Collection.UpdateOne(ctx, filter, update)
	if err != nil {
		// Corrected error log message
		impl.Logger.Error("database update public wallet by address error", slog.Any("error", err), slog.String("address", m.Address.Hex()))
		return err
	}

	// // Optional: Capture result to check matched/modified counts
	// result, err := impl.Collection.UpdateOne(ctx, filter, update)
	// if err != nil {
	// 	impl.Logger.Error("database update public wallet by address error", slog.Any("error", err), slog.String("address", m.Address))
	// 	return err
	// }
	// // display the number of documents updated
	// impl.Logger.Debug("number of documents updated by address", slog.Int64("modified_count", result.ModifiedCount), slog.String("address", m.Address))

	return nil
}
