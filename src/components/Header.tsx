import React, { useState } from 'react';
import { 
  Activity, 
  Play, 
  Pause, 
  AlertTriangle, 
  Wrench, 
  Layers, 
  Zap, 
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Sliders,
  FileText,
  Bot,
  Terminal,
  Menu,
  X,
  ChevronDown,
  Anchor,
  Scale
} from 'lucide-react';

interface HeaderProps {
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simSpeed: number;
  onChangeSimSpeed: (speed: number) => void;
  onTriggerAnomaly: (type: 'crane_proximity' | 'weld_spike' | 'gas_leak' | 'heavy_lift' | 'reset') => void;
  onOpenMaintenanceModal: () => void;
  onOpenRetrofitModal: () => void;
  onOpenAiCopilot: () => void;
  onOpenShiftReport: () => void;
  onOpenCalibrator: () => void;
  onOpenLiveTelemetry?: () => void;
  onOpenTandemLift?: () => void;
  onOpenNavalWpsAudit?: () => void;
  activeAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isSimulating,
  onToggleSimulation,
  simSpeed,
  onChangeSimSpeed,
  onTriggerAnomaly,
  onOpenMaintenanceModal,
  onOpenRetrofitModal,
  onOpenAiCopilot,
  onOpenShiftReport,
  onOpenCalibrator,
  onOpenLiveTelemetry,
  onOpenTandemLift,
  onOpenNavalWpsAudit,
  activeAlertsCount,
}) => {
  const [currentTime, setCurrentTime] = React.useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anomalyMenuOpen, setAnomalyMenuOpen] = useState(false);

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        {/* Left Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white font-bold shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5 flex-wrap min-w-0">
                SHIPYARD<span className="text-indigo-600">PULSE</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200 hidden sm:inline-block">
                  HSL VIZAG • YARD 11181
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 shrink-0 whitespace-nowrap hidden xl:inline-block">
                  AIR-GAPPED ON-PREM EDGE
                </span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden md:block">
              Hindustan Shipyard Limited • Naval Construction & Warship Telemetry Hub
            </p>
          </div>
        </div>

        {/* Center: Shift & Live Telemetry Stream Indicator */}
        <div className="hidden lg:flex items-center gap-2">
          {onOpenLiveTelemetry && (
            <button
              onClick={onOpenLiveTelemetry}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
              title="Inspect Live Streaming Telemetry (JSON / MQTT Packets)"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Terminal className="w-3.5 h-3.5 text-emerald-700" />
              <span>STREAMING JSON</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-200/60 rounded text-emerald-900">
                10 NODES
              </span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
            <span className="text-slate-500 font-medium">SHIFT 1</span>
            <span className="text-slate-300">|</span>
            <span className="text-indigo-600 font-bold">{currentTime || '13:35:00'} UTC</span>
          </div>
        </div>

        {/* Desktop & Tablet Actions */}
        <div className="hidden md:flex items-center flex-wrap gap-2">
          {/* Anomaly Injector Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setAnomalyMenuOpen(!anomalyMenuOpen)}
              onBlur={() => setTimeout(() => setAnomalyMenuOpen(false), 200)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold border border-amber-200 transition-colors shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulate Anomaly</span>
              <ChevronDown className="w-3 h-3 text-amber-600" />
            </button>
            {anomalyMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-fade-in">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Inject Synthetic Fault
                </div>
                <button
                  onClick={() => { onTriggerAnomaly('crane_proximity'); setAnomalyMenuOpen(false); }}
                  className="w-full text-left px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between font-medium transition-colors cursor-pointer"
                >
                  <span>Crane 2 Proximity Breach (&lt;3m)</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">LiDAR</span>
                </button>
                <button
                  onClick={() => { onTriggerAnomaly('weld_spike'); setAnomalyMenuOpen(false); }}
                  className="w-full text-left px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between font-medium transition-colors cursor-pointer"
                >
                  <span>Weld Bay 2 Voltage Spike (33V)</span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">WPS Defect</span>
                </button>
                <button
                  onClick={() => { onTriggerAnomaly('gas_leak'); setAnomalyMenuOpen(false); }}
                  className="w-full text-left px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between font-medium transition-colors cursor-pointer"
                >
                  <span>CNC 2 Idle Gas Leak (14 L/m)</span>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Flow Meter</span>
                </button>
                <button
                  onClick={() => { onTriggerAnomaly('heavy_lift'); setAnomalyMenuOpen(false); }}
                  className="w-full text-left px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between font-medium transition-colors cursor-pointer"
                >
                  <span>Goliath 94% SWL Heavy Lift</span>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Strain</span>
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => { onTriggerAnomaly('reset'); setAnomalyMenuOpen(false); }}
                  className="w-full text-left px-2.5 py-2 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset to Nominal State</span>
                </button>
              </div>
            )}
          </div>

          {/* HSL Presentation Feature 1: Tandem Mega-Block Lift */}
          {onOpenTandemLift && (
            <button
              onClick={onOpenTandemLift}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-xs font-bold border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
              title="Inspect Covered Building Berth Dual-Crane Tandem Synchronization"
            >
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tandem Lift</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-indigo-200/60 rounded text-indigo-950">
                Δh 10mm
              </span>
            </button>
          )}

          {/* HSL Presentation Feature 2: DQA(N) / IRS Naval Audit */}
          {onOpenNavalWpsAudit && (
            <button
              onClick={onOpenNavalWpsAudit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold border border-emerald-300 transition-colors shadow-2xs cursor-pointer"
              title="Open Directorate of Quality Assurance (Navy) Heat-Input & NDT Audit"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Naval Audit</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-200/80 rounded text-emerald-950">
                DMR 249A
              </span>
            </button>
          )}

          {/* AI Copilot Button */}
          <button
            onClick={onOpenAiCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
            title="Open AI Shipyard Diagnostic Copilot & RCA Engine"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>AI Copilot</span>
          </button>

          {/* Shift Report Generator Button */}
          <button
            onClick={onOpenShiftReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            title="Generate Official Shift Handover & DNV Compliance Report"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xl:inline">Shift Report</span>
          </button>

          {/* Sensor Safe Zone Calibrator Button */}
          <button
            onClick={onOpenCalibrator}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            title="Calibrate LiDAR & Microstrain Safety Envelopes"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xl:inline">Calibrator</span>
          </button>

          {/* Retrofitting Architecture Guide Button */}
          <button
            onClick={onOpenRetrofitModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            title="View Non-Invasive Retrofit Hardware Architecture"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden lg:inline">Retrofit Blueprint</span>
          </button>

          {/* AI Maintenance Scheduler Button */}
          <button
            onClick={onOpenMaintenanceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Maintenance</span>
            {activeAlertsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Simulation Play/Pause & Speed */}
          <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-0.5">
            <button
              onClick={onToggleSimulation}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                isSimulating 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title={isSimulating ? "Pause live simulation" : "Resume live simulation"}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <div className="flex items-center text-[10px] font-mono text-slate-500 px-1">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onChangeSimSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                    simSpeed === speed ? 'bg-white text-indigo-600 font-bold shadow-2xs' : 'hover:text-slate-800'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex items-center md:hidden gap-2">
          <button
            onClick={onOpenAiCopilot}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 active:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs min-h-[40px]"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>AI Copilot</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-700 active:bg-slate-200 transition-colors"
            aria-label="Open Tools Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Quick Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-100 space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {onOpenTandemLift && (
              <button
                onClick={() => { onOpenTandemLift(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 p-2.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-xl font-bold text-xs min-h-[44px]"
              >
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>Tandem Mega-Block Lift</span>
              </button>
            )}

            {onOpenNavalWpsAudit && (
              <button
                onClick={() => { onOpenNavalWpsAudit(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl font-bold text-xs min-h-[44px]"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>DQA-N / IRS Naval Audit</span>
              </button>
            )}

            {onOpenLiveTelemetry && (
              <button
                onClick={() => { onOpenLiveTelemetry(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-mono font-bold text-[11px] min-h-[44px]"
              >
                <Terminal className="w-4 h-4 text-emerald-700" />
                <span>Streaming JSON</span>
              </button>
            )}

            <button
              onClick={() => { onOpenMaintenanceModal(); setMobileMenuOpen(false); }}
              className="flex items-center justify-between p-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-medium min-h-[44px]"
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <span>AI Maintenance</span>
              </div>
              {activeAlertsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { onOpenShiftReport(); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium min-h-[44px]"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Shift Handover</span>
            </button>

            <button
              onClick={() => { onOpenCalibrator(); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium min-h-[44px]"
            >
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Edge Calibrator</span>
            </button>

            <button
              onClick={() => { onOpenRetrofitModal(); setMobileMenuOpen(false); }}
              className="col-span-2 flex items-center gap-2 p-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium min-h-[44px]"
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Retrofit Architecture Blueprint</span>
            </button>
          </div>

          {/* Mobile Anomaly Simulation Triggers */}
          <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Inject Anomaly / Fault Simulation</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                onClick={() => { onTriggerAnomaly('crane_proximity'); setMobileMenuOpen(false); }}
                className="p-2 bg-white text-slate-800 rounded-lg border border-amber-200 font-medium text-left min-h-[38px]"
              >
                Crane Proximity (&lt;3m)
              </button>
              <button
                onClick={() => { onTriggerAnomaly('weld_spike'); setMobileMenuOpen(false); }}
                className="p-2 bg-white text-slate-800 rounded-lg border border-amber-200 font-medium text-left min-h-[38px]"
              >
                Weld Spike (33V)
              </button>
              <button
                onClick={() => { onTriggerAnomaly('gas_leak'); setMobileMenuOpen(false); }}
                className="p-2 bg-white text-slate-800 rounded-lg border border-amber-200 font-medium text-left min-h-[38px]"
              >
                CNC Gas Leak (14 L/m)
              </button>
              <button
                onClick={() => { onTriggerAnomaly('heavy_lift'); setMobileMenuOpen(false); }}
                className="p-2 bg-white text-slate-800 rounded-lg border border-amber-200 font-medium text-left min-h-[38px]"
              >
                Goliath Heavy Lift
              </button>
            </div>
            <button
              onClick={() => { onTriggerAnomaly('reset'); setMobileMenuOpen(false); }}
              className="w-full p-2 bg-emerald-100/80 text-emerald-800 rounded-lg font-bold text-center text-xs flex items-center justify-center gap-1.5 min-h-[38px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Nominal State</span>
            </button>
          </div>

          {/* Mobile Sim Playback */}
          <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <span className="font-medium text-slate-600">Telemetry Stream Simulation:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleSimulation}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 min-h-[36px] ${
                  isSimulating ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulating ? 'Live' : 'Paused'}</span>
              </button>
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                {[1, 2, 5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => onChangeSimSpeed(speed)}
                    className={`px-2 py-1 rounded text-[11px] font-mono ${
                      simSpeed === speed ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

