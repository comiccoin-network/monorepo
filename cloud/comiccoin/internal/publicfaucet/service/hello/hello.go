// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/service/hello/service.go
package hello

import (
	"context"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/federatedidentity"
)

type HelloResponse struct {
	Message           string                                   `json:"message"`
	FederatedIdentity *dom_federatedidentity.FederatedIdentity `json:"federatedidentity"`
}

type HelloService interface {
	SayHello(ctx context.Context) (*HelloResponse, error)
}

type helloServiceImpl struct {
	config *config.Configuration
	logger *slog.Logger
}

func NewHelloService(
	config *config.Configuration,
	logger *slog.Logger,
) HelloService {
	return &helloServiceImpl{
		config: config,
		logger: logger,
	}
}

func (s *helloServiceImpl) SayHello(ctx context.Context) (*HelloResponse, error) {
	// // Get authenticated federatedidentity ID from context. This is loaded in
	// // by the `AuthMiddleware` found via:
	// // - github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/publicfaucet/interface/http/middleware/auth.go
	// federatedidentityID, ok := ctx.Value("federatedidentity_id").(primitive.ObjectID)
	// if !ok {
	// 	s.logger.Error("Failed getting local federatedidentity id",
	// 		slog.Any("error", "Not found in context: federatedidentity_id"))
	// 	return nil, errors.New("federatedidentity not found in context")
	// }
	//
	// // Get federatedidentity details
	// federatedidentity, err := s.oauthManager.GetLocalFederatedIdentityByFederatedIdentityID(ctx, federatedidentityID)
	// if err != nil {
	// 	s.logger.Debug("Failed getting local federatedidentity id", slog.Any("error", err))
	// 	return nil, err
	// }
	// if federatedidentity == nil {
	// 	err := fmt.Errorf("FederatedIdentity does not exist for id: %v", federatedidentityID.Hex())
	// 	s.logger.Debug("Failed getting local federatedidentity id", slog.Any("error", err))
	// 	return nil, err
	// }
	//
	// return &HelloResponse{
	// 	Message:           fmt.Sprintf("Hello, %s!", federatedidentity.FirstName),
	// 	FederatedIdentity: federatedidentity,
	// }, nil
	return nil, nil
}
