// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/user/list.go
package user

import (
	"errors"
	"log/slog"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
)

// ListUsersService defines the interface for listing users with pagination
type ListUsersService interface {
	Execute(sessCtx mongo.SessionContext, req *ListUsersRequestDTO) (*ListUsersResponseDTO, error)
}

// listUsersServiceImpl implements the ListUsersService interface
type listUsersServiceImpl struct {
	config   *config.Configuration
	logger   *slog.Logger
	dbClient *mongo.Client
}

// NewListUsersService creates a new instance of ListUsersService
func NewListUsersService(
	config *config.Configuration,
	logger *slog.Logger,
	dbClient *mongo.Client,
) ListUsersService {
	return &listUsersServiceImpl{
		config:   config,
		logger:   logger,
		dbClient: dbClient,
	}
}

// Execute processes the request to list users with pagination and filtering
func (svc *listUsersServiceImpl) Execute(sessCtx mongo.SessionContext, req *ListUsersRequestDTO) (*ListUsersResponseDTO, error) {
	//
	// Extract authenticated user information from context.
	//

	sessionUserRole, _ := sessCtx.Value(constants.SessionUserRole).(int8)
	if sessionUserRole != user.UserRoleRoot {
		svc.logger.Error("Wrong user permission",
			slog.Any("error", "User is not root"))
		return nil, errors.New("user is not administration")
	}

	//
	// Santize and validate input fields.
	//

	// Validation
	if req.Page < 1 {
		req.Page = 1
	}

	if req.PageSize < 1 || req.PageSize > 100 {
		req.PageSize = 20 // Default page size
	}

	// Get user collection
	collection := svc.dbClient.Database(svc.config.DB.IAMName).Collection("users")

	// Build filter
	filter := bson.M{}

	// Add role filter if specified
	if req.Role != 0 {
		filter["role"] = req.Role
	}

	// Add status filter if specified
	if req.Status != 0 {
		filter["status"] = req.Status
	}

	// Add search filter if specified
	if req.SearchTerm != "" {
		// Create a text search filter
		searchRegex := bson.M{"$regex": req.SearchTerm, "$options": "i"} // case-insensitive

		// Search in multiple fields
		filter["$or"] = []bson.M{
			{"name": searchRegex},
			{"email": searchRegex},
			{"phone": searchRegex},
		}
	}

	// Calculate pagination
	skip := (req.Page - 1) * req.PageSize
	limit := int64(req.PageSize)

	// Determine sort field and direction
	sortField := "created_at"
	if req.SortBy != "" {
		// Validate the sort field
		validFields := map[string]bool{
			"created_at": true,
			"name":       true,
			"email":      true,
			"role":       true,
			"status":     true,
		}

		if validFields[req.SortBy] {
			sortField = req.SortBy
		}
	}

	// Determine sort order
	sortDir := -1 // Default to descending
	if strings.ToLower(req.SortOrder) == "asc" {
		sortDir = 1
	}

	//
	// Get users list from database
	//

	//TODO: REPLACE THE CODE BELOW WITH THE USE-CASE.

	// Set up options
	findOptions := options.Find().
		SetSkip(int64(skip)).
		SetLimit(limit).
		SetSort(bson.D{{Key: sortField, Value: sortDir}})

	// Count total matching users
	totalCount, err := collection.CountDocuments(sessCtx, filter)
	if err != nil {
		svc.logger.Error("Failed to count users", slog.Any("error", err))
		return nil, err
	}

	// Execute the query
	cursor, err := collection.Find(sessCtx, filter, findOptions)
	if err != nil {
		svc.logger.Error("Failed to query users", slog.Any("error", err))
		return nil, err
	}
	defer cursor.Close(sessCtx)

	// Decode the results
	var users []*user.User
	if err = cursor.All(sessCtx, &users); err != nil {
		svc.logger.Error("Failed to decode users", slog.Any("error", err))
		return nil, err
	}

	// Calculate pagination info
	totalPages := (totalCount + int64(req.PageSize) - 1) / int64(req.PageSize) // Ceiling division
	hasNextPage := int64(req.Page) < totalPages
	hasPrevPage := req.Page > 1

	// Create response DTOs
	userResponses := make([]*UserResponseDTO, len(users))
	for i, u := range users {
		userResponses[i] = &UserResponseDTO{
			ID:                        u.ID,
			Email:                     u.Email,
			FirstName:                 u.FirstName,
			LastName:                  u.LastName,
			Name:                      u.Name,
			LexicalName:               u.LexicalName,
			Role:                      u.Role,
			Phone:                     u.Phone,
			Country:                   u.Country,
			Timezone:                  u.Timezone,
			Region:                    u.Region,
			City:                      u.City,
			PostalCode:                u.PostalCode,
			AddressLine1:              u.AddressLine1,
			AddressLine2:              u.AddressLine2,
			WalletAddress:             u.WalletAddress,
			WasEmailVerified:          u.WasEmailVerified,
			ProfileVerificationStatus: u.ProfileVerificationStatus,
			WebsiteURL:                u.WebsiteURL,
			Description:               u.Description,
			ComicBookStoreName:        u.ComicBookStoreName,
			CreatedAt:                 u.CreatedAt,
			ModifiedAt:                u.ModifiedAt,
			Status:                    u.Status,
			ChainID:                   u.ChainID,
			AgreeTermsOfService:       u.AgreeTermsOfService,
			AgreePromotions:           u.AgreePromotions,
			AgreeToTrackingAcrossThirdPartyAppsAndServices: u.AgreeToTrackingAcrossThirdPartyAppsAndServices,
		}
	}

	// Build response
	response := &ListUsersResponseDTO{
		Users:       userResponses,
		TotalCount:  totalCount,
		TotalPages:  int(totalPages),
		CurrentPage: req.Page,
		HasNextPage: hasNextPage,
		HasPrevPage: hasPrevPage,
	}

	// Add next/prev page numbers if they exist
	if hasNextPage {
		response.NextPage = req.Page + 1
	}

	if hasPrevPage {
		response.PreviousPage = req.Page - 1
	}

	return response, nil
}
