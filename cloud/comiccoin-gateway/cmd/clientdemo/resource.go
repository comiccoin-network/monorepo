// cmd/clientdemo/resource.go
package clientdemo

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/spf13/cobra"
)

type ResourceServerConfig struct {
	AccessToken  string
	RefreshToken string
	Port         string
}

func ResourceCmd() *cobra.Command {
	config := &ResourceServerConfig{
		Port: ":8082",
	}

	cmd := &cobra.Command{
		Use:   "resource",
		Short: "Run resource server demo using OAuth tokens",
		Run: func(cmd *cobra.Command, args []string) {
			runResourceServer(config)
		},
	}

	cmd.Flags().StringVar(&config.AccessToken, "access-token", "", "OAuth access token")
	cmd.Flags().StringVar(&config.RefreshToken, "refresh-token", "", "OAuth refresh token")
	cmd.MarkFlagRequired("access-token")
	cmd.MarkFlagRequired("refresh-token")

	return cmd
}

type IntrospectionResponse struct {
	Active    bool   `json:"active"`
	Scope     string `json:"scope"`
	ClientID  string `json:"client_id"`
	ExpiresAt int64  `json:"exp"`
	IssuedAt  int64  `json:"iat"`
}

func validateToken(token string) (*IntrospectionResponse, error) {
	req, err := http.NewRequest("POST", "http://localhost:8080/oauth/introspect",
		strings.NewReader("token="+token))
	if err != nil {
		return nil, err
	}

	req.SetBasicAuth(clientID, clientSecret)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var introspection IntrospectionResponse
	if err := json.NewDecoder(resp.Body).Decode(&introspection); err != nil {
		return nil, err
	}

	return &introspection, nil
}

func refreshAccessToken(refreshToken string) (*TokenResponse, error) {
	data := strings.NewReader(fmt.Sprintf(
		"grant_type=refresh_token&refresh_token=%s&client_id=%s&client_secret=%s",
		refreshToken, clientID, clientSecret))

	req, err := http.NewRequest("POST", "http://localhost:8080/oauth/refresh", data)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var tokenResp TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}

	return &tokenResp, nil
}

func runResourceServer(config *ResourceServerConfig) {
	currentToken := config.AccessToken

	http.HandleFunc("/api/resource", func(w http.ResponseWriter, r *http.Request) {
		// Validate token
		introspection, err := validateToken(currentToken)
		if err != nil || !introspection.Active {
			// Try refreshing token
			tokenResp, err := refreshAccessToken(config.RefreshToken)
			if err != nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			currentToken = tokenResp.AccessToken

			// Validate new token
			introspection, err = validateToken(currentToken)
			if err != nil || !introspection.Active {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
		}

		// Return protected resource
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Protected resource accessed successfully",
			"time":    time.Now(),
			"scope":   introspection.Scope,
		})
	})

	fmt.Printf("Resource server running on http://localhost%s\n", config.Port)
	fmt.Printf("Try: curl http://localhost%s/api/resource\n", config.Port)
	log.Fatal(http.ListenAndServe(config.Port, nil))
}
