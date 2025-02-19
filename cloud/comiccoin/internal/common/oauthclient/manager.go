// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/manager.go
package oauth

import (
	"context"
	"log/slog"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	config "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/config"
	dom_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/federatedidentity"
	dom_remotefederatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/domain/remotefederatedidentity"
	http_introspection "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/interface/http/introspection"
	http_login "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/interface/http/login"
	http_mid "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/interface/http/middleware"
	http_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/interface/http/oauth"
	http_profile "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/interface/http/profile"
	http_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/interface/http/registration"
	http_tok "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/interface/http/token"
	http_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/interface/http/token"
	r_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/federatedidentity"
	r_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauth"
	r_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauthsession"
	r_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/oauthstate"
	r_profile "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/profile"
	r_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/registration"
	r_remotefederatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/remotefederatedidentity"
	r_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/repo/token"
	svc_introspection "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/introspection"
	svc_login "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/login"
	svc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/oauth"
	svc_profile "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/profile"
	svc_registration "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/registration"
	svc_remotefederatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/remotefederatedidentity"
	svc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/service/token"
	uc_federatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/federatedidentity"
	uc_oauth "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauth"
	uc_oauthsession "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauthsession"
	uc_oauthstate "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/oauthstate"
	uc_profile "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/profile"
	uc_register "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/register"
	uc_remotefederatedidentity "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/remotefederatedidentity"
	uc_token "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/oauthclient/usecase/token"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodbcache"
)

type Manager interface {
	// Database
	GetLocalFederatedIdentityByFederatedIdentityID(ctx context.Context, federatedIdentityID primitive.ObjectID) (*dom_federatedidentity.FederatedIdentity, error)

	// Use-case / Service
	GetRegistrationURL(ctx context.Context) (*svc_oauth.GetRegistrationURLResponse, error)
	Login(ctx context.Context, loginReq *svc_login.LoginRequest) (*svc_login.LoginResponse, error)
	ExchangeToken(ctx context.Context, req *svc_oauth.ExchangeTokenRequest) (*svc_oauth.ExchangeTokenResponse, error)
	FetchFederatedIdentityFromRemoteByAccessToken(ctx context.Context, accessToken string) (*dom_remotefederatedidentity.RemoteFederatedIdentityDTO, error)
	UpdateFederatedIdentityInRemoteWithAccessToken(ctx context.Context, req *dom_remotefederatedidentity.RemoteFederatedIdentityDTO, accessToken string) error

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
	GetRegistrationURLHTTPHandler() *http_oauth.GetRegistrationURLHTTPHandler
	FetchProfileFromComicCoinGatewayHandler() *http_profile.FetchProfileFromComicCoinGatewayHandler
}

// Manager provides a high-level interface for OAuth operations while orchestrating
// the underlying clean architecture components
type managerImpl struct {
	config *config.Configuration
	logger *slog.Logger

	// Use-Case
	federatedidentityGetByIDUseCase       uc_federatedidentity.FederatedIdentityGetByIDUseCase
	fetchRemoteFederdatedIdentityUseCase  uc_remotefederatedidentity.FetchRemoteFederdatedIdentityUseCase
	updateRemoteFederdatedIdentityUseCase uc_remotefederatedidentity.UpdateRemoteFederdatedIdentityUseCase

	// Service
	getRegistrationURLService             svc_oauth.GetRegistrationURLService
	registration                          svc_registration.RegistrationService
	loginService                          svc_login.LoginService
	refreshTokenService                   svc_token.RefreshTokenService
	introspectionService                  svc_introspection.IntrospectionService
	oauthAuthURLService                   svc_oauth.GetAuthURLService
	oauthCallbackService                  svc_oauth.CallbackService
	oauthStateManagementService           svc_oauth.StateManagementService
	oauthSessionInfoService               svc_oauth.OAuthSessionInfoService
	exchangeService                       svc_oauth.ExchangeService
	fetchRemoteFederdatedIdentityService  svc_remotefederatedidentity.FetchRemoteFederdatedIdentityService
	updateRemoteFederdatedIdentityService svc_remotefederatedidentity.UpdateRemoteFederdatedIdentityService

	// HTTP Interface
	authMiddleware                          *http_mid.AuthMiddleware
	postRegistrationHTTPHandler             *http_registration.PostRegistrationHTTPHandler
	postLoginHTTPHandler                    *http_login.PostLoginHTTPHandler
	postTokenRefreshHTTPHandler             *http_tok.PostTokenRefreshHTTPHandler
	postTokenIntrospectionHTTPHandler       *http_introspection.PostTokenIntrospectionHTTPHandler
	getAuthURLHTTPHandler                   *http_oauth.GetAuthURLHTTPHandler
	callbackHTTPHandler                     *http_oauth.CallbackHTTPHandler
	stateManagementHTTPHandler              *http_oauth.StateManagementHTTPHandler
	oAuthSessionInfoHTTPHandler             *http_oauth.OAuthSessionInfoHTTPHandler
	getRegistrationURLHTTPHandler           *http_oauth.GetRegistrationURLHTTPHandler
	fetchProfileFromComicCoinGatewayHandler *http_profile.FetchProfileFromComicCoinGatewayHandler
}

// NewManager creates a new OAuth manager that orchestrates all OAuth operations
func NewManager(ctx context.Context, cfg *config.Configuration, logger *slog.Logger, mongoCache mongodbcache.Cacher, mongoClient *mongo.Client) (Manager, error) {
	// Initialize repositories
	federatedidentityRepo := r_federatedidentity.NewRepository(cfg, logger, mongoClient)
	tokenRepo := r_token.NewRepository(cfg, logger, mongoClient)
	oauthRepo := r_oauth.NewRepository(cfg, logger)
	registrationRepo := r_registration.NewRepository(cfg, logger)
	oauthsessionRepo := r_oauthsession.NewRepository(cfg, logger, mongoClient)
	oauthstateRepo := r_oauthstate.NewRepository(cfg, logger, mongoClient)
	profileRepo := r_profile.NewRepository(cfg, logger)
	remotefederatedidentityRepo := r_remotefederatedidentity.NewRepository(cfg, logger)

	// --- FederatedIdentity ---

	federatedidentityGetBySessionIDUseCase := uc_federatedidentity.NewFederatedIdentityGetBySessionIDUseCase(
		cfg,
		logger,
		mongoCache,
	)
	_ = federatedidentityGetBySessionIDUseCase
	federatedidentityGetByEmailUseCase := uc_federatedidentity.NewFederatedIdentityGetByEmailUseCase(
		cfg,
		logger,
		federatedidentityRepo,
	)
	federatedidentityGetByIDUseCase := uc_federatedidentity.NewFederatedIdentityGetByIDUseCase(
		cfg,
		logger,
		federatedidentityRepo,
	)
	federatedidentityCreateUseCase := uc_federatedidentity.NewFederatedIdentityCreateUseCase(
		cfg,
		logger,
		federatedidentityRepo,
	)
	federatedidentityUpdateUseCase := uc_federatedidentity.NewFederatedIdentityUpdateUseCase(
		cfg,
		logger,
		federatedidentityRepo,
	)
	_ = federatedidentityUpdateUseCase     //TODO: Utilize
	_ = federatedidentityCreateUseCase     //TODO: Utilize
	_ = federatedidentityGetByEmailUseCase //TODO: Utilize

	// --- Token ---
	tokenUpsertByFederatedIdentityIDUseCase := uc_token.NewTokenUpsertByFederatedIdentityIDUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	tokenGetByFederatedIdentityIDUseCase := uc_token.NewTokenGetByFederatedIdentityIDUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	tokenDeleteExpiredUseCase := uc_token.NewTokenDeleteExpiredUseCase(
		cfg,
		logger,
		tokenRepo,
	)
	_ = tokenDeleteExpiredUseCase               //TODO: Utilize
	_ = tokenUpsertByFederatedIdentityIDUseCase //TODO: Utilize
	_ = tokenGetByFederatedIdentityIDUseCase    //TODO: Utilize

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
	getRegistrationURLUseCase := uc_oauth.NewGetRegistrationURLUseCase(
		cfg,
		logger,
		oauthRepo,
	)

	_ = getAuthorizationURLUseCase //TODO: Utilize
	_ = exchangeCodeUseCase        //TODO: Utilize
	_ = refreshTokenUseCase        //TODO: Utilize
	_ = introspectTokenUseCase     //TODO: Utilize
	_ = getRegistrationURLUseCase

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
	getOAuthSessionByFederatedIdentityIDUseCase := uc_oauthsession.NewGetOAuthSessionByFederatedIdentityIDUseCase(
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

	_ = createOAuthSessionUseCase                   //TODO: Utilize
	_ = deleteExpiredOAuthSessionsUseCase           //TODO: Utilize
	_ = deleteOAuthSessionUseCase                   //TODO: Utilize
	_ = getOAuthSessionByFederatedIdentityIDUseCase //TODO: Utilize
	_ = updateOAuthSessionUseCase                   //TODO: Utilize

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

	// --- Profile ---

	fetchProfileFromComicCoinGatewayUseCase := uc_profile.NewFetchProfileFromComicCoinGatewayUseCase(
		cfg,
		logger,
		profileRepo,
	)

	// --- Remote Federated Identity  ---

	fetchRemoteFederdatedIdentityUseCase := uc_remotefederatedidentity.NewFetchRemoteFederdatedIdentityUseCase(
		cfg,
		logger,
		remotefederatedidentityRepo,
	)
	updateRemoteFederdatedIdentityUseCase := uc_remotefederatedidentity.NewUpdateRemoteFederdatedIdentityUseCase(
		cfg,
		logger,
		remotefederatedidentityRepo,
	)

	//
	// Service
	//

	// --- Authorization / Authentication / Etc ---

	registration := svc_registration.NewRegistrationService(
		cfg,
		logger,
		registerUseCase,
		exchangeCodeUseCase,
		federatedidentityCreateUseCase,
		federatedidentityGetByEmailUseCase,
		tokenUpsertByFederatedIdentityIDUseCase,
	)
	_ = registration

	loginService := svc_login.NewLoginService(
		cfg,
		logger,
		getAuthorizationURLUseCase,
		exchangeCodeUseCase,
		federatedidentityGetByEmailUseCase,
		tokenUpsertByFederatedIdentityIDUseCase,
	)
	_ = loginService

	refreshTokenService := svc_token.NewRefreshTokenService(
		cfg,
		logger,
		refreshTokenUseCase,
		tokenGetByFederatedIdentityIDUseCase,
		tokenUpsertByFederatedIdentityIDUseCase,
	)
	_ = refreshTokenService
	introspectionService := svc_introspection.NewIntrospectionService(
		cfg,
		logger,
		introspectTokenUseCase,
		tokenGetByFederatedIdentityIDUseCase,
		federatedidentityGetByIDUseCase,
	)
	_ = introspectionService

	// --- OAuth services ---

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
		federatedidentityCreateUseCase,
		federatedidentityGetByEmailUseCase,
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
		federatedidentityGetByIDUseCase,
		introspectTokenUseCase,
	)

	exchangeService := svc_oauth.NewExchangeService(
		cfg,
		logger,
		exchangeCodeUseCase,
		introspectTokenUseCase,
		federatedidentityCreateUseCase,
		federatedidentityGetByEmailUseCase,
		tokenUpsertByFederatedIdentityIDUseCase,
	)

	getRegistrationURLService := svc_oauth.NewGetRegistrationURLService(
		cfg,
		logger,
		getRegistrationURLUseCase,
		createOAuthStateUseCase,
	)

	// --- Profile ---

	fetchProfileFromComicCoinGatewayService := svc_profile.NewFetchProfileFromComicCoinGatewayService(
		cfg,
		logger,
		fetchProfileFromComicCoinGatewayUseCase,
	)

	// --- Remote FI ---

	fetchRemoteFederdatedIdentityService := svc_remotefederatedidentity.NewFetchRemoteFederdatedIdentityService(
		cfg,
		logger,
		fetchRemoteFederdatedIdentityUseCase,
		federatedidentityGetByIDUseCase,
		federatedidentityCreateUseCase,
		federatedidentityUpdateUseCase,
	)
	updateRemoteFederdatedIdentityService := svc_remotefederatedidentity.NewUpdateRemoteFederdatedIdentityService(
		cfg,
		logger,
		updateRemoteFederdatedIdentityUseCase,
		federatedidentityGetByIDUseCase,
		federatedidentityCreateUseCase,
		federatedidentityUpdateUseCase,
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
	fetchProfileFromComicCoinGatewayHandler := http_profile.NewFetchProfileFromComicCoinGatewayHandler(
		cfg,
		logger,
		fetchProfileFromComicCoinGatewayService,
	)

	getRegistrationURLHTTPHandler := http_oauth.NewGetRegistrationURLHTTPHandler(
		cfg,
		logger,
		getRegistrationURLService,
	)

	return &managerImpl{
		config:                                  cfg,
		logger:                                  logger,
		federatedidentityGetByIDUseCase:         federatedidentityGetByIDUseCase,
		fetchRemoteFederdatedIdentityUseCase:    fetchRemoteFederdatedIdentityUseCase,
		fetchRemoteFederdatedIdentityService:    fetchRemoteFederdatedIdentityService,
		updateRemoteFederdatedIdentityService:   updateRemoteFederdatedIdentityService,
		getRegistrationURLService:               getRegistrationURLService,
		registration:                            registration,
		loginService:                            loginService,
		refreshTokenService:                     refreshTokenService,
		introspectionService:                    introspectionService,
		oauthAuthURLService:                     oauthAuthURLService,
		oauthCallbackService:                    oauthCallbackService,
		oauthStateManagementService:             oauthStateManagementService,
		oauthSessionInfoService:                 oauthSessionInfoService,
		exchangeService:                         exchangeService,
		authMiddleware:                          authMiddleware,
		postRegistrationHTTPHandler:             postRegistrationHTTPHandler,
		postLoginHTTPHandler:                    postLoginHTTPHandler,
		postTokenRefreshHTTPHandler:             postTokenRefreshHTTPHandler,
		postTokenIntrospectionHTTPHandler:       postTokenIntrospectionHTTPHandler,
		getAuthURLHTTPHandler:                   getAuthURLHTTPHandler,
		callbackHTTPHandler:                     callbackHTTPHandler,
		stateManagementHTTPHandler:              stateManagementHTTPHandler,
		oAuthSessionInfoHTTPHandler:             oAuthSessionInfoHTTPHandler,
		fetchProfileFromComicCoinGatewayHandler: fetchProfileFromComicCoinGatewayHandler,
		getRegistrationURLHTTPHandler:           getRegistrationURLHTTPHandler,
	}, nil
}

func (m *managerImpl) GetLocalFederatedIdentityByFederatedIdentityID(ctx context.Context, federatedIdentityID primitive.ObjectID) (*dom_federatedidentity.FederatedIdentity, error) {
	return m.federatedidentityGetByIDUseCase.Execute(ctx, federatedIdentityID)
}

func (m *managerImpl) GetRegistrationURL(ctx context.Context) (*svc_oauth.GetRegistrationURLResponse, error) {
	return m.getRegistrationURLService.Execute(ctx)
}

func (m *managerImpl) Login(ctx context.Context, loginReq *svc_login.LoginRequest) (*svc_login.LoginResponse, error) {
	return m.loginService.ProcessLogin(ctx, loginReq)
}

func (m *managerImpl) ExchangeToken(ctx context.Context, req *svc_oauth.ExchangeTokenRequest) (*svc_oauth.ExchangeTokenResponse, error) {
	return m.exchangeService.ExchangeToken(ctx, req)
}

func (m *managerImpl) FetchFederatedIdentityFromRemoteByAccessToken(ctx context.Context, accessToken string) (*dom_remotefederatedidentity.RemoteFederatedIdentityDTO, error) {
	return m.fetchRemoteFederdatedIdentityService.Execute(ctx, accessToken)
}

func (m *managerImpl) UpdateFederatedIdentityInRemoteWithAccessToken(ctx context.Context, req *dom_remotefederatedidentity.RemoteFederatedIdentityDTO, accessToken string) error {
	return m.updateRemoteFederdatedIdentityService.Execute(ctx, req, accessToken)
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

func (m *managerImpl) FetchProfileFromComicCoinGatewayHandler() *http_profile.FetchProfileFromComicCoinGatewayHandler {
	return m.fetchProfileFromComicCoinGatewayHandler
}

func (m *managerImpl) GetRegistrationURLHTTPHandler() *http_oauth.GetRegistrationURLHTTPHandler {
	return m.getRegistrationURLHTTPHandler
}
