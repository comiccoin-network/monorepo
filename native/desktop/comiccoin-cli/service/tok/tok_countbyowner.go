package tok

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/ethereum/go-ethereum/common"

	uc_tok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/tok"
)

type TokenCountByOwnerService interface {
	Execute(ctx context.Context, address *common.Address) (int64, error)
}

type tokenCountByOwnerServiceImpl struct {
	logger                    *slog.Logger
	countTokensByOwnerUseCase uc_tok.CountTokensByOwnerUseCase
}

func NewTokenCountByOwnerService(
	logger *slog.Logger,
	uc1 uc_tok.CountTokensByOwnerUseCase,
) TokenCountByOwnerService {
	return &tokenCountByOwnerServiceImpl{logger, uc1}
}

func (s *tokenCountByOwnerServiceImpl) Execute(ctx context.Context, address *common.Address) (int64, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating listing tokens by owner",
			slog.Any("error", e))
		return 0, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Count the tokens by owner.
	//

	return s.countTokensByOwnerUseCase.Execute(ctx, address)
}
