import React, { useState } from 'react';
import { 
  Sliders, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Anchor, 
  Flame, 
  Cpu, 
  RotateCcw,
  Save,
  Info
} from 'lucide-react';
import { SafeZoneCalibration } from '../types/dashboard';

interface SafeZoneCalibratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  calibration: SafeZoneCalibration;
  onSaveCalibration: (newCalibration: SafeZoneCalibration) => void;
}

export const SafeZoneCalibratorModal: React.FC<SafeZoneCalibratorModalProps> = ({
  isOpen,
  onClose,
  calibration,
  onSaveCalibration,
}) => {
  const [localCalibration, setLocalCalibration] = useState<SafeZoneCalibration>(calibration);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveCalibration(localCalibration);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    const defaults: SafeZoneCalibration = {
      craneCautionDistanceMeters: 5.0,
      craneHardStopDistanceMeters: 2.0,
      maxStructuralStrainMicrostrain: 1000,
      wpsVoltageTolerancePercent: 10,
      gasLeakIdleThresholdLpm: 5.0,
    };
    setLocalCalibration(defaults);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  DYNAMIC EDGE TUNER
                </span>
                <span className="text-xs text-slate-500">Bolt-On Sensor Margin Calibrator</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Digital Shipyard Sensor Safety Envelope Calibration
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700">
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              Adjusting these safety thresholds updates edge gateway rules in real time across LiDAR rangefinders, strain telemetry links, and digital WPS quality monitors.
            </p>
          </div>

          {/* Section 1: Heavy Crane LiDAR & Microstrain Envelopes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Anchor className="w-4 h-4 text-indigo-600" />
              <span>Heavy Cranes: Collision LiDAR & Strain Thresholds</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LiDAR Caution Zone */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">LiDAR Caution Distance</span>
                  <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                    {localCalibration.craneCautionDistanceMeters} m
                  </span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="12.0"
                  step="0.5"
                  value={localCalibration.craneCautionDistanceMeters}
                  onChange={(e) =>
                    setLocalCalibration({
                      ...localCalibration,
                      craneCautionDistanceMeters: Number(e.target.value),
                    })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>3.0m (Aggressive)</span>
                  <span>12.0m (Wide Buffer)</span>
                </div>
              </div>

              {/* LiDAR Hard Stop Zone */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">LiDAR Auto-Brake Hard Stop</span>
                  <span className="font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                    {localCalibration.craneHardStopDistanceMeters} m
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.2"
                  value={localCalibration.craneHardStopDistanceMeters}
                  onChange={(e) =>
                    setLocalCalibration({
                      ...localCalibration,
                      craneHardStopDistanceMeters: Number(e.target.value),
                    })
                  }
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1.0m (Minimum)</span>
                  <span>4.0m (High Margin)</span>
                </div>
              </div>
            </div>

            {/* Max Strain Gauge Microstrain */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Hook & Boom Structural Strain Limit</span>
                <span className="font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                  {localCalibration.maxStructuralStrainMicrostrain} µε (Microstrain)
                </span>
              </div>
              <input
                type="range"
                min="600"
                max="1200"
                step="25"
                value={localCalibration.maxStructuralStrainMicrostrain}
                onChange={(e) =>
                  setLocalCalibration({
                    ...localCalibration,
                    maxStructuralStrainMicrostrain: Number(e.target.value),
                  })
                }
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>600 µε (Conservative)</span>
                <span>1200 µε (Elastic Yield Bound)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Welding Bays & CNC Cutters */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>Welding & CNC: WPS Quality Window & Gas Cutoffs</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WPS Voltage Tolerance */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">WPS Voltage Tolerance Band</span>
                  <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                    ±{localCalibration.wpsVoltageTolerancePercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={localCalibration.wpsVoltageTolerancePercent}
                  onChange={(e) =>
                    setLocalCalibration({
                      ...localCalibration,
                      wpsVoltageTolerancePercent: Number(e.target.value),
                    })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>±5% (Strict DNV Subsea)</span>
                  <span>±20% (General Fab)</span>
                </div>
              </div>

              {/* CNC Idle Gas Bleed Trigger */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Idle Gas Bleed Alert Trigger</span>
                  <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                    {localCalibration.gasLeakIdleThresholdLpm} L/min
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="15.0"
                  step="0.5"
                  value={localCalibration.gasLeakIdleThresholdLpm}
                  onChange={(e) =>
                    setLocalCalibration({
                      ...localCalibration,
                      gasLeakIdleThresholdLpm: Number(e.target.value),
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1.0 L/min (Ultra Sensitive)</span>
                  <span>15.0 L/min (Permissive)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-xs"
            >
              {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Thresholds Applied!' : 'Save & Deploy to Edge'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
