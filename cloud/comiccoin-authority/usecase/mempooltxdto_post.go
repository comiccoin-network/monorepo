package usecase

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
)

type SubmitMempoolTransactionDTOToBlockchainAuthorityUseCase struct {
	logger *slog.Logger
	repo   domain.MempoolTransactionDTORepository
}

func NewSubmitMempoolTransactionDTOToBlockchainAuthorityUseCase(logger *slog.Logger, repo domain.MempoolTransactionDTORepository) *SubmitMempoolTransactionDTOToBlockchainAuthorityUseCase {
	return &SubmitMempoolTransactionDTOToBlockchainAuthorityUseCase{logger, repo}
}

func (uc *SubmitMempoolTransactionDTOToBlockchainAuthorityUseCase) Execute(ctx context.Context, dto *domain.MempoolTransactionDTO) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if dto == nil {
		e["dto"] = "missing value"
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Submit to blockchain authority.
	//

	err := uc.repo.SubmitToBlockchainAuthority(ctx, dto)
	if err != nil {
		uc.logger.Warn("Failed submitting to blockchain authority",
			slog.Any("error", err))
		return err
	}
	return nil
}
