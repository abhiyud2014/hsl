import React, { useState } from 'react';
import { 
  X, 
  Anchor, 
  Flame, 
  Cpu, 
  Gauge, 
  Activity, 
  AlertTriangle, 
  Radio, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Wind,
  Layers,
  Sparkles,
  ClipboardList,
  Sliders,
  Bot,
  MapPin,
  Terminal,
  Compass,
  Globe,
  ExternalLink
} from 'lucide-react';
import { HeavyCraneAsset, WeldingBayAsset, CncCutterAsset } from '../types/dashboard';

interface AssetDetailModalProps {
  asset: HeavyCraneAsset | WeldingBayAsset | CncCutterAsset | null;
  onClose: () => void;
  onOpenAiCopilot?: () => void;
  onOpenCalibrator?: () => void;
  onCreateWorkOrder?: (asset: HeavyCraneAsset | WeldingBayAsset | CncCutterAsset) => void;
  onOpenLiveTelemetry?: (assetId?: string) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ 
  asset, 
  onClose,
  onOpenAiCopilot,
  onOpenCalibrator,
  onCreateWorkOrder,
  onOpenLiveTelemetry
}) => {
  const [showSatellitePreview, setShowSatellitePreview] = useState<boolean>(false);

  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              asset.category === 'crane' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
              asset.category === 'welding' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
              'bg-blue-50 text-blue-600 border border-blue-100'
            }`}>
              {asset.category === 'crane' && <Anchor className="w-5 h-5" />}
              {asset.category === 'welding' && <Flame className="w-5 h-5" />}
              {asset.category === 'cnc' && <Cpu className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {asset.code}
                </span>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-bold ${
                  asset.status === 'operating' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  asset.status === 'warning' ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {asset.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                {asset.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deep Telemetry Details */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs font-mono">
          {/* Location & Real-Time GPS Card */}
          <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>GPS (WGS84): {asset.gps?.formatted || '37.788251° N, 122.387214° W'}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-3">
                <span>Alt: <strong className="text-slate-200">{asset.gps?.altitudeMeters || 18.0}m MSL</strong></span>
                <span>•</span>
                <span>HDOP: <strong className="text-emerald-400">{asset.gps?.hdopPrecision || 0.65}</strong></span>
                <span>•</span>
                <span>Sats: <strong className="text-slate-200">{asset.gps?.satellites || 16}</strong></span>
                <span>•</span>
                <span>Sector: <strong className="text-indigo-300">{asset.location}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSatellitePreview(!showSatellitePreview)}
                className="px-2.5 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white border border-indigo-500 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{showSatellitePreview ? 'Hide Satellite Pin' : 'View on Satellite'}</span>
              </button>
              <span className="text-[10px] font-mono px-2 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded font-bold">
                RTK FIXED
              </span>
            </div>
          </div>

          {/* Interactive Mini Satellite Locator Viewport */}
          {showSatellitePreview && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-700 bg-[#0B132B] shadow-inner animate-fade-in">
              <div 
                className="absolute inset-0 bg-cover bg-center filter brightness-90 contrast-110"
                style={{
                  backgroundImage: `radial-gradient(circle at center, rgba(15, 23, 42, 0.3) 0%, rgba(11, 19, 43, 0.8) 100%), url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80')`
                }}
              />
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#10b981" strokeWidth="0.75" strokeDasharray="4 4" strokeOpacity="0.5" />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#10b981" strokeWidth="0.75" strokeDasharray="4 4" strokeOpacity="0.5" />
              </svg>
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 bg-indigo-600 text-white rounded-lg border-2 border-white font-mono font-bold text-[10px] shadow-2xl flex items-center gap-1.5 z-10"
                style={{ left: `${asset.gridX}%`, top: `${asset.gridY}%` }}
              >
                <MapPin className="w-3.5 h-3.5 text-white animate-bounce" />
                <span>{asset.code} ({asset.gps?.latitude.toFixed(5)}°, {asset.gps?.longitude.toFixed(5)}°)</span>
              </div>
              <div className="absolute bottom-2 left-2 bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-700">
                Satellite Fix: {asset.location} (WGS84)
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center text-slate-600 gap-2">
            <span>Location: <strong className="text-slate-900">{asset.location}</strong></span>
            <span>Live Power: <strong className="text-indigo-600 font-bold">{asset.powerDrawKw} kW</strong></span>
            <span>Edge Node: <strong className="text-emerald-700 font-bold">100% Signal (0.01% drop)</strong></span>
          </div>

          {/* Crane Specifics */}
          {asset.category === 'crane' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">CURRENT LOAD</span>
                  <span className="text-lg font-black text-slate-900">{asset.currentLoadTons} T</span>
                  <span className="text-[10px] text-indigo-600 font-semibold block">{asset.loadPercentage}% SWL</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">LIDAR PROXIMITY</span>
                  <span className="text-lg font-black text-rose-600">{asset.proximityDistanceMeters} m</span>
                  <span className="text-[10px] text-slate-500 block capitalize">{asset.proximityStatus}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">GEARBOX RMS</span>
                  <span className="text-lg font-black text-amber-600">{asset.gearboxVibrationScore} mm/s</span>
                  <span className="text-[10px] text-slate-500 block capitalize">{asset.gearboxHealthRating}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">STEEL STRAIN</span>
                  <span className="text-lg font-black text-slate-900">{asset.structuralStrainMicrostrain} µε</span>
                  <span className="text-[10px] text-slate-500 block">{asset.todayLiftsCount} lifts today</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-sans text-xs">
                <span className="text-indigo-600 font-bold block mb-1 font-mono text-xs">Model & Retrofit Notes:</span>
                {asset.model}. Equipped with external wireless vibration transceivers, hook transducer strain links, and rugged laser LiDAR scanners.
              </div>
            </div>
          )}

          {/* Welding Bay Specifics */}
          {asset.category === 'welding' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">WPS COMPLIANCE</span>
                  <span className="text-lg font-black text-emerald-600">{asset.wpsCompliancePercentage}%</span>
                  <span className="text-[10px] text-slate-500 block">{asset.liveVoltage}V / {asset.liveCurrent}A</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">ARC-ON EFFICIENCY</span>
                  <span className="text-lg font-black text-indigo-600">{asset.arcOnTimePercentage}%</span>
                  <span className="text-[10px] text-slate-500 block">Shift Target: 65%</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">DEFECT PROBABILITY</span>
                  <span className="text-lg font-black text-purple-600">{asset.defectProbabilityScore}%</span>
                  <span className="text-[10px] text-slate-500 block">Stability: {asset.waveformStability}/100</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">BAY AIR (PM2.5)</span>
                  <span className="text-lg font-black text-slate-900">{asset.bayAqiPm25} µg/m³</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">Hood: {asset.fumeHoodRpm} RPM</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-sans text-xs">
                <span className="text-indigo-600 font-bold block mb-1 font-mono text-xs">Active Specification & Operator:</span>
                {asset.wpsSpec} operated by {asset.operator}. Shielding gas: {asset.shieldingGasFlowLpm} L/min Argon/CO2 | Wire feed: {asset.wireFeedSpeedMpm} m/min.
              </div>
            </div>
          )}

          {/* CNC Specifics */}
          {asset.category === 'cnc' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">MACHINE STATE</span>
                  <span className="text-lg font-black uppercase text-slate-900">{asset.machineState}</span>
                  <span className="text-[10px] text-slate-500 block">24V Signal Tap</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">TOTAL OEE</span>
                  <span className="text-lg font-black text-indigo-600">{asset.oeeScore}%</span>
                  <span className="text-[10px] text-slate-500 block">Avail: {asset.oeeAvailability}%</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">GAS FLOW</span>
                  <span className="text-lg font-black text-orange-600">{asset.gasFlowScmh} Sm³/h</span>
                  <span className="text-[10px] text-slate-500 block">{asset.isLeakingGas ? 'LEAK DETECTED' : 'Valves tight'}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold">NOZZLE WEAR</span>
                  <span className="text-lg font-black text-slate-900">{asset.nozzleWearPercentage}%</span>
                  <span className="text-[10px] text-indigo-600 font-semibold block">{asset.nozzleEstimatedHoursRemaining}h remaining</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-sans text-xs">
                <span className="text-indigo-600 font-bold block mb-1 font-mono text-xs">Plate Program & OCR Details:</span>
                Running {asset.activeProgram} on {asset.plateThicknessMm}mm {asset.plateMaterial}. Screen scraping camera active with live G-code coordinate extraction.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {onOpenLiveTelemetry && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLiveTelemetry(asset.id);
                }}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-mono flex-1 sm:flex-none min-h-[38px]"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-700" />
                <span>Stream Live JSON</span>
              </button>
            )}

            {onCreateWorkOrder && (
              <button
                onClick={() => {
                  onCreateWorkOrder(asset);
                  onClose();
                }}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none min-h-[38px]"
              >
                <ClipboardList className="w-3.5 h-3.5 text-indigo-600" />
                <span>Create Work Order</span>
              </button>
            )}

            {onOpenAiCopilot && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAiCopilot();
                }}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none min-h-[38px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Copilot RCA</span>
              </button>
            )}

            {onOpenCalibrator && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCalibrator();
                }}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none min-h-[38px]"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>Calibrate</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer w-full sm:w-auto min-h-[38px]"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
