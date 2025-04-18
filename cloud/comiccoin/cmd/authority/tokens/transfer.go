package tokens

import (
	"context"
	"log"
	"log/slog"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/repo"
	sv_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/token"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockchainstate"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockdata"
	uc_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/mempooltx"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/token"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/walletutil"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/kmutexutil"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
)

func TransferTokenCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "transfer",
		Short: "Transfers a non-fungible token you own to someone else",
		Run: func(cmd *cobra.Command, args []string) {
			doRunTransferToken()
		},
	}

	cmd.Flags().StringVar(&flagTransferRecipientAddress, "recipient-address", "", "The address of the account whom will receive this Token")
	cmd.MarkFlagRequired("recipient-address")
	cmd.Flags().StringVar(&flagTransferTokenID, "token-id", "", "The ID of the token that you own")
	cmd.MarkFlagRequired("token-id")

	return cmd
}

func doRunTransferToken() {
	//
	// Load up dependencies.
	//

	// ------ Common ------
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)
	keystore := hdkeystore.NewAdapter()
	kmutex := kmutexutil.NewKMutexProvider()

	// ------ Repository ------
	// walletRepo := repo.NewWalletRepo(cfg, logger, dbClient)
	// accountRepo := repo.NewAccountRepo(cfg, logger, dbClient)
	blockchainStateRepo := repo.NewBlockchainStateRepo(cfg, logger, dbClient)
	tokRepo := repo.NewTokenRepo(cfg, logger, dbClient)
	// gbdRepo := repo.NewGenesisBlockDataRepo(cfg, logger, dbClient)
	bdRepo := repo.NewBlockDataRepo(cfg, logger, dbClient)
	mempoolTxRepo := repo.NewMempoolTransactionRepo(cfg, logger, dbClient)

	// // ------ Use-case ------
	// // Wallet
	// walletEncryptKeyUseCase := usecase.NewWalletEncryptKeyUseCase(
	// 	cfg,
	// 	logger,
	// 	keystore,
	// 	walletRepo,
	// )
	// _ = walletEncryptKeyUseCase
	privateKeyFromHDWalletUseCase := uc_walletutil.NewPrivateKeyFromHDWalletUseCase(
		cfg,
		logger,
		keystore,
	)
	// createWalletUseCase := usecase.NewCreateWalletUseCase(
	// 	cfg,
	// 	logger,
	// 	walletRepo,
	// )
	// _ = createWalletUseCase
	// getWalletUseCase := uc_wallet.NewGetWalletUseCase(
	// 	cfg,
	// 	logger,
	// 	walletRepo,
	// )

	// // Account
	// createAccountUseCase := usecase.NewCreateAccountUseCase(
	// 	cfg,
	// 	logger,
	// 	accountRepo,
	// )
	// _ = createAccountUseCase
	// getAccountUseCase := usecase.NewGetAccountUseCase(
	// 	cfg,
	// 	logger,
	// 	accountRepo,
	// )
	// _ = getAccountUseCase
	// upsertAccountUseCase := usecase.NewUpsertAccountUseCase(
	// 	cfg,
	// 	logger,
	// 	accountRepo,
	// )
	// getAccountsHashStateUseCase := usecase.NewGetAccountsHashStateUseCase(
	// 	cfg,
	// 	logger,
	// 	accountRepo,
	// )
	//
	// Blockchain State
	getBlockchainStateUseCase := uc_blockchainstate.NewGetBlockchainStateUseCase(
		cfg,
		logger,
		blockchainStateRepo,
	)
	upsertBlockchainStateUseCase := uc_blockchainstate.NewUpsertBlockchainStateUseCase(
		cfg,
		logger,
		blockchainStateRepo,
	)

	// Token
	getTokenUseCase := uc_token.NewGetTokenUseCase(
		cfg,
		logger,
		tokRepo,
	)
	// upsertTokenIfPreviousTokenNonceGTEUseCase := usecase.NewUpsertTokenIfPreviousTokenNonceGTEUseCase(
	// 	cfg,
	// 	logger,
	// 	tokRepo,
	// )
	// getTokensHashStateUseCase := usecase.NewGetTokensHashStateUseCase(
	// 	cfg,
	// 	logger,
	// 	tokRepo,
	// )
	//
	// // Genesis BlockData
	// upsertGenesisBlockDataUseCase := usecase.NewUpsertGenesisBlockDataUseCase(
	// 	cfg,
	// 	logger,
	// 	gbdRepo,
	// )
	//
	// BlockData
	getBlockDataUseCase := uc_blockdata.NewGetBlockDataUseCase(
		cfg,
		logger,
		bdRepo,
	)
	// upsertBlockDataUseCase := usecase.NewUpsertBlockDataUseCase(
	// 	cfg,
	// 	logger,
	// 	bdRepo,
	// )
	//
	// // Proof of Work
	// proofOfWorkUseCase := usecase.NewProofOfWorkUseCase(
	// 	cfg,
	// 	logger,
	// )

	// Mempool Transaction
	mempoolTransactionCreateUseCase := uc_mempooltx.NewMempoolTransactionCreateUseCase(
		cfg,
		logger,
		mempoolTxRepo,
	)

	// ------ Service ------
	tokenTransferService := sv_token.NewTokenTransferService(
		cfg,
		logger,
		kmutex,
		dbClient, // Note: Used for mongoDB transaction handling.
		privateKeyFromHDWalletUseCase,
		getBlockchainStateUseCase,
		upsertBlockchainStateUseCase,
		getBlockDataUseCase,
		getTokenUseCase,
		mempoolTransactionCreateUseCase,
	)

	// Execution
	ctx := context.Background()
	transferRecipientAddress := common.HexToAddress(strings.ToLower(flagTransferRecipientAddress))
	tokenID, ok := new(big.Int).SetString(flagTransferTokenID, 10)
	if !ok {
		log.Fatalf("Failed converting to big.Int: %v", flagTokenID)
	}
	logger.Debug("transfering token...",
		slog.Any("address", transferRecipientAddress),
		slog.Any("token_id", tokenID.Uint64()))

	err := tokenTransferService.Execute(
		ctx,
		tokenID,
		cfg.Blockchain.ProofOfAuthorityAccountAddress,
		cfg.Blockchain.ProofOfAuthorityWalletMnemonic,
		cfg.Blockchain.ProofOfAuthorityWalletPath,
		&transferRecipientAddress)
	if err != nil {
		logger.Error("Failed executing",
			slog.Any("error", err))
		log.Fatalf("Failed executing: %v\n", err)
	}
	logger.Debug("Token transfered")
}
