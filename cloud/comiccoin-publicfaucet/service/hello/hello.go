// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/hello/service.go
package hello

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	common_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/federatedidentity"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
)

type HelloResponse struct {
	Message           string                                   `json:"message"`
	FederatedIdentity *dom_federatedidentity.FederatedIdentity `json:"federatedidentity"`
}

type HelloService interface {
	SayHello(ctx context.Context) (*HelloResponse, error)
}

type helloServiceImpl struct {
	config       *config.Configuration
	logger       *slog.Logger
	oauthManager common_oauth.Manager
}

func NewHelloService(
	config *config.Configuration,
	logger *slog.Logger,
	oauth common_oauth.Manager,
) HelloService {
	return &helloServiceImpl{
		config:       config,
		logger:       logger,
		oauthManager: oauth,
	}
}

func (s *helloServiceImpl) SayHello(ctx context.Context) (*HelloResponse, error) {
	// Get authenticated federatedidentity ID from context
	federatedidentityID, ok := ctx.Value("federatedidentity_id").(primitive.ObjectID)
	if !ok {
		s.logger.Error("Failed getting local federatedidentity id",
			slog.Any("error", "Not found in context: federatedidentity_id"))
		return nil, errors.New("federatedidentity not found in context")
	}

	// Get federatedidentity details
	federatedidentity, err := s.oauthManager.GetLocalFederatedIdentityByID(ctx, federatedidentityID)
	if err != nil {
		s.logger.Debug("Failed getting local federatedidentity id", slog.Any("error", err))
		return nil, err
	}
	if federatedidentity == nil {
		err := fmt.Errorf("FederatedIdentity does not exist for id: %v", federatedidentityID.Hex())
		s.logger.Debug("Failed getting local federatedidentity id", slog.Any("error", err))
		return nil, err
	}

	return &HelloResponse{
		Message:           fmt.Sprintf("Hello, %s!", federatedidentity.FirstName),
		FederatedIdentity: federatedidentity,
	}, nil
}
