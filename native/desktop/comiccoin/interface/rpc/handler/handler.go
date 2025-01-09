package handler

import (
	"log/slog"

	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service"
	service_account "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service/account"
	service_blockdata "github.com/comiccoin-network/monorepo/native/desktop/comiccoin/service/blockdata"
)

type ComicCoinRPCServer struct {
	logger                                *slog.Logger
	getAccountService                     *service_account.GetAccountService
	createAccountService                  *service_account.CreateAccountService
	accountListingByLocalWalletsService   *service_account.AccountListingByLocalWalletsService
	coinTransferService                   *service.CoinTransferService
	tokenGetService                       *service.TokenGetService
	tokenTransferService                  *service.TokenTransferService
	tokenBurnService                      *service.TokenBurnService
	getOrDownloadNonFungibleTokenService  *service.GetOrDownloadNonFungibleTokenService
	listBlockTransactionsByAddressService *service.ListBlockTransactionsByAddressService
	getByBlockTransactionTimestampService *service_blockdata.GetByBlockTransactionTimestampService
	blockDataGetByHashService             *service_blockdata.BlockDataGetByHashService
	tokenListByOwnerService               *service.TokenListByOwnerService
	exportWalletService                   *service.ExportWalletService
	importWalletService                   *service.ImportWalletService
}

func NewComicCoinRPCServer(
	logger *slog.Logger,
	s1 *service_account.GetAccountService,
	s2 *service_account.CreateAccountService,
	s3 *service_account.AccountListingByLocalWalletsService,
	s4 *service.CoinTransferService,
	s5 *service.TokenGetService,
	s6 *service.TokenTransferService,
	s7 *service.TokenBurnService,
	s8 *service.GetOrDownloadNonFungibleTokenService,
	s9 *service.ListBlockTransactionsByAddressService,
	s10 *service_blockdata.GetByBlockTransactionTimestampService,
	s11 *service_blockdata.BlockDataGetByHashService,
	s12 *service.TokenListByOwnerService,
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
