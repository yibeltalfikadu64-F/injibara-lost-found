
import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'outline'
  | 'ghost'
  | 'link';

export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rounded?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: '#2563eb',
    color: '#ffffff',
    border: '1px solid #2563eb',
  },
  secondary: {
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #e2e8f0',
  },
  success: {
    background: '#16a34a',
    color: '#ffffff',
    border: '1px solid #16a34a',
  },
  danger: {
    background: '#dc2626',
    color: '#ffffff',
    border: '1px solid #dc2626',
  },
  warning: {
    background: '#f59e0b',
    color: '#ffffff',
    border: '1px solid #f59e0b',
  },
  outline: {
    background: 'transparent',
    color: '#2563eb',
    border: '1px solid #2563eb',
  },
  ghost: {
    background: 'transparent',
    color: '#475569',
    border: '1px solid transparent',
  },
  link: {
    background: 'transparent',
    color: '#2563eb',
    border: '1px solid transparent',
    textDecoration: 'underline',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  small: {
    minHeight: 32,
    padding: '6px 12px',
    fontSize: 12,
  },
  medium: {
    minHeight: 40,
    padding: '9px 16px',
    fontSize: 14,
  },
  large: {
    minHeight: 48,
    padding: '12px 22px',
    fontSize: 15,
  },
};

const spinnerStyle: React.CSSProperties = {
  width: 15,
  height: 15,
  border: '2px solid currentColor',
  borderRightColor: 'transparent',
  borderRadius: '50%',
  display: 'inline-block',
  animation: 'button-spin 0.7s linear infinite',
};

export default function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  rounded = false,
  disabled,
  children,
  style,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    width: fullWidth ? '100%' : 'auto',
    fontWeight: 600,
    fontFamily: 'inherit',
    lineHeight: 1.4,
    borderRadius: rounded ? 999 : 9,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.55 : 1,
    transition: 'background 150ms ease, transform 150ms ease, box-shadow 150ms ease',
    whiteSpace: 'nowrap',
    outline: 'none',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <>
      <style>
        {`
          @keyframes button-spin {
            to { transform: rotate(360deg); }
          }

          .app-button:not(:disabled):active {
            transform: scale(0.98);
          }

          .app-button:focus-visible {
            outline: 3px solid rgba(37, 99, 235, 0.25);
            outline-offset: 2px;
          }
        `}
      </style>

      <button
        {...rest}
        type={type}
        disabled={isDisabled}
        className={`app-button ${rest.className ?? ''}`.trim()}
        style={buttonStyle}
        aria-busy={loading}
      >
        {loading ? (
          <span style={spinnerStyle} aria-hidden="true" />
        ) : (
          leftIcon && <span aria-hidden="true">{leftIcon}</span>
        )}

        <span>{loading ? 'Please wait...' : children}</span>

        {!loading && rightIcon && (
          <span aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    </>
  );
}
