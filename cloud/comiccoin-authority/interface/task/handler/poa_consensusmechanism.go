package handler

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	s_poa "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service/poa"
)

type ProofOfAuthorityConsensusMechanismTaskHandler struct {
	config                                    *config.Configuration
	logger                                    *slog.Logger
	proofOfAuthorityConsensusMechanismService *s_poa.ProofOfAuthorityConsensusMechanismService
}

func NewProofOfAuthorityConsensusMechanismTaskHandler(
	config *config.Configuration,
	logger *slog.Logger,
	s1 *s_poa.ProofOfAuthorityConsensusMechanismService,
) *ProofOfAuthorityConsensusMechanismTaskHandler {
	return &ProofOfAuthorityConsensusMechanismTaskHandler{config, logger, s1}
}

func (s *ProofOfAuthorityConsensusMechanismTaskHandler) Execute(ctx context.Context) error {

	return s.proofOfAuthorityConsensusMechanismService.Execute(ctx)
}
