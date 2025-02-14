package mnemonic

import (
	"log"
	"log/slog"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/blockchain/hdkeystore"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
)

func GenerateMnemonicPhraseCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "generate",
		Short: "Execute generating a BIP39 mnemonic phrase",
		Run: func(cmd *cobra.Command, args []string) {
			//
			// STEP 1
			// Load up our dependencies and configuration
			//
			logger := logger.NewProvider()
			adapter := hdkeystore.NewAdapter()

			//
			// STEP 2
			// Generate our mnemonic phrase.
			//

			mnemonic, err := adapter.GenerateMnemonic()
			if err != nil {
				log.Fatal(err)
			}

			//
			// STEP 3
			// Print to console.
			//

			logger.Info("Successfully generate mnemonic phrase",
				slog.Any("result", mnemonic),
			)
		},
	}

	return cmd
}
