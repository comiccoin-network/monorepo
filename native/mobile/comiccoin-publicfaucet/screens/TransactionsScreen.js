// screens/TransactionsScreen.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  FlatList,
  Modal,
  Animated,
  Platform,
  TouchableNativeFeedback,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import AppHeader from "../components/AppHeader";
import { useTransactions } from "../api/endpoints/transactionsApi";

// Platform detection
const isAndroid = Platform.OS === "android";
const isIOS = Platform.OS === "ios";

// Custom Touchable component that uses the appropriate component based on platform
const Touchable = ({ children, style, onPress, ...props }) => {
  if (isAndroid) {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple("#d4c1ff", false)}
        useForeground={true}
        {...props}
      >
        <View style={style}>{children}</View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

const TransactionsScreen = () => {
  const router = useRouter();
  const { filter: initialFilter } = useLocalSearchParams();
  const [sortBy, setSortBy] = useState({
    field: "timestamp",
    direction: "desc",
  });
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState(initialFilter || null);

  // For animations
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Set appropriate status bar for Android
  useEffect(() => {
    if (isAndroid) {
      StatusBar.setBackgroundColor("#7e22ce");
      StatusBar.setBarStyle("light-content");
    }
  }, []);

  useEffect(() => {
    if (expandedTransaction) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [expandedTransaction]);

  // Fetch transactions data with our custom hook
  const {
    data: transactions,
    isLoading,
    error,
    refetch,
  } = useTransactions({
    refreshInterval: 0, // Disable auto-refresh temporarily
    enabled: true,
  });

  // Handle manual refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();

    // Add slight delay to make the animation visible
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Filter transactions if needed based on filter parameter
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // If personal filter is applied, we could filter by user ID or other criteria
    if (filter === "personal") {
      return transactions; // In a real app, you'd filter by user ID or similar
    }

    return transactions;
  }, [transactions, filter]);

  // Apply sorting with useMemo to prevent recalculation on every render
  const sortedTransactions = useMemo(() => {
    // Early return for empty arrays
    if (!filteredTransactions || filteredTransactions.length === 0) {
      return [];
    }

    // Sort the transactions
    return [...filteredTransactions].sort((a, b) => {
      const aValue = a[sortBy.field];
      const bValue = b[sortBy.field];
      const direction = sortBy.direction === "asc" ? 1 : -1;

      if (sortBy.field === "timestamp") {
        return (
          direction * (new Date(aValue).getTime() - new Date(bValue).getTime())
        );
      }

      if (typeof aValue === "string") {
        return direction * aValue.localeCompare(bValue);
      }

      return direction * (aValue - bValue);
    });
  }, [filteredTransactions, sortBy.field, sortBy.direction]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  };

  // Handle transaction expansion
  const toggleTransactionExpand = (transactionId) => {
    setExpandedTransaction(
      expandedTransaction === transactionId ? null : transactionId,
    );
  };

  // Handle sort
  const handleSort = (field) => {
    setSortBy({
      field,
      direction:
        sortBy.field === field && sortBy.direction === "asc" ? "desc" : "asc",
    });
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    router.back();
  };

  // Apply filter
  const applyFilter = (filterValue) => {
    setFilter(filterValue);
    setFilterMenuOpen(false);
  };

  // Render loading state
  if (isLoading && !transactions) {
    return (
      <View style={styles.container}>
        <AppHeader title="Transactions" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#8347FF"
            style={isAndroid ? styles.androidLoader : undefined}
          />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </View>
    );
  }

  // Render error state
  if (error && !transactions) {
    return (
      <View style={styles.container}>
        <AppHeader title="Transactions" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={56} color="#EF4444" />
          <Text style={styles.errorTitle}>Couldn't load transactions</Text>
          <Text style={styles.errorMessage}>
            {error.message ||
              "Failed to load transactions. Please check your connection and try again."}
          </Text>
          <Touchable style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Touchable>
        </View>
      </View>
    );
  }

  // Render a transaction item
  const renderTransactionItem = ({ item }) => {
    // Wrapper for transaction card touchable based on platform
    const TransactionTouchable = ({ children, onPress }) => {
      if (isAndroid) {
        return (
          <TouchableNativeFeedback
            onPress={onPress}
            background={TouchableNativeFeedback.Ripple("#f3f4ff", false)}
            useForeground={true}
          >
            <View style={styles.transactionHeader}>{children}</View>
          </TouchableNativeFeedback>
        );
      }

      return (
        <TouchableOpacity
          style={styles.transactionHeader}
          onPress={onPress}
          activeOpacity={0.7}
        >
          {children}
        </TouchableOpacity>
      );
    };

    return (
      <View style={styles.transactionCard}>
        <TransactionTouchable onPress={() => toggleTransactionExpand(item.id)}>
          <View>
            <Text style={styles.transactionAmount}>{item.amount} CC</Text>
            <Text style={styles.transactionDate}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
          <Ionicons
            name={
              expandedTransaction === item.id ? "chevron-up" : "chevron-down"
            }
            size={20}
            color="#9CA3AF"
          />
        </TransactionTouchable>

        {expandedTransaction === item.id && (
          <Animated.View
            style={[
              styles.expandedContent,
              {
                opacity: slideAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text
                style={styles.detailValue}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {item.id}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>{item.amount} CC</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Completed</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Touchable style={styles.viewInExplorerButton}>
              <Text style={styles.viewInExplorerText}>View in Explorer</Text>
              <Feather name="external-link" size={14} color="#8347FF" />
            </Touchable>
          </Animated.View>
        )}
      </View>
    );
  };

  // Render the empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="wallet-outline" size={48} color="#8347FF" />
      </View>
      <Text style={styles.emptyTitle}>No transactions found</Text>
      <Text style={styles.emptyDescription}>
        Your transaction history will appear here after you claim your first
        ComicCoins.
      </Text>
      <Touchable
        style={styles.backToDashboardButton}
        onPress={handleBackToDashboard}
      >
        <View style={styles.buttonInner}>
          <Ionicons
            name="arrow-back"
            size={16}
            color="white"
            style={styles.backButtonIcon}
          />
          <Text style={styles.backToDashboardText}>Back to Dashboard</Text>
        </View>
      </Touchable>
    </View>
  );

  // Create a wrapper for filter button touchable based on platform
  const FilterButton = () => {
    const content = (
      <View style={styles.filterButton}>
        <Feather name="filter" size={16} color="#6B7280" />
        <Text style={styles.filterText}>Filter</Text>
      </View>
    );

    if (isAndroid) {
      return (
        <View style={styles.androidButtonWrapper}>
          <TouchableNativeFeedback
            onPress={() => setFilterMenuOpen(!filterMenuOpen)}
            background={TouchableNativeFeedback.Ripple("#e5e7eb", false)}
            useForeground={true}
          >
            {content}
          </TouchableNativeFeedback>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilterMenuOpen(!filterMenuOpen)}
      >
        <Feather name="filter" size={16} color="#6B7280" />
        <Text style={styles.filterText}>Filter</Text>
      </TouchableOpacity>
    );
  };

  // Create wrapper for refresh button based on platform
  const RefreshButton = () => {
    const content = (
      <View style={styles.refreshButton}>
        <Ionicons
          name="refresh"
          size={18}
          color="#8347FF"
          style={[isRefreshing && styles.rotating]}
        />
      </View>
    );

    if (isAndroid) {
      return (
        <View style={styles.androidButtonWrapper}>
          <TouchableNativeFeedback
            onPress={handleRefresh}
            disabled={isRefreshing}
            background={TouchableNativeFeedback.Ripple("#e5e7eb", false)}
            useForeground={true}
          >
            {content}
          </TouchableNativeFeedback>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        disabled={isRefreshing}
      >
        <Ionicons
          name="refresh"
          size={18}
          color="#8347FF"
          style={[isRefreshing && styles.rotating]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={isAndroid ? "#7e22ce" : undefined}
      />
      <AppHeader
        title={`Transactions${filter === "personal" ? " (Personal)" : ""}`}
      />

      <View style={styles.mainContent}>
        <View style={styles.controlsContainer}>
          {/* Filter Button */}
          <View style={styles.filterContainer}>
            <FilterButton />

            {/* Filter Menu */}
            <Modal
              visible={filterMenuOpen}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setFilterMenuOpen(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setFilterMenuOpen(false)}
              >
                <View style={styles.filterMenu}>
                  <Touchable
                    onPress={() => applyFilter(null)}
                    style={[
                      styles.filterMenuItem,
                      filter === null && styles.filterMenuItemActive,
                    ]}
                  >
                    <View style={styles.filterMenuItemInner}>
                      <Text style={styles.filterMenuItemText}>
                        All Transactions
                      </Text>
                      {filter === null && (
                        <Ionicons name="checkmark" size={16} color="#8347FF" />
                      )}
                    </View>
                  </Touchable>

                  <Touchable
                    onPress={() => applyFilter("personal")}
                    style={[
                      styles.filterMenuItem,
                      filter === "personal" && styles.filterMenuItemActive,
                    ]}
                  >
                    <View style={styles.filterMenuItemInner}>
                      <Text style={styles.filterMenuItemText}>
                        Personal Only
                      </Text>
                      {filter === "personal" && (
                        <Ionicons name="checkmark" size={16} color="#8347FF" />
                      )}
                    </View>
                  </Touchable>
                </View>
              </TouchableOpacity>
            </Modal>
          </View>

          {/* Sort Controls */}
          <View style={styles.sortContainer}>
            {isAndroid ? (
              <View style={styles.androidButtonWrapper}>
                <TouchableNativeFeedback
                  onPress={() => handleSort("timestamp")}
                  background={TouchableNativeFeedback.Ripple("#e5e7eb", false)}
                  useForeground={true}
                >
                  <View
                    style={[
                      styles.sortButton,
                      sortBy.field === "timestamp" && styles.sortButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortText,
                        sortBy.field === "timestamp" && styles.sortTextActive,
                      ]}
                    >
                      Date
                    </Text>
                    {sortBy.field === "timestamp" && (
                      <Ionicons
                        name={
                          sortBy.direction === "asc"
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={16}
                        color="#8347FF"
                        style={styles.sortIcon}
                      />
                    )}
                  </View>
                </TouchableNativeFeedback>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortBy.field === "timestamp" && styles.sortButtonActive,
                ]}
                onPress={() => handleSort("timestamp")}
              >
                <Text
                  style={[
                    styles.sortText,
                    sortBy.field === "timestamp" && styles.sortTextActive,
                  ]}
                >
                  Date
                </Text>
                {sortBy.field === "timestamp" && (
                  <Ionicons
                    name={
                      sortBy.direction === "asc" ? "chevron-up" : "chevron-down"
                    }
                    size={16}
                    color="#8347FF"
                    style={styles.sortIcon}
                  />
                )}
              </TouchableOpacity>
            )}

            <View style={styles.sortDivider} />

            {isAndroid ? (
              <View style={styles.androidButtonWrapper}>
                <TouchableNativeFeedback
                  onPress={() => handleSort("amount")}
                  background={TouchableNativeFeedback.Ripple("#e5e7eb", false)}
                  useForeground={true}
                >
                  <View
                    style={[
                      styles.sortButton,
                      sortBy.field === "amount" && styles.sortButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortText,
                        sortBy.field === "amount" && styles.sortTextActive,
                      ]}
                    >
                      Amount
                    </Text>
                    {sortBy.field === "amount" && (
                      <Ionicons
                        name={
                          sortBy.direction === "asc"
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={16}
                        color="#8347FF"
                        style={styles.sortIcon}
                      />
                    )}
                  </View>
                </TouchableNativeFeedback>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortBy.field === "amount" && styles.sortButtonActive,
                ]}
                onPress={() => handleSort("amount")}
              >
                <Text
                  style={[
                    styles.sortText,
                    sortBy.field === "amount" && styles.sortTextActive,
                  ]}
                >
                  Amount
                </Text>
                {sortBy.field === "amount" && (
                  <Ionicons
                    name={
                      sortBy.direction === "asc" ? "chevron-up" : "chevron-down"
                    }
                    size={16}
                    color="#8347FF"
                    style={styles.sortIcon}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Refresh Button */}
          <RefreshButton />
        </View>

        {sortedTransactions.length > 0 ? (
          <FlatList
            data={sortedTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#8347FF"]}
                progressBackgroundColor={isAndroid ? "#ffffff" : undefined}
                tintColor="#8347FF"
              />
            }
            overScrollMode={isAndroid ? "never" : undefined} // Android-specific
            bounces={isIOS} // iOS-specific
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  androidLoader: {
    transform: [{ scale: 1.2 }], // Slightly larger for Android
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 12,
    marginBottom: 8,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
      },
    }),
  },
  errorMessage: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 300,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  retryButton: {
    backgroundColor: "#8347FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minHeight: 44, // iOS minimum touch target
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal",
        textTransform: "uppercase",
        fontSize: 14,
      },
    }),
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginTop: 0,
  },
  filterContainer: {
    position: "relative",
  },
  androidButtonWrapper: {
    borderRadius: 8,
    overflow: "hidden",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterText: {
    marginLeft: 6,
    color: "#6B7280",
    fontSize: 14,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterMenu: {
    position: "absolute",
    top: 100,
    right: 16,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 180,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  filterMenuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...Platform.select({
      android: {
        padding: 0,
      },
    }),
  },
  filterMenuItemInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterMenuItemActive: {
    backgroundColor: "#F3F4FF",
  },
  filterMenuItemText: {
    fontSize: 14,
    color: "#4B5563",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sortButtonActive: {
    backgroundColor: "#F3F4FF",
  },
  sortText: {
    fontSize: 14,
    color: "#6B7280",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  sortTextActive: {
    color: "#8347FF",
    fontWeight: "500",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal",
      },
    }),
  },
  sortIcon: {
    marginLeft: 2,
  },
  sortDivider: {
    height: "60%",
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  rotating: {
    transform: [{ rotate: "45deg" }],
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding for bottom tab bar
  },
  transactionCard: {
    marginBottom: 12,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal",
      },
    }),
  },
  transactionDate: {
    fontSize: 12,
    color: "#6B7280",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#F9FAFB",
    ...Platform.select({
      android: {
        backgroundColor: "#F3F4FF", // Slightly more colorful for Android
      },
    }),
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  detailValue: {
    fontSize: 13,
    color: "#1F2937",
    flex: 2,
    textAlign: "right",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  statusBadge: {
    backgroundColor: "#D1FAE5",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 100,
  },
  statusText: {
    color: "#065F46",
    fontSize: 12,
    fontWeight: "500",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal",
      },
    }),
  },
  viewInExplorerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewInExplorerText: {
    color: "#8347FF",
    fontSize: 14,
    marginRight: 6,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
        textTransform: "uppercase",
        fontSize: 12,
      },
    }),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal",
      },
    }),
  },
  emptyDescription: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  backToDashboardButton: {
    backgroundColor: "#8347FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButtonIcon: {
    marginRight: 8,
  },
  backToDashboardText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal",
        textTransform: "uppercase",
        fontSize: 14,
      },
    }),
  },
});

export default TransactionsScreen;
