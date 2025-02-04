package blocktx

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"math/big"
	"strings"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/httperror"
	inmem "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage"
	"github.com/ethereum/go-ethereum/common"

	uc_blocktx "github.com/comiccoin-network/monorepo/native/desktop/comiccoin-cli/usecase/blocktx"
)

type LocalNotificationCallback func(direction string, typeOf string, valueOrTokenID *big.Int, timestamp uint64)

type AccountLocalNotificationService interface {
	Execute(ctx context.Context, address *common.Address, callback LocalNotificationCallback) error
}

type accountLocalNotificationServiceImpl struct {
	logger                                                                                      *slog.Logger
	mem                                                                                         inmem.Storage
	subscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCase uc_blocktx.SubscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCase
}

func NewAccountLocalNotificationService(
	logger *slog.Logger,
	mem inmem.Storage,
	uc1 uc_blocktx.SubscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCase,
) AccountLocalNotificationService {
	return &accountLocalNotificationServiceImpl{logger, mem, uc1}
}

func (s *accountLocalNotificationServiceImpl) Execute(ctx context.Context, address *common.Address, callback LocalNotificationCallback) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if address == nil {
		e["address"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Validation failed for getting account",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2
	//

	strCh, err := s.subscribeToGetLatestBlockTransactionByAddressServerSentEventsFromBlockchainAuthorityUseCase.Execute(ctx, address)
	if err != nil {
		log.Fatalf("Failed to load sse use-case with error: %v", err)
	}

	// Create a channel to handle program termination
	done := make(chan struct{})

	go func() {
		for {
			select {
			case newContent, ok := <-strCh:
				if !ok {
					s.logger.Info("Channel closed, stopping notification listener")
					done <- struct{}{}
					return
				}

				//
				// Lookup our in-memory storage to see if we've received anything recently.
				// If the recent content is the same as the new content then exit.
				//

				recentContentBytes, err := s.mem.Get(fmt.Sprintf("latest_blocktx_for_%v", address.String()))
				if err != nil {
					if strings.Contains(err.Error(), "does not exist for") {

						if err := s.mem.Set(fmt.Sprintf("latest_blocktx_for_%v", address.String()), []byte(newContent)); err != nil {
							s.logger.Error("Error with getting from in-memory database, stopping notification listener", slog.Any("error", err))
							done <- struct{}{}
							return
						}
					} else {
						s.logger.Error("Error with getting from in-memory database, stopping notification listener", slog.Any("error", err))
						done <- struct{}{}
						return
					}
				}
				recentContent := string(recentContentBytes)

				s.logger.Info("Received SSE",
					slog.Any("new_content", newContent),
					slog.Any("recent_content", recentContent),
					slog.String("account_address", address.String()))

				if newContent == recentContent {
					s.logger.Info("No local notifications")
					return
				}

				//
				//
				//

				toks := strings.Split(newContent, "|")
				direction := toks[0]
				typeOf := toks[1]
				valueOrTokenID, ok := new(big.Int).SetString(toks[2], 10)
				if !ok {
					s.logger.Error("Failed to parse valueOrTokenID", slog.String("value", toks[2]))
					return
				}
				timestampBig, ok := new(big.Int).SetString(toks[3], 10)
				if !ok {
					s.logger.Error("Failed to parse timestamp", slog.String("value", toks[3]))
					return
				}
				timestamp := timestampBig.Uint64()

				s.logger.Info("Received SSE",
					slog.Any("toks", toks),
					slog.Any("direction", direction),
					slog.Any("typeOf", typeOf),
					slog.Any("valueOrTokenID", valueOrTokenID),
					slog.Any("timestamp", timestamp),
					slog.String("account_address", address.String()))

				// Execute the callback
				if callback != nil {
					callback(direction, typeOf, valueOrTokenID, timestamp)
				}
			case <-ctx.Done():
				s.logger.Info("Context cancelled, stopping notification listener")
				done <- struct{}{}
				return
			}
		}
	}()

	// Wait for termination
	<-done

	return nil
}
