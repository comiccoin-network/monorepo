package securebytes

import (
	"errors"
	"fmt"

	"github.com/awnumar/memguard"
)

// SecureBytes is used to store a byte slice securely in memory.
type SecureBytes struct {
	buffer *memguard.LockedBuffer
}

// NewSecureBytes creates a new SecureBytes instance from the given byte slice.
func NewSecureBytes(b []byte) (*SecureBytes, error) {
	if len(b) == 0 {
		return nil, errors.New("byte slice cannot be empty")
	}

	buffer := memguard.NewBuffer(len(b))

	// Check if buffer was created successfully
	if buffer == nil {
		return nil, errors.New("failed to create buffer")
	}

	return &SecureBytes{buffer: buffer}, nil
}

// Bytes returns the securely stored byte slice.
func (sb *SecureBytes) Bytes() []byte {
	if sb.buffer == nil {
		fmt.Println("Bytes(): buffer is nil")
		return nil
	}
	if !sb.buffer.IsAlive() {
		fmt.Println("Bytes(): buffer is not alive")
		return nil
	}
	return sb.buffer.Bytes()
}

// Wipe removes the byte slice from memory and makes it unrecoverable.
func (sb *SecureBytes) Wipe() error {
	if sb.buffer != nil {
		if sb.buffer.IsAlive() {
			sb.buffer.Destroy()
			fmt.Println("Wipe(): Buffer destroyed")
		}
	}

	sb.buffer = nil
	return nil
}
