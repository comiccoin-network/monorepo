package poa

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"math/big"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/blockchain/merkle"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/distributedmutex"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/account"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockchainstate"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/blockdata"
	uc_genesisblockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/genesisblockdata"
	uc_mempooltx "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/mempooltx"
	uc_pow "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/pow"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/usecase/token"
)

// ProofOfAuthorityConsensusMechanismService represents the service which
// delivers comparatively fast transactions using identity as a stake.
//
// Would you like to know more?
// https://coinmarketcap.com/academy/glossary/proof-of-authority-poa
type ProofOfAuthorityConsensusMechanismService struct {
	config                                     *config.Configuration
	logger                                     *slog.Logger
	dmutex                                     distributedmutex.Adapter
	dbClient                                   *mongo.Client
	getProofOfAuthorityPrivateKeyService       *GetProofOfAuthorityPrivateKeyService
	mempoolTransactionInsertionDetectorUseCase *uc_mempooltx.MempoolTransactionInsertionDetectorUseCase
	mempoolTransactionDeleteByIDUseCase        *uc_mempooltx.MempoolTransactionDeleteByIDUseCase
	getBlockchainStateUseCase                  uc_blockchainstate.GetBlockchainStateUseCase
	upsertBlockchainStateUseCase               uc_blockchainstate.UpsertBlockchainStateUseCase
	getGenesisBlockDataUseCase                 uc_genesisblockdata.GetGenesisBlockDataUseCase
	getBlockDataUseCase                        uc_blockdata.GetBlockDataUseCase
	getAccountUseCase                          uc_account.GetAccountUseCase
	getAccountsHashStateUseCase                uc_account.GetAccountsHashStateUseCase
	upsertAccountUseCase                       uc_account.UpsertAccountUseCase
	getTokenUseCase                            *uc_token.GetTokenUseCase
	getTokensHashStateUseCase                  *uc_token.GetTokensHashStateUseCase
	upsertTokenIfPreviousTokenNonceGTEUseCase  *uc_token.UpsertTokenIfPreviousTokenNonceGTEUseCase
	proofOfWorkUseCase                         *uc_pow.ProofOfWorkUseCase
	upsertBlockDataUseCase                     uc_blockdata.UpsertBlockDataUseCase
	blockchainStatePublishUseCase              uc_blockchainstate.BlockchainStatePublishUseCase
}

func NewProofOfAuthorityConsensusMechanismService(
	config *config.Configuration,
	logger *slog.Logger,
	dmutex distributedmutex.Adapter,
	client *mongo.Client,
	s1 *GetProofOfAuthorityPrivateKeyService,
	uc1 *uc_mempooltx.MempoolTransactionInsertionDetectorUseCase,
	uc2 *uc_mempooltx.MempoolTransactionDeleteByIDUseCase,
	uc3 uc_blockchainstate.GetBlockchainStateUseCase,
	uc4 uc_blockchainstate.UpsertBlockchainStateUseCase,
	uc5 uc_genesisblockdata.GetGenesisBlockDataUseCase,
	uc6 uc_blockdata.GetBlockDataUseCase,
	uc7 uc_account.GetAccountUseCase,
	uc8 uc_account.GetAccountsHashStateUseCase,
	uc9 uc_account.UpsertAccountUseCase,
	uc10 *uc_token.GetTokenUseCase,
	uc11 *uc_token.GetTokensHashStateUseCase,
	uc12 *uc_token.UpsertTokenIfPreviousTokenNonceGTEUseCase,
	uc13 *uc_pow.ProofOfWorkUseCase,
	uc14 uc_blockdata.UpsertBlockDataUseCase,
	uc15 uc_blockchainstate.BlockchainStatePublishUseCase,
) *ProofOfAuthorityConsensusMechanismService {
	return &ProofOfAuthorityConsensusMechanismService{config, logger, dmutex, client, s1, uc1, uc2, uc3, uc4, uc5, uc6, uc7, uc8, uc9, uc10, uc11, uc12, uc13, uc14, uc15}
}

func (s *ProofOfAuthorityConsensusMechanismService) Execute(ctx context.Context) error {
	// Protect our resource - this PoA consensus mechanism can only exist as
	// a single instance any time. So if we have more then one authority nodes
	// running on the network, coordinate view the distributed mutext, that
	// only a single authority node can run the authority mechanism at a time.
	s.dmutex.Acquire(ctx, "ProofOfAuthorityConsensusMechanism")
	defer s.dmutex.Release(ctx, "ProofOfAuthorityConsensusMechanism")

	//
	// STEP 1: Wait to receive new data...
	//

	s.logger.Debug("Memory pool waiting to receive transactions...")
	mempoolTx, err := s.mempoolTransactionInsertionDetectorUseCase.Execute(ctx)
	if err != nil {
		s.logger.Error("Failed detecting insertion changes.",
			slog.Any("error", err))
		return err
	}
	s.logger.Debug("New memory pool transaction detected!",
		slog.Any("chain_id", mempoolTx.ChainID),
		slog.Any("nonce", mempoolTx.GetNonce()),
		slog.Any("from", mempoolTx.From),
		slog.Any("to", mempoolTx.To),
		slog.Any("value", mempoolTx.Value),
		slog.Any("data", mempoolTx.Data),
		slog.Any("type", mempoolTx.Type),
		slog.Any("token_id", mempoolTx.GetTokenID()),
		slog.Any("token_metadata_uri", mempoolTx.TokenMetadataURI),
		slog.Any("token_nonce", mempoolTx.GetTokenNonce()),
		// slog.Any("tx_sig_v_bytes", mempoolTx.VBytes),
		// slog.Any("tx_sig_r_bytes", mempoolTx.RBytes),
		// slog.Any("tx_sig_s_bytes", mempoolTx.SBytes)
	)

	if mempoolTx.VBytes == nil {
		err := fmt.Errorf("Missing: %v", "v_bytes")
		s.logger.Error("Failed validating memory pool transaction",
			slog.Any("error", err))
		return err
	}
	if mempoolTx.RBytes == nil {
		err := fmt.Errorf("Missing: %v", "r_bytes")
		s.logger.Error("Failed validating memory pool transaction",
			slog.Any("error", err))
		return err
	}
	if mempoolTx.SBytes == nil {
		err := fmt.Errorf("Missing: %v", "s_bytes")
		s.logger.Error("Failed validating memory pool transaction",
			slog.Any("error", err))
		return err
	}
	if mempoolTx.SignedTransaction.Transaction.Data != nil {
		if len(mempoolTx.SignedTransaction.Transaction.Data) > 16384 {
			s.logger.Error("Data is too large.",
				slog.Any("data", mempoolTx.SignedTransaction.Transaction.Data),
				slog.Any("length", len(mempoolTx.SignedTransaction.Transaction.Data)),
			)
			return fmt.Errorf("Data is too large")
		}
	}

	//
	// STEP 2:
	// Start a transaction so we can discard all changes made to the database in
	// this function if an error occurs.
	//

	session, err := s.dbClient.StartSession()
	if err != nil {
		s.logger.Error("start session error",
			slog.Any("error", err))
		log.Fatalf("Failed executing: %v\n", err)
	}
	defer session.EndSession(ctx)

	// Define a transaction function with a series of operations
	transactionFunc := func(sessCtx mongo.SessionContext) (interface{}, error) {
		s.logger.Debug("Transaction started")

		//
		// STEP 3:
		// Fetch related records.
		//

		blockchainState, err := s.getBlockchainStateUseCase.Execute(sessCtx, s.config.Blockchain.ChainID)
		if err != nil {
			s.logger.Error("Failed getting blockchain state.",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}
		if blockchainState == nil {
			s.logger.Error("Blockchain state does not exist.")
			sessCtx.AbortTransaction(ctx)
			return nil, fmt.Errorf("Blockchain state does not exist")
		}

		genesis, err := s.getGenesisBlockDataUseCase.Execute(sessCtx, s.config.Blockchain.ChainID)
		if err != nil {
			s.logger.Error("Failed getting genesis block.",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}
		if genesis == nil {
			s.logger.Error("Genesis block does not exist.")
			sessCtx.AbortTransaction(ctx)
			return nil, fmt.Errorf("Genesis block does not exist")
		}

		proofOfAuthorityPrivateKey, err := s.getProofOfAuthorityPrivateKeyService.Execute(sessCtx)
		if err != nil {
			s.logger.Error("Failed getting proof of authority private key.",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}
		if proofOfAuthorityPrivateKey == nil {
			s.logger.Error("Proof of authority private keydoes not exist.")
			sessCtx.AbortTransaction(ctx)
			return nil, fmt.Errorf("Proof of authority private keydoes not exist")
		}

		proofOfAuthorityAccount, err := s.getAccountUseCase.Execute(ctx, s.config.Blockchain.ProofOfAuthorityAccountAddress)
		if err != nil {
			s.logger.Error("Failed getting proof of authority account.",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}
		if proofOfAuthorityAccount == nil {
			s.logger.Error("Proof of authority account does not exist")
			sessCtx.AbortTransaction(ctx)
			return nil, fmt.Errorf("Proof of authority account does not exist")
		}

		recentBlockData, err := s.getBlockDataUseCase.ExecuteByHash(sessCtx, blockchainState.LatestHash)
		if err != nil {
			s.logger.Error("Failed getting latest block block.",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}
		if recentBlockData == nil {
			s.logger.Error("Latest block data does not exist.")
			sessCtx.AbortTransaction(ctx)
			return nil, fmt.Errorf("Latest block data does not exist")
		}

		// We want to attach on-chain our identity.
		poaValidator := recentBlockData.Validator

		// Variable used to create the transactions to store on the blockchain.
		trans := make([]domain.BlockTransaction, 0)

		//
		// STEP 4:
		// Verify the transaction.
		//
		if err := s.verifyMempoolTransaction(sessCtx, mempoolTx); err != nil {
			s.logger.Error("Failed verifying the mempool block transaction",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}

		//
		// STEP 6:
		// Process 🪙 coin value
		//

		if mempoolTx.Type == domain.TransactionTypeCoin {
			if err := s.processAccountForCoinMempoolTransaction(sessCtx, mempoolTx); err != nil {
				s.logger.Error("Failed processing account in pending block transaction",
					slog.Any("error", err))
				sessCtx.AbortTransaction(ctx)
				return nil, err
			}
		}

		//
		// STEP 7:
		// Process 🎟️ tokens.
		//

		latestTokenID := blockchainState.GetLatestTokenID()
		if mempoolTx.Type == domain.TransactionTypeToken {
			if err := s.processAccountForTokenMempoolTransaction(sessCtx, mempoolTx, blockchainState); err != nil {
				s.logger.Error("Failed processing token in mempool block transaction",
					slog.Any("error", err))
				sessCtx.AbortTransaction(ctx)
				return nil, err
			}

			// New `token_id` set in our blockchain state.
			latestTokenID = mempoolTx.SignedTransaction.Transaction.GetTokenID()

			s.logger.Debug("New token detected",
				slog.Any("latest_token_id", latestTokenID))
		}

		// Create our block.
		blockTx := domain.BlockTransaction{
			SignedTransaction: mempoolTx.SignedTransaction,
			TimeStamp:         uint64(time.Now().UTC().UnixMilli()),
			Fee:               s.config.Blockchain.TransactionFee, // This is the fee that is applied by the authority to subtract from the value of the this transaction.
		}
		trans = append(trans, blockTx)

		// Construct a merkle tree from the transaction for this block. The root
		// of this tree will be part of the block to be mined.
		tree, err := merkle.NewTree(trans)
		if err != nil {
			s.logger.Error("Failed creating merkle tree",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}

		// // Query the local database and get the most recent token ID.
		// latestToken, err := s.getTokenUseCase.Execute(sessCtx, blockchainState.LatestTokenID)
		// if err != nil {
		// 	s.logger.Error("Failed getting blockchains latest token id",
		// 		slog.Any("error", err))
		// 	return nil, err
		// }

		// Iterate through all the accounts from this local machine, sort them and
		// then hash all of them - this hash represents our `stateRoot` which is
		// in essence a snapshot of the current accounts and their balances. Why is
		// this important?
		//
		// At the start of creating a new block to be mined, a hash of this map is
		// created and stored in the block under the StateRoot field. This allows
		// each node to validate the current state of the peer’s accounts database
		// as part of block validation.
		//
		// It’s critically important that the order of the account balances are
		// exact when hashing the data. The Go spec does not define the order of
		// map iteration and leaves it up to the compiler. Since Go 1.0,
		// the compiler has chosen to have map iteration be random. This function
		//  sorts the accounts and their balances into a slice first and then
		// performs a hash of that slice.
		//
		// When a new block is received, the node can take a hash of their current
		// accounts database and match that to the StateRoot field in the
		// block header. If these hash values don’t match, then there is fraud
		//  going on by the peer and their block would be rejected.	//
		//
		// SPECIAL THANKS TO:
		// https://www.ardanlabs.com/blog/2022/05/blockchain-04-fraud-detection.html
		//
		stateRoot, err := s.getAccountsHashStateUseCase.Execute(sessCtx, s.config.Blockchain.ChainID)
		if err != nil {
			s.logger.Error("Failed getting accounts hash state",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}

		// Ensure tokens are not tampered with.
		tokensRoot, err := s.getTokensHashStateUseCase.Execute(sessCtx, s.config.Blockchain.ChainID)
		if err != nil {
			s.logger.Error("Failed getting tokens hash state",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}

		blockNumber := recentBlockData.Header.GetNumber()
		newBlockNumber := blockNumber.Add(blockNumber, big.NewInt(1))

		// Construct the block.
		block := domain.Block{
			Header: &domain.BlockHeader{
				ChainID:            s.config.Blockchain.ChainID,
				NumberBytes:        newBlockNumber.Bytes(),
				PrevBlockHash:      string(blockchainState.LatestHash),
				TimeStamp:          uint64(time.Now().UTC().UnixMilli()),
				Difficulty:         s.config.Blockchain.Difficulty,
				Beneficiary:        *s.config.Blockchain.ProofOfAuthorityAccountAddress,
				TransactionFee:     s.config.Blockchain.TransactionFee, // This is what is applied by the authority.
				StateRoot:          stateRoot,
				TransRoot:          tree.RootHex(),        //
				NonceBytes:         big.NewInt(0).Bytes(), // Will be identified by the PoW algorithm.
				LatestTokenIDBytes: latestTokenID.Bytes(), // Ensure our blockchain state has always the latest token ID recorded.
				TokensRoot:         tokensRoot,
			},
			HeaderSignatureBytes: []byte{}, // Will be identified by the PoA algorithm in this function!
			MerkleTree:           tree,
		}

		//
		// STEP 8:
		// Execute the proof of work to find our nonce to meet the hash difficulty.
		//

		nonce, powErr := s.proofOfWorkUseCase.Execute(sessCtx, &block, s.config.Blockchain.Difficulty)
		if powErr != nil {
			s.logger.Error("Failed to mine block header",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}

		block.Header.NonceBytes = nonce.Bytes()

		// Convert into saving for our database and transmitting over network.
		blockData := domain.NewBlockData(block)

		//
		// STEP 9:
		// Our proof-of-authority signs this block data's header.
		//

		coinbasePrivateKey := proofOfAuthorityPrivateKey
		blockDataHeaderSignatureBytes, err := poaValidator.Sign(coinbasePrivateKey, blockData.Header)
		if err != nil {
			s.logger.Error("Failed to sign block header",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}
		blockData.HeaderSignatureBytes = blockDataHeaderSignatureBytes
		blockData.Validator = poaValidator

		s.logger.Info("Authority consensus mechanism completed",
			slog.String("hash", blockData.Hash),
			slog.Any("block_number", blockData.Header.GetNumber()),
			slog.String("prev_block_hash", blockData.Header.PrevBlockHash),
			// slog.Uint64("timestamp", blockData.Header.TimeStamp),
			// slog.String("beneficiary", blockData.Header.Beneficiary.String()),
			// slog.Uint64("difficulty", uint64(blockData.Header.Difficulty)),
			// slog.Uint64("mining_reward", blockData.Header.MiningReward),
			slog.String("state_root", blockData.Header.StateRoot),
			slog.String("trans_root", blockData.Header.TransRoot),
			// slog.Uint64("nonce", blockData.Header.Nonce),
			// slog.Uint64("latest_token_id", blockData.Header.LatestTokenID),
			// slog.Any("trans", blockData.Trans),
			// slog.Any("header_signature_bytes", blockData.HeaderSignatureBytes))
		)

		//
		// STEP 10:
		// Delete mempool data as it has already been processed.
		//

		if err := s.mempoolTransactionDeleteByIDUseCase.Execute(sessCtx, mempoolTx.ID); err != nil {
			s.logger.Error("Failed deleting all pending block transactions",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}

		//
		// STEP 11:
		// Save to (local) blockchain database
		//

		if err := s.upsertBlockDataUseCase.Execute(sessCtx, blockData.Hash, blockData.Header, blockData.HeaderSignatureBytes, blockData.Trans, blockData.Validator); err != nil {
			s.logger.Error("Authority failed saving block data",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}

		s.logger.Info("Authority added new block to blockchain",
			slog.Any("hash", blockData.Hash),
			slog.Any("block_number", blockData.Header.GetNumber()),
			slog.String("state_root", blockData.Header.StateRoot),
			slog.Any("previous_hash", blockData.Header.PrevBlockHash),
			slog.Any("previous_block_number", recentBlockData.Header.GetNumber()),
			slog.String("previous_state_root", recentBlockData.Header.StateRoot),
		)

		blockchainState.LatestBlockNumberBytes = blockData.Header.NumberBytes
		blockchainState.LatestHash = blockData.Hash
		blockchainState.LatestTokenIDBytes = latestTokenID.Bytes()
		blockchainState.TransactionFee = s.config.Blockchain.TransactionFee // This is what is applied by the authority.
		if err := s.upsertBlockchainStateUseCase.Execute(sessCtx, blockchainState); err != nil {
			s.logger.Error("Failed upserting blockchain state",
				slog.Any("error", err))
			sessCtx.AbortTransaction(ctx)
			return nil, err
		}

		s.logger.Info("Blockchain state changed by Authority",
			slog.Any("latest_hash", blockchainState.LatestHash),
			slog.Any("latest_token_id", blockchainState.GetLatestTokenID()),
			slog.Any("transaction_fee", blockchainState.TransactionFee),
		)

		// DEVELOPERS NOTE:
		// In case we failed to publish, attempt 3 retries and then finally
		// terminate with error.
		s.logger.Debug("Publishing to redis....")
		retryCount := 0
		var redisErr error
		delay := time.Duration(500 * time.Millisecond) // initial delay: 0.5 seconds
		maxDelay := time.Second * 30                   // maximum delay: 30 seconds
		for retryCount < 4 {
			if redisErr = s.blockchainStatePublishUseCase.Execute(sessCtx, blockchainState); redisErr == nil {
				break
			}
			s.logger.Warn("Failed publish to redis",
				slog.Any("error", redisErr))
			retryCount++
			time.Sleep(delay)
			delay = time.Duration(min(float64(delay)*2, float64(maxDelay))) // exponential backoff
		}
		if redisErr != nil {
			s.logger.Error("Failed publish to redis after retries",
				slog.Any("error", redisErr))
			sessCtx.AbortTransaction(ctx)
			return nil, redisErr
		}

		s.logger.Debug("Committing transaction...")
		if err := sessCtx.CommitTransaction(ctx); err != nil {
			s.logger.Error("Failed comming transaction",
				slog.Any("error", err))
			return nil, err
		}
		s.logger.Debug("Transaction committed")
		return nil, nil
	}

	// Start a transaction
	if _, err := session.WithTransaction(ctx, transactionFunc); err != nil {
		s.logger.Error("session failed error",
			slog.Any("error", err))
		log.Fatalf("Failed creating account: %v\n", err)
	}
	return nil
}

func (s *ProofOfAuthorityConsensusMechanismService) verifyMempoolTransaction(sessCtx mongo.SessionContext, mempoolTx *domain.MempoolTransaction) error {
	s.logger.Debug("Preparing to verify",
		slog.Any("chain_id", mempoolTx.ChainID),
		slog.Any("nonce", mempoolTx.GetNonce()),
		slog.Any("from", mempoolTx.From),
		slog.Any("to", mempoolTx.To),
		slog.Any("value", mempoolTx.Value),
		slog.Any("data", mempoolTx.Data),
		slog.Any("type", mempoolTx.Type),
		slog.Any("token_id", mempoolTx.GetTokenID()),
		slog.Any("token_metadata_uri", mempoolTx.TokenMetadataURI),
		slog.Any("token_nonce", mempoolTx.GetTokenNonce()),
		// slog.Any("tx_sig_v_bytes", mempoolTx.VBytes),
		// slog.Any("tx_sig_r_bytes", mempoolTx.RBytes),
		// slog.Any("tx_sig_s_bytes", mempoolTx.SBytes)
	)

	pk, err := mempoolTx.FromPublicKey()
	if err != nil {
		s.logger.Error("Failed getting from pk",
			slog.Any("chain_id", s.config.Blockchain.ChainID),
			slog.Any("error", err))
		return err
	}
	s.logger.Debug("Preparing to verify",
		slog.Any("pk", pk))

	fromAddr, err := mempoolTx.FromAddress()
	if err != nil {
		s.logger.Error("Failed getting from address",
			slog.Any("chain_id", s.config.Blockchain.ChainID),
			slog.Any("error", err))
		return err
	}

	// STEP 1: Verify that the signature is correct.
	if err := mempoolTx.Validate(s.config.Blockchain.ChainID, true); err != nil {
		s.logger.Error("Failed validating pending block transaction.",
			slog.Any("from_via_sig", fromAddr),
			slog.Any("chain_id", mempoolTx.ChainID),
			slog.Any("nonce", mempoolTx.GetNonce()),
			slog.Any("from", mempoolTx.From),
			slog.Any("to", mempoolTx.To),
			slog.Any("value", mempoolTx.Value),
			slog.Any("data", mempoolTx.Data),
			slog.Any("type", mempoolTx.Type),
			slog.Any("token_id", mempoolTx.GetTokenID()),
			slog.Any("token_metadata_uri", mempoolTx.TokenMetadataURI),
			slog.Any("token_nonce", mempoolTx.GetTokenNonce()),
			slog.Any("tx_sig_v_bytes", mempoolTx.VBytes),
			slog.Any("tx_sig_r_bytes", mempoolTx.RBytes),
			slog.Any("tx_sig_s_bytes", mempoolTx.SBytes),
			slog.Any("error", err))
		return err
	}

	// STEP 2: Verify account exists in our database.
	account, err := s.getAccountUseCase.Execute(sessCtx, mempoolTx.From)
	if err != nil {
		s.logger.Error("Failed getting account.",
			slog.Any("chain_id", s.config.Blockchain.ChainID),
			slog.Any("error", err))
		return err
	}
	if account == nil {
		err := fmt.Errorf("Failed validating account: d.n.e. for: %v", mempoolTx.From)
		s.logger.Error("Failed validating account",
			slog.Any("chain_id", s.config.Blockchain.ChainID),
			slog.Any("error", err))
		return err
	}

	// STEP 3: Verify account has enough 🪙 coins
	// If the account is sending, then we need to verify the user has
	// enough coins in the balance.
	if mempoolTx.Value > account.Balance {
		err := fmt.Errorf("Insufficient balance in account: Have currently %v in account but transaction is requesting %v", account.Balance, mempoolTx.Value)
		s.logger.Error("Failed validating account",
			slog.Any("chain_id", s.config.Blockchain.ChainID),
			slog.Any("value", mempoolTx.Value),
			slog.Any("error", err))
		return err
	}

	// STEP 4: Verify account belongs to 🎟️ token (if tx is token-based)
	if mempoolTx.Type == domain.TransactionTypeToken {
		// Get the token for the particular token ID.
		token, err := s.getTokenUseCase.Execute(sessCtx, mempoolTx.GetTokenID())
		if err != nil {
			s.logger.Error("failed getting token",
				slog.Any("error", err))
			return fmt.Errorf("failed getting token: %s", err)
		}

		// Defensive code.
		if token == nil {
			// Do nothing! This means it hasn't been created yet, meaning
			// it was just minted! So in that case all we have to do is skip
			// this function and this token will be created later on.
			return nil
			// s.logger.Warn("failed getting token",
			// 	slog.Any("token_id", mempoolTx.TokenID),
			// 	slog.Any("error", "token does not exist"))
			// return fmt.Errorf("failed getting token: does not exist for ID: %v", mempoolTx.TokenID)
		}

		// Verify the account owns the token
		if account.Address.Hex() != token.Owner.Hex() {
			s.logger.Warn("permission failed")
			return fmt.Errorf("permission denied: token address is %v but your address is %v", token.Owner.Hex(), account.Address.Hex())
		}
	}

	return nil
}

func (s *ProofOfAuthorityConsensusMechanismService) processAccountForCoinMempoolTransaction(
	sessCtx mongo.SessionContext,
	mempoolTx *domain.MempoolTransaction,
) error {
	//
	// STEP 1
	// Subtract the value the from the sender's account balance.
	//

	if mempoolTx.From != nil {
		// DEVELOPERS NOTE:
		// We already *should* have a `From` account in our database, so we can
		acc, _ := s.getAccountUseCase.Execute(sessCtx, mempoolTx.From)
		if acc == nil {
			s.logger.Error("The `From` account does not exist in our database.",
				slog.Any("hash", mempoolTx.From))
			return fmt.Errorf("The `From` account does not exist in our database for hash: %v", mempoolTx.From.String())
		}
		acc.Balance -= mempoolTx.Value

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

	//
	// STEP 3:
	// Depost the coins into the receipents account.
	//

	if mempoolTx.To != nil {
		// Variable holds the value of coins to transfer to the account after
		// the transaction fee was collected.
		var valueMinusFees uint64 = mempoolTx.Value - s.config.Blockchain.TransactionFee

		// DEVELOPERS NOTE:
		// It is perfectly normal that our account would possibly not exist
		// so we would need to create a new Account record in our database.
		acc, _ := s.getAccountUseCase.Execute(sessCtx, mempoolTx.To)
		if acc == nil {
			acc = &domain.Account{
				Address: mempoolTx.To,

				// Always start by zero, increment by 1 after mining successful.
				NonceBytes: big.NewInt(0).Bytes(),

				Balance: valueMinusFees,
			}
		} else {
			acc.Balance += valueMinusFees

			// Note: We do this to prevent reply attacks. (See notes in either `domain/accounts.go` or `service/genesis_init.go`)
			accNonce := acc.GetNonce()
			accNonce.Add(accNonce, big.NewInt(1))
			acc.NonceBytes = accNonce.Bytes()
		}

		if err := s.upsertAccountUseCase.Execute(sessCtx, acc.Address, acc.Balance, acc.GetNonce()); err != nil {
			s.logger.Error("Failed upserting account.",
				slog.Any("error", err))
			return err
		}
	}

	//
	// STEP 4:
	// Deposit the transaction fee back to the coinbase to be recirculated.
	//

	proofOfAuthorityAccount, err := s.getAccountUseCase.Execute(sessCtx, s.config.Blockchain.ProofOfAuthorityAccountAddress)
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
	proofOfAuthorityAccount.Balance += s.config.Blockchain.TransactionFee

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
		slog.Any("collected_fee", s.config.Blockchain.TransactionFee),
		slog.Any("new_balance", proofOfAuthorityAccount.Balance),
	)

	return nil
}

func (s *ProofOfAuthorityConsensusMechanismService) processAccountForTokenMempoolTransaction(
	sessCtx mongo.SessionContext,
	mempoolTx *domain.MempoolTransaction,
	blockchainState *domain.BlockchainState,
) error {
	//
	// STEP 1:
	// Check to see if we have an account for this particular token and
	// collect the transaction fee.
	//

	if mempoolTx.From != nil {
		// DEVELOPERS NOTE:
		// We already *should* have a `From` account in our database, so we can
		acc, _ := s.getAccountUseCase.Execute(sessCtx, mempoolTx.From)
		if acc == nil {
			s.logger.Error("The `From` account does not exist in our database.",
				slog.Any("hash", mempoolTx.From))
			return fmt.Errorf("The `From` account does not exist in our database for hash: %v", mempoolTx.From.String())
		}

		acc.Balance -= mempoolTx.Value // Note: The value is equal to the transaction fee.

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

	//
	// STEP 2:
	// Check to see if we have an account for this particular token, if not
	// then create it.  Do thise from the `To` side of the transaction.
	//

	if mempoolTx.To != nil {
		acc, _ := s.getAccountUseCase.Execute(sessCtx, mempoolTx.To)
		if acc == nil {
			acc = &domain.Account{
				Address:    mempoolTx.To,
				NonceBytes: big.NewInt(0).Bytes(), // Always start by zero, increment by 1 after mining successful.
				Balance:    0,
			}
			if err := s.upsertAccountUseCase.Execute(sessCtx, acc.Address, acc.Balance, acc.GetNonce()); err != nil {
				s.logger.Error("Failed upserting account.",
					slog.Any("error", err))
				return err
			}
		}
	}

	//
	// STEP 3:
	// Deposit the transaction fee back to the coinbase to be recirculated.
	//

	proofOfAuthorityAccount, err := s.getAccountUseCase.Execute(sessCtx, s.config.Blockchain.ProofOfAuthorityAccountAddress)
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
	proofOfAuthorityAccount.Balance += mempoolTx.Value // Note: The value is equal to the transaction fee.

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
		slog.Any("collected_fee", s.config.Blockchain.TransactionFee),
		slog.Any("new_balance", proofOfAuthorityAccount.Balance),
	)

	//
	// STEP 4:
	//

	// Save our token to the local database ONLY if this transaction
	// is the most recent one. We track "most recent" transaction by
	// the nonce value in the token.
	upsertErr := s.upsertTokenIfPreviousTokenNonceGTEUseCase.Execute(
		sessCtx,
		mempoolTx.GetTokenID(),
		mempoolTx.To,
		mempoolTx.TokenMetadataURI,
		mempoolTx.GetTokenNonce())
	if upsertErr != nil {
		s.logger.Error("Failed upserting (if previous token nonce GTE then current)",
			slog.Any("error", upsertErr))
		return upsertErr
	}

	// DEVELOPERS NOTE:
	// This code will execute when we mint new tokens, it will not execute if
	// we are `transfering` or `burning` a token since no new token IDs are
	// created.
	if blockchainState.GetLatestTokenID().Cmp(mempoolTx.GetTokenID()) > 0 {
		blockchainState.LatestTokenIDBytes = mempoolTx.TokenIDBytes
		if err := s.upsertBlockchainStateUseCase.Execute(sessCtx, blockchainState); err != nil {
			s.logger.Error("validator failed saving latest hash",
				slog.Any("error", err))
			return err
		}
	}

	return nil
}
