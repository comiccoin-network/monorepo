package password

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewProviderV2(t *testing.T) {
	provider := NewProvider()
	assert.NotNil(t, provider)
	assert.Equal(t, "argon2id", provider.AlgorithmName())
}

func TestPasswordHashingV2(t *testing.T) {
	provider := NewProvider()
	password := "test-password"

	hash, err := provider.GenerateHashFromPassword(password)
	assert.NoError(t, err)
	assert.True(t, strings.HasPrefix(hash, "$argon2id$"))

	match, err := provider.ComparePasswordAndHash(password, hash)
	assert.NoError(t, err)
	assert.True(t, match)

	match, err = provider.ComparePasswordAndHash("wrong-password", hash)
	assert.NoError(t, err)
	assert.False(t, match)
}

func TestComparePasswordAndHashInvalidV2(t *testing.T) {
	provider := NewProvider()
	tests := []struct {
		name     string
		password string
		hash     string
		wantErr  bool
	}{
		{
			name:     "invalid format",
			password: "test",
			hash:     "invalid-hash",
			wantErr:  true,
		},
		{
			name:     "invalid version",
			password: "test",
			hash:     "$argon2id$v=999$m=65536,t=3,p=2$c29tZXNhbHQ$aGFzaA",
			wantErr:  true,
		},
		{
			name:     "wrong segments count",
			password: "test",
			hash:     "$argon2id$v=19$m=65536,t=3,p=2$salt",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			match, err := provider.ComparePasswordAndHash(tt.password, tt.hash)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
			assert.False(t, match)
		})
	}
}

func TestGenerateSecureRandomBytesV2(t *testing.T) {
	provider := NewProvider()

	bytes1, err := provider.GenerateSecureRandomBytes(32)
	require.NoError(t, err)
	assert.Len(t, bytes1, 32)

	bytes2, err := provider.GenerateSecureRandomBytes(32)
	require.NoError(t, err)
	assert.Len(t, bytes2, 32)

	assert.NotEqual(t, bytes1, bytes2)
}

func TestGenerateSecureRandomStringV2(t *testing.T) {
	provider := NewProvider()

	str1, err := provider.GenerateSecureRandomString(16)
	require.NoError(t, err)
	assert.Len(t, str1, 32)

	str2, err := provider.GenerateSecureRandomString(16)
	require.NoError(t, err)
	assert.Len(t, str2, 32)

	assert.NotEqual(t, str1, str2)
}

func TestDecodeHashV2(t *testing.T) {
	tests := []struct {
		name    string
		hash    string
		wantErr bool
	}{
		{
			name:    "valid hash",
			hash:    "$argon2id$v=19$m=65536,t=3,p=2$c29tZXNhbHQ$RfZ4I7Yq0iL95j81mPxzQl2R7D/lIPKFfY2/H0XXJBI",
			wantErr: false,
		},
		{
			name:    "incorrect segments",
			hash:    "$argon2id$v=19$m=65536,t=3,p=2$salt",
			wantErr: true,
		},
		{
			name:    "wrong format",
			hash:    "not-a-hash",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p, salt, hash, err := decodeHash(tt.hash)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, p)
				assert.Nil(t, salt)
				assert.Nil(t, hash)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, p)
				assert.NotNil(t, salt)
				assert.NotNil(t, hash)
			}
		})
	}
}
