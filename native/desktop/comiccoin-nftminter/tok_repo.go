package main

import (
	"fmt"
	"log/slog"

	disk "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/storage"
)

type TokenRepo struct {
	logger                  *slog.Logger
	dbByTokenIDClient       disk.Storage
	dbByMetadataURIIDClient disk.Storage
}

func NewTokenRepo(logger *slog.Logger, dbByTokenIDClient disk.Storage, dbByMetadataURIIDClient disk.Storage) *TokenRepo {
	return &TokenRepo{logger, dbByTokenIDClient, dbByMetadataURIIDClient}
}

func (r *TokenRepo) Upsert(token *Token) error {
	bBytes, err := token.Serialize()
	if err != nil {
		return err
	}
	if err := r.dbByTokenIDClient.Set(fmt.Sprintf("%v", token.TokenID), bBytes); err != nil {
		return err
	}
	if err := r.dbByMetadataURIIDClient.Set(token.MetadataURI, bBytes); err != nil {
		return err
	}
	return nil
}

func (r *TokenRepo) GetByTokenID(tokenID uint64) (*Token, error) {
	bBytes, err := r.dbByTokenIDClient.Get(fmt.Sprintf("%v", tokenID))
	if err != nil {
		return nil, err
	}
	b, err := NewTokenFromDeserialize(bBytes)
	if err != nil {
		r.logger.Error("failed to deserialize",
			slog.Any("token_id", tokenID),
			slog.String("bin", string(bBytes)),
			slog.Any("error", err))
		return nil, err
	}
	return b, nil
}

func (r *TokenRepo) ListAll() ([]*Token, error) {
	res := make([]*Token, 0)
	err := r.dbByTokenIDClient.Iterate(func(key, value []byte) error {
		token, err := NewTokenFromDeserialize(value)
		if err != nil {
			r.logger.Error("failed to deserialize",
				slog.String("key", string(key)),
				slog.String("value", string(value)),
				slog.Any("error", err))
			return err
		}

		res = append(res, token)

		// Return nil to indicate success
		return nil
	})

	return res, err
}

func (r *TokenRepo) DeleteByTokenID(tokenID uint64) error {
	token, err := r.GetByTokenID(tokenID)
	if err != nil {
		return err
	}
	if err := r.dbByTokenIDClient.Delete(fmt.Sprintf("%v", tokenID)); err != nil {
		return err
	}
	if err := r.dbByMetadataURIIDClient.Delete(token.MetadataURI); err != nil {
		return err
	}

	return nil
}

func (r *TokenRepo) OpenTransaction() error {
	if err := r.dbByTokenIDClient.OpenTransaction(); err != nil {
		return err
	}
	if err := r.dbByMetadataURIIDClient.OpenTransaction(); err != nil {
		return err
	}
	return nil
}

func (r *TokenRepo) CommitTransaction() error {
	if err := r.dbByTokenIDClient.CommitTransaction(); err != nil {
		return err
	}
	if err := r.dbByMetadataURIIDClient.CommitTransaction(); err != nil {
		return err
	}
	return nil
}

func (r *TokenRepo) DiscardTransaction() {
	r.dbByTokenIDClient.DiscardTransaction()
	r.dbByMetadataURIIDClient.DiscardTransaction()
}
