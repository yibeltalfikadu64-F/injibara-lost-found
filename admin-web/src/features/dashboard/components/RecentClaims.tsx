import { FileCheck, ArrowRight, User, Package } from "lucide-react";

import type { DashboardClaim } from "../types/dashboard.types";

interface RecentClaimsProps {
  claims: DashboardClaim[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onSelectClaim?: (claim: DashboardClaim) => void;
}

function getClaimStatusClass(status: DashboardClaim["status"]) {
  return `claim-status claim-status--${status.toLowerCase()}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RecentClaims({
  claims,
  isLoading = false,
  onViewAll,
  onSelectClaim,
}: RecentClaimsProps) {
  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel__header">
        <div>
          <h3>Recent Claims</h3>
          <p>Latest ownership verification requests.</p>
        </div>

        {onViewAll && (
          <button
            type="button"
            className="dashboard-text-button"
            onClick={onViewAll}
          >
            View all <ArrowRight size={15} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="recent-claims-loading">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="recent-claim-skeleton" key={index} />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="dashboard-empty">
          <FileCheck size={30} />
          <p>No claims found.</p>
        </div>
      ) : (
        <div className="recent-claims-list">
          {claims.map((claim) => (
            <button
              type="button"
              className="recent-claim"
              key={claim.id}
              onClick={() => onSelectClaim?.(claim)}
            >
              <div className="recent-claim__icon">
                <FileCheck size={20} />
              </div>

              <div className="recent-claim__content">
                <strong>{claim.item?.title || "Item claim"}</strong>

                <span>
                  <User size={13} />
                  {claim.claimant?.fullName || "Unknown claimant"}
                </span>

                <span>
                  <Package size={13} />
                  {claim.item?.type || "Item"}
                </span>

                <time dateTime={claim.createdAt}>
                  {formatDate(claim.createdAt)}
                </time>
              </div>

              <span className={getClaimStatusClass(claim.status)}>
                {claim.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
