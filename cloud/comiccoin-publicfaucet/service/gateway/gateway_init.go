// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/gateway/publicfaucetinit.go
package publicfaucet

import (
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/security/password"
	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/security/securestring"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/user"
)

type PublicFaucetInitService interface {
	Execute(sessCtx mongo.SessionContext, email string, password *sstring.SecureString) error
}

type publicfaucetInitServiceImpl struct {
	config           *config.Configuration
	logger           *slog.Logger
	passwordProvider password.Provider
	userGet          uc_user.UserGetByEmailUseCase
	userCreate       uc_user.UserCreateUseCase
}

func NewPublicFaucetInitService(
	config *config.Configuration,
	logger *slog.Logger,
	pp password.Provider,
	uc1 uc_user.UserGetByEmailUseCase,
	uc2 uc_user.UserCreateUseCase,
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

	userID := primitive.NewObjectID()

	//
	// STEP 3: Create our administrator user account.
	//

	passwordHash, err := s.passwordProvider.GenerateHashFromPassword(password)
	if err != nil {
		s.logger.Error("Failed hashing password",
			slog.Any("error", err))
		return err
	}

	user := &dom_user.User{
		ID:                        userID,
		FirstName:                 "System",
		LastName:                  "Administrator",
		Name:                      "System Administrator",
		LexicalName:               "Administrator, System",
		Email:                     email,
		Status:                    dom_user.UserStatusActive,
		PasswordHash:              passwordHash,
		PasswordHashAlgorithm:     s.passwordProvider.AlgorithmName(),
		Role:                      dom_user.UserRoleRoot,
		WasEmailVerified:          true,
		CreatedByUserID:           userID,
		CreatedByName:             "System Administrator",
		CreatedAt:                 time.Now(),
		ModifiedByUserID:          userID,
		ModifiedByName:            "System Administrator",
		ModifiedAt:                time.Now(),
		ProfileVerificationStatus: dom_user.UserProfileVerificationStatusApproved,
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

	//
	// Step 4: For debugging purposes only.
	//
	s.logger.Info("PublicFaucet initialized",
		slog.Any("user_id", userID.Hex()))

	return nil
}
