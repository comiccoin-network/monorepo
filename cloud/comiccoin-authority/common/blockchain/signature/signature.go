// Package signature provides helper functions for handling the blockchain
// signature needs.
// Special thanks: https://raw.githubusercontent.com/ardanlabs/blockchain/refs/heads/main/foundation/blockchain/signature/signature.go
package signature

import (
	"crypto/ecdsa"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/big"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

// ZeroHash represents a hash code of zeros.
const ZeroHash string = "0x0000000000000000000000000000000000000000000000000000000000000000"

// comicCoinID is an arbitrary number for signing messages. This will make it
// clear that the signature comes from the ComicCoin blockchain.
// Ethereum and Bitcoin do this as well, but they use the value of 27.
const comicCoinID = 29

// =============================================================================

// Hash returns a unique string for the value.
func Hash(value any) string {
	data, err := json.Marshal(value)
	if err != nil {
		return ZeroHash
	}

	hash := sha256.Sum256(data)
	return hexutil.Encode(hash[:])
}

// Sign uses the specified private key to sign the data.
func Sign(value any, privateKey *ecdsa.PrivateKey) (v, r, s *big.Int, err error) {

	// Prepare the data for signing.
	data, err := stamp(value)
	if err != nil {
		return nil, nil, nil, err
	}

	// Sign the hash with the private key to produce a signature.
	sig, err := crypto.Sign(data, privateKey)
	if err != nil {
		return nil, nil, nil, err
	}

	// Extract the bytes for the original public key.
	publicKeyOrg := privateKey.Public()
	publicKeyECDSA, ok := publicKeyOrg.(*ecdsa.PublicKey)
	if !ok {
		return nil, nil, nil, errors.New("error casting public key to ECDSA")
	}
	publicKeyBytes := crypto.FromECDSAPub(publicKeyECDSA)

	// Check the public key validates the data and signature.
	rs := sig[:crypto.RecoveryIDOffset]
	if !crypto.VerifySignature(publicKeyBytes, data, rs) {
		return nil, nil, nil, errors.New("invalid signature produced")
	}

	// Convert the 65 byte signature into the [R|S|V] format.
	v, r, s = toSignatureValues(sig)

	return v, r, s, nil
}

// VerifySignature verifies the signature conforms to our standards.
func VerifySignature(v, r, s *big.Int) error {

	// Check the recovery id is either 0 or 1.
	uintV := v.Uint64() - comicCoinID
	if uintV != 0 && uintV != 1 {
		return errors.New("invalid recovery id")
	}

	// Check the signature values are valid.
	if !crypto.ValidateSignatureValues(byte(uintV), r, s, false) {
		return errors.New("invalid signature values")
	}

	return nil
}

// FromAddress extracts the address for the account that signed the data.
func FromAddress(value any, v, r, s *big.Int) (string, error) {
	fmt.Printf("signature.go -> FromAddress: Input v: %v, r: %v, s: %v\n", v, r, s)

	// Prepare the data for public key extraction.
	data, err := stamp(value)
	if err != nil {
		fmt.Printf("signature.go -> FromAddress(): stamp error: %v\n", err)
		return "", err
	}

	fmt.Printf("signature.go -> FromAddress(): stamp data: %v\n", data)

	// Convert the [R|S|V] format into the original 65 bytes.
	sig := ToSignatureBytes(v, r, s)

	// After getting the signature bytes:
	fmt.Printf("signature.go -> FromAddress(): Signature bytes: %s\n", hexutil.Encode(sig))

	// Capture the public key associated with this data and signature.
	publicKey, err := crypto.SigToPub(data, sig)
	if err != nil {
		log.Printf("signature.go -> FromAddress(): crypto.SigToPub error: %v\n", err)
		return "", err
	}

	// After SigToPub:
	fmt.Printf("signature.go -> FromAddress(): Recovered public key: %v\n", publicKey)

	// Extract the account address from the public key.
	res := crypto.PubkeyToAddress(*publicKey).String()

	return res, nil
}

// GetPublicKeyFromSignature extracts the public key for the account that signed the data.
func GetPublicKeyFromSignature(value any, v, r, s *big.Int) (*ecdsa.PublicKey, error) {

	// Prepare the data for public key extraction.
	data, err := stamp(value)
	if err != nil {
		return nil, err
	}

	// Convert the [R|S|V] format into the original 65 bytes.
	sig := ToSignatureBytes(v, r, s)

	// Capture the public key associated with this data and signature.
	publicKey, err := crypto.SigToPub(data, sig)
	if err != nil {
		return nil, err
	}
	return publicKey, nil
}

// SignatureString returns the signature as a string.
func SignatureString(v, r, s *big.Int) string {
	return hexutil.Encode(ToSignatureBytesWithComicCoinID(v, r, s))
}

// ToVRSFromHexSignature converts a hex representation of the signature into
// its R, S and V parts.
func ToVRSFromHexSignature(sigStr string) (v, r, s *big.Int, err error) {
	sig, err := hex.DecodeString(sigStr[2:])
	if err != nil {
		return nil, nil, nil, err
	}

	r = big.NewInt(0).SetBytes(sig[:32])
	s = big.NewInt(0).SetBytes(sig[32:64])
	v = big.NewInt(0).SetBytes([]byte{sig[64]})

	return v, r, s, nil
}

// ToSignatureBytes converts the r, s, v values into a slice of bytes
// with the removal of the comicCoinID.
func ToSignatureBytes(v, r, s *big.Int) []byte {
	sig := make([]byte, crypto.SignatureLength)

	rBytes := make([]byte, 32)
	r.FillBytes(rBytes)
	copy(sig, rBytes)

	sBytes := make([]byte, 32)
	s.FillBytes(sBytes)
	copy(sig[32:], sBytes)

	sig[64] = byte(v.Uint64() - comicCoinID)

	return sig
}

// ToSignatureBytesWithComicCoinID converts the r, s, v values into a slice of bytes
// keeping the ComicCoin id.
func ToSignatureBytesWithComicCoinID(v, r, s *big.Int) []byte {
	sig := ToSignatureBytes(v, r, s)
	sig[64] = byte(v.Uint64())

	return sig
}

// =============================================================================

// stamp returns a hash of 32 bytes that represents this data with
// the ComicCoin stamp embedded into the final hash.
func stamp(value any) ([]byte, error) {
	// First, marshal to JSON
	v, err := json.Marshal(value)
	if err != nil {
		return nil, err
	}

	// Add these logs in your stamp function, right after the first json.Marshal:
	fmt.Printf("signature.go -> stamp: Initial JSON marshal: %s\n", string(v))

	// Unmarshal back into a map to normalize the structure
	var normalized map[string]interface{}
	if err := json.Unmarshal(v, &normalized); err != nil {
		return nil, err
	}

	// Clean up empty strings and null values
	cleanMap(normalized)

	// After normalization and cleanMap:
	fmt.Printf("signature.go -> stamp: After cleaning: %s\n", string(v))

	// Marshal again after normalization
	v, err = json.Marshal(normalized)
	if err != nil {
		return nil, err
	}

	// This stamp is used so signatures we produce when signing data
	// are always unique to the ComicCoin blockchain.
	stamp := []byte(fmt.Sprintf("\x19ComicCoin Signed Message:\n%d", len(v)))

	// After creating the stamp:
	fmt.Printf("signature.go -> stamp: Final stamp prefix: %s\n", string(stamp))

	// Hash the stamp and txHash together in a final 32 byte array
	// that represents the data.
	data := crypto.Keccak256(stamp, v)

	// Just before returning:
	fmt.Printf("signature.go -> stamp: Final hash in hex: %s\n", hexutil.Encode(data))

	return data, nil
}

// cleanMap removes empty strings and null values from the map recursively
func cleanMap(m map[string]interface{}) {
	for k, v := range m {
		switch v := v.(type) {
		case string:
			if v == "" {
				delete(m, k)
			}
		case nil:
			delete(m, k)
		case []interface{}:
			if len(v) == 0 {
				delete(m, k)
			} else {
				for i := range v {
					if mm, ok := v[i].(map[string]interface{}); ok {
						cleanMap(mm)
					}
				}
			}
		case map[string]interface{}:
			cleanMap(v)
			if len(v) == 0 {
				delete(m, k)
			}
		}
	}
}

// toSignatureValues converts the signature into the r, s, v values.
func toSignatureValues(sig []byte) (v, r, s *big.Int) {
	r = big.NewInt(0).SetBytes(sig[:32])
	s = big.NewInt(0).SetBytes(sig[32:64])
	v = big.NewInt(0).SetBytes([]byte{sig[64] + comicCoinID})

	return v, r, s
}

func HashWithComicCoinStamp(value any) ([]byte, error) {
	return stamp(value)
}
