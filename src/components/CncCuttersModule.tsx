import React, { useState } from 'react';
import { 
  Cpu, 
  AlertTriangle, 
  Flame, 
  Gauge, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  DollarSign, 
  Camera, 
  Sliders,
  Scissors,
  ClipboardList,
  RotateCcw,
  Zap,
  MapPin,
  Terminal
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart,
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';
import { CncCutterAsset } from '../types/dashboard';

interface CncCuttersModuleProps {
  cutters: CncCutterAsset[];
  onSelectCutter: (cutter: CncCutterAsset) => void;
  onFixGasLeak?: (cutterId: string) => void;
  onResetNozzleWear?: (cutterId: string) => void;
  onRescanOcr?: (cutterId: string) => void;
  onDispatchWorkOrder?: (cutter: CncCutterAsset) => void;
  onOpenLiveTelemetry?: (assetId?: string) => void;
}

export const CncCuttersModule: React.FC<CncCuttersModuleProps> = ({
  cutters,
  onSelectCutter,
  onFixGasLeak,
  onResetNozzleWear,
  onRescanOcr,
  onDispatchWorkOrder,
  onOpenLiveTelemetry,
}) => {
  const [selectedCutterId, setSelectedCutterId] = useState<string>(cutters[1]?.id || cutters[0]?.id);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isScanningOcr, setIsScanningOcr] = useState<boolean>(false);

  const activeCutter = cutters.find((c) => c.id === selectedCutterId) || cutters[0];

  const showNotification = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleFixLeak = () => {
    if (onFixGasLeak) {
      onFixGasLeak(activeCutter.id);
    }
    showNotification(`Gas Solenoid valve isolated on ${activeCutter.code}. Gas bleed stopped, saving 14.8 Sm³/h idle loss.`);
  };

  const handleResetNozzle = () => {
    if (onResetNozzleWear) {
      onResetNozzleWear(activeCutter.id);
    }
    showNotification(`Consumable nozzle & shield cap replaced on ${activeCutter.code}. Kerf accuracy reset to 100% (120h lifespan).`);
  };

  const handleRescanOcr = () => {
    setIsScanningOcr(true);
    if (onRescanOcr) {
      onRescanOcr(activeCutter.id);
    }
    setTimeout(() => {
      setIsScanningOcr(false);
      showNotification(`OCR Screen Camera re-scanned CRT display on ${activeCutter.code}. Active program coordinates synchronized.`);
    }, 1000);
  };

  return (
    <div className="space-y-5">
      {/* Module Title & Cutter Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider text-indigo-700 uppercase bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                MODULE 03: LEGACY CNC CUTTERS
              </span>
              <span className="text-xs text-slate-500">Non-Invasive 24V Tap, Gas Flow Metering & CRT Vision OCR</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Legacy Flame/Plasma CNC Telemetry, Gas Leaks & OEE Tracking
            </h3>
          </div>

          {/* Cutter Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {cutters.map((cutter) => (
              <button
                key={cutter.id}
                onClick={() => setSelectedCutterId(cutter.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                  selectedCutterId === cutter.id
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{cutter.code}</span>
                {cutter.isLeakingGas && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                )}
              </button>
            ))}

            {onOpenLiveTelemetry && (
              <button
                onClick={() => onOpenLiveTelemetry(activeCutter.id)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
                title="Inspect real-time JSON telemetry stream for this CNC cutter"
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
              <span>GPS (WGS84): {activeCutter.gps?.formatted || '37.788890° N, 122.388720° W'}</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300">
              Alt: <strong className="text-white">{activeCutter.gps?.altitudeMeters || 10.0}m</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300">
              HDOP: <strong className="text-emerald-400">{activeCutter.gps?.hdopPrecision || 0.65}</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300">
              Zone: <strong className="text-indigo-300">{activeCutter.location}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 rounded font-bold">
              RTK FIX ({activeCutter.gps?.satellites || 16} Sats)
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
          {/* Card 1: Machine State */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                MACHINE STATE (24V TAP)
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                activeCutter.machineState === 'cutting'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : activeCutter.machineState === 'idle'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {activeCutter.machineState}
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight capitalize">
                  {activeCutter.machineState}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 truncate">
                Active Program: <span className="font-semibold text-slate-800">{activeCutter.activeProgram}</span>
              </div>
            </div>

            <div className="mt-3.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-mono text-slate-600 flex items-center justify-between">
              <span>Plate: {activeCutter.plateThicknessMm}mm {activeCutter.plateMaterial}</span>
              <span className="text-indigo-600 font-bold">24V Edge Tap</span>
            </div>
          </div>

          {/* Card 2: Gas Flow & Leak Meter */}
          <div className={`p-5 rounded-2xl border transition-all shadow-xs ${
            activeCutter.isLeakingGas
              ? 'bg-orange-50 border-orange-300 shadow-orange-100'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                OXY-FUEL / PLASMA GAS
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                activeCutter.isLeakingGas
                  ? 'bg-orange-600 text-white animate-bounce'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {activeCutter.isLeakingGas ? 'LEAK DETECTED' : 'Tight Solenoid'}
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-black tracking-tight ${
                  activeCutter.isLeakingGas ? 'text-orange-600' : 'text-slate-900'
                }`}>
                  {activeCutter.gasFlowScmh.toFixed(1)}
                </span>
                <span className="text-sm font-medium text-slate-500 font-mono">Sm³/h</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {activeCutter.isLeakingGas 
                  ? 'Gas flowing while 24V torch signal is OFF (Solenoid leak)'
                  : 'Zero idle gas bleed during stand-by.'}
              </div>
            </div>

            <div className="mt-3.5 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Shift Gas Loss:</span>
              <span className="text-orange-700 font-bold">{activeCutter.gasLeakEstimatedCostShift || (activeCutter.isLeakingGas ? '$142.50' : '$0.00')} Waste</span>
            </div>
          </div>

          {/* Card 3: OEE Overall Equipment Effectiveness */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-indigo-600" />
                CUTTER OEE SCORE
              </span>
              <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Shift 1
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-indigo-600 tracking-tight">
                  {activeCutter.oeeScore.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Target OEE: 85.0%
              </div>
            </div>

            <div className="mt-3.5 grid grid-cols-3 gap-1 text-center text-[10px] font-mono">
              <div className="bg-slate-50 py-1 rounded border border-slate-100">
                <span className="text-slate-400 block">Avail</span>
                <span className="text-slate-900 font-bold">{activeCutter.oeeAvailability}%</span>
              </div>
              <div className="bg-slate-50 py-1 rounded border border-slate-100">
                <span className="text-slate-400 block">Perf</span>
                <span className="text-slate-900 font-bold">{activeCutter.oeePerformance}%</span>
              </div>
              <div className="bg-slate-50 py-1 rounded border border-slate-100">
                <span className="text-slate-400 block">Qual</span>
                <span className="text-emerald-700 font-bold">{activeCutter.oeeQuality}%</span>
              </div>
            </div>
          </div>

          {/* Card 4: Nozzle Wear & Consumables */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-xs flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-slate-600" />
                NOZZLE & KERF WEAR
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                activeCutter.nozzleWearPercentage > 75
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {activeCutter.nozzleWearPercentage}% Worn
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {activeCutter.nozzleEstimatedHoursRemaining}
                </span>
                <span className="text-sm font-medium text-slate-500 font-mono">Hours Left</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Torch Voltage Arc Rise: +{((activeCutter.nozzleWearPercentage / 100) * 12).toFixed(1)}V
              </div>
            </div>

            {/* Wear Progress */}
            <div className="mt-3.5 space-y-1">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    activeCutter.nozzleWearPercentage > 80 ? 'bg-rose-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${activeCutter.nozzleWearPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Quick Control Bar for CNC Machinist */}
        <div className="mt-5 p-4 bg-blue-50/70 border border-blue-100 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-700" />
            <span className="font-bold text-slate-800">Machinist & Gas Maintenance Actions ({activeCutter.code}):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-medium">
            {activeCutter.isLeakingGas && (
              <button
                onClick={handleFixLeak}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer animate-pulse"
                title="Isolate solenoid valve to shut down idle gas leak"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Isolate Gas Solenoid (Fix Leak)</span>
              </button>
            )}

            <button
              onClick={handleResetNozzle}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Record consumable tip changeout and reset wear counter"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
              <span>Replace Nozzle Tip (Reset)</span>
            </button>

            <button
              onClick={handleRescanOcr}
              disabled={isScanningOcr}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Trigger screen camera snapshot to refresh G-code coordinates"
            >
              <Camera className={`w-3.5 h-3.5 ${isScanningOcr ? 'animate-spin text-indigo-600' : 'text-indigo-600'}`} />
              <span>{isScanningOcr ? 'Scanning OCR...' : 'Re-Scan CRT Screen'}</span>
            </button>

            {onDispatchWorkOrder && (
              <button
                onClick={() => onDispatchWorkOrder(activeCutter)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Create a work order for gas specialist"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Dispatch Gas Fitter</span>
              </button>
            )}
          </div>
        </div>

        {/* Deep Analysis Row: CRT Vision Screen Scraper + Gas Consumption Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
          {/* CRT Vision Screen Scraper Mockup */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-emerald-400 font-mono shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            
            <div className="flex items-center justify-between mb-3 border-b border-emerald-950 pb-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  OPTICAL CRT SCREEN SCRAPER (OCR CAMERA)
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                Live G-Code Tap
              </span>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-emerald-900/50 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-[11px] text-emerald-500">
                <span>[CONTROLLER: FANUC 16M / SINUMERIK]</span>
                <span>STATUS: {activeCutter.machineState.toUpperCase()}</span>
              </div>
              <div className="text-emerald-300 font-bold text-sm">
                PROGRAM: {activeCutter.activeProgram} | NEST_BLK_08
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-emerald-400 pt-1">
                <div>X: +01428.50 mm</div>
                <div>Y: +00892.20 mm</div>
                <div>FEED: 1,850 mm/min</div>
              </div>
              <div className="text-[10px] text-emerald-600 pt-1 border-t border-emerald-950">
                Non-invasive OCR extracts plate position directly from screen without altering legacy CNC firmware.
              </div>
            </div>
          </div>

          {/* Gas Flow Waveform Chart */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  GAS FLOW vs MACHINE STATE TIMELINE
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Detects gas flowing during zero-motion idle states.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-orange-800 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                Flow Meter
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeCutter.gasFlowHistory || [
                  { time: '12:00', flow: 4.8, state: 1 },
                  { time: '12:30', flow: 4.6, state: 1 },
                  { time: '13:00', flow: activeCutter.isLeakingGas ? 0.85 : 0.0, state: 0 },
                  { time: '13:30', flow: activeCutter.isLeakingGas ? 0.90 : 0.0, state: 0 },
                  { time: '14:00', flow: activeCutter.machineState === 'cutting' ? 4.9 : 0.0, state: activeCutter.machineState === 'cutting' ? 1 : 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="flow" name="Gas Flow (Sm³/h)" stroke="#f97316" fill="#f97316" fillOpacity={0.25} strokeWidth={2} />
                  <Line type="step" dataKey="state" name="Torch Active" stroke="#4f46e5" strokeWidth={2} />
                </ComposedChart>
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
              <span>Non-Invasive 24V Optical Relay</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>In-Line Ultrasonic Gas Flowmeter</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Edge OCR Screen Scraper</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>RS485 Modbus Edge Gateway</span>
            </div>
          </div>
          <button
            onClick={() => onSelectCutter(activeCutter)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition-colors shadow-xs cursor-pointer"
          >
            <span>Full OEE Diagnostics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
