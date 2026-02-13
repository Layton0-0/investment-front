import React from 'react';

/**
 * Common Low-Fidelity UI Components for Pulsarve Wireframes
 */

/* /styles/globals.css 기반 토스뱅크 스타일 변수 (가정) */

export const Card = ({ title, children, className = "" }: { title?: string, children: React.ReactNode, className?: string }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-[0_8px_24px_rgba(149,157,165,0.1)] ${className}`}>
    {title && <h3 className="text-base font-bold text-[#191f28] mb-4">{title}</h3>}
    {children}
  </div>
);

export const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = "",
  disabled = false
}: { 
  children: React.ReactNode, 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost',
  onClick?: () => void,
  className?: string,
  disabled?: boolean
}) => {
  const baseStyles = "px-5 py-3 text-[15px] font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#3182f6] text-white hover:bg-[#1b64da]",
    secondary: "bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]",
    danger: "bg-[#fff0f0] text-[#f04452] hover:bg-[#ffe5e5]",
    ghost: "text-[#4e5968] hover:bg-[#f2f4f6]"
  };

  return (
    <button 
      disabled={disabled}
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, status = 'neutral' }: { children: React.ReactNode, status?: 'active' | 'stopped' | 'pending' | 'executed' | 'failed' | 'neutral' }) => {
  const styles = {
    active: "bg-[#e8f3ff] text-[#3182f6]",
    stopped: "bg-[#f2f4f6] text-[#8b95a1]",
    pending: "bg-[#f9fafb] text-[#4e5968] border border-[#e5e8eb]",
    executed: "bg-[#3182f6] text-white",
    failed: "bg-[#fff0f0] text-[#f04452]",
    neutral: "bg-[#f2f4f6] text-[#4e5968]"
  };
  return (
    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${styles[status]}`}>
      {children}
    </span>
  );
};

export const DataTable = ({ headers, rows }: { headers: string[], rows: any[][] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-4 py-3 text-[13px] font-medium text-[#8b95a1] border-b border-[#f2f4f6]">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#f2f4f6]">
        {rows.length > 0 ? rows.map((row, i) => (
          <tr key={i} className="hover:bg-[#f9fafb] transition-colors">
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-4 text-[15px] text-[#333d4b] font-medium">
                {typeof cell === 'string' && (cell.startsWith('+') || cell.startsWith('-')) ? (
                  <span className={`px-2 py-0.5 rounded-lg font-bold ${cell.startsWith('+') ? 'text-[#f04452] bg-[#f04452]/5' : 'text-[#3182f6] bg-[#3182f6]/5'}`}>
                    {cell}
                  </span>
                ) : cell}
              </td>
            ))}
          </tr>
        )) : (
          <tr>
            <td colSpan={headers.length} className="px-4 py-12 text-center text-[#8b95a1] text-[15px]">데이터가 없습니다</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export const Input = ({ label, placeholder, type = "text", ...props }: any) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-[13px] font-semibold text-[#4e5968]">{label}</label>}
    <input 
      type={type} 
      className="bg-[#f2f4f6] rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3182f6]/20 transition-all placeholder:text-[#adb5bd]" 
      placeholder={placeholder}
      {...props}
    />
  </div>
);

export const SegmentControl = ({ options, activeValue, onChange }: { options: {label: string, value: any}[], activeValue: any, onChange: (v: any) => void }) => (
  <div className="flex bg-[#f2f4f6] p-1.5 rounded-2xl w-full">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`flex-1 px-4 py-2.5 text-[14px] font-bold rounded-xl transition-all ${activeValue === opt.value ? 'bg-white shadow-sm text-[#3182f6]' : 'text-[#8b95a1] hover:text-[#4e5968]'}`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export const Guardrail = ({ message, type = 'warning', actionLabel, onAction }: { message: string, type?: 'warning' | 'error' | 'info', actionLabel?: string, onAction?: () => void }) => {
  const styles = {
    warning: "bg-[#fff8eb] text-[#ff9500]",
    error: "bg-[#fff0f0] text-[#f04452]",
    info: "bg-[#e8f3ff] text-[#3182f6]"
  };
  return (
    <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 text-[14px] font-semibold ${styles[type]}`}>
      <div className="flex items-center gap-2">
        <span>{type === 'error' ? '🚫' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        {message}
      </div>
      {actionLabel && (
        <button onClick={onAction} className="underline decoration-2 underline-offset-4">{actionLabel}</button>
      )}
    </div>
  );
};

export const Stat = ({ label, value, trend }: { label: string, value: string | number, trend?: 'positive' | 'negative' | 'neutral' }) => {
  const trendColors = {
    positive: 'text-[#f04452]', // Toss style: Profit/Rise is Red
    negative: 'text-[#3182f6]', // Toss style: Loss/Fall is Blue
    neutral: 'text-[#333d4b]'
  };
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-[#8b95a1]">{label}</span>
      <span className={`text-[22px] font-bold ${trendColors[trend || 'neutral']}`}>{value}</span>
    </div>
  );
};
