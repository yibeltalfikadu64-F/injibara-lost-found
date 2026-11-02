import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuthStore } from "../../store/authStore";

export type UserRole = "STUDENT" | "STAFF" | "SECURITY" | "ADMIN";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  studentId?: string | null;
  department?: string | null;
  profileImage?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  studentId?: string;
  department?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoggingOut: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;

  register: (credentials: RegisterCredentials) => Promise<void>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;

  clearError: () => void;

  hasRole: (roles: UserRole | UserRole[]) => boolean;

  isAdmin: boolean;
  isStudent: boolean;
  isStaff: boolean;
  isSecurity: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "An unexpected authentication error occurred.";
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  /*
   * The authentication store is the central source of truth.
   *
   * This provider deliberately delegates token and user persistence
   * to authStore instead of creating a second independent session.
   */
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const storeLogin = useAuthStore((state) => state.login);
  const storeRegister = useAuthStore((state) => state.register);
  const storeLogout = useAuthStore((state) => state.logout);
  const loadUser = useAuthStore((state) => state.loadUser);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * Restore the previous authentication session when the application
   * starts.
   *
   * loadUser should read the saved session using the existing authStore
   * and validate or restore the user through your authentication service.
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuthentication = async () => {
      try {
        await loadUser();
      } catch (initializationError) {
        if (mounted) {
          setError(getErrorMessage(initializationError));
        }
      }
    };

    void initializeAuthentication();

    return () => {
      mounted = false;
    };
  }, [loadUser]);

  /*
   * LOGIN
   */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      setError(null);

      const email = credentials.email.trim().toLowerCase();
      const password = credentials.password;

      if (!email || !password) {
        const message = "Email and password are required.";
        setError(message);
        throw new Error(message);
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const message = "Please enter a valid email address.";
        setError(message);
        throw new Error(message);
      }

      setIsLoggingIn(true);

      try {
        await storeLogin({
          email,
          password,
        });
      } catch (loginError) {
        const message = getErrorMessage(loginError);
        setError(message);
        throw loginError;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [storeLogin],
  );

  /*
   * REGISTER
   */
  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<void> => {
      setError(null);

      const fullName = credentials.fullName.trim();
      const email = credentials.email.trim().toLowerCase();
      const password = credentials.password;

      if (!fullName || !email || !password) {
        const message = "Full name, email, and password are required.";

        setError(message);
        throw new Error(message);
      }

      if (fullName.length < 2) {
        const message = "Full name must contain at least 2 characters.";
        setError(message);
        throw new Error(message);
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const message = "Please enter a valid email address.";
        setError(message);
        throw new Error(message);
      }

      if (password.length < 8) {
        const message = "Password must contain at least 8 characters.";

        setError(message);
        throw new Error(message);
      }

      setIsRegistering(true);

      try {
        await storeRegister({
          fullName,
          email,
          password,
          ...(credentials.phone ? { phone: credentials.phone.trim() } : {}),
          ...(credentials.studentId
            ? { studentId: credentials.studentId.trim() }
            : {}),
          ...(credentials.department
            ? { department: credentials.department.trim() }
            : {}),
        });
      } catch (registrationError) {
        const message = getErrorMessage(registrationError);
        setError(message);
        throw registrationError;
      } finally {
        setIsRegistering(false);
      }
    },
    [storeRegister],
  );

  /*
   * LOGOUT
   */
  const logout = useCallback(async (): Promise<void> => {
    setError(null);
    setIsLoggingOut(true);

    try {
      await storeLogout();
    } catch (logoutError) {
      const message = getErrorMessage(logoutError);
      setError(message);
      throw logoutError;
    } finally {
      setIsLoggingOut(false);
    }
  }, [storeLogout]);

  /*
   * REFRESH USER
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      await loadUser();
    } catch (refreshError) {
      const message = getErrorMessage(refreshError);
      setError(message);
      throw refreshError;
    }
  }, [loadUser]);

  /*
   * CLEAR AUTHENTICATION ERROR
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /*
   * ROLE CHECKING
   */
  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) {
        return false;
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      return allowedRoles.includes(user.role);
    },
    [user],
  );

  /*
   * CONVENIENCE ROLE FLAGS
   */
  const isAdmin = user?.role === "ADMIN";
  const isStudent = user?.role === "STUDENT";
  const isStaff = user?.role === "STAFF";
  const isSecurity = user?.role === "SECURITY";

  /*
   * CONTEXT VALUE
   */
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user: user as AuthUser | null,
      isAuthenticated,
      isLoading,
      isLoggingIn,
      isRegistering,
      isLoggingOut,
      error,
      login,
      register,
      logout,
      refreshUser,
      clearError,
      hasRole,
      isAdmin,
      isStudent,
      isStaff,
      isSecurity,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      isLoggingIn,
      isRegistering,
      isLoggingOut,
      error,
      login,
      register,
      logout,
      refreshUser,
      clearError,
      hasRole,
      isAdmin,
      isStudent,
      isStaff,
      isSecurity,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

/*
 * CUSTOM AUTHENTICATION HOOK
 *
 * Example:
 * const { user, isAuthenticated, logout } = useAuth();
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
};

export default AuthProvider;
