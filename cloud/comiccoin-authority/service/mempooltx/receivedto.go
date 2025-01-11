package mempooltx

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	uc_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/mempooltx"
)

type MempoolTransactionReceiveDTOFromNetworkService interface {
	Execute(ctx context.Context, dto *domain.MempoolTransactionDTO) error
}

type mempoolTransactionReceiveDTOFromNetworkServiceImpl struct {
	config                          *config.Configuration
	logger                          *slog.Logger
	mempoolTransactionCreateUseCase uc_mempooltx.MempoolTransactionCreateUseCase
}

func NewMempoolTransactionReceiveDTOFromNetworkService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc uc_mempooltx.MempoolTransactionCreateUseCase,
) MempoolTransactionReceiveDTOFromNetworkService {
	return &mempoolTransactionReceiveDTOFromNetworkServiceImpl{cfg, logger, uc}
}

func (s *mempoolTransactionReceiveDTOFromNetworkServiceImpl) Execute(ctx context.Context, dto *domain.MempoolTransactionDTO) error {
	//
	// STEP 1: Validation.
	//

	if dto == nil {
		err := fmt.Errorf("Cannot have empty mempool transaction dto")
		// s.logger.Warn("Validation failed for received",
		// 	slog.Any("error", err))
		return err
	}

	//
	// STEP 2: Convert from data transfer object to internal data object.
	//

	mempoolTx := dto.ToIDO()

	//
	// STEP 3: Save to our database.
	//

	// DEVELOPERS NOTE:
	// What happens when we save the mempooltx submission? Our application
	// is constantly waiting to detect any new transactions in the database
	// and once we submit this current transaction, then the `Proof of
	// Authority` consensus mechanism will activate and execute. Therefore,
	// all we have to do from this service perspective is just save the
	// network submission.
	upsertErr := s.mempoolTransactionCreateUseCase.Execute(ctx, mempoolTx)
	if upsertErr != nil {
		// s.logger.Warn("Validation failed for received",
		// 	slog.Any("error", upsertErr))
		return upsertErr
	}
	return nil

}
