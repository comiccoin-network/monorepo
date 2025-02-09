// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/service/hello/service.go
package hello

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/domain/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/usecase/user"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type HelloResponse struct {
	Message string         `json:"message"`
	User    *dom_user.User `json:"user"`
}

type HelloService interface {
	SayHello(ctx context.Context) (*HelloResponse, error)
}

type helloServiceImpl struct {
	config             *config.Configuration
	logger             *slog.Logger
	getUserByIDUseCase uc_user.UserGetByIDUseCase
}

func NewHelloService(
	config *config.Configuration,
	logger *slog.Logger,
	getUserByIDUseCase uc_user.UserGetByIDUseCase,
) HelloService {
	return &helloServiceImpl{
		config:             config,
		logger:             logger,
		getUserByIDUseCase: getUserByIDUseCase,
	}
}

func (s *helloServiceImpl) SayHello(ctx context.Context) (*HelloResponse, error) {
	// Get authenticated user ID from context
	userID, ok := ctx.Value("user_id").(string)
	if !ok {
		return nil, errors.New("user not found in context")
	}

	// Convert string to ObjectID
	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}

	// Get user details
	user, err := s.getUserByIDUseCase.Execute(ctx, userObjID)
	if err != nil {
		return nil, err
	}

	return &HelloResponse{
		Message: fmt.Sprintf("Hello, %s!", user.FirstName),
		User:    user,
	}, nil
}
