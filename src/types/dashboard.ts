export type AssetCategory = 'all' | 'cranes' | 'welding' | 'cnc' | 'work_orders';

export type MachineStatus = 'operating' | 'standby' | 'warning' | 'critical' | 'maintenance';

export type TimeRange = 'live' | 'shift' | 'day' | 'week';

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  formatted: string;
  altitudeMeters: number;
  hdopPrecision: number; // e.g. 0.8 (Horizontal Dilution of Precision - sub-meter RTK)
  headingDegrees?: number;
  satellites?: number;
}

export interface HeavyCraneAsset {
  id: string;
  name: string;
  code: string;
  category: 'crane';
  model: string;
  location: string;
  gps: GpsCoordinates;
  gridX: number; // 0-100% on shipyard map
  gridY: number;
  status: MachineStatus;
  safeWorkingLimitTons: number;
  currentLoadTons: number;
  loadPercentage: number;
  proximityDistanceMeters: number;
  nearestObstacle: string;
  proximityStatus: 'safe' | 'caution' | 'breach';
  gearboxVibrationScore: number; // mm/s RMS (0-10)
  gearboxHealthRating: 'optimal' | 'elevated' | 'critical';
  structuralStrainMicrostrain: number; // 0-1200 µε
  strainHistory: { time: string; strain: number; load: number }[];
  vibrationFrequencies: { freq: string; amplitude: number; baseline: number }[];
  powerDrawKw: number;
  todayLiftsCount: number;
  tandemLift?: {
    isTandemModeActive: boolean;
    partnerCraneName: string;
    megaBlockId: string;
    combinedLoadTons: number;
    hookHeightDeltaMm: number;
    hookHeightStatus: 'synchronized' | 'warning' | 'emergency_trip';
    asymmetricStrainMicrostrain: number;
    cogBalancePct: number;
    hoistSpeedSyncDeltaMpm: number;
  };
  boltOnSensors: {
    lidar: boolean;
    uwbTag: boolean;
    strainGauges: boolean;
    vibrationNode: boolean;
  };
}

export interface WeldingBayAsset {
  id: string;
  name: string;
  code: string;
  category: 'welding';
  operator: string;
  location: string;
  gps: GpsCoordinates;
  gridX: number;
  gridY: number;
  status: MachineStatus;
  wpsSpec: string; // e.g. "WPS-ASME-IX-MIG-04"
  liveVoltage: number; // Volts
  liveCurrent: number; // Amps
  targetVoltageMin: number;
  targetVoltageMax: number;
  targetCurrentMin: number;
  targetCurrentMax: number;
  wpsCompliancePercentage: number;
  arcOnTimePercentage: number; // e.g. 68.4%
  defectProbabilityScore: number; // 0-100% (lower is better)
  shieldingGasFlowLpm: number; // L/min (Argon/CO2)
  wireFeedSpeedMpm: number; // m/min
  wireConsumedKgToday: number;
  gasConsumedCubicMetersToday: number;
  bayAqiPm25: number; // µg/m3
  bayVocPpm: number; // ppm
  fumeHoodRpm: number;
  fumeHoodAutoBoost: boolean;
  waveformStability: number; // 0-100
  recentDefectsFlagged: { id: string; time: string; type: string; severity: 'low' | 'med' | 'high' }[];
  powerDrawKw: number;
  navalSteelGrade?: 'DMR 249A' | 'DMR 249B' | 'EH36' | 'DH36';
  heatInputKjPerMm?: number;
  heatInputStatus?: 'in_spec' | 'high_ndt_required' | 'low_lack_of_fusion';
  interpassTempCelsius?: number;
  ndtRequisitionFlagged?: boolean;
  confinedSpaceAtmosphere?: {
    locationName: string;
    oxygenPct: number;
    oxygenStatus: 'safe' | 'warning' | 'critical';
    argonDisplacementPpm: number;
    hydrocarbonLelPct: number;
    blowerCfm: number;
    blowerInterlockEngaged: boolean;
    certifiedWorkersInside: number;
  };
  boltOnSensors: {
    currentTransformers: boolean;
    visionCamera: boolean;
    aqiSensors: boolean;
    smartHood: boolean;
  };
}

export interface CncCutterAsset {
  id: string;
  name: string;
  code: string;
  category: 'cnc';
  brandAndAge: string;
  location: string;
  gps: GpsCoordinates;
  gridX: number;
  gridY: number;
  machineState: 'cutting' | 'idle' | 'fault' | 'maintenance';
  status: MachineStatus;
  oeeScore: number; // Overall Equipment Effectiveness %
  oeeAvailability: number;
  oeePerformance: number;
  oeeQuality: number;
  cuttingSpeedMpm: number;
  gasPressureBar: number;
  gasFlowScmh: number; // Standard m3/h
  isLeakingGas: boolean;
  leakRateEstimate: number; // L/min leak when idle
  gasLeakEstimatedCostShift?: string;
  gasFlowHistory?: { time: string; flow: number; state: number }[];
  nozzleWearPercentage: number; // 0-100%
  nozzleEstimatedHoursRemaining: number;
  ocrTerminalFeed: {
    timestamp: string;
    text: string;
    level: 'info' | 'warn' | 'error' | 'cut';
  }[];
  activeProgram: string;
  plateMaterial: string;
  plateThicknessMm: number;
  powerDrawKw: number;
  boltOnSensors: {
    edgeIoModule: boolean;
    gasFlowMeter: boolean;
    ocrCrtCamera: boolean;
    edgeGateway: boolean;
  };
}

export interface FleetSummary {
  fleetEnergyKw: number;
  fleetEnergyKwhToday: number;
  energyStatus: 'normal' | 'peak_warning' | 'surge';
  energySurgeLimitKw: number;
  activeSafetyIncidents: {
    id: string;
    assetName: string;
    assetType: 'crane' | 'welding' | 'cnc';
    type: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    time: string;
  }[];
  totalYardOee: number;
  yardOeeTarget: number;
  totalSteelTonnageMovedToday: number;
  totalWeldSeamsCompleted: number;
  activeWorkforceCount: number;
  retrofittingSavingsEstimate: number; // $ savings vs buying new
  inrAnnualizedSavingsLakhs?: number; // ₹ Lakhs
  inrShieldGasSavedMonth?: number; // ₹ Lakhs
  inrEnergyDemandPeakSaved?: number; // ₹ Lakhs
  dmrNavalSteelTraceabilityScore?: number; // % (e.g. 99.8%)
  activeDqaNavalAuditsCount?: number;
}

export interface NavalWpsAuditRecord {
  id: string;
  jointId: string;
  hullSection: string;
  navalSteelGrade: 'DMR 249A' | 'DMR 249B' | 'EH36';
  welderId: string;
  wpsSpec: string;
  heatInputKjPerMm: number;
  targetHeatInputRange: string;
  interpassTempCelsius: number;
  voltageRecorded: number;
  currentRecorded: number;
  travelSpeedMmPerMin: number;
  ndtStatus: 'Cleared (UT Pass)' | 'NDT Requisition Issued (RT Required)' | 'Pending Review';
  irsCompliance: boolean;
  dqanCompliance: boolean;
  timestamp: string;
}

export interface MaintenanceTask {
  id: string;
  assetId: string;
  assetName: string;
  assetType: 'crane' | 'welding' | 'cnc';
  title: string;
  reason: string;
  aiConfidence: number;
  urgency: 'critical' | 'high' | 'medium' | 'scheduled';
  predictedFailureDate: string;
  estimatedDowntimeHours: number;
  recommendedAction: string;
  requiredParts: string[];
}

export interface WorkOrder {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  assetCategory: 'crane' | 'welding' | 'cnc' | 'facility';
  priority: 'emergency' | 'high' | 'medium' | 'low';
  status: 'pending' | 'dispatched' | 'in_progress' | 'completed';
  assignedTechnician: string;
  trade: 'Rigging/Mechanic' | 'Weld Inspector' | 'Gas Fitter' | 'Electrical' | 'Automation Edge';
  createdAt: string;
  estimatedHours: number;
  telemetryTrigger?: string;
  resolutionNotes?: string;
}

export interface SafeZoneCalibration {
  craneCautionDistanceMeters: number;
  craneHardStopDistanceMeters: number;
  maxStructuralStrainMicrostrain: number;
  wpsVoltageTolerancePercent: number;
  gasLeakIdleThresholdLpm: number;
}

