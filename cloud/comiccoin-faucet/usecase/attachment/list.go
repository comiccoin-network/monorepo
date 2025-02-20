package attachment

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/common/httperror"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-faucet/domain"
)

type AttachmentListByFilterUseCase interface {
	Execute(ctx context.Context, filter *domain.AttachmentFilter) (*domain.AttachmentFilterResult, error)
}

type attachmentListByFilterUseCaseImpl struct {
	config *config.Configuration
	logger *slog.Logger
	repo   domain.AttachmentRepository
}

func NewAttachmentListByFilterUseCase(
	config *config.Configuration,
	logger *slog.Logger,
	repo domain.AttachmentRepository,
) AttachmentListByFilterUseCase {
	return &attachmentListByFilterUseCaseImpl{config, logger, repo}
}

func (uc *attachmentListByFilterUseCaseImpl) Execute(ctx context.Context, filter *domain.AttachmentFilter) (*domain.AttachmentFilterResult, error) {
	//
	// STEP 1: Validation.
	//

	e := make(map[string]string)
	if filter == nil {
		e["filter"] = "Attachment is required"
	} else {
		if filter.TenantID.IsZero() {
			e["tenant_id"] = "Tenant ID is required"
		}
	}
	if len(e) != 0 {
		uc.logger.Warn("Failed validating",
			slog.Any("error", e))
		return nil, httperror.NewForBadRequest(&e)
	}

	//
	// STEP 2: Insert into database.
	//

	return uc.repo.ListByFilter(ctx, filter)
}
