package attachment

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AttachmentGetUseCase interface {
	Execute(ctx context.Context, id primitive.ObjectID) (*domain.Attachment, error)
}

type attachmentGetUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.AttachmentRepository
}

func NewAttachmentGetUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo domain.AttachmentRepository,
) AttachmentGetUseCase {
	return &attachmentGetUseCaseImpl{config, logger, repo}
}

func (uc *attachmentGetUseCaseImpl) Execute(ctx context.Context, id primitive.ObjectID) (*domain.Attachment, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if id.IsZero() {
		e["id"] = "Attachment is required"
	} else {

	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.GetByID(ctx, id)
}
