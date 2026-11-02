
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const AUTH_STORAGE_KEY = 'injibara-admin-auth';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

interface PersistedAuth {
  state?: {
    accessToken?: string | null;
  };
}

function getAccessToken(): string | null {
  try {
    const storedValue = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedValue) {
      return null;
    }

    const parsed = JSON.parse(storedValue) as PersistedAuth;

    return parsed.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Authentication state is cleared by the auth store or
      // the application when it determines the session has expired.
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | {
          message?: string | string[];
          error?: string;
        }
      | undefined;

    if (Array.isArray(responseData?.message)) {
      return responseData.message.join(', ');
    }

    if (responseData?.message) {
      return responseData.message;
    }

    if (responseData?.error) {
      return responseData.error;
    }

    if (error.code === 'ECONNABORTED') {
      return 'The request timed out. Please try again.';
    }

    if (!error.response) {
      return 'Cannot connect to the server. Check that the backend is running.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default apiClient;
