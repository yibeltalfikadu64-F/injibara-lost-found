// mobile/src/store/uiStore.ts

import { create } from 'zustand';

// ============================================================
// TYPES
// ============================================================

export type ToastType =
  | 'SUCCESS'
  | 'ERROR'
  | 'WARNING'
  | 'INFO';

export type ModalType =
  | 'NONE'
  | 'CONFIRMATION'
  | 'IMAGE_PREVIEW'
  | 'ITEM_DETAILS'
  | 'CUSTOM';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
  createdAt: number;
}

export interface ConfirmationDialog {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  destructive: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ModalData {
  type: ModalType;
  visible: boolean;
  title?: string;
  data?: Record<string, unknown>;
}

export interface GlobalLoadingState {
  visible: boolean;
  message: string;
  progress?: number;
}

export interface UIState {
  // ----------------------------------------------------------
  // GLOBAL LOADING
  // ----------------------------------------------------------

  loading: GlobalLoadingState;

  showLoading: (
    message?: string,
  ) => void;

  hideLoading: () => void;

  setLoadingProgress: (
    progress: number,
  ) => void;

  // ----------------------------------------------------------
  // TOAST MESSAGES
  // ----------------------------------------------------------

  toasts: ToastMessage[];

  showToast: (
    type: ToastType,
    message: string,
    title?: string,
    duration?: number,
  ) => string;

  showSuccess: (
    message: string,
    title?: string,
  ) => string;

  showError: (
    message: string,
    title?: string,
  ) => string;

  showWarning: (
    message: string,
    title?: string,
  ) => string;

  showInfo: (
    message: string,
    title?: string,
  ) => string;

  removeToast: (id: string) => void;

  clearToasts: () => void;

  // ----------------------------------------------------------
  // CONFIRMATION DIALOG
  // ----------------------------------------------------------

  confirmation: ConfirmationDialog;

  showConfirmation: (
    options: Partial<ConfirmationDialog> &
      Pick<
        ConfirmationDialog,
        'title' | 'message'
      >,
  ) => void;

  confirmAction: () => Promise<void>;

  cancelConfirmation: () => void;

  // ----------------------------------------------------------
  // MODAL
  // ----------------------------------------------------------

  modal: ModalData;

  openModal: (
    type: ModalType,
    data?: Record<string, unknown>,
    title?: string,
  ) => void;

  closeModal: () => void;

  // ----------------------------------------------------------
  // NAVIGATION DRAWER
  // ----------------------------------------------------------

  drawerVisible: boolean;

  openDrawer: () => void;

  closeDrawer: () => void;

  toggleDrawer: () => void;

  // ----------------------------------------------------------
  // NETWORK BANNER
  // ----------------------------------------------------------

  networkBannerVisible: boolean;

  networkMessage: string;

  showNetworkBanner: (
    message?: string,
  ) => void;

  hideNetworkBanner: () => void;

  // ----------------------------------------------------------
  // SEARCH
  // ----------------------------------------------------------

  searchVisible: boolean;

  searchQuery: string;

  openSearch: () => void;

  closeSearch: () => void;

  setSearchQuery: (query: string) => void;

  clearSearch: () => void;

  // ----------------------------------------------------------
  // BOTTOM SHEET
  // ----------------------------------------------------------

  bottomSheetVisible: boolean;

  bottomSheetData: Record<string, unknown> | null;

  openBottomSheet: (
    data?: Record<string, unknown>,
  ) => void;

  closeBottomSheet: () => void;

  // ----------------------------------------------------------
  // REFRESH INDICATOR
  // ----------------------------------------------------------

  refreshing: boolean;

  setRefreshing: (refreshing: boolean) => void;

  // ----------------------------------------------------------
  // UI RESET
  // ----------------------------------------------------------

  resetUI: () => void;
}

// ============================================================
// CONSTANTS
// ============================================================

const MAX_TOASTS = 5;

const DEFAULT_TOAST_DURATION = 3500;

// ============================================================
// ID GENERATOR
// ============================================================

function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 9)
  );
}

// ============================================================
// INITIAL CONFIRMATION STATE
// ============================================================

const INITIAL_CONFIRMATION: ConfirmationDialog = {
  visible: false,

  title: '',

  message: '',

  confirmText: 'Confirm',

  cancelText: 'Cancel',

  destructive: false,

  onConfirm: undefined,

  onCancel: undefined,
};

// ============================================================
// INITIAL MODAL STATE
// ============================================================

const INITIAL_MODAL: ModalData = {
  type: 'NONE',

  visible: false,
};

// ============================================================
// UI STORE
// ============================================================

export const useUIStore = create<UIState>()(
  (set, get) => ({
    // ========================================================
    // INITIAL STATE
    // ========================================================

    loading: {
      visible: false,
      message: 'Loading...',
      progress: undefined,
    },

    toasts: [],

    confirmation: INITIAL_CONFIRMATION,

    modal: INITIAL_MODAL,

    drawerVisible: false,

    networkBannerVisible: false,

    networkMessage: 'You are offline.',

    searchVisible: false,

    searchQuery: '',

    bottomSheetVisible: false,

    bottomSheetData: null,

    refreshing: false,

    // ========================================================
    // GLOBAL LOADING
    // ========================================================

    showLoading: (message = 'Loading...') => {
      set({
        loading: {
          visible: true,
          message,
          progress: undefined,
        },
      });
    },

    hideLoading: () => {
      set({
        loading: {
          visible: false,
          message: '',
          progress: undefined,
        },
      });
    },

    setLoadingProgress: (progress) => {
      const safeProgress = Math.min(
        100,
        Math.max(0, progress),
      );

      set((state) => ({
        loading: {
          ...state.loading,
          progress: safeProgress,
        },
      }));
    },

    // ========================================================
    // TOAST CREATION
    // ========================================================

    showToast: (
      type,
      message,
      title,
      duration = DEFAULT_TOAST_DURATION,
    ) => {
      if (!message.trim()) {
        return '';
      }

      const id = generateId();

      const toast: ToastMessage = {
        id,

        type,

        title,

        message,

        duration: Math.max(
          1000,
          duration,
        ),

        createdAt: Date.now(),
      };

      set((state) => ({
        toasts: [
          ...state.toasts,
          toast,
        ].slice(-MAX_TOASTS),
      }));

      return id;
    },

    // ========================================================
    // SUCCESS TOAST
    // ========================================================

    showSuccess: (message, title = 'Success') => {
      return get().showToast(
        'SUCCESS',
        message,
        title,
      );
    },

    // ========================================================
    // ERROR TOAST
    // ========================================================

    showError: (message, title = 'Error') => {
      return get().showToast(
        'ERROR',
        message,
        title,
        5000,
      );
    },

    // ========================================================
    // WARNING TOAST
    // ========================================================

    showWarning: (message, title = 'Warning') => {
      return get().showToast(
        'WARNING',
        message,
        title,
        4500,
      );
    },

    // ========================================================
    // INFO TOAST
    // ========================================================

    showInfo: (message, title = 'Information') => {
      return get().showToast(
        'INFO',
        message,
        title,
      );
    },

    // ========================================================
    // REMOVE TOAST
    // ========================================================

    removeToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter(
          (toast) => toast.id !== id,
        ),
      }));
    },

    // ========================================================
    // CLEAR TOASTS
    // ========================================================

    clearToasts: () => {
      set({
        toasts: [],
      });
    },

    // ========================================================
    // SHOW CONFIRMATION
    // ========================================================

    showConfirmation: (options) => {
      set({
        confirmation: {
          visible: true,

          title: options.title,

          message: options.message,

          confirmText:
            options.confirmText ?? 'Confirm',

          cancelText:
            options.cancelText ?? 'Cancel',

          destructive:
            options.destructive ?? false,

          onConfirm: options.onConfirm,

          onCancel: options.onCancel,
        },
      });
    },

    // ========================================================
    // CONFIRM ACTION
    // ========================================================

    confirmAction: async () => {
      const confirmation =
        get().confirmation;

      if (!confirmation.visible) {
        return;
      }

      // Close the dialog before running the action.
      set({
        confirmation: INITIAL_CONFIRMATION,
      });

      try {
        await confirmation.onConfirm?.();
      } catch (error) {
        console.error(
          'Confirmation action failed:',
          error,
        );

        get().showError(
          error instanceof Error
            ? error.message
            : 'The requested action could not be completed.',
        );
      }
    },

    // ========================================================
    // CANCEL CONFIRMATION
    // ========================================================

    cancelConfirmation: () => {
      const callback =
        get().confirmation.onCancel;

      set({
        confirmation: INITIAL_CONFIRMATION,
      });

      callback?.();
    },

    // ========================================================
    // OPEN MODAL
    // ========================================================

    openModal: (
      type,
      data,
      title,
    ) => {
      if (type === 'NONE') {
        return;
      }

      set({
        modal: {
          type,

          visible: true,

          data,

          title,
        },
      });
    },

    // ========================================================
    // CLOSE MODAL
    // ========================================================

    closeModal: () => {
      set({
        modal: INITIAL_MODAL,
      });
    },

    // ========================================================
    // DRAWER
    // ========================================================

    openDrawer: () => {
      set({
        drawerVisible: true,
      });
    },

    closeDrawer: () => {
      set({
        drawerVisible: false,
      });
    },

    toggleDrawer: () => {
      set((state) => ({
        drawerVisible: !state.drawerVisible,
      }));
    },

    // ========================================================
    // NETWORK BANNER
    // ========================================================

    showNetworkBanner: (
      message = 'You are offline. Some features may be unavailable.',
    ) => {
      set({
        networkBannerVisible: true,

        networkMessage: message,
      });
    },

    hideNetworkBanner: () => {
      set({
        networkBannerVisible: false,
      });
    },

    // ========================================================
    // SEARCH
    // ========================================================

    openSearch: () => {
      set({
        searchVisible: true,
      });
    },

    closeSearch: () => {
      set({
        searchVisible: false,

        searchQuery: '',
      });
    },

    setSearchQuery: (query) => {
      set({
        searchQuery: query,
      });
    },

    clearSearch: () => {
      set({
        searchQuery: '',
      });
    },

    // ========================================================
    // BOTTOM SHEET
    // ========================================================

    openBottomSheet: (data) => {
      set({
        bottomSheetVisible: true,

        bottomSheetData: data ?? null,
      });
    },

    closeBottomSheet: () => {
      set({
        bottomSheetVisible: false,

        bottomSheetData: null,
      });
    },

    // ========================================================
    // REFRESHING
    // ========================================================

    setRefreshing: (refreshing) => {
      set({
        refreshing,
      });
    },

    // ========================================================
    // RESET UI
    // ========================================================

    resetUI: () => {
      set({
        loading: {
          visible: false,
          message: '',
          progress: undefined,
        },

        toasts: [],

        confirmation: INITIAL_CONFIRMATION,

        modal: INITIAL_MODAL,

        drawerVisible: false,

        networkBannerVisible: false,

        networkMessage: 'You are offline.',

        searchVisible: false,

        searchQuery: '',

        bottomSheetVisible: false,

        bottomSheetData: null,

        refreshing: false,
      });
    },
  }),
);

// ============================================================
// SELECTORS
// ============================================================

export const selectGlobalLoading = (
  state: UIState,
) => state.loading;

export const selectToasts = (
  state: UIState,
) => state.toasts;

export const selectConfirmation = (
  state: UIState,
) => state.confirmation;

export const selectModal = (
  state: UIState,
) => state.modal;

export const selectDrawerVisible = (
  state: UIState,
) => state.drawerVisible;

export const selectNetworkBannerVisible = (
  state: UIState,
) => state.networkBannerVisible;

export const selectSearchQuery = (
  state: UIState,
) => state.searchQuery;

// ============================================================
// NON-REACT HELPERS
// ============================================================

export const showGlobalSuccess = (
  message: string,
) => {
  useUIStore.getState().showSuccess(message);
};

export const showGlobalError = (
  message: string,
) => {
  useUIStore.getState().showError(message);
};

export const showGlobalLoading = (
  message?: string,
) => {
  useUIStore.getState().showLoading(message);
};

export const hideGlobalLoading = () => {
  useUIStore.getState().hideLoading();
};

// ============================================================
// EXPORT
// ============================================================

const uiStore = {
  useUIStore,

  showGlobalSuccess,
  showGlobalError,

  showGlobalLoading,
  hideGlobalLoading,
};

export default uiStore;