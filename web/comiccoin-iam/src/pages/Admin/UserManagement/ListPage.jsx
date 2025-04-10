// src/pages/UserManagement/ListPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Edit,
  Trash2,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Building,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { toast } from "react-toastify";
import UserTopNavigation from "../../../components/UserTopNavigation";
import UserFooter from "../../../components/UserFooter";
import {
  useUserList,
  useUser,
  USER_STATUS,
  USER_ROLE,
  PROFILE_VERIFICATION_STATUS,
} from "../../../hooks/useUser";

const UserListPage = () => {
  const navigate = useNavigate();

  // State for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [selectedVerificationStatus, setSelectedVerificationStatus] =
    useState(0);

  // Get the delete functionality from useUser hook
  const { deleteUser, isLoading: isDeletingUser } = useUser();

  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Prepare filters for the API
  const filters = {
    page: currentPage,
    pageSize: pageSize,
    searchTerm: searchTerm || undefined,
    role: selectedRole || undefined,
    status: selectedStatus || undefined,
    profileVerificationStatus: selectedVerificationStatus || undefined,
  };

  // Use the userList hook to fetch users with the filters
  const {
    users,
    pagination,
    isLoading,
    error,
    refetch,
    getStatusClass,
    getStatusDotClass,
    getRoleClass,
    getVerificationStatusClass,
    formatDate,
  } = useUserList(filters);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    refetch();
  };

  // Handle role filter change
  const handleRoleChange = (e) => {
    setSelectedRole(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setSelectedStatus(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  // Handle verification status filter change
  const handleVerificationStatusChange = (e) => {
    setSelectedVerificationStatus(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRole(0);
    setSelectedStatus(0);
    setSelectedVerificationStatus(0);
    setCurrentPage(1);
  };

  // Effect to refetch when filters change
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    pageSize,
    selectedRole,
    selectedStatus,
    selectedVerificationStatus,
  ]);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination?.totalPages) {
      setCurrentPage(page);
    }
  };

  // Navigate to create user page
  const handleAddUser = () => {
    navigate("/users/add");
  };

  // Navigate to user detail page
  const handleViewUser = (id) => {
    navigate(`/users/${id}`);
  };

  // Navigate to edit user page
  const handleEditUser = (id, e) => {
    e.stopPropagation(); // Prevent row click event from firing
    navigate(`/users/${id}/edit`);
  };

  // Show delete confirmation
  const handleDeleteClick = (user, e) => {
    e.stopPropagation(); // Prevent row click event from firing
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      toast.success("User deleted successfully");
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      refetch();
    } catch (err) {
      toast.error(`Failed to delete user: ${err.message || "Unknown error"}`);
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLE.ROOT:
        return <Shield className="h-5 w-5 text-purple-700" />;
      case USER_ROLE.COMPANY:
        return <Building className="h-5 w-5 text-blue-700" />;
      case USER_ROLE.INDIVIDUAL:
        return <UserCircle className="h-5 w-5 text-yellow-700" />;
      default:
        return <UserCircle className="h-5 w-5 text-gray-700" />;
    }
  };

  // Get verification status icon
  const getVerificationIcon = (status) => {
    switch (status) {
      case PROFILE_VERIFICATION_STATUS.APPROVED:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case PROFILE_VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW:
        return <Clock className="h-4 w-4 text-blue-600" />;
      case PROFILE_VERIFICATION_STATUS.REJECTED:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case PROFILE_VERIFICATION_STATUS.UNVERIFIED:
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <UserTopNavigation />

      <main
        id="main-content"
        className="flex-grow container mx-auto px-4 py-8 max-w-6xl"
      >
        {/* Page Header with Gradient Background */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
                <Users className="h-6 w-6 mr-2" aria-hidden="true" />
                User Management
              </h1>
              <p className="text-indigo-100">
                Manage users, view their details, and control permissions
              </p>
            </div>
            <div>
              <button
                onClick={handleAddUser}
                className="w-full md:w-auto bg-white text-purple-700 hover:bg-indigo-50 px-6 py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 font-semibold"
                aria-label="Add new user"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                <span>Create New User</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="relative lg:col-span-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by name, email, or phone..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="appearance-none w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  aria-label="Filter by role"
                >
                  <option value={0}>All Roles</option>
                  <option value={USER_ROLE.ROOT}>Administrator</option>
                  <option value={USER_ROLE.COMPANY}>Business/Retailer</option>
                  <option value={USER_ROLE.INDIVIDUAL}>Individual</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <UserCircle className="h-5 w-5 text-gray-400" />
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                  <ChevronLeft className="h-4 w-4 text-gray-400 transform rotate-90" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="appearance-none w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  aria-label="Filter by status"
                >
                  <option value={0}>All Statuses</option>
                  <option value={USER_STATUS.ACTIVE}>Active</option>
                  <option value={USER_STATUS.LOCKED}>Locked</option>
                  <option value={USER_STATUS.ARCHIVED}>Archived</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                  <ChevronLeft className="h-4 w-4 text-gray-400 transform rotate-90" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Count and Page Size */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Loading users...
              </div>
            ) : (
              <>
                Showing{" "}
                {pagination?.totalCount ? (currentPage - 1) * pageSize + 1 : 0}{" "}
                -{" "}
                {Math.min(currentPage * pageSize, pagination?.totalCount || 0)}{" "}
                of {pagination?.totalCount || 0} users
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md p-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>
                Error loading users:{" "}
                {error.message || "An unknown error occurred"}
              </span>
            </div>
            <button
              onClick={() => refetch()}
              className="mt-2 text-red-700 hover:text-red-800 text-sm font-medium flex items-center gap-1"
            >
              <ArrowRight className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {/* Users Table */}
        {!isLoading && !error && users && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewUser(user.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: `${user.isRoot ? "#e9d5ff" : user.isCompany ? "#dbeafe" : "#fef9c3"}`,
                              }}
                            >
                              {getRoleIcon(user.role)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                {user.fullName}
                                {user.isVerified && (
                                  <CheckCircle
                                    className="h-4 w-4 text-green-500 ml-1"
                                    title="Verified"
                                  />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClass(user.role)}`}
                          >
                            {user.getRoleLabel()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-500">
                            {user.phone ? (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1 text-gray-400" />
                                {user.phone}
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1 text-gray-400" />
                                {user.email}
                              </div>
                            )}
                            {user.city && user.country && (
                              <div className="flex items-center mt-1">
                                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                {user.city}, {user.country}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(user.status)}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full mr-1.5 my-auto ${getStatusDotClass(user.status)}`}
                              ></span>
                              {user.getStatusLabel()}
                            </span>
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getVerificationStatusClass(user.profileVerificationStatus)}`}
                            >
                              {getVerificationIcon(
                                user.profileVerificationStatus,
                              )}
                              <span className="ml-1">
                                {user.getVerificationStatusLabel()}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={(e) => handleEditUser(user.id, e)}
                              className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                              aria-label={`Edit ${user.fullName}`}
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(user, e)}
                              className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                              aria-label={`Delete ${user.fullName}`}
                              disabled={user.isRoot} // Prevent deleting root users
                              title={
                                user.isRoot
                                  ? "Root users cannot be deleted"
                                  : "Delete user"
                              }
                            >
                              <Trash2
                                className={`h-5 w-5 ${user.isRoot ? "opacity-30 cursor-not-allowed" : ""}`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No users found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-lg text-gray-600">Loading users...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!users || users.length === 0) && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No users found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              {searchTerm || selectedRole || selectedStatus
                ? "No users match the current filters. Try adjusting your search criteria."
                : "No users have been created yet. Get started by adding your first user."}
            </p>
            {searchTerm || selectedRole || selectedStatus ? (
              <button
                onClick={clearFilters}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <Filter className="h-5 w-5 mr-2" />
                Clear Filters
              </button>
            ) : (
              <button
                onClick={handleAddUser}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add User
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav
              className="relative z-0 inline-flex shadow-sm -space-x-px rounded-md"
              aria-label="Pagination"
            >
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  pagination.hasPrevPage
                    ? "text-gray-500 hover:bg-gray-50"
                    : "text-gray-300 cursor-not-allowed"
                }`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* First page */}
              {pagination.currentPage > 2 && (
                <button
                  onClick={() => handlePageChange(1)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  1
                </button>
              )}

              {/* Ellipsis for pages before current */}
              {pagination.currentPage > 3 && (
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
              )}

              {/* Page before current */}
              {pagination.currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {pagination.currentPage - 1}
                </button>
              )}

              {/* Current page */}
              <button
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-purple-50 text-sm font-medium text-purple-700"
                aria-current="page"
              >
                {pagination.currentPage}
              </button>

              {/* Page after current */}
              {pagination.currentPage < pagination.totalPages && (
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {pagination.currentPage + 1}
                </button>
              )}

              {/* Ellipsis for pages after current */}
              {pagination.currentPage < pagination.totalPages - 2 && (
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
              )}

              {/* Last page */}
              {pagination.currentPage < pagination.totalPages - 1 && (
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {pagination.totalPages}
                </button>
              )}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  pagination.hasNextPage
                    ? "text-gray-500 hover:bg-gray-50"
                    : "text-gray-300 cursor-not-allowed"
                }`}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
              <div className="mb-4 flex items-center justify-center">
                <div className="bg-red-100 rounded-full p-3">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete the user{" "}
                <span className="font-semibold">{userToDelete.fullName}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  disabled={isDeletingUser}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                  disabled={isDeletingUser}
                >
                  {isDeletingUser ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <UserFooter />

      {/* Animation styles */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserListPage;
