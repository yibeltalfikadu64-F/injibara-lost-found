import { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "../hooks/useAuth";

import {
  registerSchema,
  type RegisterFormValues,
} from "../validation/authSchemas";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register: createAccount, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      studentId: "",
      department: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError("");
    setSuccessMessage("");

    try {
      const { confirmPassword: _confirmPassword, ...credentials } = values;

      const response = await createAccount(credentials);

      if (response.accessToken) {
        setSuccessMessage("Your account has been created.");
        onSuccess?.();
      } else {
        setSuccessMessage(
          "Registration submitted. Follow the instructions from your administrator.",
        );
      }
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Registration failed.",
      );
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="auth-form__heading">
        <h2>Create an account</h2>
        <p>Register for the Injibara Campus Lost &amp; Found system.</p>
      </div>

      {serverError && (
        <div className="auth-alert auth-alert--error" role="alert">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="auth-alert auth-alert--success" role="status">
          {successMessage}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="register-name">Full name</label>
        <input
          id="register-name"
          type="text"
          placeholder="Enter your full name"
          autoComplete="name"
          {...register("fullName")}
        />
        {errors.fullName && (
          <span className="form-error">{errors.fullName.message}</span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="register-email">Email address</label>
        <input
          id="register-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <span className="form-error">{errors.email.message}</span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="register-student-id">Student ID (optional)</label>
        <input
          id="register-student-id"
          type="text"
          placeholder="Enter student ID"
          {...register("studentId")}
        />
      </div>

      <div className="form-field">
        <label htmlFor="register-department">Department (optional)</label>
        <input
          id="register-department"
          type="text"
          placeholder="Enter your department"
          {...register("department")}
        />
      </div>

      <div className="form-field">
        <label htmlFor="register-password">Password</label>

        <div className="form-field__input">
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            {...register("password")}
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {errors.password && (
          <span className="form-error">{errors.password.message}</span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="register-confirm-password">Confirm password</label>

        <input
          id="register-confirm-password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter password again"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />

        {errors.confirmPassword && (
          <span className="form-error">{errors.confirmPassword.message}</span>
        )}
      </div>

      <button type="submit" className="auth-submit" disabled={isLoading}>
        {isLoading ? (
          "Creating account..."
        ) : (
          <>
            <UserPlus size={18} />
            Create account
          </>
        )}
      </button>
    </form>
  );
}
