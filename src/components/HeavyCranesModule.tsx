import React, { useState } from 'react';
import { 
  Anchor, 
  AlertTriangle, 
  Activity, 
  Radio, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Gauge, 
  Cpu, 
  ArrowUpRight,
  Info,
  Maximize2,
  Wrench,
  RotateCcw,
  Sparkles,
  ClipboardList,
  Volume2,
  MapPin,
  Terminal,
  Scale,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { HeavyCraneAsset } from '../types/dashboard';

interface HeavyCranesModuleProps {
  cranes: HeavyCraneAsset[];
  onSelectCrane: (crane: HeavyCraneAsset) => void;
  onSimulateTestLift?: (craneId: string) => void;
  onZeroStrainBaseline?: (craneId: string) => void;
  onDispatchWorkOrder?: (crane: HeavyCraneAsset) => void;
  onOpenLiveTelemetry?: (assetId?: string) => void;
  onOpenTandemLift?: () => void;
}

export const HeavyCranesModule: React.FC<HeavyCranesModuleProps> = ({
  cranes,
  onSelectCrane,
  onSimulateTestLift,
  onZeroStrainBaseline,
  onDispatchWorkOrder,
  onOpenLiveTelemetry,
  onOpenTandemLift,
}) => {
  const [selectedCraneId, setSelectedCraneId] = useState<string>(cranes[1]?.id || cranes[0]?.id);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'strain' | 'load'>('strain');

  const activeCrane = cranes.find((c) => c.id === selectedCraneId) || cranes[0];

  const isOverloadWarning = activeCrane.loadPercentage >= 90;
  const isProximityCaution = activeCrane.proximityDistanceMeters < 3.5;

  const showNotification = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleTestLift = () => {
    if (onSimulateTestLift) {
      onSimulateTestLift(activeCrane.id);
    }
    showNotification(`Simulated test lift executed on ${activeCrane.code} (+12T Load & +85 µε strain spike applied).`);
  };

  const handleZeroBaseline = () => {
    if (onZeroStrainBaseline) {
      onZeroStrainBaseline(activeCrane.id);
    }
    showNotification(`Tare & Strain Baseline Re-zeroed on ${activeCrane.code}. Microstrain offset normalized to 320 µε.`);
  };

  const handleLidarTest = () => {
    showNotification(`LiDAR 360° Safety Bubble verified for ${activeCrane.code}. Range clearance: ${activeCrane.proximityDistanceMeters}m to ${activeCrane.nearestObstacle}.`);
  };

  return (
    <div className="space-y-5">
      {/* Module Title & Fleet Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider text-indigo-700 uppercase bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                MODULE 01: HEAVY CRANES
              </span>
              <span className="text-xs text-slate-500">Structural Safety, Weight Limits & Vibration AI</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Heavy Cranes Telemetry, Anti-Collision & Gearbox Diagnostics
            </h3>
          </div>

          {/* Crane Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {cranes.map((crane) => (
              <button
                key={crane.id}
                onClick={() => setSelectedCraneId(crane.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                  selectedCraneId === crane.id
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Anchor className="w-3.5 h-3.5" />
                <span>{crane.code}</span>
                {crane.proximityDistanceMeters < 3.5 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
            ))}

            {onOpenLiveTelemetry && (
              <button
                onClick={() => onOpenLiveTelemetry(activeCrane.id)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
                title="Inspect real-time JSON telemetry stream for this crane"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-700" />
                <span>Stream JSON</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time GPS & Geospatial Ribbon */}
        <div className="mb-5 p-3.5 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center flex-wrap gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>GPS (WGS84): {activeCrane.gps?.formatted || '37.788251° N, 122.387214° W'}</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300">
              Alt: <strong className="text-white">{activeCrane.gps?.altitudeMeters || 48.0}m</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300">
              HDOP: <strong className="text-emerald-400">{activeCrane.gps?.hdopPrecision || 0.65}</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300">
              Heading: <strong className="text-indigo-300">{activeCrane.gps?.headingDegrees || 84}° True</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 rounded font-bold">
              RTK FIX ({activeCrane.gps?.satellites || 16} Sats)
            </span>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center justify-between animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          </div>
        )}

        {/* Selected Crane In-Depth Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Load Weight Status */}
          <div className={`p-5 rounded-2xl border transition-all shadow-xs ${
            isOverloadWarning 
              ? 'bg-rose-50 border-rose-300 shadow-rose-100' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-indigo-600" />
                LOAD WEIGHT STATUS
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                isOverloadWarning 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                SWL: {activeCrane.safeWorkingLimitTons}T
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {activeCrane.currentLoadTons.toFixed(1)}
                </span>
                <span className="text-sm font-medium text-slate-500 font-mono">Tons</span>
              </div>
              <div className="text-xs font-semibold text-indigo-600 mt-0.5">
                {activeCrane.loadPercentage.toFixed(1)}% of Safe Working Limit
              </div>
            </div>

            {/* Load Capacity Progress Bar */}
            <div className="mt-3.5 space-y-1.5">
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    activeCrane.loadPercentage >= 90
                      ? 'bg-rose-500'
                      : activeCrane.loadPercentage >= 75
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(100, activeCrane.loadPercentage)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0T</span>
                <span className="text-rose-600 font-bold">90% Threshold</span>
                <span>{activeCrane.safeWorkingLimitTons}T</span>
              </div>
            </div>
          </div>

          {/* Card 2: Collision Proximity Meter */}
          <div className={`p-5 rounded-2xl border transition-all shadow-xs ${
            isProximityCaution 
              ? 'bg-rose-50 border-rose-300 shadow-rose-100' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-indigo-600" />
                COLLISION PROXIMITY
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                isProximityCaution
                  ? 'bg-rose-600 text-white animate-bounce'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {activeCrane.proximityStatus}
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-black tracking-tight ${
                  isProximityCaution ? 'text-rose-600' : 'text-slate-900'
                }`}>
                  {activeCrane.proximityDistanceMeters.toFixed(1)}
                </span>
                <span className="text-sm font-medium text-slate-500 font-mono">Metres</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 truncate">
                Nearest: <span className="font-semibold text-slate-800">{activeCrane.nearestObstacle}</span>
              </div>
            </div>

            <div className="mt-3.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-mono text-slate-600 flex items-center justify-between">
              <span>LiDAR Radar: Active</span>
              <span className="text-indigo-600 font-bold">360° Bubble</span>
            </div>
          </div>

          {/* Card 3: Gearbox Vibration Score */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-500" />
                GEARBOX VIBRATION AI
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md capitalize ${
                activeCrane.gearboxHealthRating === 'optimal'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : activeCrane.gearboxHealthRating === 'elevated'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {activeCrane.gearboxHealthRating}
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {activeCrane.gearboxVibrationScore.toFixed(1)}
                </span>
                <span className="text-sm font-medium text-slate-500 font-mono">mm/s RMS</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 truncate">
                Wireless Accelerometer: Hoist & Mesh
              </div>
            </div>

            <div className="mt-3.5 text-[11px] font-mono text-slate-500">
              ISO 10816: {activeCrane.gearboxVibrationScore < 4.5 ? 'Class III Acceptable' : 'Warning: Lubrication Gap'}
            </div>
          </div>

          {/* Card 4: Structural Flexing & Microstrain */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                STRUCTURAL STRAIN
              </span>
              <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Girder Flex
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {activeCrane.structuralStrainMicrostrain}
                </span>
                <span className="text-sm font-medium text-slate-500 font-mono">µε</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Steel Elastic Limit: 1,200 µε
              </div>
            </div>

            <div className="mt-3.5 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Today's Lifts:</span>
              <span className="text-slate-900 font-bold">{activeCrane.todayLiftsCount} lifts</span>
            </div>
          </div>
        </div>

        {/* Interactive Quick Control Bar for Crane Engineer */}
        <div className="mt-5 p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">Crane Engineer Quick Actions ({activeCrane.code}):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-medium">
            <button
              onClick={handleTestLift}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Inject test load to verify load cell calibration"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>Simulate Test Lift</span>
            </button>

            <button
              onClick={handleZeroBaseline}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Tare strain gauge readings to current ambient temperature"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Zero Strain Baseline</span>
            </button>

            <button
              onClick={handleLidarTest}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Ping LiDAR radar envelope for obstacle reflections"
            >
              <Radio className="w-3.5 h-3.5 text-indigo-600" />
              <span>LiDAR Envelope Test</span>
            </button>

            {onOpenTandemLift && (
              <button
                onClick={onOpenTandemLift}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Open Dual-Gantry Tandem Mega-Block Synchronizer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Tandem Lift Sync</span>
              </button>
            )}

            {onDispatchWorkOrder && (
              <button
                onClick={() => onDispatchWorkOrder(activeCrane)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Create a work order for rigging team"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Dispatch Rigging WO</span>
              </button>
            )}
          </div>
        </div>

        {/* HSL Feature: Covered Building Berth (CBB) & Dry Dock Tandem Mega-Block Synchronization */}
        <div className="mt-5 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-indigo-900/60 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-indigo-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white tracking-wide">
                    Covered Building Berth Dual-Crane Tandem Synchronization
                  </h4>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                    Δh ≤ 50mm Interlocked
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Real-time twin hook elevation leveling & asymmetric load distribution for 450T–600T Hull Mega-Blocks
                </p>
              </div>
            </div>

            {onOpenTandemLift && (
              <button
                onClick={onOpenTandemLift}
                className="self-start lg:self-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Scale className="w-4 h-4" />
                <span>Open Live Dual-Crane Synchronizer</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
            {/* Metric 1: Coupled Status */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>Coupled Tandem Partner</span>
                <span className="text-cyan-300 font-bold">ACTIVE</span>
              </div>
              <div className="mt-2 text-base font-black text-white truncate">
                {activeCrane.tandemLift?.partnerCraneName || 'CR-02 (Level Luffing)'}
              </div>
              <div className="mt-1 text-[11px] text-slate-300 truncate">
                Block: {activeCrane.tandemLift?.megaBlockId || 'MB-C14'} ({activeCrane.tandemLift?.combinedLoadTons || 420}T)
              </div>
            </div>

            {/* Metric 2: Hook Elevation Difference */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>Hook Level Delta (Δh)</span>
                <span className="text-emerald-400 font-bold">In Spec</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-400">
                  {activeCrane.tandemLift?.hookHeightDeltaMm ?? 10}
                </span>
                <span className="text-xs text-slate-400 font-mono">mm elevation diff</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-300">
                Safe Envelope: &lt; 50mm max tilt
              </div>
            </div>

            {/* Metric 3: Asymmetric Load Transfer */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>Asymmetric Load Shift</span>
                <span className="text-emerald-400 font-bold">4.2%</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-cyan-300">
                  {activeCrane.tandemLift ? (Math.abs(activeCrane.tandemLift.cogBalancePct - 50) * 0.8).toFixed(1) : '4.2'}%
                </span>
                <span className="text-xs text-slate-400 font-mono">Shift ratio</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-300">
                Warning threshold: 10%
              </div>
            </div>

            {/* Metric 4: Dual E-Stop Sync */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>Dual E-Stop Interlock</span>
                <span className="text-emerald-400 font-bold">HARDWIRED</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">
                  &lt; 50 ms
                </span>
                <span className="text-xs text-slate-400 font-mono">Simultaneous Trip</span>
              </div>
              <div className="mt-1 text-[11px] text-emerald-300 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Emergency stop halts both hoists</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Charts Row: Structural Strain History + FFT Vibration Spectrum */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
          {/* Chart 1: Structural Strain Trend */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  STRUCTURAL STRAIN TREND (MICROSTRAIN vs SHIFT LOAD)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tracks microscopic steel flexing over time to detect fatigue before physical cracks.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                Live
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeCrane.strainHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <ReferenceLine y={900} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Fatigue Limit (900 µε)', fill: '#f43f5e', fontSize: 10 }} />
                  <Line type="monotone" dataKey="strain" name="Strain (µε)" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="load" name="Load (Tons)" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Gearbox Vibration Frequency Spectrum */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-500" />
                  GEARBOX HARMONIC FREQUENCY SPECTRUM (FFT ANALYSIS)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  AI scans motor and gear-mesh frequencies to detect microscopic tooth wear weeks early.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                FFT Node
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeCrane.vibrationFrequencies}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="freq" stroke="#94a3b8" fontSize={9} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="amplitude" name="Current Amplitude (mm/s)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="baseline" name="Nominal Baseline" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Retrofit Bolt-on Sensor Hardware Status */}
        <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">Retrofitted Bolt-on Sensor Suite:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rugged LiDAR Radar</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Solar UWB Hook Tag</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Girder Strain Gauges</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>LoRaWAN Vibration Node</span>
            </div>
          </div>
          <button
            onClick={() => onSelectCrane(activeCrane)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition-colors shadow-xs cursor-pointer"
          >
            <span>Full Telemetry Log</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
