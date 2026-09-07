import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Radio, 
  Layers, 
  Anchor, 
  Flame, 
  Cpu, 
  MapPin, 
  Zap, 
  Activity, 
  Sparkles, 
  RefreshCw, 
  Wifi, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Filter,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { HeavyCraneAsset, WeldingBayAsset, CncCutterAsset } from '../types/dashboard';

interface LiveTelemetryStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  cranes: HeavyCraneAsset[];
  weldingBays: WeldingBayAsset[];
  cncCutters: CncCutterAsset[];
  initialAssetId?: string;
}

export type StreamFilterType = 'all' | 'cranes' | 'welding' | 'cnc' | 'gps_spatial';

export const LiveTelemetryStreamModal: React.FC<LiveTelemetryStreamModalProps> = ({
  isOpen,
  onClose,
  cranes,
  weldingBays,
  cncCutters,
  initialAssetId,
}) => {
  const [filterType, setFilterType] = useState<StreamFilterType>('all');
  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAssetId || 'all');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamRateHz, setStreamRateHz] = useState<number>(1); // 1Hz, 2Hz, 5Hz
  const [viewMode, setViewMode] = useState<'formatted' | 'raw_stream'>('formatted');
  const [copied, setCopied] = useState<boolean>(false);
  const [packetCount, setPacketCount] = useState<number>(14280);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [streamLogs, setStreamLogs] = useState<Array<{
    id: string;
    timestamp: string;
    topic: string;
    qos: number;
    bytes: number;
    payload: any;
  }>>([]);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Sync initialAssetId when opened
  useEffect(() => {
    if (initialAssetId) {
      setSelectedAssetId(initialAssetId);
      if (cranes.some((c) => c.id === initialAssetId)) setFilterType('cranes');
      else if (weldingBays.some((w) => w.id === initialAssetId)) setFilterType('welding');
      else if (cncCutters.some((n) => n.id === initialAssetId)) setFilterType('cnc');
    }
  }, [initialAssetId]);

  // Construct structured telemetry JSON payload for an asset
  const buildAssetTelemetryJson = (asset: HeavyCraneAsset | WeldingBayAsset | CncCutterAsset) => {
    const now = new Date();
    const timestampIso = now.toISOString();

    const baseHeader = {
      protocol: 'MQTT_V5_OVER_TLS',
      broker: 'mqtts://edge-gateway.shipyardpulse.internal:8883',
      qos: 1,
      retain: false,
      timestamp_utc: timestampIso,
      timestamp_unix_ms: now.getTime(),
      edge_node_id: `GW-EDGE-NODE-${asset.code}`,
      signal_rssi_dbm: -54 - Math.floor(Math.random() * 8),
      packet_seq: packetCount + Math.floor(Math.random() * 5),
    };

    const gpsGeospatial = {
      wgs84_latitude: asset.gps.latitude,
      wgs84_longitude: asset.gps.longitude,
      formatted_dms: asset.gps.formatted,
      altitude_msl_meters: asset.gps.altitudeMeters,
      hdop_precision_rating: asset.gps.hdopPrecision,
      rtk_fix_status: 'RTK_DUAL_BAND_FIXED_SUB_CENTIMETER',
      satellites_locked: asset.gps.satellites || 16,
      heading_true_north_deg: asset.gps.headingDegrees || 84,
      yard_local_grid: {
        x_pct: asset.gridX,
        y_pct: asset.gridY,
        sector: asset.location,
      },
    };

    if (asset.category === 'crane') {
      const crane = asset as HeavyCraneAsset;
      return {
        topic: `shipyard/cranes/${crane.code}/telemetry`,
        metadata: baseHeader,
        asset_identity: {
          id: crane.id,
          code: crane.code,
          name: crane.name,
          category: 'HEAVY_GANTRY_CRANE',
          model: crane.model,
          location: crane.location,
          status: crane.status.toUpperCase(),
        },
        gps_geospatial: gpsGeospatial,
        telemetry: {
          load_safety: {
            safe_working_limit_tons: crane.safeWorkingLimitTons,
            hook_load_tons: crane.currentLoadTons,
            swl_load_utilization_pct: crane.loadPercentage,
            overload_threshold_alarm: crane.loadPercentage >= 90,
            today_cumulative_lifts: crane.todayLiftsCount,
          },
          lidar_anti_collision: {
            safety_bubble_status: crane.proximityStatus.toUpperCase(),
            nearest_obstacle_distance_meters: crane.proximityDistanceMeters,
            nearest_obstacle_identifier: crane.nearestObstacle,
            lidar_sensor_ok: crane.boltOnSensors.lidar,
          },
          structural_health: {
            strain_gauge_microstrain: crane.structuralStrainMicrostrain,
            unit: 'µε',
            allowable_fatigue_limit: 1200,
            strain_baseline_zero_offset: 320,
          },
          gearbox_vibration_fft: {
            overall_rms_velocity_mms: crane.gearboxVibrationScore,
            iso_10816_health_zone: crane.gearboxHealthRating.toUpperCase(),
            dominant_peaks_hz: crane.vibrationFrequencies,
          },
          electrical_power: {
            active_power_draw_kw: crane.powerDrawKw,
            frequency_hz: 59.98,
          },
          bolt_on_sensor_health: crane.boltOnSensors,
        },
      };
    }

    if (asset.category === 'welding') {
      const weld = asset as WeldingBayAsset;
      return {
        topic: `shipyard/welding/${weld.code}/arc_sensors`,
        metadata: baseHeader,
        asset_identity: {
          id: weld.id,
          code: weld.code,
          name: weld.name,
          category: 'MANUAL_WELDING_BAY',
          operator_name: weld.operator,
          wps_qualification: weld.wpsSpec,
          location: weld.location,
          status: weld.status.toUpperCase(),
        },
        gps_geospatial: gpsGeospatial,
        telemetry: {
          arc_electrical_waveform: {
            arc_voltage_volts: weld.liveVoltage,
            target_voltage_range_v: [weld.targetVoltageMin, weld.targetVoltageMax],
            arc_current_amperes: weld.liveCurrent,
            target_current_range_a: [weld.targetCurrentMin, weld.targetCurrentMax],
            wps_compliance_score_pct: weld.wpsCompliancePercentage,
            waveform_stability_index: weld.waveformStability,
          },
          process_efficiency: {
            arc_on_duty_cycle_pct: weld.arcOnTimePercentage,
            shift_target_duty_cycle_pct: 65.0,
            wire_feed_speed_mpm: weld.wireFeedSpeedMpm,
            wire_consumed_kg_today: weld.wireConsumedKgToday,
            gas_consumed_m3_today: weld.gasConsumedCubicMetersToday,
          },
          gas_and_environment: {
            shielding_gas_flow_lpm: weld.shieldingGasFlowLpm,
            bay_aqi_pm25_ug_m3: weld.bayAqiPm25,
            bay_voc_ppm: weld.bayVocPpm,
            smart_fume_hood_rpm: weld.fumeHoodRpm,
            fume_auto_boost_engaged: weld.fumeHoodAutoBoost,
          },
          ai_defect_prediction: {
            defect_probability_pct: weld.defectProbabilityScore,
            active_defect_flags: weld.recentDefectsFlagged,
          },
          electrical_power: {
            active_power_draw_kw: weld.powerDrawKw,
          },
          bolt_on_sensor_health: weld.boltOnSensors,
        },
      };
    }

    // CNC Cutter
    const cnc = asset as CncCutterAsset;
    return {
      topic: `shipyard/cnc/${cnc.code}/ocr_edge`,
      metadata: baseHeader,
      asset_identity: {
        id: cnc.id,
        code: cnc.code,
        name: cnc.name,
        category: 'LEGACY_CNC_GANTRY_CUTTER',
        controller_brand: cnc.brandAndAge,
        location: cnc.location,
        status: cnc.status.toUpperCase(),
      },
      gps_geospatial: gpsGeospatial,
      telemetry: {
        machine_state: {
          current_state: cnc.machineState.toUpperCase(),
          oee_overall_effectiveness_pct: cnc.oeeScore,
          oee_breakdown: {
            availability_pct: cnc.oeeAvailability,
            performance_pct: cnc.oeePerformance,
            quality_pct: cnc.oeeQuality,
          },
          cutting_feedrate_mpm: cnc.cuttingSpeedMpm,
        },
        gas_manifold_telemetry: {
          inline_flow_meter_scmh: cnc.gasFlowScmh,
          manifold_pressure_bar: cnc.gasPressureBar,
          idle_gas_leak_detected: cnc.isLeakingGas,
          leak_rate_estimate_lpm: cnc.leakRateEstimate,
        },
        consumables_and_wear: {
          nozzle_orifice_wear_pct: cnc.nozzleWearPercentage,
          estimated_torch_life_hours_left: cnc.nozzleEstimatedHoursRemaining,
        },
        ocr_camera_screen_scraping: {
          camera_active: cnc.boltOnSensors.ocrCrtCamera,
          active_nc_program: cnc.activeProgram,
          plate_material_spec: cnc.plateMaterial,
          plate_thickness_mm: cnc.plateThicknessMm,
          recent_ocr_log_frames: cnc.ocrTerminalFeed.slice(-3),
        },
        electrical_power: {
          active_power_draw_kw: cnc.powerDrawKw,
        },
        bolt_on_sensor_health: cnc.boltOnSensors,
      },
    };
  };

  // Pre-seed initial telemetry packets when modal opens if buffer is empty
  useEffect(() => {
    if (isOpen && streamLogs.length === 0) {
      const sampleAssets = [cranes[0], weldingBays[0], cncCutters[0], cranes[1] || cranes[0]].filter(Boolean);
      const initialPackets = sampleAssets.map((asset, idx) => {
        const payload = buildAssetTelemetryJson(asset);
        return {
          id: `pkt-init-${Date.now()}-${idx}`,
          timestamp: new Date(Date.now() - (sampleAssets.length - idx) * 1200).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + Math.floor(Math.random() * 900 + 100),
          topic: payload.topic,
          qos: 1,
          bytes: new Blob([JSON.stringify(payload)]).size,
          payload,
        };
      });
      setStreamLogs(initialPackets);
    }
  }, [isOpen]);

  // Single-click filter selection handler: updates filter and immediately emits matching packet
  const handleSelectFilterType = (newFilter: StreamFilterType) => {
    setFilterType(newFilter);

    let targetAsset: HeavyCraneAsset | WeldingBayAsset | CncCutterAsset = cranes[0];
    if (newFilter === 'cranes') {
      targetAsset = cranes[0];
      if (selectedAssetId !== 'all' && !cranes.some((c) => c.id === selectedAssetId)) {
        setSelectedAssetId('all');
      }
    } else if (newFilter === 'welding') {
      targetAsset = weldingBays[0];
      if (selectedAssetId !== 'all' && !weldingBays.some((w) => w.id === selectedAssetId)) {
        setSelectedAssetId('all');
      }
    } else if (newFilter === 'cnc') {
      targetAsset = cncCutters[0];
      if (selectedAssetId !== 'all' && !cncCutters.some((n) => n.id === selectedAssetId)) {
        setSelectedAssetId('all');
      }
    } else if (newFilter === 'gps_spatial') {
      targetAsset = cranes[0];
      setSelectedAssetId('all');
    } else {
      setSelectedAssetId('all');
    }

    // Immediately push a fresh telemetry packet for this category so NDJSON & Inspector update without delay
    const payload = buildAssetTelemetryJson(targetAsset);
    const newLog = {
      id: `pkt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + Math.floor(Math.random() * 900 + 100),
      topic: payload.topic,
      qos: 1,
      bytes: new Blob([JSON.stringify(payload)]).size,
      payload,
    };

    setPacketCount((prev) => prev + 1);
    setStreamLogs((prev) => [...prev.slice(-49), newLog]);
  };

  // Node selector change handler
  const handleSelectAssetNode = (assetId: string) => {
    setSelectedAssetId(assetId);
    if (assetId === 'all') return;

    const allAssets = [...cranes, ...weldingBays, ...cncCutters];
    const asset = allAssets.find((a) => a.id === assetId);
    if (asset) {
      if (asset.category === 'crane') setFilterType('cranes');
      else if (asset.category === 'welding') setFilterType('welding');
      else if (asset.category === 'cnc') setFilterType('cnc');

      const payload = buildAssetTelemetryJson(asset);
      const newLog = {
        id: `pkt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + Math.floor(Math.random() * 900 + 100),
        topic: payload.topic,
        qos: 1,
        bytes: new Blob([JSON.stringify(payload)]).size,
        payload,
      };
      setPacketCount((prev) => prev + 1);
      setStreamLogs((prev) => [...prev.slice(-49), newLog]);
    }
  };

  // Generate stream logs continuously when isStreaming
  useEffect(() => {
    if (!isOpen || !isStreaming) return;

    const intervalMs = Math.round(1000 / streamRateHz);

    const streamInterval = setInterval(() => {
      // Pick asset based on filters
      let eligibleAssets: Array<HeavyCraneAsset | WeldingBayAsset | CncCutterAsset> = [];

      if (selectedAssetId !== 'all') {
        const target = [...cranes, ...weldingBays, ...cncCutters].find((a) => a.id === selectedAssetId);
        if (target) eligibleAssets = [target];
      } else {
        if (filterType === 'all') {
          eligibleAssets = [...cranes, ...weldingBays, ...cncCutters];
        } else if (filterType === 'cranes') {
          eligibleAssets = cranes;
        } else if (filterType === 'welding') {
          eligibleAssets = weldingBays;
        } else if (filterType === 'cnc') {
          eligibleAssets = cncCutters;
        } else if (filterType === 'gps_spatial') {
          eligibleAssets = [...cranes, ...weldingBays, ...cncCutters];
        }
      }

      if (eligibleAssets.length === 0) eligibleAssets = cranes;

      // Select one asset
      const randomAsset = eligibleAssets[Math.floor(Math.random() * eligibleAssets.length)];
      const payload = buildAssetTelemetryJson(randomAsset);
      const payloadStr = JSON.stringify(payload);
      const bytes = new Blob([payloadStr]).size;

      const newLog = {
        id: `pkt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + Math.floor(Math.random() * 900 + 100),
        topic: payload.topic,
        qos: 1,
        bytes,
        payload,
      };

      setPacketCount((prev) => prev + 1);
      setStreamLogs((prev) => {
        const next = [...prev, newLog];
        if (next.length > 50) return next.slice(next.length - 50);
        return next;
      });
    }, intervalMs);

    return () => clearInterval(streamInterval);
  }, [isOpen, isStreaming, streamRateHz, filterType, selectedAssetId, cranes, weldingBays, cncCutters]);

  // Auto-scroll terminal in raw_stream view
  useEffect(() => {
    if (autoScroll && viewMode === 'raw_stream' && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamLogs, autoScroll, viewMode]);

  // Current active payload for structured formatted inspector (reactive to filterType and selectedAssetId)
  const activeFormattedPayload = useMemo(() => {
    const allAssets = [...cranes, ...weldingBays, ...cncCutters];

    if (selectedAssetId !== 'all') {
      const specificAsset = allAssets.find((a) => a.id === selectedAssetId);
      if (specificAsset) {
        const matchingLog = [...streamLogs].reverse().find((l) => l.payload?.asset_identity?.id === selectedAssetId);
        return matchingLog ? matchingLog.payload : buildAssetTelemetryJson(specificAsset);
      }
    }

    if (filterType === 'cranes') {
      const matchingLog = [...streamLogs].reverse().find((l) => l.payload?.asset_identity?.category === 'HEAVY_GANTRY_CRANE' || l.topic?.includes('cranes'));
      return matchingLog ? matchingLog.payload : buildAssetTelemetryJson(cranes[0]);
    }

    if (filterType === 'welding') {
      const matchingLog = [...streamLogs].reverse().find((l) => l.payload?.asset_identity?.category === 'MANUAL_WELDING_BAY' || l.topic?.includes('welding'));
      return matchingLog ? matchingLog.payload : buildAssetTelemetryJson(weldingBays[0]);
    }

    if (filterType === 'cnc') {
      const matchingLog = [...streamLogs].reverse().find((l) => l.payload?.asset_identity?.category === 'LEGACY_CNC_GANTRY_CUTTER' || l.topic?.includes('cnc'));
      return matchingLog ? matchingLog.payload : buildAssetTelemetryJson(cncCutters[0]);
    }

    // 'all' or 'gps_spatial' -> latest log or first crane
    return streamLogs.length > 0 ? streamLogs[streamLogs.length - 1].payload : buildAssetTelemetryJson(cranes[0]);
  }, [selectedAssetId, filterType, streamLogs, cranes, weldingBays, cncCutters]);

  // Filtered logs for NDJSON stream feed
  const filteredLogs = useMemo(() => {
    return streamLogs.filter((log) => {
      if (selectedAssetId !== 'all') {
        return log.payload?.asset_identity?.id === selectedAssetId;
      }
      if (filterType === 'cranes') {
        return log.payload?.asset_identity?.category === 'HEAVY_GANTRY_CRANE' || log.topic?.includes('cranes');
      }
      if (filterType === 'welding') {
        return log.payload?.asset_identity?.category === 'MANUAL_WELDING_BAY' || log.topic?.includes('welding');
      }
      if (filterType === 'cnc') {
        return log.payload?.asset_identity?.category === 'LEGACY_CNC_GANTRY_CUTTER' || log.topic?.includes('cnc');
      }
      return true;
    });
  }, [streamLogs, selectedAssetId, filterType]);

  const handleCopyJson = () => {
    const textToCopy = viewMode === 'formatted' 
      ? JSON.stringify(activeFormattedPayload, null, 2)
      : filteredLogs.map((l) => JSON.stringify(l)).join('\n');
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(
      viewMode === 'formatted' ? activeFormattedPayload : filteredLogs,
      null,
      2
    ));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `shipyard-telemetry-stream-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-hidden ${
        isMaximized ? 'p-0' : 'p-2 sm:p-4 md:p-6'
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`bg-[#0F172A] border border-slate-700/80 shadow-2xl flex flex-col text-slate-200 transition-all duration-150 ${
          isMaximized 
            ? 'w-full h-full rounded-none border-none' 
            : 'w-full max-w-5xl h-[94vh] sm:h-[88vh] rounded-2xl overflow-hidden'
        }`}
      >
        {/* Modal Header (Fixed, Non-collapsing) */}
        <div className="shrink-0 p-3 sm:p-4 border-b border-slate-800 bg-[#0B1120] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-xs">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-emerald-950/80 text-emerald-400 rounded border border-emerald-800/80 font-bold flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE STREAMING JSON
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  MQTT v5 / TLS 1.3
                </span>
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate mt-0.5">
                Live IIoT Telemetry & RTK-GPS Data Stream
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Stream Play/Pause Toggle */}
            <button
              type="button"
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 touch-manipulation cursor-pointer ${
                isStreaming
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                  : 'bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30'
              }`}
              title={isStreaming ? 'Pause streaming simulation' : 'Resume live stream'}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">{streamRateHz}Hz</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">PAUSED</span>
                </>
              )}
            </button>

            {/* Maximize / Fullscreen toggle for mobile/tablets */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation cursor-pointer"
              title={isMaximized ? 'Exit full screen' : 'Expand full screen'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation cursor-pointer"
              title="Close Stream Inspector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Broker & RTK-GPS Status Banner (Horizontally scrollable on mobile) */}
        <div className="shrink-0 bg-[#131E35] border-b border-slate-800/80 px-3 py-1.5 text-[10px] sm:text-[11px] font-mono flex items-center justify-between gap-3 text-slate-400 overflow-x-auto whitespace-nowrap no-scrollbar touch-pan-x">
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <span className="flex items-center gap-1 text-emerald-400">
              <Wifi className="w-3 h-3" />
              <span>BROKER: <strong className="text-slate-200">mqtts://edge-gateway.shipyardpulse.internal:8883</strong></span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-indigo-300">
              <MapPin className="w-3 h-3 text-indigo-400" />
              <span>RTK-GPS: <strong className="text-emerald-400">FIXED (HDOP 0.65 / ±18mm)</strong></span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">QoS: <strong className="text-white">1</strong></span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span>PACKETS: <strong className="text-emerald-400">{packetCount.toLocaleString()}</strong></span>
            <span className="text-slate-600">|</span>
            <span>LATENCY: <strong className="text-white">8ms</strong></span>
          </div>
        </div>

        {/* Filter Bar: Single-Click Responsive Filters + Node Select */}
        <div className="shrink-0 p-2 sm:p-3 bg-[#0F172A] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          {/* Stream Filter Buttons Strip (Horizontally swipeable on phone/tablet) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap no-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0 touch-pan-x">
            {/* All Streams */}
            <button
              type="button"
              onClick={() => handleSelectFilterType('all')}
              className={`shrink-0 whitespace-nowrap min-h-[34px] sm:min-h-[30px] px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all active:scale-95 touch-manipulation cursor-pointer flex items-center gap-1.5 ${
                filterType === 'all' && selectedAssetId === 'all'
                  ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/50 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>All Streams ({cranes.length + weldingBays.length + cncCutters.length})</span>
            </button>

            {/* Heavy Cranes */}
            <button
              type="button"
              onClick={() => handleSelectFilterType('cranes')}
              className={`shrink-0 whitespace-nowrap min-h-[34px] sm:min-h-[30px] px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                filterType === 'cranes'
                  ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/50 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Anchor className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
              <span>Heavy Cranes ({cranes.length})</span>
            </button>

            {/* Welding Bays */}
            <button
              type="button"
              onClick={() => handleSelectFilterType('welding')}
              className={`shrink-0 whitespace-nowrap min-h-[34px] sm:min-h-[30px] px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                filterType === 'welding'
                  ? 'bg-amber-600 text-white font-bold ring-2 ring-amber-400/50 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Welding Bays ({weldingBays.length})</span>
            </button>

            {/* CNC Cutters */}
            <button
              type="button"
              onClick={() => handleSelectFilterType('cnc')}
              className={`shrink-0 whitespace-nowrap min-h-[34px] sm:min-h-[30px] px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                filterType === 'cnc'
                  ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400/50 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              <span>CNC Cutters ({cncCutters.length})</span>
            </button>

            {/* RTK-GPS & Spatial */}
            <button
              type="button"
              onClick={() => handleSelectFilterType('gps_spatial')}
              className={`shrink-0 whitespace-nowrap min-h-[34px] sm:min-h-[30px] px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                filterType === 'gps_spatial'
                  ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-400/50 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-purple-300 shrink-0" />
              <span>RTK-GPS & Spatial</span>
            </button>
          </div>

          {/* Asset Dropdown Selector */}
          <div className="flex items-center gap-1.5 text-xs font-mono shrink-0">
            <span className="text-slate-400 text-[11px]">Node:</span>
            <select
              value={selectedAssetId}
              onChange={(e) => handleSelectAssetNode(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">-- All Machine Edge Nodes --</option>
              <optgroup label="Heavy Cranes">
                {cranes.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} ({c.name})</option>
                ))}
              </optgroup>
              <optgroup label="Welding Bays">
                {weldingBays.map((w) => (
                  <option key={w.id} value={w.id}>{w.code} ({w.operator})</option>
                ))}
              </optgroup>
              <optgroup label="CNC Cutters">
                {cncCutters.map((n) => (
                  <option key={n.id} value={n.id}>{n.code} ({n.name})</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* View Mode & Stream Rate Toolbar */}
        <div className="shrink-0 px-3 py-2 bg-[#0B1120] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('formatted')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'formatted'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Structured JSON Inspector
              </button>
              <button
                type="button"
                onClick={() => setViewMode('raw_stream')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'raw_stream'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                NDJSON Stream Feed
              </button>
            </div>

            {viewMode === 'raw_stream' && (
              <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <span>Auto-scroll</span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Rate:</span>
            <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
              {[1, 2, 5].map((hz) => (
                <button
                  key={hz}
                  type="button"
                  onClick={() => setStreamRateHz(hz)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    streamRateHz === hz
                      ? 'bg-slate-700 text-indigo-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {hz} Hz
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer active:scale-95 touch-manipulation"
              title="Copy JSON to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer active:scale-95 touch-manipulation"
              title="Download JSON telemetry stream"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Main Terminal JSON Display Viewport with full mobile touch momentum scrolling */}
        <div 
          ref={viewportRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-auto bg-[#070B14] p-3 sm:p-4 font-mono text-xs leading-relaxed select-text overscroll-contain touch-pan-y focus:outline-none"
        >
          {viewMode === 'formatted' ? (
            <div className="space-y-3 sm:space-y-4">
              {/* Highlight Topic Header */}
              <div className="p-2 sm:p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-emerald-400 font-bold shrink-0">TOPIC:</span>
                  <span className="text-indigo-300 font-bold bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40 truncate">
                    {activeFormattedPayload?.topic || 'shipyard/telemetry/live'}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span>GPS: <strong className="text-emerald-400">{activeFormattedPayload?.gps_geospatial?.formatted_dms || '17°41\'24.8"N 83°17\'38.2"E'}</strong></span>
                  <span className="text-slate-600">|</span>
                  <span>ALT: <strong className="text-white">{activeFormattedPayload?.gps_geospatial?.altitude_msl_meters || 14}m</strong></span>
                </div>
              </div>

              {/* JSON Pre-Tag Container with horizontal & vertical touch scrolling */}
              <div className="bg-[#050810] p-3 sm:p-4 rounded-xl border border-slate-800/90 text-emerald-400 overflow-x-auto shadow-inner overscroll-contain">
                <pre 
                  tabIndex={0}
                  aria-label="Structured Telemetry JSON"
                  className="text-slate-200 font-mono text-[11px] sm:text-xs leading-relaxed select-text whitespace-pre overflow-x-auto focus:outline-none"
                >
                  {JSON.stringify(activeFormattedPayload, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            /* Streaming Raw NDJSON Log View */
            <div className="space-y-1.5">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  Awaiting incoming telemetry packet for selected filter...
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-2 rounded-md bg-slate-900/60 hover:bg-slate-900 border border-slate-800/70 text-[11px] font-mono transition-colors"
                  >
                    <div className="flex items-center justify-between text-slate-400 pb-1 mb-1 border-b border-slate-800/50 flex-wrap gap-1">
                      <span className="text-slate-500">[{log.timestamp}]</span>
                      <span className="text-indigo-400 font-bold truncate max-w-[260px] sm:max-w-none">{log.topic}</span>
                      <span className="text-emerald-500 font-semibold">{log.bytes} B | QoS {log.qos}</span>
                    </div>
                    <div className="text-slate-300 break-all text-[11px]">
                      <span className="text-amber-400 font-bold">📍 GPS:</span>{' '}
                      <span className="text-slate-100">{log.payload.gps_geospatial?.formatted_dms || 'N/A'}</span>{' '}
                      <span className="text-slate-500">|</span>{' '}
                      <span className="text-emerald-400 font-semibold">PAYLOAD:</span>{' '}
                      <span className="text-slate-400">{JSON.stringify(log.payload.telemetry || log.payload)}</span>
                    </div>
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
          )}
        </div>

        {/* Modal Footer Info */}
        <div className="shrink-0 p-2.5 sm:p-3 bg-[#0B1120] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span className="truncate">ISO 9001 / DNV GL Shipyard IIoT Standards Validated</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span>Buffer: <strong className="text-emerald-400">{filteredLogs.length} / 50</strong></span>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={() => setStreamLogs([])}
              className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer active:scale-95 touch-manipulation"
            >
              Clear Buffer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
