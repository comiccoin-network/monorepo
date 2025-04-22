// monorepo/cloud/comiccoin/service/mempooltx/receivedto.go
package mempooltx

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	sv_poa "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/poa"
)

type MempoolTransactionReceiveDTOFromNetworkService interface {
	Execute(ctx context.Context, dto *domain.MempoolTransactionDTO) error
}

type mempoolTransactionReceiveDTOFromNetworkServiceImpl struct {
	config                                    *config.Configuration
	logger                                    *slog.Logger
	proofOfAuthorityConsensusMechanismService sv_poa.ProofOfAuthorityConsensusMechanismService
}

func NewMempoolTransactionReceiveDTOFromNetworkService(
	cfg *config.Configuration,
	logger *slog.Logger,
	proofOfAuthorityConsensusMechanismService sv_poa.ProofOfAuthorityConsensusMechanismService,
) MempoolTransactionReceiveDTOFromNetworkService {
	return &mempoolTransactionReceiveDTOFromNetworkServiceImpl{cfg, logger, proofOfAuthorityConsensusMechanismService}
}

func (s *mempoolTransactionReceiveDTOFromNetworkServiceImpl) Execute(ctx context.Context, dto *domain.MempoolTransactionDTO) error {
	//
	// STEP 1: Validation.
	//

	if dto == nil {
		err := fmt.Errorf("Cannot have empty mempool transaction dto")
		// s.logger.Warn("Validation failed for received",
		// 	slog.Any("error", err))
		return err
	}

	//
	// STEP 2: Convert from data transfer object to internal data object.
	//

	mempoolTx := dto.ToIDO()

	s.logger.Debug("Received mempooltx",
		slog.Any("id", dto.ID),
		slog.Any("v_bytes", dto.VBytes),
		slog.Any("r_bytes", dto.RBytes),
		slog.Any("s_bytes", dto.SBytes),
		slog.Any("chain_id", dto.ChainID),
		slog.Any("nonce_bytes", dto.NonceBytes),
		slog.Any("nonce_string", dto.NonceString),
		slog.Any("from", dto.From),
		slog.Any("to", dto.To),
		slog.Any("value", dto.Value),
		slog.Any("data", dto.Data),
		slog.Any("data_string", dto.DataString),
		slog.Any("type", dto.Type),
		slog.Any("token_id_bytes", dto.TokenIDBytes),
		slog.Any("token_id_string", dto.TokenIDString),
		slog.Any("token_metadata_uri", dto.TokenMetadataURI),
		slog.Any("token_nonce_bytes", dto.TokenNonceBytes),
		slog.Any("token_nonce_string", dto.TokenNonceString),
	)

	//
	// STEP 3: Perform proof of authority work immediately.
	//

	execErr := s.proofOfAuthorityConsensusMechanismService.Execute(ctx, mempoolTx)
	if execErr != nil {
		// s.logger.Warn("Validation failed for received",
		// 	slog.Any("error", upsertErr))
		return execErr
	}
	return nil

}
