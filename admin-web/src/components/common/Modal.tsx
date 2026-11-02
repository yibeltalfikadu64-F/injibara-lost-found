import React, { useEffect, useId } from "react";
import { createPortal } from "react-dom";

export type ModalSize = "small" | "medium" | "large" | "full";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventBodyScroll?: boolean;
  headerActions?: React.ReactNode;
}

const modalWidths: Record<ModalSize, string> = {
  small: "420px",
  medium: "600px",
  large: "850px",
  full: "min(1100px, calc(100vw - 32px))",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "medium",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventBodyScroll = true,
  headerActions,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;

    if (preventBodyScroll) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, closeOnEscape, onClose, preventBodyScroll]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const modalContent = (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && closeOnBackdrop) {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(15,23,42,0.58)",
        backdropFilter: "blur(3px)",
        animation: "modal-fade-in 150ms ease",
      }}
    >
      <style>
        {`
          @keyframes modal-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes modal-slide-in {
            from { opacity: 0; transform: translateY(12px) scale(.99); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}
      </style>

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: modalWidths[size],
          maxHeight: "calc(100vh - 32px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 24px 70px rgba(15,23,42,0.25)",
          animation: "modal-slide-in 180ms ease",
        }}
      >
        {(title || showCloseButton || headerActions) && (
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              padding: "20px 24px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div style={{ minWidth: 0 }}>
              {title && (
                <h2
                  id={titleId}
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: 19,
                    fontWeight: 700,
                  }}
                >
                  {title}
                </h2>
              )}

              {description && (
                <p
                  id={descriptionId}
                  style={{
                    margin: "6px 0 0",
                    color: "#64748b",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {description}
                </p>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {headerActions}

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  style={{
                    width: 34,
                    height: 34,
                    border: "none",
                    borderRadius: 8,
                    background: "#f1f5f9",
                    color: "#475569",
                    fontSize: 22,
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </header>
        )}

        <div
          style={{
            padding: 24,
            overflowY: "auto",
            flex: 1,
            minHeight: 0,
          }}
        >
          {children}
        </div>

        {footer && (
          <footer
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #e2e8f0",
              background: "#f8fafc",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {footer}
          </footer>
        )}
      </section>
    </div>
  );

  return createPortal(modalContent, document.body);
}
