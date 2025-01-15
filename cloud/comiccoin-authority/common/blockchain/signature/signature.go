// Package signature provides helper functions for handling the blockchain
// signature needs.
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
	"reflect"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

// ZeroHash represents a hash code of zeros.
const ZeroHash string = "0x0000000000000000000000000000000000000000000000000000000000000000"

// comicCoinID is an arbitrary number for signing messages.
const comicCoinID = 29

func logValue(prefix string, value any) {
	log.Printf("%s: Value type: %T, Value kind: %v", prefix, value, reflect.TypeOf(value).Kind())
	if data, err := json.MarshalIndent(value, "", "  "); err == nil {
		log.Printf("%s: Value content:\n%s", prefix, string(data))
	}
}

// Hash returns a unique string for the value.
func Hash(value any) string {
	log.Printf("Hash: ====== Starting hash computation ======")
	logValue("Hash", value)

	data, err := json.Marshal(value)
	if err != nil {
		log.Printf("Hash: ERROR marshaling value: %v", err)
		log.Printf("Hash: Returning ZeroHash due to error")
		return ZeroHash
	}
	log.Printf("Hash: Successfully marshaled data length: %d bytes", len(data))
	log.Printf("Hash: Marshaled data (string): %s", string(data))
	log.Printf("Hash: Marshaled data (hex): %s", hexutil.Encode(data))

	hash := sha256.Sum256(data)
	result := hexutil.Encode(hash[:])

	log.Printf("Hash: Raw hash bytes length: %d", len(hash))
	log.Printf("Hash: Raw hash bytes (hex): %s", hex.EncodeToString(hash[:]))
	log.Printf("Hash: Final computed hash: %s", result)
	log.Printf("Hash: ====== Completed hash computation ======")

	return result
}

// Sign uses the specified private key to sign the data.
func Sign(value any, privateKey *ecdsa.PrivateKey) (v, r, s *big.Int, err error) {
	log.Printf("Sign: ====== Starting signing process ======")
	logValue("Sign", value)

	if privateKey == nil {
		log.Printf("Sign: ERROR - Private key is nil")
		return nil, nil, nil, errors.New("private key is nil")
	}

	log.Printf("Sign: Private key curve: %s", privateKey.Curve.Params().Name)
	log.Printf("Sign: Private key length: %d bits", privateKey.D.BitLen())

	data, err := stamp(value)
	if err != nil {
		log.Printf("Sign: ERROR in stamp operation: %v", err)
		return nil, nil, nil, fmt.Errorf("stamp error: %w", err)
	}
	log.Printf("Sign: Stamped data length: %d bytes", len(data))
	log.Printf("Sign: Stamped data (hex): %s", hexutil.Encode(data))

	sig, err := crypto.Sign(data, privateKey)
	if err != nil {
		log.Printf("Sign: ERROR in crypto.Sign: %v", err)
		return nil, nil, nil, fmt.Errorf("signing error: %w", err)
	}
	log.Printf("Sign: Raw signature length: %d bytes", len(sig))
	log.Printf("Sign: Raw signature (hex): %s", hexutil.Encode(sig))

	publicKeyOrg := privateKey.Public()
	publicKeyECDSA, ok := publicKeyOrg.(*ecdsa.PublicKey)
	if !ok {
		log.Printf("Sign: ERROR - Failed to cast public key to ECDSA")
		return nil, nil, nil, errors.New("error casting public key to ECDSA")
	}

	publicKeyBytes := crypto.FromECDSAPub(publicKeyECDSA)
	log.Printf("Sign: Public key length: %d bytes", len(publicKeyBytes))
	log.Printf("Sign: Public key (hex): %s", hexutil.Encode(publicKeyBytes))
	log.Printf("Sign: Public key X: %s", publicKeyECDSA.X.Text(16))
	log.Printf("Sign: Public key Y: %s", publicKeyECDSA.Y.Text(16))

	rs := sig[:crypto.RecoveryIDOffset]
	log.Printf("Sign: Signature RS component length: %d bytes", len(rs))
	log.Printf("Sign: Signature RS component (hex): %s", hexutil.Encode(rs))

	if !crypto.VerifySignature(publicKeyBytes, data, rs) {
		log.Printf("Sign: ERROR - Signature verification failed")
		return nil, nil, nil, errors.New("invalid signature produced")
	}
	log.Printf("Sign: Initial signature verification successful")

	v, r, s = toSignatureValues(sig)
	log.Printf("Sign: Final v value (hex): %s", v.Text(16))
	log.Printf("Sign: Final r value (hex): %s", r.Text(16))
	log.Printf("Sign: Final s value (hex): %s", s.Text(16))
	log.Printf("Sign: Final v value (decimal): %s", v.Text(10))
	log.Printf("Sign: Final r value (decimal): %s", r.Text(10))
	log.Printf("Sign: Final s value (decimal): %s", s.Text(10))
	log.Printf("Sign: ====== Completed signing process ======")

	return v, r, s, nil
}

// VerifySignature verifies the signature conforms to our standards.
func VerifySignature(v, r, s *big.Int) error {
	log.Printf("VerifySignature: ====== Starting verification ======")
	log.Printf("VerifySignature: Input v (hex): %s", v.Text(16))
	log.Printf("VerifySignature: Input r (hex): %s", r.Text(16))
	log.Printf("VerifySignature: Input s (hex): %s", s.Text(16))
	log.Printf("VerifySignature: Input v (decimal): %s", v.Text(10))
	log.Printf("VerifySignature: Input r (decimal): %s", r.Text(10))
	log.Printf("VerifySignature: Input s (decimal): %s", s.Text(10))

	uintV := v.Uint64() - comicCoinID
	log.Printf("VerifySignature: Computed uintV: %d (after subtracting comicCoinID %d)", uintV, comicCoinID)

	if uintV != 0 && uintV != 1 {
		log.Printf("VerifySignature: ERROR - Invalid recovery id: %d", uintV)
		return errors.New("invalid recovery id")
	}
	log.Printf("VerifySignature: Recovery ID validation passed")

	if !crypto.ValidateSignatureValues(byte(uintV), r, s, false) {
		log.Printf("VerifySignature: ERROR - Invalid signature values")
		return errors.New("invalid signature values")
	}

	log.Printf("VerifySignature: Signature values validation passed")
	log.Printf("VerifySignature: ====== Verification successful ======")
	return nil
}

// FromAddress extracts the address for the account that signed the data.
func FromAddress(value any, v, r, s *big.Int) (string, error) {
	log.Printf("FromAddress: Starting address extraction for value type: %T", value)
	log.Printf("FromAddress: Input signature values - v: %s, r: %s, s: %s",
		v.Text(16), r.Text(16), s.Text(16))

	data, err := stamp(value)
	if err != nil {
		log.Printf("FromAddress: Error stamping data: %v", err)
		return "", err
	}
	log.Printf("FromAddress: Stamped data hash: %s", hexutil.Encode(data))

	sig := ToSignatureBytes(v, r, s)
	log.Printf("FromAddress: Reconstructed signature bytes: %s", hexutil.Encode(sig))

	publicKey, err := crypto.SigToPub(data, sig)
	if err != nil {
		log.Printf("FromAddress: Error recovering public key: %v", err)
		return "", err
	}
	log.Printf("FromAddress: Recovered public key X: %s, Y: %s",
		publicKey.X.Text(16), publicKey.Y.Text(16))

	address := crypto.PubkeyToAddress(*publicKey).String()
	log.Printf("FromAddress: Extracted address: %s", address)

	return address, nil
}

// GetPublicKeyFromSignature extracts the public key for the account that signed the data.
func GetPublicKeyFromSignature(value any, v, r, s *big.Int) (*ecdsa.PublicKey, error) {
	log.Printf("GetPublicKeyFromSignature: Starting public key extraction for value type: %T", value)
	log.Printf("GetPublicKeyFromSignature: Input signature values - v: %s, r: %s, s: %s",
		v.Text(16), r.Text(16), s.Text(16))

	data, err := stamp(value)
	if err != nil {
		log.Printf("GetPublicKeyFromSignature: Error stamping data: %v", err)
		return nil, err
	}

	sig := ToSignatureBytes(v, r, s)
	log.Printf("GetPublicKeyFromSignature: Reconstructed signature bytes: %s", hexutil.Encode(sig))

	publicKey, err := crypto.SigToPub(data, sig)
	if err != nil {
		log.Printf("GetPublicKeyFromSignature: Error recovering public key: %v", err)
		return nil, err
	}

	log.Printf("GetPublicKeyFromSignature: Recovered public key X: %s, Y: %s",
		publicKey.X.Text(16), publicKey.Y.Text(16))
	return publicKey, nil
}

// SignatureString returns the signature as a string.
func SignatureString(v, r, s *big.Int) string {
	sig := ToSignatureBytesWithComicCoinID(v, r, s)
	result := hexutil.Encode(sig)
	log.Printf("SignatureString: Generated signature string: %s", result)
	return result
}

// ToVRSFromHexSignature converts a hex representation of the signature into its R, S and V parts.
func ToVRSFromHexSignature(sigStr string) (v, r, s *big.Int, err error) {
	log.Printf("ToVRSFromHexSignature: Starting conversion of hex signature: %s", sigStr)

	sig, err := hex.DecodeString(sigStr[2:])
	if err != nil {
		log.Printf("ToVRSFromHexSignature: Error decoding hex string: %v", err)
		return nil, nil, nil, err
	}

	r = big.NewInt(0).SetBytes(sig[:32])
	s = big.NewInt(0).SetBytes(sig[32:64])
	v = big.NewInt(0).SetBytes([]byte{sig[64]})

	log.Printf("ToVRSFromHexSignature: Extracted values - v: %s, r: %s, s: %s",
		v.Text(16), r.Text(16), s.Text(16))
	return v, r, s, nil
}

// ToSignatureBytes converts the r, s, v values into a slice of bytes with the removal of the comicCoinID.
func ToSignatureBytes(v, r, s *big.Int) []byte {
	log.Printf("ToSignatureBytes: Starting conversion - v: %s, r: %s, s: %s",
		v.Text(16), r.Text(16), s.Text(16))

	sig := make([]byte, crypto.SignatureLength)

	rBytes := make([]byte, 32)
	r.FillBytes(rBytes)
	copy(sig, rBytes)

	sBytes := make([]byte, 32)
	s.FillBytes(sBytes)
	copy(sig[32:], sBytes)

	sig[64] = byte(v.Uint64() - comicCoinID)

	log.Printf("ToSignatureBytes: Generated signature bytes: %s", hexutil.Encode(sig))
	return sig
}

// ToSignatureBytesWithComicCoinID converts the r, s, v values into a slice of bytes keeping the ComicCoin id.
func ToSignatureBytesWithComicCoinID(v, r, s *big.Int) []byte {
	log.Printf("ToSignatureBytesWithComicCoinID: Starting conversion - v: %s, r: %s, s: %s",
		v.Text(16), r.Text(16), s.Text(16))

	sig := ToSignatureBytes(v, r, s)
	sig[64] = byte(v.Uint64())

	log.Printf("ToSignatureBytesWithComicCoinID: Generated signature bytes: %s", hexutil.Encode(sig))
	return sig
}

// toSignatureValues converts the signature into the r, s, v values.
func toSignatureValues(sig []byte) (v, r, s *big.Int) {
	log.Printf("toSignatureValues: Starting conversion of signature bytes: %s", hexutil.Encode(sig))

	r = big.NewInt(0).SetBytes(sig[:32])
	s = big.NewInt(0).SetBytes(sig[32:64])
	v = big.NewInt(0).SetBytes([]byte{sig[64] + comicCoinID})

	log.Printf("toSignatureValues: Extracted values - v: %s, r: %s, s: %s",
		v.Text(16), r.Text(16), s.Text(16))
	return v, r, s
}

// stamp returns a hash of 32 bytes that represents this data.
// HashWithComicCoinStamp returns the hash of the value with the ComicCoin stamp.
func HashWithComicCoinStamp(value any) ([]byte, error) {
	log.Printf("HashWithComicCoinStamp: Starting hash computation for value type: %T", value)
	return stamp(value)
}

func stamp(value any) ([]byte, error) {
	log.Printf("stamp: Starting stamping process for value type: %T", value)

	v, err := json.Marshal(value)
	if err != nil {
		log.Printf("stamp: Error in initial JSON marshal: %v", err)
		return nil, err
	}
	log.Printf("stamp: Initial JSON: %s", string(v))

	var normalized map[string]interface{}
	if err := json.Unmarshal(v, &normalized); err != nil {
		log.Printf("stamp: Error unmarshaling to map: %v", err)
		return nil, err
	}
	log.Printf("stamp: Unmarshaled structure: %+v", normalized)

	cleanMap(normalized)
	log.Printf("stamp: Cleaned structure: %+v", normalized)

	v, err = json.Marshal(normalized)
	if err != nil {
		log.Printf("stamp: Error in final JSON marshal: %v", err)
		return nil, err
	}
	log.Printf("stamp: Final JSON: %s", string(v))

	stamp := []byte(fmt.Sprintf("\x19ComicCoin Signed Message:\n%d", len(v)))
	log.Printf("stamp: Message prefix: %s", string(stamp))

	data := crypto.Keccak256(stamp, v)
	log.Printf("stamp: Final Keccak256 hash: %s", hexutil.Encode(data))

	return data, nil
}

func cleanMap(m map[string]interface{}) {
	log.Printf("cleanMap: ====== Starting map cleanup ======")
	log.Printf("cleanMap: Initial map entries: %d", len(m))
	log.Printf("cleanMap: Initial map keys: %v", reflect.ValueOf(m).MapKeys())

	if data, err := json.MarshalIndent(m, "", "  "); err == nil {
		log.Printf("cleanMap: Initial map content:\n%s", string(data))
	}

	for k, v := range m {
		log.Printf("cleanMap: Processing key '%s'", k)
		log.Printf("cleanMap: Value type: %T", v)
		if data, err := json.Marshal(v); err == nil {
			log.Printf("cleanMap: Value content: %s", string(data))
		}

		switch v := v.(type) {
		case string:
			if v == "" {
				log.Printf("cleanMap: Removing empty string at key '%s'", k)
				delete(m, k)
			} else {
				log.Printf("cleanMap: Keeping non-empty string at key '%s': %s", k, v)
			}
		case nil:
			log.Printf("cleanMap: Removing nil value at key '%s'", k)
			delete(m, k)
		case []interface{}:
			log.Printf("cleanMap: Processing array at key '%s' with %d elements", k, len(v))
			if len(v) == 0 {
				log.Printf("cleanMap: Removing empty array at key '%s'", k)
				delete(m, k)
			} else {
				for i, elem := range v {
					log.Printf("cleanMap: Processing array element %d of key '%s'", i, k)
					log.Printf("cleanMap: Element type: %T", elem)
					if mm, ok := elem.(map[string]interface{}); ok {
						log.Printf("cleanMap: Recursively cleaning map in array element %d", i)
						cleanMap(mm)
					}
				}
			}
		case map[string]interface{}:
			log.Printf("cleanMap: Recursively cleaning nested map at key '%s'", k)
			cleanMap(v)
			if len(v) == 0 {
				log.Printf("cleanMap: Removing empty nested map at key '%s'", k)
				delete(m, k)
			}
		default:
			log.Printf("cleanMap: Keeping value of type %T at key '%s'", v, k)
		}
	}

	log.Printf("cleanMap: Final map entries: %d", len(m))
	log.Printf("cleanMap: Final map keys: %v", reflect.ValueOf(m).MapKeys())
	if data, err := json.MarshalIndent(m, "", "  "); err == nil {
		log.Printf("cleanMap: Final map content:\n%s", string(data))
	}
	log.Printf("cleanMap: ====== Completed map cleanup ======")
}
