package signature_test

import (
	"testing"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/blockchain/signature"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	pkHexKey = "fae85851bdf5c9f49923722ce38f3c1defcfd3619ef5453230a58ad805499959"
	from     = "0xdd6B972ffcc631a62CAE1BB9d80b7ff429c8ebA4"
	sigStr   = "0x3fc1a5adca72b01479c92856f2498296975448a208413c8f5a66a79ac75503d4434bac60b5fd40ac51ad61235b208a8d52c6a615c7f9ee92b2d8ce2fbb855a7c1e"
)

type TestData struct {
	Name string
}

func TestSign(t *testing.T) {
	pk, err := crypto.HexToECDSA(pkHexKey)
	require.NoError(t, err)

	value := TestData{Name: "Bill"}

	v, r, s, err := signature.Sign(value, pk)
	require.NoError(t, err)

	err = signature.VerifySignature(v, r, s)
	require.NoError(t, err)

	addr, err := signature.FromAddress(value, v, r, s)
	require.NoError(t, err)
	assert.Equal(t, from, addr)

	str := signature.SignatureString(v, r, s)
	assert.NotEmpty(t, str)
}

func TestHash(t *testing.T) {
	value := TestData{Name: "Bill"}
	expectedHash := "0x0f6887ac85101d6d6425a617edf35bd721b5f619fb92c36c3d2224e3bdb0ee5a"

	hash := signature.Hash(value)
	assert.Equal(t, expectedHash, hash)

	// Test hash consistency
	hash2 := signature.Hash(value)
	assert.Equal(t, hash, hash2)
}

func TestSignConsistency(t *testing.T) {
	value1 := TestData{Name: "Bill"}
	value2 := TestData{Name: "Jill"}

	pk, err := crypto.HexToECDSA(pkHexKey)
	require.NoError(t, err)

	v1, r1, s1, err := signature.Sign(value1, pk)
	require.NoError(t, err)

	addr1, err := signature.FromAddress(value1, v1, r1, s1)
	require.NoError(t, err)

	v2, r2, s2, err := signature.Sign(value2, pk)
	require.NoError(t, err)

	addr2, err := signature.FromAddress(value2, v2, r2, s2)
	require.NoError(t, err)

	assert.Equal(t, addr1, addr2)
}
