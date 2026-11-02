
import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuth } from '../hooks/useAuth';
import {
  loginSchema,
  type LoginFormValues,
} from '../validation/authSchemas';

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

export default function LoginForm({
  onSuccess,
  onForgotPassword,
}: LoginFormProps) {
  const { login, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError('');

    try {
      await login(values);
      onSuccess?.();
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'Unable to sign in.',
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="auth-form"
      noValidate
    >
      <div className="auth-form__heading">
        <h2>Welcome back</h2>
        <p>Sign in to manage the campus lost and found system.</p>
      </div>

      {serverError && (
        <div className="auth-alert auth-alert--error" role="alert">
          {serverError}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="login-email">Email address</label>

        <div className="form-field__input">
          <Mail size={18} aria-hidden="true" />

          <input
            id="login-email"
            type="email"
            placeholder="admin@injibara.edu.et"
            autoComplete="username"
            {...register('email')}
            aria-invalid={Boolean(errors.email)}
          />
        </div>

        {errors.email && (
          <span className="form-error">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="form-field">
        <div className="form-field__label-row">
          <label htmlFor="login-password">Password</label>

          {onForgotPassword && (
            <button
              type="button"
              className="auth-link"
              onClick={onForgotPassword}
            >
              Forgot password?
            </button>
          )}
        </div>

        <div className="form-field__input">
          <LockKeyhole size={18} aria-hidden="true" />

          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            autoComplete="current-password"
            {...register('password')}
            aria-invalid={Boolean(errors.password)}
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={
              showPassword ? 'Hide password' : 'Show password'
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {errors.password && (
          <span className="form-error">
            {errors.password.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="auth-submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <span>Signing in...</span>
        ) : (
          <>
            <LogIn size={18} />
            <span>Sign in</span>
          </>
        )}
      </button>

      <p className="auth-form__footer">
        Injibara Campus Lost &amp; Found Administration
      </p>
    </form>
  );
}
