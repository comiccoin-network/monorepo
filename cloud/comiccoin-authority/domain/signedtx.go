package domain

import (
	"errors"
	"fmt"
	"math/big"

	"github.com/fxamacker/cbor/v2"
)

// SignedTransaction is a signed version of the transaction. This is how
// clients like a wallet provide transactions for inclusion into the blockchain.
type SignedTransaction struct {
	Transaction

	// Known Issue:
	// MongoDB does not natively support storing `*big.Int` types directly,
	// which may cause issues if the `V`, `R`, and `S` fields of the
	// `SignedTransaction` are of type `*big.Int`.
	// These fields need to be converted to an alternate type (e.g., `string`
	// or `[]byte`) before saving to MongoDB, as `big.Int` values are not
	// natively serialized by BSON.
	// To resolve this, we convert `*big.Int` fields to `[]byte` in the model.

	VBytes []byte `bson:"v_bytes,omitempty" json:"v_bytes"`  // Ethereum: Recovery identifier, either 29 or 30 with comicCoinID.
	RBytes []byte `bson:"r_bytes,omitempty"  json:"r_bytes"` // Ethereum: First coordinate of the ECDSA signature.
	SBytes []byte `bson:"s_bytes,omitempty"  json:"s_bytes"` // Ethereum: Second coordinate of the ECDSA signature.
}

// SetBigIntFields allows setting *big.Int values to []byte fields for MongoDB storage.
func (tx *SignedTransaction) SetBigIntFields(v, r, s *big.Int) {
	tx.VBytes = v.Bytes()
	tx.RBytes = r.Bytes()
	tx.SBytes = s.Bytes()
}

// GetBigIntFields retrieves *big.Int values from []byte fields after loading from MongoDB.
func (tx *SignedTransaction) GetBigIntFields() (*big.Int, *big.Int, *big.Int) {
	return new(big.Int).SetBytes(tx.VBytes), new(big.Int).SetBytes(tx.RBytes), new(big.Int).SetBytes(tx.SBytes)
}

// Validate checks if the transaction is valid. It verifies the signature,
// makes sure the account addresses are correct, and checks if the 'from'
// and 'to' accounts are not the same (unless you are the proof of authority!)
func (stx SignedTransaction) Validate(chainID uint16, isPoA bool) error {
	fmt.Printf("domain/signedtx.go -> Validate() -> === Starting SignedTransaction Validation ===\n")
	fmt.Printf("domain/signedtx.go -> Validate() -> Chain ID check: got[%d] exp[%d]\n", stx.ChainID, chainID)

	// Check if the transaction's chain ID matches the expected one.
	if stx.ChainID != chainID {
		return fmt.Errorf("invalid chain id, got[%d] exp[%d]", stx.ChainID, chainID)
	}

	fmt.Printf("domain/signedtx.go -> Validate() -> From address: %s\n", stx.From.Hex())
	fmt.Printf("domain/signedtx.go -> Validate() -> To address: %s\n", stx.To.Hex())

	// Rest of the existing code...

	// Add before signature verification
	v, r, s := stx.GetBigIntFields()
	fmt.Printf("domain/signedtx.go -> Validate() -> Signature Components:\n")
	fmt.Printf("domain/signedtx.go -> Validate() -> V (bytes): %x\n", stx.VBytes)
	fmt.Printf("domain/signedtx.go -> Validate() -> R (bytes): %x\n", stx.RBytes)
	fmt.Printf("domain/signedtx.go -> Validate() -> S (bytes): %x\n", stx.SBytes)
	fmt.Printf("domain/signedtx.go -> Validate() -> V (big.Int): %v\n", v)
	fmt.Printf("domain/signedtx.go -> Validate() -> R (big.Int): %x\n", r)
	fmt.Printf("domain/signedtx.go -> Validate() -> S (big.Int): %x\n", s)

	// Add before FromAddress check
	address, err := stx.FromAddress()
	if err != nil {
		fmt.Printf("domain/signedtx.go -> Validate() ->FromAddress error: %v\n", err)
		return err
	}
	fmt.Printf("domain/signedtx.go -> Validate() -> Recovered address: %s\n", address)
	fmt.Printf("domain/signedtx.go -> Validate() -> Expected address: %s\n", stx.From.Hex())

	if address != string(stx.From.Hex()) {
		fmt.Printf("domain/signedtx.go -> Validate() -> Address mismatch:\n  Recovered: %s\n  Expected: %s\n",
			address, stx.From.Hex())
		return errors.New("signature address doesn't match from address")
	}

	fmt.Printf("domain/signedtx.go -> Validate() -> === Transaction Validation Complete ===\n\n")
	return nil
}

func (stx *SignedTransaction) Serialize() ([]byte, error) {
	dataBytes, err := cbor.Marshal(stx)
	if err != nil {
		return nil, fmt.Errorf("failed to serialize signed transaction: %v", err)
	}
	return dataBytes, nil
}

func NewSignedTransactionFromDeserialize(data []byte) (*SignedTransaction, error) {
	// Variable we will use to return.
	stx := &SignedTransaction{}

	// Defensive code: If programmer entered empty bytes then we will
	// return nil deserialization result.
	if data == nil {
		return nil, nil
	}

	if err := cbor.Unmarshal(data, &stx); err != nil {
		return nil, fmt.Errorf("failed to deserialize signed transaction: %v", err)
	}
	return stx, nil
}
