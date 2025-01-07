package repo

import (
	"context"
	"log/slog"
	"strings"

	disk "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage"
	"github.com/comiccoin-network/monorepo/native/desktop/comiccoin/domain"
)

const (
	BlockchainSyncStatusRecordKey = "BLOCKCHAIN_SYNC_STATUS"
)

type BlockchainSyncStatusRepo struct {
	logger   *slog.Logger
	dbClient disk.Storage
}

func NewBlockchainSyncStatusRepo(logger *slog.Logger, db disk.Storage) domain.BlockchainSyncStatusRepository {
	return &BlockchainSyncStatusRepo{logger, db}
}

func (r *BlockchainSyncStatusRepo) Set(ctx context.Context, isSynching bool) error {
	blockchainSyncStatus := &domain.BlockchainSyncStatus{
		IsSynching: isSynching,
	}
	bBytes, err := blockchainSyncStatus.Serialize()
	if err != nil {
		return err
	}
	if err := r.dbClient.Set(BlockchainSyncStatusRecordKey, bBytes); err != nil {
		return err
	}
	return nil
}

func (r *BlockchainSyncStatusRepo) Get(ctx context.Context) (*domain.BlockchainSyncStatus, error) {
	bBytes, err := r.dbClient.Get(BlockchainSyncStatusRecordKey)
	if err != nil {
		if strings.Contains(err.Error(), "does not exist for") {
			return &domain.BlockchainSyncStatus{
				IsSynching: false,
			}, nil
		}
		return nil, err
	}
	if bBytes == nil {
		return &domain.BlockchainSyncStatus{
			IsSynching: false,
		}, err
	}
	b, err := domain.NewBlockchainSyncStatusFromDeserialize(bBytes)
	if err != nil {
		r.logger.Error("failed to deserialize",
			slog.String("bin", string(bBytes)),
			slog.Any("error", err))
		return nil, err
	}
	return b, nil
}
