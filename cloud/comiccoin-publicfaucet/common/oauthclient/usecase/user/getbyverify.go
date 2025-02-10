// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/user/getbyverify.go
package user

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/httperror"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/user"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
)

type UserGetByVerificationCodeUseCase interface {
	Execute(ctx context.Context, verificationCode string) (*dom_user.User, error)
}

type userGetByVerificationCodeUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_user.Repository
}

func NewUserGetByVerificationCodeUseCase(config *config.Configuration, logger *slog.Logger, repo dom_user.Repository) UserGetByVerificationCodeUseCase {
	return &userGetByVerificationCodeUseCaseImpl{config, logger, repo}
}

func (uc *userGetByVerificationCodeUseCaseImpl) Execute(ctx context.Context, verificationCode string) (*dom_user.User, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if verificationCode == "" {
		e["verification_code"] = "missing value"
	} else {
		//TODO: IMPL.
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed for get by verification",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 3: Get from database.
	//

	return uc.repo.GetByVerificationCode(ctx, verificationCode)
}
