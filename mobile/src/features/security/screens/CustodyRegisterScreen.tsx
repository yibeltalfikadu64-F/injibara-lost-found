// mobile/src/features/security/screens/CustodyRegisterScreen.tsx

import React, { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useFocusEffect } from "@react-navigation/native";

import { useAuthStore } from "../../auth/store/authStore";

import CustodyCard from "../components/CustodyCard";

import {
  CustodyRecord,
  CustodyStatus,
  securityApi,
} from "../services/securityApi";

import styles, { COLORS } from "../styles/SecurityScreen.styles";

// ======================================================
// TYPES
// ======================================================

type CustodyFilter =
  | "ALL"
  | "IN_CUSTODY"
  | "RELEASED"
  | "TRANSFERRED"
  | "PENDING_VERIFICATION";

interface CustodyNavigation {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
  goBack: () => void;
}

interface CustodyRegisterScreenProps {
  navigation: CustodyNavigation;
}

// ======================================================
// FILTERS
// ======================================================

const FILTERS: {
  label: string;
  value: CustodyFilter;
}[] = [
  { label: "All", value: "ALL" },
  { label: "In Custody", value: "IN_CUSTODY" },
  { label: "Released", value: "RELEASED" },
  { label: "Transferred", value: "TRANSFERRED" },
  {
    label: "Pending Verification",
    value: "PENDING_VERIFICATION",
  },
];

// ======================================================
// SCREEN
// ======================================================

const CustodyRegisterScreen: React.FC<CustodyRegisterScreenProps> = ({
  navigation,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [records, setRecords] = useState<CustodyRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<CustodyFilter>("ALL");

  const [search, setSearch] = useState("");

  // ====================================================
  // LOAD RECORDS
  // ====================================================

  const loadRecords = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setError("Please sign in to access the custody register.");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError(null);

        const response = await securityApi.getCustodyRecords(
          accessToken,
          1,
          100,
        );

        setRecords(response.data);
      } catch (err) {
        setError(securityApi.getSecurityErrorMessage(err));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [accessToken],
  );

  // ====================================================
  // REFRESH ON FOCUS
  // ====================================================

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [loadRecords]),
  );

  // ====================================================
  // FILTER RECORDS
  // ====================================================

  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (filter !== "ALL") {
      result = result.filter((record) => record.status === filter);
    }

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((record) => {
        const itemTitle = record.item?.title?.toLowerCase() ?? "";

        const custodyNumber = record.custodyNumber?.toLowerCase() ?? "";

        const storageLocation = record.storageLocation?.toLowerCase() ?? "";

        const recordId = record.id.toLowerCase();

        return (
          itemTitle.includes(query) ||
          custodyNumber.includes(query) ||
          storageLocation.includes(query) ||
          recordId.includes(query)
        );
      });
    }

    return result;
  }, [records, filter, search]);

  // ====================================================
  // STATISTICS
  // ====================================================

  const statistics = useMemo(() => {
    return {
      total: records.length,

      inCustody: records.filter((record) => record.status === "IN_CUSTODY")
        .length,

      released: records.filter((record) => record.status === "RELEASED").length,

      pending: records.filter(
        (record) => record.status === "PENDING_VERIFICATION",
      ).length,
    };
  }, [records]);

  // ====================================================
  // OPEN RECORD
  // ====================================================

  const openRecord = (record: CustodyRecord) => {
    navigation.navigate("CustodyDetails", {
      custodyId: record.id,
    });
  };

  // ====================================================
  // RELEASE ITEM
  // ====================================================

  const handleRelease = (record: CustodyRecord) => {
    Alert.alert(
      "Record Item Release",
      `Are you sure you want to record the release of "${record.item?.title ?? "this item"}"? Complete the handover verification process before releasing the item.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue to Handover",
          onPress: () => {
            navigation.navigate("Handover", {
              claimId: record.claimId,
              custodyId: record.id,
              itemId: record.itemId,
            });
          },
        },
      ],
    );
  };

  // ====================================================
  // RECORD RELEASE AFTER VERIFIED HANDOVER
  // ====================================================

  const updateReleasedRecord = async (record: CustodyRecord) => {
    if (!accessToken) {
      return;
    }

    try {
      setIsUpdating(true);

      await securityApi.updateCustodyRecord(accessToken, record.id, {
        status: "RELEASED",
      });

      setRecords((previous) =>
        previous.map((item) =>
          item.id === record.id
            ? {
                ...item,
                status: "RELEASED" as CustodyStatus,
                releasedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
    } catch (err) {
      Alert.alert(
        "Unable to update custody record",
        securityApi.getSecurityErrorMessage(err),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // ====================================================
  // EMPTY STATE
  // ====================================================

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="file-tray-outline" size={32} color={COLORS.primary} />
      </View>

      <Text style={styles.emptyTitle}>No Custody Records</Text>

      <Text style={styles.emptyDescription}>
        No records match your current filter. Pull down to refresh the custody
        register.
      </Text>

      <Pressable
        onPress={() => {
          setFilter("ALL");
          setSearch("");
        }}
        style={[styles.primaryButton, { marginTop: 20 }]}
      >
        <Text style={styles.primaryButtonText}>Clear Filters</Text>
      </Pressable>
    </View>
  );

  // ====================================================
  // RENDER ITEM
  // ====================================================

  const renderRecord = ({ item }: { item: CustodyRecord }) => (
    <CustodyCard
      record={item}
      onPress={openRecord}
      onRelease={handleRelease}
      disabled={isUpdating}
    />
  );

  // ====================================================
  // LOADING
  // ====================================================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.loadingText}>Loading custody register...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.subHeader}>
        <Pressable
          accessibilityRole="button"
          onPress={navigation.goBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={21} color={COLORS.text} />
        </Pressable>

        <View style={styles.subHeaderContent}>
          <Text style={styles.subHeaderTitle}>Custody Register</Text>

          <Text style={styles.subHeaderSubtitle}>
            Track items held by campus security
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => loadRecords(true)}
          style={styles.backButton}
        >
          <Ionicons name="refresh-outline" size={21} color={COLORS.primary} />
        </Pressable>
      </View>

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderRecord}
        contentContainerStyle={[
          styles.content,
          { paddingTop: 10, paddingBottom: 35 },
          filteredRecords.length === 0 && {
            flexGrow: 1,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadRecords(true)}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* Intro */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Campus Property Custody</Text>

              <Text style={styles.sectionDescription}>
                Maintain a record of recovered belongings, their storage
                locations, and authorized release activities.
              </Text>
            </View>

            {/* Statistics */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: COLORS.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="archive-outline"
                    size={19}
                    color={COLORS.primary}
                  />
                </View>

                <Text style={styles.summaryValue}>{statistics.total}</Text>

                <Text style={styles.summaryLabel}>Total Records</Text>
              </View>

              <View style={styles.summaryCard}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: COLORS.successLight },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={19}
                    color={COLORS.success}
                  />
                </View>

                <Text style={styles.summaryValue}>{statistics.inCustody}</Text>

                <Text style={styles.summaryLabel}>In Custody</Text>
              </View>

              <View style={styles.summaryCard}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: COLORS.borderLight },
                  ]}
                >
                  <Ionicons
                    name="checkmark-done-outline"
                    size={19}
                    color={COLORS.textSecondary}
                  />
                </View>

                <Text style={styles.summaryValue}>{statistics.released}</Text>

                <Text style={styles.summaryLabel}>Released</Text>
              </View>

              <View style={styles.summaryCard}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: COLORS.warningLight },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={19}
                    color={COLORS.warning}
                  />
                </View>

                <Text style={styles.summaryValue}>{statistics.pending}</Text>

                <Text style={styles.summaryLabel}>Pending Verification</Text>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={19}
                color={COLORS.textMuted}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search item, custody ID, location..."
                placeholderTextColor={COLORS.textMuted}
                style={styles.searchInput}
                autoCapitalize="none"
                returnKeyType="search"
              />

              {search.length > 0 ? (
                <Pressable onPress={() => setSearch("")}>
                  <Ionicons
                    name="close-circle"
                    size={19}
                    color={COLORS.textMuted}
                  />
                </Pressable>
              ) : null}
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
              <Text style={styles.filterTitle}>Record Status</Text>

              <FlatList
                data={FILTERS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.value}
                contentContainerStyle={styles.filterList}
                renderItem={({ item }) => {
                  const selected = filter === item.value;

                  return (
                    <Pressable
                      onPress={() => setFilter(item.value)}
                      style={[
                        styles.filterChip,
                        selected && styles.filterChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selected && styles.filterChipTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>

            {error ? (
              <View style={styles.errorCard}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={COLORS.danger}
                />

                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Custody Records</Text>

              <Text style={styles.sectionDescription}>
                {filteredRecords.length} record(s)
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={renderEmpty}
      />

      {isUpdating ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: 15,
            backgroundColor: COLORS.white,
            alignItems: "center",
          }}
        >
          <ActivityIndicator color={COLORS.primary} />

          <Text style={styles.loadingText}>Updating custody record...</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default CustodyRegisterScreen;
