// monorepo/cloud/comiccoin/usecase/mempooltx/create.go
package mempooltx

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/ethereum/go-ethereum/common/hexutil"
)

type MempoolTransactionCreateUseCase interface {
	Execute(ctx context.Context, mempoolTx *domain.MempoolTransaction) error
}

type mempoolTransactionCreateUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.MempoolTransactionRepository
}

func NewMempoolTransactionCreateUseCase(config *config.Configuration, logger *slog.Logger, repo domain.MempoolTransactionRepository) MempoolTransactionCreateUseCase {
	return &mempoolTransactionCreateUseCaseImpl{config, logger, repo}
}

func (uc *mempoolTransactionCreateUseCaseImpl) Execute(ctx context.Context, mempoolTx *domain.MempoolTransaction) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if mempoolTx.ChainID != uc.config.Blockchain.ChainID {
		e["chain_id"] = "wrong blockchain used"
	}
	// Nonce - skip validating.
	if mempoolTx.From == nil {
		e["from"] = "missing value"
	}
	if mempoolTx.To == nil {
		e["to"] = "missing value"
	}
	if mempoolTx.Value <= 0 {
		// DEVELOPERS NOTE:
		// Only `coin` type transactions need their value verified while the
		// `token` type transactions can have zero value.
		if mempoolTx.Type == domain.TransactionTypeCoin {
			e["value"] = "missing value"
		}
	}
	if mempoolTx.Type == "" {
		e["type"] = "missing value"
	} else {
		var validType bool = false
		if mempoolTx.Type == domain.TransactionTypeCoin {
			validType = true
		}
		if mempoolTx.Type == domain.TransactionTypeToken {
			validType = true

			if mempoolTx.TokenMetadataURI == "" {
				e["token_metadata_uri"] = "missing value"
			}
		}
		if validType == false {
			e["type"] = fmt.Sprintf("incorrect value: %v", mempoolTx.Type)
		}
	}
	// Tip - skip validating.
	// Data - skip validating.
	if mempoolTx.VBytes == nil {
		e["v_bytes"] = "missing value"
	}
	if mempoolTx.RBytes == nil {
		e["r_bytes"] = "missing value"
	}
	if mempoolTx.SBytes == nil {
		e["s_bytes"] = "missing value"
	}
	if len(e) != 0 {
		// uc.logger.Warn("Validation failed for received",
		// 	slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Validate
	//

	uc.logger.Info("Validating mempool transaction",
		slog.Any("chain_id", mempoolTx.ChainID),
		slog.Any("from", mempoolTx.From.Hex()),
		slog.Any("to", mempoolTx.To.Hex()),
		slog.Any("v_bytes", hexutil.Encode(mempoolTx.VBytes)),
		slog.Any("r_bytes", hexutil.Encode(mempoolTx.RBytes)),
		slog.Any("s_bytes", hexutil.Encode(mempoolTx.SBytes)))

	if err := mempoolTx.Validate(uc.config.Blockchain.ChainID, true); err != nil {
		// uc.logger.Warn("Validation failed for create",
		// 	slog.Any("error", err))
		return err
	}

	//
	// STEP 3: Insert into database.
	//

	return uc.repo.Upsert(ctx, mempoolTx)
}
