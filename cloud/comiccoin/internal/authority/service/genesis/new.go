package genesis

import (
	"crypto/ecdsa"
	"errors"
	"fmt"
	"log/slog"
	"math"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/crypto"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/merkle"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/signature"

	// "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	sv_poa "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/poa"
	uc_account "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/account"
	uc_blockchainstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockchainstate"
	uc_blockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/blockdata"
	uc_genesisblockdata "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/genesisblockdata"
	uc_pow "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/pow"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/token"
)

type CreateGenesisBlockDataService interface {
	Execute(sessCtx mongo.SessionContext) (*domain.BlockchainState, error)
}

type createGenesisBlockDataServiceImpl struct {
	config                                    *config.Configuration
	logger                                    *slog.Logger
	getProofOfAuthorityPrivateKeyService      sv_poa.GetProofOfAuthorityPrivateKeyService
	getAccountUseCase                         uc_account.GetAccountUseCase
	upsertAccountUseCase                      uc_account.UpsertAccountUseCase
	upsertTokenIfPreviousTokenNonceGTEUseCase uc_token.UpsertTokenIfPreviousTokenNonceGTEUseCase
	getAccountsHashStateUseCase               uc_account.GetAccountsHashStateUseCase
	getTokensHashStateUseCase                 uc_token.GetTokensHashStateUseCase
	proofOfWorkUseCase                        uc_pow.ProofOfWorkUseCase
	upsertGenesisBlockDataUseCase             uc_genesisblockdata.UpsertGenesisBlockDataUseCase
	upsertBlockDataUseCase                    uc_blockdata.UpsertBlockDataUseCase
	upsertBlockchainStateUseCase              uc_blockchainstate.UpsertBlockchainStateUseCase
	getBlockchainStateUseCase                 uc_blockchainstate.GetBlockchainStateUseCase
}

func NewCreateGenesisBlockDataService(
	config *config.Configuration,
	logger *slog.Logger,
	s1 sv_poa.GetProofOfAuthorityPrivateKeyService,
	uc1 uc_account.GetAccountUseCase,
	uc2 uc_account.UpsertAccountUseCase,
	uc3 uc_token.UpsertTokenIfPreviousTokenNonceGTEUseCase,
	uc4 uc_account.GetAccountsHashStateUseCase,
	uc5 uc_token.GetTokensHashStateUseCase,
	uc6 uc_pow.ProofOfWorkUseCase,
	uc7 uc_genesisblockdata.UpsertGenesisBlockDataUseCase,
	uc8 uc_blockdata.UpsertBlockDataUseCase,
	uc9 uc_blockchainstate.UpsertBlockchainStateUseCase,
	uc10 uc_blockchainstate.GetBlockchainStateUseCase,
) CreateGenesisBlockDataService {
	return &createGenesisBlockDataServiceImpl{config, logger, s1, uc1, uc2, uc3, uc4, uc5, uc6, uc7, uc8, uc9, uc10}
}

func (s *createGenesisBlockDataServiceImpl) Execute(sessCtx mongo.SessionContext) (*domain.BlockchainState, error) {
	s.logger.Debug("starting genesis creation service...")

	//
	// STEP 1:
	// Get our coinbase account and private key.
	//

	coinbasePrivateKey, err := s.getProofOfAuthorityPrivateKeyService.Execute(sessCtx)
	if err != nil {
		s.logger.Error("Failed getting proof of authority private key", slog.Any("error", err))
		return nil, err
	}
	account, err := s.getAccountUseCase.Execute(sessCtx, s.config.Blockchain.ProofOfAuthorityAccountAddress)
	if err != nil {
		s.logger.Error("Failed getting proof of authority account", slog.Any("error", err))
		return nil, err
	}

	//
	// STEP 2:
	// Set coinbase with all the coins.
	//

	s.logger.Debug("starting genesis creation service...")

	// DEVELOPERS NOTE:
	// Here is where we initialize the total supply of coins for the entire
	// blockchain, so adjust accordingly. We will set the maximum value possible
	// for the unsigned 64-bit integer in a computer. That's a big number!
	initialSupply := uint64(math.MaxInt64) // Note: 9223372036854775807

	// DEVELOPERS NOTE:
	// Also here are some additional notes on the order of magnitude for powers
	// of 10:
	// 10^0 = 1
	// 10^3 = thousand
	// 10^6 = million
	// 10^9 = billion
	// 10^12 = trillion
	// 10^15 = quadrillion
	// 10^18 = quintillion
	// 10^21 = sextillion
	// 10^24 = septillion

	//
	// STEP 3
	// Initialize our coinbase account in our in-memory database.
	//

	// DEVELOPERS NOTE:
	// During genesis block creation, the account's nonce value is indeed 0.
	//
	// After the genesis block is mined, the account's nonce value is
	// incremented to 1.
	//
	// This makes sense because the genesis block is the first block in the
	// blockchain, and the account's nonce value is used to track the number of
	// transactions sent from that account.
	//
	// Since the genesis block is the first transaction sent from the account,
	// the nonce value is incremented from 0 to 1 after the block is mined.
	//
	// Here's a step-by-step breakdown:
	//
	// 1. Genesis block creation:
	// --> Account's nonce value is 0.
	// 2. Genesis block mining:
	// --> Account's nonce value is still 0.
	// 3. Genesis block is added to the blockchain:
	// --> Account's nonce value is now 1.
	//
	// From this point on, every time a transaction is sent from the account, the nonce value is incremented by 1.

	if err := s.upsertAccountUseCase.Execute(sessCtx, account.Address, initialSupply, big.NewInt(0)); err != nil {
		s.logger.Error("Failed upserting account", slog.Any("error", err))
		return nil, err
	}

	//
	// STEP 4:
	// Setup our very first (signed) transaction: i.e. coinbase giving coins
	// onto the blockchain ... from nothing.
	//

	coinTx := &domain.Transaction{
		ChainID:    s.config.Blockchain.ChainID,
		NonceBytes: big.NewInt(0).Bytes(), // Will be calculated later.
		From:       account.Address,
		To:         account.Address,
		Value:      initialSupply,
		Data:       make([]byte, 0),
		Type:       domain.TransactionTypeCoin,
	}
	signedCoinTx, err := coinTx.Sign(coinbasePrivateKey)
	if err != nil {
		s.logger.Error("Failed signing coin transaction", slog.Any("error", err))
		return nil, err
	}

	//
	// STEP 5:
	// Setup our very first (signed) token transaction.
	//

	tokenTx := &domain.Transaction{
		ChainID:          s.config.Blockchain.ChainID,
		NonceBytes:       big.NewInt(0).Bytes(), // Will be calculated later.
		From:             account.Address,
		To:               account.Address,
		Value:            0, //Note: Tokens don't have coin value.
		Data:             make([]byte, 0),
		Type:             domain.TransactionTypeToken,
		TokenIDBytes:     big.NewInt(0).Bytes(), // The very first token in our entire blockchain starts at the value of zero.
		TokenMetadataURI: "https://cpscapsule.com/comiccoin/tokens/0/metadata.json",
		TokenNonceBytes:  big.NewInt(0).Bytes(), // Newly minted tokens always have their nonce start at value of zero.
	}
	signedTokenTx, err := tokenTx.Sign(coinbasePrivateKey)
	if err != nil {
		s.logger.Error("Failed signing token transaction", slog.Any("error", err))
		return nil, err
	}

	nftFromAddr, err := signedTokenTx.FromAddress()
	if err != nil {
		s.logger.Error("Failed getting from address",
			slog.Any("chain_id", s.config.Blockchain.ChainID),
			slog.Any("error", err))
		return nil, err
	}

	s.logger.Info("Created first token",
		slog.Any("from", signedTokenTx.From),
		slog.Any("from_via_sig", nftFromAddr),
		slog.Any("to", signedTokenTx.To),
		slog.Any("tx_sig_v_bytes", signedTokenTx.VBytes),
		slog.Any("tx_sig_r_bytes", signedTokenTx.RBytes),
		slog.Any("tx_sig_s_bytes", signedTokenTx.SBytes),
		slog.Any("tx_token_id", signedTokenTx.GetTokenID()))

	// Defensive code: Run this code to ensure this transaction is
	// properly structured for our blockchain.
	if err := signedTokenTx.Validate(s.config.Blockchain.ChainID, true); err != nil {
		s.logger.Error("Failed token transaction.",
			slog.Any("error", err))
		return nil, err
	}

	//
	// STEP 6:
	// Save our token to our database.
	//

	if err := s.upsertTokenIfPreviousTokenNonceGTEUseCase.Execute(sessCtx, tokenTx.GetTokenID(), tokenTx.To, tokenTx.TokenMetadataURI, tokenTx.GetTokenNonce()); err != nil {
		return nil, err
	}

	//
	// STEP 5:
	// Create our first block, i.e. also called "Genesis block".
	//

	// Note: Genesis block has no previous hash
	prevBlockHash := signature.ZeroHash

	coinBlockTx := domain.BlockTransaction{
		SignedTransaction: signedCoinTx,
		TimeStamp:         uint64(time.Now().UTC().UnixMilli()),
		Fee:               0, // Genesis block doesn't have a fee!
	}
	tokenBlockTx := domain.BlockTransaction{
		SignedTransaction: signedTokenTx,
		TimeStamp:         uint64(time.Now().UTC().UnixMilli()),
		Fee:               0, // Genesis block doesn't have a fee!
	}
	trans := make([]domain.BlockTransaction, 0)
	trans = append(trans, coinBlockTx)
	trans = append(trans, tokenBlockTx)

	// Construct a merkle tree from the transaction for this block. The root
	// of this tree will be part of the block to be mined.
	tree, err := merkle.NewTree(trans)
	if err != nil {
		return nil, fmt.Errorf("Failed to create merkle tree: %v", err)
	}

	stateRoot, err := s.getAccountsHashStateUseCase.Execute(sessCtx, s.config.Blockchain.ChainID)
	if err != nil {
		s.logger.Error("Failed to get hash of all accounts",
			slog.Any("error", err))
		return nil, fmt.Errorf("Failed to get hash of all accounts: %v", err)
	}

	// Running this code get's a hash of all the tokens, thus making the
	// tokens tamper proof.
	tokensRoot, err := s.getTokensHashStateUseCase.Execute(sessCtx, s.config.Blockchain.ChainID)
	if err != nil {
		s.logger.Error("Failed to get hash of all tokens",
			slog.Any("error", err))
		return nil, fmt.Errorf("Failed to get hash of all tokens: %v", err)
	}

	// Construct the genesis block.
	block := domain.Block{
		Header: &domain.BlockHeader{
			ChainID:            uint16(s.config.Blockchain.ChainID),
			NumberBytes:        big.NewInt(0).Bytes(), // Genesis always starts at zero
			PrevBlockHash:      prevBlockHash,
			TimeStamp:          uint64(time.Now().UTC().UnixMilli()),
			Difficulty:         s.config.Blockchain.Difficulty,
			Beneficiary:        *account.Address,
			TransactionFee:     s.config.Blockchain.TransactionFee, // This is what is applied by the authority.
			StateRoot:          stateRoot,
			TransRoot:          tree.RootHex(),        //
			NonceBytes:         big.NewInt(0).Bytes(), // Will be identified by the POW algorithm.
			LatestTokenIDBytes: big.NewInt(0).Bytes(), // ComicCoin: Token ID values start at zero.
			TokensRoot:         tokensRoot,
		},
		MerkleTree: tree,
	}

	genesisBlockData := domain.NewBlockData(block)

	//
	// STEP 6:
	// Execute the proof of work to find our nounce to meet the hash difficulty.
	//

	nonce, powErr := s.proofOfWorkUseCase.Execute(sessCtx, &block, s.config.Blockchain.Difficulty)
	if powErr != nil {
		return nil, fmt.Errorf("Failed to mine block: %v", powErr)
	}

	block.Header.NonceBytes = nonce.Bytes()

	s.logger.Debug("genesis mining completed",
		slog.Any("nonce", block.Header.GetNonce()))

	// STEP 7:
	// Create our single proof-of-authority validator via coinbase account.
	//

	// Extract the bytes for the original public key.
	coinbasePublicKey := coinbasePrivateKey.Public()
	publicKeyECDSA, ok := coinbasePublicKey.(*ecdsa.PublicKey)
	if !ok {
		return nil, errors.New("error casting public key to ECDSA")
	}
	publicKeyBytes := crypto.FromECDSAPub(publicKeyECDSA)

	poaValidator := &domain.Validator{
		ID:             "ComicCoin Blockchain Authority",
		PublicKeyBytes: publicKeyBytes,
	}

	//
	// STEP 8:
	// Sign our genesis block's header with our proof-of-authority validator.
	// Note: Signing always happens after the miner has found the `nonce` in
	// the block header.
	//

	genesisBlockData.Validator = poaValidator
	genesisBlockHeaderSignatureBytes, err := poaValidator.Sign(coinbasePrivateKey, genesisBlockData.Header)
	if err != nil {
		return nil, fmt.Errorf("Failed to sign block header: %v", err)
	}
	genesisBlockData.HeaderSignatureBytes = genesisBlockHeaderSignatureBytes

	// //
	// // STEP 9:
	// // Save genesis block to a JSON file.
	// //
	//
	// genesisBlockDataBytes, err := json.MarshalIndent(genesisBlockData, "", "    ")
	// if err != nil {
	// 	return nil, fmt.Errorf("Failed to serialize genesis block: %v", err)
	// }
	//
	// if err := os.WriteFile("static/genesis.json", genesisBlockDataBytes, 0644); err != nil {
	// 	return nil, fmt.Errorf("Failed to write genesis block data to file: %v", err)
	// }

	//
	// STEP 10
	// Save genesis block to a database.
	//

	if err := s.upsertBlockDataUseCase.Execute(sessCtx, genesisBlockData.Hash, genesisBlockData.Header, genesisBlockData.HeaderSignatureBytes, genesisBlockData.Trans, genesisBlockData.Validator); err != nil {
		return nil, fmt.Errorf("Failed to write genesis block data to file: %v", err)
	}

	if err := s.upsertGenesisBlockDataUseCase.Execute(sessCtx, genesisBlockData.Hash, genesisBlockData.Header, genesisBlockData.HeaderSignatureBytes, genesisBlockData.Trans, genesisBlockData.Validator); err != nil {
		return nil, fmt.Errorf("Failed to write genesis block data to file: %v", err)
	}

	s.logger.Debug("genesis block created, finished running service",
		slog.String("hash", genesisBlockData.Hash))

	//
	// STEP 11:
	// Save our blockchain state.
	//

	blockchainState := &domain.BlockchainState{
		ChainID:                s.config.Blockchain.ChainID,
		LatestBlockNumberBytes: genesisBlockData.Header.NumberBytes,
		LatestHash:             genesisBlockData.Hash,
		LatestTokenIDBytes:     tokenTx.TokenIDBytes,
		AccountHashState:       stateRoot,
		TokenHashState:         tokensRoot,
	}

	if err := s.upsertBlockchainStateUseCase.Execute(sessCtx, blockchainState); err != nil {
		s.logger.Error("Failed to save blockchain state",
			slog.Any("error", err))
		return nil, fmt.Errorf("Failed to save blockchain state: %v", err)
	}

	return blockchainState, nil
}
