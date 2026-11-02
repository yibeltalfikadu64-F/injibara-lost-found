// mobile/src/features/items/services/itemsApi.ts

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

import { useAuthStore } from "../../auth/store/authStore";

/* =========================================================
   TYPES
========================================================= */

export type ItemType = "LOST" | "FOUND";

export type ItemStatus =
  | "AVAILABLE"
  | "PENDING"
  | "PENDING_APPROVAL"
  | "UNDER_REVIEW"
  | "CLAIMED"
  | "VERIFIED"
  | "APPROVED"
  | "REJECTED"
  | "RETURNED"
  | "RESOLVED"
  | "CLOSED"
  | "EXPIRED"
  | "CANCELLED";

export interface Item {
  id: string;
  title: string;
  description: string;
  type: ItemType;
  status: ItemStatus | string;

  category?: string;
  categoryId?: string;

  location?: string;
  locationId?: string;

  dateLostOrFound?: string;

  color?: string;
  brand?: string;
  identifyingFeatures?: string;

  imageUrls: string[];

  ownerId?: string;
  reporterId?: string;

  reporterName?: string;
  department?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateItemPayload {
  title: string;
  description: string;
  type: ItemType;
  categoryId?: string;
  category?: string;
  locationId?: string;
  location?: string;
  dateLostOrFound: string;
  color?: string;
  brand?: string;
  identifyingFeatures?: string;
  images?: ItemUploadFile[];
}

export interface UpdateItemPayload extends Partial<CreateItemPayload> {
  remainingImageUrls?: string[];
  removedImageUrls?: string[];
}

export interface ItemUploadFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface ItemListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ItemType;
  status?: ItemStatus | string;
  categoryId?: string;
  locationId?: string;
  sortBy?: "createdAt" | "dateLostOrFound" | "title";
  sortOrder?: "asc" | "desc";
  mine?: boolean;
}

export interface PaginatedItems {
  items: Item[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface ItemListResponse {
  items: Item[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

export interface ItemApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const ITEMS_ENDPOINT = "/items";

const DEFAULT_TIMEOUT = 20000;

/* =========================================================
   AXIOS INSTANCE
========================================================= */

const itemsHttp: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    Accept: "application/json",
  },
});

/* =========================================================
   AUTH INTERCEPTOR
========================================================= */

itemsHttp.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

/* =========================================================
   RESPONSE ERROR HANDLING
========================================================= */

function getApiError(error: unknown): ItemApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    const responseData = axiosError.response?.data;

    const message =
      responseData?.message ||
      responseData?.error ||
      axiosError.message ||
      "Something went wrong. Please try again.";

    return {
      message,
      statusCode: axiosError.response?.status,
      errors: responseData?.errors,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "An unexpected error occurred.",
  };
}

function handleApiError(error: unknown): never {
  throw getApiError(error);
}

/* =========================================================
   RESPONSE NORMALIZATION
========================================================= */

function extractItem(responseData: any): Item {
  const item =
    responseData?.data?.item ||
    responseData?.item ||
    responseData?.data ||
    responseData;

  if (!item || typeof item !== "object") {
    throw new Error("The server returned an invalid item.");
  }

  return {
    ...item,
    imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [],
  } as Item;
}

function extractItems(responseData: any): ItemListResponse {
  const source = responseData?.data || responseData;

  const items = Array.isArray(source)
    ? source
    : Array.isArray(source?.items)
      ? source.items
      : Array.isArray(source?.data)
        ? source.data
        : [];

  const pagination = source?.pagination || responseData?.pagination;

  return {
    items: items.map((item: any) => ({
      ...item,
      imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [],
    })) as Item[],
    pagination,
  };
}

/* =========================================================
   QUERY STRING BUILDER
========================================================= */

function buildQueryParams(
  params: ItemListParams,
): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {};

  if (params.page !== undefined) {
    query.page = params.page;
  }

  if (params.limit !== undefined) {
    query.limit = params.limit;
  }

  if (params.search?.trim()) {
    query.search = params.search.trim();
  }

  if (params.type) {
    query.type = params.type;
  }

  if (params.status) {
    query.status = params.status;
  }

  if (params.categoryId) {
    query.categoryId = params.categoryId;
  }

  if (params.locationId) {
    query.locationId = params.locationId;
  }

  if (params.sortBy) {
    query.sortBy = params.sortBy;
  }

  if (params.sortOrder) {
    query.sortOrder = params.sortOrder;
  }

  if (params.mine !== undefined) {
    query.mine = params.mine;
  }

  return query;
}

/* =========================================================
   FORM DATA BUILDER
========================================================= */

function createItemFormData(
  payload: CreateItemPayload | UpdateItemPayload,
): FormData {
  const formData = new FormData();

  const { images, remainingImageUrls, removedImageUrls, ...fields } =
    payload as UpdateItemPayload;

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    formData.append(key, String(value));
  });

  if (remainingImageUrls) {
    formData.append("remainingImageUrls", JSON.stringify(remainingImageUrls));
  }

  if (removedImageUrls) {
    formData.append("removedImageUrls", JSON.stringify(removedImageUrls));
  }

  images?.forEach((image) => {
    formData.append("images", {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as any);
  });

  return formData;
}

/* =========================================================
   PAGINATION NORMALIZATION
========================================================= */

function normalizePagination(
  response: ItemListResponse,
  params: ItemListParams,
): PaginatedItems {
  const page = response.pagination?.page ?? params.page ?? 1;

  const limit = response.pagination?.limit ?? params.limit ?? 10;

  const total = response.pagination?.total ?? response.items.length;

  const totalPages =
    response.pagination?.totalPages ??
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  return {
    items: response.items,
    page,
    limit,
    total,
    totalPages,
    hasNextPage: response.pagination?.hasNextPage ?? page < totalPages,
    hasPreviousPage: response.pagination?.hasPreviousPage ?? page > 1,
  };
}

/* =========================================================
   ITEMS API
========================================================= */

export const itemsApi = {
  /**
   * Get all items with pagination and filters.
   */
  async getItems(
    params: ItemListParams = {},
    config?: AxiosRequestConfig,
  ): Promise<PaginatedItems> {
    try {
      const response = await itemsHttp.get(ITEMS_ENDPOINT, {
        ...config,
        params: buildQueryParams(params),
      });

      const normalized = extractItems(response.data);

      return normalizePagination(normalized, params);
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get a single item by its ID.
   */
  async getItemById(
    itemId: string,
    config?: AxiosRequestConfig,
  ): Promise<Item> {
    try {
      if (!itemId.trim()) {
        throw new Error("Item ID is required.");
      }

      const response = await itemsHttp.get(
        `${ITEMS_ENDPOINT}/${encodeURIComponent(itemId)}`,
        config,
      );

      return extractItem(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Search items.
   */
  async searchItems(
    search: string,
    params: Omit<ItemListParams, "search"> = {},
  ): Promise<PaginatedItems> {
    return this.getItems({
      ...params,
      search,
    });
  },

  /**
   * Get lost item reports.
   */
  async getLostItems(
    params: Omit<ItemListParams, "type"> = {},
  ): Promise<PaginatedItems> {
    return this.getItems({
      ...params,
      type: "LOST",
    });
  },

  /**
   * Get found item reports.
   */
  async getFoundItems(
    params: Omit<ItemListParams, "type"> = {},
  ): Promise<PaginatedItems> {
    return this.getItems({
      ...params,
      type: "FOUND",
    });
  },

  /**
   * Get the current user's item reports.
   */
  async getMyItems(params: ItemListParams = {}): Promise<PaginatedItems> {
    return this.getItems({
      ...params,
      mine: true,
    });
  },

  /**
   * Create a new lost or found item report.
   */
  async createItem(payload: CreateItemPayload): Promise<Item> {
    try {
      const formData = createItemFormData(payload);

      const response = await itemsHttp.post(ITEMS_ENDPOINT, formData);

      return extractItem(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Update an existing item.
   */
  async updateItem(itemId: string, payload: UpdateItemPayload): Promise<Item> {
    try {
      if (!itemId.trim()) {
        throw new Error("Item ID is required.");
      }

      const formData = createItemFormData(payload);

      const response = await itemsHttp.patch(
        `${ITEMS_ENDPOINT}/${encodeURIComponent(itemId)}`,
        formData,
      );

      return extractItem(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Delete an item report.
   */
  async deleteItem(itemId: string): Promise<void> {
    try {
      if (!itemId.trim()) {
        throw new Error("Item ID is required.");
      }

      await itemsHttp.delete(`${ITEMS_ENDPOINT}/${encodeURIComponent(itemId)}`);
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Get items belonging to a specific category.
   */
  async getItemsByCategory(
    categoryId: string,
    params: ItemListParams = {},
  ): Promise<PaginatedItems> {
    return this.getItems({
      ...params,
      categoryId,
    });
  },

  /**
   * Get items from a specific campus location.
   */
  async getItemsByLocation(
    locationId: string,
    params: ItemListParams = {},
  ): Promise<PaginatedItems> {
    return this.getItems({
      ...params,
      locationId,
    });
  },

  /**
   * Get recently reported items.
   */
  async getRecentItems(limit = 10): Promise<Item[]> {
    const response = await this.getItems({
      page: 1,
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    return response.items;
  },
};

/* =========================================================
   API ERROR EXPORT
========================================================= */

export { getApiError };

export default itemsApi;
