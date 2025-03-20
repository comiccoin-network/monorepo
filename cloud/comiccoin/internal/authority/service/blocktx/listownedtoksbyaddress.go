package blocktx

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"
	"os"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	uc_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blocktx"
	uc_nftok "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/nftok"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
)

type BlockTransactionExtended struct {
	SignedTransactionExtended
	TimeStamp uint64 `bson:"timestamp" json:"timestamp"` // Ethereum: The time the transaction was received.
	Fee       uint64 `bson:"fee" json:"fee"`             // ComicCoin: Fee paid for this transaction to the ComicCoin authority.
}

type SignedTransactionExtended struct {
	TransactionExtended

	// Known Issue:
	// MongoDB does not natively support storing `*big.Int` types directly,
	// which may cause issues if the `V`, `R`, and `S` fields of the
	// `SignedTransaction` are of type `*big.Int`.
	// These fields need to be converted to an alternate type (e.g., `string`
	// or `[]byte`) before saving to MongoDB, as `big.Int` values are not
	// natively serialized by BSON.
	// To resolve this, we convert `*big.Int` fields to `[]byte` in the model.

	VBytes []byte `bson:"v_bytes,omitempty" json:"v_bytes"`  // Ethereum: Recovery identifier, either 29 or 30 with comicCoinID.
	RBytes []byte `bson:"r_bytes,omitempty"  json:"r_bytes"` // Ethereum: First coordinate of the ECDSA signature.
	SBytes []byte `bson:"s_bytes,omitempty"  json:"s_bytes"` // Ethereum: Second coordinate of the ECDSA signature.
}

type TransactionExtended struct {
	ChainID          uint16                           `bson:"chain_id" json:"chain_id"`                     // Ethereum: The chain id that is listed in the genesis file.
	NonceBytes       []byte                           `bson:"nonce_bytes" json:"nonce_bytes"`               // Ethereum: Unique id for the transaction supplied by the user.
	NonceString      string                           `bson:"-" json:"nonce_string"`                        // Read-only response in string format - will not be saved in database, only returned via API.
	From             *common.Address                  `bson:"from" json:"from"`                             // Ethereum: Account sending the transaction. Will be checked against signature.
	To               *common.Address                  `bson:"to" json:"to"`                                 // Ethereum: Account receiving the benefit of the transaction.
	Value            uint64                           `bson:"value" json:"value"`                           // Ethereum: Monetary value received from this transaction.
	Data             []byte                           `bson:"data" json:"data"`                             // Ethereum: Extra data related to the transaction.
	DataString       string                           `bson:"-" json:"data_string"`                         // Read-only response in string format - will not be saved in database, only returned via API.
	Type             string                           `bson:"type" json:"type"`                             // ComicCoin: The type of transaction this is, either `coin` or `token`.
	TokenIDBytes     []byte                           `bson:"token_id_bytes" json:"token_id_bytes"`         // ComicCoin: Unique identifier for the Token (if this transaciton is an Token).
	TokenIDString    string                           `bson:"-" json:"token_id_string"`                     // Read-only response in string format - will not be saved in database, only returned via API.
	TokenMetadataURI string                           `bson:"token_metadata_uri" json:"token_metadata_uri"` // ComicCoin: URI pointing to Token metadata file (if this transaciton is an Token).
	TokenNonceBytes  []byte                           `bson:"token_nonce_bytes" json:"token_nonce_bytes"`   // ComicCoin: For every transaction action (mint, transfer, burn, etc), increment token nonce by value of 1.
	TokenNonceString string                           `bson:"-" json:"token_nonce_string"`                  // Read-only response in string format - will not be saved in database, only returned via API.
	TokenMetadata    *domain.NonFungibleTokenMetadata `bson:"token_metadata" json:"token_metadata"`         // ComicCoin: URI pointing to Token metadata file (if this transaciton is an Token).

}

type ListOwnedTokenBlockTransactionsByAddressService interface {
	Execute(ctx context.Context, address *common.Address) ([]*BlockTransactionExtended, error)
}

type listOwnedTokenBlockTransactionsByAddressServiceImpl struct {
	config                                          *config.Configuration
	logger                                          *slog.Logger
	listOwnedTokenBlockTransactionsByAddressUseCase uc_blocktx.ListOwnedTokenBlockTransactionsByAddressUseCase
	downloadNFTokMetadataUsecase                    uc_nftok.DownloadMetadataNonFungibleTokenUseCase
}

func NewListOwnedTokenBlockTransactionsByAddressService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc1 uc_blocktx.ListOwnedTokenBlockTransactionsByAddressUseCase,
	uc2 uc_nftok.DownloadMetadataNonFungibleTokenUseCase,
) ListOwnedTokenBlockTransactionsByAddressService {
	return &listOwnedTokenBlockTransactionsByAddressServiceImpl{cfg, logger, uc1, uc2}
}

func (s *listOwnedTokenBlockTransactionsByAddressServiceImpl) Execute(ctx context.Context, address *common.Address) ([]*BlockTransactionExtended, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "Address is required"
	} else {
		if address.String() == "" {
			e["address"] = "Address is required"
		} else {
			// Defensive code: We want to restrict getting all the transactions
			// from `coinbase address` b/c it will overload the system.
			if address.String() == s.config.Blockchain.ProofOfAuthorityAccountAddress.String() {
				e["address"] = "Coinbase address lookup is restricted"
			}
		}
	}
	if len(e) != 0 {
		s.logger.Warn("Failed faild",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Fetch from database.
	//

	data, err := s.listOwnedTokenBlockTransactionsByAddressUseCase.Execute(ctx, address)
	if err != nil {
		s.logger.Error("Failed listing owned token block transactions by address",
			slog.Any("address", address),
			slog.Any("error", err))
		return nil, err
	}
	if data == nil {
		s.logger.Warn("Owned token block transactions list is empty for lookup",
			slog.Any("address", address))
		return []*BlockTransactionExtended{}, nil
	}

	//
	// STEP 3: Convert to BlockTransactionExtended.

	dataExtended := make([]*BlockTransactionExtended, len(data))
	for i, v := range data {
		dataExtended[i] = &BlockTransactionExtended{
			SignedTransactionExtended: SignedTransactionExtended{
				TransactionExtended: TransactionExtended{
					ChainID:          v.ChainID,
					NonceBytes:       v.NonceBytes,
					NonceString:      v.NonceString,
					From:             v.From,
					To:               v.To,
					Value:            v.Value,
					Data:             v.Data,
					DataString:       v.DataString,
					Type:             v.Type,
					TokenIDBytes:     v.TokenIDBytes,
					TokenIDString:    v.TokenIDString,
					TokenMetadataURI: v.TokenMetadataURI,
					TokenNonceBytes:  v.TokenNonceBytes,
					TokenNonceString: v.TokenNonceString,
				},
				RBytes: v.RBytes,
				SBytes: v.SBytes,
			},
			TimeStamp: v.TimeStamp,
			Fee:       v.Fee,
		}
	}

	//
	// STEP 4: Create a tmp folder in RAM (and not HDD).
	//

	// Create a unique temporary directory in RAM
	tempDir := fmt.Sprintf("/dev/shm/comiccoin-%d", time.Now().UnixNano())
	if err := os.MkdirAll(tempDir, 0750); err != nil {
		s.logger.Error("Failed creating temporary RAM directory",
			slog.String("path", tempDir),
			slog.Any("error", err))
		return nil, fmt.Errorf("failed to create temporary directory: %w", err)
	}
	// Ensure cleanup
	defer func() {
		if err := os.RemoveAll(tempDir); err != nil {
			s.logger.Error("Failed cleaning up temporary RAM directory",
				slog.String("path", tempDir),
				slog.Any("error", err))
		}
	}()

	//
	// STEP 5: Fetch from NFT STorage.
	//

	for _, v := range dataExtended {
		tokID := new(big.Int).SetBytes(v.TokenIDBytes)
		metadata, filepath, err := s.downloadNFTokMetadataUsecase.Execute(tokID, v.TokenMetadataURI, tempDir)
		if err != nil {
			s.logger.Error("Failed downloading NFT metadata",
				slog.Any("token_id", v.TokenIDBytes),
				slog.Any("error", err))
			continue
		}

		//
		// STEP 6: Attach data and post process that data.
		//

		v.TokenMetadata = metadata

		if v.TokenMetadata != nil && v.TokenMetadata.Image != "" {
			v.TokenMetadata.Image = strings.Replace(v.TokenMetadata.Image, "ipfs://", fmt.Sprintf("%v/ipfs/", s.config.NFTStore.URI), 1)
		}
		if v.TokenMetadata != nil && v.TokenMetadata.AnimationURL != "" {
			v.TokenMetadata.AnimationURL = strings.Replace(v.TokenMetadata.AnimationURL, "ipfs://", fmt.Sprintf("%v/ipfs/", s.config.NFTStore.URI), 1)
		}

		_ = filepath // Do nothing.
	}

	return dataExtended, nil
}
