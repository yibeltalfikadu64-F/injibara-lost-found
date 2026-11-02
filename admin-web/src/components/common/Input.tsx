import React, { forwardRef, useState } from "react";

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: "small" | "medium" | "large";
  fullWidth?: boolean;
  textarea?: boolean;
  rows?: number;
  containerClassName?: string;
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}

const inputSizes = {
  small: {
    height: 36,
    padding: "7px 10px",
    fontSize: 13,
  },
  medium: {
    height: 43,
    padding: "10px 12px",
    fontSize: 14,
  },
  large: {
    height: 50,
    padding: "13px 14px",
    fontSize: 15,
  },
};

const baseInputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "#ffffff",
  color: "#0f172a",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 150ms ease, box-shadow 150ms ease",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    inputSize = "medium",
    fullWidth = true,
    textarea = false,
    rows = 4,
    containerClassName,
    textareaProps,
    id,
    disabled,
    required,
    style,
    ...inputProps
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  const sizeStyle = inputSizes[inputSize];

  const fieldStyle: React.CSSProperties = {
    ...baseInputStyle,
    minHeight: textarea ? undefined : sizeStyle.height,
    padding: sizeStyle.padding,
    fontSize: sizeStyle.fontSize,
    borderColor: error ? "#dc2626" : focused ? "#2563eb" : "#cbd5e1",
    boxShadow: focused
      ? error
        ? "0 0 0 3px rgba(220,38,38,0.10)"
        : "0 0 0 3px rgba(37,99,235,0.12)"
      : "none",
    background: disabled ? "#f1f5f9" : "#ffffff",
    resize: textarea ? "vertical" : undefined,
    ...style,
  };

  return (
    <div
      className={containerClassName}
      style={{
        width: fullWidth ? "100%" : "auto",
        display: "flex",
        flexDirection: "column",
        gap: 7,
      }}
    >
      {label && (
        <label
          htmlFor={fieldId}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#334155",
          }}
        >
          {label}
          {required && (
            <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span>
          )}
        </label>
      )}

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: textarea ? "flex-start" : "center",
        }}
      >
        {leftIcon && !textarea && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 12,
              color: "#94a3b8",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            {leftIcon}
          </span>
        )}

        {textarea ? (
          <textarea
            id={fieldId}
            rows={rows}
            disabled={disabled}
            required={required}
            placeholder={inputProps.placeholder}
            name={inputProps.name}
            value={inputProps.value as string | number | undefined}
            defaultValue={inputProps.defaultValue as string | undefined}
            onChange={
              inputProps.onChange as React.ChangeEventHandler<HTMLTextAreaElement>
            }
            onBlur={(event) => {
              setFocused(false);
              inputProps.onBlur?.(
                event as unknown as React.FocusEvent<HTMLInputElement>,
              );
            }}
            onFocus={(event) => {
              setFocused(true);
              inputProps.onFocus?.(
                event as unknown as React.FocusEvent<HTMLInputElement>,
              );
            }}
            style={{
              ...fieldStyle,
              minHeight: rows * 23,
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${fieldId}-error`
                : helperText
                  ? `${fieldId}-help`
                  : undefined
            }
            {...textareaProps}
          />
        ) : (
          <input
            {...inputProps}
            ref={ref}
            id={fieldId}
            disabled={disabled}
            required={required}
            onFocus={(event) => {
              setFocused(true);
              inputProps.onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              inputProps.onBlur?.(event);
            }}
            style={{
              ...fieldStyle,
              paddingLeft: leftIcon ? 38 : sizeStyle.padding.split(" ")[1],
              paddingRight: rightIcon ? 38 : sizeStyle.padding.split(" ")[1],
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${fieldId}-error`
                : helperText
                  ? `${fieldId}-help`
                  : undefined
            }
          />
        )}

        {rightIcon && !textarea && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              right: 12,
              color: "#94a3b8",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <span
          id={`${fieldId}-error`}
          role="alert"
          style={{ color: "#dc2626", fontSize: 12 }}
        >
          {error}
        </span>
      ) : helperText ? (
        <span id={`${fieldId}-help`} style={{ color: "#64748b", fontSize: 12 }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

export default Input;
