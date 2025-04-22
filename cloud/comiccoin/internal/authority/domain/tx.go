// monorepo/cloud/comiccoin/domain/tx.go
package domain

import (
	"crypto/ecdsa"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/signature"
)

const (
	TransactionTypeCoin  = "coin"
	TransactionTypeToken = "token"
)

// Transaction structure represents a transfer of coins between accounts
// which have not been added to the blockchain yet and are waiting for the miner
// to receive and verify. Once  transactions have been veriried
// they will be deleted from our system as they will live in the blockchain
// afterwords.
type Transaction struct {
	ChainID          uint16          `bson:"chain_id" json:"chain_id"`                     // Ethereum: The chain id that is listed in the genesis file.
	NonceBytes       []byte          `bson:"nonce_bytes" json:"nonce_bytes"`               // Ethereum: Unique id for the transaction supplied by the user.
	NonceString      string          `bson:"-" json:"nonce_string"`                        // Read-only response in string format - will not be saved in database, only returned via API.
	From             *common.Address `bson:"from" json:"from"`                             // Ethereum: Account sending the transaction. Will be checked against signature.
	To               *common.Address `bson:"to" json:"to"`                                 // Ethereum: Account receiving the benefit of the transaction.
	Value            uint64          `bson:"value" json:"value"`                           // Ethereum: Monetary value received from this transaction.
	Data             []byte          `bson:"data" json:"data"`                             // Ethereum: Extra data related to the transaction.
	DataString       string          `bson:"-" json:"data_string"`                         // Read-only response in string format - will not be saved in database, only returned via API.
	Type             string          `bson:"type" json:"type"`                             // ComicCoin: The type of transaction this is, either `coin` or `token`.
	TokenIDBytes     []byte          `bson:"token_id_bytes" json:"token_id_bytes"`         // ComicCoin: Unique identifier for the Token (if this transaciton is an Token).
	TokenIDString    string          `bson:"-" json:"token_id_string"`                     // Read-only response in string format - will not be saved in database, only returned via API.
	TokenMetadataURI string          `bson:"token_metadata_uri" json:"token_metadata_uri"` // ComicCoin: URI pointing to Token metadata file (if this transaciton is an Token).
	TokenNonceBytes  []byte          `bson:"token_nonce_bytes" json:"token_nonce_bytes"`   // ComicCoin: For every transaction action (mint, transfer, burn, etc), increment token nonce by value of 1.
	TokenNonceString string          `bson:"-" json:"token_nonce_string"`                  // Read-only response in string format - will not be saved in database, only returned via API.
}

func (tx *Transaction) GetNonce() *big.Int {
	return new(big.Int).SetBytes(tx.NonceBytes)
}

func (tx *Transaction) IsNonceZero() bool {
	// Special thanks to "Is there another way of testing if a big.Int is 0?" via https://stackoverflow.com/a/64257532
	return len(tx.GetNonce().Bits()) == 0
}

func (tx *Transaction) SetNonce(n *big.Int) {
	tx.NonceBytes = n.Bytes()
}

func (tx *Transaction) GetTokenID() *big.Int {
	return new(big.Int).SetBytes(tx.TokenIDBytes)
}

func (tx *Transaction) IsTokenIDZero() bool {
	// Special thanks to "Is there another way of testing if a big.Int is 0?" via https://stackoverflow.com/a/64257532
	return len(tx.GetTokenID().Bits()) == 0
}

func (tx *Transaction) SetTTokenID(n *big.Int) {
	tx.TokenIDBytes = n.Bytes()
}

func (tx *Transaction) GetTokenNonce() *big.Int {
	return new(big.Int).SetBytes(tx.TokenNonceBytes)
}

func (tx *Transaction) IsTokenNonceZero() bool {
	// Special thanks to "Is there another way of testing if a big.Int is 0?" via https://stackoverflow.com/a/64257532
	return len(tx.GetTokenNonce().Bits()) == 0
}

func (tx *Transaction) SetTokenNonce(n *big.Int) {
	tx.TokenNonceBytes = n.Bytes()
}

// Sign function signs the  transaction using the user's private key
// and returns a signed version of that transaction.
func (tx Transaction) Sign(privateKey *ecdsa.PrivateKey) (SignedTransaction, error) {
	// Break the signature into the 3 parts: R, S, and V.
	v, r, s, err := signature.Sign(tx, privateKey)
	if err != nil {
		return SignedTransaction{}, err
	}

	// Create the signed transaction, including the original transaction and the signature parts.
	signedTx := SignedTransaction{
		Transaction: tx,
	}

	// Note: MongoDB doesn't support `*big.Int` so we are forced to do this.
	signedTx.SetBigIntFields(v, r, s)

	return signedTx, nil
}

// HashWithComicCoinStamp creates a unique hash of the transaction and
// prepares it for signing by adding a special "stamp".
func (tx Transaction) HashWithComicCoinStamp() ([]byte, error) {
	return signature.HashWithComicCoinStamp(tx)
}

// FromAddress extracts the account address from the signed transaction by
// recovering the public key from the signature.
func (stx SignedTransaction) FromAddress() (string, error) {
	// Note: MongoDB doesn't support `*big.Int` so we are forced to do this.
	v, r, s := stx.GetBigIntFields()

	fmt.Println("domain/tx.go -> FromAddress() -> v:", v)
	fmt.Println("domain/tx.go -> FromAddress() -> r:", r)
	fmt.Println("domain/tx.go -> FromAddress() -> s:", s)
	fmt.Println("domain/tx.go -> FromAddress() -> stx.Transaction -> ChainID:", stx.Transaction.ChainID)
	fmt.Println("domain/tx.go -> FromAddress() -> stx.Transaction -> NonceBytes:", stx.Transaction.NonceBytes)
	fmt.Println("domain/tx.go -> FromAddress() -> stx.Transaction -> From:", stx.Transaction.From)
	fmt.Println("domain/tx.go -> FromAddress() -> stx.Transaction -> To:", stx.Transaction.To)
	fmt.Println("domain/tx.go -> FromAddress() -> stx.Transaction -> Value:", stx.Transaction.Value)
	fmt.Println("domain/tx.go -> FromAddress() -> stx.Transaction -> Data:", stx.Transaction.Data)
	fmt.Println("domain/tx.go -> FromAddress() -> stx.Transaction -> Type:", stx.Transaction.Type)
	fmt.Println("domain/tx.go -> FromAddress() -> stx.Transaction -> TokenIDBytes:", stx.Transaction.TokenIDBytes)
	fmt.Println("domain/tx.go -> FromAddress() -> stx.Transaction -> TokenMetadataURI:", stx.Transaction.TokenMetadataURI)
	fmt.Println("domain/tx.go -> FromAddress() -> stx.Transaction -> TokenNonceBytes:", stx.Transaction.TokenNonceBytes)
	fmt.Println("domain/tx.go -> FromAddress() -> stx -> VBytes:", stx.VBytes)
	fmt.Println("domain/tx.go -> FromAddress() -> stx -> RBytes:", stx.RBytes)
	fmt.Println("domain/tx.go -> FromAddress() -> stx -> SBytes:", stx.SBytes)
	sig, err := signature.FromAddress(stx.Transaction, v, r, s)
	fmt.Println("domain/tx.go -> FromAddress() -> signature.FromAddress() ->:", sig, err)
	return sig, err
}

// VerifySignature checks if the signature is valid by ensuring the V value
// is correct and that the signature follows the proper rules.
func VerifySignature(v, r, s *big.Int) error {
	return signature.VerifySignature(v, r, s)
}
