package password

import (
	"strings"
	"testing"

	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/securestring"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewProvider(t *testing.T) {
	provider := NewProvider()
	assert.NotNil(t, provider)
	assert.Equal(t, "argon2id", provider.AlgorithmName())
}

func TestPasswordHashing(t *testing.T) {
	provider := NewProvider()
	password, err := sstring.NewSecureString("test-password")
	require.NoError(t, err)

	hash, err := provider.GenerateHashFromPassword(password)
	assert.NoError(t, err)
	assert.True(t, strings.HasPrefix(hash, "$argon2id$"))

	match, err := provider.ComparePasswordAndHash(password, hash)
	assert.NoError(t, err)
	assert.True(t, match)

	// Test wrong password
	wrongPassword, _ := sstring.NewSecureString("wrong-password")
	match, err = provider.ComparePasswordAndHash(wrongPassword, hash)
	assert.NoError(t, err)
	assert.False(t, match)
}

func TestComparePasswordAndHash_InvalidHash(t *testing.T) {
	provider := NewProvider()
	password, _ := sstring.NewSecureString("test-password")

	tests := []struct {
		name    string
		hash    string
		wantErr bool
	}{
		{
			name:    "invalid format",
			hash:    "invalid-hash",
			wantErr: true,
		},
		{
			name:    "invalid version",
			hash:    "$argon2id$v=999$m=65536,t=3,p=2$c29tZXNhbHQ$aGFzaA",
			wantErr: true,
		},
		{
			name:    "wrong number of segments",
			hash:    "$argon2id$v=19$m=65536,t=3,p=2$salt",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			match, err := provider.ComparePasswordAndHash(password, tt.hash)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
			assert.False(t, match)
		})
	}
}

func TestGenerateSecureRandomBytes(t *testing.T) {
	provider := NewProvider()

	bytes1, err := provider.GenerateSecureRandomBytes(32)
	assert.NoError(t, err)
	assert.Len(t, bytes1, 32)

	bytes2, err := provider.GenerateSecureRandomBytes(32)
	assert.NoError(t, err)
	assert.Len(t, bytes2, 32)

	// Verify randomness
	assert.NotEqual(t, bytes1, bytes2)
}

func TestGenerateSecureRandomString(t *testing.T) {
	provider := NewProvider()

	str1, err := provider.GenerateSecureRandomString(16)
	assert.NoError(t, err)
	assert.Len(t, str1, 32) // hex encoding doubles length

	str2, err := provider.GenerateSecureRandomString(16)
	assert.NoError(t, err)
	assert.Len(t, str2, 32)

	// Verify randomness
	assert.NotEqual(t, str1, str2)
}

func TestDecodeHash(t *testing.T) {
	validHash := "$argon2id$v=19$m=65536,t=3,p=2$c29tZXNhbHQ$RfZ4I7Yq0iL95j81mPxzQl2R7D/lIPKFfY2/H0XXJBI"

	p, salt, hash, err := decodeHash(validHash)
	assert.NoError(t, err)
	assert.NotNil(t, p)
	assert.NotNil(t, salt)
	assert.NotNil(t, hash)
	assert.Equal(t, uint32(65536), p.memory)
	assert.Equal(t, uint32(3), p.iterations)
	assert.Equal(t, uint8(2), p.parallelism)
}
