package unifiedhttp

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

type GetAppleAppSiteAssociationHTTPHandler struct {
	logger *slog.Logger
}

func NewGetAppleAppSiteAssociationHTTPHandler(
	logger *slog.Logger,
) *GetAppleAppSiteAssociationHTTPHandler {
	return &GetAppleAppSiteAssociationHTTPHandler{logger}
}

// AppLinks represents the "applinks" section of the Apple App Site Association file
type AppLinks struct {
	Details []AppDetail `json:"details"`
}

// AppDetail contains the app IDs that can handle specific paths
type AppDetail struct {
	AppIDs []string `json:"appIDs"`
}

// WebCredentials represents the "webcredentials" section of the Apple App Site Association file
type WebCredentials struct {
	Apps []string `json:"apps"`
}

// AppleAppSiteAssociation represents the root structure of the file
type AppleAppSiteAssociation struct {
	AppLinks       AppLinks       `json:"applinks"`
	WebCredentials WebCredentials `json:"webcredentials"`
}

func (h *GetAppleAppSiteAssociationHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	// Set the content type of the response to application/json
	w.Header().Set("Content-Type", "application/json")

	// Log that we're serving the Apple App Site Association file
	h.logger.Info("serving Apple App Site Association file", "remote_addr", r.RemoteAddr)

	// Create the response structure with both applinks and webcredentials
	response := AppleAppSiteAssociation{
		AppLinks: AppLinks{
			Details: []AppDetail{
				{
					AppIDs: []string{},
				},
			},
		},
		WebCredentials: WebCredentials{
			Apps: []string{
				"LQQ8LQ952U.com.theshootingstarpress.comiccoinwallet",
				"LQQ8LQ952U.com.theshootingstarpress.comiccoinwallet",
			},
		},
	}

	// Encode the response as JSON and write to the response writer
	err := json.NewEncoder(w).Encode(response)
	if err != nil {
		h.logger.Error("failed to encode Apple App Site Association response", "error", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}
