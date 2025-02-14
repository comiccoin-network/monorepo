// github.com/comiccoin-network/monorepo/cloud/comiccoin-publicfaucet/interface/http/middleware/utils.go
package middleware

import "regexp"

type protectedRoute struct {
	pattern string
	regex   *regexp.Regexp
}

var (
	exactPaths    = make(map[string]bool)
	patternRoutes []protectedRoute
)

func init() {
	// Exact matches
	exactPaths = map[string]bool{
		"/api/say-hello":         true,
		"/api/token/introspect":  true,
		"/api/profile":           true,
		"/api/me":                true,
		"/api/me/connect-wallet": true,
	}

	// Pattern matches
	patterns := []string{
		"^/api/user/[0-9]+$",
		"^/api/wallet/[0-9a-f]+$",
	}

	// Precompile patterns
	patternRoutes = make([]protectedRoute, len(patterns))
	for i, pattern := range patterns {
		patternRoutes[i] = protectedRoute{
			pattern: pattern,
			regex:   regexp.MustCompile(pattern),
		}
	}
}

func isProtectedPath(path string) bool {
	// Check exact matches first (O(1) lookup)
	if exactPaths[path] {
		return true
	}

	// Check patterns
	for _, route := range patternRoutes {
		if route.regex.MatchString(path) {
			return true
		}
	}

	return false
}
