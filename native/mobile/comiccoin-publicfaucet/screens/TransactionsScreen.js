// screens/TransactionsScreen.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  FlatList,
  Modal,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import AppHeader from "../components/AppHeader";
import { useTransactions } from "../api/endpoints/transactionsApi";
import { LinearGradient } from "expo-linear-gradient";

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
      <SafeAreaView style={styles.container}>
        <AppHeader title="Transactions" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8347FF" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error && !transactions) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Transactions" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={56} color="#EF4444" />
          <Text style={styles.errorTitle}>Couldn't load transactions</Text>
          <Text style={styles.errorMessage}>
            {error.message ||
              "Failed to load transactions. Please check your connection and try again."}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render a transaction item
  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionCard}>
      <TouchableOpacity
        style={styles.transactionHeader}
        onPress={() => toggleTransactionExpand(item.id)}
        activeOpacity={0.7}
      >
        <View>
          <Text style={styles.transactionAmount}>{item.amount} CC</Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
        <Ionicons
          name={expandedTransaction === item.id ? "chevron-up" : "chevron-down"}
          size={20}
          color="#9CA3AF"
        />
      </TouchableOpacity>

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

          <TouchableOpacity style={styles.viewInExplorerButton}>
            <Text style={styles.viewInExplorerText}>View in Explorer</Text>
            <Feather name="external-link" size={14} color="#8347FF" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );

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
      <TouchableOpacity
        style={styles.backToDashboardButton}
        onPress={handleBackToDashboard}
      >
        <Ionicons
          name="arrow-back"
          size={16}
          color="white"
          style={styles.backButtonIcon}
        />
        <Text style={styles.backToDashboardText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7e22ce" />
      <AppHeader
        title={`Transactions${filter === "personal" ? " (Personal)" : ""}`}
      />

      <View style={styles.controlsContainer}>
        {/* Filter Button */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterMenuOpen(!filterMenuOpen)}
          >
            <Feather name="filter" size={16} color="#6B7280" />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>

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
                <TouchableOpacity
                  style={[
                    styles.filterMenuItem,
                    filter === null && styles.filterMenuItemActive,
                  ]}
                  onPress={() => applyFilter(null)}
                >
                  <Text style={styles.filterMenuItemText}>
                    All Transactions
                  </Text>
                  {filter === null && (
                    <Ionicons name="checkmark" size={16} color="#8347FF" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterMenuItem,
                    filter === "personal" && styles.filterMenuItemActive,
                  ]}
                  onPress={() => applyFilter("personal")}
                >
                  <Text style={styles.filterMenuItemText}>Personal Only</Text>
                  {filter === "personal" && (
                    <Ionicons name="checkmark" size={16} color="#8347FF" />
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Sort Controls */}
        <View style={styles.sortContainer}>
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

          <View style={styles.sortDivider} />

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
        </View>

        {/* Refresh Button */}
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
              tintColor="#8347FF"
            />
          }
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
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
  },
  errorMessage: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 300,
  },
  retryButton: {
    backgroundColor: "#8347FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  filterMenuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterMenuItemActive: {
    backgroundColor: "#F3F4FF",
  },
  filterMenuItemText: {
    fontSize: 14,
    color: "#4B5563",
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
  },
  sortTextActive: {
    color: "#8347FF",
    fontWeight: "500",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
  },
  transactionDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#F9FAFB",
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
  },
  detailValue: {
    fontSize: 13,
    color: "#1F2937",
    flex: 2,
    textAlign: "right",
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
  },
  viewInExplorerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 8,
  },
  viewInExplorerText: {
    color: "#8347FF",
    fontSize: 14,
    marginRight: 6,
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
  },
  emptyDescription: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  backToDashboardButton: {
    backgroundColor: "#8347FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonIcon: {
    marginRight: 8,
  },
  backToDashboardText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default TransactionsScreen;
