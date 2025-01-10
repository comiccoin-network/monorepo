package token

import (
	"context"
	"log/slog"
	"math/big"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/token"
)

type TokenRetrieveService interface {
	Execute(ctx context.Context, id *big.Int) (*domain.Token, error)
}

type tokenRetrieveServiceImpl struct {
	logger          *slog.Logger
	getTokenUseCase uc_token.GetTokenUseCase
}

func NewTokenRetrieveService(
	logger *slog.Logger,
	uc1 uc_token.GetTokenUseCase,
) TokenRetrieveService {
	return &tokenRetrieveServiceImpl{logger, uc1}
}

func (s *tokenRetrieveServiceImpl) Execute(ctx context.Context, id *big.Int) (*domain.Token, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if id == nil {
		e["id"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Validation failed for getting token",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get our token from our in-memory database if it exists.
	//

	token, err := s.getTokenUseCase.Execute(ctx, id)
	if err != nil {
		if !strings.Contains(err.Error(), "does not exist") {
			s.logger.Error("failed getting token",
				slog.Any("id", id),
				slog.Any("error", err))
			return nil, err
		}
	}
	if token != nil {
		return token, nil
	}

	return token, nil
}
