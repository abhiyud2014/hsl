import React, { useState } from 'react';
import { 
  Zap, 
  AlertOctagon, 
  Gauge, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  DollarSign, 
  Anchor, 
  Flame, 
  Cpu, 
  Layers,
  ChevronRight,
  Sparkles,
  ClipboardList,
  ArrowUpRight,
  CheckCircle2,
  Filter,
  BarChart3,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  Scale,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';
import { FleetSummary, AssetCategory, TimeRange } from '../types/dashboard';

interface MasterExecutiveSummaryProps {
  summary: FleetSummary;
  activeCategory: AssetCategory;
  onSelectCategory: (cat: AssetCategory) => void;
  timeRange: TimeRange;
  onSelectTimeRange: (range: TimeRange) => void;
  onDismissIncident?: (id: string) => void;
  onOpenRetrofitModal?: () => void;
  onOpenAiCopilot?: () => void;
  onOpenShiftReport?: () => void;
  onDispatchWorkOrderFromIncident?: (incident: any) => void;
  onOpenTandemLift?: () => void;
  onOpenNavalWpsAudit?: () => void;
}

// Synthetic time-range trend datasets
const TIME_RANGE_DATA: Record<TimeRange, {
  label: string;
  badgeDesc: string;
  energyTotal: string;
  energyCost: string;
  avgOee: number;
  oeeAvail: number;
  oeePerf: number;
  oeeQual: number;
  totalLifts: number;
  wpsRate: number;
  incidentsResolved: number;
  chartData: Array<{ time: string; energyKw: number; oee: number; gasScmh: number; activeLifts: number }>;
}> = {
  live: {
    label: 'Real-Time Streaming (1s Edge Stream)',
    badgeDesc: 'Streaming live 1-second telemetry from 10 edge gateway nodes across yard docks.',
    energyTotal: '485.2 kW',
    energyCost: '$58.20/hr',
    avgOee: 82.4,
    oeeAvail: 84.1,
    oeePerf: 89.5,
    oeeQual: 98.1,
    totalLifts: 14,
    wpsRate: 94.8,
    incidentsResolved: 0,
    chartData: [
      { time: '13:20', energyKw: 460, oee: 80.5, gasScmh: 12.4, activeLifts: 2 },
      { time: '13:22', energyKw: 475, oee: 81.2, gasScmh: 14.1, activeLifts: 2 },
      { time: '13:24', energyKw: 510, oee: 83.0, gasScmh: 16.8, activeLifts: 3 },
      { time: '13:26', energyKw: 490, oee: 82.1, gasScmh: 15.2, activeLifts: 3 },
      { time: '13:28', energyKw: 530, oee: 84.5, gasScmh: 17.5, activeLifts: 4 },
      { time: '13:30', energyKw: 485, oee: 82.4, gasScmh: 14.8, activeLifts: 3 },
    ]
  },
  shift: {
    label: 'Current Shift (Shift 1: 07:00 - 15:30 UTC)',
    badgeDesc: 'Shift 1 aggregate: 3,840 kWh total draw, 48 completed heavy lifts, 96.8% welding procedure compliance.',
    energyTotal: '3,840 kWh',
    energyCost: '$460.80',
    avgOee: 84.6,
    oeeAvail: 88.2,
    oeePerf: 91.0,
    oeeQual: 98.4,
    totalLifts: 48,
    wpsRate: 96.8,
    incidentsResolved: 2,
    chartData: [
      { time: '07:00', energyKw: 280, oee: 72.0, gasScmh: 6.2, activeLifts: 1 },
      { time: '08:30', energyKw: 490, oee: 83.5, gasScmh: 15.4, activeLifts: 4 },
      { time: '10:00', energyKw: 540, oee: 87.2, gasScmh: 18.1, activeLifts: 5 },
      { time: '11:30', energyKw: 310, oee: 74.0, gasScmh: 8.5, activeLifts: 2 },
      { time: '13:00', energyKw: 520, oee: 86.8, gasScmh: 17.2, activeLifts: 5 },
      { time: '14:30', energyKw: 485, oee: 84.6, gasScmh: 14.8, activeLifts: 4 },
    ]
  },
  day: {
    label: 'Today 24-Hour Yard Cumulative',
    badgeDesc: '24-Hour Yard Cumulative: 11,480 kWh draw, 142 completed lifts, 0 reportable safety incidents, $1,377 energy spend.',
    energyTotal: '11,480 kWh',
    energyCost: '$1,377.60',
    avgOee: 81.2,
    oeeAvail: 82.5,
    oeePerf: 87.1,
    oeeQual: 97.8,
    totalLifts: 142,
    wpsRate: 95.2,
    incidentsResolved: 5,
    chartData: [
      { time: '00:00 - 04:00', energyKw: 180, oee: 62.0, gasScmh: 3.2, activeLifts: 1 },
      { time: '04:00 - 08:00', energyKw: 420, oee: 78.5, gasScmh: 12.0, activeLifts: 3 },
      { time: '08:00 - 12:00', energyKw: 560, oee: 88.0, gasScmh: 19.5, activeLifts: 6 },
      { time: '12:00 - 16:00', energyKw: 510, oee: 85.2, gasScmh: 16.8, activeLifts: 5 },
      { time: '16:00 - 20:00', energyKw: 440, oee: 81.4, gasScmh: 14.2, activeLifts: 4 },
      { time: '20:00 - 24:00', energyKw: 240, oee: 69.0, gasScmh: 5.1, activeLifts: 2 },
    ]
  },
  week: {
    label: '7-Day Rolling Fleet Operations',
    badgeDesc: '7-Day Fleet Operations: 81,920 kWh total draw, 984 lifts, 99.4% average fleet uptime across all 10 retrofitted assets.',
    energyTotal: '81,920 kWh',
    energyCost: '$9,830.40',
    avgOee: 83.9,
    oeeAvail: 86.4,
    oeePerf: 89.2,
    oeeQual: 98.2,
    totalLifts: 984,
    wpsRate: 97.1,
    incidentsResolved: 24,
    chartData: [
      { time: 'Mon (Aug 21)', energyKw: 480, oee: 82.5, gasScmh: 15.0, activeLifts: 135 },
      { time: 'Tue (Aug 22)', energyKw: 520, oee: 85.1, gasScmh: 17.2, activeLifts: 148 },
      { time: 'Wed (Aug 23)', energyKw: 550, oee: 87.4, gasScmh: 18.6, activeLifts: 156 },
      { time: 'Thu (Aug 24)', energyKw: 510, oee: 84.0, gasScmh: 16.1, activeLifts: 140 },
      { time: 'Fri (Aug 25)', energyKw: 540, oee: 86.9, gasScmh: 17.8, activeLifts: 152 },
      { time: 'Sat (Aug 26)', energyKw: 360, oee: 76.5, gasScmh: 10.4, activeLifts: 88 },
      { time: 'Sun (Aug 27)', energyKw: 485, oee: 83.9, gasScmh: 14.8, activeLifts: 165 },
    ]
  }
};

export const MasterExecutiveSummary: React.FC<MasterExecutiveSummaryProps> = ({
  summary,
  activeCategory,
  onSelectCategory,
  timeRange,
  onSelectTimeRange,
  onDismissIncident,
  onOpenRetrofitModal,
  onOpenAiCopilot,
  onOpenShiftReport,
  onDispatchWorkOrderFromIncident,
  onOpenTandemLift,
  onOpenNavalWpsAudit,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'energy' | 'oee' | 'gas'>('energy');
  const [showTimeAnalytics, setShowTimeAnalytics] = useState<boolean>(true);

  const rangeMeta = TIME_RANGE_DATA[timeRange] || TIME_RANGE_DATA.live;
  const energyPercentage = Math.min(100, Math.round((summary.fleetEnergyKw / summary.energySurgeLimitKw) * 100));

  return (
    <div className="space-y-5">
      {/* HSL Strategic Defence Leadership Impact & INR Financial Matrix */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <Anchor className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                HSL Strategic Impact Matrix • Defence Yard 11181 (Vizag)
              </h4>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                Air-Gapped Edge (CERT-In)
              </span>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                DMR 249A Warship Plate
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Production economics & naval classification assurance for HSL Board of Directors & Warship Overseeing Team
            </p>
          </div>
        </div>

        {/* Financial & Naval Spec Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full xl:w-auto">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 text-left">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Annualized Savings</div>
            <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
              ₹{summary.inrAnnualizedSavingsLakhs ?? 48.6} Lakhs
            </div>
            <div className="text-[10px] text-slate-400">Gas leaks + Peak kW</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 text-left">
            <div className="text-[10px] font-mono text-slate-400 uppercase">DQA(N) Heat Trace</div>
            <div className="text-base sm:text-lg font-black text-indigo-300 mt-0.5">
              {summary.dmrNavalSteelTraceabilityScore ?? 99.8}%
            </div>
            <div className="text-[10px] text-slate-400">100% Joints Audited</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 text-left">
            <div className="text-[10px] font-mono text-slate-400 uppercase">CBB Mega-Block</div>
            <div className="text-base sm:text-lg font-black text-cyan-300 mt-0.5">
              Δh 10 mm
            </div>
            <div className="text-[10px] text-slate-400">Dual-Gantry Sync</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 text-left">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Confined Space</div>
            <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
              100% Safe
            </div>
            <div className="text-[10px] text-slate-400">Blower Interlocked</div>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full xl:w-auto justify-start xl:justify-end">
          {onOpenTandemLift && (
            <button
              onClick={onOpenTandemLift}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Launch Dual-Crane Mega-Block Tandem Synchronizer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Tandem Lift Sync</span>
            </button>
          )}

          {onOpenNavalWpsAudit && (
            <button
              onClick={onOpenNavalWpsAudit}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Launch Directorate of Quality Assurance (Navy) WPS & NDT Audit"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DQA(N) Quality Dossier</span>
            </button>
          )}
        </div>
      </div>
      {/* Master Executive Telemetry Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 sm:pb-5 mb-4 sm:mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-indigo-700 uppercase bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                MASTER EXECUTIVE SUMMARY
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">Global Fleet View & Yard Orchestrator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              Shipyard Operations & IIoT Telemetry Console
            </h2>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium overflow-x-auto max-w-full">
            {(['live', 'shift', 'day', 'week'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => onSelectTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer whitespace-nowrap ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {range === 'live' ? '● Real-Time' : range === 'shift' ? 'Current Shift' : range === 'day' ? 'Today (24h)' : '7-Day Trend'}
              </button>
            ))}
          </div>
        </div>

        {/* Active Time Window Context Banner */}
        <div className="mb-5 px-4 py-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            <span><strong>{rangeMeta.label}:</strong> {rangeMeta.badgeDesc}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowTimeAnalytics(!showTimeAnalytics)}
              className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1 cursor-pointer"
            >
              <BarChart3 className="w-3 h-3" />
              {showTimeAnalytics ? 'Hide Range Trends' : 'Show Range Trends'}
            </button>
          </div>
        </div>

        {/* 4 Key Executive Tiles (Interactive Drill-Downs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Tile 1: Fleet Energy */}
          <div 
            onClick={() => {
              setActiveChartTab('energy');
              setShowTimeAnalytics(true);
            }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-indigo-600 uppercase tracking-widest transition-colors">
                <Zap className="w-4 h-4 text-amber-500" />
                FLEET ENERGY
              </span>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                {timeRange === 'live' ? (summary.energyStatus === 'normal' ? 'Normal' : 'Peak Alert') : 'Aggregated'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {timeRange === 'live' ? `${summary.fleetEnergyKw.toFixed(1)} kW` : rangeMeta.energyTotal}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({rangeMeta.energyCost})
              </span>
            </div>

            {/* Peak Demand Gauge */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>Peak Load ({energyPercentage}%)</span>
                <span>Max: {summary.energySurgeLimitKw} kW</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    energyPercentage > 85 ? 'bg-rose-500' : energyPercentage > 70 ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${energyPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tile 2: Active Safety Alerts */}
          <div 
            onClick={() => {
              if (onOpenAiCopilot) onOpenAiCopilot();
            }}
            className={`rounded-2xl p-5 border transition-all shadow-xs cursor-pointer group ${
              summary.activeSafetyIncidents.length > 0 
                ? 'bg-rose-50/70 border-rose-300 hover:shadow-md' 
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-rose-600 uppercase tracking-widest transition-colors">
                <AlertOctagon className="w-4 h-4 text-rose-500" />
                SAFETY ALERTS
              </span>
              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md ${
                summary.activeSafetyIncidents.length > 0 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {summary.activeSafetyIncidents.length} Active
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {summary.activeSafetyIncidents.length}{' '}
              <span className="text-xs font-normal text-slate-500">
                {summary.activeSafetyIncidents.length > 0 
                  ? `(${summary.activeSafetyIncidents[0].assetName.split(' ')[0]})` 
                  : `${rangeMeta.incidentsResolved} Resolved`}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 truncate" title={summary.activeSafetyIncidents.length > 0 ? summary.activeSafetyIncidents[0].description : `Zero active proximity breaches (${rangeMeta.incidentsResolved} historical alarms cleared).`}>
              {summary.activeSafetyIncidents.length > 0 
                ? summary.activeSafetyIncidents[0].description
                : `Zero active proximity breaches (${rangeMeta.incidentsResolved} historical alarms cleared).`}
            </p>
          </div>

          {/* Tile 3: Total Yard OEE */}
          <div 
            onClick={() => {
              setActiveChartTab('oee');
              setShowTimeAnalytics(true);
            }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-indigo-600 uppercase tracking-widest transition-colors">
                <Gauge className="w-4 h-4 text-indigo-600" />
                TOTAL YARD OEE
              </span>
              <span className="text-[11px] font-bold text-slate-500 font-mono">
                Target: {summary.yardOeeTarget}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-600 tracking-tight">
                {timeRange === 'live' ? summary.totalYardOee.toFixed(1) : rangeMeta.avgOee.toFixed(1)}%
              </span>
              <span className={`text-xs font-semibold ${
                (timeRange === 'live' ? summary.totalYardOee : rangeMeta.avgOee) >= summary.yardOeeTarget ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {(timeRange === 'live' ? summary.totalYardOee : rangeMeta.avgOee) >= summary.yardOeeTarget ? '+2.4% vs Target' : '-5.8% Gap'}
              </span>
            </div>

            <div className="mt-3.5 grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
              <div className="bg-slate-50 py-1.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-semibold uppercase">Avail</span>
                <span className="text-slate-800 font-bold">{rangeMeta.oeeAvail}%</span>
              </div>
              <div className="bg-slate-50 py-1.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-semibold uppercase">Perf</span>
                <span className="text-slate-800 font-bold">{rangeMeta.oeePerf}%</span>
              </div>
              <div className="bg-slate-50 py-1.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-semibold uppercase">Qual</span>
                <span className="text-emerald-700 font-bold">{rangeMeta.oeeQual}%</span>
              </div>
            </div>
          </div>

          {/* Tile 4: Capex Savings from Retrofit */}
          <div 
            onClick={() => {
              if (onOpenRetrofitModal) onOpenRetrofitModal();
            }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-emerald-600 uppercase tracking-widest transition-colors">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                RETROFIT CAPEX ROI
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                Preserved
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-600 tracking-tight">
              ${(summary.retrofittingSavingsEstimate / 1000000).toFixed(1)}M
            </div>
            <p className="mt-2 text-xs text-slate-500 leading-normal flex items-center justify-between">
              <span>3 Cranes, 4 Weld Bays, 3 CNCs saved vs $18M replacement.</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </p>
          </div>
        </div>

        {/* Range Historical Trends & Multi-Metric Analytics Visualizer */}
        {showTimeAnalytics && (
          <div className="mt-5 p-5 bg-slate-50/80 rounded-2xl border border-slate-200 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {rangeMeta.label} - Telemetry Waveform & Performance History
                </h4>
              </div>

              {/* Chart Sub-Tab Switcher */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setActiveChartTab('energy')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeChartTab === 'energy' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Power Demand (kW)
                </button>
                <button
                  onClick={() => setActiveChartTab('oee')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeChartTab === 'oee' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Fleet OEE (%)
                </button>
                <button
                  onClick={() => setActiveChartTab('gas')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeChartTab === 'gas' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  Shielding Gas & Lifts
                </button>
              </div>
            </div>

            {/* Render Selected Dynamic Chart */}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeChartTab === 'energy' ? (
                  <AreaChart data={rangeMeta.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} unit="kW" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '11px', color: '#0f172a' }} />
                    <Area type="monotone" dataKey="energyKw" name="Fleet Power Load (kW)" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} strokeWidth={2.5} />
                  </AreaChart>
                ) : activeChartTab === 'oee' ? (
                  <LineChart data={rangeMeta.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={[50, 100]} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '11px', color: '#0f172a' }} />
                    <Line type="monotone" dataKey="oee" name="Fleet OEE Score (%)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                ) : (
                  <BarChart data={rangeMeta.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} unit="Sm³/h" />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '11px', color: '#0f172a' }} />
                    <Bar yAxisId="left" dataKey="gasScmh" name="Gas Flow (Sm³/h)" fill="#f97316" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="activeLifts" name="Heavy Crane Lifts" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Live Safety Incidents Banner */}
        {summary.activeSafetyIncidents.length > 0 && (
          <div className="mt-5 space-y-2.5">
            {summary.activeSafetyIncidents.map((incident) => (
              <div
                key={incident.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-rose-50 border-l-4 border-rose-500 border-y border-r border-rose-200 text-xs text-slate-800 gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 flex-shrink-0 animate-ping" />
                  <span className="font-bold font-mono text-rose-700 uppercase tracking-wider text-[11px] px-2 py-0.5 bg-rose-100 rounded-md flex-shrink-0">
                    {incident.type}
                  </span>
                  <span className="font-bold text-slate-900 truncate" title={incident.assetName}>{incident.assetName}:</span>
                  <span className="text-slate-700 truncate" title={incident.description}>{incident.description}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                  <span className="font-mono text-[11px] text-slate-500 mr-1">{incident.time}</span>
                  
                  {/* Direct Dispatch Work Order Action Button */}
                  {onDispatchWorkOrderFromIncident && (
                    <button
                      onClick={() => onDispatchWorkOrderFromIncident(incident)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Dispatch a field technician work order for this alarm"
                    >
                      <ClipboardList className="w-3 h-3" />
                      <span>Dispatch Tech</span>
                    </button>
                  )}

                  {onDismissIncident && (
                    <button
                      onClick={() => onDismissIncident(incident.id)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-semibold text-[11px] border border-slate-300 shadow-xs transition-colors cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 max-w-full sm:flex-wrap">
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
            activeCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-2xs'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Yard & Spatial Map</span>
        </button>

        <button
          onClick={() => onSelectCategory('cranes')}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
            activeCategory === 'cranes'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-2xs'
          }`}
        >
          <Anchor className="w-4 h-4" />
          <span>Heavy Cranes (3)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono hidden sm:inline-block ${
            activeCategory === 'cranes' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
          }`}>
            LiDAR & Strain
          </span>
        </button>

        <button
          onClick={() => onSelectCategory('welding')}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
            activeCategory === 'welding'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-2xs'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Welding Bays (4)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono hidden sm:inline-block ${
            activeCategory === 'welding' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
          }`}>
            Digital WPS & AQI
          </span>
        </button>

        <button
          onClick={() => onSelectCategory('cnc')}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
            activeCategory === 'cnc'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-2xs'
          }`}
        >
          <Cpu className="w-4 h-4 text-indigo-500" />
          <span>Legacy CNC Cutters (3)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono hidden sm:inline-block ${
            activeCategory === 'cnc' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
          }`}>
            OCR Taps
          </span>
        </button>

        <button
          onClick={() => onSelectCategory('work_orders')}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
            activeCategory === 'work_orders'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-2xs'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-indigo-500" />
          <span>Work Orders & Dispatch</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono hidden sm:inline-block ${
            activeCategory === 'work_orders' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
          }`}>
            CMMS
          </span>
        </button>
      </div>
    </div>
  );
};
