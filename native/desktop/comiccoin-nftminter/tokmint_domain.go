package main

import (
	"context"
	"fmt"

	"github.com/fxamacker/cbor/v2"
)

type TokenMint struct {
	WalletAddress string `json:"wallet_address"`
	MetadataURI   string `json:"metadata_uri"`
}

// TokenMint represents the data that can be serialized to disk and over the network.
type TokenMintDTO TokenMint

// ToDTO method converts a `TokenMint` data type into a `TokenMintDTO` data type.
func (bd *TokenMint) ToDTO() *TokenMintDTO {
	return (*TokenMintDTO)(bd)
}

func (bd *TokenMintDTO) ToIDO() *TokenMint {
	return (*TokenMint)(bd)
}

// TokenMintRepository is an interface that defines the methods for
// handling the blockchain state via the network.
type TokenMintDTORepository interface {
	SubmitToBlockchainAuthority(ctx context.Context, dto *TokenMintDTO) error
}

// Serialize serializes golang struct data into a byte array.
// It returns the serialized byte array and an error if one occurs.
func (b *TokenMintDTO) Serialize() ([]byte, error) {
	// Marshal the block data into a byte array using CBOR.
	dataBytes, err := cbor.Marshal(b)
	if err != nil {
		return nil, fmt.Errorf("failed to serialize mempool transaction dto: %v", err)
	}
	return dataBytes, nil
}

// NewTokenMintDTOFromDeserialize deserializes struct data from a
// byte array. It returns the deserialized struct data and an error if one occurs.
func NewTokenMintDTOFromDeserialize(data []byte) (*TokenMintDTO, error) {
	// Variable we will use to return.
	blockData := &TokenMintDTO{}

	// Defensive code: If programmer entered empty bytes then we will
	// return nil deserialization result.
	if data == nil {
		return nil, nil
	}

	// Unmarshal the byte array into a block data using CBOR.
	if err := cbor.Unmarshal(data, &blockData); err != nil {
		return nil, fmt.Errorf("failed to deserialize mempool transaction dto: %v", err)
	}
	return blockData, nil
}
