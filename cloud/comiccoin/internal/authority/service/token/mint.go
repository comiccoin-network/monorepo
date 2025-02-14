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

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/distributedmutex"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	sv_poa "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/poa"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockchainstate"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockdata"
	uc_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/mempooltx"
)

type TokenMintService interface {
	Execute(ctx context.Context, walletAddress *common.Address, metadataURI string) (*big.Int, error)
}

type tokenMintServiceImpl struct {
	config                               *config.Configuration
	logger                               *slog.Logger
	dmutex                               distributedmutex.Adapter
	dbClient                             *mongo.Client
	getProofOfAuthorityPrivateKeyService sv_poa.GetProofOfAuthorityPrivateKeyService
	getBlockchainStateUseCase            uc_blockchainstate.GetBlockchainStateUseCase
	upsertBlockchainStateUseCase         uc_blockchainstate.UpsertBlockchainStateUseCase
	getLatestTokenIDUseCase              uc_blockdata.GetLatestTokenIDUseCase
	getBlockDataUseCase                  uc_blockdata.GetBlockDataUseCase
	mempoolTransactionCreateUseCase      uc_mempooltx.MempoolTransactionCreateUseCase
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
) TokenMintService {
	return &tokenMintServiceImpl{cfg, logger, dmutex, client, s1, uc1, uc2, uc3, uc4, uc5}
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

	////
	//// Start the transaction.
	////

	session, err := s.dbClient.StartSession()
	if err != nil {
		s.logger.Error("start session error",
			slog.Any("error", err))
		return nil, fmt.Errorf("Failed executing: %v\n", err)
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		s.logger.Debug("Transaction started")

		//
		// STEP 2:
		// Get related records.
		//

		blockchainState, err := s.getBlockchainStateUseCase.Execute(sessCtx, s.config.Blockchain.ChainID)
		if err != nil {
			s.logger.Error("Failed getting blockchain state.",
				slog.Any("error", err))
			return nil, err
		}
		if blockchainState == nil {
			s.logger.Error("Blockchain state does not exist.")
			return nil, fmt.Errorf("Blockchain state does not exist")
		}

		proofOfAuthorityPrivateKey, err := s.getProofOfAuthorityPrivateKeyService.Execute(sessCtx)
		if err != nil {
			s.logger.Error("Failed getting proof of authority private key.",
				slog.Any("error", err))
			return nil, err
		}
		if proofOfAuthorityPrivateKey == nil {
			s.logger.Error("Proof of authority private keydoes not exist.")
			return nil, fmt.Errorf("Proof of authority private keydoes not exist")
		}

		recentBlockData, err := s.getBlockDataUseCase.ExecuteByHash(sessCtx, blockchainState.LatestHash)
		if err != nil {
			s.logger.Error("Failed getting latest block block.",
				slog.Any("error", err))
			return nil, err
		}
		if recentBlockData == nil {
			s.logger.Error("Latest block data does not exist.")
			return nil, fmt.Errorf("Latest block data does not exist")
		}

		latestTokenID, err := s.getLatestTokenIDUseCase.ExecuteByChainID(sessCtx, s.config.Blockchain.ChainID)
		if err != nil {
			s.logger.Error("Failed getting latest token id",
				slog.Any("error", err))
			return nil, err
		}

		s.logger.Debug("Searched blockchain",
			slog.Any("latest_token_id", latestTokenID),
		)

		//
		// STEP 3:
		// Authority generates the latest token ID value by taking the previous
		// token ID value and incrementing it by one.
		//

		latestTokenID.Add(latestTokenID, big.NewInt(1))

		//
		// STEP 4:
		// Create our pending transaction and sign it with the accounts private key.
		//

		tx := &domain.Transaction{
			ChainID:          s.config.Blockchain.ChainID,
			NonceBytes:       big.NewInt(time.Now().Unix()).Bytes(),
			From:             s.config.Blockchain.ProofOfAuthorityAccountAddress,
			To:               walletAddress,
			Value:            s.config.Blockchain.TransactionFee, // Note: This value gets reclaimed by the us, so it's fully recirculating when authority calls this.
			Data:             make([]byte, 0),
			Type:             domain.TransactionTypeToken,
			TokenIDBytes:     latestTokenID.Bytes(),
			TokenMetadataURI: metadataURI,
			TokenNonceBytes:  big.NewInt(0).Bytes(), // Newly minted tokens always have their nonce start at value of zero.
		}

		s.logger.Debug("Created transaction",
			slog.Any("chain_id", tx.ChainID),
			slog.Any("nonce", tx.GetNonce),
			slog.Any("from", tx.From),
			slog.Any("to", tx.To),
			slog.Any("value", tx.Value),
			slog.Any("data", tx.Data),
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

		// Defensive Coding.
		if err := stx.Validate(s.config.Blockchain.ChainID, true); err != nil {
			s.logger.Debug("Failed to validate signature of the signed transaction",
				slog.Any("error", signingErr))
			return nil, signingErr
		}

		s.logger.Debug("Pending token mint transaction signed successfully",
			slog.Any("tx_token_id", stx.GetTokenID()))

		mempoolTx := &domain.MempoolTransaction{
			ID:                primitive.NewObjectID(),
			SignedTransaction: stx,
		}

		// Defensive Coding.
		if err := mempoolTx.Validate(s.config.Blockchain.ChainID, true); err != nil {
			s.logger.Debug("Failed to validate signature of mempool transaction",
				slog.Any("error", signingErr))
			return nil, signingErr
		}

		// s.logger.Debug("Mempool transaction ready for submission",
		// 	slog.Any("Transaction", stx.Transaction),
		// 	slog.Any("tx_sig_v_bytes", stx.VBytes),
		// 	slog.Any("tx_sig_r_bytes", stx.RBytes),
		// 	slog.Any("tx_sig_s_bytes", stx.SBytes))

		//
		// STEP 3
		// Send our pending signed transaction to the authority's mempool to wait
		// in a queue to be processed.
		//

		if err := s.mempoolTransactionCreateUseCase.Execute(sessCtx, mempoolTx); err != nil {
			s.logger.Error("Failed to broadcast to the blockchain network",
				slog.Any("error", err))
			return nil, err
		}

		s.logger.Info("Pending signed transaction for coin transfer submitted to the authority",
			slog.Any("tx_nonce", stx.GetNonce()))

		s.logger.Debug("Committing transaction")
		if err := sessCtx.CommitTransaction(ctx); err != nil {
			s.logger.Error("Failed comming transaction",
				slog.Any("error", err))
			return nil, err
		}
		s.logger.Debug("Transaction committed")

		// return tok, nil
		return latestTokenID, nil
	}

	// Start a transaction
	res, err := session.WithTransaction(ctx, transactionFunc)
	if err != nil {
		s.logger.Error("session failed error",
			slog.Any("error", err))
		return nil, fmt.Errorf("Failed creating account: %v\n", err)
	}

	tokID := res.(*big.Int)

	return tokID, nil
}
