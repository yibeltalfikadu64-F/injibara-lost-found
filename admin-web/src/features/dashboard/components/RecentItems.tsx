import { Package, MapPin, CalendarDays, ArrowRight } from "lucide-react";

import type { DashboardItem } from "../types/dashboard.types";

interface RecentItemsProps {
  items: DashboardItem[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onSelectItem?: (item: DashboardItem) => void;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusClass(status: DashboardItem["status"]) {
  return `item-status item-status--${status.toLowerCase()}`;
}

export default function RecentItems({
  items,
  isLoading = false,
  onViewAll,
  onSelectItem,
}: RecentItemsProps) {
  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel__header">
        <div>
          <h3>Recent Items</h3>
          <p>Recently reported campus items.</p>
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
        <div className="recent-items-loading">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="recent-item-skeleton" key={index} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="dashboard-empty">
          <Package size={30} />
          <p>No reported items found.</p>
        </div>
      ) : (
        <div className="recent-items-list">
          {items.map((item) => (
            <button
              type="button"
              className="recent-item"
              key={item.id}
              onClick={() => onSelectItem?.(item)}
            >
              <div className="recent-item__image">
                {item.imageUrls?.[0] ? (
                  <img
                    src={item.imageUrls[0]}
                    alt={item.title}
                    loading="lazy"
                  />
                ) : (
                  <Package size={23} />
                )}
              </div>

              <div className="recent-item__main">
                <strong>{item.title}</strong>

                <div className="recent-item__metadata">
                  <span
                    className={`item-type item-type--${item.type.toLowerCase()}`}
                  >
                    {item.type}
                  </span>

                  <span>{item.category?.name || "Uncategorized"}</span>
                </div>

                <span className="recent-item__location">
                  <MapPin size={13} />
                  {item.location?.name || "Location not specified"}
                </span>

                <span className="recent-item__date">
                  <CalendarDays size={13} />
                  {formatDate(item.dateReported)}
                </span>
              </div>

              <div className="recent-item__right">
                <span className={getStatusClass(item.status)}>
                  {item.status}
                </span>

                {!item.isApproved && (
                  <span className="item-pending-approval">
                    Awaiting approval
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
