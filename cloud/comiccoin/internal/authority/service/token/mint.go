package token

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	sv_poa "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/poa"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockchainstate"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockdata"
	uc_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/mempooltx"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/distributedmutex"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
)

type TokenMintService interface {
	Execute(ctx context.Context, walletAddress *common.Address, metadataURI string) (*big.Int, error)
}

type tokenMintServiceImpl struct {
	config                                    *config.Configuration
	logger                                    *slog.Logger
	dmutex                                    distributedmutex.Adapter
	dbClient                                  *mongo.Client
	getProofOfAuthorityPrivateKeyService      sv_poa.GetProofOfAuthorityPrivateKeyService
	getBlockchainStateUseCase                 uc_blockchainstate.GetBlockchainStateUseCase
	upsertBlockchainStateUseCase              uc_blockchainstate.UpsertBlockchainStateUseCase
	getLatestTokenIDUseCase                   uc_blockdata.GetLatestTokenIDUseCase
	getBlockDataUseCase                       uc_blockdata.GetBlockDataUseCase
	mempoolTransactionCreateUseCase           uc_mempooltx.MempoolTransactionCreateUseCase
	proofOfAuthorityConsensusMechanismService sv_poa.ProofOfAuthorityConsensusMechanismService
}

func NewTokenMintService(
	cfg *config.Configuration,
	logger *slog.Logger,
	dmutex distributedmutex.Adapter,
	client *mongo.Client,
	s1 sv_poa.GetProofOfAuthorityPrivateKeyService,
	uc1 uc_blockchainstate.GetBlockchainStateUseCase,
	uc2 uc_blockchainstate.UpsertBlockchainStateUseCase,
	uc3 uc_blockdata.GetLatestTokenIDUseCase,
	uc4 uc_blockdata.GetBlockDataUseCase,
	uc5 uc_mempooltx.MempoolTransactionCreateUseCase,
	poaService sv_poa.ProofOfAuthorityConsensusMechanismService,
) TokenMintService {
	return &tokenMintServiceImpl{
		cfg,
		logger,
		dmutex,
		client,
		s1,
		uc1,
		uc2,
		uc3,
		uc4,
		uc5,
		poaService,
	}
}

func (s *tokenMintServiceImpl) Execute(
	ctx context.Context,
	walletAddress *common.Address,
	metadataURI string,
) (*big.Int, error) {
	// Lock the mining service until it has completed executing (or errored).
	s.dmutex.Acquire(ctx, "TokenMintService")
	defer s.dmutex.Release(ctx, "TokenMintService")

	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if metadataURI == "" {
		e["metadata_uri"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating token mint parameters",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get related records.
	//

	blockchainState, err := s.getBlockchainStateUseCase.Execute(ctx, s.config.Blockchain.ChainID)
	if err != nil {
		s.logger.Error("Failed getting blockchain state.",
			slog.Any("error", err))
		return nil, err
	}
	if blockchainState == nil {
		s.logger.Error("Blockchain state does not exist.")
		return nil, fmt.Errorf("Blockchain state does not exist")
	}

	proofOfAuthorityPrivateKey, err := s.getProofOfAuthorityPrivateKeyService.Execute(ctx)
	if err != nil {
		s.logger.Error("Failed getting proof of authority private key.",
			slog.Any("error", err))
		return nil, err
	}
	if proofOfAuthorityPrivateKey == nil {
		s.logger.Error("Proof of authority private key does not exist.")
		return nil, fmt.Errorf("Proof of authority private key does not exist")
	}

	recentBlockData, err := s.getBlockDataUseCase.ExecuteByHash(ctx, blockchainState.LatestHash)
	if err != nil {
		s.logger.Error("Failed getting latest block block.",
			slog.Any("error", err))
		return nil, err
	}
	if recentBlockData == nil {
		s.logger.Error("Latest block data does not exist.")
		return nil, fmt.Errorf("Latest block data does not exist")
	}

	latestTokenID, err := s.getLatestTokenIDUseCase.ExecuteByChainID(ctx, s.config.Blockchain.ChainID)
	if err != nil {
		s.logger.Error("Failed getting latest token id",
			slog.Any("error", err))
		return nil, err
	}

	s.logger.Debug("Searched blockchain",
		slog.Any("latest_token_id", latestTokenID),
	)

	//
	// STEP 3: Generate the new token ID by incrementing the latest
	//

	latestTokenID.Add(latestTokenID, big.NewInt(1))

	//
	// STEP 4: Create and sign the transaction
	//

	tx := &domain.Transaction{
		ChainID:          s.config.Blockchain.ChainID,
		NonceBytes:       big.NewInt(time.Now().Unix()).Bytes(),
		From:             s.config.Blockchain.ProofOfAuthorityAccountAddress,
		To:               walletAddress,
		Value:            s.config.Blockchain.TransactionFee, // Transaction fee gets reclaimed by the authority
		Data:             make([]byte, 0),
		Type:             domain.TransactionTypeToken,
		TokenIDBytes:     latestTokenID.Bytes(),
		TokenMetadataURI: metadataURI,
		TokenNonceBytes:  big.NewInt(0).Bytes(), // Newly minted tokens always have their nonce start at zero
	}

	s.logger.Debug("Created transaction",
		slog.Any("chain_id", tx.ChainID),
		slog.Any("from", tx.From),
		slog.Any("to", tx.To),
		slog.Any("value", tx.Value),
		slog.Any("type", tx.Type),
		slog.Any("token_id", tx.GetTokenID()),
		slog.Any("token_metadata_uri", tx.TokenMetadataURI),
		slog.Any("token_nonce", tx.GetTokenNonce()),
	)

	stx, signingErr := tx.Sign(proofOfAuthorityPrivateKey)
	if signingErr != nil {
		s.logger.Debug("Failed to sign the token mint transaction",
			slog.Any("error", signingErr))
		return nil, signingErr
	}

	// Defensive Coding: Validate the signed transaction
	if err := stx.Validate(s.config.Blockchain.ChainID, true); err != nil {
		s.logger.Debug("Failed to validate signature of the signed transaction",
			slog.Any("error", signingErr))
		return nil, signingErr
	}

	s.logger.Debug("Token mint transaction signed successfully",
		slog.Any("tx_token_id", stx.GetTokenID()))

	mempoolTx := &domain.MempoolTransaction{
		ID:                primitive.NewObjectID(),
		SignedTransaction: stx,
	}

	// Defensive Coding: Validate the mempool transaction
	if err := mempoolTx.Validate(s.config.Blockchain.ChainID, true); err != nil {
		s.logger.Debug("Failed to validate signature of mempool transaction",
			slog.Any("error", signingErr))
		return nil, signingErr
	}

	//
	// STEP 5: Submit directly to PoA consensus mechanism instead of adding to mempool
	//

	if err := s.proofOfAuthorityConsensusMechanismService.Execute(ctx, mempoolTx); err != nil {
		s.logger.Error("Failed to process transaction through consensus mechanism",
			slog.Any("error", err))
		return nil, err
	}

	s.logger.Info("Token mint transaction successfully processed through PoA consensus",
		slog.Any("tx_token_id", stx.GetTokenID()))

	return latestTokenID, nil
}
