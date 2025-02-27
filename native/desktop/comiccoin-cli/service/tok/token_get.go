package tok

import (
	"context"
	"log/slog"
	"math/big"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"

	uc_tok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/tok"
)

type TokenGetService interface {
	Execute(ctx context.Context, tokenID *big.Int) (*domain.Token, error)
}

type tokenGetServiceImpl struct {
	logger          *slog.Logger
	getTokenUseCase uc_tok.GetTokenUseCase
}

func NewTokenGetService(
	logger *slog.Logger,
	uc1 uc_tok.GetTokenUseCase,
) TokenGetService {
	return &tokenGetServiceImpl{logger, uc1}
}

func (s *tokenGetServiceImpl) Execute(ctx context.Context, tokenID *big.Int) (*domain.Token, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if tokenID == nil {
		e["token_id"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Validation failed for getting token",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get our token from our in-memory database if it exists.
	//

	token, err := s.getTokenUseCase.Execute(ctx, tokenID)
	if err != nil {
		if !strings.Contains(err.Error(), "does not exist") {
			s.logger.Error("failed getting token",
				slog.Any("token_id", tokenID),
				slog.Any("error", err))
			return nil, err
		}
	}
	if token != nil {
		return token, nil
	}

	return token, nil
}
