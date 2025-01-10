package handler

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	sv_poa "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/service/poa"
)

type ProofOfAuthorityConsensusMechanismTaskHandler struct {
	config                                    *config.Configuration
	logger                                    *slog.Logger
	proofOfAuthorityConsensusMechanismService sv_poa.ProofOfAuthorityConsensusMechanismService
}

func NewProofOfAuthorityConsensusMechanismTaskHandler(
	config *config.Configuration,
	logger *slog.Logger,
	s1 sv_poa.ProofOfAuthorityConsensusMechanismService,
) *ProofOfAuthorityConsensusMechanismTaskHandler {
	return &ProofOfAuthorityConsensusMechanismTaskHandler{config, logger, s1}
}

func (s *ProofOfAuthorityConsensusMechanismTaskHandler) Execute(ctx context.Context) error {

	return s.proofOfAuthorityConsensusMechanismService.Execute(ctx)
}
