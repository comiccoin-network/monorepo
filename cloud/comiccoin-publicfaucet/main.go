// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/main.go
package main

import (
	_ "time/tzdata" // Important b/c some servers don't allow access to timezone file.

	_ "go.uber.org/automaxprocs" // Automatically set GOMAXPROCS to match Linux container CPU quota.

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/cmd"
)

func main() {
	cmd.Execute()
}
