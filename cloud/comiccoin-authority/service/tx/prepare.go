package blockchainstate

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"
	"strings"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockchainstate"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
)

type PrepareTransactionRequestIDO struct {
	// Name of the account
	SenderAccountAddress string `json:"sender_account_address"`

	// Recipient’s public key
	RecipientAddress string `json:"recipient_address"`

	// Value is amount of coins being transferred
	Value uint64 `json:"value"`

	// Data is any Token related data attached
	Data string `json:"data"`

	// ComicCoin: The type of transaction this is, either `coin` or `token`.
	Type string `bson:"type" json:"type"`
}

type PrepareTransactionResponseIDO struct {
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

type PrepareTransactionService interface {
	Execute(ctx context.Context, req *PrepareTransactionRequestIDO) (*PrepareTransactionResponseIDO, error)
}

type prepareTransactionServiceImpl struct {
	config                    *config.Configuration
	logger                    *slog.Logger
	getBlockchainStateUseCase uc_blockchainstate.GetBlockchainStateUseCase
}

func NewPrepareTransactionService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc uc_blockchainstate.GetBlockchainStateUseCase,
) PrepareTransactionService {
	return &prepareTransactionServiceImpl{cfg, logger, uc}
}

func (s *prepareTransactionServiceImpl) Execute(ctx context.Context, req *PrepareTransactionRequestIDO) (*PrepareTransactionResponseIDO, error) {
	//
	// STEP 1: Validation.
	//

	if req == nil {
		errStr := "No prepare transaction request received"
		s.logger.Error("Failed preparing transaction", slog.Any("error", errStr))
		return nil, httperror.NewForNotFoundWithSingleField("error", errStr)
	}
	e := make(map[string]string)
	if req.SenderAccountAddress == "" {
		e["sender_account_address"] = "Sender account address is required"
	}
	if req.RecipientAddress == "" {
		e["recipient_address"] = "Recipient address is required"
	}
	if req.Value == 0 {
		e["recipient_address"] = "Value is required"
	}
	if req.Type == "" {
		e["type"] = "Type is required"
	} else {
		if req.Type != "coin" && req.Type != "token" {
			e["type"] = "Type must be either `coin` or `token`"
		}
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating prepare transaction parameters",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get related records.
	//

	blkchState, err := s.getBlockchainStateUseCase.Execute(ctx, s.config.Blockchain.ChainID)
	if err != nil {
		s.logger.Error("Failed getting blockchain state", slog.Any("error", err))
		return nil, err
	}
	if blkchState == nil {
		errStr := fmt.Sprintf("Blockchain state does not exist for chain ID: %v", s.config.Blockchain.ChainID)
		s.logger.Error("Failed getting blockchain state", slog.Any("error", errStr))
		return nil, httperror.NewForNotFoundWithSingleField("chain_id", errStr)
	}

	toAddr := common.HexToAddress(strings.ToLower(req.RecipientAddress))
	senderAddr := common.HexToAddress(strings.ToLower(req.SenderAccountAddress))

	//
	// STEP 3: Create our unsigned transaction to send back to the user.
	//

	nonceBigInt := big.NewInt(time.Now().Unix())
	nonceBytes := nonceBigInt.Bytes()

	preparedTx := &PrepareTransactionResponseIDO{
		ChainID:    s.config.Blockchain.ChainID,
		NonceBytes: nonceBytes,
		From:       &senderAddr,
		To:         &toAddr,
		Value:      req.Value + s.config.Blockchain.TransactionFee, // Note: The transaction fee gets reclaimed by the us, so it's fully recirculating when authority calls this.
		Data:       []byte(req.Data),
		Type:       req.Type,
	}

	// Just before returning the prepared transaction
	s.logger.Debug("Transaction template details",
		slog.Any("chain_id", preparedTx.ChainID),
		slog.Any("nonce_bytes_hex", hexutil.Encode(preparedTx.NonceBytes)),
		// slog.Any("nonce_string", preparedTx.NonceString),
		slog.Any("from", preparedTx.From.Hex()),
		slog.Any("to", preparedTx.To.Hex()),
		slog.Any("value", preparedTx.Value),
		slog.Any("data_hex", hexutil.Encode(preparedTx.Data)),
		slog.String("type", preparedTx.Type))

	return preparedTx, nil
}
