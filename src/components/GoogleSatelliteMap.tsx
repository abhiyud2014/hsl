import React, { useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  MapCameraChangedEvent
} from '@vis.gl/react-google-maps';
import { 
  Anchor, 
  Flame, 
  Cpu, 
  MapPin, 
  Layers, 
  Crosshair, 
  Globe, 
  Compass, 
  ExternalLink,
  Navigation,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { HeavyCraneAsset, WeldingBayAsset, CncCutterAsset } from '../types/dashboard';

interface GoogleSatelliteMapProps {
  cranes: HeavyCraneAsset[];
  weldingBays: WeldingBayAsset[];
  cncCutters: CncCutterAsset[];
  onSelectAsset: (asset: HeavyCraneAsset | WeldingBayAsset | CncCutterAsset) => void;
  selectedAssetId?: string;
  className?: string;
}

export const GoogleSatelliteMap: React.FC<GoogleSatelliteMapProps> = ({
  cranes,
  weldingBays,
  cncCutters,
  onSelectAsset,
  selectedAssetId,
  className = "h-[460px] lg:h-[520px]"
}) => {
  const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [activeMapType, setActiveMapType] = useState<'satellite' | 'hybrid' | 'roadmap'>('hybrid');
  const [selectedPinAsset, setSelectedPinAsset] = useState<HeavyCraneAsset | WeldingBayAsset | CncCutterAsset | null>(null);
  const [hoveredCoordinate, setHoveredCoordinate] = useState<{ lat: number; lng: number } | null>(null);

  const effectiveApiKey = envApiKey.trim();

  // Shipyard Central Origin Coordinates (San Francisco Dry Dock / Maritime Yard Hub)
  const defaultCenter = { lat: 37.788251, lng: -122.387214 };
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(18);

  const allAssets = [...cranes, ...weldingBays, ...cncCutters];

  const handleFocusLocation = (lat: number, lng: number, zoom = 19) => {
    setMapCenter({ lat, lng });
    setMapZoom(zoom);
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-xl bg-slate-950 flex flex-col ${className}`}>
      {/* Top Map Control Bar */}
      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Real-time GPS & Satellite Status Pill */}
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono border border-slate-700/80 shadow-lg flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Globe className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '12s' }} />
            <span>WGS84 SATELLITE</span>
          </div>
          <span className="text-slate-600 hidden xs:inline">|</span>
          <span className="text-slate-300 text-[11px] hidden sm:inline">
            37.788251° N, 122.387214° W
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800 hidden xs:inline-block">
            RTK FIXED
          </span>
        </div>

        {/* Map Mode Toggles & Sector Jumper */}
        <div className="flex items-center gap-1 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveMapType('hybrid')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeMapType === 'hybrid'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Hybrid
          </button>
          <button
            onClick={() => setActiveMapType('satellite')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeMapType === 'satellite'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Pure Satellite
          </button>
          <button
            onClick={() => setActiveMapType('roadmap')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap hidden sm:inline-block ${
              activeMapType === 'roadmap'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Vector Map
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Quick Focus Dropdown */}
          <button
            onClick={() => handleFocusLocation(defaultCenter.lat, defaultCenter.lng, 18)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reset view to Shipyard Center"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Google Maps SDK Rendering with APIProvider */}
      {effectiveApiKey ? (
        <APIProvider apiKey={effectiveApiKey}>
          <div className="w-full h-full relative">
            <Map
              mapId="DEMO_MAP_ID"
              center={mapCenter}
              zoom={mapZoom}
              mapTypeId={activeMapType}
              tilt={45}
              gestureHandling="greedy"
              disableDefaultUI={false}
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              style={{ width: '100%', height: '100%' }}
              onCameraChanged={(ev: MapCameraChangedEvent) => {
                setMapCenter(ev.detail.center);
                setMapZoom(ev.detail.zoom);
              }}
            >
              {/* Heavy Cranes Markers */}
              {cranes.map((crane) => {
                const isSelected = selectedAssetId === crane.id;
                const isBreach = crane.proximityDistanceMeters < 3.5;

                return (
                  <AdvancedMarker
                    key={crane.id}
                    position={{ lat: crane.gps.latitude, lng: crane.gps.longitude }}
                    onClick={() => {
                      setSelectedPinAsset(crane);
                      onSelectAsset(crane);
                    }}
                    title={`${crane.code}: ${crane.name}`}
                  >
                    <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-xl border cursor-pointer transition-transform hover:scale-110 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-white ring-4 ring-indigo-400'
                        : isBreach
                        ? 'bg-rose-600 text-white border-rose-300 animate-bounce'
                        : 'bg-slate-900/95 text-indigo-300 border-indigo-500/80'
                    }`}>
                      <Anchor className="w-3.5 h-3.5 text-white" />
                      <div className="text-left font-mono leading-none">
                        <div className="text-[10px] font-bold text-white">{crane.code}</div>
                        <div className="text-[8px] text-slate-300">{crane.currentLoadTons}T ({crane.loadPercentage}%)</div>
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* Welding Bay Markers */}
              {weldingBays.map((bay) => {
                const isSelected = selectedAssetId === bay.id;

                return (
                  <AdvancedMarker
                    key={bay.id}
                    position={{ lat: bay.gps.latitude, lng: bay.gps.longitude }}
                    onClick={() => {
                      setSelectedPinAsset(bay);
                      onSelectAsset(bay);
                    }}
                    title={`${bay.code}: ${bay.name}`}
                  >
                    <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-xl border cursor-pointer transition-transform hover:scale-110 ${
                      isSelected
                        ? 'bg-amber-500 text-white border-white ring-4 ring-amber-300'
                        : 'bg-slate-900/95 text-amber-400 border-amber-500/80'
                    }`}>
                      <Flame className="w-3.5 h-3.5 text-white" />
                      <div className="text-left font-mono leading-none">
                        <div className="text-[10px] font-bold text-white">{bay.code}</div>
                        <div className="text-[8px] text-amber-200">{bay.liveVoltage}V / {bay.liveCurrent}A</div>
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* CNC Cutter Markers */}
              {cncCutters.map((cnc) => {
                const isSelected = selectedAssetId === cnc.id;

                return (
                  <AdvancedMarker
                    key={cnc.id}
                    position={{ lat: cnc.gps.latitude, lng: cnc.gps.longitude }}
                    onClick={() => {
                      setSelectedPinAsset(cnc);
                      onSelectAsset(cnc);
                    }}
                    title={`${cnc.code}: ${cnc.name}`}
                  >
                    <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-xl border cursor-pointer transition-transform hover:scale-110 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-white ring-4 ring-indigo-300'
                        : 'bg-slate-900/95 text-indigo-300 border-indigo-400/80'
                    }`}>
                      <Cpu className="w-3.5 h-3.5 text-white" />
                      <div className="text-left font-mono leading-none">
                        <div className="text-[10px] font-bold text-white">{cnc.code}</div>
                        <div className="text-[8px] text-indigo-200">OEE: {cnc.oeeScore}%</div>
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* Selected Asset Info Window */}
              {selectedPinAsset && (
                <InfoWindow
                  position={{
                    lat: selectedPinAsset.gps.latitude,
                    lng: selectedPinAsset.gps.longitude
                  }}
                  onCloseClick={() => setSelectedPinAsset(null)}
                >
                  <div className="p-2 text-slate-900 font-sans max-w-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">
                        {selectedPinAsset.code}
                      </span>
                      <span className="font-bold text-xs text-slate-900">{selectedPinAsset.name}</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-mono font-semibold">
                      📍 GPS: {selectedPinAsset.gps.formatted}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Altitude: {selectedPinAsset.gps.altitudeMeters}m MSL | HDOP: {selectedPinAsset.gps.hdopPrecision}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Sector: {selectedPinAsset.location} | Power: {selectedPinAsset.powerDrawKw} kW
                    </div>
                    <button
                      onClick={() => onSelectAsset(selectedPinAsset)}
                      className="mt-2 w-full px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold cursor-pointer"
                    >
                      Open Full Asset Inspector
                    </button>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </div>
        </APIProvider>
      ) : (
        /* Dynamic Satellite Imagery & High-Precision GPS Interactive Map Viewport */
        <div className="relative w-full h-full bg-[#0B132B] overflow-hidden">
          {/* Photorealistic Satellite Base Layer (Maritime Bay Area / Dry Dock Shipyard Footprint) */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter brightness-90 contrast-110"
            style={{
              backgroundImage: `radial-gradient(circle at center, rgba(15, 23, 42, 0.45) 0%, rgba(11, 19, 43, 0.85) 100%), url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80')`
            }}
          />

          {/* High-Contrast Vector Hybrid Lines & Dry Dock Overlays */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="satGpsGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.25" strokeDasharray="3 3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#satGpsGrid)" />

            {/* Dry Dock 01 Geofenced Footprint */}
            <rect x="28%" y="14%" width="36%" height="48%" rx="6" fill="#0284c7" fillOpacity="0.12" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 3" />
            <text x="30%" y="20%" fill="#7dd3fc" fontSize="10" fontFamily="monospace" fontWeight="700">
              [GEOFENCE: DRY DOCK 01] 37.78842°N, 122.38715°W
            </text>

            {/* Heavy Hull Fabrication Hall Geofenced Footprint */}
            <rect x="66%" y="12%" width="30%" height="78%" rx="6" fill="#f59e0b" fillOpacity="0.08" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 3" />
            <text x="68%" y="18%" fill="#fde68a" fontSize="10" fontFamily="monospace" fontWeight="700">
              [GEOFENCE: FAB HALL] 37.78760°N, 122.38580°W
            </text>

            {/* CNC Plate Cutting Bay Geofenced Footprint */}
            <rect x="4%" y="22%" width="22%" height="66%" rx="6" fill="#6366f1" fillOpacity="0.08" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="6 3" />
            <text x="6%" y="28%" fill="#c7d2fe" fontSize="10" fontFamily="monospace" fontWeight="700">
              [GEOFENCE: CNC WAREHOUSE]
            </text>

            {/* WGS84 Reference Axis */}
            <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#10b981" strokeWidth="0.75" strokeDasharray="4 4" strokeOpacity="0.4" />
            <text x="8" y="34%" fill="#34d399" fontSize="8" fontFamily="monospace">37.788800° N</text>

            <line x1="0" y1="65%" x2="100%" y2="65%" stroke="#10b981" strokeWidth="0.75" strokeDasharray="4 4" strokeOpacity="0.4" />
            <text x="8" y="64%" fill="#34d399" fontSize="8" fontFamily="monospace">37.787800° N</text>

            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#10b981" strokeWidth="0.75" strokeDasharray="4 4" strokeOpacity="0.4" />
            <text x="50.5%" y="97%" fill="#34d399" fontSize="8" fontFamily="monospace">122.387200° W</text>
          </svg>

          {/* Interactive Heavy Crane Satellite Pins */}
          {cranes.map((crane) => {
            const isSelected = selectedAssetId === crane.id;
            const isBreach = crane.proximityDistanceMeters < 3.5;

            return (
              <div
                key={crane.id}
                onClick={() => {
                  setSelectedPinAsset(crane);
                  onSelectAsset(crane);
                }}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group z-20 transition-transform hover:scale-110"
                style={{ left: `${crane.gridX}%`, top: `${crane.gridY}%` }}
              >
                {/* Radar Ping Ripple */}
                <div className={`absolute rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 ${
                  isBreach 
                    ? 'w-20 h-20 bg-rose-500/30 border-2 border-rose-500 animate-ping' 
                    : 'w-16 h-16 bg-indigo-500/20 border border-indigo-400/50'
                }`} style={{ left: '50%', top: '50%' }} />

                <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xl border transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-white ring-4 ring-indigo-400 scale-110'
                    : isBreach
                    ? 'bg-rose-600 text-white border-rose-300'
                    : 'bg-slate-900/90 text-indigo-200 border-indigo-400 backdrop-blur-md'
                }`}>
                  <Anchor className="w-3.5 h-3.5 text-white flex-shrink-0" />
                  <div className="text-left font-mono">
                    <div className="text-[11px] font-black leading-tight text-white">{crane.code}</div>
                    <div className="text-[9px] text-slate-300 leading-none">{crane.currentLoadTons}T / {crane.safeWorkingLimitTons}T</div>
                  </div>
                </div>

                {/* Hover Satellite GPS Details */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1.5 w-60 bg-slate-900/95 backdrop-blur-md text-white rounded-xl p-3 text-[10px] shadow-2xl hidden group-hover:block z-40 border border-slate-700 pointer-events-none font-mono">
                  <div className="font-bold text-white text-xs">{crane.name}</div>
                  <div className="text-emerald-400 text-[10px] mt-1 font-bold">
                    📍 GPS: {crane.gps.formatted}
                  </div>
                  <div className="text-slate-300">Alt: {crane.gps.altitudeMeters}m | HDOP: {crane.gps.hdopPrecision} ({crane.gps.satellites} Sats)</div>
                  <div className="text-slate-300 mt-1">Load: {crane.loadPercentage}% SWL ({crane.currentLoadTons}T)</div>
                  <div className="text-indigo-300">Strain: {crane.structuralStrainMicrostrain} µε | Clearance: {crane.proximityDistanceMeters}m</div>
                  <div className="text-emerald-400 mt-1.5 font-bold">Click to inspect on satellite telemetry</div>
                </div>
              </div>
            );
          })}

          {/* Interactive Welding Bay Satellite Pins */}
          {weldingBays.map((bay) => {
            const isSelected = selectedAssetId === bay.id;

            return (
              <div
                key={bay.id}
                onClick={() => {
                  setSelectedPinAsset(bay);
                  onSelectAsset(bay);
                }}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group z-20 transition-transform hover:scale-110"
                style={{ left: `${bay.gridX}%`, top: `${bay.gridY}%` }}
              >
                <div className={`px-2 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xl border transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-white border-white ring-4 ring-amber-300 scale-110'
                    : 'bg-slate-900/90 text-amber-300 border-amber-500 backdrop-blur-md'
                }`}>
                  <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-pulse" />
                  <div className="text-left font-mono">
                    <div className="text-[10px] font-bold leading-tight text-white">{bay.code}</div>
                    <div className="text-[8px] text-amber-200 leading-none">{bay.liveVoltage}V | {bay.liveCurrent}A</div>
                  </div>
                </div>

                {/* Hover Satellite GPS Details */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1.5 w-60 bg-slate-900/95 backdrop-blur-md text-white rounded-xl p-3 text-[10px] shadow-2xl hidden group-hover:block z-40 border border-slate-700 pointer-events-none font-mono">
                  <div className="font-bold text-white text-xs">{bay.name}</div>
                  <div className="text-emerald-400 text-[10px] mt-1 font-bold">
                    📍 GPS: {bay.gps.formatted}
                  </div>
                  <div className="text-slate-300">Operator: {bay.operator}</div>
                  <div className="text-amber-300 mt-1">WPS Compliance: {bay.wpsCompliancePercentage}%</div>
                  <div className="text-emerald-400 mt-1.5 font-bold">Click to inspect on satellite telemetry</div>
                </div>
              </div>
            );
          })}

          {/* Interactive CNC Cutter Satellite Pins */}
          {cncCutters.map((cnc) => {
            const isSelected = selectedAssetId === cnc.id;

            return (
              <div
                key={cnc.id}
                onClick={() => {
                  setSelectedPinAsset(cnc);
                  onSelectAsset(cnc);
                }}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group z-20 transition-transform hover:scale-110"
                style={{ left: `${cnc.gridX}%`, top: `${cnc.gridY}%` }}
              >
                <div className={`px-2 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xl border transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-white ring-4 ring-indigo-300 scale-110'
                    : 'bg-slate-900/90 text-indigo-300 border-indigo-400 backdrop-blur-md'
                }`}>
                  <Cpu className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <div className="text-left font-mono">
                    <div className="text-[10px] font-bold leading-tight text-white">{cnc.code}</div>
                    <div className="text-[8px] text-indigo-200 leading-none">OEE: {cnc.oeeScore}%</div>
                  </div>
                </div>

                {/* Hover Satellite GPS Details */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1.5 w-60 bg-slate-900/95 backdrop-blur-md text-white rounded-xl p-3 text-[10px] shadow-2xl hidden group-hover:block z-40 border border-slate-700 pointer-events-none font-mono">
                  <div className="font-bold text-white text-xs">{cnc.name}</div>
                  <div className="text-emerald-400 text-[10px] mt-1 font-bold">
                    📍 GPS: {cnc.gps.formatted}
                  </div>
                  <div className="text-slate-300">Program: {cnc.activeProgram}</div>
                  <div className="text-indigo-300 mt-1">State: {cnc.machineState.toUpperCase()} | OEE: {cnc.oeeScore}%</div>
                  <div className="text-emerald-400 mt-1.5 font-bold">Click to inspect on satellite telemetry</div>
                </div>
              </div>
            );
          })}

          {/* UWB Tracked Hull Blocks on Satellite View */}
          <div 
            className="absolute px-2 py-1 rounded-md bg-purple-950/90 border border-purple-400 text-purple-200 text-[9px] font-mono font-bold flex items-center gap-1 shadow-lg pointer-events-auto cursor-help backdrop-blur-xs"
            style={{ left: '46%', top: '24%' }}
            title="UWB Hull Block: HULL-BLOCK-SEC-04 | 37.788190°N, 122.387110°W | 418.5T"
          >
            <Navigation className="w-2.5 h-2.5 text-purple-400 rotate-45" />
            <span>BLOCK-04 (418.5T)</span>
          </div>

          <div 
            className="absolute px-2 py-1 rounded-md bg-purple-950/90 border border-purple-400 text-purple-200 text-[9px] font-mono font-bold flex items-center gap-1 shadow-lg pointer-events-auto cursor-help backdrop-blur-xs"
            style={{ left: '72%', top: '48%' }}
            title="UWB Hull Module: HULL-MODULE-M2 | 37.787580°N, 122.385720°W | 134T"
          >
            <Navigation className="w-2.5 h-2.5 text-purple-400 rotate-45" />
            <span>MODULE-M2 (134T)</span>
          </div>

          {/* Selected Pin Satellite Inspector Drawer at bottom */}
          {selectedPinAsset && (
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3.5 text-white shadow-2xl z-30 animate-fade-in font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px]">
                    {selectedPinAsset.code}
                  </span>
                  <span className="font-bold text-sm text-white truncate">{selectedPinAsset.name}</span>
                </div>
                <button
                  onClick={() => setSelectedPinAsset(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">GPS Position (WGS84):</span>
                  <span className="text-emerald-400 font-bold">{selectedPinAsset.gps.formatted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Elevation / Precision:</span>
                  <span className="text-slate-200">{selectedPinAsset.gps.altitudeMeters}m MSL (HDOP {selectedPinAsset.gps.hdopPrecision})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sector / Geofence:</span>
                  <span className="text-indigo-300">{selectedPinAsset.location}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectAsset(selectedPinAsset)}
                className="mt-3 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Inspect Telemetry Diagnostics
              </button>
            </div>
          )}
        </div>
      )}

      {/* Satellite Map Footer Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            <span className="text-slate-300 font-semibold">Cranes ({cranes.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="text-slate-300 font-semibold">Bays ({weldingBays.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />
            <span className="text-slate-300 font-semibold">CNC ({cncCutters.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
            <span className="text-slate-300 font-semibold">UWB Tags (2)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-slate-500">Coordinate Datum: WGS84</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-bold">Live GPS Synchronized</span>
        </div>
      </div>
    </div>
  );
};
