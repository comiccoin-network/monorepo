// github.com/comiccoin-network/monorepo/cloud/comiccoin/cmd/iam/list_users.go
package iam

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"strings"

	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/logger"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/common/storage/database/mongodb"
	"github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/iam/domain/user"
)

// Command line argument flags for pagination and filtering
var (
	flagPage         int
	flagPageSize     int
	flagRoleFilter   int
	flagStatusFilter int
	flagSearchTerm   string
	flagSortBy       string
	flagSortOrder    string
)

func GetListUsersCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "list-users",
		Short: "List users with pagination and optional filtering",
		Run: func(cmd *cobra.Command, args []string) {
			doRunListUsers()
		},
	}

	// Register flags for pagination
	cmd.Flags().IntVar(&flagPage, "page", 1, "Page number (starting from 1)")
	cmd.Flags().IntVar(&flagPageSize, "page-size", 10, "Number of users per page")

	// Register flags for filtering
	cmd.Flags().IntVar(&flagRoleFilter, "role", 0, "Filter by user role (0: All, 1: Admin, 2: Company, 3: Individual)")
	cmd.Flags().IntVar(&flagStatusFilter, "status", 0, "Filter by user status (0: All, 1: Active, 50: Locked, 100: Archived)")
	cmd.Flags().StringVar(&flagSearchTerm, "search", "", "Search by name, email, or phone")

	// Register flags for sorting
	cmd.Flags().StringVar(&flagSortBy, "sort-by", "created_at", "Sort field (created_at, name, email)")
	cmd.Flags().StringVar(&flagSortOrder, "sort-order", "desc", "Sort order (asc, desc)")

	return cmd
}

func doRunListUsers() {
	// Common
	logger := logger.NewProvider()
	cfg := config.NewProvider()
	dbClient := mongodb.NewProvider(cfg, logger)

	// Validate inputs
	if flagPage < 1 {
		logger.Error("Page number must be at least 1")
		log.Fatalf("Invalid page number: %d\n", flagPage)
	}

	if flagPageSize < 1 || flagPageSize > 100 {
		logger.Error("Page size must be between 1 and 100")
		log.Fatalf("Invalid page size: %d\n", flagPageSize)
	}

	// Sort order validation
	sortMultiplier := -1 // Default to descending
	if strings.ToLower(flagSortOrder) == "asc" {
		sortMultiplier = 1
	}

	// Sort field validation
	sortField := "created_at"
	switch strings.ToLower(flagSortBy) {
	case "name":
		sortField = "name"
	case "email":
		sortField = "email"
	case "created_at":
		sortField = "created_at"
	default:
		logger.Warn("Invalid sort field, using 'created_at'")
	}

	// Context
	ctx := context.Background()

	// Get the user collection
	userCollection := dbClient.Database(cfg.DB.IAMName).Collection("users")

	// Build the filter
	filter := bson.M{}

	// Add role filter if specified
	if flagRoleFilter > 0 {
		filter["role"] = flagRoleFilter
	}

	// Add status filter if specified
	if flagStatusFilter > 0 {
		filter["status"] = flagStatusFilter
	}

	// Add search filter if specified
	if flagSearchTerm != "" {
		// Create a text search filter
		searchRegex := primitive.Regex{
			Pattern: flagSearchTerm,
			Options: "i", // case-insensitive
		}

		// Search in multiple fields
		filter["$or"] = []bson.M{
			{"name": searchRegex},
			{"email": searchRegex},
			{"phone": searchRegex},
		}
	}

	// Calculate pagination
	skip := (flagPage - 1) * flagPageSize
	limit := int64(flagPageSize)

	// Count total matching users
	totalCount, err := userCollection.CountDocuments(ctx, filter)
	if err != nil {
		logger.Error("Failed to count users", slog.Any("error", err))
		log.Fatalf("Failed to count users: %v\n", err)
	}

	// Set up pagination and sorting options
	findOptions := options.Find().
		SetSkip(int64(skip)).
		SetLimit(limit).
		SetSort(bson.D{{Key: sortField, Value: sortMultiplier}})

	// Execute the query
	cursor, err := userCollection.Find(ctx, filter, findOptions)
	if err != nil {
		logger.Error("Failed to query users", slog.Any("error", err))
		log.Fatalf("Failed to query users: %v\n", err)
	}
	defer cursor.Close(ctx)

	// Decode the results
	var users []*user.User
	if err = cursor.All(ctx, &users); err != nil {
		logger.Error("Failed to decode users", slog.Any("error", err))
		log.Fatalf("Failed to decode users: %v\n", err)
	}

	// Calculate pagination info
	totalPages := (totalCount + int64(flagPageSize) - 1) / int64(flagPageSize) // Ceiling division
	hasNextPage := int64(flagPage) < totalPages
	hasPrevPage := flagPage > 1

	// Display results
	fmt.Printf("\n===== User List =====\n")
	fmt.Printf("Page %d of %d (Total users: %d)\n\n", flagPage, totalPages, totalCount)

	// Display user table header
	fmt.Printf("%-24s | %-30s | %-20s | %-15s | %-10s | %-7s\n", "ID", "Name", "Email", "Created", "Status", "Role")
	fmt.Println(strings.Repeat("-", 120))

	// Display users
	for _, u := range users {
		// Format status as a readable string
		statusStr := "Unknown"
		switch u.Status {
		case user.UserStatusActive:
			statusStr = "Active"
		case user.UserStatusLocked:
			statusStr = "Locked"
		case user.UserStatusArchived:
			statusStr = "Archived"
		}

		// Format role as a readable string
		roleStr := "Unknown"
		switch u.Role {
		case user.UserRoleRoot:
			roleStr = "Admin"
		case user.UserRoleCompany:
			roleStr = "Company"
		case user.UserRoleIndividual:
			roleStr = "Individual"
		}

		// Display user info in a formatted table row
		fmt.Printf("%-24s | %-30s | %-20s | %-15s | %-10s | %-7s\n",
			u.ID.Hex(),
			truncateString(u.Name, 30),
			truncateString(u.Email, 20),
			u.CreatedAt.Format("2006-01-02"),
			statusStr,
			roleStr,
		)
	}

	// Display pagination info
	fmt.Println(strings.Repeat("-", 120))
	fmt.Printf("\nShowing %d to %d of %d users\n", skip+1, min(skip+int(limit), int(totalCount)), totalCount)

	// Display navigation hints
	fmt.Println("\nNavigation:")
	if hasPrevPage {
		fmt.Printf("Previous page: go run main.go iam list-users --page=%d --page-size=%d\n", flagPage-1, flagPageSize)
	}
	if hasNextPage {
		fmt.Printf("Next page: go run main.go iam list-users --page=%d --page-size=%d\n", flagPage+1, flagPageSize)
	}

	// Display applied filters
	if flagRoleFilter > 0 || flagStatusFilter > 0 || flagSearchTerm != "" {
		fmt.Println("\nApplied filters:")
		if flagRoleFilter > 0 {
			roleNames := map[int]string{
				1: "Admin",
				2: "Company",
				3: "Individual",
			}
			fmt.Printf("Role: %s\n", roleNames[flagRoleFilter])
		}
		if flagStatusFilter > 0 {
			statusNames := map[int]string{
				1:   "Active",
				50:  "Locked",
				100: "Archived",
			}
			fmt.Printf("Status: %s\n", statusNames[flagStatusFilter])
		}
		if flagSearchTerm != "" {
			fmt.Printf("Search: %s\n", flagSearchTerm)
		}
	}
}

// Helper function to truncate strings to a maximum length
func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen-3] + "..."
}

// Helper function to get the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
