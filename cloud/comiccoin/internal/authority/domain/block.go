package domain

import (
	"errors"
	"fmt"
	"math/big"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/merkle"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/signature"
)

// Block represents a group of transactions batched together.
// It contains a block header and a Merkle tree of transactions.
type Block struct {
	// Header is the block header, which contains metadata about the block.
	Header *BlockHeader

	// The signature of this block's "Header" field which was applied by the
	// proof-of-authority validator.
	HeaderSignatureBytes []byte `bson:"header_signature_bytes" json:"header_signature_bytes"`

	// MerkleTree is the Merkle tree of transactions, which allows for efficient verification of transaction inclusion.
	MerkleTree *merkle.Tree[BlockTransaction]

	// The proof-of-authority validator whom executed the validation of
	// this block data in our blockchain.
	Validator *Validator `bson:"validator" json:"validator"`
}

// NewBlockData constructs block data from a block.
func NewBlockData(block Block) *BlockData {
	// Create a new block data structure to hold the block's metadata and transactions.
	blockData := BlockData{
		// Hash is the unique hash of the block.
		Hash: block.Hash(),

		// Header is the block header, which contains metadata about the block.
		Header: block.Header,

		// Proof of Authority signature of the block header.
		HeaderSignatureBytes: block.HeaderSignatureBytes,

		// Trans is the list of transactions in the block.
		Trans: block.MerkleTree.Values(),

		Validator: block.Validator,
	}

	return &blockData
}

// Hash returns the unique hash for the Block.
func (b Block) Hash() string {
	// If this is the genesis block, return a special zero hash.
	if b.Header.IsNumberZero() {
		return signature.ZeroHash
	}

	// CORE NOTE: Hashing the block header and not the whole block so the blockchain
	// can be cryptographically checked by only needing block headers and not full
	// blocks with the transaction data. This will support the ability to have pruned
	// nodes and light clients in the future.
	// - A pruned node stores all the block headers, but only a small number of full
	//   blocks (maybe the last 1000 blocks). This allows for full cryptographic
	//   validation of blocks and transactions without all the extra storage.
	// - A light client keeps block headers and just enough sufficient information
	//   to follow the latest set of blocks being produced. The do not validate
	//   blocks, but can prove a transaction is in a block.

	return signature.Hash(b.Header)
}

// isHashSolved checks the hash to make sure it complies with
// the POW rules. We need to match a difficulty number of 0's.
func isHashSolved(difficulty uint16, hash string) bool {
	// Create a string of 0's to match the difficulty.
	const match = "0x00000000000000000"

	// Check if the hash is long enough to match the difficulty.
	if len(hash) != 66 {
		return false
	}

	// Check if the hash starts with the correct number of 0's.
	difficulty += 2
	return hash[:difficulty] == match[:difficulty]
}

// ErrChainForked is returned from validateNextBlock if another node's chain
// is two or more blocks ahead of ours.
var ErrChainForked = errors.New("blockchain forked, start resync")

// ValidateBlock takes a block and validates it to be included into the blockchain.
func (b Block) ValidateBlock(previousBlock *Block, stateRoot string) error {
	//
	// VALIDATION 1:
	// Check: chain is not forked
	//

	// The node who sent this block has a chain that is two or more blocks ahead
	// of ours. This means there has been a fork and we are on the wrong side.
	currNumb := previousBlock.Header.GetNumber()
	nextNumber := currNumb.Add(currNumb, big.NewInt(2))
	nextNumberPlus2 := currNumb.Add(nextNumber, big.NewInt(2))
	if b.Header.GetNumber().Cmp(nextNumberPlus2) >= 0 {
		return ErrChainForked
	}

	//
	// VALIDATION 2:
	// Check: block difficulty is the same or greater than parent block difficulty
	//

	if b.Header.Difficulty < previousBlock.Header.Difficulty {
		return fmt.Errorf("block difficulty is less than previous block difficulty, parent %d, block %d", previousBlock.Header.Difficulty, b.Header.Difficulty)
	}

	//
	// VALIDATION 3:
	// Check: block hash has been solved
	//

	hash := b.Hash()
	if !isHashSolved(b.Header.Difficulty, hash) {
		return fmt.Errorf("%s invalid block hash", hash)
	}

	//
	// VALIDATION 4:
	// Check: block number is the next number
	//

	if b.Header.GetNumber().Cmp(nextNumber) != 0 {
		return fmt.Errorf("this block is not the next number, got %d, exp %d", b.Header.GetNumber(), nextNumber)
	}

	//
	// VALIDATION 5:
	// Check: parent hash does match parent block
	//

	if b.Header.PrevBlockHash != previousBlock.Hash() {
		return fmt.Errorf("parent block hash doesn't match our known parent, got %s, exp %s", b.Header.PrevBlockHash, previousBlock.Hash())
	}

	//
	// VALIDATION 6:
	// Check: block's timestamp is greater than parent block's timestamp
	//

	if previousBlock.Header.TimeStamp > 0 {
		parentTime := time.Unix(int64(previousBlock.Header.TimeStamp), 0)
		blockTime := time.Unix(int64(b.Header.TimeStamp), 0)
		if blockTime.Before(parentTime) {
			return fmt.Errorf("block timestamp is before parent block, parent %s, block %s", parentTime, blockTime)
		}

		// This is a check that Ethereum does but we can't because we don't run all the time.
		// //
		// // VALIDATION X
		// // Check: block is less than 15 minutes apart from parent block
		// //
		//
		// dur := blockTime.Sub(parentTime)
		// if dur.Seconds() > time.Duration(15*time.Second).Seconds() {
		// 	return fmt.Errorf("block is older than 15 minutes, duration %v", dur)
		// }
	}

	//
	// VALIDATION 7:
	// Check: state root hash does match current database
	//

	if b.Header.StateRoot != stateRoot {
		return fmt.Errorf("state of the accounts are wrong, current stateRoot %s, expected stateRoot %s", stateRoot, b.Header.StateRoot)
	}

	//
	// VALIDATION 8:
	// Check: merkle root does match transactions
	//

	if b.Header.TransRoot != b.MerkleTree.RootHex() {
		return fmt.Errorf("merkle root does not match transactions, got %s, exp %s", b.MerkleTree.RootHex(), b.Header.TransRoot)
	}

	return nil
}

// ToBlock converts a storage block into a database block.
func ToBlock(blockData *BlockData) (*Block, error) {
	// Create a new Merkle tree from the block's transactions.
	tree, err := merkle.NewTree(blockData.Trans)
	if err != nil {
		return &Block{}, err
	}

	// Create a new block from the block data and Merkle tree.
	block := &Block{
		Header:               blockData.Header,
		HeaderSignatureBytes: blockData.HeaderSignatureBytes,
		MerkleTree:           tree,
		Validator:            blockData.Validator,
	}

	return block, nil
}
