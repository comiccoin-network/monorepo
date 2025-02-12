// github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/cmd/clientdemo/authorize.go
package clientdemo

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"text/template"
	"time"

	"github.com/spf13/cobra"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/blacklist"
	ipcb "github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/ipcountryblocker"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/security/jwt"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/common/storage/database/mongodbcache"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin-gateway/config"
)

func AuthorizeCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "authorize",
		Short: "Run the sample client demonstration server",
		Run: func(cmd *cobra.Command, args []string) {
			doRunAuthorize()
		},
	}
	return cmd
}

func doRunAuthorize() {
	//
	// STEP 1
	// Load up our dependencies and configuration
	//

	// Common
	logger := logger.NewProvider()
	_ = logger
	cfg := config.NewProviderUsingEnvironmentVariables()
	// kmutex := kmutexutil.NewKMutexProvider()
	dbClient := mongodb.NewProvider(cfg, logger)
	// keystore := hdkeystore.NewAdapter()
	// passp := password.NewProvider()
	blackp := blacklist.NewProvider()
	jwtp := jwt.NewProvider(cfg)
	cache := mongodbcache.NewCache(cfg, logger, dbClient)
	// emailer := mailgun.NewEmailer(cfg, logger)
	// templatedEmailer := templatedemailer.NewTemplatedEmailer(logger, emailer)
	// cloudstore := cloudstorage.NewCloudStorage(cfg, logger)
	ipcbp := ipcb.NewProvider(cfg, logger)

	_ = blackp
	_ = jwtp
	_ = cache
	_ = ipcbp

	//
	// STEP X
	// Execute.
	//

	// Handle different routes
	http.HandleFunc("/", handleHome)
	http.HandleFunc("/start-auth", handleStartAuth)
	http.HandleFunc("/callback", handleCallback)

	fmt.Printf("OAuth 2.0 Client running on %s...\n", clientPort)
	fmt.Printf("Visit http://localhost%s to start the authorization flow\n", clientPort)
	log.Fatal(http.ListenAndServe(clientPort, nil))

	// go httpServ.Run()
	// defer httpServ.Shutdown()
	// go taskManager.Run()
	// defer taskManager.Shutdown()
	//
	logger.Info("ComicCoin client example is running.")
	//
	// <-done
}

const (
	clientID      = "test_client"
	clientSecret  = "test_secret"
	authServerURL = "http://localhost:8080"
	clientPort    = ":8081"
)

// TokenResponse represents the OAuth server's token response
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	Scope        string `json:"scope"`
}

// Templates for different pages
const homePage = `
<!DOCTYPE html>
<html>
<head>
    <title>OAuth 2.0 Client</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        .container {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
        }
        .btn {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-top: 10px;
        }
        .info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>OAuth 2.0 Client Application</h1>

        <div class="info">
            <h3>Welcome to the Demo Application</h3>
            <p>This application demonstrates the OAuth 2.0 Authorization Code flow.</p>
            <p>Click the button below to start the authorization process.</p>
        </div>

        <a href="/start-auth" class="btn">Start Authorization</a>
    </div>
</body>
</html>
`

const successPage = `
<!DOCTYPE html>
<html>
<head>
    <title>Authorization Success</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        .container {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
        }
        .success-banner {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .token-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            word-break: break-all;
        }
        .btn {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-banner">
            <h2>✓ Authorization Successful!</h2>
        </div>

        <div class="token-info">
	  	    <h3>Access Token Details</h3>
	  	    <p><strong>Access Token:</strong> {{.AccessToken}}</p>
	  	    <p><strong>Token Type:</strong> {{.TokenType}}</p>
	  	    <p><strong>Expires In:</strong> {{.ExpiresIn}} seconds</p>
	  	    <p><strong>Refresh Token:</strong> {{.RefreshToken}}</p>
	  	    <p><strong>Scope:</strong> {{.Scope}}</p>
        </div>

        <a href="/" class="btn">Back to Home</a>
    </div>
</body>
</html>
`

var (
	homeTemplate    = template.Must(template.New("home").Parse(homePage))
	successTemplate = template.Must(template.New("success").Parse(successPage))
)

func handleHome(w http.ResponseWriter, r *http.Request) {
	// Display the home page with the authorization button
	homeTemplate.Execute(w, nil)
}

func handleStartAuth(w http.ResponseWriter, r *http.Request) {
	// Generate state parameter to prevent CSRF
	state := fmt.Sprintf("%d", time.Now().UnixNano())

	// Build the authorization URL
	authURL := fmt.Sprintf("%s/oauth/authorize?response_type=code&client_id=%s&redirect_uri=%s&state=%s",
		authServerURL,
		clientID,
		url.QueryEscape(fmt.Sprintf("http://localhost%s/callback", clientPort)),
		state)

	// Store the state in a session or cookie (simplified for demo)

	// Redirect the federatedidentity to the authorization server
	http.Redirect(w, r, authURL, http.StatusFound)
}

func handleCallback(w http.ResponseWriter, r *http.Request) {
	// Get the authorization code from the URL parameters
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Missing authorization code", http.StatusBadRequest)
		return
	}

	// Verify state parameter (simplified for demo)

	// Exchange the authorization code for an access token
	tokenURL := fmt.Sprintf("%s/oauth/token", authServerURL)
	data := url.Values{
		"grant_type":    {"authorization_code"},
		"code":          {code},
		"client_id":     {clientID},
		"client_secret": {clientSecret},
		"redirect_uri":  {fmt.Sprintf("http://localhost%s/callback", clientPort)},
	}

	resp, err := http.PostForm(tokenURL, data)
	if err != nil {
		log.Printf("Failed to make token request: %v", err)
		http.Error(w, "Failed to exchange authorization code for token", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Failed to read response body: %v", err)
		http.Error(w, "Failed to read token response", http.StatusInternalServerError)
		return
	}

	// Add this debug log to see the actual response
	log.Printf("Token response body: %s", string(body))

	var tokenResponse TokenResponse
	if err := json.Unmarshal(body, &tokenResponse); err != nil {
		log.Printf("Failed to parse JSON response: %v", err)
		http.Error(w, "Failed to parse token response", http.StatusInternalServerError)
		return
	}

	// Display the success page with token information
	successTemplate.Execute(w, tokenResponse)
}

/*
When your web app receives a request with a Bearer token, it should validate it using the introspection endpoint:

```go
// Example client code for token introspection
func validateToken(token string) (*oauth.IntrospectionResponse, error) {
    // Create the request
    req, err := http.NewRequest("POST", "http://auth-server/oauth/introspect",
        strings.NewReader("token="+url.QueryEscape(token)))
    if err != nil {
        return nil, err
    }

    // Add client authentication
    req.SetBasicAuth("client_id", "client_secret")
    req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

    // Send the request
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    // Parse the response
    var introspection oauth.IntrospectionResponse
    if err := json.NewDecoder(resp.Body).Decode(&introspection); err != nil {
        return nil, err
    }

    return &introspection, nil
}
```
*/

/*
For refreshing tokens, your client should:

Store both the access token and refresh token securely
Monitor the access token's expiration
Request a new access token using the refresh token when needed:

go
```
func refreshAccessToken(refreshToken string) (*oauth.TokenResponse, error) {
    data := url.Values{}
    data.Set("grant_type", "refresh_token")
    data.Set("refresh_token", refreshToken)
    data.Set("client_id", "your_client_id")
    data.Set("client_secret", "your_client_secret")

    resp, err := http.PostForm("http://auth-server/oauth/token", data)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var tokenResponse oauth.TokenResponse
    if err := json.NewDecoder(resp.Body).Decode(&tokenResponse); err != nil {
        return nil, err
    }

    return &tokenResponse, nil
}
```
*/
