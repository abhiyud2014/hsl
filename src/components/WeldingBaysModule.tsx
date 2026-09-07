import React, { useState } from 'react';
import { 
  Flame, 
  AlertTriangle, 
  Wind, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight,
  Zap,
  Layers,
  Thermometer,
  FileCheck,
  ClipboardList,
  RotateCcw,
  Fan,
  MapPin,
  Terminal,
  Radio,
  UserCheck,
  ShieldAlert,
  Anchor
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  BarChart, 
  Bar 
} from 'recharts';
import { WeldingBayAsset } from '../types/dashboard';

interface WeldingBaysModuleProps {
  bays: WeldingBayAsset[];
  onSelectBay: (bay: WeldingBayAsset) => void;
  onBoostFumeHood?: (bayId: string) => void;
  onCalibrateWpsClamp?: (bayId: string) => void;
  onDispatchWorkOrder?: (bay: WeldingBayAsset) => void;
  onOpenLiveTelemetry?: (assetId?: string) => void;
  onOpenNavalWpsAudit?: () => void;
}

export const WeldingBaysModule: React.FC<WeldingBaysModuleProps> = ({
  bays,
  onSelectBay,
  onBoostFumeHood,
  onCalibrateWpsClamp,
  onDispatchWorkOrder,
  onOpenLiveTelemetry,
  onOpenNavalWpsAudit,
}) => {
  const [selectedBayId, setSelectedBayId] = useState<string>(bays[1]?.id || bays[0]?.id);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [certModalOpen, setCertModalOpen] = useState<boolean>(false);

  const activeBay = bays.find((b) => b.id === selectedBayId) || bays[0];

  const hasDefectAlert = activeBay.status === 'warning' || activeBay.defectProbabilityScore > 10;
  const isWpsOut = 
    activeBay.liveVoltage < activeBay.targetVoltageMin || 
    activeBay.liveVoltage > activeBay.targetVoltageMax ||
    activeBay.liveCurrent < activeBay.targetCurrentMin ||
    activeBay.liveCurrent > activeBay.targetCurrentMax;

  // Scatter plot data for WPS envelope
  const wpsLivePoint = [
    { voltage: activeBay.liveVoltage, current: activeBay.liveCurrent, name: 'Live Arc Signature' },
  ];

  const showNotification = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleBoostHood = () => {
    if (onBoostFumeHood) {
      onBoostFumeHood(activeBay.id);
    }
    showNotification(`Smart Fume Hood for ${activeBay.code} boosted to ${activeBay.fumeHoodRpm + 400} RPM. Bay PM2.5 extraction rate +35%.`);
  };

  const handleCalibrateClamp = () => {
    if (onCalibrateWpsClamp) {
      onCalibrateWpsClamp(activeBay.id);
    }
    showNotification(`Digital CT Clamp & Voltmeter re-calibrated on ${activeBay.code}. Voltage normalized to 28.4V (ASME Sec IX spec).`);
  };

  return (
    <div className="space-y-5">
      {/* Module Title & Bay Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider text-indigo-700 uppercase bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                MODULE 02: MANUAL WELDING BAYS
              </span>
              <span className="text-xs text-slate-500">Digital WPS, Waveform Defect AI & AQI Safety</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Manual Welding Quality Control & Worker Air Safety Monitoring
            </h3>
          </div>

          {/* Bay Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {bays.map((bay) => (
              <button
                key={bay.id}
                onClick={() => setSelectedBayId(bay.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                  selectedBayId === bay.id
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${selectedBayId === bay.id ? 'text-white' : 'text-amber-500'}`} />
                <span>{bay.code}</span>
                {bay.status === 'warning' && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </button>
            ))}

            {onOpenLiveTelemetry && (
              <button
                onClick={() => onOpenLiveTelemetry(activeBay.id)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
                title="Inspect real-time JSON telemetry stream for this welding bay"
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
              <span>GPS (WGS84): {activeBay.gps?.formatted || '37.787652° N, 122.385841° W'}</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300">
              Alt: <strong className="text-white">{activeBay.gps?.altitudeMeters || 12.0}m</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300">
              HDOP: <strong className="text-emerald-400">{activeBay.gps?.hdopPrecision || 0.65}</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300">
              Zone: <strong className="text-amber-300">{activeBay.location}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 rounded font-bold">
              RTK FIX ({activeBay.gps?.satellites || 16} Sats)
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

        {/* 4 Core Parameter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Digital WPS Compliance Indicator */}
          <div className={`p-5 rounded-2xl border transition-all shadow-xs ${
            isWpsOut
              ? 'bg-rose-50 border-rose-300 shadow-rose-100'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                DIGITAL WPS COMPLIANCE
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                isWpsOut 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {activeBay.wpsCompliancePercentage.toFixed(1)}% In Spec
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black font-mono ${isWpsOut ? 'text-rose-600' : 'text-slate-900'}`}>
                  {activeBay.liveVoltage.toFixed(1)}V
                </span>
                <span className="text-slate-400 font-mono text-xs">/</span>
                <span className={`text-2xl font-black font-mono ${isWpsOut ? 'text-rose-600' : 'text-slate-900'}`}>
                  {activeBay.liveCurrent}A
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 font-mono">
                Spec: {activeBay.targetVoltageMin}-{activeBay.targetVoltageMax}V | {activeBay.targetCurrentMin}-{activeBay.targetCurrentMax}A
              </div>
            </div>

            <div className="mt-3.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-mono text-slate-600 flex items-center justify-between">
              <span className="truncate font-medium">{activeBay.wpsSpec}</span>
              <span className="text-indigo-600 font-bold flex-shrink-0">CT Clamps</span>
            </div>
          </div>

          {/* Card 2: Arc-On Time */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                ARC-ON TIME (EFFICIENCY)
              </span>
              <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Shift 1
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {activeBay.arcOnTimePercentage.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 font-mono">Active Arc</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Setup/Tacking: {(100 - activeBay.arcOnTimePercentage).toFixed(1)}%
              </div>
            </div>

            {/* Shift Arc Progress */}
            <div className="mt-3.5 space-y-1.5">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${activeBay.arcOnTimePercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0%</span>
                <span className="text-indigo-600 font-semibold">Benchmark: 65%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Card 3: Defect Probability Score */}
          <div className={`p-5 rounded-2xl border transition-all shadow-xs ${
            hasDefectAlert
              ? 'bg-rose-50 border-rose-300 shadow-rose-100'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                DEFECT PROBABILITY AI
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                hasDefectAlert
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {hasDefectAlert ? 'Flaw Risk' : 'Low Risk'}
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-black tracking-tight ${hasDefectAlert ? 'text-rose-600' : 'text-slate-900'}`}>
                  {activeBay.defectProbabilityScore.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 font-mono">Risk Index</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Waveform Stability: <span className="text-slate-900 font-bold font-mono">{activeBay.waveformStability}/100</span>
              </div>
            </div>

            <div className="mt-3.5 text-[11px] font-mono text-slate-500">
              {activeBay.recentDefectsFlagged.length > 0
                ? `Alert: ${activeBay.recentDefectsFlagged[0].type}`
                : 'Zero slag/porosity signatures detected.'}
            </div>
          </div>

          {/* Card 4: Bay Air Quality Index & Smart Fume Hood */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-emerald-600" />
                BAY AIR QUALITY (AQI)
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                activeBay.bayAqiPm25 > 30
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                PM2.5: {activeBay.bayAqiPm25} µg/m³
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {activeBay.fumeHoodRpm} <span className="text-xs font-normal text-slate-500">RPM</span>
                </span>
                <span className="text-xs text-emerald-600 font-mono font-semibold">
                  (Smart Auto-Ramp)
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-mono">
                VOC Gas: {activeBay.bayVocPpm} ppm | Hood: {activeBay.powerDrawKw} kW
              </div>
            </div>

            <div className="mt-3.5 text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Smart Hood Action:</span>
              <span className="text-emerald-700 font-bold">Active Air Exchange</span>
            </div>
          </div>
        </div>

        {/* Interactive Quick Control Bar for Welding Supervisor */}
        <div className="mt-5 p-4 bg-amber-50/70 border border-amber-100 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span className="font-bold text-slate-800">Welding Quality & Environmental Controls ({activeBay.code}):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-medium">
            <button
              onClick={handleBoostHood}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Force fume extraction blower to higher speed"
            >
              <Fan className="w-3.5 h-3.5 text-emerald-600" />
              <span>Boost Fume Hood (+400 RPM)</span>
            </button>

            <button
              onClick={handleCalibrateClamp}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Tare current CT clamps to center nominal ASME voltage"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Calibrate Arc Clamps</span>
            </button>

            <button
              onClick={() => setCertModalOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="View or export DNV / Lloyd's Register WPS pass slip"
            >
              <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>WPS Certificate</span>
            </button>

            {onOpenNavalWpsAudit && (
              <button
                onClick={onOpenNavalWpsAudit}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Open Directorate of Quality Assurance (Navy) Heat Input & NDT Audit"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>DQA(N) Naval Audit</span>
              </button>
            )}

            {onDispatchWorkOrder && (
              <button
                onClick={() => onDispatchWorkOrder(activeBay)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Dispatch NDT welding inspector"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Dispatch NDT Inspector</span>
              </button>
            )}
          </div>
        </div>

        {/* HSL Special Feature: Warship Steel DMR 249A & Double Bottom Confined Space Safety Interlock */}
        <div className="mt-5 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 border border-slate-700 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center shrink-0">
                <Anchor className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white tracking-wide">
                    Naval Warship Construction & Confined Space Safety (HSL Yard 11181)
                  </h4>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                    DQA-N Verified
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Automated heat-input logging for DMR 249A micro-alloyed hull plate & double bottom atmospheric life safety
                </p>
              </div>
            </div>

            {onOpenNavalWpsAudit && (
              <button
                onClick={onOpenNavalWpsAudit}
                className="self-start lg:self-auto px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Full DQA(N) Dossier</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
            {/* Metric 1: Steel Grade & Heat Input */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>Naval Steel Specification</span>
                <span className="text-cyan-300 font-bold">DMR 249A</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">
                  {activeBay.heatInputKjPerMm ?? 1.78}
                </span>
                <span className="text-xs text-slate-400 font-mono">kJ/mm Heat Input</span>
              </div>
              <div className="mt-1 text-[11px] text-amber-300 font-medium">
                Limit: 1.80 kJ/mm max • Interpass: {activeBay.interpassTempCelsius ?? 192}°C
              </div>
            </div>

            {/* Metric 2: Double Bottom Oxygen Concentration */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>Double Bottom O₂ Level</span>
                <span className="text-emerald-400 font-bold">Normal</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-400">
                  {activeBay.confinedSpaceAtmosphere?.oxygenPct ?? 20.8}%
                </span>
                <span className="text-xs text-slate-400 font-mono">Atmospheric O₂</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-300">
                Safe threshold: 19.5% – 23.5% (DQA-N Standard)
              </div>
            </div>

            {/* Metric 3: Shielding Argon Displacement */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>Argon Gas Displacement</span>
                <span className="text-emerald-400 font-bold">&lt; 500 ppm</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-cyan-300">
                  {activeBay.confinedSpaceAtmosphere?.argonDisplacementPpm ?? 320}
                </span>
                <span className="text-xs text-slate-400 font-mono">ppm Heavy Inert Gas</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-300">
                Floor accumulation sensor clear
              </div>
            </div>

            {/* Metric 4: Forced Blower Interlock */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>Ventilation Interlock</span>
                <span className="text-emerald-400 font-bold">ARMED</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">
                  {activeBay.confinedSpaceAtmosphere?.blowerCfm ?? 2400}
                </span>
                <span className="text-xs text-slate-400 font-mono">CFM Positive Draft</span>
              </div>
              <div className="mt-1 text-[11px] text-emerald-300 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>200ms power cut if flow &lt;1800 CFM</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>
                <strong>Active Confined Cell:</strong> {activeBay.confinedSpaceAtmosphere?.locationName || 'Double Bottom Cell 4B (Fr 42-46) - Ballast Tank'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono text-emerald-300 font-semibold">
                {activeBay.confinedSpaceAtmosphere?.certifiedWorkersInside ?? 2} Certified Welders inside (UWB Gas Badges Active)
              </span>
            </div>
          </div>
        </div>

        {/* Deep Analysis Row: Digital WPS Envelope Chart + Consumables Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
          {/* WPS Envelope Scatter / Target Box */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-500" />
                  DIGITAL WPS ENVELOPE (VOLTAGE vs AMPERAGE WINDOW)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Green boundary = qualified ASME/DNV window. Dot = live arc signature.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                CT Transformer
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    dataKey="current" 
                    name="Current (A)" 
                    unit="A" 
                    domain={[activeBay.targetCurrentMin - 40, activeBay.targetCurrentMax + 40]}
                    stroke="#94a3b8" 
                    fontSize={10} 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="voltage" 
                    name="Voltage (V)" 
                    unit="V" 
                    domain={[activeBay.targetVoltageMin - 6, activeBay.targetVoltageMax + 6]}
                    stroke="#94a3b8" 
                    fontSize={10} 
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <ReferenceLine x={activeBay.targetCurrentMin} stroke="#10b981" strokeDasharray="3 3" />
                  <ReferenceLine x={activeBay.targetCurrentMax} stroke="#10b981" strokeDasharray="3 3" />
                  <ReferenceLine y={activeBay.targetVoltageMin} stroke="#10b981" strokeDasharray="3 3" />
                  <ReferenceLine y={activeBay.targetVoltageMax} stroke="#10b981" strokeDasharray="3 3" />
                  <Scatter 
                    name="Live Arc" 
                    data={wpsLivePoint} 
                    fill={isWpsOut ? '#f43f5e' : '#4f46e5'} 
                    shape="circle" 
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Consumables Tracker */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-indigo-600" />
                  CONSUMABLES CONSUMPTION & GAS FLOW RATES
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Live shielding gas flow (L/min) and filler wire feed speed (m/min).
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                Shift Log
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-mono font-semibold text-slate-500">Shielding Gas (Argon/CO2)</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {activeBay.shieldingGasFlowLpm.toFixed(1)} <span className="text-xs font-normal text-slate-500">L/min</span>
                </div>
                <div className="text-xs font-semibold text-indigo-600 mt-1 font-mono">
                  Shift: {activeBay.gasConsumedCubicMetersToday.toFixed(1)} m³
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-mono font-semibold text-slate-500">Filler Wire Feed Speed</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {activeBay.wireFeedSpeedMpm.toFixed(1)} <span className="text-xs font-normal text-slate-500">m/min</span>
                </div>
                <div className="text-xs font-semibold text-amber-600 mt-1 font-mono">
                  Shift: {activeBay.wireConsumedKgToday.toFixed(1)} kg Wire
                </div>
              </div>
            </div>

            <div className="mt-4 p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between">
              <span>Assigned Operator: <strong className="text-slate-900">{activeBay.operator}</strong></span>
              <span className="text-emerald-700 font-bold">Vision Camera: Active</span>
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
              <span>Current & Voltage CT Clamps</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>HD Vision Camera</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>PM2.5 & VOC AQI Sensors</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Extraction Hood Automation</span>
            </div>
          </div>
          <button
            onClick={() => onSelectBay(activeBay)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition-colors shadow-xs cursor-pointer"
          >
            <span>Full WPS Log</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* WPS Certificate Modal */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-base">Digital WPS Compliance Certificate</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                DNV GL-CP-0352
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Bay / Location:</span>
                <span className="font-bold text-slate-900">{activeBay.code} ({activeBay.location})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WPS Specification:</span>
                <span className="font-bold text-slate-900">{activeBay.wpsSpec}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Certified Operator:</span>
                <span className="font-bold text-slate-900">{activeBay.operator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Voltage / Current Band:</span>
                <span className="font-bold text-emerald-700">{activeBay.targetVoltageMin}-{activeBay.targetVoltageMax}V / {activeBay.targetCurrentMin}-{activeBay.targetCurrentMax}A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Compliance Rate:</span>
                <span className="font-bold text-emerald-700">{activeBay.wpsCompliancePercentage.toFixed(1)}% Valid Passes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Defect Probability:</span>
                <span className="font-bold text-slate-900">{activeBay.defectProbabilityScore.toFixed(1)}% (Low Risk)</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Digitally sealed by Shipyard IIoT CT Clamps & Optical Vision AI. Validated for high-tensile EH36 steel hull blocks.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  showNotification(`WPS certificate copied to clipboard for ${activeBay.code}.`);
                  setCertModalOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Copy Certificate Data
              </button>
              <button
                onClick={() => setCertModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
