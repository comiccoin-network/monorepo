package rpc

import (
	"fmt"
	"log"
	"log/slog"
	"net"
	"net/http"
	"net/rpc"

	rpchandler "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/interface/rpc/handler"
	service_account "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/account"
	service_blockdata "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/blockdata"
	service_blocktx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/blocktx"
	service_coin "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/coin"
	service_nftok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/nftok"
	service_tok "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/tok"
	service_wallet "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/wallet"
)

// RPCServer represents an RPC server that handles incoming requests.
type RPCServer interface {
	// Run starts the RPC server.
	Run(address, port string)

	// Shutdown shuts down the RPC server.
	Shutdown()
}

type RPCServerConfigurationProvider interface {
	GetAddress() string // Retrieves the remote IPFS service address
	GetPort() string    // Retrieves the API key for authentication
}

// RPCServerConfigurationProviderImpl is a struct that implements
// RPCServerConfigurationProvider for configuration details.
type RPCServerConfigurationProviderImpl struct {
	address string
	port    string // API key for accessing IPFS service
}

func NewRPCServerConfigurationProvider(address string, port string) RPCServerConfigurationProvider {
	// Defensive code: Enforce `address` is set at minimum.
	if address == "" {
		log.Fatal("Missing `address` parameter.")
	}
	return &RPCServerConfigurationProviderImpl{
		address: address,
		port:    port,
	}
}

// GetAddress retrieves the remote IPFS service address.
func (impl *RPCServerConfigurationProviderImpl) GetAddress() string {
	return impl.address
}

// GetPort retrieves the API key for IPFS service authentication.
func (impl *RPCServerConfigurationProviderImpl) GetPort() string {
	return impl.port
}

// RPCServerImpl is an implementation of the RPCServer interface.
type RPCServerImpl struct {
	config RPCServerConfigurationProvider

	// logger is the logger for the RPC server.
	logger *slog.Logger

	rpcApi *rpchandler.ComicCoinRPCServer
}

// NewRPCServer creates a new RPC server instance.
func NewRPCServer(
	config RPCServerConfigurationProvider,
	logger *slog.Logger,
	s1 service_account.GetAccountService,
	s2 service_account.CreateAccountService,
	s3 service_account.AccountListingByLocalWalletsService,
	s4 service_coin.CoinTransferService,
	s5 service_tok.TokenGetService,
	s6 service_tok.TokenTransferService,
	s7 service_tok.TokenBurnService,
	s8 service_nftok.GetOrDownloadNonFungibleTokenService,
	s9 service_blocktx.ListBlockTransactionsByAddressService,
	s10 service_blockdata.GetByBlockTransactionTimestampService,
	s11 service_blockdata.BlockDataGetByHashService,
	s12 service_tok.TokenListByOwnerService,
	s13 service_wallet.ExportWalletService,
	s14 service_wallet.ImportWalletService,
) RPCServer {
	// Create a new RPC server
	myServer := rpchandler.NewComicCoinRPCServer(logger, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14)

	// Create a new RPC server instance.
	port := &RPCServerImpl{
		config: config,
		logger: logger,
		rpcApi: myServer,
	}

	return port
}

// Run starts the RPC server.
func (impl *RPCServerImpl) Run(address, port string) {
	// Log a message to indicate that the RPC server is running.
	impl.logger.Info("Running RPC API",
		slog.String("listen_address", port))

	// Register RPC server
	rpc.Register(impl.rpcApi)
	rpc.HandleHTTP()
	// Listen for requests on port
	l, e := net.Listen("tcp", fmt.Sprintf("%v:%v", address, port))
	if e != nil {
		log.Fatal("listen error:", e)
	}
	http.Serve(l, nil)

}

// Shutdown shuts down the RPC server.
func (port *RPCServerImpl) Shutdown() {
	// Log a message to indicate that the RPC server is shutting down.
	port.logger.Info("Gracefully shutting down RPC API")
}
