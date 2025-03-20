package coin

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/account"
	uc_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/mempooltx"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/walletutil"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
)

type CoinTransferService interface {
	Execute(
		ctx context.Context,
		fromAccountAddress *common.Address,
		accountWalletMnemonic *sstring.SecureString,
		accountWalletPath string,
		to *common.Address,
		value uint64,
		data []byte,
	) error
}

type coinTransferServiceImpl struct {
	config                          *config.Configuration
	logger                          *slog.Logger
	getAccountUseCase               uc_account.GetAccountUseCase
	privateKeyFromHDWalletUseCase   uc_walletutil.PrivateKeyFromHDWalletUseCase
	mempoolTransactionCreateUseCase uc_mempooltx.MempoolTransactionCreateUseCase
}

func NewCoinTransferService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc1 uc_account.GetAccountUseCase,
	uc2 uc_walletutil.PrivateKeyFromHDWalletUseCase,
	uc3 uc_mempooltx.MempoolTransactionCreateUseCase,
) CoinTransferService {
	return &coinTransferServiceImpl{cfg, logger, uc1, uc2, uc3}
}

func (s *coinTransferServiceImpl) Execute(
	ctx context.Context,
	fromAccountAddress *common.Address,
	accountWalletMnemonic *sstring.SecureString,
	accountWalletPath string,
	to *common.Address,
	value uint64,
	data []byte,
) error {
	s.logger.Debug("Validating...",
		slog.Any("from_account_address", fromAccountAddress),
		slog.Any("account_wallet_mnemonic", accountWalletMnemonic),
		slog.Any("account_wallet_path", accountWalletPath),
		slog.Any("to", to),
		slog.Any("value", value),
		slog.Any("data", data),
	)

	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if fromAccountAddress == nil {
		e["from_account_address"] = "missing value"
	}
	if accountWalletMnemonic == nil {
		e["account_wallet_mnemonic"] = "missing value"
	}
	if accountWalletPath == "" {
		e["account_wallet_path"] = "missing value"
	}
	if to == nil {
		e["to"] = "missing value"
	}
	if value == 0 {
		e["value"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validating create transaction parameters",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Get the wallet and extract the wallet private/public key.
	//

	privateKey, err := s.privateKeyFromHDWalletUseCase.Execute(ctx, accountWalletMnemonic, accountWalletPath)
	if err != nil {
		s.logger.Error("failed getting wallet key",
			slog.Any("error", err))
		return fmt.Errorf("failed getting wallet key: %s", err)
	}

	//
	// STEP 3:
	// Verify the account has enough balance before proceeding.
	//

	account, err := s.getAccountUseCase.Execute(ctx, fromAccountAddress)
	if err != nil {
		s.logger.Error("failed getting account",
			slog.Any("from_account_address", fromAccountAddress),
			slog.Any("error", err))
		return fmt.Errorf("failed getting account: %s", err)
	}
	if account == nil {
		return fmt.Errorf("failed getting account: %s", "d.n.e.")
	}
	if account.Balance < (value + s.config.Blockchain.TransactionFee) {
		s.logger.Warn("insufficient balance in account",
			slog.Any("account_addr", fromAccountAddress),
			slog.Any("account_balance", account.Balance),
			slog.Any("value", value),
			slog.Any("fee", s.config.Blockchain.TransactionFee),
			slog.Any("new_value", (value+s.config.Blockchain.TransactionFee)))
		return fmt.Errorf("insufficient balance: %d", account.Balance)
	}

	//
	// STEP 4
	// Create our pending transaction and sign it with the accounts private key.
	//

	tx := &domain.Transaction{
		ChainID:    s.config.Blockchain.ChainID,
		NonceBytes: big.NewInt(time.Now().Unix()).Bytes(),
		From:       fromAccountAddress,
		To:         to,
		Value:      value + s.config.Blockchain.TransactionFee, // Note: The transanction fee gets reclaimed by the us, so it's fully recirculating when authority calls this.
		Data:       data,
		Type:       domain.TransactionTypeCoin,
	}

	stx, signingErr := tx.Sign(privateKey)
	if signingErr != nil {
		s.logger.Debug("Failed to sign the transaction",
			slog.Any("error", signingErr))
		return signingErr
	}

	// Defensive Coding.
	if err := stx.Validate(s.config.Blockchain.ChainID, true); err != nil {
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

	mempoolTx := &domain.MempoolTransaction{
		ID:                primitive.NewObjectID(),
		SignedTransaction: stx,
	}

	// Defensive Coding.
	if err := mempoolTx.Validate(s.config.Blockchain.ChainID, true); err != nil {
		s.logger.Debug("Failed to validate signature of mempool transaction",
			slog.Any("error", signingErr))
		return signingErr
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

	if err := s.mempoolTransactionCreateUseCase.Execute(ctx, mempoolTx); err != nil {
		s.logger.Error("Failed to broadcast to the blockchain network",
			slog.Any("error", err))
		return err
	}

	s.logger.Info("Pending signed transaction for coin transfer submitted to the authority",
		slog.Any("tx_nonce", stx.GetNonce()))

	return nil
}
