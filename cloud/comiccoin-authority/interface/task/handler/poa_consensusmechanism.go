package handler

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service"
)

type ProofOfAuthorityConsensusMechanismTaskHandler struct {
	config                                    *config.Configuration
	logger                                    *slog.Logger
	proofOfAuthorityConsensusMechanismService *service.ProofOfAuthorityConsensusMechanismService
}

func NewProofOfAuthorityConsensusMechanismTaskHandler(
	config *config.Configuration,
	logger *slog.Logger,
	s1 *service.ProofOfAuthorityConsensusMechanismService,
) *ProofOfAuthorityConsensusMechanismTaskHandler {
	return &ProofOfAuthorityConsensusMechanismTaskHandler{config, logger, s1}
}

func (s *ProofOfAuthorityConsensusMechanismTaskHandler) Execute(ctx context.Context) error {

	return s.proofOfAuthorityConsensusMechanismService.Execute(ctx)
}
