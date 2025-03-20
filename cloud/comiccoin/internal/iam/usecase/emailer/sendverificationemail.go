package emailer

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/httperror"
	domain "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/repo/templatedemailer"
)

type SendUserVerificationEmailUseCase interface {
	Execute(ctx context.Context, user *domain.User) error
}
type sendUserVerificationEmailUseCaseImpl struct {
	config  *config.Configuration
	logger  *slog.Logger
	emailer templatedemailer.TemplatedEmailer
}

func NewSendUserVerificationEmailUseCase(config *config.Configuration, logger *slog.Logger, emailer templatedemailer.TemplatedEmailer) SendUserVerificationEmailUseCase {
	return &sendUserVerificationEmailUseCaseImpl{config, logger, emailer}
}

func (uc *sendUserVerificationEmailUseCaseImpl) Execute(ctx context.Context, user *domain.User) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if user == nil {
		e["user"] = "User is missing value"
	} else {
		if user.FirstName == "" {
			e["first_name"] = "First name is required"
		}
		if user.Email == "" {
			e["email"] = "Email is required"
		}
		if user.EmailVerificationCode == "" {
			e["email_verification_code"] = "Email verification code is required"
		}
	}
	if len(e) != 0 {
		uc.logger.Warn("Validation failed for upsert",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Send email
	//

	return uc.emailer.SendUserVerificationEmail(ctx, user.Email, user.EmailVerificationCode, user.FirstName)
}
