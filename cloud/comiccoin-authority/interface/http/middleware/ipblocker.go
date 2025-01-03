package middleware

import (
	"log/slog"
	"net"
	"net/http"
)

func (mid *middleware) EnforceRestrictCountryIPsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		// Extract IP address from request
		ipStr, _, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			mid.Logger.Warn("failed splitting host port",
				slog.Any("url", r.URL.Path),
				slog.Any("r.RemoteAddr", r.RemoteAddr),
				slog.Any("middleware", "EnforceRestrictCountryIPsMiddleware"))
			http.Error(w, "Invalid IP address", http.StatusBadRequest)
			return
		}

		ip := net.ParseIP(ipStr)
		if ip == nil {
			mid.Logger.Warn("failed parsing ip address",
				slog.Any("url", r.URL.Path),
				slog.Any("r.RemoteAddr", ipStr),
				slog.Any("middleware", "EnforceRestrictCountryIPsMiddleware"))
			http.Error(w, "Invalid IP address", http.StatusBadRequest)
			return
		}

		// Look up country
		isoCodeOfCountry, err := mid.IPCountryBlocker.ISOCountryCodeOfIPAddress(ip)
		if err != nil {
			mid.Logger.Warn("failed looking up country by ip address",
				slog.Any("url", r.URL.Path),
				slog.Any("ip_address", ip),
				slog.Any("middleware", "EnforceRestrictCountryIPsMiddleware"))
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Check if country is blocked
		if mid.IPCountryBlocker.IsAllowedCountry(isoCodeOfCountry) {
			mid.Logger.Warn("rejected request by country ip address",
				slog.Any("url", r.URL.Path),
				slog.Any("ip_address", ip),
				slog.Any("country", isoCodeOfCountry),
				slog.Any("middleware", "EnforceRestrictCountryIPsMiddleware"))
			http.Error(w, "Access denied from your country", http.StatusForbidden)
			return
		}

		next(w, r.WithContext(ctx))
	}
}
