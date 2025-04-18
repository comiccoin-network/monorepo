package config

type DBConfig struct {
	URI  string
	Name string
}

type OAuthConfig struct {
	ServerURL                        string
	ClientID                         string
	ClientSecret                     string
	ClientRedirectURI                string
	ClientRegisterSuccessURI         string
	ClientRegisterCancelURI          string
	ClientAuthorizeOrLoginSuccessURI string
	ClientAuthorizeOrLoginCancelURI  string
}

// Configuration provides all the environment variables to access our remote
// oAuth 2.0 server.
type Configuration struct {
	OAuth OAuthConfig
	DB    DBConfig
}
