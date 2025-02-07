package keystore

import (
	"bytes"
	"log"
	"os"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/security/securestring"
)

func suppressLog(t *testing.T) func() {
	var buf bytes.Buffer
	log.SetOutput(&buf)
	return func() {
		log.SetOutput(os.Stderr)
	}
}

func TestNewAdapter(t *testing.T) {
	defer suppressLog(t)()
	adapter := NewAdapter()
	assert.NotNil(t, adapter)
	_, ok := adapter.(*keystoreAdapterImpl)
	assert.True(t, ok)
}

func TestCreateWallet(t *testing.T) {
	defer suppressLog(t)()
	adapter := NewAdapter()
	password, err := sstring.NewSecureString("test-password")
	require.NoError(t, err)

	address, keyJSON, err := adapter.CreateWallet(password)
	assert.NoError(t, err)
	assert.NotEqual(t, common.Address{}, address)
	assert.NotEmpty(t, keyJSON)

	key, err := adapter.OpenWallet(keyJSON, password)
	assert.NoError(t, err)
	assert.Equal(t, address, key.Address)
}

func TestOpenWallet(t *testing.T) {
	defer suppressLog(t)()
	adapter := NewAdapter()
	password, err := sstring.NewSecureString("test-password")
	require.NoError(t, err)

	address, keyJSON, err := adapter.CreateWallet(password)
	require.NoError(t, err)

	tests := []struct {
		name     string
		keyJSON  []byte
		password string
		wantErr  bool
	}{
		{
			name:     "valid credentials",
			keyJSON:  keyJSON,
			password: "test-password",
			wantErr:  false,
		},
		{
			name:     "wrong password",
			keyJSON:  keyJSON,
			password: "wrong-password",
			wantErr:  true,
		},
		{
			name:     "invalid keyJSON",
			keyJSON:  []byte("invalid"),
			password: "test-password",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			password, err := sstring.NewSecureString(tt.password)
			require.NoError(t, err)

			key, err := adapter.OpenWallet(tt.keyJSON, password)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, key)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, key)
				assert.Equal(t, address, key.Address)
			}
		})
	}
}

func TestCreateWalletInMemory(t *testing.T) {
	defer suppressLog(t)()
	password, err := sstring.NewSecureString("test-password")
	require.NoError(t, err)

	address, keyJSON, err := CreateWalletInMemory(password)
	assert.NoError(t, err)
	assert.NotEqual(t, common.Address{}, address)
	assert.NotEmpty(t, keyJSON)

	key, err := OpenWalletFromMemory(keyJSON, password)
	assert.NoError(t, err)
	assert.Equal(t, address, key.Address)
}

func TestOpenWalletFromMemory(t *testing.T) {
	defer suppressLog(t)()
	password, err := sstring.NewSecureString("test-password")
	require.NoError(t, err)

	address, keyJSON, err := CreateWalletInMemory(password)
	require.NoError(t, err)

	key, err := OpenWalletFromMemory(keyJSON, password)
	assert.NoError(t, err)
	assert.NotNil(t, key)
	assert.Equal(t, address, key.Address)

	wrongPassword, _ := sstring.NewSecureString("wrong-password")
	key, err = OpenWalletFromMemory(keyJSON, wrongPassword)
	assert.Error(t, err)
	assert.Nil(t, key)

	key, err = OpenWalletFromMemory([]byte("invalid"), password)
	assert.Error(t, err)
	assert.Nil(t, key)
}
