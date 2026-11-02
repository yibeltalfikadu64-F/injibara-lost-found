import { useState } from "react";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { authApi } from "../services/authApi";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../validation/authSchemas";

import { getApiErrorMessage } from "../../../lib/apiClient";

interface ForgotPasswordFormProps {
  onBack?: () => void;
}

export default function ForgotPasswordForm({
  onBack,
}: ForgotPasswordFormProps) {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await authApi.forgotPassword(values);

      setSuccessMessage(
        response.message ||
          "If an account exists for that email, password reset instructions will be sent.",
      );
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {onBack && (
        <button type="button" className="auth-back-button" onClick={onBack}>
          <ArrowLeft size={17} />
          Back to login
        </button>
      )}

      <div className="auth-form__heading">
        <h2>Forgot your password?</h2>
        <p>
          Enter your registered email address to request password reset
          instructions.
        </p>
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
        <label htmlFor="forgot-email">Email address</label>

        <div className="form-field__input">
          <Mail size={18} />

          <input
            id="forgot-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />
        </div>

        {errors.email && (
          <span className="form-error">{errors.email.message}</span>
        )}
      </div>

      <button type="submit" className="auth-submit" disabled={isSubmitting}>
        {isSubmitting ? (
          "Sending request..."
        ) : (
          <>
            <Send size={18} />
            Send reset instructions
          </>
        )}
      </button>
    </form>
  );
}
