// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/interface/http/middleware/utils.go
package middleware

import (
	"regexp"
)

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
		"/iam/api/v1/say-hello":         true,
		"/iam/api/v1/token/introspect":  true,
		"/iam/api/v1/profile":           true,
		"/iam/api/v1/me":                true,
		"/iam/api/v1/me/connect-wallet": true,
		"/iam/api/v1/me/delete":         true,
		"/iam/api/v1/dashboard":         true,
		"/iam/api/v1/claim-coins":       true,
		"/iam/api/v1/transactions":      true,
		"/iam/api/v1/me/verify-profile": true,
	}

	// Pattern matches
	patterns := []string{
		"^/iam/api/v1/user/[0-9]+$",
		"^/iam/api/v1/wallet/[0-9a-f]+$",
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
	// fmt.Println("isProtectedPath - path:", path) // For debugging purposes only.

	// Check exact matches first (O(1) lookup)
	if exactPaths[path] {
		// fmt.Println("isProtectedPath - ✅ found") // For debugging purposes only.
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
