package handler

import (
	"context"
	"math/big"

	"github.com/ethereum/go-ethereum/common"

	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
)

type TokenTransferArgs struct {
	ChainID               uint16
	FromAccountAddress    *common.Address
	AccountWalletMnemonic string
	AccountWalletPath     string
	To                    *common.Address
	TokenID               *big.Int
}

type TokenTransferReply struct {
}

func (impl *ComicCoinRPCServer) TokenTransfer(args *TokenTransferArgs, reply *TokenTransferReply) error {
	mnemonic, secureErr := sstring.NewSecureString(args.AccountWalletMnemonic)
	if secureErr != nil {
		return secureErr
	}
	err := impl.tokenTransferService.Execute(
		context.Background(),
		args.ChainID,
		args.FromAccountAddress,
		mnemonic,
		args.AccountWalletPath,
		args.To,
		args.TokenID,
	)
	if err != nil {
		return err
	}

	// Fill reply pointer to send the data back
	*reply = TokenTransferReply{}
	return nil
}
