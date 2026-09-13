import React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export const Alert = ({ type = "error", message, onClose }) => {
  if (!message) return null;

  const icons = {
    error: <AlertCircle size={18} style={{ flexShrink: 0 }} />,
    success: <CheckCircle2 size={18} style={{ flexShrink: 0 }} />,
    info: <Info size={18} style={{ flexShrink: 0 }} />,
  };

  return (
    <div className={`alert alert-${type}`}>
      {icons[type]}
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: "14px",
            lineHeight: 1,
            padding: "2px",
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
};
