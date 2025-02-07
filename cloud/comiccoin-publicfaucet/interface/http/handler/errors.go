// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/handler/error.go
package handler

import "errors"

var (
	ErrAuthorizationNotFound = errors.New("authorization not found")
)
