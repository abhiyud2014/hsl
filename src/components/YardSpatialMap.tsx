import React, { useState } from 'react';
import { 
  Anchor, 
  Flame, 
  Cpu, 
  AlertTriangle, 
  Maximize2, 
  Layers, 
  Eye, 
  MapPin, 
  Radio, 
  ShieldCheck, 
  Wind,
  Zap,
  Info,
  RotateCcw,
  BellRing,
  Sparkles,
  CheckCircle2,
  Terminal,
  Compass,
  Navigation,
  Globe,
  Columns
} from 'lucide-react';
import { HeavyCraneAsset, WeldingBayAsset, CncCutterAsset } from '../types/dashboard';
import { GoogleSatelliteMap } from './GoogleSatelliteMap';

interface YardSpatialMapProps {
  cranes: HeavyCraneAsset[];
  weldingBays: WeldingBayAsset[];
  cncCutters: CncCutterAsset[];
  onSelectAsset: (asset: HeavyCraneAsset | WeldingBayAsset | CncCutterAsset) => void;
  selectedAssetId?: string;
  onSelectCategory?: (category: 'all' | 'cranes' | 'welding' | 'cnc') => void;
  onOpenLiveTelemetry?: () => void;
}

export const YardSpatialMap: React.FC<YardSpatialMapProps> = ({
  cranes,
  weldingBays,
  cncCutters,
  onSelectAsset,
  selectedAssetId,
  onSelectCategory,
  onOpenLiveTelemetry,
}) => {
  const [viewMode, setViewMode] = useState<'schematic' | 'satellite' | 'split'>('satellite');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showLidarSafetyBubbles, setShowLidarSafetyBubbles] = useState<boolean>(true);
  const [showUwbHullTags, setShowUwbHullTags] = useState<boolean>(true);
  const [showGpsGrid, setShowGpsGrid] = useState<boolean>(true);
  const [drillActive, setDrillActive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEvacDrill = () => {
    setDrillActive(true);
    showToast('🚨 Yard Spatial Evacuation Beacon test triggered. All UWB personnel and crane hooks signaled to safe halt.');
    setTimeout(() => {
      setDrillActive(false);
    }, 6000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
      {/* Map Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mb-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider text-indigo-700 uppercase bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
              SPATIAL TELEMETRY & DIGITAL TWIN
            </span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">RTK-GPS (WGS84) / UWB / LiDAR Live Positioning</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1">
            Shipyard Heavy Fabrication Footprint & Geofenced Safety Grid
          </h3>
        </div>

        {/* View Mode Switcher (Google Satellite vs Digital Twin Schematic vs Split) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-1 shadow-inner overflow-x-auto max-w-full">
            <button
              onClick={() => setViewMode('satellite')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                viewMode === 'satellite'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Map (Satellite)</span>
            </button>

            <button
              onClick={() => setViewMode('schematic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                viewMode === 'schematic'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Schematic Twin</span>
            </button>

            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] hidden sm:flex ${
                viewMode === 'split'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
          </div>

          {onOpenLiveTelemetry && (
            <button
              onClick={onOpenLiveTelemetry}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer text-xs font-semibold min-h-[36px]"
              title="View live streaming JSON telemetry for spatial objects"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xs:inline">Live Stream</span>
            </button>
          )}

          <button
            onClick={handleEvacDrill}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-semibold min-h-[36px] ${
              drillActive
                ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Test spatial evacuation audio beacons and UWB worker clearances"
          >
            <BellRing className="w-3.5 h-3.5 text-rose-500" />
            <span>{drillActive ? 'Evacuation Active' : 'Evac Test'}</span>
          </button>
        </div>
      </div>

      {/* Secondary Controls Bar for Schematic Overlay Toggles */}
      {(viewMode === 'schematic' || viewMode === 'split') && (
        <div className="flex items-center flex-wrap gap-2 mb-4 text-xs font-semibold">
          <span className="text-slate-500 font-mono text-[11px] mr-1">Schematic Overlays:</span>
          {/* GPS Grid Toggle */}
          <button
            onClick={() => setShowGpsGrid(!showGpsGrid)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              showGpsGrid
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle high-precision WGS84 GPS coordinate lat/long grid lines"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>WGS84 GPS Grid</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              showHeatmap
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Lift Heatmap</span>
          </button>

          <button
            onClick={() => setShowLidarSafetyBubbles(!showLidarSafetyBubbles)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              showLidarSafetyBubbles
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-indigo-600" />
            <span>LiDAR Bubbles</span>
          </button>

          <button
            onClick={() => setShowUwbHullTags(!showUwbHullTags)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              showUwbHullTags
                ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-purple-600" />
            <span>UWB Blocks</span>
          </button>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-medium flex items-center gap-2 animate-fade-in shadow-xs">
          <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Display View Modes */}
      {viewMode === 'satellite' && (
        <GoogleSatelliteMap
          cranes={cranes}
          weldingBays={weldingBays}
          cncCutters={cncCutters}
          onSelectAsset={onSelectAsset}
          selectedAssetId={selectedAssetId}
          className="h-[480px] lg:h-[560px]"
        />
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GoogleSatelliteMap
            cranes={cranes}
            weldingBays={weldingBays}
            cncCutters={cncCutters}
            onSelectAsset={onSelectAsset}
            selectedAssetId={selectedAssetId}
            className="h-[460px]"
          />
          <div className="relative w-full h-[460px] bg-[#F8FAFC] rounded-xl border border-slate-200 overflow-hidden select-none shadow-inner">
            {/* Top GPS Coordinate Banner */}
            {showGpsGrid && (
              <div className="absolute top-2 left-2 z-10 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[10px] font-mono border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>SCHEMATIC DIGITAL TWIN</span>
              </div>
            )}
            {/* SVG Content */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="yardGridSplit" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#yardGridSplit)" />
              {/* Zones */}
              <rect x="30%" y="10%" width="32%" height="45%" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="5 3" />
              <text x="32%" y="16%" fill="#475569" fontSize="10" fontFamily="sans-serif" fontWeight="700">
                DRY DOCK 01
              </text>
              <rect x="65%" y="10%" width="32%" height="80%" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
              <text x="67%" y="16%" fill="#475569" fontSize="10" fontFamily="sans-serif" fontWeight="700">
                FABRICATION HALL
              </text>
              <rect x="3%" y="20%" width="24%" height="68%" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
              <text x="5%" y="26%" fill="#475569" fontSize="10" fontFamily="sans-serif" fontWeight="700">
                CNC PLATE WAREHOUSE
              </text>
            </svg>

            {/* Asset markers in Split view */}
            {cranes.map((crane) => (
              <div
                key={crane.id}
                onClick={() => onSelectAsset(crane)}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: `${crane.gridX}%`, top: `${crane.gridY}%` }}
              >
                <div className="px-2 py-1 bg-white border border-indigo-500 rounded text-[9px] font-mono font-bold text-indigo-900 shadow-md">
                  {crane.code}
                </div>
              </div>
            ))}
            {weldingBays.map((bay) => (
              <div
                key={bay.id}
                onClick={() => onSelectAsset(bay)}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: `${bay.gridX}%`, top: `${bay.gridY}%` }}
              >
                <div className="px-1.5 py-0.5 bg-white border border-amber-500 rounded text-[9px] font-mono font-bold text-amber-900 shadow-md">
                  {bay.code}
                </div>
              </div>
            ))}
            {cncCutters.map((cnc) => (
              <div
                key={cnc.id}
                onClick={() => onSelectAsset(cnc)}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: `${cnc.gridX}%`, top: `${cnc.gridY}%` }}
              >
                <div className="px-1.5 py-0.5 bg-white border border-indigo-400 rounded text-[9px] font-mono font-bold text-indigo-900 shadow-md">
                  {cnc.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'schematic' && (
        /* Main Interactive Map Canvas */
        <div className="relative w-full h-[460px] lg:h-[520px] bg-[#F8FAFC] rounded-xl border border-slate-200 overflow-hidden select-none shadow-inner">
          {/* Top GPS Coordinate Banner */}
          {showGpsGrid && (
            <div className="absolute top-2 left-2 z-10 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[10px] font-mono border border-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>RTK-GPS FIXED: WGS84 ORIGIN [37.788251° N, 122.387214° W]</span>
            </div>
          )}

          {/* Yard Background Layout (SVG Grid & Interactive Zones) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="yardGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
              </pattern>
              {/* Heatmap Gradient Overlay */}
              <radialGradient id="heat1" cx="42%" cy="28%" r="22%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#ef4444" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heat2" cx="68%" cy="54%" r="18%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#ef4444" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#yardGrid)" />

            {/* Optional WGS84 Coordinate Grid Lines */}
            {showGpsGrid && (
              <g opacity="0.65">
                {/* Latitude Lines */}
                <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#059669" strokeWidth="1" strokeDasharray="4 4" />
                <text x="8" y="24%" fill="#059669" fontSize="9" fontFamily="monospace" fontWeight="600">37.789200° N</text>

                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#059669" strokeWidth="1" strokeDasharray="4 4" />
                <text x="8" y="49%" fill="#059669" fontSize="9" fontFamily="monospace" fontWeight="600">37.788250° N</text>

                <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#059669" strokeWidth="1" strokeDasharray="4 4" />
                <text x="8" y="74%" fill="#059669" fontSize="9" fontFamily="monospace" fontWeight="600">37.787300° N</text>

                {/* Longitude Lines */}
                <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#059669" strokeWidth="1" strokeDasharray="4 4" />
                <text x="25.5%" y="98%" fill="#059669" fontSize="9" fontFamily="monospace" fontWeight="600">122.388800° W</text>

                <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#059669" strokeWidth="1" strokeDasharray="4 4" />
                <text x="60.5%" y="98%" fill="#059669" fontSize="9" fontFamily="monospace" fontWeight="600">122.386800° W</text>

                <line x1="85%" y1="0" x2="85%" y2="100%" stroke="#059669" strokeWidth="1" strokeDasharray="4 4" />
                <text x="85.5%" y="98%" fill="#059669" fontSize="9" fontFamily="monospace" fontWeight="600">122.385200° W</text>
              </g>
            )}

            {/* Zones */}
            {/* Dry Dock 01 */}
            <rect x="30%" y="10%" width="32%" height="45%" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="5 3" />
            <text x="32%" y="16%" fill="#475569" fontSize="11" fontFamily="sans-serif" fontWeight="700">
              DRY DOCK 01 (600T GOLIATH CRANEWAY)
            </text>
            {/* Ship Vessel Hull Skeleton in Dry Dock */}
            <path d="M 330 80 Q 420 50 490 80 L 480 220 Q 420 230 330 220 Z" fill="#e2e8f0" fillOpacity="0.7" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Heavy Hull Block Fabrication Bay */}
            <rect x="65%" y="10%" width="32%" height="80%" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x="67%" y="16%" fill="#475569" fontSize="11" fontFamily="sans-serif" fontWeight="700">
              FABRICATION & WELDING HALL
            </text>

            {/* CNC Plate Cutting Bay */}
            <rect x="3%" y="20%" width="24%" height="68%" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x="5%" y="26%" fill="#475569" fontSize="11" fontFamily="sans-serif" fontWeight="700">
              CNC PLATE PROCESSING
            </text>

            {/* Outfitting Quay Pier 3 (Bottom Left) */}
            <rect x="18%" y="65%" width="22%" height="28%" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="20%" y="71%" fill="#475569" fontSize="11" fontFamily="sans-serif" fontWeight="700">
              PIER 03 OUTFITTING
            </text>

            {/* Heatmap Circles if active */}
            {showHeatmap && (
              <>
                <circle cx="42%" cy="28%" r="22%" fill="url(#heat1)" />
                <circle cx="68%" cy="54%" r="18%" fill="url(#heat2)" />
              </>
            )}
          </svg>

          {/* UWB Tracked Hull Blocks & Transporter Tags */}
          {showUwbHullTags && (
            <>
              <div 
                className="absolute px-2 py-1 rounded bg-purple-100 border border-purple-300 text-purple-900 text-[9px] font-mono font-bold flex items-center gap-1 shadow-xs pointer-events-auto cursor-help"
                style={{ left: '46%', top: '24%' }}
                title="UWB Tag: HULL-BLOCK-SEC-04 | GPS: 37.788190°N, 122.387110°W | Weight: 418.5T | Position: In Crane Sling"
              >
                <Navigation className="w-2.5 h-2.5 text-purple-600 rotate-45" />
                <span>BLOCK-04 (418.5T)</span>
              </div>
              <div 
                className="absolute px-2 py-1 rounded bg-purple-100 border border-purple-300 text-purple-900 text-[9px] font-mono font-bold flex items-center gap-1 shadow-xs pointer-events-auto cursor-help"
                style={{ left: '72%', top: '48%' }}
                title="UWB Tag: HULL-MODULE-M2 | GPS: 37.787580°N, 122.385720°W | Weight: 134T | Staging Stanchion B14"
              >
                <Navigation className="w-2.5 h-2.5 text-purple-600 rotate-45" />
                <span>MODULE-M2 (134T)</span>
              </div>
            </>
          )}

          {/* Heavy Crane Markers */}
          {cranes.map((crane) => {
            const isSelected = selectedAssetId === crane.id;
            const isBreach = crane.proximityDistanceMeters < 3.5;

            return (
              <div
                key={crane.id}
                onClick={() => onSelectAsset(crane)}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group transition-all z-20"
                style={{ left: `${crane.gridX}%`, top: `${crane.gridY}%` }}
              >
                {/* LiDAR Safety Bubble Radius */}
                {showLidarSafetyBubbles && (
                  <div
                    className={`absolute rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                      isBreach
                        ? 'w-24 h-24 bg-rose-500/20 border-2 border-rose-500 animate-ping'
                        : 'w-20 h-20 bg-indigo-500/10 border border-indigo-400/40'
                    }`}
                    style={{ left: '50%', top: '50%' }}
                  />
                )}

                {/* Crane Pin Icon Box */}
                <div
                  className={`relative px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 ring-4 ring-indigo-200 scale-110'
                      : isBreach
                      ? 'bg-rose-50 text-rose-900 border-rose-400 shadow-rose-200'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-indigo-500 hover:shadow-lg'
                  }`}
                >
                  <Anchor className={`w-4 h-4 ${isSelected ? 'text-white' : isBreach ? 'text-rose-600 animate-bounce' : 'text-indigo-600'}`} />
                  <div className="text-left font-mono">
                    <div className="text-[11px] font-bold leading-tight">{crane.code}</div>
                    <div className="text-[9px] opacity-80 leading-tight">
                      {crane.currentLoadTons}T / {crane.safeWorkingLimitTons}T
                    </div>
                  </div>

                  {isBreach && (
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping absolute -top-1 -right-1" />
                  )}
                </div>

                {/* Hover Tooltip with GPS Data */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1.5 w-56 bg-slate-900 text-white rounded-lg p-2.5 text-[10px] shadow-xl hidden group-hover:block z-30 pointer-events-none">
                  <div className="font-bold text-white text-xs">{crane.name}</div>
                  <div className="text-emerald-400 font-mono text-[9px] mt-0.5">
                    📍 GPS: {crane.gps.formatted}
                  </div>
                  <div className="text-slate-300">Alt: {crane.gps.altitudeMeters}m | HDOP: {crane.gps.hdopPrecision}</div>
                  <div className="text-slate-300 mt-1">Load: {crane.loadPercentage}% SWL ({crane.currentLoadTons}T)</div>
                  <div className={isBreach ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                    LiDAR Clearance: {crane.proximityDistanceMeters}m ({crane.proximityStatus})
                  </div>
                  <div className="text-indigo-300">Strain: {crane.structuralStrainMicrostrain} µε | Vib: {crane.gearboxVibrationScore} mm/s</div>
                  <div className="text-emerald-400 mt-1 font-semibold">Click to open full diagnostics</div>
                </div>
              </div>
            );
          })}

          {/* Welding Bay Markers */}
          {weldingBays.map((bay) => {
            const isSelected = selectedAssetId === bay.id;
            const hasDefect = bay.status === 'warning';

            return (
              <div
                key={bay.id}
                onClick={() => onSelectAsset(bay)}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group transition-all z-20"
                style={{ left: `${bay.gridX}%`, top: `${bay.gridY}%` }}
              >
                <div
                  className={`relative px-2 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md border transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-600 ring-4 ring-amber-200 scale-110'
                      : hasDefect
                      ? 'bg-amber-50 text-amber-900 border-amber-400'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-amber-500 hover:shadow-lg'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : hasDefect ? 'text-amber-600 animate-pulse' : 'text-amber-500'}`} />
                  <div className="text-left font-mono">
                    <div className="text-[10px] font-bold leading-tight">{bay.code}</div>
                    <div className="text-[9px] opacity-80 leading-tight">
                      {bay.liveVoltage}V | {bay.liveCurrent}A
                    </div>
                  </div>

                  {/* Arc Active Glow */}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping absolute -top-0.5 -right-0.5" />
                </div>

                {/* Hover Tooltip with GPS Data */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1.5 w-56 bg-slate-900 text-white rounded-lg p-2.5 text-[10px] shadow-xl hidden group-hover:block z-30 pointer-events-none">
                  <div className="font-bold text-white text-xs">{bay.name}</div>
                  <div className="text-emerald-400 font-mono text-[9px] mt-0.5">
                    📍 GPS: {bay.gps.formatted}
                  </div>
                  <div className="text-slate-300">Operator: {bay.operator.split(' ')[0]}</div>
                  <div className="text-amber-300">WPS Compliance: {bay.wpsCompliancePercentage}%</div>
                  <div className="text-emerald-300">AQI PM2.5: {bay.bayAqiPm25} µg/m³ | Hood: {bay.fumeHoodRpm} RPM</div>
                  <div className="text-emerald-400 mt-1 font-semibold">Click to open full diagnostics</div>
                </div>
              </div>
            );
          })}

          {/* CNC Cutter Markers */}
          {cncCutters.map((cnc) => {
            const isSelected = selectedAssetId === cnc.id;
            const isFault = cnc.status === 'warning' || cnc.isLeakingGas;

            return (
              <div
                key={cnc.id}
                onClick={() => onSelectAsset(cnc)}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group transition-all z-20"
                style={{ left: `${cnc.gridX}%`, top: `${cnc.gridY}%` }}
              >
                <div
                  className={`relative px-2 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 ring-4 ring-indigo-200 scale-110'
                      : isFault
                      ? 'bg-orange-50 text-orange-900 border-orange-400'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-indigo-500 hover:shadow-lg'
                  }`}
                >
                  <Cpu className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : isFault ? 'text-orange-600' : 'text-indigo-600'}`} />
                  <div className="text-left font-mono">
                    <div className="text-[10px] font-bold leading-tight">{cnc.code}</div>
                    <div className="text-[9px] opacity-80 leading-tight">
                      OEE: {cnc.oeeScore}%
                    </div>
                  </div>

                  {cnc.machineState === 'cutting' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse absolute -top-0.5 -right-0.5" />
                  )}
                </div>

                {/* Hover Tooltip with GPS Data */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1.5 w-56 bg-slate-900 text-white rounded-lg p-2.5 text-[10px] shadow-xl hidden group-hover:block z-30 pointer-events-none">
                  <div className="font-bold text-white text-xs">{cnc.name}</div>
                  <div className="text-emerald-400 font-mono text-[9px] mt-0.5">
                    📍 GPS: {cnc.gps.formatted}
                  </div>
                  <div className="text-slate-300">State: {cnc.machineState.toUpperCase()} | OEE: {cnc.oeeScore}%</div>
                  {cnc.isLeakingGas && (
                    <div className="text-rose-400 font-bold">Idle Gas Leak: {cnc.leakRateEstimate} L/m</div>
                  )}
                  <div className="text-indigo-300">Nozzle Wear: {cnc.nozzleWearPercentage}% ({cnc.nozzleEstimatedHoursRemaining}h left)</div>
                  <div className="text-emerald-400 mt-1 font-semibold">Click to open full diagnostics</div>
                </div>
              </div>
            );
          })}

          {/* Legend Overlay at Bottom Right */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-2.5 text-[11px] font-mono text-slate-700 shadow-md flex items-center gap-3.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block" />
              <span className="font-semibold">Heavy Cranes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
              <span className="font-semibold">Welding Bays</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-400 inline-block" />
              <span className="font-semibold">Legacy CNC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block animate-ping" />
              <span className="text-rose-700 font-bold">Hazard Alert</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
