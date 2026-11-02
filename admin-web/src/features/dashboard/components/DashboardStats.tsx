import {
  Users,
  Package,
  Search,
  CheckCircle2,
  Clock3,
  TrendingUp,
} from "lucide-react";

import type { DashboardStats as DashboardStatsType } from "../types/dashboard.types";

interface DashboardStatsProps {
  stats: DashboardStatsType;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  className: string;
}

function StatCard({
  title,
  value,
  description,
  icon,
  className,
}: StatCardProps) {
  return (
    <article className={`dashboard-stat-card ${className}`}>
      <div className="dashboard-stat-card__top">
        <span className="dashboard-stat-card__title">{title}</span>

        <span className="dashboard-stat-card__icon">{icon}</span>
      </div>

      <div className="dashboard-stat-card__value">{value.toLocaleString()}</div>

      <div className="dashboard-stat-card__description">{description}</div>
    </article>
  );
}

export default function DashboardStats({
  stats,
  isLoading = false,
}: DashboardStatsProps) {
  if (isLoading) {
    return (
      <section className="dashboard-stats-grid">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            className="dashboard-stat-skeleton"
            key={index}
            aria-label="Loading statistic"
          />
        ))}
      </section>
    );
  }

  const cards: StatCardProps[] = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: `${stats.activeUsers} active accounts`,
      icon: <Users size={22} />,
      className: "stat-card--blue",
    },
    {
      title: "Lost Items",
      value: stats.lostItems,
      description: "Items reported as lost",
      icon: <Search size={22} />,
      className: "stat-card--orange",
    },
    {
      title: "Found Items",
      value: stats.foundItems,
      description: "Items reported as found",
      icon: <Package size={22} />,
      className: "stat-card--purple",
    },
    {
      title: "Pending Claims",
      value: stats.pendingClaims,
      description: "Claims awaiting review",
      icon: <Clock3 size={22} />,
      className: "stat-card--yellow",
    },
    {
      title: "Recovered Items",
      value: stats.recoveredItems,
      description: "Successfully completed handovers",
      icon: <CheckCircle2 size={22} />,
      className: "stat-card--green",
    },
  ];

  return (
    <section className="dashboard-stats-section">
      <div className="dashboard-section-heading">
        <div>
          <h2>Overview</h2>
          <p>Key statistics from your campus system.</p>
        </div>

        <span className="dashboard-live-indicator">
          <TrendingUp size={15} />
          Live overview
        </span>
      </div>

      <div className="dashboard-stats-grid">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
