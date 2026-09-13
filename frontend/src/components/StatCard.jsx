import React from "react";

export const StatCard = ({ title, value, subtitle, icon: Icon, color = "indigo" }) => {
  const colorMap = {
    indigo: {
      bg: "rgba(99, 102, 241, 0.12)",
      border: "rgba(99, 102, 241, 0.3)",
      text: "#818cf8",
    },
    emerald: {
      bg: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.3)",
      text: "#34d399",
    },
    cyan: {
      bg: "rgba(6, 182, 212, 0.12)",
      border: "rgba(6, 182, 212, 0.3)",
      text: "#22d3ee",
    },
    rose: {
      bg: "rgba(244, 63, 94, 0.12)",
      border: "rgba(244, 63, 94, 0.3)",
      text: "#fb7185",
    },
    amber: {
      bg: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.3)",
      text: "#fbbf24",
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: scheme.bg,
              border: `1px solid ${scheme.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: scheme.text,
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ fontSize: "28px", fontWeight: "800", color: "#f8fafc", letterSpacing: "-0.5px" }}>
        {value}
      </div>

      {subtitle && (
        <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
