// src/pages/AdminDashboardPage/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  AlertCircle,
  Loader,
  Search,
  PieChart,
  BarChart,
  Calendar,
  Clock,
  Wallet,
  Shield,
  Building,
  User,
  UserCircle,
  ChevronRight,
  Layers,
  List,
  RefreshCw,
} from "lucide-react";
import {
  useUserList,
  USER_STATUS,
  USER_ROLE,
  PROFILE_VERIFICATION_STATUS,
} from "../../../hooks/useUser";
import AdminTopNavigation from "../../../components/AdminTopNavigation";
import UserFooter from "../../../components/UserFooter";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger refreshes

  // Fetch all users with a larger page size for dashboard stats
  const {
    users,
    isLoading,
    error,
    refetch,
    formatDate,
    getStatusClass,
    getStatusDotClass,
    getRoleClass,
  } = useUserList(
    {
      pageSize: 100, // Get a larger sample for stats
      sortBy: "created_at",
      sortOrder: "desc",
    },
    { key: ["dashboard-users", refreshKey] }, // Include refreshKey in the query key
  );

  // Fetch recent users (last 5)
  const { users: recentUsers, isLoading: isLoadingRecent } = useUserList(
    {
      pageSize: 5,
      sortBy: "created_at",
      sortOrder: "desc",
    },
    { key: ["recent-users", refreshKey] },
  );

  // Calculate stats from users data
  const calculateStats = () => {
    if (!users) return null;

    // Initialize counters
    const stats = {
      total: users.length,
      roleDistribution: {
        [USER_ROLE.ROOT]: 0,
        [USER_ROLE.COMPANY]: 0,
        [USER_ROLE.INDIVIDUAL]: 0,
      },
      statusDistribution: {
        [USER_STATUS.ACTIVE]: 0,
        [USER_STATUS.LOCKED]: 0,
        [USER_STATUS.ARCHIVED]: 0,
      },
      verificationDistribution: {
        [PROFILE_VERIFICATION_STATUS.UNVERIFIED]: 0,
        [PROFILE_VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW]: 0,
        [PROFILE_VERIFICATION_STATUS.APPROVED]: 0,
        [PROFILE_VERIFICATION_STATUS.REJECTED]: 0,
      },
      withWallet: 0,
      withoutWallet: 0,
      emailVerified: 0,
      emailUnverified: 0,
    };

    // Process each user
    users.forEach((user) => {
      // Role distribution
      if (user.role in stats.roleDistribution) {
        stats.roleDistribution[user.role]++;
      }

      // Status distribution
      if (user.status in stats.statusDistribution) {
        stats.statusDistribution[user.status]++;
      }

      // Verification distribution
      if (user.profileVerificationStatus in stats.verificationDistribution) {
        stats.verificationDistribution[user.profileVerificationStatus]++;
      }

      // Wallet connection
      if (user.walletAddress) {
        stats.withWallet++;
      } else {
        stats.withoutWallet++;
      }

      // Email verification
      if (user.wasEmailVerified) {
        stats.emailVerified++;
      } else {
        stats.emailUnverified++;
      }
    });

    return stats;
  };

  const stats = calculateStats();

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
    refetch();
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/users?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Get formatted percentage
  const getPercentage = (value, total) => {
    if (!total) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };

  // Get color class for stat card based on value
  const getStatCardColor = (type) => {
    switch (type) {
      case "users":
        return "from-blue-500 to-blue-600";
      case "active":
        return "from-green-500 to-green-600";
      case "verified":
        return "from-purple-500 to-purple-600";
      case "wallet":
        return "from-amber-500 to-amber-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  // Get icon for recent user based on role
  const getUserIcon = (role) => {
    switch (role) {
      case USER_ROLE.ROOT:
        return <Shield className="h-5 w-5 text-purple-600" />;
      case USER_ROLE.COMPANY:
        return <Building className="h-5 w-5 text-blue-600" />;
      case USER_ROLE.INDIVIDUAL:
        return <UserCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  // Get role label
  const getRoleLabel = (role) => {
    switch (role) {
      case USER_ROLE.ROOT:
        return "Administrator";
      case USER_ROLE.COMPANY:
        return "Business/Retailer";
      case USER_ROLE.INDIVIDUAL:
        return "Individual";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <AdminTopNavigation />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Overview of user accounts and system status
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <Link
              to="/admin/users/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search for users by name, email, or phone..."
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <button
              type="submit"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <div className="p-1 rounded-md bg-purple-600 text-white hover:bg-purple-700">
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white shadow-md rounded-lg p-16 text-center">
            <Loader className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-6" />
            <p className="text-xl text-gray-600">Loading dashboard data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>
                Error loading dashboard data:{" "}
                {error.message || "An unknown error occurred"}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              className="mt-2 text-red-700 hover:text-red-800 text-sm font-medium flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg overflow-hidden text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Total Users</h3>
                    <Users className="h-8 w-8 opacity-80" />
                  </div>
                  <div className="mt-4">
                    <p className="text-4xl font-bold">{stats.total}</p>
                    <p className="mt-2 text-blue-100 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      All registered accounts
                    </p>
                  </div>
                </div>
                <div className="px-6 py-3 bg-black bg-opacity-20">
                  <Link
                    to="/admin/users"
                    className="text-sm flex items-center hover:underline"
                  >
                    View all users <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>

              {/* Active Users */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg overflow-hidden text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Active Users</h3>
                    <UserCheck className="h-8 w-8 opacity-80" />
                  </div>
                  <div className="mt-4">
                    <p className="text-4xl font-bold">
                      {stats.statusDistribution[USER_STATUS.ACTIVE]}
                    </p>
                    <p className="mt-2 text-green-100 flex items-center">
                      <span className="h-2 w-2 rounded-full bg-white mr-2"></span>
                      {getPercentage(
                        stats.statusDistribution[USER_STATUS.ACTIVE],
                        stats.total,
                      )}{" "}
                      of total users
                    </p>
                  </div>
                </div>
                <div className="px-6 py-3 bg-black bg-opacity-20">
                  <Link
                    to="/admin/users?status=1"
                    className="text-sm flex items-center hover:underline"
                  >
                    View active users <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>

              {/* Verified Users */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg overflow-hidden text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Verified Users</h3>
                    <Shield className="h-8 w-8 opacity-80" />
                  </div>
                  <div className="mt-4">
                    <p className="text-4xl font-bold">
                      {
                        stats.verificationDistribution[
                          PROFILE_VERIFICATION_STATUS.APPROVED
                        ]
                      }
                    </p>
                    <p className="mt-2 text-purple-100 flex items-center">
                      <UserCheck className="h-4 w-4 mr-1" />
                      {getPercentage(
                        stats.verificationDistribution[
                          PROFILE_VERIFICATION_STATUS.APPROVED
                        ],
                        stats.total,
                      )}{" "}
                      verified profiles
                    </p>
                  </div>
                </div>
                <div className="px-6 py-3 bg-black bg-opacity-20">
                  <Link
                    to="/admin/users?profile_verification_status=3"
                    className="text-sm flex items-center hover:underline"
                  >
                    View verified users{" "}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>

              {/* Users with Wallets */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-lg overflow-hidden text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Connected Wallets</h3>
                    <Wallet className="h-8 w-8 opacity-80" />
                  </div>
                  <div className="mt-4">
                    <p className="text-4xl font-bold">{stats.withWallet}</p>
                    <p className="mt-2 text-amber-100 flex items-center">
                      <Layers className="h-4 w-4 mr-1" />
                      {getPercentage(stats.withWallet, stats.total)} have wallet
                      connections
                    </p>
                  </div>
                </div>
                <div className="px-6 py-3 bg-black bg-opacity-20">
                  <span className="text-sm flex items-center">
                    {stats.withoutWallet} users without wallets
                  </span>
                </div>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Distribution Charts */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-5 bg-gray-50 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">
                    User Distribution
                  </h2>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Role Distribution */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-medium text-gray-700 flex items-center">
                        <UserCircle className="h-5 w-5 text-blue-600 mr-2" />
                        By Role
                      </h3>
                      <span className="text-xs text-gray-500">
                        {stats.total} Users
                      </span>
                    </div>

                    {/* Role Distribution Bars */}
                    <div className="space-y-4">
                      {/* Root Users */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">
                              Administrators
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {stats.roleDistribution[USER_ROLE.ROOT]}
                            <span className="text-xs ml-1 text-gray-400">
                              (
                              {getPercentage(
                                stats.roleDistribution[USER_ROLE.ROOT],
                                stats.total,
                              )}
                              )
                            </span>
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{
                              width: getPercentage(
                                stats.roleDistribution[USER_ROLE.ROOT],
                                stats.total,
                              ),
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Company Users */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">
                              Businesses/Retailers
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {stats.roleDistribution[USER_ROLE.COMPANY]}
                            <span className="text-xs ml-1 text-gray-400">
                              (
                              {getPercentage(
                                stats.roleDistribution[USER_ROLE.COMPANY],
                                stats.total,
                              )}
                              )
                            </span>
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{
                              width: getPercentage(
                                stats.roleDistribution[USER_ROLE.COMPANY],
                                stats.total,
                              ),
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Individual Users */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">
                              Individuals
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {stats.roleDistribution[USER_ROLE.INDIVIDUAL]}
                            <span className="text-xs ml-1 text-gray-400">
                              (
                              {getPercentage(
                                stats.roleDistribution[USER_ROLE.INDIVIDUAL],
                                stats.total,
                              )}
                              )
                            </span>
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-600 rounded-full"
                            style={{
                              width: getPercentage(
                                stats.roleDistribution[USER_ROLE.INDIVIDUAL],
                                stats.total,
                              ),
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Distribution */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-medium text-gray-700 flex items-center">
                        <Shield className="h-5 w-5 text-green-600 mr-2" />
                        By Status
                      </h3>
                      <span className="text-xs text-gray-500">
                        {stats.total} Users
                      </span>
                    </div>

                    {/* Status Distribution Bars */}
                    <div className="space-y-4">
                      {/* Active Users */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <span className="h-3 w-3 bg-green-500 rounded-full mr-2"></span>
                            <span className="text-sm font-medium text-gray-600">
                              Active
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {stats.statusDistribution[USER_STATUS.ACTIVE]}
                            <span className="text-xs ml-1 text-gray-400">
                              (
                              {getPercentage(
                                stats.statusDistribution[USER_STATUS.ACTIVE],
                                stats.total,
                              )}
                              )
                            </span>
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: getPercentage(
                                stats.statusDistribution[USER_STATUS.ACTIVE],
                                stats.total,
                              ),
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Locked Users */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <span className="h-3 w-3 bg-red-500 rounded-full mr-2"></span>
                            <span className="text-sm font-medium text-gray-600">
                              Locked
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {stats.statusDistribution[USER_STATUS.LOCKED]}
                            <span className="text-xs ml-1 text-gray-400">
                              (
                              {getPercentage(
                                stats.statusDistribution[USER_STATUS.LOCKED],
                                stats.total,
                              )}
                              )
                            </span>
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{
                              width: getPercentage(
                                stats.statusDistribution[USER_STATUS.LOCKED],
                                stats.total,
                              ),
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Archived Users */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <span className="h-3 w-3 bg-gray-500 rounded-full mr-2"></span>
                            <span className="text-sm font-medium text-gray-600">
                              Archived
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {stats.statusDistribution[USER_STATUS.ARCHIVED]}
                            <span className="text-xs ml-1 text-gray-400">
                              (
                              {getPercentage(
                                stats.statusDistribution[USER_STATUS.ARCHIVED],
                                stats.total,
                              )}
                              )
                            </span>
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-500 rounded-full"
                            style={{
                              width: getPercentage(
                                stats.statusDistribution[USER_STATUS.ARCHIVED],
                                stats.total,
                              ),
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Distribution - Full Width */}
                  <div className="md:col-span-2 mt-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-medium text-gray-700 flex items-center">
                        <UserCheck className="h-5 w-5 text-purple-600 mr-2" />
                        By Verification Status
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {/* Unverified */}
                      <div className="flex-1 min-w-[150px] bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                          <h4 className="text-sm font-medium text-yellow-800">
                            Unverified
                          </h4>
                        </div>
                        <p className="text-2xl font-bold text-yellow-700">
                          {
                            stats.verificationDistribution[
                              PROFILE_VERIFICATION_STATUS.UNVERIFIED
                            ]
                          }
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          {getPercentage(
                            stats.verificationDistribution[
                              PROFILE_VERIFICATION_STATUS.UNVERIFIED
                            ],
                            stats.total,
                          )}{" "}
                          of users
                        </p>
                      </div>

                      {/* Under Review */}
                      <div className="flex-1 min-w-[150px] bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 text-blue-600 mr-2" />
                          <h4 className="text-sm font-medium text-blue-800">
                            Under Review
                          </h4>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">
                          {
                            stats.verificationDistribution[
                              PROFILE_VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW
                            ]
                          }
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {getPercentage(
                            stats.verificationDistribution[
                              PROFILE_VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW
                            ],
                            stats.total,
                          )}{" "}
                          of users
                        </p>
                      </div>

                      {/* Approved */}
                      <div className="flex-1 min-w-[150px] bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <UserCheck className="h-5 w-5 text-green-600 mr-2" />
                          <h4 className="text-sm font-medium text-green-800">
                            Approved
                          </h4>
                        </div>
                        <p className="text-2xl font-bold text-green-700">
                          {
                            stats.verificationDistribution[
                              PROFILE_VERIFICATION_STATUS.APPROVED
                            ]
                          }
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {getPercentage(
                            stats.verificationDistribution[
                              PROFILE_VERIFICATION_STATUS.APPROVED
                            ],
                            stats.total,
                          )}{" "}
                          of users
                        </p>
                      </div>

                      {/* Rejected */}
                      <div className="flex-1 min-w-[150px] bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <UserX className="h-5 w-5 text-red-600 mr-2" />
                          <h4 className="text-sm font-medium text-red-800">
                            Rejected
                          </h4>
                        </div>
                        <p className="text-2xl font-bold text-red-700">
                          {
                            stats.verificationDistribution[
                              PROFILE_VERIFICATION_STATUS.REJECTED
                            ]
                          }
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          {getPercentage(
                            stats.verificationDistribution[
                              PROFILE_VERIFICATION_STATUS.REJECTED
                            ],
                            stats.total,
                          )}{" "}
                          of users
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
                  <Link
                    to="/admin/users"
                    className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center"
                  >
                    View full user analytics
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-5 bg-gray-50 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Recently Added Users
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {isLoadingRecent ? (
                    <div className="p-6 text-center">
                      <Loader className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500">Loading recent users...</p>
                    </div>
                  ) : recentUsers && recentUsers.length > 0 ? (
                    recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            {getUserIcon(user.role)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.fullName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="ml-2">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClass(user.role)}`}
                            >
                              {getRoleLabel(user.role)}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(user.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No recent users found</p>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
                  <Link
                    to="/admin/users"
                    className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center"
                  >
                    View all users
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/users/add"
                className="bg-white shadow-md rounded-lg p-5 hover:shadow-lg transition-shadow flex items-center"
              >
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <UserPlus className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Add New User</h3>
                  <p className="text-sm text-gray-500">
                    Create a new user account
                  </p>
                </div>
              </Link>

              <Link
                to={`/admin/users?profile_verification_status=${PROFILE_VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW}`}
                className="bg-white shadow-md rounded-lg p-5 hover:shadow-lg transition-shadow flex items-center"
              >
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Pending Verifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    {
                      stats.verificationDistribution[
                        PROFILE_VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW
                      ]
                    }{" "}
                    profiles awaiting review
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/users?status=50"
                className="bg-white shadow-md rounded-lg p-5 hover:shadow-lg transition-shadow flex items-center"
              >
                <div className="p-3 bg-red-100 rounded-lg mr-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Locked Accounts</h3>
                  <p className="text-sm text-gray-500">
                    {stats.statusDistribution[USER_STATUS.LOCKED]} accounts
                    currently locked
                  </p>
                </div>
              </Link>
            </div>
          </>
        )}
      </main>

      <UserFooter />
    </div>
  );
};

export default AdminDashboardPage;
