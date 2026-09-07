import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layers, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Radio, 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  Pause, 
  Wind, 
  Gauge, 
  Anchor, 
  Scale, 
  FileText
} from 'lucide-react';
import { HeavyCraneAsset } from '../types/dashboard';

interface TandemLiftSynchronizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cranes: HeavyCraneAsset[];
}

export const TandemLiftSynchronizerModal: React.FC<TandemLiftSynchronizerModalProps> = ({
  isOpen,
  onClose,
  cranes,
}) => {
  // Tandem Lift Simulation State
  const [hook1Height, setHook1Height] = useState<number>(18.420); // meters
  const [hook2Height, setHook2Height] = useState<number>(18.412); // meters
  const [crane1Strain, setCrane1Strain] = useState<number>(540); // µε
  const [crane2Strain, setCrane2Strain] = useState<number>(410); // µε
  const [cogVector, setCogVector] = useState<number>(51.2); // % Crane 1 load share
  const [isEmergencyHold, setIsEmergencyHold] = useState<boolean>(false);
  const [isSimulatingSlewDrift, setIsSimulatingSlewDrift] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const crane1 = cranes[0] || { name: 'Goliath Gantry 300T', code: 'CR-G300-01', safeWorkingLimitTons: 300 };
  const crane2 = cranes[1] || { name: 'Level Luffing Crane 100T', code: 'CR-LL100-02', safeWorkingLimitTons: 100 };

  const deltaHeightMm = Math.round(Math.abs(hook1Height - hook2Height) * 1000);
  const isWarning = deltaHeightMm > 15 && deltaHeightMm <= 25;
  const isCritical = deltaHeightMm > 25;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Live Jitter Loop for Tandem Hoists
  useEffect(() => {
    if (!isOpen || isEmergencyHold) return;

    const interval = setInterval(() => {
      if (isSimulatingSlewDrift) {
        // Induce drift
        setHook2Height((prev) => +(prev + 0.003).toFixed(3));
        setCrane2Strain((prev) => Math.min(880, prev + 15));
        setCogVector((prev) => +(prev - 0.3).toFixed(1));
      } else {
        // Normal synchronized micro-fluctuations
        const jitter = (Math.random() - 0.5) * 0.001;
        setHook1Height((prev) => +(prev + jitter).toFixed(3));
        setHook2Height((prev) => +(prev - jitter * 0.8).toFixed(3));
        setCrane1Strain((prev) => Math.max(480, Math.min(620, prev + Math.round((Math.random() - 0.5) * 6))));
        setCrane2Strain((prev) => Math.max(380, Math.min(460, prev + Math.round((Math.random() - 0.5) * 5))));
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isOpen, isEmergencyHold, isSimulatingSlewDrift]);

  if (!isOpen) return null;

  const handleAutoLevel = () => {
    setIsSimulatingSlewDrift(false);
    const avgHeight = +((hook1Height + hook2Height) / 2).toFixed(3);
    setHook1Height(avgHeight);
    setHook2Height(avgHeight);
    setCrane1Strain(520);
    setCrane2Strain(415);
    setCogVector(50.0);
    showNotification('Coordinated micro-inching routine completed. Both hook elevations leveled to 0.0 mm differential.');
  };

  const handleToggleSlewDrift = () => {
    if (isSimulatingSlewDrift) {
      setIsSimulatingSlewDrift(false);
      showNotification('Anti-skew closed-loop throttling engaged. Hoist speed adjusted.');
    } else {
      setIsSimulatingSlewDrift(true);
      showNotification('Simulating wind gust & asymmetric sling elongation. Differential height climbing...');
    }
  };

  const handleEmergencyHold = () => {
    setIsEmergencyHold(!isEmergencyHold);
    setIsSimulatingSlewDrift(false);
    if (!isEmergencyHold) {
      showNotification('Synchronized Tandem Safety Hold ENGAGED. Dual disc brakes locked.');
    } else {
      showNotification('Tandem Hoists released to normal synchronized operation.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                  Covered Building Berth & Dry Dock Tandem Mega-Block Synchronizer
                </h3>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                  HSL Vizag
                </span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  Dual-Gantry Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sub-millimeter Hoist Differential & Asymmetric Strain Interlock for 150T–300T Prefabricated Hull Blocks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Bar */}
        {notification && (
          <div className="bg-indigo-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between animate-fade-in shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white text-xs">Dismiss</button>
          </div>
        )}

        {/* Block & Tandem Radio Telemetry Banner */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl font-bold flex items-center gap-1.5 shrink-0">
              <Anchor className="w-4 h-4" />
              <span>BLOCK MB-11181-BOW</span>
            </div>
            <div>
              <div className="font-bold text-slate-900">Bulbous Bow & Sonar Housing Erection Block (184.2 Ton)</div>
              <div className="text-slate-500 text-[11px]">HSL Dry Dock 01 • Target Settle Location: Keel Block Grid K-04 to K-12</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-emerald-700">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
              <span>MESH CH-04 (868 MHz LoRaWAN)</span>
            </div>
            <div className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold">
              RTK FIX (0.4m Precision)
            </div>
          </div>
        </div>

        {/* Core Synchronization Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-100/60">
          {/* Main Hook Height Differential Visualizer */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm">Dual-Hook Height Differential Monitor</h4>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                isCritical 
                  ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                  : isWarning 
                  ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {isCritical ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>EMERGENCY TRIP: Δh = {deltaHeightMm} mm (&gt;25 mm)</span>
                  </>
                ) : isWarning ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>SKEW WARNING: Δh = {deltaHeightMm} mm (&gt;15 mm)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SYNCHRONIZED: Δh = {deltaHeightMm} mm (&lt;15 mm Limit)</span>
                  </>
                )}
              </div>
            </div>

            {/* Diagram of Cranes and Suspended Hull Block */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden">
              <div className="grid grid-cols-2 gap-8 relative z-10">
                {/* Crane 1 Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <div>
                      <div className="font-bold text-sm text-indigo-400">{crane1.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{crane1.code} (Gantry Master)</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700">
                      SWL: {crane1.safeWorkingLimitTons}T
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400">Hook Elevation:</span>
                    <span className="text-xl font-black font-mono text-white">{hook1Height.toFixed(3)} m</span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400">Hook Trunnion Strain:</span>
                    <span className="font-mono font-bold text-emerald-400">{crane1Strain} µε</span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(crane1Strain / 1000) * 100}%` }} />
                  </div>
                </div>

                {/* Crane 2 Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <div>
                      <div className="font-bold text-sm text-indigo-400">{crane2.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{crane2.code} (Slave Follower)</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700">
                      SWL: {crane2.safeWorkingLimitTons}T
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400">Hook Elevation:</span>
                    <span className={`text-xl font-black font-mono ${isWarning || isCritical ? 'text-amber-400' : 'text-white'}`}>
                      {hook2Height.toFixed(3)} m
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400">Hook Trunnion Strain:</span>
                    <span className={`font-mono font-bold ${isCritical ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {crane2Strain} µε
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${(crane2Strain / 1000) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Suspended Block Graphic Representation */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col items-center">
                <div 
                  className="w-full max-w-md bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-xl p-3 text-center border border-slate-500 shadow-xl transition-transform duration-500"
                  style={{ transform: `rotate(${(hook2Height - hook1Height) * 35}deg)` }}
                >
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2">
                    <Anchor className="w-4 h-4 text-amber-400" />
                    <span>Bulbous Bow Mega-Block (184.2T)</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                    Tilt Angle: {((hook2Height - hook1Height) * 12).toFixed(2)}° (Permissible Max: ±0.50°)
                  </div>
                </div>

                {/* CoG Vector Balance Gauge */}
                <div className="w-full max-w-md mt-4 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Crane 1: {cogVector}%</span>
                    <span className="text-amber-300 font-bold">Center of Gravity Vector</span>
                    <span>Crane 2: {(100 - cogVector).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full p-0.5 flex">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${cogVector}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Simulation & Safety Interlocks */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
              Executive Demonstration Controls (HSL Berth Operations)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleAutoLevel}
                className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-indigo-600" />
                <span>Auto-Level Inching (0.0mm)</span>
                <span className="text-[10px] font-normal text-indigo-600 font-mono">Level both hooks</span>
              </button>

              <button
                onClick={handleToggleSlewDrift}
                className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isSimulatingSlewDrift 
                    ? 'bg-amber-500 text-white border-amber-600' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <Wind className={`w-4 h-4 ${isSimulatingSlewDrift ? 'animate-spin text-white' : 'text-slate-600'}`} />
                <span>{isSimulatingSlewDrift ? 'Stop Drift Simulation' : 'Simulate Wind / Slew Drift'}</span>
                <span className="text-[10px] font-normal opacity-80 font-mono">Test anti-skew trigger</span>
              </button>

              <button
                onClick={handleEmergencyHold}
                className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isEmergencyHold 
                    ? 'bg-rose-600 text-white border-rose-700' 
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>{isEmergencyHold ? 'Release Emergency Hold' : 'Tandem Safety Hold (Brake)'}</span>
                <span className="text-[10px] font-normal opacity-80 font-mono">Synchronized e-stop</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>HSL Rigging Safety Standard 2024 • Verified for Indian Navy Mega-Blocks</span>
          </div>

          <button
            onClick={() => {
              showNotification('Tandem Lift Clearance Slip #HSL-TL-11181 signed and dispatched to Dry Dock Master.');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Tandem Clearance Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
