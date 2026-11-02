import {
  Activity,
  User,
  Package,
  FileCheck,
  ShieldCheck,
  Settings,
} from "lucide-react";

import type { DashboardActivity } from "../types/dashboard.types";

interface RecentActivityProps {
  activities: DashboardActivity[];
  isLoading?: boolean;
}

function getActivityIcon(action: string) {
  const normalized = action.toUpperCase();

  if (normalized.includes("CLAIM")) {
    return <FileCheck size={17} />;
  }

  if (normalized.includes("ITEM") || normalized.includes("CREATE")) {
    return <Package size={17} />;
  }

  if (normalized.includes("LOGIN") || normalized.includes("USER")) {
    return <User size={17} />;
  }

  if (normalized.includes("APPROVE") || normalized.includes("HANDOVER")) {
    return <ShieldCheck size={17} />;
  }

  return <Settings size={17} />;
}

function formatRelativeDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  const difference = Date.now() - date.getTime();
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString();
}

export default function RecentActivity({
  activities,
  isLoading = false,
}: RecentActivityProps) {
  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel__header">
        <div>
          <h3>Recent Activity</h3>
          <p>Latest actions across the system.</p>
        </div>

        <Activity size={20} />
      </div>

      {isLoading ? (
        <div className="activity-loading">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="activity-skeleton" key={index} />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="dashboard-empty">
          <Activity size={30} />
          <p>No recent activity found.</p>
        </div>
      ) : (
        <div className="activity-list">
          {activities.map((activity) => (
            <article className="activity-item" key={activity.id}>
              <div className="activity-item__icon">
                {getActivityIcon(activity.action)}
              </div>

              <div className="activity-item__content">
                <strong>{activity.description || activity.action}</strong>

                <span>
                  {activity.actorName || activity.actorEmail || "System"}
                </span>
              </div>

              <time
                className="activity-item__time"
                dateTime={activity.createdAt}
              >
                {formatRelativeDate(activity.createdAt)}
              </time>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
