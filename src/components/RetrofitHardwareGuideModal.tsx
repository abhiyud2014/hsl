import React from 'react';
import { 
  Layers, 
  X, 
  CheckCircle2, 
  Cpu, 
  Anchor, 
  Flame, 
  Radio, 
  Eye, 
  ShieldCheck, 
  ArrowRight,
  TrendingDown,
  DollarSign
} from 'lucide-react';

interface RetrofitHardwareGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RetrofitHardwareGuideModal: React.FC<RetrofitHardwareGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  ENGINEERING BLUEPRINT
                </span>
                <span className="text-xs text-slate-500">Non-Invasive Modernization Roadmap</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Digital Shipyard Retrofit Architecture (Heavy Cranes, Welding & CNCs)
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

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {/* Executive Value Proposition */}
          <div className="p-5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
            <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Modernizing Without Replacing Multi-Million Dollar Yard Machinery
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Global shipbuilders avoid tens of millions in capital expenditures by layering bolt-on IIoT sensors, edge computing gateways, and over-the-top AI vision on top of legacy equipment while preserving existing operational workflows.
            </p>
          </div>

          {/* 3-Step Implementation Roadmap */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              3-Step Execution Roadmap
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
                <div className="text-[11px] font-mono font-bold text-indigo-700 uppercase">
                  Phase 1: Pilot Hookup
                </div>
                <div className="text-xs font-bold text-slate-900">External Bolt-On Sensors</div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Attach non-invasive vibration nodes, CT current clamps, and LiDAR radar to 1 or 2 bottleneck machines during scheduled downtime.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
                <div className="text-[11px] font-mono font-bold text-indigo-700 uppercase">
                  Phase 2: Edge & AI Layer
                </div>
                <div className="text-xs font-bold text-slate-900">Protocol Translation</div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Industrial Edge Gateways (Node-RED/Kepware) translate legacy Modbus, Profibus, and 24V I/O into standardized MQTT / OPC UA streams.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
                <div className="text-[11px] font-mono font-bold text-indigo-700 uppercase">
                  Phase 3: Digital Twin Sync
                </div>
                <div className="text-xs font-bold text-slate-900">AI Cloud Telemetry</div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Feed telemetry into unified digital twin for real-time collision bubbles, digital WPS compliance, and condition-based predictive maintenance.
                </p>
              </div>
            </div>
          </div>

          {/* Cost-Benefit Comparison Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Cost-Benefit: Retrofitting vs. Replacing
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Strategy</th>
                    <th className="p-3.5">Upfront Capex</th>
                    <th className="p-3.5">Production Downtime</th>
                    <th className="p-3.5">Operational Learning Curve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                  <tr>
                    <td className="p-3.5 font-bold text-rose-700">Buying New Machines</td>
                    <td className="p-3.5 text-rose-700 font-medium">Very High ($ Millions / unit)</td>
                    <td className="p-3.5">High (Weeks of calibration)</td>
                    <td className="p-3.5 text-rose-700">Steep (Operators must relearn)</td>
                  </tr>
                  <tr className="bg-emerald-50/40">
                    <td className="p-3.5 font-bold text-emerald-800">IoT / AI Retrofitting</td>
                    <td className="p-3.5 text-emerald-800 font-bold">Low (Sensors & gateways cheap)</td>
                    <td className="p-3.5 text-emerald-800">Minimal (During standard shifts)</td>
                    <td className="p-3.5 text-emerald-800 font-bold">Flat (Keep familiar machines)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Asset Retrofit Deployment Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Asset Bolt-On Hardware Matrix
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cranes */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Anchor className="w-4 h-4 text-indigo-600" />
                  <span>Heavy Cranes</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 font-mono text-[11px]">
                  <div>• Rugged LiDAR & UWB Tags</div>
                  <div>• Hook Strain Gauges</div>
                  <div>• Wireless Motor Vibration Nodes</div>
                </div>
                <div className="text-[11px] text-indigo-700 font-medium pt-2 border-t border-slate-200">
                  Zero yard collisions; early gearbox wear detection.
                </div>
              </div>

              {/* Welding */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Manual Welding Bays</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 font-mono text-[11px]">
                  <div>• Current & Voltage CT Clamps</div>
                  <div>• Over-the-Top HD Visual Cameras</div>
                  <div>• PM2.5 / VOC AQI Sensors</div>
                </div>
                <div className="text-[11px] text-amber-700 font-medium pt-2 border-t border-slate-200">
                  100% digital WPS quality logs; automated fume extraction.
                </div>
              </div>

              {/* CNC Cutters */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>Old CNC Cutters</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 font-mono text-[11px]">
                  <div>• 24V Signal Light Edge I/O Taps</div>
                  <div>• Inline Oxygen/Gas Flow Meters</div>
                  <div>• Camera OCR for CRT Screens</div>
                </div>
                <div className="text-[11px] text-blue-700 font-medium pt-2 border-t border-slate-200">
                  Accurate OEE tracking; idle gas leak alerts; tip wear predictor.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Compliant with Industrial IoT standard architectures (OPC UA, MQTT, LoRaWAN)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
