package federatedidentity

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/gateway/domain/federatedidentity"
)

type FederatedIdentityGetByVerificationCodeUseCase interface {
	Execute(ctx context.Context, verificationCode string) (*dom_federatedidentity.FederatedIdentity, error)
}

type federatedidentityGetByVerificationCodeUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   dom_federatedidentity.Repository
}

func NewFederatedIdentityGetByVerificationCodeUseCase(config *config.Configuration, logger *slog.Logger, repo dom_federatedidentity.Repository) FederatedIdentityGetByVerificationCodeUseCase {
	return &federatedidentityGetByVerificationCodeUseCaseImpl{config, logger, repo}
}

func (uc *federatedidentityGetByVerificationCodeUseCaseImpl) Execute(ctx context.Context, verificationCode string) (*dom_federatedidentity.FederatedIdentity, error) {
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
