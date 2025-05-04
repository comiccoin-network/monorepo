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
	sv_poa "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/poa"
	sv_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/token"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockchainstate"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockdata"
	uc_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/mempooltx"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/token"
	uc_walletutil "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/walletutil"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/distributedmutex"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	redis_cache "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/memory/redis"
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
	redisCacheProvider := redis_cache.NewCache(cfg, logger)
	dmutex := distributedmutex.NewAdapter(logger, redisCacheProvider.GetRedisClient())

	// ------ Repository ------
	blockchainStateRepo := repo.NewBlockchainStateRepo(cfg, logger, dbClient)
	tokRepo := repo.NewTokenRepo(cfg, logger, dbClient)
	bdRepo := repo.NewBlockDataRepo(cfg, logger, dbClient)
	mempoolTxRepo := repo.NewMempoolTransactionRepo(cfg, logger, dbClient)

	// ------ Use-case ------
	privateKeyFromHDWalletUseCase := uc_walletutil.NewPrivateKeyFromHDWalletUseCase(
		cfg,
		logger,
		keystore,
	)
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
	getBlockDataUseCase := uc_blockdata.NewGetBlockDataUseCase(
		cfg,
		logger,
		bdRepo,
	)
	getTokenUseCase := uc_token.NewGetTokenUseCase(
		cfg,
		logger,
		tokRepo,
	)
	mempoolTransactionCreateUseCase := uc_mempooltx.NewMempoolTransactionCreateUseCase(
		cfg,
		logger,
		mempoolTxRepo,
	)
	mempoolTransactionDeleteByIDUseCase := uc_mempooltx.NewMempoolTransactionDeleteByIDUseCase(
		cfg,
		logger,
		mempoolTxRepo,
	)
	blockchainStatePublishUseCase := uc_blockchainstate.NewBlockchainStatePublishUseCase(
		logger,
		redisCacheProvider,
	)

	// ------ Service ------
	// Create PoA service
	getProofOfAuthorityPrivateKeyService := sv_poa.NewGetProofOfAuthorityPrivateKeyService(
		cfg,
		logger,
		privateKeyFromHDWalletUseCase,
	)

	// Create PoA consensus mechanism service
	proofOfAuthorityConsensusMechanismService := sv_poa.NewProofOfAuthorityConsensusMechanismService(
		cfg,
		logger,
		dmutex,
		dbClient,
		getProofOfAuthorityPrivateKeyService,
		mempoolTransactionDeleteByIDUseCase,
		getBlockchainStateUseCase,
		upsertBlockchainStateUseCase,
		nil, // getGenesisBlockDataUseCase - not needed for transfer
		getBlockDataUseCase,
		nil, // getAccountUseCase - not needed for transfer
		nil, // getAccountsHashStateUseCase - not needed for transfer
		nil, // upsertAccountUseCase - not needed for transfer
		getTokenUseCase,
		nil, // getTokensHashStateUseCase - not needed for transfer
		nil, // upsertTokenIfPreviousTokenNonceGTEUseCase - not needed for transfer
		nil, // proofOfWorkUseCase - not needed for transfer
		nil, // upsertBlockDataUseCase - not needed for transfer
		blockchainStatePublishUseCase,
	)

	// Token Transfer service with PoA service
	tokenTransferService := sv_token.NewTokenTransferService(
		cfg,
		logger,
		dmutex,
		dbClient,
		privateKeyFromHDWalletUseCase,
		getBlockchainStateUseCase,
		upsertBlockchainStateUseCase,
		getBlockDataUseCase,
		getTokenUseCase,
		mempoolTransactionCreateUseCase,
		proofOfAuthorityConsensusMechanismService, // Add the PoA service
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
	logger.Debug("Token transferred")
}
