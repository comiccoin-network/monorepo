package blockchain

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"os"
	"os/signal"
	"strings"
	"syscall"

	inmemory "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage/memory/inmemory"
	"github.com/ethereum/go-ethereum/common"
	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/logger"
	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/repo"
	s_blocktx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/service/blocktx"
	uc_blocktx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/blocktx"
)

var (
	flagAccountAddress string
)

func LocalNotificationCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "localnotification",
		Short: "Subscribe SSE stream for latest transactions for the particular wallet address",
		Run: func(cmd *cobra.Command, args []string) {
			doRunLocalNotification()
		},
	}

	cmd.Flags().StringVar(&flagAccountAddress, "address", "", "The address value for the local notifications")
	cmd.MarkFlagRequired("address")

	return cmd
}

func doRunLocalNotification() {
	// ------ Common ------
	logger := logger.NewProvider()

	// Create context that we can cancel
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Set up signal handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Get the account from our flag.
	accountAddress := common.HexToAddress(strings.ToLower(flagAccountAddress))

	// ------ Database -----

	memDB := inmemory.NewInMemoryStorage(logger)

	// ------------ Repo ------------

	sseProvider := repo.NewGetLatestBlockTransactionByAddressServerSentEventsDTOConfigurationProvider(preferences.AuthorityAddress)
	sseRepo := repo.NewGetLatestBlockTransactionByAddressServerSentEventsDTORepository(sseProvider, logger)

	// ------------ Use-Case ------------

	sseUseCase := uc_blocktx.NewSubscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCase(
		logger,
		sseRepo)

	// ------------ Service ------------

	localNotificationService := s_blocktx.NewAccountLocalNotificationService(logger, memDB, sseUseCase)

	// ------------ Execute ------------

	// Create error channel
	errChan := make(chan error, 1)

	// Start the service in a goroutine
	go func() {
		err := localNotificationService.Execute(ctx, &accountAddress, func(direction string, typeOf string, valueOrTokenID *big.Int, timestamp uint64) {
			fmt.Printf("🔔 New transaction detected!\nDirection: %s\nTypeOf: %s\nValueOrTokenID: %v\nTimestamp: %v\n\n", direction, typeOf, valueOrTokenID, timestamp)
		})
		errChan <- err
	}()

	// Wait for either error or signal
	select {
	case err := <-errChan:
		if err != nil {
			log.Fatalf("Service error: %v", err)
		}
	case sig := <-sigChan:
		fmt.Printf("\nReceived signal: %v\n", sig)
		cancel() // Cancel the context
		// Wait for service to clean up
		<-errChan
	}

	fmt.Println("Shutting down gracefully...")
}
