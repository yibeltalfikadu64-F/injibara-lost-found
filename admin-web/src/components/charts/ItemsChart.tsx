import React, { useMemo, useState } from "react";

export interface ItemsChartData {
  label: string;
  lost: number;
  found: number;
}

export interface ItemsChartProps {
  data: ItemsChartData[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  emptyMessage?: string;
}

const chartColors = {
  lost: "#f97316",
  found: "#16a34a",
  grid: "#e2e8f0",
  text: "#64748b",
};

export default function ItemsChart({
  data,
  title = "Lost and Found Items",
  subtitle = "Comparison of reported lost and found items",
  loading = false,
  height = 280,
  showLegend = true,
  showGrid = true,
  emptyMessage = "No item statistics are available yet.",
}: ItemsChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chart = useMemo(() => {
    const safeData = data.map((item) => ({
      label: item.label,
      lost: Math.max(0, Number(item.lost) || 0),
      found: Math.max(0, Number(item.found) || 0),
    }));

    const maxValue = Math.max(
      1,
      ...safeData.map((item) => Math.max(item.lost, item.found)),
    );

    const roundedMaximum = Math.ceil(maxValue / 5) * 5 || 5;

    return {
      data: safeData,
      maximum: roundedMaximum,
      totalLost: safeData.reduce((sum, item) => sum + item.lost, 0),
      totalFound: safeData.reduce((sum, item) => sum + item.found, 0),
    };
  }, [data]);

  const width = 680;
  const chartHeight = height;
  const margin = { top: 20, right: 18, bottom: 45, left: 42 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const groupWidth = chart.data.length
    ? innerWidth / chart.data.length
    : innerWidth;

  const barWidth = Math.min(23, groupWidth * 0.28);
  const chartY = (value: number) =>
    margin.top + innerHeight - (value / chart.maximum) * innerHeight;

  const gridLines = 5;

  if (loading) {
    return (
      <ChartContainer title={title} subtitle={subtitle}>
        <div style={loadingStyle}>
          <span style={spinnerStyle} />
          <span>Loading item statistics...</span>
        </div>
      </ChartContainer>
    );
  }

  if (chart.data.length === 0) {
    return (
      <ChartContainer title={title} subtitle={subtitle}>
        <div style={emptyStyle}>
          <span style={{ fontSize: 30 }}>📊</span>
          <p>{emptyMessage}</p>
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title={title} subtitle={subtitle}>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <SummaryValue
          label="Lost items"
          value={chart.totalLost}
          color={chartColors.lost}
        />
        <SummaryValue
          label="Found items"
          value={chart.totalFound}
          color={chartColors.found}
        />
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${width} ${chartHeight}`}
          role="img"
          aria-label="Bar chart comparing lost and found items"
          style={{
            width: "100%",
            minWidth: chart.data.length > 8 ? 600 : 320,
            height: "auto",
            display: "block",
            overflow: "visible",
          }}
        >
          {showGrid &&
            Array.from({ length: gridLines + 1 }, (_, index) => {
              const value = (chart.maximum / gridLines) * index;
              const y = chartY(value);

              return (
                <g key={`grid-${index}`}>
                  <line
                    x1={margin.left}
                    y1={y}
                    x2={width - margin.right}
                    y2={y}
                    stroke={chartColors.grid}
                    strokeDasharray="4 5"
                  />
                  <text
                    x={margin.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill={chartColors.text}
                  >
                    {Math.round(value)}
                  </text>
                </g>
              );
            })}

          {chart.data.map((item, index) => {
            const centerX = margin.left + groupWidth * index + groupWidth / 2;

            const lostHeight = (item.lost / chart.maximum) * innerHeight;

            const foundHeight = (item.found / chart.maximum) * innerHeight;

            const lostX = centerX - barWidth - 2;
            const foundX = centerX + 2;

            const isActive = activeIndex === index;

            return (
              <g
                key={`${item.label}-${index}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                tabIndex={0}
                role="group"
                aria-label={`${item.label}: ${item.lost} lost, ${item.found} found`}
              >
                <rect
                  x={centerX - groupWidth / 2 + 3}
                  y={margin.top}
                  width={Math.max(0, groupWidth - 6)}
                  height={innerHeight}
                  fill="transparent"
                />

                <rect
                  x={lostX}
                  y={chartY(item.lost)}
                  width={barWidth}
                  height={Math.max(0, lostHeight)}
                  rx={5}
                  fill={chartColors.lost}
                  opacity={isActive ? 1 : 0.82}
                >
                  <title>{`${item.label}: ${item.lost} lost items`}</title>
                </rect>

                <rect
                  x={foundX}
                  y={chartY(item.found)}
                  width={barWidth}
                  height={Math.max(0, foundHeight)}
                  rx={5}
                  fill={chartColors.found}
                  opacity={isActive ? 1 : 0.82}
                >
                  <title>{`${item.label}: ${item.found} found items`}</title>
                </rect>

                <text
                  x={centerX}
                  y={chartHeight - 15}
                  textAnchor="middle"
                  fontSize="11"
                  fill={chartColors.text}
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

      {activeIndex !== null && chart.data[activeIndex] && (
        <div
          style={{
            marginTop: 8,
            padding: 10,
            borderRadius: 8,
            background: "#f8fafc",
            color: "#334155",
            fontSize: 12,
          }}
          aria-live="polite"
        >
          <strong>{chart.data[activeIndex].label}</strong>
          <span style={{ marginLeft: 12 }}>
            Lost: {chart.data[activeIndex].lost}
          </span>
          <span style={{ marginLeft: 12 }}>
            Found: {chart.data[activeIndex].found}
          </span>
        </div>
      )}

      {showLegend && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 22,
            marginTop: 12,
            flexWrap: "wrap",
          }}
        >
          <LegendItem color={chartColors.lost} label="Lost items" />
          <LegendItem color={chartColors.found} label="Found items" />
        </div>
      )}
    </ChartContainer>
  );
}

function ChartContainer({
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
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 13,
        padding: 20,
        minWidth: 0,
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
            color: "#94a3b8",
            fontSize: 12,
            margin: "5px 0 18px",
          }}
        >
          {subtitle}
        </p>
      )}

      {children}
    </section>
  );
}

function SummaryValue({
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
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        background: "#f8fafc",
        borderRadius: 8,
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
      <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
      <strong style={{ fontSize: 13, color: "#0f172a" }}>
        {value.toLocaleString()}
      </strong>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
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
          display: "inline-block",
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

const loadingStyle: React.CSSProperties = {
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
  animation: "items-chart-spin 0.8s linear infinite",
};

const emptyStyle: React.CSSProperties = {
  minHeight: 220,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  color: "#94a3b8",
  fontSize: 13,
  textAlign: "center",
};
