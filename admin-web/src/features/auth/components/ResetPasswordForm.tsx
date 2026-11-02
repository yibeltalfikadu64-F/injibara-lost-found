import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Save } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { authApi } from "../services/authApi";

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../validation/authSchemas";

import { getApiErrorMessage } from "../../../lib/apiClient";

interface ResetPasswordFormProps {
  token?: string;
  onSuccess?: () => void;
}

export default function ResetPasswordForm({
  token: suppliedToken,
  onSuccess,
}: ResetPasswordFormProps) {
  const [searchParams] = useSearchParams();

  const token = suppliedToken || searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError("");
    setSuccessMessage("");

    if (!token) {
      setServerError(
        "The password reset token is missing. Please request a new reset link.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.resetPassword({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      setSuccessMessage(response.message || "Your password has been reset.");

      onSuccess?.();
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-form">
        <div className="auth-alert auth-alert--error">
          No reset token was found in the URL.
        </div>
        <p>Please request a new password reset link.</p>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="auth-form__heading">
        <h2>Reset your password</h2>
        <p>Create a new password for your account.</p>
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

      <input type="hidden" {...register("token")} />

      <div className="form-field">
        <label htmlFor="reset-password">New password</label>

        <div className="form-field__input">
          <LockKeyhole size={18} />

          <input
            id="reset-password"
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
        <label htmlFor="reset-confirm-password">Confirm new password</label>

        <input
          id="reset-confirm-password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your new password again"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />

        {errors.confirmPassword && (
          <span className="form-error">{errors.confirmPassword.message}</span>
        )}
      </div>

      <button type="submit" className="auth-submit" disabled={isSubmitting}>
        {isSubmitting ? (
          "Updating password..."
        ) : (
          <>
            <Save size={18} />
            Reset password
          </>
        )}
      </button>
    </form>
  );
}
