import React from 'react';

/**
 * Common Low-Fidelity UI Components for Investment Choi Wireframes.
 * Uses design tokens from styles/globals.css (--color-primary, --color-text, --color-text-muted, --color-border, etc.).
 */

export const Card = ({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) => (
  <div className={`bg-card p-6 rounded-2xl shadow-card border border-border ${className}`}>
    {title && <h3 className="text-base font-bold text-foreground mb-4">{title}</h3>}
    {children}
  </div>
);

export const Button = ({
  children,
  variant = "primary",
  onClick,
  className = "",
  disabled = false,
  type = "button"
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) => {
  const baseStyles = "px-5 py-3 text-[15px] font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer";
  const variantClasses: Record<string, string> = {
    primary: "bg-[#3182f6] text-white hover:bg-[#1b64da]",
    secondary: "bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]",
    danger: "bg-[#fff0f0] text-[#f04452] hover:bg-[#ffe5e5]",
    ghost: "text-[#4e5968] hover:bg-[#f2f4f6]"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, status = "neutral" }: { children: React.ReactNode; status?: "active" | "stopped" | "pending" | "executed" | "failed" | "neutral" }) => {
  const styles: Record<string, string> = {
    active: "bg-[#e8f3ff] text-[#3182f6]",
    stopped: "bg-[#f2f4f6] text-[#8b95a1]",
    pending: "bg-[#f9fafb] text-[#4e5968] border border-[#e5e8eb]",
    executed: "bg-[#3182f6] text-white",
    failed: "bg-[#fff0f0] text-[#f04452]",
    neutral: "bg-[#f2f4f6] text-[#4e5968]"
  };
  return (
    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md inline-block ${styles[status]}`}>
      {children}
    </span>
  );
};

export interface DataTableProps {
  headers: string[];
  rows: React.ReactNode[][];
  /** Optional: return stable key for each row (e.g. id). Defaults to row index. */
  getRowKey?: (row: React.ReactNode[], index: number) => string;
}

function cellContent(cell: React.ReactNode): React.ReactNode {
  if (typeof cell === "string" && (cell.startsWith("+") || cell.startsWith("-"))) {
    const isPositive = cell.startsWith("+");
    return (
      <span
        className={`px-2 py-0.5 rounded-lg font-bold ${isPositive ? "text-[#f04452] bg-[#f04452]/5" : "text-[#3182f6] bg-[#3182f6]/5"}`}
      >
        {cell}
      </span>
    );
  }
  return cell;
}

export const DataTable = ({ headers, rows, getRowKey }: DataTableProps) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h} className="px-4 py-3 text-[13px] font-medium text-[#8b95a1] border-b border-[#f2f4f6]">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#f2f4f6]">
        {rows.length > 0 ? (
          rows.map((row, i) => (
            <tr key={getRowKey ? getRowKey(row, i) : `row-${i}`} className="hover:bg-[#f9fafb] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-4 text-[15px] font-medium text-[#333d4b]">
                  {cellContent(cell)}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={headers.length} className="px-4 py-12 text-center text-[15px] text-[#8b95a1]">
              데이터가 없습니다
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export type InputProps = React.ComponentPropsWithoutRef<"input"> & { label?: string };

export const Input = ({ label, placeholder, type = "text", ...props }: InputProps) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-[13px] font-semibold text-[#4e5968]">{label}</label>}
    <input
      type={type}
      className="bg-[#f2f4f6] rounded-xl px-4 py-3 text-[15px] text-[#191f28] focus:outline-none focus:ring-2 focus:ring-[#3182f6]/20 transition-all placeholder:text-[#adb5bd]"
      placeholder={placeholder}
      {...props}
    />
  </div>
);

export interface SegmentControlOption<T> {
  label: string;
  value: T;
}

export interface SegmentControlProps<T> {
  options: SegmentControlOption<T>[];
  activeValue: T;
  onChange: (value: T) => void;
}

export const SegmentControl = <T,>({ options, activeValue, onChange }: SegmentControlProps<T>) => (
  <div className="flex p-1.5 rounded-2xl w-full bg-[#f2f4f6]">
    {options.map((opt) => (
      <button
        type="button"
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`flex-1 px-4 py-2.5 text-[14px] font-bold rounded-xl transition-all ${activeValue === opt.value ? "bg-white shadow-sm text-[#3182f6]" : "text-[#8b95a1] hover:text-[#4e5968]"}`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export const Guardrail = ({ message, type = "warning", actionLabel, onAction }: { message: string; type?: "warning" | "error" | "info"; actionLabel?: string; onAction?: () => void }) => {
  const styles: Record<string, string> = {
    warning: "bg-[#fff8eb] text-[#ff9500]",
    error: "bg-[#fff0f0] text-[#f04452]",
    info: "bg-[#e8f3ff] text-[#3182f6]"
  };
  return (
    <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 text-[14px] font-semibold ${styles[type]}`}>
      <div className="flex items-center gap-2">
        <span>{type === "error" ? "🚫" : type === "warning" ? "⚠️" : "ℹ️"}</span>
        {message}
      </div>
      {actionLabel && (
        <button type="button" onClick={onAction} className="underline decoration-2 underline-offset-4 cursor-pointer">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const Stat = ({ label, value, trend }: { label: string; value: string | number; trend?: "positive" | "negative" | "neutral" }) => {
  const trendColors: Record<string, string> = {
    positive: "text-[#f04452]",
    negative: "text-[#3182f6]",
    neutral: "text-[#333d4b]"
  };
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-[#8b95a1]">{label}</span>
      <span className={`text-[22px] font-bold ${trendColors[trend || "neutral"]}`}>{value}</span>
    </div>
  );
};

// Kept for compatibility with some mock pages that import it.
export const FilterBar = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
  <div className={`bg-white p-4 rounded-2xl border border-[#f2f4f6] ${className}`}>
    {children}
  </div>
);
