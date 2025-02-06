package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

type GetHealthCheckHTTPHandler struct {
	logger *slog.Logger
}

func NewGetHealthCheckHTTPHandler(
	logger *slog.Logger,
) *GetHealthCheckHTTPHandler {
	return &GetHealthCheckHTTPHandler{logger}
}

type HealthCheckResponseIDO struct {
	Status string `json:"status"`
}

func (h *GetHealthCheckHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Set the content type of the response to application/json.
	w.Header().Set("Content-Type", "application/json")

	response := HealthCheckResponseIDO{Status: "running"}
	json.NewEncoder(w).Encode(response)
}
