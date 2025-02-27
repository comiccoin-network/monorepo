// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/hello/service.go
package hello

import (
	"errors"
	"fmt"
	"log/slog"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_auth_memp "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	dom_auth_tx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	uc_auth_memp "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/usecase/mempooltxdto"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/distributedmutex"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/user"
	svc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/faucet"
	uc_faucet "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/faucet"
	uc_remoteaccountbalance "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/remoteaccountbalance"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

type ClaimCoinsResponse struct {
	ID          primitive.ObjectID `bson:"_id" json:"id"`
	Email       string             `bson:"email" json:"email"`
	FirstName   string             `bson:"first_name" json:"first_name"`
	LastName    string             `bson:"last_name" json:"last_name"`
	Name        string             `bson:"name" json:"name"`
	LexicalName string             `bson:"lexical_name" json:"lexical_name"`
	// Role                    int8               `bson:"role" json:"role"`
	// WasEmailVerified        bool               `bson:"was_email_verified" json:"was_email_verified,omitempty"`
	// EmailVerificationCode   string             `bson:"email_verification_code,omitempty" json:"email_verification_code,omitempty"`
	// EmailVerificationExpiry time.Time          `bson:"email_verification_expiry,omitempty" json:"email_verification_expiry,omitempty"`
	Phone    string `bson:"phone" json:"phone,omitempty"`
	Country  string `bson:"country" json:"country,omitempty"`
	Timezone string `bson:"timezone" json:"timezone"`
	// Region                  string             `bson:"region" json:"region,omitempty"`
	// City                    string             `bson:"city" json:"city,omitempty"`
	// PostalCode                                      string             `bson:"postal_code" json:"postal_code,omitempty"`
	// AddressLine1                                    string             `bson:"address_line1" json:"address_line1,omitempty"`
	// AddressLine2                                    string             `bson:"address_line2" json:"address_line2,omitempty"`
	// HasShippingAddress                              bool               `bson:"has_shipping_address" json:"has_shipping_address,omitempty"`
	// ShippingName                                    string             `bson:"shipping_name" json:"shipping_name,omitempty"`
	// ShippingPhone                                   string             `bson:"shipping_phone" json:"shipping_phone,omitempty"`
	// ShippingCountry                                 string             `bson:"shipping_country" json:"shipping_country,omitempty"`
	// ShippingRegion                                  string             `bson:"shipping_region" json:"shipping_region,omitempty"`
	// ShippingCity                                    string             `bson:"shipping_city" json:"shipping_city,omitempty"`
	// ShippingPostalCode                              string             `bson:"shipping_postal_code" json:"shipping_postal_code,omitempty"`
	// ShippingAddressLine1                            string             `bson:"shipping_address_line1" json:"shipping_address_line1,omitempty"`
	// ShippingAddressLine2                            string             `bson:"shipping_address_line2" json:"shipping_address_line2,omitempty"`
	// HowDidYouHearAboutUs                            int8               `bson:"how_did_you_hear_about_us" json:"how_did_you_hear_about_us,omitempty"`
	// HowDidYouHearAboutUsOther                       string             `bson:"how_did_you_hear_about_us_other" json:"how_did_you_hear_about_us_other,omitempty"`
	// AgreeTermsOfService                             bool               `bson:"agree_terms_of_service" json:"agree_terms_of_service,omitempty"`
	// AgreePromotions                                 bool               `bson:"agree_promotions" json:"agree_promotions,omitempty"`
	// CreatedFromIPAddress                            string             `bson:"created_from_ip_address" json:"created_from_ip_address"`
	// CreatedByFederatedIdentityID                    primitive.ObjectID `bson:"created_by_federatedidentity_id" json:"created_by_federatedidentity_id"`
	// CreatedAt                                       time.Time          `bson:"created_at" json:"created_at,omitempty"`
	// CreatedByName                                   string             `bson:"created_by_name" json:"created_by_name"`
	// ModifiedFromIPAddress                           string             `bson:"modified_from_ip_address" json:"modified_from_ip_address"`
	// ModifiedByFederatedIdentityID                   primitive.ObjectID `bson:"modified_by_federatedidentity_id" json:"modified_by_federatedidentity_id"`
	// ModifiedAt                                      time.Time          `bson:"modified_at" json:"modified_at,omitempty"`
	// ModifiedByName                                  string             `bson:"modified_by_name" json:"modified_by_name"`
	// Status                                          int8               `bson:"status" json:"status"`
	// PaymentProcessorName                            string             `bson:"payment_processor_name" json:"payment_processor_name"`
	// PaymentProcessorCustomerID                      string             `bson:"payment_processor_customer_id" json:"payment_processor_customer_id"`
	// OTPEnabled                                      bool               `bson:"otp_enabled" json:"otp_enabled"`
	// OTPVerified                                     bool               `bson:"otp_verified" json:"otp_verified"`
	// OTPValidated                                    bool               `bson:"otp_validated" json:"otp_validated"`
	// OTPSecret                                       string             `bson:"otp_secret" json:"-"`
	// OTPAuthURL                                      string             `bson:"otp_auth_url" json:"-"`
	// OTPBackupCodeHash                               string             `bson:"otp_backup_code_hash" json:"-"`
	// OTPBackupCodeHashAlgorithm                      string             `bson:"otp_backup_code_hash_algorithm" json:"-"`
	// HowLongCollectingComicBooksForGrading           int8               `bson:"how_long_collecting_comic_books_for_grading" json:"how_long_collecting_comic_books_for_grading"`
	// HasPreviouslySubmittedComicBookForGrading       int8               `bson:"has_previously_submitted_comic_book_for_grading" json:"has_previously_submitted_comic_book_for_grading"`
	// HasOwnedGradedComicBooks                        int8               `bson:"has_owned_graded_comic_books" json:"has_owned_graded_comic_books"`
	// HasRegularComicBookShop                         int8               `bson:"has_regular_comic_book_shop" json:"has_regular_comic_book_shop"`
	// HasPreviouslyPurchasedFromAuctionSite           int8               `bson:"has_previously_purchased_from_auction_site" json:"has_previously_purchased_from_auction_site"`
	// HasPreviouslyPurchasedFromFacebookMarketplace   int8               `bson:"has_previously_purchased_from_facebook_marketplace" json:"has_previously_purchased_from_facebook_marketplace"`
	// HasRegularlyAttendedComicConsOrCollectibleShows int8               `bson:"has_regularly_attended_comic_cons_or_collectible_shows" json:"has_regularly_attended_comic_cons_or_collectible_shows"`
	WalletAddress *common.Address `bson:"wallet_address" json:"wallet_address"`
	// ProfileVerificationStatus                       int8               `bson:"profile_verification_status" json:"profile_verification_status,omitempty"`
	LastClaimTime time.Time `bson:"last_claim_time" json:"last_claim_time"`
	NextClaimTime time.Time `bson:"next_claim_time" json:"next_claim_time"`
}

type ClaimCoinsService interface {
	Execute(sessCtx mongo.SessionContext, federatedidentityID primitive.ObjectID) (*ClaimCoinsResponse, error)
}

type claimCoinsServiceImpl struct {
	config                                                  *config.Configuration
	logger                                                  *slog.Logger
	dmutex                                                  distributedmutex.Adapter
	getFaucetByChainIDUseCase                               uc_faucet.GetFaucetByChainIDUseCase
	faucetUpdateByChainIDUseCase                            uc_faucet.FaucetUpdateByChainIDUseCase
	fetchRemoteAccountBalanceFromAuthorityUseCase           uc_remoteaccountbalance.FetchRemoteAccountBalanceFromAuthorityUseCase
	getPublicFaucetPrivateKeyService                        svc_faucet.GetPublicFaucetPrivateKeyService
	submitMempoolTransactionDTOToBlockchainAuthorityUseCase uc_auth_memp.SubmitMempoolTransactionDTOToBlockchainAuthorityUseCase
	userGetByFederatedIdentityIDUseCase                     uc_user.UserGetByFederatedIdentityIDUseCase
	userUpdateUseCase                                       uc_user.UserUpdateUseCase
}

func NewClaimCoinsService(
	config *config.Configuration,
	logger *slog.Logger,
	dmutex distributedmutex.Adapter,
	getFaucetByChainIDUseCase uc_faucet.GetFaucetByChainIDUseCase,
	faucetUpdateByChainIDUseCase uc_faucet.FaucetUpdateByChainIDUseCase,
	fetchRemoteAccountBalanceFromAuthorityUseCase uc_remoteaccountbalance.FetchRemoteAccountBalanceFromAuthorityUseCase,
	getPublicFaucetPrivateKeyService svc_faucet.GetPublicFaucetPrivateKeyService,
	submitMempoolTransactionDTOToBlockchainAuthorityUseCase uc_auth_memp.SubmitMempoolTransactionDTOToBlockchainAuthorityUseCase,
	userGetByFederatedIdentityIDUseCase uc_user.UserGetByFederatedIdentityIDUseCase,
	userUpdateUseCase uc_user.UserUpdateUseCase,
) ClaimCoinsService {
	return &claimCoinsServiceImpl{
		config:                       config,
		logger:                       logger,
		dmutex:                       dmutex,
		getFaucetByChainIDUseCase:    getFaucetByChainIDUseCase,
		faucetUpdateByChainIDUseCase: faucetUpdateByChainIDUseCase,
		fetchRemoteAccountBalanceFromAuthorityUseCase:           fetchRemoteAccountBalanceFromAuthorityUseCase,
		getPublicFaucetPrivateKeyService:                        getPublicFaucetPrivateKeyService,
		submitMempoolTransactionDTOToBlockchainAuthorityUseCase: submitMempoolTransactionDTOToBlockchainAuthorityUseCase,
		userGetByFederatedIdentityIDUseCase:                     userGetByFederatedIdentityIDUseCase,
		userUpdateUseCase:                                       userUpdateUseCase,
	}
}

func (svc *claimCoinsServiceImpl) Execute(sessCtx mongo.SessionContext, federatedidentityID primitive.ObjectID) (*ClaimCoinsResponse, error) {
	// Protect our resource - Make it executed only once at any period of
	// time, this is to protect faucet balance.
	svc.dmutex.Acquire(sessCtx, "ClaimCoinsServiceExecution")
	defer svc.dmutex.Release(sessCtx, "ClaimCoinsServiceExecution")

	//
	// Get related records.
	//

	faucet, err := svc.getFaucetByChainIDUseCase.Execute(sessCtx, svc.config.Blockchain.ChainID)
	if err != nil {
		svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
		return nil, err
	}
	if faucet == nil {
		err := fmt.Errorf("faucet d.n.e. for chain ID: %v", svc.config.Blockchain.ChainID)
		svc.logger.Error("failed getting faucet by chain id error", slog.Any("err", err))
		return nil, err
	}
	user, err := svc.userGetByFederatedIdentityIDUseCase.Execute(sessCtx, federatedidentityID)
	if err != nil {
		svc.logger.Debug("Failed getting user by federatedidentity id", slog.Any("error", err))
		return nil, err
	}
	if user == nil {
		err := fmt.Errorf("User does not exist for federatedidentity id: %v", federatedidentityID.Hex())
		svc.logger.Debug("Failed getting user by federatedidentity id", slog.Any("error", err))
		return nil, err
	}
	privateKey, err := svc.getPublicFaucetPrivateKeyService.Execute(sessCtx)
	if err != nil {
		svc.logger.Debug("Failed to get private key", slog.Any("error", err))
		return nil, err
	}

	//
	// Validation 1: Check whether user is able to claim.
	//

	var canClaim bool
	if user.LastClaimTime.IsZero() || user.NextClaimTime.IsZero() {
		canClaim = true
	} else {
		canClaim = time.Now().After(user.NextClaimTime)
	}
	if !canClaim {
		svc.logger.Warn("Failed validation - cannot claim coins")
		return nil, httperror.NewForBadRequestWithSingleField("message", "you cannot claim yet, check back later")
	}

	//
	// Validation 2: Check whether our faucet has large enough balance
	//

	remoteAccount, err := svc.fetchRemoteAccountBalanceFromAuthorityUseCase.Execute(sessCtx, svc.config.Blockchain.PublicFaucetAccountAddress)
	if err != nil {
		svc.logger.Error("failed getting account balance from authority error",
			slog.Any("address", svc.config.Blockchain.PublicFaucetAccountAddress),
			slog.Any("err", err))
		return nil, err
	}
	if remoteAccount == nil {
		err := fmt.Errorf("balance d.n.e. for address: %v", svc.config.Blockchain.PublicFaucetAccountAddress)
		svc.logger.Error("failed getting balance from authority", slog.Any("err", err))
		return nil, err
	}
	if remoteAccount.Balance < svc.config.Blockchain.PublicFaucetClaimCoinsReward {
		err := errors.New("Insufficient faucet balance")
		svc.logger.Error("Cannot claim coins", slog.Any("err", err))
		return nil, err
	}

	//
	// Create our pending transaction and sign it with the faucet's private key.
	//

	nonceBigInt := big.NewInt(time.Now().Unix())
	nonceBytes := nonceBigInt.Bytes()

	tx := &dom_auth_tx.Transaction{
		ChainID:    svc.config.Blockchain.ChainID,
		NonceBytes: nonceBytes,
		From:       svc.config.Blockchain.PublicFaucetAccountAddress,
		To:         user.WalletAddress,
		Value:      svc.config.Blockchain.PublicFaucetClaimCoinsReward + svc.config.Blockchain.TransactionFee, // Note: The transaction fee gets reclaimed by the Authority, so it's fully recirculating when authority calls this.
		Data:       []byte{},
		Type:       dom_auth_tx.TransactionTypeCoin,
	}

	stx, signingErr := tx.Sign(privateKey)
	if signingErr != nil {
		svc.logger.Debug("Failed to sign the transaction",
			slog.Any("error", signingErr))
		return nil, signingErr
	}

	// Defensive Coding.
	if err := stx.Validate(svc.config.Blockchain.ChainID, false); err != nil {
		svc.logger.Debug("Failed to validate signature of the signed transaction",
			slog.Any("error", signingErr))
		return nil, signingErr
	}

	svc.logger.Debug("Transaction signed successfully",
		slog.Any("chain_id", stx.ChainID),
		slog.Any("nonce", stx.GetNonce()),
		slog.Any("from", stx.From),
		slog.Any("to", stx.To),
		slog.Any("fee", svc.config.Blockchain.TransactionFee),
		slog.Any("value", stx.Value),
		slog.Any("data", stx.Data),
		slog.Any("type", stx.Type),
		slog.Any("token_id", stx.GetTokenID()),
		slog.Any("token_metadata_uri", stx.TokenMetadataURI),
		slog.Any("token_nonce", stx.GetTokenNonce()),
		slog.Any("tx_sig_v_bytes", stx.VBytes),
		slog.Any("tx_sig_r_bytes", stx.RBytes),
		slog.Any("tx_sig_s_bytes", stx.SBytes),
		slog.Any("tx_nonce", stx.GetNonce()))

	//
	// Send our pending signed transaction to the authority's mempool to wait
	// in a queue to be processed.
	//

	mempoolTx := &dom_auth_memp.MempoolTransaction{
		ID:                primitive.NewObjectID(),
		SignedTransaction: stx,
	}

	// Defensive Coding.
	if err := mempoolTx.Validate(svc.config.Blockchain.ChainID, false); err != nil {
		svc.logger.Debug("Failed to validate signature of mempool transaction",
			slog.Any("error", signingErr))
		return nil, signingErr
	}

	svc.logger.Debug("Mempool transaction ready for submission",
		slog.Any("Transaction", stx.Transaction),
		// slog.Any("tx_sig_v_bytes", stx.VBytes),
		// slog.Any("tx_sig_r_bytes", stx.RBytes),
		// slog.Any("tx_sig_s_bytes", stx.SBytes)
	)

	dto := mempoolTx.ToDTO()

	if err := svc.submitMempoolTransactionDTOToBlockchainAuthorityUseCase.Execute(sessCtx, dto); err != nil {
		svc.logger.Error("Failed to broadcast to the blockchain authority",
			slog.Any("error", err))
		return nil, err
	}

	svc.logger.Info("Pending signed transaction for coin transfer submitted to the blockchain authority",
		slog.Any("tx_nonce", stx.GetNonce()))

	//
	// Update user record.
	//

	// Defensive code: In case the transactions haven't been initialized previously.
	if user.ClaimedCoinTransactions == nil {
		user.ClaimedCoinTransactions = make([]*dom_user.UserClaimedCoinTransaction, 0)
	}
	claim := &dom_user.UserClaimedCoinTransaction{
		ID:        primitive.NewObjectID(),
		Timestamp: time.Now(),
		Amount:    svc.config.Blockchain.PublicFaucetClaimCoinsReward,
	}
	user.ClaimedCoinTransactions = append(user.ClaimedCoinTransactions, claim)

	// Increment the total coins claimed by user.
	user.TotalCoinsClaimed += svc.config.Blockchain.PublicFaucetClaimCoinsReward

	// Set that we claimed coins right now.
	user.LastClaimTime = time.Now()

	// Next claim is 24 hours after last claim
	user.NextClaimTime = time.Now().Add(24 * time.Hour)

	// Useful to keep.
	user.ModifiedAt = time.Now()

	// Save to the database.
	if err := svc.userUpdateUseCase.Execute(sessCtx, user); err != nil {
		svc.logger.Error("Failed to save user",
			slog.Any("error", err))
		return nil, err
	}
	svc.logger.Debug("User has claimed coins",
		slog.Any("last_claim_time", user.LastClaimTime),
		slog.Any("next_claim_time", user.NextClaimTime),
		slog.Any("can_claim", canClaim),
		slog.Any("stx", stx),
	)

	//
	// Update the faucet.
	//

	// First, check if we need to reset daily counters based on last modified time
	// This approach considers "today" as a 24-hour period from midnight UTC
	currentTime := time.Now().UTC()
	currentDate := time.Date(currentTime.Year(), currentTime.Month(), currentTime.Day(), 0, 0, 0, 0, time.UTC)
	lastModifiedDate := time.Date(
		faucet.LastModifiedAt.Year(),
		faucet.LastModifiedAt.Month(),
		faucet.LastModifiedAt.Day(),
		0, 0, 0, 0, time.UTC,
	)

	// If the last modification was on a previous day, reset the daily counters
	if currentDate.After(lastModifiedDate) {
		svc.logger.Debug("Resetting daily faucet counters - new day detected",
			slog.Time("currentDate", currentDate),
			slog.Time("lastModifiedDate", lastModifiedDate))

		// Store previous day's distribution rate before resetting
		if faucet.TotalCoinsDistributedToday > 0 && faucet.TotalTransactionsToday > 0 {
			faucet.DistributationRatePerDay = faucet.TotalCoinsDistributedToday
		}

		// Reset daily counters
		faucet.TotalCoinsDistributedToday = 0
		faucet.TotalTransactionsToday = 0
	}

	// Update total distributions
	faucet.TotalCoinsDistributed += svc.config.Blockchain.PublicFaucetClaimCoinsReward + svc.config.Blockchain.TransactionFee
	faucet.TotalTransactions += 1

	// Update daily counters
	faucet.TotalCoinsDistributedToday += svc.config.Blockchain.PublicFaucetClaimCoinsReward + svc.config.Blockchain.TransactionFee
	faucet.TotalTransactionsToday += 1

	// Calculate distribution rate per day
	// Using a simple approach: total coins distributed today (this becomes the daily rate when the day ends)
	// This will be preserved as the previous day's rate when counters reset
	faucet.DistributationRatePerDay = faucet.TotalCoinsDistributedToday

	faucet.LastModifiedAt = lastModifiedDate
	if err := svc.faucetUpdateByChainIDUseCase.Execute(sessCtx, faucet); err != nil {
		svc.logger.Error("Failed to save faucet",
			slog.Any("error", err))
		return nil, err
	}

	//
	// Return `Me` profile details.
	//

	return &ClaimCoinsResponse{
		ID:            user.ID,
		Email:         user.Email,
		FirstName:     user.FirstName,
		LastName:      user.LastName,
		Name:          user.Name,
		LexicalName:   user.LexicalName,
		Phone:         user.Phone,
		Country:       user.Country,
		Timezone:      user.Timezone,
		WalletAddress: user.WalletAddress,
		LastClaimTime: user.LastClaimTime,
		NextClaimTime: user.NextClaimTime,
	}, nil
}
