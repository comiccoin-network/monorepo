// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/system/error.go
package system

import "errors"

var (
	ErrAuthorizationNotFound = errors.New("authorization not found")
)
