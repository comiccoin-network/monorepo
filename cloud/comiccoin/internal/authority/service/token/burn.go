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

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	sv_poa "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/poa"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockchainstate"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockdata"
	uc_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/mempooltx"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/token"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/walletutil"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/kmutexutil"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
)

type TokenBurnService interface {
	Execute(
		ctx context.Context,
		tokenID *big.Int,
		tokenOwnerAddress *common.Address,
		accountWalletMnemonic *sstring.SecureString,
		accountWalletPath string) error
}

type tokenBurnServiceImpl struct {
	config                                    *config.Configuration
	logger                                    *slog.Logger
	kmutex                                    kmutexutil.KMutexProvider
	dbClient                                  *mongo.Client
	privateKeyFromHDWalletUseCase             uc_walletutil.PrivateKeyFromHDWalletUseCase
	getBlockchainStateUseCase                 uc_blockchainstate.GetBlockchainStateUseCase
	upsertBlockchainStateUseCase              uc_blockchainstate.UpsertBlockchainStateUseCase
	getBlockDataUseCase                       uc_blockdata.GetBlockDataUseCase
	getTokenUseCase                           uc_token.GetTokenUseCase
	mempoolTransactionCreateUseCase           uc_mempooltx.MempoolTransactionCreateUseCase
	proofOfAuthorityConsensusMechanismService sv_poa.ProofOfAuthorityConsensusMechanismService
}

func NewTokenBurnService(
	cfg *config.Configuration,
	logger *slog.Logger,
	kmutex kmutexutil.KMutexProvider,
	client *mongo.Client,
	uc1 uc_walletutil.PrivateKeyFromHDWalletUseCase,
	uc2 uc_blockchainstate.GetBlockchainStateUseCase,
	uc3 uc_blockchainstate.UpsertBlockchainStateUseCase,
	uc4 uc_blockdata.GetBlockDataUseCase,
	uc5 uc_token.GetTokenUseCase,
	uc6 uc_mempooltx.MempoolTransactionCreateUseCase,
	poaService sv_poa.ProofOfAuthorityConsensusMechanismService,
) TokenBurnService {
	return &tokenBurnServiceImpl{
		cfg,
		logger,
		kmutex,
		client,
		uc1,
		uc2,
		uc3,
		uc4,
		uc5,
		uc6,
		poaService,
	}
}

func (s *tokenBurnServiceImpl) Execute(
	ctx context.Context,
	tokenID *big.Int,
	tokenOwnerAddress *common.Address,
	accountWalletMnemonic *sstring.SecureString,
	accountWalletPath string) error {
	// Lock the service until it has completed executing (or errored).
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

	//
	// STEP 2: Get related records.
	//

	blockchainState, err := s.getBlockchainStateUseCase.Execute(ctx, s.config.Blockchain.ChainID)
	if err != nil {
		s.logger.Error("Failed getting blockchain state.",
			slog.Any("error", err))
		return err
	}
	if blockchainState == nil {
		s.logger.Error("Blockchain state does not exist.")
		return fmt.Errorf("Blockchain state does not exist")
	}

	privateKey, err := s.privateKeyFromHDWalletUseCase.Execute(ctx, accountWalletMnemonic, accountWalletPath)
	if err != nil {
		s.logger.Error("failed getting wallet key",
			slog.Any("error", err))
		return fmt.Errorf("failed getting wallet key: %s", err)
	}

	recentBlockData, err := s.getBlockDataUseCase.ExecuteByHash(ctx, blockchainState.LatestHash)
	if err != nil {
		s.logger.Error("Failed getting latest block block.",
			slog.Any("error", err))
		return err
	}
	if recentBlockData == nil {
		s.logger.Error("Latest block data does not exist.")
		return fmt.Errorf("Latest block data does not exist")
	}

	token, err := s.getTokenUseCase.Execute(ctx, tokenID)
	if err != nil {
		if !strings.Contains(err.Error(), "does not exist") {
			s.logger.Error("failed getting token",
				slog.Any("token_id", tokenID),
				slog.Any("error", err))
			return err
		}
	}
	if token == nil {
		s.logger.Warn("failed getting token",
			slog.Any("token_id", tokenID),
			slog.Any("error", "token does not exist"))
		return fmt.Errorf("failed getting token: does not exist for ID: %v", tokenID)
	}

	//
	// STEP 3: Verify the account owns the token
	//

	if tokenOwnerAddress.Hex() != token.Owner.Hex() {
		s.logger.Warn("permission failed",
			slog.Any("token_id", tokenID))
		return fmt.Errorf("permission denied: token address is %v but your address is %v", token.Owner.Hex(), tokenOwnerAddress.Hex())
	}

	//
	// STEP 4: Increment token `nonce` - this is very important as it tells the
	// blockchain that we are commiting a transaction and hence the miner will
	// execute the burn. If we do not increment the nonce then no
	// transaction happens!
	//

	nonce := token.GetNonce()
	nonce.Add(nonce, big.NewInt(1))
	token.SetNonce(nonce)

	//
	// STEP 5: Create the burn transaction and sign it
	//

	// Burn an NFT by setting its owner to the burn address
	burnAddress := common.HexToAddress("0x0000000000000000000000000000000000000000")

	tx := &domain.Transaction{
		ChainID:          s.config.Blockchain.ChainID,
		NonceBytes:       big.NewInt(time.Now().Unix()).Bytes(),
		From:             tokenOwnerAddress,
		To:               &burnAddress,
		Value:            s.config.Blockchain.TransactionFee, // Transaction fee gets reclaimed by the authority
		Data:             make([]byte, 0),
		Type:             domain.TransactionTypeToken,
		TokenIDBytes:     token.IDBytes,
		TokenMetadataURI: token.MetadataURI,
		TokenNonceBytes:  nonce.Bytes(), // Burned tokens must increment nonce
	}

	stx, signingErr := tx.Sign(privateKey)
	if signingErr != nil {
		s.logger.Debug("Failed to sign the token burn transaction",
			slog.Any("error", signingErr))
		return signingErr
	}

	// Defensive Coding: Validate the signed transaction
	if err := stx.Validate(s.config.Blockchain.ChainID, true); err != nil {
		s.logger.Debug("Failed to validate signature of the signed transaction",
			slog.Any("error", signingErr))
		return signingErr
	}

	s.logger.Debug("Token burn transaction signed successfully",
		slog.Any("tx_token_id", stx.GetTokenID()))

	mempoolTx := &domain.MempoolTransaction{
		ID:                primitive.NewObjectID(),
		SignedTransaction: stx,
	}

	// Defensive Coding: Validate the mempool transaction
	if err := mempoolTx.Validate(s.config.Blockchain.ChainID, true); err != nil {
		s.logger.Debug("Failed to validate signature of mempool transaction",
			slog.Any("error", signingErr))
		return signingErr
	}

	//
	// STEP 6: Submit directly to PoA consensus mechanism instead of adding to mempool
	//

	if err := s.proofOfAuthorityConsensusMechanismService.Execute(ctx, mempoolTx); err != nil {
		s.logger.Error("Failed to process transaction through consensus mechanism",
			slog.Any("error", err))
		return err
	}

	s.logger.Info("Token burn transaction successfully processed through PoA consensus",
		slog.Any("tx_nonce", stx.GetNonce()))

	return nil
}
