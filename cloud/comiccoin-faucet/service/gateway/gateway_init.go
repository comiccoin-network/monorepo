package gateway

import (
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	sv_account "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/service/account"
	uc_tenant "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/tenant"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/usecase/user"
)

type GatewayInitService interface {
	Execute(
		sessCtx mongo.SessionContext,
		tenantName string,
		chainID uint16,
		email string,
		walletMnemonic *sstring.SecureString,
		walletPath string,
	) error
}

type gatewayInitServiceImpl struct {
	config                 *config.Configuration
	logger                 *slog.Logger
	passwordProvider       password.Provider
	createAccountService   sv_account.CreateAccountService
	tenantGetByNameUseCase uc_tenant.TenantGetByNameUseCase
	tenantCreate           uc_tenant.TenantCreateUseCase
	userGet                uc_user.UserGetByEmailUseCase
	userCreate             uc_user.UserCreateUseCase
}

func NewGatewayInitService(
	config *config.Configuration,
	logger *slog.Logger,
	pp password.Provider,
	s1 sv_account.CreateAccountService,
	uc1 uc_tenant.TenantGetByNameUseCase,
	uc2 uc_tenant.TenantCreateUseCase,
	uc3 uc_user.UserGetByEmailUseCase,
	uc4 uc_user.UserCreateUseCase,
) GatewayInitService {
	return &gatewayInitServiceImpl{config, logger, pp, s1, uc1, uc2, uc3, uc4}
}

func (s *gatewayInitServiceImpl) Execute(
	sessCtx mongo.SessionContext,
	tenantName string,
	chainID uint16,
	email string,
	walletMnemonic *sstring.SecureString,
	walletPath string,
) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if tenantName == "" {
		e["tenant_name"] = "missing value"
	} else {
		tenant, err := s.tenantGetByNameUseCase.Execute(sessCtx, tenantName)
		if err != nil {
			s.logger.Debug("Failed to get tenant by name")
			return err
		}
		if tenant != nil {
			err := fmt.Errorf("Tenant already exists with name: %v", tenantName)
			s.logger.Error("Failed because tenant exists", slog.Any("error", err))
			return err
		}
	}
	if chainID == 0 {
		e["chain_id"] = "missing value"
	}
	if email == "" {
		e["email"] = "missing value"
	} else {
		//TODO
	}
	if walletPath == "" {
		e["wallet_path"] = "missing value"
	}
	if walletMnemonic == nil {
		e["wallet_mnemonic"] = "missing value"
	}
	if len(e) != 0 {
		s.logger.Warn("Validation failed for upsert",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Setup our unique identifiers
	//

	tenantID := primitive.NewObjectID()
	userID := primitive.NewObjectID()

	//
	// STEP 3:
	// Create the encryted physical wallet on file and our account.
	//

	account, err := s.createAccountService.Execute(sessCtx, walletMnemonic, walletPath, tenantID.Hex())
	if err != nil {
		s.logger.Error("Failed creating account",
			slog.Any("error", err))
		return err
	}
	if account == nil {
		err := fmt.Errorf("Account was not returned for tenant: %v", tenantID.Hex())
		s.logger.Error("Failed creating account",
			slog.Any("error", err))
		return err
	}

	//
	// STEP 4: Create our tenant.
	//

	tenant := &domain.Tenant{
		ID:         tenantID,
		Name:       tenantName,
		ChainID:    chainID,
		Status:     domain.TenantActiveStatus,
		CreatedAt:  time.Now(),
		ModifiedAt: time.Now(),
		Account:    account,
	}

	if createTenantErr := s.tenantCreate.Execute(sessCtx, tenant); createTenantErr != nil {
		s.logger.Error("Failed creating tenant",
			slog.Any("error", createTenantErr))
		return createTenantErr
	}

	//
	// STEP 5: Create our administrator user account.
	//

	passwordHash, err := s.passwordProvider.GenerateHashFromPassword(walletMnemonic)
	if err != nil {
		s.logger.Error("Failed hashing password",
			slog.Any("error", err))
		return err
	}

	user := &domain.User{
		ID:                        userID,
		TenantID:                  tenant.ID,
		TenantName:                tenantName,
		FirstName:                 "System",
		LastName:                  "Administrator",
		Name:                      "System Administrator",
		LexicalName:               "Administrator, System",
		Email:                     email,
		Status:                    domain.UserStatusActive,
		PasswordHash:              passwordHash,
		PasswordHashAlgorithm:     s.passwordProvider.AlgorithmName(),
		Role:                      domain.UserRoleRoot,
		WasEmailVerified:          true,
		CreatedAt:                 time.Now(),
		ModifiedAt:                time.Now(),
		ProfileVerificationStatus: domain.UserProfileVerificationStatusApproved,
		Country:                   "Canada",
		Timezone:                  "America/Toronto",
		AgreeTermsOfService:       true,
		AgreePromotions:           true,
	}

	if createUserErr := s.userCreate.Execute(sessCtx, user); err != nil {
		s.logger.Error("Failed creating user",
			slog.Any("error", createUserErr))
		return createUserErr
	}

	//
	// Step 6: For debugging purposes only.
	//
	s.logger.Info("Gateway initialized",
		slog.Any("tenant_id", tenantID.Hex()),
		slog.Any("user_id", userID.Hex()),
		slog.Any("account_address", account.Address))

	return nil
}
