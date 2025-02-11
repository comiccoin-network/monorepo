// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/system/error.go
package system

import "errors"

var (
	ErrAuthorizationNotFound = errors.New("authorization not found")
)
