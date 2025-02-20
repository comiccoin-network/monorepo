// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/me/service.go
package me

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	common_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/user"
)

type MeConnectWalletRequestDTO struct {
	WalletAddress string `bson:"wallet_address" json:"wallet_address"`
}

type MeConnectWalletService interface {
	Execute(ctx context.Context, req *MeConnectWalletRequestDTO) (*MeResponseDTO, error)
}

type meConnectWalletServiceImpl struct {
	config                              *config.Configuration
	logger                              *slog.Logger
	oauthManager                        common_oauth.Manager
	userGetByFederatedIdentityIDUseCase uc_user.UserGetByFederatedIdentityIDUseCase
	userUpdateUseCase                   uc_user.UserUpdateUseCase
}

func NewMeConnectWalletService(
	config *config.Configuration,
	logger *slog.Logger,
	oauth common_oauth.Manager,
	userGetByFederatedIdentityIDUseCase uc_user.UserGetByFederatedIdentityIDUseCase,
	userUpdateUseCase uc_user.UserUpdateUseCase,
) MeConnectWalletService {
	return &meConnectWalletServiceImpl{
		config:                              config,
		logger:                              logger,
		oauthManager:                        oauth,
		userGetByFederatedIdentityIDUseCase: userGetByFederatedIdentityIDUseCase,
		userUpdateUseCase:                   userUpdateUseCase,
	}
}

func (s *meConnectWalletServiceImpl) Execute(ctx context.Context, req *MeConnectWalletRequestDTO) (*MeResponseDTO, error) {
	//
	// STEP 1: Get required from context.
	//

	// Get authenticated federatedidentity ID from context. This is loaded in
	// by the `AuthMiddleware` found via:
	// - github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/middleware/auth.go
	federatedidentityID, ok := ctx.Value("federatedidentity_id").(primitive.ObjectID)
	if !ok {
		s.logger.Error("Failed getting local federatedidentity id",
			slog.Any("error", "Not found in context: federatedidentity_id"))
		return nil, errors.New("federatedidentity not found in context")
	}

	//
	// STEP 2: Validation
	//

	if req == nil {
		s.logger.Warn("Failed validation with nothing received")
		return nil, httperror.NewForBadRequestWithSingleField("non_field_error", "Wallet address is required in submission")
	}

	// San
	req.WalletAddress = strings.TrimSpace(req.WalletAddress)

	e := make(map[string]string)
	if req.WalletAddress == "" {
		e["wallet_address"] = "Wallet address is required"
	} else {
		walletAddress := common.HexToAddress(strings.ToLower(req.WalletAddress))
		if walletAddress.Hex() == "0x0000000000000000000000000000000000000000" {
			e["wallet_address"] = "Wallet address cannot be burn address"
		}
	}
	if len(e) != 0 {
		s.logger.Warn("Failed validation",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 3: Get related.
	//

	// Get the user account (aka "Me") and if it doesn't exist then we will
	// create it immediately here and now.
	user, err := s.userGetByFederatedIdentityIDUseCase.Execute(ctx, federatedidentityID)
	if err != nil {
		s.logger.Error("Failed getting me", slog.Any("error", err))
		return nil, err
	}
	if user == nil {
		err := fmt.Errorf("FederatedIdentity does not exist for id: %v", federatedidentityID.Hex())
		s.logger.Error("Failed getting local federatedidentity id", slog.Any("error", err))
		return nil, err
	}

	//
	// STEP 4: Update database.
	//

	walletAddress := common.HexToAddress(strings.ToLower(req.WalletAddress))
	user.WalletAddress = &walletAddress
	if err := s.userUpdateUseCase.Execute(ctx, user); err != nil {
		s.logger.Debug("Failed updating user", slog.Any("error", err))
		return nil, err
	}

	s.logger.Debug("Updated wallet address in database for user",
		slog.Any("federatedidentity_id", federatedidentityID.Hex()))

	//
	// STEP 5: Update ComicCoin Network.
	//

	// Get access token from context. This is loaded in
	// by the `AuthMiddleware` found via:
	// - github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/middleware/auth.go
	accessToken, ok := ctx.Value("access_token").(string)
	if !ok {
		s.logger.Error("Failed getting access_token from local context",
			slog.Any("error", "Not found in context: federatedidentity_id"))
		return nil, errors.New("access_token not found in context")
	}

	// Get the local saved federated identity details that were saved
	// after the successful oAuth 2.0.
	remotefi, err := s.oauthManager.FetchFederatedIdentityFromRemoteByAccessToken(ctx, accessToken)
	if err != nil {
		s.logger.Debug("Failed fetching remote federated identity", slog.Any("error", err))
		return nil, err
	}
	if remotefi == nil {
		err := errors.New("nil returned for federated identity for the provided access token")
		s.logger.Debug("Failed fetching remote federated identity", slog.Any("error", err))
		return nil, err
	}

	s.logger.Debug("Successfully fetched from remote gateway",
		slog.Any("user_id", user.ID))

	// Update the wallet address of the record.
	remotefi.WalletAddress = &walletAddress

	// Submit to our remote gateway
	if err := s.oauthManager.UpdateFederatedIdentityInRemoteWithAccessToken(ctx, remotefi, accessToken); err != nil {
		s.logger.Error("Failed updating remote gateway", slog.Any("error", err))
		return nil, err
	}

	s.logger.Debug("Successfully updated remote gateway",
		slog.Any("user_id", user.ID))

	return &MeResponseDTO{
		FederateIdentityID: user.FederateIdentityID,
		ID:                 user.ID,
		Email:              user.Email,
		FirstName:          user.FirstName,
		LastName:           user.LastName,
		Name:               user.Name,
		LexicalName:        user.LexicalName,
		Phone:              user.Phone,
		Country:            user.Country,
		Timezone:           user.Timezone,
		WalletAddress:      user.WalletAddress,
	}, nil
}
