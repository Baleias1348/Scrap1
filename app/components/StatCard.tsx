import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trendValue?: string;
  trendDirection?: "up" | "down";
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trendValue, trendDirection }) => (
  <div className="bg-black/30 rounded-lg p-4 min-w-[180px] flex flex-col items-center shadow-md border border-white/10">
    <div className="mb-2">{icon}</div>
    <div className="text-xl font-bold text-white">{value}</div>
    <div className="text-xs text-white/60 mb-1">{title}</div>
    {trendValue && (
      <div className={`text-xs font-semibold ${trendDirection === "up" ? "text-green-400" : "text-red-400"}`}>
        {trendDirection === "up" ? "▲" : "▼"} {trendValue}
      </div>
    )}
  </div>
);

export default StatCard;
