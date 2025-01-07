package handler

import (
	"context"
	"math/big"

	"github.com/ethereum/go-ethereum/common"

	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
)

type TokenBurnArgs struct {
	ChainID               uint16
	FromAccountAddress    *common.Address
	AccountWalletMnemonic string
	AccountWalletPath     string
	TokenID               *big.Int
}

type TokenBurnReply struct {
}

func (impl *ComicCoinRPCServer) TokenBurn(args *TokenBurnArgs, reply *TokenBurnReply) error {
	mnemonic, secureErr := sstring.NewSecureString(args.AccountWalletMnemonic)
	if secureErr != nil {
		return secureErr
	}
	err := impl.tokenBurnService.Execute(
		context.Background(),
		args.ChainID,
		args.FromAccountAddress,
		mnemonic,
		args.AccountWalletPath,
		args.TokenID,
	)
	if err != nil {
		return err
	}

	// Fill reply pointer to send the data back
	*reply = TokenBurnReply{}
	return nil
}
