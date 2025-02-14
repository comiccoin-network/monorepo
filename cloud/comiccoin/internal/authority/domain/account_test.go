package domain

import (
	"bytes"
	"crypto/rand"
	"encoding/binary"
	"math/big"
	"reflect"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/fxamacker/cbor/v2"
)

func TestAccount(t *testing.T) {
	t.Run("GetNonce", func(t *testing.T) {
		acc := &Account{
			NonceBytes: []byte{1, 2, 3},
		}
		nonce := acc.GetNonce()
		if nonce.Cmp(new(big.Int).SetBytes(acc.NonceBytes)) != 0 {
			t.Errorf("expected nonce to be equal to %v, got %v", new(big.Int).SetBytes(acc.NonceBytes), nonce)
		}
	})

	t.Run("IsNonceZero", func(t *testing.T) {
		tests := []struct {
			nonceBytes []byte
			expected   bool
		}{
			{[]byte{0}, true},     // [0] is zero in big.Int
			{[]byte{1}, false},    // [1] is non-zero
			{nil, true},           // nil slice is zero
			{[]byte{}, true},      // empty slice is zero
			{[]byte{0, 0}, true},  // multiple zeros is still zero
			{[]byte{0, 1}, false}, // has a 1, so non-zero
		}
		for _, tt := range tests {
			acc := &Account{
				NonceBytes: tt.nonceBytes,
			}
			if acc.IsNonceZero() != tt.expected {
				t.Errorf("expected IsNonceZero to return %v, got %v for nonceBytes %v", tt.expected, acc.IsNonceZero(), tt.nonceBytes)
			}
		}
	})

	t.Run("SetNonce", func(t *testing.T) {
		acc := &Account{}
		nonce := big.NewInt(123)
		acc.SetNonce(nonce)
		if !bytes.Equal(acc.NonceBytes, nonce.Bytes()) {
			t.Errorf("expected NonceBytes to be equal to %v, got %v", nonce.Bytes(), acc.NonceBytes)
		}
	})

	t.Run("Serialize", func(t *testing.T) {
		addr := common.HexToAddress("0x1234567890123456789012345678901234567890")
		acc := &Account{
			ChainID:    1,
			Address:    &addr,
			NonceBytes: []byte{1, 2, 3},
			Balance:    100,
		}
		data, err := acc.Serialize()
		if err != nil {
			t.Errorf("expected Serialize to succeed, got error %v", err)
		}
		var unmarshaledAcc Account
		err = cbor.Unmarshal(data, &unmarshaledAcc)
		if err != nil {
			t.Errorf("expected Unmarshal to succeed, got error %v", err)
		}
		if !reflect.DeepEqual(acc, &unmarshaledAcc) {
			t.Errorf("expected unmarshaled account to be equal to original account")
		}
	})

	t.Run("NewAccountFromDeserialize", func(t *testing.T) {
		// Create a valid account for testing
		addr := common.HexToAddress("0x1234567890123456789012345678901234567890")
		validAccount := &Account{
			ChainID:    1,
			Address:    &addr,
			NonceBytes: []byte{1, 2, 3},
			Balance:    100,
		}

		// Serialize it properly using CBOR
		validData, _ := validAccount.Serialize()

		tests := []struct {
			name    string
			data    []byte
			want    *Account
			wantErr bool
		}{
			{
				name:    "Valid CBOR data",
				data:    validData,
				want:    validAccount,
				wantErr: false,
			},
			{
				name:    "Invalid CBOR data",
				data:    []byte{1, 2, 3},
				want:    nil,
				wantErr: true,
			},
			{
				name:    "Nil data",
				data:    nil,
				want:    nil,
				wantErr: false,
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				got, err := NewAccountFromDeserialize(tt.data)
				if (err != nil) != tt.wantErr {
					t.Errorf("NewAccountFromDeserialize() error = %v, wantErr %v", err, tt.wantErr)
					return
				}
				if !reflect.DeepEqual(got, tt.want) {
					t.Errorf("NewAccountFromDeserialize() = %v, want %v", got, tt.want)
				}
			})
		}
	})

	t.Run("GenerateRandomAccount", func(t *testing.T) {
		acc := &Account{
			NonceBytes: make([]byte, 32), // Initialize with proper size
		}
		rand.Read(acc.NonceBytes)
		addr := common.BytesToAddress(randBytes(20))
		acc.Address = &addr
		acc.Balance = randUint64()
		if acc.IsNonceZero() {
			t.Errorf("expected nonce to be non-zero with nonce bytes: %v", acc.NonceBytes)
		}
	})
}

func randBytes(n int) []byte {
	b := make([]byte, n)
	rand.Read(b)
	return b
}

func randUint64() uint64 {
	buf := make([]byte, 8)
	rand.Read(buf)
	return binary.LittleEndian.Uint64(buf)
}
