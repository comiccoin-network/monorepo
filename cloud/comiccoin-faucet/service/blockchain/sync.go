package blockchain

import (
	"fmt"
	"log/slog"
	"math/big"
	"math/rand"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/account"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/blockchainstate"
	uc_blockchainstatedto "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/blockchainstatedto"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/blockdata"
	uc_blockdatadto "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/blockdatadto"
	uc_genesisblockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/genesisblockdata"
	uc_genesisblockdatadto "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/genesisblockdatadto"
	uc_tenant "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/tenant"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/token"
	uc_usertx "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/usertx"
)

type BlockchainSyncWithBlockchainAuthorityService interface {
	Execute(sessCtx mongo.SessionContext) error
}

type blockchainSyncWithBlockchainAuthorityServiceImpl struct {
	config                                               *config.Configuration
	logger                                               *slog.Logger
	getGenesisBlockDataUseCase                           uc_genesisblockdata.GetGenesisBlockDataUseCase
	upsertGenesisBlockDataUseCase                        uc_genesisblockdata.UpsertGenesisBlockDataUseCase
	getGenesisBlockDataDTOFromBlockchainAuthorityUseCase uc_genesisblockdatadto.GetGenesisBlockDataDTOFromBlockchainAuthorityUseCase
	getBlockchainStateUseCase                            uc_blockchainstate.GetBlockchainStateUseCase
	upsertBlockchainStateUseCase                         uc_blockchainstate.UpsertBlockchainStateUseCase
	getBlockchainStateDTOFromBlockchainAuthorityUseCase  uc_blockchainstatedto.GetBlockchainStateDTOFromBlockchainAuthorityUseCase
	getBlockDataUseCase                                  uc_blockdata.GetBlockDataUseCase
	upsertBlockDataUseCase                               uc_blockdata.UpsertBlockDataUseCase
	getBlockDataDTOFromBlockchainAuthorityUseCase        uc_blockdatadto.GetBlockDataDTOFromBlockchainAuthorityUseCase
	getAccountUseCase                                    uc_account.GetAccountUseCase
	upsertAccountUseCase                                 uc_account.UpsertAccountUseCase
	upsertTokenIfPreviousTokenNonceGTEUseCase            uc_token.UpsertTokenIfPreviousTokenNonceGTEUseCase
	tenantGetByIDUseCase                                 uc_tenant.TenantGetByIDUseCase
	tenantUpdateUseCase                                  uc_tenant.TenantUpdateUseCase
	userTransactionGetUseCase                            uc_usertx.UserTransactionGetUseCase
	userTransactionUpdateUseCase                         uc_usertx.UserTransactionUpdateUseCase
}

func NewBlockchainSyncWithBlockchainAuthorityService(
	cfg *config.Configuration,
	logger *slog.Logger,
	uc1 uc_genesisblockdata.GetGenesisBlockDataUseCase,
	uc2 uc_genesisblockdata.UpsertGenesisBlockDataUseCase,
	uc3 uc_genesisblockdatadto.GetGenesisBlockDataDTOFromBlockchainAuthorityUseCase,
	uc4 uc_blockchainstate.GetBlockchainStateUseCase,
	uc5 uc_blockchainstate.UpsertBlockchainStateUseCase,
	uc6 uc_blockchainstatedto.GetBlockchainStateDTOFromBlockchainAuthorityUseCase,
	uc7 uc_blockdata.GetBlockDataUseCase,
	uc8 uc_blockdata.UpsertBlockDataUseCase,
	uc9 uc_blockdatadto.GetBlockDataDTOFromBlockchainAuthorityUseCase,
	uc10 uc_account.GetAccountUseCase,
	uc11 uc_account.UpsertAccountUseCase,
	uc12 uc_token.UpsertTokenIfPreviousTokenNonceGTEUseCase,
	uc13 uc_tenant.TenantGetByIDUseCase,
	uc14 uc_tenant.TenantUpdateUseCase,
	uc15 uc_usertx.UserTransactionGetUseCase,
	uc16 uc_usertx.UserTransactionUpdateUseCase,
) BlockchainSyncWithBlockchainAuthorityService {
	return &blockchainSyncWithBlockchainAuthorityServiceImpl{cfg, logger, uc1, uc2, uc3, uc4, uc5, uc6, uc7, uc8, uc9, uc10, uc11, uc12, uc13, uc14, uc15, uc16}
}

func (s *blockchainSyncWithBlockchainAuthorityServiceImpl) Execute(sessCtx mongo.SessionContext) error {
	//
	// STEP 1: Get variables and reference data for convenience. Validate.
	//

	chainID := s.config.Blockchain.ChainID
	tenantID := s.config.App.TenantID

	tenant, err := s.tenantGetByIDUseCase.Execute(sessCtx, tenantID)
	if err != nil {
		s.logger.Error("Failed getting tenant",
			slog.Any("chain_id", chainID),
			slog.Any("tenant_id", tenantID),
			slog.Any("error", err))
		return err
	}
	if tenant == nil {
		err := fmt.Errorf("Aborting sync as tenant does not exist at id: %v", tenantID)
		s.logger.Error("Failed getting tenant",
			slog.Any("chain_id", chainID),
			slog.Any("tenant_id", tenantID),
			slog.Any("error", err))
		return err
	}

	//
	// Step 2:
	// Get our genesis block, and if it doesn't exist then we need to fetch it
	// from the blockchain faucet for the particular `chainID`.
	//

	genesis, err := s.getGenesisBlockDataUseCase.Execute(sessCtx, chainID)
	if err != nil {
		s.logger.Error("Failed getting genesis block locally",
			slog.Any("chain_id", chainID),
			slog.Any("error", err))
		return err
	}
	if genesis == nil {
		s.logger.Debug("Genesis block d.n.e, fetching it now ...")
		genesisDTO, err := s.getGenesisBlockDataDTOFromBlockchainAuthorityUseCase.Execute(sessCtx, chainID)
		if err != nil {
			s.logger.Error("Failed getting genesis block remotely",
				slog.Any("chain_id", chainID),
				slog.Any("error", err))
			return err
		}
		if genesisDTO == nil {
			err := fmt.Errorf("Genesis block data does not exist for `chain_id`: %v", chainID)
			s.logger.Error("Failed getting genesis block remotely",
				slog.Any("chain_id", chainID),
				slog.Any("error", err))
			return err
		}

		// Convert from network format data to our local format.
		genesis = domain.GenesisBlockDataDTOToGenesisBlockData(genesisDTO)

		// Save the genesis block data to local database.
		if err := s.upsertGenesisBlockDataUseCase.Execute(sessCtx, genesis.Hash, genesis.Header, genesis.HeaderSignatureBytes, genesis.Trans, genesis.Validator); err != nil {
			s.logger.Error("Failed upserting genesis (pure)",
				slog.Any("chain_id", chainID),
				slog.Any("error", err))
			return err
		}
		if err := s.upsertBlockDataUseCase.Execute(sessCtx, genesis.Hash, genesis.Header, genesis.HeaderSignatureBytes, genesis.Trans, genesis.Validator); err != nil {
			s.logger.Error("Failed upserting genesis (block data)",
				slog.Any("chain_id", chainID),
				slog.Any("error", err))
			return err
		}

		// Process transactions for the genesis block.
		genesisCoinTx := genesis.Trans[0]
		genesisTokenTx := genesis.Trans[1]

		if err := s.upsertAccountUseCase.Execute(sessCtx, genesisCoinTx.From, genesisCoinTx.Value, big.NewInt(0)); err != nil {
			s.logger.Error("Failed upserting coinbase account.",
				slog.Any("error", err))
			return err
		}

		// Save our token to the local database ONLY if this transaction
		// is the most recent one. We track "most recent" transaction by
		// the nonce value in the token.
		upsertTokenErr := s.upsertTokenIfPreviousTokenNonceGTEUseCase.Execute(
			sessCtx,
			genesisTokenTx.GetTokenID(),
			genesisTokenTx.To,
			genesisTokenTx.TokenMetadataURI,
			genesisTokenTx.GetTokenNonce())
		if upsertTokenErr != nil {
			s.logger.Error("Failed upserting genesis block token",
				slog.Any("type", genesisTokenTx.Type),
				slog.Any("token_id", genesisTokenTx.GetTokenID()),
				slog.Any("owner", genesisTokenTx.To),
				slog.Any("metadataURI", genesisTokenTx.TokenMetadataURI),
				slog.Any("nonce", genesisTokenTx.GetTokenNonce()),
				slog.Any("error", upsertTokenErr))
			return upsertTokenErr
		}

		s.logger.Debug("Genesis block saved to local database from global blockchain network",
			slog.Any("chain_id", chainID),
			slog.Any("coinbase_address", genesisCoinTx.From.Hex()))
	}

	//
	// STEP 3:
	// Get the blockchain state we have *locally* and *remotely* and compare
	// the differences, if our local blockchain state matches what is on the
	// global blockchain network then we are done synching (because there is
	// nothin left to sync). If we don't even have a blockchain state then we need to
	// proceed to download the entire blockchain immediately. If there is any
	// discrepancy between the global and local state then we proceed with
	// this function and update our local blockchain with the available data
	// on the global blockchain network.
	//

	globalBlockchainStateDTO, err := s.getBlockchainStateDTOFromBlockchainAuthorityUseCase.Execute(sessCtx, chainID)
	if err != nil {
		s.logger.Error("Failed getting global blockchain state",
			slog.Any("chain_id", chainID),
			slog.Any("error", err))
		return err
	}
	if globalBlockchainStateDTO == nil {
		err := fmt.Errorf("Failed getting global blockchain state for chainID: %v", chainID)
		s.logger.Error("Failed getting global blockchain state",
			slog.Any("chain_id", chainID),
			slog.Any("error", err))
		return err
	}
	// Convert from network format data to our local format.
	globalBlockchainState := domain.BlockchainStateDTOToBlockchainState(globalBlockchainStateDTO)

	// Fetch our local blockchain state.
	localBlockchainState, err := s.getBlockchainStateUseCase.Execute(sessCtx, chainID)
	if err != nil {
		s.logger.Error("Failed getting local blockchain state",
			slog.Any("chain_id", chainID),
			slog.Any("error", err))
		return err
	}

	// If our local blockchain state is empty then create it with using the genesis block.
	if localBlockchainState == nil {
		localBlockchainState = &domain.BlockchainState{
			ChainID:                genesis.Header.ChainID,
			LatestBlockNumberBytes: genesis.Header.NumberBytes,
			LatestHash:             genesis.Hash,
			LatestTokenIDBytes:     genesis.Header.LatestTokenIDBytes,
			TransactionFee:         genesis.Header.TransactionFee,
			AccountHashState:       genesis.Header.StateRoot,
			TokenHashState:         genesis.Header.TokensRoot,
		}
		if err := s.upsertBlockchainStateUseCase.Execute(sessCtx, localBlockchainState); err != nil {
			s.logger.Error("Failed upserting local blockchain state from genesis block data",
				slog.Any("chain_id", chainID),
				slog.Any("error", err))
			return err
		}
		s.logger.Debug("Local blockchain state set to genesis block data",
			slog.Any("chain_id", chainID))
	} else {
		if localBlockchainState.LatestHash == globalBlockchainState.LatestHash {
			s.logger.Debug("Local blockchain is in sync with global blockchain network",
				slog.Any("chain_id", chainID))
			return nil
		}
		s.logger.Debug("Local blockchain state is out of sync with global blockchain network",
			slog.Any("chain_id", chainID))
	}

	//
	// STEP 4:
	// Proceed to download all the missing block data from the global blockchain
	// network so our local blockchain will be in-sync.
	//

	if err := s.syncWithGlobalBlockchainNetwork(sessCtx, localBlockchainState, globalBlockchainState); err != nil {
		if localBlockchainState.LatestHash == globalBlockchainState.LatestHash {
			s.logger.Debug("Failed to sync with the global blockchain network",
				slog.Any("chain_id", chainID))
			return nil
		}
	}

	//
	// STEP 5:
	// Update our blockchain state to match the global blockchain network's state.
	//

	if err := s.upsertBlockchainStateUseCase.Execute(sessCtx, globalBlockchainState); err != nil {
		s.logger.Error("Failed upserting global blockchain state.",
			slog.Any("chain_id", chainID),
			slog.Any("error", err))
		return err
	}

	s.logger.Debug("Local blockchain was synced successfully with the global blockchain network",
		slog.Any("chain_id", chainID))

	//
	// STEP 6:
	// Update our faucet.
	//

	recentTenantAccount, err := s.getAccountUseCase.Execute(sessCtx, tenant.Account.Address)
	if err != nil {
		s.logger.Error("Failed getting recent tenant address",
			slog.Any("chain_id", chainID),
			slog.Any("tenant_id", tenantID),
			slog.Any("error", err))
		return err
	}
	if recentTenantAccount == nil {
		err := fmt.Errorf("Recent tenant address does not exist at address: %v", tenant.Account.Address)
		s.logger.Error("Failed getting tenant address",
			slog.Any("chain_id", chainID),
			slog.Any("tenant_id", tenantID),
			slog.Any("error", err))
		return err
	}
	tenant.Account = recentTenantAccount
	if err := s.tenantUpdateUseCase.Execute(sessCtx, tenant); err != nil {
		s.logger.Error("Failed updating tenant",
			slog.Any("chain_id", chainID),
			slog.Any("tenant_id", tenantID),
			slog.Any("error", err))
		return err
	}

	s.logger.Debug("Tenant account balance updated",
		slog.Any("chain_id", chainID),
		slog.Any("tenant_id", tenantID),
		slog.Any("balance", tenant.Account.Balance))

	return nil
}

func (s *blockchainSyncWithBlockchainAuthorityServiceImpl) syncWithGlobalBlockchainNetwork(sessCtx mongo.SessionContext, localBlockchainState, globalBlockchainState *domain.BlockchainState) error {
	//
	// Algorithm:
	// (1) Download the most recent block from the Global Blockchain. Please
	//     note this block will contain the most recent `number` that it is in
	//     the chain.
	// (2) Get our recent block from our local Blockchain. Please note our
	//     block will contain the earliest `number` we have of the chain
	// (3) Iterate from the earliest `number` to the most recent `number` by
	//     downloading all the blocks for the missing blocks and save them to
	//     our local blockchain.
	// (4) When our local Blockchain and Global Blockchain have the same
	//     `number` then that means we have successfully synchronized; therefore,
	//     stop the synching.
	//

	s.logger.Debug("Beginning to sync with global blockchain network...")

	//
	// STEP 1
	//

	latestBlockDataDTO, err := s.getBlockDataDTOFromBlockchainAuthorityUseCase.ExecuteByHash(sessCtx, globalBlockchainState.LatestHash)
	if err != nil {
		s.logger.Debug("Failed to get latest block data from global blockchain network")
		return err
	}

	// Convert from network transfer data-structure to our application data-structure.
	latestBlockData := domain.BlockDataDTOToBlockData(latestBlockDataDTO)

	s.logger.Debug("Fetched latest block from global blockchain network",
		slog.Any("latest_hash", latestBlockData.Hash))

	//
	// STEP 2
	//

	earliestBlockData, err := s.getBlockDataUseCase.ExecuteByHash(sessCtx, localBlockchainState.LatestHash)
	if err != nil {
		s.logger.Debug("Failed to get earliest block data from local blockchain")
		return err
	}

	s.logger.Debug("Fetched latest block from local blockchain",
		slog.Any("earliest_hash", localBlockchainState.LatestHash))

	if earliestBlockData == nil {
		err := fmt.Errorf("Earliest block data does not exist for hash: %v", localBlockchainState.LatestHash)
		s.logger.Error("Database does not exist", slog.Any("err", err))
		return err
	}

	//
	// STEP 3
	//

	earliestNumber := earliestBlockData.Header.GetNumber()
	number := earliestNumber
	latestNumber := latestBlockData.Header.GetNumber()

	s.logger.Debug("Starting to process block data",
		slog.String("earliest_number", earliestNumber.String()),
		slog.String("current_number", number.String()),
		slog.String("latest_number", latestNumber.String()))

	for number.Cmp(latestNumber) <= 0 {
		s.logger.Debug("Fetching block data from global blockchain network...",
			slog.Any("header_number", number.String()))

		// Fetch from the global blockchain network.
		blockDataDTO, err := s.getBlockDataDTOFromBlockchainAuthorityUseCase.ExecuteByHeaderNumber(sessCtx, number)
		if err != nil {
			s.logger.Debug("Failed to get block data from global blockchain network",
				slog.Any("header_number", number.String()))
			return err
		}

		blockData := domain.BlockDataDTOToBlockData(blockDataDTO)

		s.logger.Debug("Downloaded block data from global blockchain network and saving to local database...",
			slog.Any("header_number", number.String()))

		// Save it to the local database.
		if err := s.upsertBlockDataUseCase.Execute(sessCtx, blockData.Hash, blockData.Header, blockData.HeaderSignatureBytes, blockData.Trans, blockData.Validator); err != nil {
			s.logger.Debug("Failed to upsert block data ",
				slog.Any("header_number", number.String()))
			return err
		}

		//
		// Process account 🪙 coins and 🎟️ tokens from the transactions.
		//

		for _, blockTx := range blockData.Trans {
			//
			// Process 🪪 accounts.
			//

			s.logger.Debug("Processing block tx...",
				slog.Any("type", blockTx.Type),
				slog.Any("nonce", blockTx.GetNonce()),
				slog.Any("timestamp", blockTx.TimeStamp))
			if err := s.processAccountForTransaction(sessCtx, blockData, &blockTx); err != nil {
				s.logger.Error("Failed processing transaction",
					slog.Any("error", err))
				return err
			}

			//
			// Process 🎟️ tokens.
			//

			if blockTx.Type == domain.TransactionTypeToken {
				// Save our token to the local database ONLY if this transaction
				// is the most recent one. We track "most recent" transaction by
				// the nonce value in the token.
				err := s.upsertTokenIfPreviousTokenNonceGTEUseCase.Execute(
					sessCtx,
					blockTx.GetTokenID(),
					blockTx.To,
					blockTx.TokenMetadataURI,
					blockTx.GetTokenNonce())
				if err != nil {
					s.logger.Error("Failed upserting (if previous token nonce GTE then current)",
						slog.Any("type", blockTx.Type),
						slog.Any("token_id", blockTx.GetTokenID()),
						slog.Any("owner", blockTx.To),
						slog.Any("metadataURI", blockTx.TokenMetadataURI),
						slog.Any("nonce", blockTx.GetTokenNonce()),
						slog.Any("error", err))
					return err
				}
			}

			//
			// Process transactions which exist in our 🚰 faucet application.
			//

			if err := s.processUserTransactionForCoinTransaction(sessCtx, blockData, &blockTx); err != nil {
				s.logger.Error("Failed processing transaction",
					slog.Any("error", err))
				return err
			}

			s.logger.Debug("Finished processing block tx",
				slog.Any("type", blockTx.Type),
				slog.Any("nonce", blockTx.GetNonce()),
				slog.Any("timestamp", blockTx.TimeStamp))
		}

		// IMPORTANT: Increment our header number to the next value.
		number = blockData.Header.GetNumber()
		number = number.Add(number, big.NewInt(1))

		s.logger.Debug("Processing next block data",
			slog.String("earliest_number", earliestNumber.String()),
			slog.String("next_number", number.String()),
			slog.String("latest_number", latestNumber.String()))

		// Artificial delay as to not overload the network resources. We will
		// randomly pick an artificial delay between 1 second to 3 seconds.
		randInt := rand.Intn(3) + 1
		s.logger.Debug("Applying artificial delay",
			slog.Any("seconds", randInt))
		time.Sleep(time.Duration(randInt) * time.Second)
	}

	s.logger.Debug("Finished syncing with global blockchain network")
	return nil
}

func (s *blockchainSyncWithBlockchainAuthorityServiceImpl) processAccountForTransaction(sessCtx mongo.SessionContext, blockData *domain.BlockData, blockTx *domain.BlockTransaction) error {
	//
	// CASE 1 OF 2: 🎟️ Token Transaction
	//

	if blockTx.Type == domain.TransactionTypeToken {
		return s.processAccountForTokenTransaction(sessCtx, blockData, blockTx)
	}

	//
	// CASE 2 OF 2: 🪙 Coin Transaction
	//

	if blockTx.Type == domain.TransactionTypeCoin {
		return s.processAccountForCoinTransaction(sessCtx, blockData, blockTx)
	}

	return nil
}

func (s *blockchainSyncWithBlockchainAuthorityServiceImpl) processAccountForCoinTransaction(sessCtx mongo.SessionContext, blockData *domain.BlockData, blockTx *domain.BlockTransaction) error {
	//
	// STEP 1
	//

	if blockTx.From != nil {
		// DEVELOPERS NOTE:
		// We already *should* have a `From` account in our database, so we can
		acc, _ := s.getAccountUseCase.Execute(sessCtx, blockTx.From)
		if acc == nil {
			s.logger.Error("The `From` account does not exist in our database.",
				slog.Any("hash", blockTx.From))
			return fmt.Errorf("The `From` account does not exist in our database for hash: %v", blockTx.From.String())
		}

		acc.Balance -= blockTx.Value

		// Note: We do this to prevent reply attacks. (See notes in either `domain/accounts.go` or `service/genesis_init.go`)
		noince := acc.GetNonce()
		noince.Add(noince, big.NewInt(1))
		acc.NonceBytes = noince.Bytes()

		// DEVELOPERS NOTE:
		// Do not update this accounts `Nonce`, we need to only update the
		// `Nonce` to the receiving account, i.e. the `To` account.

		if err := s.upsertAccountUseCase.Execute(sessCtx, acc.Address, acc.Balance, acc.GetNonce()); err != nil {
			s.logger.Error("Failed upserting account.",
				slog.Any("error", err))
			return err
		}

		s.logger.Debug("New `From` account balance via blockchain faucet",
			slog.Any("account_address", acc.Address),
			slog.Any("balance", acc.Balance),
		)
	}

	//
	// STEP 2
	//

	if blockTx.To != nil {

		// Variable holds the value of coins to transfer to the account after
		// the transaction fee was collected by the Authority.
		var valueMinusFees uint64 = blockTx.Value - blockData.Header.TransactionFee

		acc, _ := s.getAccountUseCase.Execute(sessCtx, blockTx.To)
		if acc == nil {
			if err := s.upsertAccountUseCase.Execute(sessCtx, blockTx.To, 0, big.NewInt(0)); err != nil {
				s.logger.Error("Failed creating account.",
					slog.Any("error", err))
				return err
			}
			acc = &domain.Account{
				Address: blockTx.To,

				// Always start by zero, increment by 1 after mining successful.
				NonceBytes: big.NewInt(0).Bytes(),

				Balance: valueMinusFees,
			}
		} else {
			acc.Balance += valueMinusFees

			// Note: We do this to prevent reply attacks. (See notes in either `domain/accounts.go` or `service/genesis_init.go`)
			noince := acc.GetNonce()
			noince.Add(noince, big.NewInt(1))
			acc.NonceBytes = noince.Bytes()
		}

		if err := s.upsertAccountUseCase.Execute(sessCtx, acc.Address, acc.Balance, acc.GetNonce()); err != nil {
			s.logger.Error("Failed upserting account.",
				slog.Any("error", err))
			return err
		}

		s.logger.Debug("New `To` account balance via blockchain faucet",
			slog.Any("account_address", acc.Address),
			slog.Any("balance", acc.Balance),
		)
	}

	//
	// STEP 3
	//

	// Deposit the transaction fee back to the coinbase to be recirculated.
	proofOfAuthorityAccount, err := s.getAccountUseCase.Execute(sessCtx, &blockData.Header.Beneficiary)
	if err != nil {
		s.logger.Error("Failed getting proof of authority account.",
			slog.Any("error", err))
		return err
	}
	if proofOfAuthorityAccount == nil {
		s.logger.Error("Proof of authority account does not exist")
		return fmt.Errorf("Proof of authority account does not exist")
	}

	// Collect transaction fee from this coin transaction.
	proofOfAuthorityAccount.Balance += blockData.Header.TransactionFee

	// Note: We do this to prevent reply attacks. (See notes in either `domain/accounts.go` or `service/genesis_init.go`)
	pofNonce := proofOfAuthorityAccount.GetNonce()
	pofNonce.Add(pofNonce, big.NewInt(1))
	proofOfAuthorityAccount.NonceBytes = pofNonce.Bytes()

	if err := s.upsertAccountUseCase.Execute(sessCtx, proofOfAuthorityAccount.Address, proofOfAuthorityAccount.Balance, proofOfAuthorityAccount.GetNonce()); err != nil {
		s.logger.Error("Failed upserting account.",
			slog.Any("error", err))
		return err
	}
	s.logger.Debug("Authority collected transaction fee from coin transfer",
		slog.Any("authority_address", proofOfAuthorityAccount.Address),
		slog.Any("collected_fee", blockData.Header.TransactionFee),
		slog.Any("new_balance", proofOfAuthorityAccount.Balance),
	)

	return nil
}

func (s *blockchainSyncWithBlockchainAuthorityServiceImpl) processAccountForTokenTransaction(sessCtx mongo.SessionContext, blockData *domain.BlockData, blockTx *domain.BlockTransaction) error {
	//
	// STEP 1:
	// Check to see if we have an account for this particular token and
	// collect the transaction fee.
	//

	if blockTx.From != nil {
		acc, _ := s.getAccountUseCase.Execute(sessCtx, blockTx.From)
		if acc == nil {
			if err := s.upsertAccountUseCase.Execute(sessCtx, blockTx.To, 0, big.NewInt(0)); err != nil {
				s.logger.Error("Failed creating account.",
					slog.Any("error", err))
				return err
			}
			acc = &domain.Account{
				Address:    blockTx.To,
				NonceBytes: big.NewInt(0).Bytes(), // Always start by zero, increment by 1 after mining successful.
				Balance:    0,
			}
			if err := s.upsertAccountUseCase.Execute(sessCtx, acc.Address, acc.Balance, acc.GetNonce()); err != nil {
				s.logger.Error("Failed upserting account.",
					slog.Any("error", err))
				return err
			}
			s.logger.Debug("New `From` account balance via validator b/c of token",
				slog.Any("account_address", acc.Address),
				slog.Any("balance", acc.Balance),
			)
		} else {
			acc.Balance -= blockTx.Value // Note: The value is equal to the transaction fee.

			// Note: We do this to prevent reply attacks. (See notes in either `domain/accounts.go` or `service/genesis_init.go`)
			accNonce := acc.GetNonce()
			accNonce.Add(accNonce, big.NewInt(1))
			acc.NonceBytes = accNonce.Bytes()

			if err := s.upsertAccountUseCase.Execute(sessCtx, acc.Address, acc.Balance, acc.GetNonce()); err != nil {
				s.logger.Error("Failed upserting account.",
					slog.Any("error", err))
				return err
			}
		}
	}

	//
	// STEP 2:
	// Check to see if we have an account for this particular token, if not
	// then create it.  Do this from the `To` side of the transaction.
	//

	if blockTx.To != nil {
		acc, _ := s.getAccountUseCase.Execute(sessCtx, blockTx.To)
		if acc == nil {
			if err := s.upsertAccountUseCase.Execute(sessCtx, blockTx.To, 0, big.NewInt(0)); err != nil {
				s.logger.Error("Failed creating account.",
					slog.Any("error", err))
				return err
			}
			acc = &domain.Account{
				Address:    blockTx.To,
				NonceBytes: big.NewInt(0).Bytes(), // Always start by zero, increment by 1 after mining successful.
				Balance:    0,
			}
			if err := s.upsertAccountUseCase.Execute(sessCtx, acc.Address, acc.Balance, acc.GetNonce()); err != nil {
				s.logger.Error("Failed upserting account.",
					slog.Any("error", err))
				return err
			}

			s.logger.Debug("New `To` account via validator b/c of token",
				slog.Any("account_address", acc.Address),
				slog.Any("balance", acc.Balance),
			)
		}
	}

	//
	// STEP 3:
	// Deposit the transaction fee back to the coinbase to be recirculated.
	//

	proofOfAuthorityAccount, err := s.getAccountUseCase.Execute(sessCtx, &blockData.Header.Beneficiary)
	if err != nil {
		s.logger.Error("Failed getting proof of authority account.",
			slog.Any("error", err))
		return err
	}
	if proofOfAuthorityAccount == nil {
		s.logger.Error("Proof of authority account does not exist")
		return fmt.Errorf("Proof of authority account does not exist")
	}

	// Collect transaction fee from this token transaction.
	proofOfAuthorityAccount.Balance += blockTx.Value // Note: The value is equal to the transaction fee.

	// Note: We do this to prevent reply attacks. (See notes in either `domain/accounts.go` or `service/genesis_init.go`)
	pofNonce := proofOfAuthorityAccount.GetNonce()
	pofNonce.Add(pofNonce, big.NewInt(1))
	proofOfAuthorityAccount.NonceBytes = pofNonce.Bytes()

	if err := s.upsertAccountUseCase.Execute(sessCtx, proofOfAuthorityAccount.Address, proofOfAuthorityAccount.Balance, proofOfAuthorityAccount.GetNonce()); err != nil {
		s.logger.Error("Failed upserting account.",
			slog.Any("error", err))
		return err
	}
	s.logger.Debug("Authority collected transaction fee from token transfer or burn",
		slog.Any("authority_address", proofOfAuthorityAccount.Address),
		slog.Any("collected_fee", blockData.Header.TransactionFee),
		slog.Any("new_balance", proofOfAuthorityAccount.Balance),
	)

	return nil
}

func (s *blockchainSyncWithBlockchainAuthorityServiceImpl) processUserTransactionForCoinTransaction(sessCtx mongo.SessionContext, blockData *domain.BlockData, blockTx *domain.BlockTransaction) error {
	//
	// STEP 1
	// Check to see if our faucet sent the transaction and if it did then
	// this transaction is for a user whom did *something* in our faucet
	// application.
	//

	if blockTx.From != nil {
		if *blockTx.From == *s.config.App.WalletAddress {
			s.logger.Debug("Detect transaction from ComicCoin Faucet, beginning processing...",
				slog.Any("nonce", blockTx.GetNonce()))

			//
			// Step 2:
			// Lookup our existing transaction.
			//

			userTx, err := s.userTransactionGetUseCase.ExecuteForNonce(sessCtx, blockTx.GetNonce())
			if err != nil {
				s.logger.Error("Failed getting user transaction.",
					slog.Any("error", err))
				return err
			}
			if userTx == nil {
				err := fmt.Errorf("User transaction d.n.e. for nonce: %v.", blockTx.GetNonce())
				s.logger.Error("Failed getting user transaction",
					slog.Any("error", err))
				return err
			}

			//
			// STEP 3:
			// Set status to indicate our faucet successfully paid out.
			//

			userTx.Status = domain.UserTransactionStatusAccepted
			userTx.ModifiedAt = time.Now()
			if err := s.userTransactionUpdateUseCase.Execute(sessCtx, userTx); err != nil {
				s.logger.Error("Failed updating user transaction.",
					slog.Any("error", err))
				return err
			}

			s.logger.Debug("Finished processing transaction from ComicCoin Faucet",
				slog.Any("nonce", blockTx.GetNonce()))
		}
	}

	// DEVELOPER NOTES:
	// - Here is where you can write code if you want to handle coins being sent to the ComicCoin faucet
	// if blockTx.To != nil {
	// 	// Some code
	// }

	return nil
}
