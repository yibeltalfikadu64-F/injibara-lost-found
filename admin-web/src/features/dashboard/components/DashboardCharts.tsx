import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

import type { DashboardStats, DashboardTrend } from "../types/dashboard.types";

interface DashboardChartsProps {
  stats: DashboardStats;
  itemTrends: DashboardTrend[];
  isLoading?: boolean;
}

const PIE_COLORS = ["#2563eb", "#f59e0b", "#16a34a", "#9333ea"];

export default function DashboardCharts({
  stats,
  itemTrends,
  isLoading = false,
}: DashboardChartsProps) {
  const claimStatusData = [
    {
      name: "Pending",
      value: stats.pendingClaims,
    },
    {
      name: "Approved",
      value: stats.approvedClaims,
    },
    {
      name: "Rejected",
      value: stats.rejectedClaims,
    },
    {
      name: "Completed",
      value: stats.recoveredItems,
    },
  ].filter((item) => item.value > 0);

  if (isLoading) {
    return (
      <section className="dashboard-charts-grid">
        <div className="dashboard-chart-skeleton" />
        <div className="dashboard-chart-skeleton" />
      </section>
    );
  }

  return (
    <section className="dashboard-charts-section">
      <div className="dashboard-section-heading">
        <div>
          <h2>Analytics</h2>
          <p>Understand campus lost and found activity.</p>
        </div>
      </div>

      <div className="dashboard-charts-grid">
        <article className="dashboard-panel dashboard-chart-panel">
          <div className="dashboard-panel__header">
            <div>
              <h3>Lost and Found Trends</h3>
              <p>Reported items over time.</p>
            </div>

            <BarChart3 size={21} />
          </div>

          {itemTrends.length === 0 ? (
            <div className="dashboard-empty">
              <BarChart3 size={30} />
              <p>No trend data is available.</p>
            </div>
          ) : (
            <div className="dashboard-chart">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={itemTrends}
                  margin={{
                    top: 15,
                    right: 15,
                    left: -15,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis dataKey="label" tickLine={false} axisLine={false} />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="lost"
                    name="Lost items"
                    fill="#f59e0b"
                    radius={[5, 5, 0, 0]}
                  />

                  <Bar
                    dataKey="found"
                    name="Found items"
                    fill="#2563eb"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>

        <article className="dashboard-panel dashboard-chart-panel">
          <div className="dashboard-panel__header">
            <div>
              <h3>Claim Status</h3>
              <p>Ownership verification progress.</p>
            </div>

            <PieChartIcon size={21} />
          </div>

          {claimStatusData.length === 0 ? (
            <div className="dashboard-empty">
              <PieChartIcon size={30} />
              <p>No claim statistics are available.</p>
            </div>
          ) : (
            <div className="dashboard-chart dashboard-chart--pie">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={claimStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {claimStatusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
