package signedtx

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
)

type SignedTransactionSubmissionService interface {
	Execute(ctx context.Context) error
}

type signedTransactionSubmissionServiceImpl struct {
	config *config.Configuration
	logger *slog.Logger
}

func NewSignedTransactionSubmissionService(
	cfg *config.Configuration,
	logger *slog.Logger,
) SignedTransactionSubmissionService {
	return &signedTransactionSubmissionServiceImpl{cfg, logger}
}

func (s *signedTransactionSubmissionServiceImpl) Execute(
	ctx context.Context,
) error {
	return nil
}
