// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/registration/interface.go
package registration

import "context"

type Client interface {
	Register(ctx context.Context, req *RegistrationRequest) (*RegistrationResponse, error)
}
