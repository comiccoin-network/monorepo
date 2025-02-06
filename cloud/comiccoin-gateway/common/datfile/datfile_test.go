package datfile

import (
	"os"
	"strings"
	"testing"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/datfile"
)

func cleanup(t *testing.T, filename string) {
	os.Remove(filename)
	os.Remove(strings.Replace(filename, " ", "_", -1))
}

func TestNewString(t *testing.T) {
	tests := []struct {
		name        string
		varName     string
		data        string
		expectError bool
	}{
		{
			name:        "basic write",
			varName:     "test1",
			data:        "hello world",
			expectError: false,
		},
		{
			name:        "write with spaces",
			varName:     "test with spaces",
			data:        "content with spaces",
			expectError: false,
		},
		{
			name:        "empty content",
			varName:     "empty",
			data:        "",
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filename := "./" + strings.Replace(tt.varName, " ", "_", -1) + ".dat"
			cleanup(t, filename)

			err := datfile.NewString(tt.varName, tt.data)
			if (err != nil) != tt.expectError {
				t.Errorf("NewString() error = %v, expectError %v", err, tt.expectError)
				return
			}

			content, err := os.ReadFile(filename)
			if err != nil {
				t.Errorf("Failed to read created file: %v", err)
				return
			}

			if string(content) != tt.data {
				t.Errorf("File content = %v, want %v", string(content), tt.data)
			}

			cleanup(t, filename)
		})
	}
}

func TestReadString(t *testing.T) {
	tests := []struct {
		name        string
		varName     string
		content     string
		expectError bool
	}{
		{
			name:        "read existing file",
			varName:     "readable",
			content:     "test content",
			expectError: false,
		},
		{
			name:        "read non-existent file",
			varName:     "nonexistent",
			content:     "",
			expectError: true,
		},
		{
			name:        "read file with spaces in name",
			varName:     "test with spaces",
			content:     "space content",
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filename := "./" + strings.Replace(tt.varName, " ", "_", -1) + ".dat"
			if !tt.expectError {
				err := os.WriteFile(filename, []byte(tt.content), 0644)
				if err != nil {
					t.Fatalf("Failed to create test file: %v", err)
				}
			}

			got, err := datfile.ReadString(tt.varName)
			if (err != nil) != tt.expectError {
				t.Errorf("ReadString() error = %v, expectError %v", err, tt.expectError)
				return
			}

			if !tt.expectError && got != tt.content {
				t.Errorf("ReadString() = %v, want %v", got, tt.content)
			}

			cleanup(t, filename)
		})
	}
}

func TestReadString_Permissions(t *testing.T) {
	filename := "./readonly.dat"
	content := "test content"

	err := os.WriteFile(filename, []byte(content), 0644)
	if err != nil {
		t.Fatalf("Failed to create test file: %v", err)
	}

	err = os.Chmod(filename, 0000)
	if err != nil {
		t.Fatalf("Failed to change file permissions: %v", err)
	}

	_, err = datfile.ReadString("readonly")
	if err == nil {
		t.Error("Expected permission error, got nil")
	}

	os.Chmod(filename, 0644)
	cleanup(t, filename)
}
