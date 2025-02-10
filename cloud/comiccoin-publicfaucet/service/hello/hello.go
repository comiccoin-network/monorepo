// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/hello/service.go
package hello

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"

	common_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/user"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
)

type HelloResponse struct {
	Message string         `json:"message"`
	User    *dom_user.User `json:"user"`
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
	// Get authenticated user ID from context
	userID, ok := ctx.Value("user_id").(primitive.ObjectID)
	if !ok {
		s.logger.Error("Failed getting local user id",
			slog.Any("error", "Not found in context: user_id"))
		return nil, errors.New("user not found in context")
	}

	// Get user details
	user, err := s.oauthManager.GetLocalUserByID(ctx, userID)
	if err != nil {
		s.logger.Debug("Failed getting local user id", slog.Any("error", err))
		return nil, err
	}
	if user == nil {
		err := fmt.Errorf("User does not exist for id: %v", userID.Hex())
		s.logger.Debug("Failed getting local user id", slog.Any("error", err))
		return nil, err
	}

	return &HelloResponse{
		Message: fmt.Sprintf("Hello, %s!", user.FirstName),
		User:    user,
	}, nil
}
