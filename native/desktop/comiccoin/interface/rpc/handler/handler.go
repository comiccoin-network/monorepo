package handler

import (
	"log/slog"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service"
	service_account "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service/account"
	service_blockdata "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service/blockdata"
	service_blocktx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service/blocktx"
	service_coin "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service/coin"
	service_nftok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service/nftok"
	service_tok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service/tok"
)

type ComicCoinRPCServer struct {
	logger                                *slog.Logger
	getAccountService                     *service_account.GetAccountService
	createAccountService                  *service_account.CreateAccountService
	accountListingByLocalWalletsService   *service_account.AccountListingByLocalWalletsService
	coinTransferService                   *service_coin.CoinTransferService
	tokenGetService                       *service_tok.TokenGetService
	tokenTransferService                  *service_tok.TokenTransferService
	tokenBurnService                      *service_tok.TokenBurnService
	getOrDownloadNonFungibleTokenService  *service_nftok.GetOrDownloadNonFungibleTokenService
	listBlockTransactionsByAddressService *service_blocktx.ListBlockTransactionsByAddressService
	getByBlockTransactionTimestampService *service_blockdata.GetByBlockTransactionTimestampService
	blockDataGetByHashService             *service_blockdata.BlockDataGetByHashService
	tokenListByOwnerService               *service_tok.TokenListByOwnerService
	exportWalletService                   *service.ExportWalletService
	importWalletService                   *service.ImportWalletService
}

func NewComicCoinRPCServer(
	logger *slog.Logger,
	s1 *service_account.GetAccountService,
	s2 *service_account.CreateAccountService,
	s3 *service_account.AccountListingByLocalWalletsService,
	s4 *service_coin.CoinTransferService,
	s5 *service_tok.TokenGetService,
	s6 *service_tok.TokenTransferService,
	s7 *service_tok.TokenBurnService,
	s8 *service_nftok.GetOrDownloadNonFungibleTokenService,
	s9 *service_blocktx.ListBlockTransactionsByAddressService,
	s10 *service_blockdata.GetByBlockTransactionTimestampService,
	s11 *service_blockdata.BlockDataGetByHashService,
	s12 *service_tok.TokenListByOwnerService,
	s13 *service.ExportWalletService,
	s14 *service.ImportWalletService,
) *ComicCoinRPCServer {

	// Create a new RPC server instance.
	port := &ComicCoinRPCServer{
		logger:                                logger,
		getAccountService:                     s1,
		createAccountService:                  s2,
		accountListingByLocalWalletsService:   s3,
		coinTransferService:                   s4,
		tokenGetService:                       s5,
		tokenTransferService:                  s6,
		tokenBurnService:                      s7,
		getOrDownloadNonFungibleTokenService:  s8,
		listBlockTransactionsByAddressService: s9,
		getByBlockTransactionTimestampService: s10,
		blockDataGetByHashService:             s11,
		tokenListByOwnerService:               s12,
		exportWalletService:                   s13,
		importWalletService:                   s14,
	}

	return port
}
