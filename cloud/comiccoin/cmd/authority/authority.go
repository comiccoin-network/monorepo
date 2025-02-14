package authority

import (
	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/authority/account"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/authority/coins"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/authority/credentials"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/authority/genesis"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/authority/tokens"
)

func AuthorityCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "authority",
		Short: "Execute commands related to the authority",
		Run: func(cmd *cobra.Command, args []string) {
			// Do nothing...
		},
	}

	cmd.AddCommand(credentials.CredentialsCmd())
	cmd.AddCommand(account.AccountCmd())
	cmd.AddCommand(coins.CoinsCmd())
	cmd.AddCommand(tokens.TokensCmd())
	cmd.AddCommand(genesis.NewGenesistCmd())

	return cmd
}
