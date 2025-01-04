package signedtx

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
)

type SignedTransactionSubmissionService struct {
	config *config.Configuration
	logger *slog.Logger
}

func NewSignedTransactionSubmissionService(
	cfg *config.Configuration,
	logger *slog.Logger,
) *SignedTransactionSubmissionService {
	return &SignedTransactionSubmissionService{cfg, logger}
}

func (s *SignedTransactionSubmissionService) Execute(
	ctx context.Context,
) error {
	return nil
}
