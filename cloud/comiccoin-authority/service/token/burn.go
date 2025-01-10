package token

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/kmutexutil"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockchainstate"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockdata"
	uc_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/mempooltx"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/token"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/walletutil"
)

type TokenBurnService struct {
	config                          *config.Configuration
	logger                          *slog.Logger
	kmutex                          kmutexutil.KMutexProvider
	dbClient                        *mongo.Client
	privateKeyFromHDWalletUseCase   *uc_walletutil.PrivateKeyFromHDWalletUseCase
	getBlockchainStateUseCase       uc_blockchainstate.GetBlockchainStateUseCase
	upsertBlockchainStateUseCase    uc_blockchainstate.UpsertBlockchainStateUseCase
	getBlockDataUseCase             uc_blockdata.GetBlockDataUseCase
	getTokenUseCase                 uc_token.GetTokenUseCase
	mempoolTransactionCreateUseCase uc_mempooltx.MempoolTransactionCreateUseCase
}

func NewTokenBurnService(
	cfg *config.Configuration,
	logger *slog.Logger,
	kmutex kmutexutil.KMutexProvider,
	client *mongo.Client,
	uc1 *uc_walletutil.PrivateKeyFromHDWalletUseCase,
	uc2 uc_blockchainstate.GetBlockchainStateUseCase,
	uc3 uc_blockchainstate.UpsertBlockchainStateUseCase,
	uc4 uc_blockdata.GetBlockDataUseCase,
	uc5 uc_token.GetTokenUseCase,
	uc6 uc_mempooltx.MempoolTransactionCreateUseCase,
) *TokenBurnService {
	return &TokenBurnService{cfg, logger, kmutex, client, uc1, uc2, uc3, uc4, uc5, uc6}
}

func (s *TokenBurnService) Execute(
	ctx context.Context,
	tokenID *big.Int,
	tokenOwnerAddress *common.Address,
	accountWalletMnemonic *sstring.SecureString,
	accountWalletPath string) error {
	// Lock the mining service until it has completed executing (or errored).
	s.kmutex.Acquire("token-services")
	defer s.kmutex.Release("token-services")

	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if tokenID == nil {
		e["token_id"] = "missing value"
	}
	if tokenOwnerAddress == nil {
		e["token_owner_address"] = "missing value"
	}
	if accountWalletMnemonic == nil {
		e["token_owner_wallet_mnemonic"] = "missing value"
	}
	if accountWalletPath == "" {
		e["token_owner_wallet_path"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating token burn parameters",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	////
	//// Start the transaction.
	////

	session, err := s.dbClient.StartSession()
	if err != nil {
		s.logger.Error("start session error",
			slog.Any("error", err))
		return fmt.Errorf("Failed executing: %v\n", err)
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

		privateKey, err := s.privateKeyFromHDWalletUseCase.Execute(ctx, accountWalletMnemonic, accountWalletPath)
		if err != nil {
			s.logger.Error("failed getting wallet key",
				slog.Any("error", err))
			return nil, fmt.Errorf("failed getting wallet key: %s", err)
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

		token, err := s.getTokenUseCase.Execute(sessCtx, tokenID)
		if err != nil {
			if !strings.Contains(err.Error(), "does not exist") {
				s.logger.Error("failed getting token",
					slog.Any("token_id", tokenID),
					slog.Any("error", err))
				return nil, err
			}
		}
		if token == nil {
			s.logger.Warn("failed getting token",
				slog.Any("token_id", tokenID),
				slog.Any("error", "token does not exist"))
			return nil, fmt.Errorf("failed getting token: does not exist for ID: %v", tokenID)
		}

		//
		// STEP 3:
		// Verify the account owns the token
		//

		if tokenOwnerAddress.Hex() != token.Owner.Hex() {
			s.logger.Warn("permission failed",
				slog.Any("token_id", tokenID))
			return nil, fmt.Errorf("permission denied: token address is %v but your address is %v", token.Owner.Hex(), tokenOwnerAddress.Hex())
		}

		//
		// STEP 4:
		// Increment token `nonce` - this is very important as it tells the
		// blockchain that we are commiting a transaction and hence the miner will
		// execute the burn. If we do not increment the nonce then no
		// transaction happens!
		//

		nonce := token.GetNonce()
		nonce.Add(nonce, big.NewInt(1))
		token.SetNonce(nonce)

		//
		// STEP 4:
		// Create our pending transaction and sign it with the accounts private key.
		//

		// Burn an NFT by setting its owner to the burn address
		burnAddress := common.HexToAddress("0x0000000000000000000000000000000000000000")

		tx := &domain.Transaction{
			ChainID:          s.config.Blockchain.ChainID,
			NonceBytes:       big.NewInt(time.Now().Unix()).Bytes(),
			From:             tokenOwnerAddress,
			To:               &burnAddress,
			Value:            s.config.Blockchain.TransactionFee, // Note: This value gets reclaimed by the us, so it's fully recirculating when authority calls this.
			Data:             make([]byte, 0),
			Type:             domain.TransactionTypeToken,
			TokenIDBytes:     token.IDBytes,
			TokenMetadataURI: token.MetadataURI,
			TokenNonceBytes:  nonce.Bytes(), // Burned tokens must increment nonce.
		}

		stx, signingErr := tx.Sign(privateKey)
		if signingErr != nil {
			s.logger.Debug("Failed to sign the token burn transaction",
				slog.Any("error", signingErr))
			return nil, signingErr
		}

		// Defensive Coding.
		if err := stx.Validate(s.config.Blockchain.ChainID, true); err != nil {
			s.logger.Debug("Failed to validate signature of the signed transaction",
				slog.Any("error", signingErr))
			return nil, signingErr
		}

		s.logger.Debug("Pending token burn transaction signed successfully",
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

		s.logger.Info("Pending signed transaction for coin burn submitted to the authority",
			slog.Any("tx_nonce", stx.GetNonce()))

		s.logger.Debug("Committing transaction")
		if err := sessCtx.CommitTransaction(ctx); err != nil {
			s.logger.Error("Failed comming transaction",
				slog.Any("error", err))
			return nil, err
		}
		s.logger.Debug("Transaction committed")

		// return tok, nil
		return nil, nil
	}

	// Start a transaction
	if _, err := session.WithTransaction(ctx, transactionFunc); err != nil {
		s.logger.Error("session failed error",
			slog.Any("error", err))
		return fmt.Errorf("Failed creating account: %v\n", err)
	}

	return nil
}
