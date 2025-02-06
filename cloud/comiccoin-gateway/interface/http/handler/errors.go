// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/interface/http/handler/error.go
package handler

import "errors"

var (
	ErrAuthorizationNotFound = errors.New("authorization not found")
)
