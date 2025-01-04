package service

import (
	"errors"
	"fmt"
	"log/slog"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/kmutexutil"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/account"
	uc_usertx "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/usertx"
	uc_wallet "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/wallet"
)

type FaucetCoinTransferService struct {
	config                                                  *config.Configuration
	logger                                                  *slog.Logger
	kmutex                                                  kmutexutil.KMutexProvider
	tenantGetByIDUseCase                                    *usecase.TenantGetByIDUseCase
	tenantUpdateUseCase                                     *usecase.TenantUpdateUseCase
	getAccountUseCase                                       *uc_account.GetAccountUseCase
	upsertAccountUseCase                                    *uc_account.UpsertAccountUseCase
	getWalletUseCase                                        *uc_wallet.GetWalletUseCase
	walletDecryptKeyUseCase                                 *uc_wallet.WalletDecryptKeyUseCase
	submitMempoolTransactionDTOToBlockchainAuthorityUseCase *usecase.SubmitMempoolTransactionDTOToBlockchainAuthorityUseCase
	createUserTransactionUseCase                            *uc_usertx.CreateUserTransactionUseCase
}

func NewFaucetCoinTransferService(
	cfg *config.Configuration,
	logger *slog.Logger,
	kmutex kmutexutil.KMutexProvider,
	uc1 *usecase.TenantGetByIDUseCase,
	uc2 *usecase.TenantUpdateUseCase,
	uc3 *uc_account.GetAccountUseCase,
	uc4 *uc_account.UpsertAccountUseCase,
	uc5 *uc_wallet.GetWalletUseCase,
	uc6 *uc_wallet.WalletDecryptKeyUseCase,
	uc7 *usecase.SubmitMempoolTransactionDTOToBlockchainAuthorityUseCase,
	uc8 *uc_usertx.CreateUserTransactionUseCase,
) *FaucetCoinTransferService {
	return &FaucetCoinTransferService{cfg, logger, kmutex, uc1, uc2, uc3, uc4, uc5, uc6, uc7, uc8}
}

type FaucetCoinTransferRequestIDO struct {
	ChainID               uint16                `json:"chain_id"`
	FromAccountAddress    *common.Address       `json:"from_account_address"`
	AccountWalletPassword *sstring.SecureString `json:"account_wallet_password"`
	To                    *common.Address       `json:"to"`
	Value                 uint64                `json:"value"`
	Data                  []byte                `json:"data"`
	UserID                primitive.ObjectID    `json:"user_id"`
	UserName              string                `json:"user_name"`
}

func (s *FaucetCoinTransferService) Execute(sessCtx mongo.SessionContext, req *FaucetCoinTransferRequestIDO) error {
	//
	// STEP 1: Validation.
	//

	if req == nil {
		err := errors.New("No request inputted")
		s.logger.Error("Failed validating create transaction parameters",
			slog.Any("error", err))
		return err
	}

	s.logger.Debug("Validating...",
		slog.Any("chain_id", req.ChainID),
		slog.Any("from_account_address", req.FromAccountAddress),
		slog.Any("account_wallet_password", req.AccountWalletPassword),
		slog.Any("to", req.To),
		slog.Any("value", req.Value),
		slog.Any("data", req.Data),
	)

	e := make(map[string]string)
	if req.FromAccountAddress == nil {
		e["from_account_address"] = "missing value"
	}
	if req.AccountWalletPassword == nil {
		e["account_wallet_password"] = "missing value"
	}
	if req.To == nil {
		e["to"] = "missing value"
	}
	if req.Value == 0 {
		e["value"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating create transaction parameters",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get the account and extract the wallet private/public key.
	//

	wallet, err := s.getWalletUseCase.Execute(sessCtx, req.FromAccountAddress)
	if err != nil {
		s.logger.Error("failed getting from database",
			slog.Any("from_account_address", req.FromAccountAddress),
			slog.Any("error", err))
		return fmt.Errorf("failed getting from database: %s", err)
	}
	if wallet == nil {
		s.logger.Error("failed getting from database",
			slog.Any("from_account_address", req.FromAccountAddress),
			slog.Any("error", "d.n.e."))
		return fmt.Errorf("failed getting from database: %s", "wallet d.n.e.")
	}

	key, err := s.walletDecryptKeyUseCase.Execute(sessCtx, wallet.KeystoreBytes, req.AccountWalletPassword)
	if err != nil {
		s.logger.Error("failed getting key",
			slog.Any("from_account_address", req.FromAccountAddress),
			slog.Any("error", err))
		return fmt.Errorf("failed getting key: %s", err)
	}
	if key == nil {
		return fmt.Errorf("failed getting key: %s", "d.n.e.")
	}

	//
	// STEP 3:
	// Verify the account has enough balance before proceeding.
	//

	account, err := s.getAccountUseCase.Execute(sessCtx, req.FromAccountAddress)
	if err != nil {
		s.logger.Error("failed getting account",
			slog.Any("from_account_address", req.FromAccountAddress),
			slog.Any("error", err))
		return fmt.Errorf("failed getting account: %s", err)
	}
	if account == nil {
		return fmt.Errorf("failed getting account: %s", "d.n.e.")
	}
	if account.Balance < (req.Value + s.config.Blockchain.TransactionFee) {
		s.logger.Warn("insufficient balance in account",
			slog.Any("account_addr", req.FromAccountAddress),
			slog.Any("account_balance", account.Balance),
			slog.Any("value", req.Value),
			slog.Any("fee", s.config.Blockchain.TransactionFee),
			slog.Any("new_value", (req.Value+s.config.Blockchain.TransactionFee)))
		return fmt.Errorf("insufficient balance: %d", account.Balance)
	}

	//
	// STEP 4
	// Create our pending transaction and sign it with the accounts private key.
	//

	tx := &domain.Transaction{
		ChainID:    req.ChainID,
		NonceBytes: big.NewInt(time.Now().Unix()).Bytes(),
		From:       wallet.Address,
		To:         req.To,
		Value:      req.Value + s.config.Blockchain.TransactionFee, // Note: The transaction fee gets reclaimed by the Authority, so it's fully recirculating when authority calls this.
		Data:       req.Data,
		Type:       domain.TransactionTypeCoin,
	}

	stx, signingErr := tx.Sign(key.PrivateKey)
	if signingErr != nil {
		s.logger.Debug("Failed to sign the transaction",
			slog.Any("error", signingErr))
		return signingErr
	}

	// Defensive Coding.
	if err := stx.Validate(req.ChainID, true); err != nil {
		s.logger.Debug("Failed to validate signature of the signed transaction",
			slog.Any("error", signingErr))
		return signingErr
	}

	s.logger.Debug("Transaction signed successfully",
		slog.Any("chain_id", stx.ChainID),
		slog.Any("nonce", stx.GetNonce()),
		slog.Any("from", stx.From),
		slog.Any("to", stx.To),
		slog.Any("fee", s.config.Blockchain.TransactionFee),
		slog.Any("value", stx.Value),
		slog.Any("data", stx.Data),
		slog.Any("type", stx.Type),
		slog.Any("token_id", stx.GetTokenID()),
		slog.Any("token_metadata_uri", stx.TokenMetadataURI),
		slog.Any("token_nonce", stx.GetTokenNonce()),
		slog.Any("tx_sig_v_bytes", stx.VBytes),
		slog.Any("tx_sig_r_bytes", stx.RBytes),
		slog.Any("tx_sig_s_bytes", stx.SBytes),
		slog.Any("tx_nonce", stx.GetNonce()))

	//
	// STEP 3
	// Send our pending signed transaction to the authority's mempool to wait
	// in a queue to be processed.
	//

	mempoolTx := &domain.MempoolTransaction{
		ID:                primitive.NewObjectID(),
		SignedTransaction: stx,
	}

	// Defensive Coding.
	if err := mempoolTx.Validate(req.ChainID, false); err != nil {
		s.logger.Debug("Failed to validate signature of mempool transaction",
			slog.Any("error", signingErr))
		return signingErr
	}

	s.logger.Debug("Mempool transaction ready for submission",
		slog.Any("Transaction", stx.Transaction),
		// slog.Any("tx_sig_v_bytes", stx.VBytes),
		// slog.Any("tx_sig_r_bytes", stx.RBytes),
		// slog.Any("tx_sig_s_bytes", stx.SBytes)
	)

	dto := mempoolTx.ToDTO()

	if err := s.submitMempoolTransactionDTOToBlockchainAuthorityUseCase.Execute(sessCtx, dto); err != nil {
		s.logger.Error("Failed to broadcast to the blockchain authority",
			slog.Any("error", err))
		return err
	}

	s.logger.Info("Pending signed transaction for coin transfer submitted to the blockchain authority",
		slog.Any("tx_nonce", stx.GetNonce()))

	//
	// STEP 4:
	// Keep a tailored record for our application of our blockchain transaction
	// submitted to the Global blockchain network.
	//

	utx := &domain.UserTransaction{
		Transaction:        *tx,
		ID:                 primitive.NewObjectID(),
		Status:             domain.UserTransactionStatusSubmitted,
		UserID:             req.UserID,
		CreatedAt:          time.Now(),
		CreatedByUserName:  req.UserName,
		CreatedByUserID:    req.UserID,
		ModifiedAt:         time.Now(),
		ModifiedByUserName: req.UserName,
		ModifiedByUserID:   req.UserID,
		TenantID:           s.config.App.TenantID,
	}
	if err := s.createUserTransactionUseCase.Execute(sessCtx, utx); err != nil {
		s.logger.Error("Failed keep record of user transaction",
			slog.Any("error", err))
		return err
	}

	s.logger.Info("Keeping record of transaction for faucet application ",
		slog.Any("id", utx.ID.Hex()),
	)

	return nil
}
