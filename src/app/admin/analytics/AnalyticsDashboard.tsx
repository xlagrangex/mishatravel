"use client";

import { useState, useTransition } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  Eye,
  Clock,
  TrendingDown,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
} from "lucide-react";
import type {
  UmamiStats,
  UmamiPageviewSeries,
  UmamiMetric,
} from "@/lib/umami/api";
import { refreshAnalytics } from "./actions";

// ── Country code → flag emoji ────────────────────────────
function countryFlag(code: string) {
  if (!code || code.length !== 2) return "";
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    ...[...upper].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

// ── Device icon ──────────────────────────────────────────
function DeviceIcon({ device }: { device: string }) {
  const d = device.toLowerCase();
  if (d === "mobile") return <Smartphone className="h-4 w-4 text-gray-400" />;
  if (d === "tablet") return <Tablet className="h-4 w-4 text-gray-400" />;
  return <Monitor className="h-4 w-4 text-gray-400" />;
}

// ── Change indicator ─────────────────────────────────────
function ChangeIndicator({ value, prev }: { value: number; prev: number }) {
  if (prev === 0) return <span className="text-xs text-gray-400">--</span>;
  const pct = ((value - prev) / prev) * 100;
  if (Math.abs(pct) < 0.5) return <Minus className="h-3 w-3 text-gray-400" />;
  if (pct > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600">
        <ArrowUpRight className="h-3 w-3" />
        {pct.toFixed(0)}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-red-500">
      <ArrowDownRight className="h-3 w-3" />
      {Math.abs(pct).toFixed(0)}%
    </span>
  );
}

// ── Props ────────────────────────────────────────────────
interface DashboardProps {
  initialStats: UmamiStats;
  initialPageviews: UmamiPageviewSeries;
  initialTopPages: UmamiMetric[];
  initialTopReferrers: UmamiMetric[];
  initialTopCountries: UmamiMetric[];
  initialTopBrowsers: UmamiMetric[];
  initialTopDevices: UmamiMetric[];
  initialTopOS: UmamiMetric[];
}

type Period = "today" | "7d" | "30d" | "90d";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Oggi",
  "7d": "7 giorni",
  "30d": "30 giorni",
  "90d": "90 giorni",
};

const UNIT_MAP: Record<Period, string> = {
  today: "hour",
  "7d": "day",
  "30d": "day",
  "90d": "day",
};

export default function AnalyticsDashboard({
  initialStats,
  initialPageviews,
  initialTopPages,
  initialTopReferrers,
  initialTopCountries,
  initialTopBrowsers,
  initialTopDevices,
  initialTopOS,
}: DashboardProps) {
  const [period, setPeriod] = useState<Period>("30d");
  const [stats, setStats] = useState(initialStats);
  const [pageviews, setPageviews] = useState(initialPageviews);
  const [topPages, setTopPages] = useState(initialTopPages);
  const [topReferrers, setTopReferrers] = useState(initialTopReferrers);
  const [topCountries, setTopCountries] = useState(initialTopCountries);
  const [topBrowsers, setTopBrowsers] = useState(initialTopBrowsers);
  const [topDevices, setTopDevices] = useState(initialTopDevices);
  const [topOS, setTopOS] = useState(initialTopOS);
  const [isPending, startTransition] = useTransition();

  const loadPeriod = (p: Period) => {
    setPeriod(p);
    startTransition(async () => {
      const data = await refreshAnalytics(p, UNIT_MAP[p]);
      setStats(data.stats);
      setPageviews(data.pageviews);
      setTopPages(data.topPages);
      setTopReferrers(data.topReferrers);
      setTopCountries(data.topCountries);
      setTopBrowsers(data.topBrowsers);
      setTopDevices(data.topDevices);
      setTopOS(data.topOS);
    });
  };

  // Prepare chart data
  const chartData = pageviews.pageviews.map((pv, i) => ({
    date: formatDate(pv.x, period),
    Pageview: pv.y,
    Sessioni: pageviews.sessions[i]?.y ?? 0,
  }));

  // Bounce rate calculation
  const bounceRate =
    stats.visits.value > 0
      ? ((stats.bounces.value / stats.visits.value) * 100).toFixed(1)
      : "0";

  // Avg session duration
  const avgTime =
    stats.visits.value > 0
      ? formatDuration(stats.totaltime.value / stats.visits.value)
      : "0s";

  return (
    <div className={`space-y-6 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => loadPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? "bg-white text-[#1B2D4F] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        <button
          onClick={() => loadPeriod(period)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          Aggiorna
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Users className="h-5 w-5 text-blue-600" />}
          label="Visitatori"
          value={stats.visitors.value.toLocaleString("it-IT")}
          change={<ChangeIndicator value={stats.visitors.value} prev={stats.visitors.prev} />}
          bg="bg-blue-50"
        />
        <KpiCard
          icon={<Eye className="h-5 w-5 text-indigo-600" />}
          label="Pageview"
          value={stats.pageviews.value.toLocaleString("it-IT")}
          change={<ChangeIndicator value={stats.pageviews.value} prev={stats.pageviews.prev} />}
          bg="bg-indigo-50"
        />
        <KpiCard
          icon={<TrendingDown className="h-5 w-5 text-amber-600" />}
          label="Bounce Rate"
          value={`${bounceRate}%`}
          change={
            <ChangeIndicator
              value={stats.bounces.value}
              prev={stats.bounces.prev}
            />
          }
          bg="bg-amber-50"
        />
        <KpiCard
          icon={<Clock className="h-5 w-5 text-emerald-600" />}
          label="Durata Media"
          value={avgTime}
          change={
            <ChangeIndicator
              value={stats.totaltime.value}
              prev={stats.totaltime.prev}
            />
          }
          bg="bg-emerald-50"
        />
      </div>

      {/* Area Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Traffico — {PERIOD_LABELS[period]}
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillPageviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "13px",
                }}
              />
              <Legend iconType="circle" iconSize={8} />
              <Area
                type="monotone"
                dataKey="Pageview"
                stroke="#6366f1"
                fill="url(#fillPageviews)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Sessioni"
                stroke="#3b82f6"
                fill="url(#fillSessions)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Tables - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <MetricTable
          title="Pagine più visitate"
          icon={<Eye className="h-4 w-4 text-gray-400" />}
          data={topPages}
          formatLabel={(x) => x.replace(/^https?:\/\/[^/]+/, "")}
        />

        {/* Top Referrers */}
        <MetricTable
          title="Sorgenti di traffico"
          icon={<Globe className="h-4 w-4 text-gray-400" />}
          data={topReferrers}
          formatLabel={(x) => (x ? x.replace(/^https?:\/\//, "").replace(/\/$/, "") : "Diretto")}
        />

        {/* Top Countries */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
            <Globe className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Paesi</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {topCountries.length === 0 && (
              <p className="px-5 py-4 text-sm text-gray-400">Nessun dato</p>
            )}
            {topCountries.map((item) => (
              <div
                key={item.x}
                className="flex items-center justify-between px-5 py-2.5"
              >
                <span className="text-sm text-gray-700">
                  {countryFlag(item.x)} {item.x.toUpperCase()}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {item.y.toLocaleString("it-IT")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Devices / Browser / OS combined */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
            <Monitor className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Dispositivi &amp; Tecnologia</h3>
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {/* Devices */}
            <div>
              <p className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Dispositivo</p>
              <div className="divide-y divide-gray-50">
                {topDevices.map((item) => (
                  <div key={item.x} className="flex items-center justify-between px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                      <DeviceIcon device={item.x} />
                      {item.x || "Sconosciuto"}
                    </span>
                    <span className="text-xs font-medium text-gray-500">{item.y}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Browsers */}
            <div>
              <p className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Browser</p>
              <div className="divide-y divide-gray-50">
                {topBrowsers.map((item) => (
                  <div key={item.x} className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-gray-700">{item.x || "Sconosciuto"}</span>
                    <span className="text-xs font-medium text-gray-500">{item.y}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* OS */}
            <div>
              <p className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Sistema</p>
              <div className="divide-y divide-gray-50">
                {topOS.map((item) => (
                  <div key={item.x} className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-gray-700">{item.x || "Sconosciuto"}</span>
                    <span className="text-xs font-medium text-gray-500">{item.y}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  change,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: React.ReactNode;
  bg: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`rounded-lg p-2 ${bg}`}>{icon}</div>
        {change}
      </div>
      <p className="text-2xl font-bold text-[#1B2D4F]">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function MetricTable({
  title,
  icon,
  data,
  formatLabel,
}: {
  title: string;
  icon: React.ReactNode;
  data: UmamiMetric[];
  formatLabel: (x: string) => string;
}) {
  const max = data.length > 0 ? Math.max(...data.map((d) => d.y)) : 1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
        {icon}
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {data.length === 0 && (
          <p className="px-5 py-4 text-sm text-gray-400">Nessun dato</p>
        )}
        {data.map((item) => (
          <div key={item.x} className="relative px-5 py-2.5">
            <div
              className="absolute inset-y-0 left-0 bg-indigo-50 rounded-r"
              style={{ width: `${(item.y / max) * 100}%` }}
            />
            <div className="relative flex items-center justify-between">
              <span className="text-sm text-gray-700 truncate max-w-[70%]">
                {formatLabel(item.x) || "(diretto)"}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {item.y.toLocaleString("it-IT")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

function formatDate(dateStr: string, period: Period): string {
  const d = new Date(dateStr);
  if (period === "today") {
    return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}
