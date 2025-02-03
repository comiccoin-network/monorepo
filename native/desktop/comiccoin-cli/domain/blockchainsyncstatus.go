package domain

import (
	"context"
	"fmt"

	"github.com/fxamacker/cbor/v2"
)

// BlockchainSyncStatus represents the status of our local wallet synchronizing with the ComicCoin blockchain.
type BlockchainSyncStatus struct {
	IsSynching bool `json:"is_synching"`
}

type BlockchainSyncStatusRepository interface {
	Set(ctx context.Context, isSynching bool) error
	Get(ctx context.Context) (*BlockchainSyncStatus, error)
}

// Serialize serializes the wallet into a byte slice.
// This method uses the cbor library to marshal the wallet into a byte slice.
func (b *BlockchainSyncStatus) Serialize() ([]byte, error) {
	// Marshal the wallet into a byte slice using the cbor library.
	dataBytes, err := cbor.Marshal(b)
	if err != nil {
		// Return an error if the marshaling fails.
		return nil, fmt.Errorf("failed to serialize blockchain sync status: %v", err)
	}
	return dataBytes, nil
}

// NewBlockchainSyncStatusFromDeserialize deserializes an wallet from a byte slice.
// This method uses the cbor library to unmarshal the byte slice into an wallet.
func NewBlockchainSyncStatusFromDeserialize(data []byte) (*BlockchainSyncStatus, error) {
	// Create a new wallet variable to return.
	wallet := &BlockchainSyncStatus{}

	// Defensive code: If the input data is empty, return a nil deserialization result.
	if data == nil {
		return nil, nil
	}

	// Unmarshal the byte slice into the wallet variable using the cbor library.
	if err := cbor.Unmarshal(data, &wallet); err != nil {
		// Return an error if the unmarshaling fails.
		return nil, fmt.Errorf("failed to deserialize blockchain sync status: %v", err)
	}
	return wallet, nil
}
