// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/manager.go
package oauth

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	config "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/config"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/domain/user"
	http_introspection "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/interface/http/introspection"
	http_login "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/interface/http/login"
	http_mid "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/interface/http/middleware"
	http_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/interface/http/oauth"
	http_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/interface/http/registration"
	http_tok "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/interface/http/token"
	http_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/interface/http/token"
	r_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/oauth"
	r_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/oauthsession"
	r_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/oauthstate"
	r_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/registration"
	r_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/token"
	r_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/repo/user"
	svc_introspection "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/introspection"
	svc_login "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/login"
	svc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/oauth"
	svc_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/registration"
	svc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/service/token"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauth"
	uc_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauthsession"
	uc_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/oauthstate"
	uc_register "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/register"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/token"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/oauthclient/usecase/user"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/common/storage/database/mongodbcache"
)

type Manager interface {
	// Database
	GetLocalUserByID(ctx context.Context, id primitive.ObjectID) (*dom_user.User, error)

	// Service
	Login(ctx context.Context, loginReq *svc_login.LoginRequest) (*svc_login.LoginResponse, error)

	// HTTP
	AuthMiddleware() *http_mid.AuthMiddleware
	PostRegistrationHTTPHandler() *http_registration.PostRegistrationHTTPHandler
	PostLoginHTTPHandler() *http_login.PostLoginHTTPHandler
	PostTokenRefreshHTTPHandler() *http_tok.PostTokenRefreshHTTPHandler
	PostTokenIntrospectionHTTPHandler() *http_introspection.PostTokenIntrospectionHTTPHandler
	GetAuthURLHTTPHandler() *http_oauth.GetAuthURLHTTPHandler
	CallbackHTTPHandler() *http_oauth.CallbackHTTPHandler
	StateManagementHTTPHandler() *http_oauth.StateManagementHTTPHandler
	OAuthSessionInfoHTTPHandler() *http_oauth.OAuthSessionInfoHTTPHandler
}

// Manager provides a high-level interface for OAuth operations while orchestrating
// the underlying clean architecture components
type managerImpl struct {
	config *config.Configuration
	logger *slog.Logger

	// Use-Case
	userGetByIDUseCase uc_user.UserGetByIDUseCase

	// Service
	registration                svc_registration.RegistrationService
	loginService                svc_login.LoginService
	refreshTokenService         svc_token.RefreshTokenService
	introspectionService        svc_introspection.IntrospectionService
	oauthAuthURLService         svc_oauth.GetAuthURLService
	oauthCallbackService        svc_oauth.CallbackService
	oauthStateManagementService svc_oauth.StateManagementService
	oauthSessionInfoService     svc_oauth.OAuthSessionInfoService

	// HTTP Interface
	authMiddleware                    *http_mid.AuthMiddleware
	postRegistrationHTTPHandler       *http_registration.PostRegistrationHTTPHandler
	postLoginHTTPHandler              *http_login.PostLoginHTTPHandler
	postTokenRefreshHTTPHandler       *http_tok.PostTokenRefreshHTTPHandler
	postTokenIntrospectionHTTPHandler *http_introspection.PostTokenIntrospectionHTTPHandler
	getAuthURLHTTPHandler             *http_oauth.GetAuthURLHTTPHandler
	callbackHTTPHandler               *http_oauth.CallbackHTTPHandler
	stateManagementHTTPHandler        *http_oauth.StateManagementHTTPHandler
	oAuthSessionInfoHTTPHandler       *http_oauth.OAuthSessionInfoHTTPHandler
}

// NewManager creates a new OAuth manager that orchestrates all OAuth operations
func NewManager(ctx context.Context, cfg *config.Configuration, logger *slog.Logger, mongoCache mongodbcache.Cacher, mongoClient *mongo.Client) (Manager, error) {
	// Initialize repositories
	userRepo := r_user.NewRepository(cfg, logger, mongoClient)
	tokenRepo := r_token.NewRepository(cfg, logger, mongoClient)
	oauthRepo := r_oauth.NewRepository(cfg, logger)
	registrationRepo := r_registration.NewRepository(cfg, logger)
	oauthsessionRepo := r_oauthsession.NewRepository(cfg, logger, mongoClient)
	oauthstateRepo := r_oauthstate.NewRepository(cfg, logger, mongoClient)

	// --- User ---
	userGetBySessionIDUseCase := uc_user.NewUserGetBySessionIDUseCase(
		cfg,
		logger,
		mongoCache,
	)
	_ = userGetBySessionIDUseCase
	userGetByEmailUseCase := uc_user.NewUserGetByEmailUseCase(
		cfg,
		logger,
		userRepo,
	)
	userGetByIDUseCase := uc_user.NewUserGetByIDUseCase(
		cfg,
		logger,
		userRepo,
	)
	userCreateUseCase := uc_user.NewUserCreateUseCase(
		cfg,
		logger,
		userRepo,
	)
	userUpdateUseCase := uc_user.NewUserUpdateUseCase(
		cfg,
		logger,
		userRepo,
	)
	_ = userUpdateUseCase     //TODO: Utilize
	_ = userCreateUseCase     //TODO: Utilize
	_ = userGetByEmailUseCase //TODO: Utilize

	// --- Token ---
	tokenUpsertByUserIDUseCase := uc_token.NewTokenUpsertByUserIDUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	tokenGetByUserIDUseCase := uc_token.NewTokenGetByUserIDUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	tokenDeleteExpiredUseCase := uc_token.NewTokenDeleteExpiredUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	_ = tokenDeleteExpiredUseCase  //TODO: Utilize
	_ = tokenUpsertByUserIDUseCase //TODO: Utilize
	_ = tokenGetByUserIDUseCase    //TODO: Utilize

	// --- oAuth 2.0 ---
	getAuthorizationURLUseCase := uc_oauth.NewGetAuthorizationURLUseCase(
		cfg,
		logger,
		oauthRepo,
	)
	exchangeCodeUseCase := uc_oauth.NewExchangeCodeUseCase(
		cfg,
		logger,
		oauthRepo,
	)
	refreshTokenUseCase := uc_oauth.NewRefreshTokenUseCase(
		cfg,
		logger,
		oauthRepo,
	)
	introspectTokenUseCase := uc_oauth.NewIntrospectTokenUseCase(
		cfg,
		logger,
		oauthRepo,
	)

	_ = getAuthorizationURLUseCase //TODO: Utilize
	_ = exchangeCodeUseCase        //TODO: Utilize
	_ = refreshTokenUseCase        //TODO: Utilize
	_ = introspectTokenUseCase     //TODO: Utilize

	// --- Registration ---

	registerUseCase := uc_register.NewRegisterUseCase(
		cfg,
		logger,
		registrationRepo,
	)
	_ = registerUseCase //TODO: Utilize

	// --- oAuth Session ---

	createOAuthSessionUseCase := uc_oauthsession.NewCreateOAuthSessionUseCase(
		cfg,
		logger,
		oauthsessionRepo,
	)
	deleteExpiredOAuthSessionsUseCase := uc_oauthsession.NewDeleteExpiredOAuthSessionsUseCase(
		cfg,
		logger,
		oauthsessionRepo,
	)
	deleteOAuthSessionUseCase := uc_oauthsession.NewDeleteOAuthSessionUseCase(
		cfg,
		logger,
		oauthsessionRepo,
	)
	getOAuthSessionByUserIDUseCase := uc_oauthsession.NewGetOAuthSessionByUserIDUseCase(
		cfg,
		logger,
		oauthsessionRepo,
	)
	getOAuthSessionUseCase := uc_oauthsession.NewGetOAuthSessionUseCase(
		cfg,
		logger,
		oauthsessionRepo,
	)
	updateOAuthSessionUseCase := uc_oauthsession.NewUpdateOAuthSessionUseCase(
		cfg,
		logger,
		oauthsessionRepo,
	)

	_ = createOAuthSessionUseCase         //TODO: Utilize
	_ = deleteExpiredOAuthSessionsUseCase //TODO: Utilize
	_ = deleteOAuthSessionUseCase         //TODO: Utilize
	_ = getOAuthSessionByUserIDUseCase    //TODO: Utilize
	_ = updateOAuthSessionUseCase         //TODO: Utilize

	// --- oAuth state ---

	createOAuthStateUseCase := uc_oauthstate.NewCreateOAuthStateUseCase(
		cfg,
		logger,
		oauthstateRepo,
	)
	getOAuthStateUseCase := uc_oauthstate.NewGetOAuthStateUseCase(
		cfg,
		logger,
		oauthstateRepo,
	)
	deleteOAuthStateUseCase := uc_oauthstate.NewDeleteOAuthStateUseCase(
		cfg,
		logger,
		oauthstateRepo,
	)
	// deleteOAuthStateUseCase := uc_oauthstate.NewDeleteOAuthStateUseCase(
	// 	cfg,
	// 	logger,
	// 	oauthstateRepo,
	// )
	deleteExpiredOAuthStatesUseCase := uc_oauthstate.NewDeleteExpiredOAuthStatesUseCase(
		cfg,
		logger,
		oauthstateRepo,
	)

	_ = createOAuthStateUseCase         //TODO: Utilize
	_ = getOAuthStateUseCase            //TODO: Utilize
	_ = deleteOAuthStateUseCase         //TODO: Utilize
	_ = deleteExpiredOAuthStatesUseCase //TODO: Utilize

	//
	// Service
	//

	// --- Authorization / Authentication / Etc ---

	registration := svc_registration.NewRegistrationService(
		cfg,
		logger,
		registerUseCase,
		exchangeCodeUseCase,
		userCreateUseCase,
		userGetByEmailUseCase,
		tokenUpsertByUserIDUseCase,
	)
	_ = registration

	loginService := svc_login.NewLoginService(
		cfg,
		logger,
		getAuthorizationURLUseCase,
		exchangeCodeUseCase,
		userGetByEmailUseCase,
		tokenUpsertByUserIDUseCase,
	)
	_ = loginService

	refreshTokenService := svc_token.NewRefreshTokenService(
		cfg,
		logger,
		refreshTokenUseCase,
		tokenGetByUserIDUseCase,
		tokenUpsertByUserIDUseCase,
	)
	_ = refreshTokenService
	introspectionService := svc_introspection.NewIntrospectionService(
		cfg,
		logger,
		introspectTokenUseCase,
		tokenGetByUserIDUseCase,
		tokenUpsertByUserIDUseCase,
		refreshTokenUseCase,
		userGetByIDUseCase,
	)
	_ = introspectionService

	// OAuth services
	oauthAuthURLService := svc_oauth.NewGetAuthURLService(
		cfg,
		logger,
		getAuthorizationURLUseCase,
		createOAuthStateUseCase,
	)

	oauthCallbackService := svc_oauth.NewCallbackService(
		cfg,
		logger,
		exchangeCodeUseCase,
		introspectTokenUseCase,
		getOAuthStateUseCase,
		deleteOAuthStateUseCase,
		createOAuthSessionUseCase,
		userCreateUseCase,
		userGetByEmailUseCase,
	)

	oauthStateManagementService := svc_oauth.NewStateManagementService(
		cfg,
		logger,
		getOAuthStateUseCase,
		deleteOAuthStateUseCase,
		deleteExpiredOAuthStatesUseCase,
	)

	oauthSessionInfoService := svc_oauth.NewOAuthSessionInfoService(
		cfg,
		logger,
		getOAuthSessionUseCase,
		userGetByIDUseCase,
		introspectTokenUseCase,
	)

	//
	// HTTP INTERFACE
	//

	authMiddleware := http_mid.NewAuthMiddleware(
		cfg,
		logger,
		introspectionService,
	)

	// --- Auth ---
	postRegistrationHTTPHandler := http_registration.NewPostRegistrationHTTPHandler(
		cfg,
		logger,
		registration,
	)
	postLoginHTTPHandler := http_login.NewPostLoginHTTPHandler(
		cfg,
		logger,
		loginService,
	)
	postTokenRefreshHTTPHandler := http_token.NewPostTokenRefreshHTTPHandler(
		cfg,
		logger,
		refreshTokenService,
	)
	postTokenIntrospectionHTTPHandler := http_introspection.NewPostTokenIntrospectionHTTPHandler(
		cfg,
		logger,
		introspectionService,
	)

	// --- oAuth 2.0 ---

	getAuthURLHTTPHandler := http_oauth.NewGetAuthURLHTTPHandler(
		cfg,
		logger,
		oauthAuthURLService,
	)
	callbackHTTPHandler := http_oauth.NewCallbackHTTPHandler(
		cfg,
		logger,
		oauthCallbackService,
	)
	stateManagementHTTPHandler := http_oauth.NewStateManagementHTTPHandler(
		cfg,
		logger,
		oauthStateManagementService,
	)
	oAuthSessionInfoHTTPHandler := http_oauth.NewOAuthSessionInfoHTTPHandler(
		cfg,
		logger,
		oauthSessionInfoService,
	)

	return &managerImpl{
		config:                            cfg,
		logger:                            logger,
		userGetByIDUseCase:                userGetByIDUseCase,
		registration:                      registration,
		loginService:                      loginService,
		refreshTokenService:               refreshTokenService,
		introspectionService:              introspectionService,
		oauthAuthURLService:               oauthAuthURLService,
		oauthCallbackService:              oauthCallbackService,
		oauthStateManagementService:       oauthStateManagementService,
		oauthSessionInfoService:           oauthSessionInfoService,
		authMiddleware:                    authMiddleware,
		postRegistrationHTTPHandler:       postRegistrationHTTPHandler,
		postLoginHTTPHandler:              postLoginHTTPHandler,
		postTokenRefreshHTTPHandler:       postTokenRefreshHTTPHandler,
		postTokenIntrospectionHTTPHandler: postTokenIntrospectionHTTPHandler,
		getAuthURLHTTPHandler:             getAuthURLHTTPHandler,
		callbackHTTPHandler:               callbackHTTPHandler,
		stateManagementHTTPHandler:        stateManagementHTTPHandler,
		oAuthSessionInfoHTTPHandler:       oAuthSessionInfoHTTPHandler,
	}, nil
}

func (m *managerImpl) GetLocalUserByID(ctx context.Context, id primitive.ObjectID) (*dom_user.User, error) {
	return m.userGetByIDUseCase.Execute(ctx, id)
}

func (m *managerImpl) Login(ctx context.Context, loginReq *svc_login.LoginRequest) (*svc_login.LoginResponse, error) {
	return m.loginService.ProcessLogin(ctx, loginReq)
}

func (m *managerImpl) AuthMiddleware() *http_mid.AuthMiddleware {
	return m.authMiddleware
}

func (m *managerImpl) PostRegistrationHTTPHandler() *http_registration.PostRegistrationHTTPHandler {
	return m.postRegistrationHTTPHandler
}

func (m *managerImpl) PostLoginHTTPHandler() *http_login.PostLoginHTTPHandler {
	return m.postLoginHTTPHandler
}

func (m *managerImpl) PostTokenRefreshHTTPHandler() *http_tok.PostTokenRefreshHTTPHandler {
	return m.postTokenRefreshHTTPHandler
}

func (m *managerImpl) PostTokenIntrospectionHTTPHandler() *http_introspection.PostTokenIntrospectionHTTPHandler {
	return m.postTokenIntrospectionHTTPHandler
}

func (m *managerImpl) GetAuthURLHTTPHandler() *http_oauth.GetAuthURLHTTPHandler {
	return m.getAuthURLHTTPHandler
}

func (m *managerImpl) CallbackHTTPHandler() *http_oauth.CallbackHTTPHandler {
	return m.callbackHTTPHandler
}

func (m *managerImpl) StateManagementHTTPHandler() *http_oauth.StateManagementHTTPHandler {
	return m.stateManagementHTTPHandler
}

func (m *managerImpl) OAuthSessionInfoHTTPHandler() *http_oauth.OAuthSessionInfoHTTPHandler {
	return m.oAuthSessionInfoHTTPHandler
}
