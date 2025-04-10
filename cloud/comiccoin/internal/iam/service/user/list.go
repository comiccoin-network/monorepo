// github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/service/user/list.go
package user

import (
	"errors"
	"log/slog"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config/constants"
	dom_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
	uc_user "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/usecase/user"
)

// ListUsersService defines the interface for listing users with pagination
type ListUsersService interface {
	Execute(sessCtx mongo.SessionContext, req *ListUsersRequestDTO) (*ListUsersResponseDTO, error)
}

// listUsersServiceImpl implements the ListUsersService interface
type listUsersServiceImpl struct {
	config                   *config.Configuration
	logger                   *slog.Logger
	userCountByFilterUseCase uc_user.UserCountByFilterUseCase
	userListByFilterUseCase  uc_user.UserListByFilterUseCase
}

// NewListUsersService creates a new instance of ListUsersService
func NewListUsersService(
	config *config.Configuration,
	logger *slog.Logger,
	userCountByFilterUseCase uc_user.UserCountByFilterUseCase,
	userListByFilterUseCase uc_user.UserListByFilterUseCase,
) ListUsersService {
	return &listUsersServiceImpl{
		config:                   config,
		logger:                   logger,
		userCountByFilterUseCase: userCountByFilterUseCase,
		userListByFilterUseCase:  userListByFilterUseCase,
	}
}

// Execute processes the request to list users with pagination and filtering
func (svc *listUsersServiceImpl) Execute(sessCtx mongo.SessionContext, req *ListUsersRequestDTO) (*ListUsersResponseDTO, error) {
	//
	// Extract authenticated user information from context.
	//

	sessionUserRole, _ := sessCtx.Value(constants.SessionUserRole).(int8)
	if sessionUserRole != dom_user.UserRoleRoot {
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

	//
	// Prepare filter from request
	//

	// Create a search term if provided
	var searchTerm *string
	if req.SearchTerm != "" {
		searchTerm = &req.SearchTerm
	}

	// Create user filter
	filter := &dom_user.UserFilter{
		Role:                      req.Role,
		Status:                    req.Status,
		ProfileVerificationStatus: req.ProfileVerificationStatus,
		SearchTerm:                searchTerm,
		Limit:                     int64(req.PageSize),
	}

	// Get total count first
	totalCount, err := svc.userCountByFilterUseCase.Execute(sessCtx, filter)
	if err != nil {
		svc.logger.Error("Failed to count users", slog.Any("error", err))
		return nil, err
	}

	// Calculate pagination info
	totalPages := (totalCount + uint64(req.PageSize) - 1) / uint64(req.PageSize) // Ceiling division
	hasNextPage := uint64(req.Page) < totalPages
	hasPrevPage := req.Page > 1

	// Apply pagination to filter
	// For cursor-based pagination we'd use LastID and LastCreatedAt,
	// but for traditional pagination we'll skip records
	if req.Page > 1 {
		// For simplicity, we'll implement offset pagination
		// In a production environment, you might want to implement cursor-based pagination
		// for better performance with large datasets
		skip := (req.Page - 1) * req.PageSize

		// Let's use our list by filter use case with skip logic
		// This is a simplification - in a real implementation you might need to
		// adjust the repository to support both cursor-based and offset pagination

		// For now, we'll just get all records and skip manually
		fullFilter := &dom_user.UserFilter{
			Role:       req.Role,
			Status:     req.Status,
			SearchTerm: searchTerm,
			Limit:      int64(totalCount), // Get all records
		}

		// Get all records (not efficient for large datasets)
		allUsers, err := svc.userListByFilterUseCase.Execute(sessCtx, fullFilter)
		if err != nil {
			svc.logger.Error("Failed to list users", slog.Any("error", err))
			return nil, err
		}

		// Apply manual pagination (this is inefficient but simpler than modifying repository)
		var users []*dom_user.User

		if skip < len(allUsers.Users) {
			end := skip + req.PageSize
			if end > len(allUsers.Users) {
				end = len(allUsers.Users)
			}
			users = allUsers.Users[skip:end]
		} else {
			users = []*dom_user.User{}
		}

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
			TotalCount:  int64(totalCount),
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

	// First page, use list by filter normally
	filter.Limit = int64(req.PageSize)

	// Note: While sortBy and sortOrder are accepted in the request, our current
	// repository implementation always sorts by created_at DESC, _id DESC.
	// To support custom sorting, we would need to modify the repository layer.

	// Execute the filtered list query
	result, err := svc.userListByFilterUseCase.Execute(sessCtx, filter)
	if err != nil {
		svc.logger.Error("Failed to list users", slog.Any("error", err))
		return nil, err
	}

	// Create response DTOs
	userResponses := make([]*UserResponseDTO, len(result.Users))
	for i, u := range result.Users {
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
		TotalCount:  int64(totalCount),
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
