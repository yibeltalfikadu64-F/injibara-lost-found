// mobile/src/features/items/hooks/useItems.ts

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

import {
  CreateItemPayload,
  Item,
  ItemListParams,
  PaginatedItems,
  UpdateItemPayload,
  itemsApi,
} from "../services/itemsApi";

/* =========================================================
   QUERY KEYS
========================================================= */

export const itemKeys = {
  all: ["items"] as const,

  lists: () => [...itemKeys.all, "list"] as const,

  list: (params: ItemListParams) => [...itemKeys.lists(), params] as const,

  details: () => [...itemKeys.all, "detail"] as const,

  detail: (itemId: string) => [...itemKeys.details(), itemId] as const,

  recent: () => [...itemKeys.all, "recent"] as const,

  lost: (params: ItemListParams = {}) =>
    [...itemKeys.all, "lost", params] as const,

  found: (params: ItemListParams = {}) =>
    [...itemKeys.all, "found", params] as const,

  mine: (params: ItemListParams = {}) =>
    [...itemKeys.all, "mine", params] as const,

  search: (search: string, params: ItemListParams = {}) =>
    [...itemKeys.all, "search", search, params] as const,

  category: (categoryId: string, params: ItemListParams = {}) =>
    [...itemKeys.all, "category", categoryId, params] as const,

  location: (locationId: string, params: ItemListParams = {}) =>
    [...itemKeys.all, "location", locationId, params] as const,
};

/* =========================================================
   DEFAULT QUERY SETTINGS
========================================================= */

const DEFAULT_STALE_TIME = 1000 * 60 * 2;

const DEFAULT_GC_TIME = 1000 * 60 * 10;

/* =========================================================
   FETCH ALL ITEMS
========================================================= */

export function useItems(params: ItemListParams = {}, enabled = true) {
  return useQuery({
    queryKey: itemKeys.list(params),

    queryFn: () => itemsApi.getItems(params),

    enabled,

    staleTime: DEFAULT_STALE_TIME,

    gcTime: DEFAULT_GC_TIME,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}

/* =========================================================
   FETCH ITEM DETAILS
========================================================= */

export function useItem(
  itemId: string,
  options?: {
    enabled?: boolean;
    initialData?: Item;
  },
) {
  return useQuery({
    queryKey: itemKeys.detail(itemId),

    queryFn: () => itemsApi.getItemById(itemId),

    enabled: Boolean(itemId.trim()) && (options?.enabled ?? true),

    initialData: options?.initialData,

    staleTime: DEFAULT_STALE_TIME,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}

/* =========================================================
   FETCH LOST ITEMS
========================================================= */

export function useLostItems(
  params: Omit<ItemListParams, "type"> = {},
  enabled = true,
) {
  return useQuery({
    queryKey: itemKeys.lost(params),

    queryFn: () => itemsApi.getLostItems(params),

    enabled,

    staleTime: DEFAULT_STALE_TIME,

    gcTime: DEFAULT_GC_TIME,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}

/* =========================================================
   FETCH FOUND ITEMS
========================================================= */

export function useFoundItems(
  params: Omit<ItemListParams, "type"> = {},
  enabled = true,
) {
  return useQuery({
    queryKey: itemKeys.found(params),

    queryFn: () => itemsApi.getFoundItems(params),

    enabled,

    staleTime: DEFAULT_STALE_TIME,

    gcTime: DEFAULT_GC_TIME,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}

/* =========================================================
   FETCH MY ITEMS
========================================================= */

export function useMyItems(params: ItemListParams = {}, enabled = true) {
  return useQuery({
    queryKey: itemKeys.mine(params),

    queryFn: () => itemsApi.getMyItems(params),

    enabled,

    staleTime: DEFAULT_STALE_TIME,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}

/* =========================================================
   SEARCH ITEMS
========================================================= */

export function useSearchItems(search: string, params: ItemListParams = {}) {
  const normalizedSearch = search.trim();

  return useQuery({
    queryKey: itemKeys.search(normalizedSearch, params),

    queryFn: () => itemsApi.searchItems(normalizedSearch, params),

    enabled: normalizedSearch.length >= 2,

    staleTime: 1000 * 30,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}

/* =========================================================
   FETCH RECENT ITEMS
========================================================= */

export function useRecentItems(limit = 10) {
  return useQuery({
    queryKey: [...itemKeys.recent(), limit],

    queryFn: () => itemsApi.getRecentItems(limit),

    staleTime: DEFAULT_STALE_TIME,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}

/* =========================================================
   FETCH ITEMS BY CATEGORY
========================================================= */

export function useItemsByCategory(
  categoryId: string,
  params: ItemListParams = {},
) {
  return useQuery({
    queryKey: itemKeys.category(categoryId, params),

    queryFn: () => itemsApi.getItemsByCategory(categoryId, params),

    enabled: Boolean(categoryId.trim()),

    staleTime: DEFAULT_STALE_TIME,

    retry: 1,
  });
}

/* =========================================================
   FETCH ITEMS BY LOCATION
========================================================= */

export function useItemsByLocation(
  locationId: string,
  params: ItemListParams = {},
) {
  return useQuery({
    queryKey: itemKeys.location(locationId, params),

    queryFn: () => itemsApi.getItemsByLocation(locationId, params),

    enabled: Boolean(locationId.trim()),

    staleTime: DEFAULT_STALE_TIME,

    retry: 1,
  });
}

/* =========================================================
   INFINITE ITEMS
========================================================= */

interface InfiniteItemsParams {
  limit?: number;
  search?: string;
  type?: "LOST" | "FOUND";
  status?: string;
  categoryId?: string;
  locationId?: string;
}

export function useInfiniteItems(params: InfiniteItemsParams = {}) {
  const limit = params.limit ?? 10;

  return useInfiniteQuery({
    queryKey: [...itemKeys.lists(), "infinite", params],

    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      itemsApi.getItems({
        ...params,
        page: pageParam,
        limit,
      }),

    getNextPageParam: (lastPage: PaginatedItems) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,

    staleTime: DEFAULT_STALE_TIME,

    retry: 1,
  });
}

/* =========================================================
   CREATE ITEM MUTATION
========================================================= */

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateItemPayload) => itemsApi.createItem(payload),

    onSuccess: async (createdItem) => {
      queryClient.setQueryData(itemKeys.detail(createdItem.id), createdItem);

      await queryClient.invalidateQueries({
        queryKey: itemKeys.all,
      });
    },
  });
}

/* =========================================================
   UPDATE ITEM MUTATION
========================================================= */

interface UpdateItemVariables {
  itemId: string;
  payload: UpdateItemPayload;
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, payload }: UpdateItemVariables) =>
      itemsApi.updateItem(itemId, payload),

    onSuccess: async (updatedItem) => {
      queryClient.setQueryData(itemKeys.detail(updatedItem.id), updatedItem);

      await queryClient.invalidateQueries({
        queryKey: itemKeys.all,
      });
    },
  });
}

/* =========================================================
   DELETE ITEM MUTATION
========================================================= */

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => itemsApi.deleteItem(itemId),

    onSuccess: async (_, itemId) => {
      queryClient.removeQueries({
        queryKey: itemKeys.detail(itemId),
      });

      await queryClient.invalidateQueries({
        queryKey: itemKeys.all,
      });
    },
  });
}

/* =========================================================
   REFRESH ITEM QUERIES
========================================================= */

export function useRefreshItems() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: itemKeys.all,
    });
  };
}

/* =========================================================
   PREFETCH ITEM DETAILS
========================================================= */

export function usePrefetchItem() {
  const queryClient = useQueryClient();

  return async (itemId: string) => {
    if (!itemId.trim()) {
      return;
    }

    await queryClient.prefetchQuery({
      queryKey: itemKeys.detail(itemId),

      queryFn: () => itemsApi.getItemById(itemId),

      staleTime: DEFAULT_STALE_TIME,
    });
  };
}

/* =========================================================
   SET ITEM CACHE
========================================================= */

export function useSetItemCache() {
  const queryClient = useQueryClient();

  return (item: Item) => {
    queryClient.setQueryData(itemKeys.detail(item.id), item);
  };
}

/* =========================================================
   REMOVE ITEM CACHE
========================================================= */

export function useRemoveItemCache() {
  const queryClient = useQueryClient();

  return (itemId: string) => {
    queryClient.removeQueries({
      queryKey: itemKeys.detail(itemId),
    });
  };
}

/* =========================================================
   INVALIDATE ITEM CACHE
========================================================= */

export function useInvalidateItemQueries() {
  const queryClient = useQueryClient();

  return async (itemId?: string) => {
    if (itemId) {
      await queryClient.invalidateQueries({
        queryKey: itemKeys.detail(itemId),
      });
    }

    await queryClient.invalidateQueries({
      queryKey: itemKeys.all,
    });
  };
}

/* =========================================================
   EXPORTS
========================================================= */

export type {
  CreateItemPayload,
  Item,
  ItemListParams,
  PaginatedItems,
  UpdateItemPayload,
};

export default useItems;
