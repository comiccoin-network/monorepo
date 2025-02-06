package user

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/domain"
)

type UserGetByVerificationCodeUseCase interface {
	Execute(ctx context.Context, verificationCode string) (*domain.User, error)
}

type userGetByVerificationCodeUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.UserRepository
}

func NewUserGetByVerificationCodeUseCase(config *config.Configuration, logger *slog.Logger, repo domain.UserRepository) UserGetByVerificationCodeUseCase {
	return &userGetByVerificationCodeUseCaseImpl{config, logger, repo}
}

func (uc *userGetByVerificationCodeUseCaseImpl) Execute(ctx context.Context, verificationCode string) (*domain.User, error) {
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
