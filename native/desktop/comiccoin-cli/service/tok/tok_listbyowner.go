package tok

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	"github.com/ethereum/go-ethereum/common"

	uc_tok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/tok"
)

type TokenListByOwnerService interface {
	Execute(ctx context.Context, address *common.Address) ([]*domain.Token, error)
}

type tokenListByOwnerServiceImpl struct {
	logger                   *slog.Logger
	listTokensByOwnerUseCase uc_tok.ListTokensByOwnerUseCase
}

func NewTokenListByOwnerService(
	logger *slog.Logger,
	uc1 uc_tok.ListTokensByOwnerUseCase,
) TokenListByOwnerService {
	return &tokenListByOwnerServiceImpl{logger, uc1}
}

func (s *tokenListByOwnerServiceImpl) Execute(ctx context.Context, address *common.Address) ([]*domain.Token, error) {
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
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: List the tokens by owner.
	//

	return s.listTokensByOwnerUseCase.Execute(ctx, address)
}
