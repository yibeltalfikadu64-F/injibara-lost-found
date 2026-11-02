import React, { useMemo, useState } from "react";

export interface RecoveryChartData {
  label: string;
  claims: number;
  approved: number;
  recovered: number;
}

export interface RecoveryChartProps {
  data: RecoveryChartData[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  height?: number;
  showLegend?: boolean;
  emptyMessage?: string;
}

const recoveryColors = {
  claims: "#64748b",
  approved: "#2563eb",
  recovered: "#16a34a",
};

export default function RecoveryChart({
  data,
  title = "Item Recovery Performance",
  subtitle = "Track claims, approvals, and successfully recovered items",
  loading = false,
  height = 280,
  showLegend = true,
  emptyMessage = "No recovery statistics are available yet.",
}: RecoveryChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const statistics = useMemo(() => {
    const safeData = data.map((item) => ({
      label: item.label,
      claims: Math.max(0, Number(item.claims) || 0),
      approved: Math.max(0, Number(item.approved) || 0),
      recovered: Math.max(0, Number(item.recovered) || 0),
    }));

    const totalClaims = safeData.reduce((sum, item) => sum + item.claims, 0);

    const totalApproved = safeData.reduce(
      (sum, item) => sum + item.approved,
      0,
    );

    const totalRecovered = safeData.reduce(
      (sum, item) => sum + item.recovered,
      0,
    );

    const recoveryRate =
      totalClaims > 0 ? Math.min(100, (totalRecovered / totalClaims) * 100) : 0;

    const maximum = Math.max(
      1,
      ...safeData.map((item) =>
        Math.max(item.claims, item.approved, item.recovered),
      ),
    );

    return {
      data: safeData,
      totalClaims,
      totalApproved,
      totalRecovered,
      recoveryRate,
      maximum: Math.ceil(maximum / 5) * 5 || 5,
    };
  }, [data]);

  const width = 680;
  const chartHeight = height;
  const margin = { top: 20, right: 18, bottom: 45, left: 42 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const groupWidth = statistics.data.length
    ? innerWidth / statistics.data.length
    : innerWidth;

  const barWidth = Math.min(15, groupWidth * 0.2);

  const chartY = (value: number) =>
    margin.top + innerHeight - (value / statistics.maximum) * innerHeight;

  const rateLabel = `${statistics.recoveryRate.toFixed(1)}%`;

  if (loading) {
    return (
      <RecoveryContainer title={title} subtitle={subtitle}>
        <div style={centerStateStyle}>
          <span style={spinnerStyle} />
          <span>Loading recovery statistics...</span>
        </div>
      </RecoveryContainer>
    );
  }

  if (statistics.data.length === 0) {
    return (
      <RecoveryContainer title={title} subtitle={subtitle}>
        <div style={centerStateStyle}>
          <span style={{ fontSize: 32 }}>📈</span>
          <span>{emptyMessage}</span>
        </div>
      </RecoveryContainer>
    );
  }

  return (
    <RecoveryContainer title={title} subtitle={subtitle}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(115px, 1fr))",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <MetricCard
          label="Claims"
          value={statistics.totalClaims}
          color={recoveryColors.claims}
        />

        <MetricCard
          label="Approved"
          value={statistics.totalApproved}
          color={recoveryColors.approved}
        />

        <MetricCard
          label="Recovered"
          value={statistics.totalRecovered}
          color={recoveryColors.recovered}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: 14,
          marginBottom: 15,
          background: "#f8fafc",
          borderRadius: 10,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: `conic-gradient(
              ${recoveryColors.recovered} ${statistics.recoveryRate}%,
              #e2e8f0 ${statistics.recoveryRate}% 100%
            )`,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
          role="img"
          aria-label={`Recovery rate ${rateLabel}`}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#ffffff",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: 12,
              color: "#0f172a",
            }}
          >
            {rateLabel}
          </div>
        </div>

        <div>
          <strong style={{ fontSize: 14, color: "#0f172a" }}>
            Overall recovery rate
          </strong>
          <p
            style={{
              margin: "5px 0 0",
              color: "#64748b",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            {statistics.totalRecovered} recovered out of{" "}
            {statistics.totalClaims} submitted claims.
          </p>
        </div>
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${width} ${chartHeight}`}
          role="img"
          aria-label="Bar chart showing claims, approvals and recovered items"
          style={{
            display: "block",
            width: "100%",
            minWidth: statistics.data.length > 8 ? 600 : 320,
            height: "auto",
          }}
        >
          {Array.from({ length: 6 }, (_, index) => {
            const value = (statistics.maximum / 5) * index;
            const y = chartY(value);

            return (
              <g key={`recovery-grid-${index}`}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 5"
                />

                <text
                  x={margin.left - 9}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#64748b"
                >
                  {Math.round(value)}
                </text>
              </g>
            );
          })}

          {statistics.data.map((item, index) => {
            const centerX = margin.left + groupWidth * index + groupWidth / 2;

            const values = [
              {
                key: "claims",
                value: item.claims,
                color: recoveryColors.claims,
              },
              {
                key: "approved",
                value: item.approved,
                color: recoveryColors.approved,
              },
              {
                key: "recovered",
                value: item.recovered,
                color: recoveryColors.recovered,
              },
            ];

            const totalBarWidth = barWidth * 3 + 8;
            const startX = centerX - totalBarWidth / 2;
            const isActive = activeIndex === index;

            return (
              <g
                key={`${item.label}-${index}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                tabIndex={0}
                role="group"
                aria-label={`${item.label}: ${item.claims} claims, ${item.approved} approved, ${item.recovered} recovered`}
              >
                {values.map((entry, valueIndex) => {
                  const barHeight =
                    (entry.value / statistics.maximum) * innerHeight;

                  const x = startX + valueIndex * (barWidth + 4);

                  return (
                    <rect
                      key={entry.key}
                      x={x}
                      y={chartY(entry.value)}
                      width={barWidth}
                      height={Math.max(0, barHeight)}
                      rx={4}
                      fill={entry.color}
                      opacity={isActive ? 1 : 0.82}
                    >
                      <title>
                        {`${item.label}: ${entry.value} ${entry.key}`}
                      </title>
                    </rect>
                  );
                })}

                <text
                  x={centerX}
                  y={chartHeight - 15}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                  fontWeight={isActive ? 700 : 400}
                >
                  {item.label.length > 9
                    ? `${item.label.slice(0, 8)}…`
                    : item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {activeIndex !== null && statistics.data[activeIndex] && (
        <div
          style={{
            marginTop: 8,
            padding: 10,
            background: "#f8fafc",
            borderRadius: 8,
            color: "#334155",
            fontSize: 12,
          }}
          aria-live="polite"
        >
          <strong>{statistics.data[activeIndex].label}</strong>
          <span style={{ marginLeft: 10 }}>
            Claims: {statistics.data[activeIndex].claims}
          </span>
          <span style={{ marginLeft: 10 }}>
            Approved: {statistics.data[activeIndex].approved}
          </span>
          <span style={{ marginLeft: 10 }}>
            Recovered: {statistics.data[activeIndex].recovered}
          </span>
        </div>
      )}

      {showLegend && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 18,
            marginTop: 12,
          }}
        >
          <Legend color={recoveryColors.claims} label="Claims" />
          <Legend color={recoveryColors.approved} label="Approved" />
          <Legend color={recoveryColors.recovered} label="Recovered" />
        </div>
      )}
    </RecoveryContainer>
  );
}

function RecoveryContainer({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        padding: 20,
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 13,
        boxShadow: "0 2px 8px rgba(15,23,42,0.025)",
      }}
    >
      <h3
        style={{
          margin: 0,
          color: "#0f172a",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {title}
      </h3>

      {subtitle && (
        <p
          style={{
            margin: "5px 0 18px",
            color: "#94a3b8",
            fontSize: 12,
          }}
        >
          {subtitle}
        </p>
      )}

      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "12px 13px",
        border: "1px solid #e2e8f0",
        borderRadius: 9,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          background: color,
          borderRadius: 3,
          marginBottom: 9,
        }}
      />

      <strong
        style={{
          display: "block",
          fontSize: 20,
          color: "#0f172a",
          lineHeight: 1.2,
        }}
      >
        {value.toLocaleString()}
      </strong>

      <span
        style={{
          display: "block",
          color: "#64748b",
          fontSize: 11,
          marginTop: 4,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        color: "#64748b",
        fontSize: 12,
      }}
    >
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: 3,
          background: color,
        }}
      />
      {label}
    </span>
  );
}

const centerStateStyle: React.CSSProperties = {
  minHeight: 220,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  color: "#64748b",
  fontSize: 13,
};

const spinnerStyle: React.CSSProperties = {
  width: 25,
  height: 25,
  border: "3px solid #dbeafe",
  borderTopColor: "#2563eb",
  borderRadius: "50%",
  animation: "recovery-chart-spin 0.8s linear infinite",
};
