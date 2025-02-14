package mocks

import (
	"context"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/domain"
	"github.com/ethereum/go-ethereum/common"
)

// AccountRepository mocks domain.AccountRepository
type AccountRepository struct {
	UpsertErr                error
	FilterAccounts           []*domain.Account
	FilterErr                error
	GetAccount               *domain.Account
	GetErr                   error
	HashStateByChainIDResult string
	HashStateByChainIDError  error
}

func (m AccountRepository) Upsert(ctx context.Context, acc *domain.Account) error {
	return m.UpsertErr
}

func (m AccountRepository) GetByAddress(ctx context.Context, addr *common.Address) (*domain.Account, error) {
	return m.GetAccount, m.GetErr
}

func (m AccountRepository) ListByChainID(ctx context.Context, chainID uint16) ([]*domain.Account, error) {
	return nil, nil
}

func (m AccountRepository) ListWithFilterByAddresses(ctx context.Context, addrs []*common.Address) ([]*domain.Account, error) {
	return m.FilterAccounts, m.FilterErr
}

func (m AccountRepository) DeleteByAddress(ctx context.Context, addr *common.Address) error {
	return nil
}

func (m AccountRepository) HashStateByChainID(ctx context.Context, chainID uint16) (string, error) {
	return m.HashStateByChainIDResult, m.HashStateByChainIDError
}

func (m AccountRepository) OpenTransaction() error {
	return nil
}

func (m AccountRepository) CommitTransaction() error {
	return nil
}

func (m AccountRepository) DiscardTransaction() {}
