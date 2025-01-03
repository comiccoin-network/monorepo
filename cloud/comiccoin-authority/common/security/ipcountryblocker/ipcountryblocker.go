package ipcountryblocker

import (
	"fmt"
	"log"
	"log/slog"
	"net"

	"github.com/oschwald/geoip2-golang"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin-authority/config"
)

// Provider provides an interface for abstracting country wide blocking by IP address.
type Provider interface {
	IsAllowedCountry(isoCodeOfCountry string) bool
	IsAllowedIPAddress(ipAddress net.IP) bool

	// Method returns the `ISO 3166-1 alpha-2` country code of the particular IP address.
	ISOCountryCodeOfIPAddress(ipAddress net.IP) (string, error)
}

type ipCountryBlockerProvider struct {
	logger           *slog.Logger
	db               *geoip2.Reader
	blockedCountries map[string]bool
}

// NewProvider Provider constructor that returns the default time provider.
func NewProvider(cfg *config.Configuration, logger *slog.Logger) Provider {
	db, err := geoip2.Open(cfg.App.GeoLiteDBPath)
	if err != nil {
		log.Fatalf("Failed opening GeoLite2 DB for path: %v with error: %v", cfg.App.GeoLiteDBPath, err)
	}

	blockedCountries := make(map[string]bool)
	for _, country := range cfg.App.BannedCountries {
		blockedCountries[country] = true
	}

	logger.Debug("ip country blocker successfully initialized",
		slog.Any("db_path", cfg.App.GeoLiteDBPath),
		slog.Any("banned_countries", cfg.App.BannedCountries),
	)

	return ipCountryBlockerProvider{
		logger:           logger,
		db:               db,
		blockedCountries: blockedCountries,
	}
}

func (p ipCountryBlockerProvider) IsAllowedCountry(isoCodeOfCountry string) bool {
	return p.blockedCountries[isoCodeOfCountry]
}

func (p ipCountryBlockerProvider) IsAllowedIPAddress(ipAddress net.IP) bool {
	isoCountryCode, _ := p.ISOCountryCodeOfIPAddress(ipAddress)
	return p.blockedCountries[isoCountryCode]
}

func (p ipCountryBlockerProvider) ISOCountryCodeOfIPAddress(ipAddress net.IP) (string, error) {
	// Look up country
	record, err := p.db.Country(ipAddress)
	if err != nil {
		p.logger.Error("Failed looking up country by IP",
			slog.Any("ip_address", ipAddress),
			slog.Any("error", err),
		)
		return "", err
	}
	if record == nil {
		err := fmt.Errorf("Country d.n.e. for IP: %v", ipAddress)
		p.logger.Error("Failed looking up country by IP",
			slog.Any("ip_address", ipAddress),
			slog.Any("error", err),
		)
		return "", nil
	}
	return record.Country.IsoCode, nil
}
