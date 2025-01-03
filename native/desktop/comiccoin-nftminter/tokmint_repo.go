package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
)

const (
	tokenMintURL string = "/api/v1/tokens"
)

type TokenMintDTOConfigurationProvider interface {
	GetAuthorityAddress() string
	GetAuthorityAPIKey() string
}

type tokenMintDTOConfigurationProviderImpl struct {
	authorityAddress string
	authorityAPIKey  string
}

func NewTokenMintDTOConfigurationProvider(authorityAddress string, authorityAPIKey string) TokenMintDTOConfigurationProvider {
	return &tokenMintDTOConfigurationProviderImpl{
		authorityAddress: authorityAddress,
		authorityAPIKey:  authorityAPIKey,
	}
}

func (impl *tokenMintDTOConfigurationProviderImpl) GetAuthorityAddress() string {
	return impl.authorityAddress
}

func (impl *tokenMintDTOConfigurationProviderImpl) GetAuthorityAPIKey() string {
	return impl.authorityAPIKey
}

type TokenMintDTORepo struct {
	config TokenMintDTOConfigurationProvider
	logger *slog.Logger
}

func NewTokenMintDTORepo(
	config TokenMintDTOConfigurationProvider,
	logger *slog.Logger,
) *TokenMintDTORepo {

	return &TokenMintDTORepo{
		config: config,
		logger: logger,
	}
}

func (repo *TokenMintDTORepo) SubmitToBlockchainAuthority(ctx context.Context, dto *TokenMintDTO) error {
	httpEndpoint := fmt.Sprintf("%s%s", repo.config.GetAuthorityAddress(), tokenMintURL)
	jsonData, err := json.Marshal(dto)
	if err != nil {
		repo.logger.Error("Marshalling error",
			slog.Any("err", err),
		)
		return err
	}

	repo.logger.Debug("Submitting to HTTP JSON API",
		slog.String("url", httpEndpoint),
		slog.String("method", "POST"))

	// Create a new request
	req, err := http.NewRequestWithContext(ctx, "POST", httpEndpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		repo.logger.Error("Request creation error",
			slog.Any("err", err),
		)
		return err
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("JWT %s", repo.config.GetAuthorityAPIKey()))

	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		repo.logger.Error("Request error",
			slog.Any("err", err),
		)
		return err
	}
	defer resp.Body.Close()

	// Rest of the error handling remains the same
	if resp.StatusCode == http.StatusNotFound {
		err := fmt.Errorf("http endpoint does not exist for: %v", httpEndpoint)
		repo.logger.Error("Failed posting to blockchain authority",
			slog.Any("err", err),
		)
		return err
	}

	if resp.StatusCode == http.StatusBadRequest {
		e := make(map[string]string)
		var rawJSON bytes.Buffer
		teeReader := io.TeeReader(resp.Body, &rawJSON)

		var jsonStr string
		err := json.NewDecoder(teeReader).Decode(&jsonStr)
		if err != nil {
			repo.logger.Error("decoding string error",
				slog.Any("err", err),
				slog.String("json", rawJSON.String()),
			)
			return err
		}

		err = json.Unmarshal([]byte(jsonStr), &e)
		if err != nil {
			repo.logger.Error("decoding map error",
				slog.Any("err", err),
				slog.String("json", jsonStr),
			)
			return err
		}

		repo.logger.Debug("Parsed error response",
			slog.Any("errors", e),
		)
		return err
	}

	repo.logger.Debug("Token mint submitted to blockchain authority",
		slog.Any("url", httpEndpoint),
		slog.Int("status", resp.StatusCode),
	)

	return nil
}
