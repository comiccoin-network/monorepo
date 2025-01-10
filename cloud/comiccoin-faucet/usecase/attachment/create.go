package attachment

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type CreateAttachmentUseCase interface {
	Execute(ctx context.Context, attachment *domain.Attachment) error
}

type createAttachmentUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.AttachmentRepository
}

func NewCreateAttachmentUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo domain.AttachmentRepository,
) CreateAttachmentUseCase {
	return &createAttachmentUseCaseImpl{config, logger, repo}
}

func (uc *createAttachmentUseCaseImpl) Execute(ctx context.Context, attachment *domain.Attachment) error {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if attachment == nil {
		e["attachment"] = "Attachment is required"
	} else {

	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.Create(ctx, attachment)
}
