// mobile/src/features/search/screens/SearchScreen.tsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StatusBar,
  Text,
  View,
} from "react-native";

import SearchBar from "../components/SearchBar";
import FilterModal from "../components/FilterModal";
import CategoryFilter from "../components/CategoryFilter";

import searchApi, {
  DEFAULT_SEARCH_FILTERS,
  SearchApiError,
  type SearchCategory,
  type SearchFilters,
  type SearchItem,
  type SearchItemType,
  type SearchLocation,
  type SearchResponse,
} from "../services/searchApi";

import styles, { SearchColors } from "../styles/SearchScreen.styles";

/* =========================================================
   SCREEN PROPS
========================================================= */

export interface SearchScreenProps {
  /**
   * Called when a user selects an item.
   * Connect this callback to your navigation system.
   */
  onItemPress?: (item: SearchItem) => void;

  /**
   * Optional screen title.
   */
  title?: string;

  /**
   * Optional subtitle.
   */
  subtitle?: string;
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date?: string | null): string {
  if (!date) {
    return "Date unavailable";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getItemTypeLabel(type: SearchItem["type"]): string {
  return type === "LOST" ? "LOST ITEM" : "FOUND ITEM";
}

function getItemStatusLabel(status?: string): string {
  if (!status) {
    return "OPEN";
  }

  return status.replace(/_/g, " ").toUpperCase();
}

function getItemDescription(description: string, maximumLength = 90): string {
  const normalized = description.trim();

  if (normalized.length <= maximumLength) {
    return normalized;
  }

  return `${normalized.substring(0, maximumLength).trim()}...`;
}

function getSearchErrorMessage(error: unknown): string {
  if (error instanceof SearchApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while searching for items.";
}

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function SearchScreen({
  onItemPress,
  title = "Search Items",
  subtitle = "Find lost and found items around campus",
}: SearchScreenProps) {
  /* -------------------------------------------------------
     SEARCH STATE
  ------------------------------------------------------- */

  const [searchText, setSearchText] = useState("");

  const [filters, setFilters] = useState<SearchFilters>({
    ...DEFAULT_SEARCH_FILTERS,
  });

  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(
    null,
  );

  /* -------------------------------------------------------
     CATEGORY AND LOCATION STATE
  ------------------------------------------------------- */

  const [categories, setCategories] = useState<SearchCategory[]>([]);

  const [locations, setLocations] = useState<SearchLocation[]>([]);

  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [locationsLoading, setLocationsLoading] = useState(false);

  /* -------------------------------------------------------
     UI STATE
  ------------------------------------------------------- */

  const [filterVisible, setFilterVisible] = useState(false);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [hasSearched, setHasSearched] = useState(false);

  /* -------------------------------------------------------
     REQUEST CONTROL
  ------------------------------------------------------- */

  const searchRequestId = useRef(0);

  const searchAbortController = useRef<AbortController | null>(null);

  const metadataAbortController = useRef<AbortController | null>(null);

  /* -------------------------------------------------------
     DERIVED DATA
  ------------------------------------------------------- */

  const items = searchResponse?.items ?? [];

  const pagination = searchResponse?.pagination;

  const totalResults = pagination?.total ?? items.length;

  const totalPages = pagination?.totalPages ?? 1;

  const currentPage = pagination?.page ?? filters.page;

  const activeFilterCount = useMemo(() => {
    return searchApi.countActiveSearchFilters(filters);
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return searchApi.hasActiveSearchFilters(filters);
  }, [filters]);

  /* =======================================================
     LOAD CATEGORIES AND LOCATIONS
  ======================================================= */

  const loadSearchMetadata = useCallback(async () => {
    metadataAbortController.current?.abort();

    const controller = new AbortController();

    metadataAbortController.current = controller;

    setCategoriesLoading(true);
    setLocationsLoading(true);

    try {
      const [categoryResult, locationResult] = await Promise.allSettled([
        searchApi.getSearchCategories(controller.signal),
        searchApi.getSearchLocations(controller.signal),
      ]);

      if (controller.signal.aborted) {
        return;
      }

      if (categoryResult.status === "fulfilled") {
        setCategories(categoryResult.value);
      } else {
        setCategories([]);
      }

      if (locationResult.status === "fulfilled") {
        setLocations(locationResult.value);
      } else {
        setLocations([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setCategoriesLoading(false);
        setLocationsLoading(false);
      }
    }
  }, []);

  /* =======================================================
     FETCH SEARCH RESULTS
  ======================================================= */

  const executeSearch = useCallback(
    async (
      nextFilters: SearchFilters,
      options?: {
        append?: boolean;
        refresh?: boolean;
      },
    ) => {
      const append = options?.append ?? false;
      const refresh = options?.refresh ?? false;

      const requestId = ++searchRequestId.current;

      searchAbortController.current?.abort();

      const controller = new AbortController();

      searchAbortController.current = controller;

      if (append) {
        setLoadingMore(true);
      } else if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const result = await searchApi.searchItems(
          nextFilters,
          controller.signal,
        );

        if (
          controller.signal.aborted ||
          requestId !== searchRequestId.current
        ) {
          return;
        }

        setSearchResponse((previous) => {
          if (append && previous) {
            const existingIds = new Set(previous.items.map((item) => item.id));

            const newItems = result.items.filter(
              (item) => !existingIds.has(item.id),
            );

            return {
              items: [...previous.items, ...newItems],
              pagination: result.pagination,
            };
          }

          return result;
        });

        setHasSearched(true);
      } catch (requestError) {
        if (
          controller.signal.aborted ||
          requestId !== searchRequestId.current
        ) {
          return;
        }

        setError(getSearchErrorMessage(requestError));

        if (!append) {
          setSearchResponse(null);
        }
      } finally {
        if (
          !controller.signal.aborted &&
          requestId === searchRequestId.current
        ) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    void loadSearchMetadata();

    return () => {
      searchAbortController.current?.abort();
      metadataAbortController.current?.abort();
    };
  }, [loadSearchMetadata]);

  /* =======================================================
     SEARCH WHEN FILTERS CHANGE
  ======================================================= */

  useEffect(() => {
    const timeout = setTimeout(() => {
      void executeSearch(filters);
    }, 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [filters, executeSearch]);

  /* =======================================================
     HANDLE SEARCH TEXT
  ======================================================= */

  const handleSearchTextChange = useCallback((value: string) => {
    setSearchText(value);

    setFilters((previous) => ({
      ...previous,
      query: value,
      page: 1,
    }));
  }, []);

  const handleSubmitSearch = useCallback(() => {
    setFilters((previous) => ({
      ...previous,
      query: searchText.trim(),
      page: 1,
    }));
  }, [searchText]);

  /* =======================================================
     HANDLE ITEM TYPE FILTER
  ======================================================= */

  const handleTypeChange = useCallback((type: SearchItemType) => {
    setFilters((previous) => ({
      ...previous,
      type,
      page: 1,
    }));
  }, []);

  /* =======================================================
     HANDLE CATEGORY FILTER
  ======================================================= */

  const handleCategoryChange = useCallback((categoryId: string) => {
    setFilters((previous) => ({
      ...previous,
      categoryId,
      page: 1,
    }));
  }, []);

  /* =======================================================
     OPEN FILTER MODAL
  ======================================================= */

  const openFilters = useCallback(() => {
    setFilterVisible(true);
  }, []);

  const closeFilters = useCallback(() => {
    setFilterVisible(false);
  }, []);

  /* =======================================================
     APPLY FILTERS
  ======================================================= */

  const handleApplyFilters = useCallback(
    (nextFilters: SearchFilters) => {
      setFilters({
        ...nextFilters,
        query: searchText.trim(),
        page: 1,
      });

      setFilterVisible(false);
    },
    [searchText],
  );

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const handleResetFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_SEARCH_FILTERS,
      query: searchText.trim(),
      page: 1,
    });
  }, [searchText]);

  /* =======================================================
     CLEAR ALL SEARCH
  ======================================================= */

  const handleClearSearch = useCallback(() => {
    setSearchText("");

    setFilters({
      ...DEFAULT_SEARCH_FILTERS,
    });
  }, []);

  /* =======================================================
     REFRESH RESULTS
  ======================================================= */

  const handleRefresh = useCallback(() => {
    void executeSearch(filters, {
      refresh: true,
    });
  }, [executeSearch, filters]);

  /* =======================================================
     LOAD NEXT PAGE
  ======================================================= */

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !pagination?.hasNextPage) {
      return;
    }

    const nextPage = currentPage + 1;

    const nextFilters = {
      ...filters,
      page: nextPage,
    };

    setFilters(nextFilters);

    void executeSearch(nextFilters, {
      append: true,
    });
  }, [
    loading,
    loadingMore,
    refreshing,
    pagination,
    currentPage,
    filters,
    executeSearch,
  ]);

  /* =======================================================
     ITEM CARD
  ======================================================= */

  const renderItem = useCallback(
    ({ item }: { item: SearchItem }) => {
      const imageUrl = searchApi.getItemImage(item);

      const isLost = item.type === "LOST";

      return (
        <Pressable
          style={({ pressed }) => [
            styles.itemCard,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => onItemPress?.(item)}
          accessibilityRole="button"
          accessibilityLabel={`Open ${item.title}, ${getItemTypeLabel(item.type)}`}
        >
          <View style={styles.itemCardContent}>
            {/* Item image */}
            <View style={styles.itemImageContainer}>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Text style={styles.itemImagePlaceholderIcon}>
                    {isLost ? "🔎" : "🎒"}
                  </Text>

                  <Text style={styles.itemImagePlaceholderText}>No image</Text>
                </View>
              )}
            </View>

            {/* Item information */}
            <View style={styles.itemDetails}>
              <View style={styles.itemTopRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>

                <View
                  style={[
                    styles.itemTypeBadge,
                    isLost ? styles.lostBadge : styles.foundBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.itemTypeText,
                      isLost ? styles.lostBadgeText : styles.foundBadgeText,
                    ]}
                  >
                    {isLost ? "LOST" : "FOUND"}
                  </Text>
                </View>
              </View>

              <Text style={styles.itemDescription} numberOfLines={2}>
                {getItemDescription(item.description)}
              </Text>

              {/* Category */}
              <View style={styles.itemMetaRow}>
                <Text style={styles.itemMetaText}>
                  ▦ {item.category?.name ?? "Uncategorized"}
                </Text>
              </View>

              {/* Location */}
              <View style={styles.itemMetaRow}>
                <Text style={styles.itemMetaText}>
                  📍 {item.location?.name ?? "Location unavailable"}
                </Text>
              </View>

              {/* Date and status */}
              <View style={styles.itemBottomRow}>
                <Text style={styles.itemDate}>
                  {formatDate(item.dateLostOrFound ?? item.createdAt)}
                </Text>

                <View style={styles.itemStatusBadge}>
                  <Text style={styles.itemStatusText}>
                    {getItemStatusLabel(item.status)}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.itemArrow}>›</Text>
          </View>
        </Pressable>
      );
    },
    [onItemPress],
  );

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SearchColors.primary} />

          <Text style={styles.loadingTitle}>Searching items...</Text>

          <Text style={styles.loadingDescription}>
            Please wait while we find matching items.
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>

          <Text style={styles.errorTitle}>Unable to load search results</Text>

          <Text style={styles.errorDescription}>{error}</Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => void executeSearch(filters)}
          >
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
        </View>

        <Text style={styles.emptyTitle}>No items found</Text>

        <Text style={styles.emptyDescription}>
          We could not find any items matching your search. Try another keyword
          or change your filters.
        </Text>

        <Pressable style={styles.emptyButton} onPress={handleClearSearch}>
          <Text style={styles.emptyButtonText}>Clear search and filters</Text>
        </Pressable>
      </View>
    );
  };

  /* =======================================================
     LIST FOOTER
  ======================================================= */

  const renderListFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={SearchColors.primary} />

          <Text style={styles.loadingDescription}>Loading more items...</Text>
        </View>
      );
    }

    if (items.length > 0 && pagination?.hasNextPage) {
      return (
        <View style={styles.paginationContainer}>
          <Pressable style={styles.paginationButton} onPress={handleLoadMore}>
            <Text style={styles.paginationButtonText}>Load more items</Text>
          </Pressable>

          <Text style={styles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </Text>
        </View>
      );
    }

    if (items.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You have reached the end of the search results.
          </Text>
        </View>
      );
    }

    return null;
  };

  /* =======================================================
     ACTIVE FILTER LABELS
  ======================================================= */

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];

    if (filters.type !== "ALL") {
      labels.push(filters.type === "LOST" ? "Lost items" : "Found items");
    }

    if (filters.categoryId) {
      const category = categories.find(
        (entry) => entry.id === filters.categoryId,
      );

      if (category) {
        labels.push(category.name);
      }
    }

    if (filters.locationId) {
      const location = locations.find(
        (entry) => entry.id === filters.locationId,
      );

      if (location) {
        labels.push(location.name);
      }
    }

    if (filters.sortBy !== "newest") {
      const sortLabels: Record<string, string> = {
        oldest: "Oldest first",
        title_asc: "Title A–Z",
        title_desc: "Title Z–A",
      };

      labels.push(sortLabels[filters.sortBy] ?? "Custom sort");
    }

    return labels;
  }, [filters, categories, locations]);

  /* =======================================================
     SCREEN RENDER
  ======================================================= */

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={SearchColors.surface}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.contentWrapper}>
            {/* Screen header */}
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{title}</Text>

                <Text style={styles.headerSubtitle}>{subtitle}</Text>
              </View>
            </View>

            {/* Search input */}
            <View style={styles.searchArea}>
              <SearchBar
                value={searchText}
                onChangeText={handleSearchTextChange}
                onSubmit={handleSubmitSearch}
                onClear={handleClearSearch}
                onFilterPress={openFilters}
                filterCount={activeFilterCount}
                loading={loading && hasSearched}
              />

              <Text style={styles.searchHint}>
                Search by item name, description, or campus location.
              </Text>
            </View>

            {/* Quick item type filter */}
            <View style={styles.typeFilterContainer}>
              <Text style={styles.typeFilterHeading}>Browse items</Text>

              <View style={styles.typeFilterList}>
                {(
                  [
                    { label: "All", value: "ALL" },
                    { label: "Lost", value: "LOST" },
                    { label: "Found", value: "FOUND" },
                  ] as const
                ).map((option) => {
                  const selected = filters.type === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => handleTypeChange(option.value)}
                      style={[
                        styles.typeFilterButton,
                        selected && styles.typeFilterButtonSelected,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                    >
                      <Text
                        style={[
                          styles.typeFilterText,
                          selected && styles.typeFilterTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Categories */}
            <View style={styles.categoryDivider} />

            <View style={styles.categoryContainer}>
              <CategoryFilter
                categories={categories}
                selectedCategoryId={filters.categoryId}
                onSelect={handleCategoryChange}
                loading={categoriesLoading}
              />
            </View>

            {/* Results heading */}
            <View style={styles.resultsHeader}>
              <View style={styles.resultsHeadingContainer}>
                <Text style={styles.resultsTitle}>Search results</Text>

                <Text style={styles.resultsSubtitle}>
                  {loading
                    ? "Finding matching items..."
                    : `${totalResults} item${totalResults === 1 ? "" : "s"} found`}
                </Text>
              </View>

              <View style={styles.resultsCount}>
                <Text style={styles.resultsCountText}>{totalResults}</Text>
              </View>
            </View>

            {/* Active filters */}
            {activeFilterLabels.length > 0 && (
              <View style={styles.activeFiltersContainer}>
                {activeFilterLabels.map((label) => (
                  <View key={label} style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterText}>{label}</Text>
                  </View>
                ))}

                <Pressable
                  onPress={handleResetFilters}
                  style={styles.clearFiltersButton}
                >
                  <Text style={styles.clearFiltersText}>Clear filters</Text>
                </Pressable>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderListFooter}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={SearchColors.primary}
            colors={[SearchColors.primary]}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (pagination?.hasNextPage) {
            handleLoadMore();
          }
        }}
      />

      {/* Filter modal */}
      <FilterModal
        visible={filterVisible}
        filters={filters}
        categories={categories}
        locations={locations}
        onClose={closeFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        categoriesLoading={categoriesLoading}
        locationsLoading={locationsLoading}
      />
    </View>
  );
}
