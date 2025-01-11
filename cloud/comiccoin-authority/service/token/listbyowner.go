package token

import (
	"context"
	"log/slog"
	"strings"

	"github.com/ethereum/go-ethereum/common"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/token"
)

type TokenListByOwnerService interface {
	Execute(ctx context.Context, ownerAddr *common.Address) ([]*domain.Token, error)
}

type tokenListByOwnerServiceImpl struct {
	logger                   *slog.Logger
	listTokensByOwnerUseCase uc_token.ListTokensByOwnerUseCase
}

func NewTokenListByOwnerService(
	logger *slog.Logger,
	uc1 uc_token.ListTokensByOwnerUseCase,
) TokenListByOwnerService {
	return &tokenListByOwnerServiceImpl{logger, uc1}
}

func (s *tokenListByOwnerServiceImpl) Execute(ctx context.Context, ownerAddr *common.Address) ([]*domain.Token, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if ownerAddr == nil {
		e["ownerAddr"] = "missing value"
	}
	if len(e) != 0 {
		// s.logger.Warn("Validation failed list tokens by owner",
		// 	slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get our token from our in-memory database if it exists.
	//

	token, err := s.listTokensByOwnerUseCase.Execute(ctx, ownerAddr)
	if err != nil {
		if !strings.Contains(err.Error(), "does not exist") {
			s.logger.Error("failed getting token",
				slog.Any("owner", ownerAddr),
				slog.Any("error", err))
			return nil, err
		}
	}
	if token != nil {
		return token, nil
	}

	return token, nil
}
