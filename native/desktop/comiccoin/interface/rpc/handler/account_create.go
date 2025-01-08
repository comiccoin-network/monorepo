package handler

import (
	"context"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/domain"

	sstring "github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/common/security/securestring"
)

type CreateAccountArgs struct {
	WalletMnemonic string
	WalletPath     string
	WalletPassword string
	WalletLabel    string
}

type CreateAccountReply struct {
	Account *domain.Account
}

func (impl *ComicCoinRPCServer) CreateAccount(args *CreateAccountArgs, reply *CreateAccountReply) error {
	mnem, err := sstring.NewSecureString(args.WalletMnemonic)
	if err != nil {
		return err
	}
	pass, err := sstring.NewSecureString(args.WalletPassword)
	if err != nil {
		return err
	}
	account, err := impl.createAccountService.Execute(context.Background(), mnem, args.WalletPath, pass, args.WalletLabel)
	if err != nil {
		return err
	}

	// Fill reply pointer to send the data back
	*reply = CreateAccountReply{
		Account: account,
	}
	return nil
}
