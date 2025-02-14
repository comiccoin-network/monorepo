// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/gateway/publicfaucetinit.go
package publicfaucet

import (
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/domain/federatedidentity"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/usecase/federatedidentity"
)

type PublicFaucetInitService interface {
	Execute(sessCtx mongo.SessionContext, email string, password *sstring.SecureString) error
}

type publicfaucetInitServiceImpl struct {
	config           *config.Configuration
	logger           *slog.Logger
	passwordProvider password.Provider
	federatedidentityGet          uc_federatedidentity.FederatedIdentityGetByEmailUseCase
	federatedidentityCreate       uc_federatedidentity.FederatedIdentityCreateUseCase
}

func NewPublicFaucetInitService(
	config *config.Configuration,
	logger *slog.Logger,
	pp password.Provider,
	uc1 uc_federatedidentity.FederatedIdentityGetByEmailUseCase,
	uc2 uc_federatedidentity.FederatedIdentityCreateUseCase,
) PublicFaucetInitService {
	return &publicfaucetInitServiceImpl{config, logger, pp, uc1, uc2}
}

func (s *publicfaucetInitServiceImpl) Execute(
	sessCtx mongo.SessionContext,
	email string,
	password *sstring.SecureString,
) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if email == "" {
		e["email"] = "Email is required"
	}
	if password == nil {
		e["password"] = "Password is required"
	} else {
		if password.String() == "" {
			e["password"] = "Password is required"
		}
	}
	if len(e) != 0 {
		s.logger.Warn("Validation failed",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Setup our unique identifiers
	//

	federatedidentityID := primitive.NewObjectID()

	//
	// STEP 3: Create our administrator federatedidentity account.
	//

	passwordHash, err := s.passwordProvider.GenerateHashFromPassword(password)
	if err != nil {
		s.logger.Error("Failed hashing password",
			slog.Any("error", err))
		return err
	}

	federatedidentity := &dom_federatedidentity.FederatedIdentity{
		ID:                        federatedidentityID,
		FirstName:                 "System",
		LastName:                  "Administrator",
		Name:                      "System Administrator",
		LexicalName:               "Administrator, System",
		Email:                     email,
		Status:                    dom_federatedidentity.FederatedIdentityStatusActive,
		PasswordHash:              passwordHash,
		PasswordHashAlgorithm:     s.passwordProvider.AlgorithmName(),
		Role:                      dom_federatedidentity.FederatedIdentityRoleRoot,
		WasEmailVerified:          true,
		CreatedByFederatedIdentityID:           federatedidentityID,
		CreatedByName:             "System Administrator",
		CreatedAt:                 time.Now(),
		ModifiedByFederatedIdentityID:          federatedidentityID,
		ModifiedByName:            "System Administrator",
		ModifiedAt:                time.Now(),
		ProfileVerificationStatus: dom_federatedidentity.FederatedIdentityProfileVerificationStatusApproved,
		Country:                   "Canada",
		Timezone:                  "America/Toronto",
		AgreeTermsOfService:       true,
		AgreePromotions:           true,
	}

	if createFederatedIdentityErr := s.federatedidentityCreate.Execute(sessCtx, federatedidentity); err != nil {
		s.logger.Error("Failed creating federatedidentity",
			slog.Any("error", createFederatedIdentityErr))
		return createFederatedIdentityErr
	}

	//

	//
	// Step 4: For debugging purposes only.
	//
	s.logger.Info("PublicFaucet initialized",
		slog.Any("federatedidentity_id", federatedidentityID.Hex()))

	return nil
}
