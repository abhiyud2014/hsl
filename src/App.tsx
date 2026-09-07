/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MasterExecutiveSummary } from './components/MasterExecutiveSummary';
import { YardSpatialMap } from './components/YardSpatialMap';
import { HeavyCranesModule } from './components/HeavyCranesModule';
import { WeldingBaysModule } from './components/WeldingBaysModule';
import { CncCuttersModule } from './components/CncCuttersModule';
import { AiMaintenanceSchedulerModal } from './components/AiMaintenanceSchedulerModal';
import { RetrofitHardwareGuideModal } from './components/RetrofitHardwareGuideModal';
import { AssetDetailModal } from './components/AssetDetailModal';
import { WorkOrdersModule } from './components/WorkOrdersModule';
import { AiYardCopilotDrawer } from './components/AiYardCopilotDrawer';
import { ShiftReportModal } from './components/ShiftReportModal';
import { SafeZoneCalibratorModal } from './components/SafeZoneCalibratorModal';
import { LiveTelemetryStreamModal } from './components/LiveTelemetryStreamModal';
import { TandemLiftSynchronizerModal } from './components/TandemLiftSynchronizerModal';
import { NavalWpsAuditModal } from './components/NavalWpsAuditModal';
import { 
  INITIAL_CRANES, 
  INITIAL_WELDING_BAYS, 
  INITIAL_CNC_CUTTERS, 
  INITIAL_FLEET_SUMMARY, 
  INITIAL_MAINTENANCE_TASKS,
  INITIAL_WORK_ORDERS,
  INITIAL_SAFE_ZONE_CALIBRATION,
  INITIAL_NAVAL_WPS_AUDITS
} from './services/syntheticData';
import { 
  HeavyCraneAsset, 
  WeldingBayAsset, 
  CncCutterAsset, 
  FleetSummary, 
  MaintenanceTask, 
  WorkOrder,
  SafeZoneCalibration,
  NavalWpsAuditRecord,
  AssetCategory, 
  TimeRange 
} from './types/dashboard';

export default function App() {
  // Main Data States
  const [cranes, setCranes] = useState<HeavyCraneAsset[]>(INITIAL_CRANES);
  const [weldingBays, setWeldingBays] = useState<WeldingBayAsset[]>(INITIAL_WELDING_BAYS);
  const [cncCutters, setCncCutters] = useState<CncCutterAsset[]>(INITIAL_CNC_CUTTERS);
  const [fleetSummary, setFleetSummary] = useState<FleetSummary>(INITIAL_FLEET_SUMMARY);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(INITIAL_MAINTENANCE_TASKS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [calibration, setCalibration] = useState<SafeZoneCalibration>(INITIAL_SAFE_ZONE_CALIBRATION);
  const [navalAudits, setNavalAudits] = useState<NavalWpsAuditRecord[]>(INITIAL_NAVAL_WPS_AUDITS);

  // UI State
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('live');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState<boolean>(false);
  const [isRetrofitModalOpen, setIsRetrofitModalOpen] = useState<boolean>(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState<boolean>(false);
  const [isShiftReportOpen, setIsShiftReportOpen] = useState<boolean>(false);
  const [isCalibratorOpen, setIsCalibratorOpen] = useState<boolean>(false);
  const [isLiveTelemetryOpen, setIsLiveTelemetryOpen] = useState<boolean>(false);
  const [isTandemLiftOpen, setIsTandemLiftOpen] = useState<boolean>(false);
  const [isNavalWpsAuditOpen, setIsNavalWpsAuditOpen] = useState<boolean>(false);
  const [liveTelemetryAssetId, setLiveTelemetryAssetId] = useState<string | undefined>(undefined);
  const [selectedAssetForModal, setSelectedAssetForModal] = useState<HeavyCraneAsset | WeldingBayAsset | CncCutterAsset | null>(null);

  const handleOpenLiveTelemetry = (assetId?: string) => {
    setLiveTelemetryAssetId(assetId);
    setIsLiveTelemetryOpen(true);
  };

  // Live Telemetry Stream Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;

    const intervalTime = Math.max(500, 2000 / simSpeed);
    const interval = setInterval(() => {
      // 1. Jitter Crane Telemetry (move coordinates subtly along rails, fluctuate load/strain)
      setCranes((prevCranes) =>
        prevCranes.map((crane) => {
          // slight movement
          const dx = (Math.random() - 0.5) * 0.4;
          const newGridX = Math.max(10, Math.min(90, crane.gridX + dx));
          
          // slight load and strain jitter
          const loadJitter = (Math.random() - 0.5) * 1.5;
          const newLoad = Math.max(5, Math.min(crane.safeWorkingLimitTons * 0.98, crane.currentLoadTons + loadJitter));
          const newLoadPct = (newLoad / crane.safeWorkingLimitTons) * 100;
          const strainJitter = Math.round((Math.random() - 0.5) * 15);
          const newStrain = Math.max(200, Math.min(1150, crane.structuralStrainMicrostrain + strainJitter));

          // proximity variation
          const proxJitter = (Math.random() - 0.5) * 0.15;
          const newProx = Math.max(1.8, Math.min(25, crane.proximityDistanceMeters + proxJitter));

          // strain history rolling update
          const newHistory = [...crane.strainHistory];
          if (newHistory.length > 0) {
            newHistory[newHistory.length - 1] = {
              ...newHistory[newHistory.length - 1],
              strain: newStrain,
              load: Number(newLoad.toFixed(1)),
            };
          }

          return {
            ...crane,
            gridX: Number(newGridX.toFixed(2)),
            currentLoadTons: Number(newLoad.toFixed(1)),
            loadPercentage: Number(newLoadPct.toFixed(1)),
            structuralStrainMicrostrain: newStrain,
            proximityDistanceMeters: Number(newProx.toFixed(1)),
            strainHistory: newHistory,
          };
        })
      );

      // 2. Jitter Welding Bay Telemetry (live arc fluctuations & AQI)
      setWeldingBays((prevBays) =>
        prevBays.map((bay) => {
          const voltJitter = (Math.random() - 0.5) * 0.4;
          const currJitter = Math.round((Math.random() - 0.5) * 4);
          const newVolt = Number((bay.liveVoltage + voltJitter).toFixed(1));
          const newCurr = Math.max(100, bay.liveCurrent + currJitter);
          
          // Gas flow & wire feed slight fluctuations
          const gasJitter = (Math.random() - 0.5) * 0.2;
          const newGas = Math.max(8, Number((bay.shieldingGasFlowLpm + gasJitter).toFixed(1)));

          return {
            ...bay,
            liveVoltage: newVolt,
            liveCurrent: newCurr,
            shieldingGasFlowLpm: newGas,
          };
        })
      );

      // 3. Jitter CNC Cutters (gas flow, cutting speed, OCR feed logs)
      setCncCutters((prevCutters) =>
        prevCutters.map((cutter) => {
          if (cutter.machineState === 'cutting') {
            const speedJitter = (Math.random() - 0.5) * 0.1;
            const newSpeed = Math.max(1.5, Number((cutter.cuttingSpeedMpm + speedJitter).toFixed(2)));
            const gasJitter = (Math.random() - 0.5) * 0.1;
            const newGas = Math.max(3.0, Number((cutter.gasFlowScmh + gasJitter).toFixed(2)));

            return {
              ...cutter,
              cuttingSpeedMpm: newSpeed,
              gasFlowScmh: newGas,
            };
          }
          return cutter;
        })
      );

      // 4. Update Fleet Total Power Draw
      setFleetSummary((prev) => {
        const totalKw = 
          cranes.reduce((acc, c) => acc + c.powerDrawKw, 0) +
          weldingBays.reduce((acc, w) => acc + w.powerDrawKw, 0) +
          cncCutters.reduce((acc, n) => acc + n.powerDrawKw, 0) +
          (Math.random() - 0.5) * 10;

        return {
          ...prev,
          fleetEnergyKw: Number(Math.max(250, totalKw).toFixed(1)),
        };
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, cranes, weldingBays, cncCutters]);

  // Synthetic Anomaly Trigger Handler
  const handleTriggerAnomaly = useCallback((type: 'crane_proximity' | 'weld_spike' | 'gas_leak' | 'heavy_lift' | 'reset') => {
    if (type === 'crane_proximity') {
      setCranes((prev) =>
        prev.map((c) =>
          c.id === 'crane-2'
            ? {
                ...c,
                proximityDistanceMeters: 2.1,
                proximityStatus: 'caution',
                status: 'warning',
              }
            : c
        )
      );
      setFleetSummary((prev) => ({
        ...prev,
        activeSafetyIncidents: [
          {
            id: `inc-${Date.now()}`,
            assetName: 'Overhead Gantry 150T',
            assetType: 'crane',
            type: 'LiDAR Proximity Hazard',
            description: 'LiDAR distance collapsed to 2.1m near Pillar B-14 (Safe margin: 5.0m). Cabin buzzer sounded.',
            severity: 'critical',
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          },
          ...prev.activeSafetyIncidents.filter((i) => i.assetName !== 'Overhead Gantry 150T'),
        ],
      }));
    } else if (type === 'weld_spike') {
      setWeldingBays((prev) =>
        prev.map((b) =>
          b.id === 'weld-2'
            ? {
                ...b,
                liveVoltage: 34.8,
                liveCurrent: 312,
                wpsCompliancePercentage: 72.0,
                defectProbabilityScore: 24.5,
                status: 'warning',
                bayAqiPm25: 52,
                fumeHoodRpm: 3200,
              }
            : b
        )
      );
      setFleetSummary((prev) => ({
        ...prev,
        activeSafetyIncidents: [
          {
            id: `inc-${Date.now()}`,
            assetName: 'Welding Bay 02',
            assetType: 'welding',
            type: 'WPS Arc Surge & AQI Spike',
            description: 'Arc voltage surged to 34.8V (Spec limit 31.0V). PM2.5 reached 52 µg/m³. Fume hood forced to 3200 RPM.',
            severity: 'critical',
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          },
          ...prev.activeSafetyIncidents.filter((i) => i.assetName !== 'Welding Bay 02'),
        ],
      }));
    } else if (type === 'gas_leak') {
      setCncCutters((prev) =>
        prev.map((c) =>
          c.id === 'cnc-2'
            ? {
                ...c,
                isLeakingGas: true,
                gasFlowScmh: 1.25,
                leakRateEstimate: 20.8,
                status: 'warning',
                ocrTerminalFeed: [
                  { timestamp: new Date().toLocaleTimeString(), text: 'FLOW_METER: UNEXPECTED 20.8 L/min IDLE BLEED DETECTED', level: 'error' },
                  ...c.ocrTerminalFeed,
                ],
              }
            : c
        )
      );
    } else if (type === 'heavy_lift') {
      setCranes((prev) =>
        prev.map((c) =>
          c.id === 'crane-1'
            ? {
                ...c,
                currentLoadTons: 574.0,
                loadPercentage: 95.7,
                structuralStrainMicrostrain: 980,
                status: 'warning',
              }
            : c
        )
      );
      setFleetSummary((prev) => ({
        ...prev,
        activeSafetyIncidents: [
          {
            id: `inc-${Date.now()}`,
            assetName: 'Goliath Gantry 600T',
            assetType: 'crane',
            type: 'SWL 95% Heavy Lift Threshold Alert',
            description: 'Suspended load reached 574T (95.7% of 600T SWL). Microstrain peaked at 980 µε.',
            severity: 'warning',
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          },
          ...prev.activeSafetyIncidents,
        ],
      }));
    } else if (type === 'reset') {
      setCranes(INITIAL_CRANES);
      setWeldingBays(INITIAL_WELDING_BAYS);
      setCncCutters(INITIAL_CNC_CUTTERS);
      setFleetSummary(INITIAL_FLEET_SUMMARY);
    }
  }, []);

  const handleDismissIncident = (id: string) => {
    setFleetSummary((prev) => ({
      ...prev,
      activeSafetyIncidents: prev.activeSafetyIncidents.filter((i) => i.id !== id),
    }));
  };

  const handleCompleteMaintenanceTask = (taskId: string) => {
    setMaintenanceTasks((prev) => prev.filter((t) => t.id !== taskId));
    // If fixing CNC 2 gas leak
    if (taskId === 'maint-2') {
      setCncCutters((prev) =>
        prev.map((c) => (c.id === 'cnc-2' ? { ...c, isLeakingGas: false, status: 'operating', leakRateEstimate: 0, gasFlowScmh: 0 } : c))
      );
    }
  };

  // Work Orders Handlers
  const handleCreateWorkOrder = (order: Omit<WorkOrder, 'id' | 'createdAt'>) => {
    const newOrder: WorkOrder = {
      ...order,
      id: `wo-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setWorkOrders((prev) => [newOrder, ...prev]);
  };

  const handleCreateWorkOrderFromAi = (
    title: string,
    assetName: string,
    category: 'crane' | 'welding' | 'cnc',
    trigger: string,
    priority: 'emergency' | 'high' | 'medium' | 'low'
  ) => {
    const tradeMap: Record<string, WorkOrder['trade']> = {
      crane: 'Rigging/Mechanic',
      welding: 'Weld Inspector',
      cnc: 'Gas Fitter',
    };
    const techMap: Record<string, string> = {
      crane: 'D. Vance (Lead Rigging Engineer)',
      welding: 'A. Chen (NDT / Quality Inspector)',
      cnc: 'M. Kowalski (Gas Systems Specialist)',
    };

    handleCreateWorkOrder({
      title,
      assetId: category === 'crane' ? 'crane-2' : category === 'welding' ? 'weld-2' : 'cnc-2',
      assetName,
      assetCategory: category,
      priority,
      status: 'dispatched',
      assignedTechnician: techMap[category] || 'Yard Duty Technician',
      trade: tradeMap[category] || 'Automation Edge',
      estimatedHours: 1.0,
      telemetryTrigger: trigger,
    });
    setIsAiCopilotOpen(false);
    setActiveCategory('work_orders');
  };

  const handleDispatchWorkOrderFromIncident = (incident: any) => {
    handleCreateWorkOrderFromAi(
      `Emergency Remediation: ${incident.type}`,
      incident.assetName,
      incident.assetType as any,
      incident.description,
      'emergency'
    );
  };

  const handleDispatchWorkOrderForAsset = (asset: HeavyCraneAsset | WeldingBayAsset | CncCutterAsset) => {
    const tradeMap: Record<string, WorkOrder['trade']> = {
      crane: 'Rigging/Mechanic',
      welding: 'Weld Inspector',
      cnc: 'Gas Fitter',
    };
    handleCreateWorkOrder({
      title: `Scheduled Maintenance Inspection for ${asset.code}`,
      assetId: asset.id,
      assetName: asset.name,
      assetCategory: asset.category,
      priority: asset.status === 'warning' ? 'high' : 'medium',
      status: 'dispatched',
      assignedTechnician: 'Yard Duty Technician',
      trade: tradeMap[asset.category] || 'Automation Edge',
      estimatedHours: 1.5,
      telemetryTrigger: `Routine sensor inspection & diagnostic health review (${asset.code}).`,
    });
    setActiveCategory('work_orders');
  };

  // Interactive Sub-Module Specific Actions
  const handleSimulateTestLift = (craneId: string) => {
    setCranes((prev) =>
      prev.map((c) =>
        c.id === craneId
          ? {
              ...c,
              currentLoadTons: Number((c.currentLoadTons + 12).toFixed(1)),
              loadPercentage: Number(((c.currentLoadTons + 12) / c.safeWorkingLimitTons * 100).toFixed(1)),
              structuralStrainMicrostrain: c.structuralStrainMicrostrain + 85,
            }
          : c
      )
    );
  };

  const handleZeroStrainBaseline = (craneId: string) => {
    setCranes((prev) =>
      prev.map((c) =>
        c.id === craneId
          ? {
              ...c,
              structuralStrainMicrostrain: 320,
            }
          : c
      )
    );
  };

  const handleBoostFumeHood = (bayId: string) => {
    setWeldingBays((prev) =>
      prev.map((b) =>
        b.id === bayId
          ? {
              ...b,
              fumeHoodRpm: b.fumeHoodRpm + 400,
              bayAqiPm25: Math.max(8, b.bayAqiPm25 - 6),
            }
          : b
      )
    );
  };

  const handleCalibrateWpsClamp = (bayId: string) => {
    setWeldingBays((prev) =>
      prev.map((b) =>
        b.id === bayId
          ? {
              ...b,
              liveVoltage: 28.4,
              liveCurrent: 280,
              wpsCompliancePercentage: 97.5,
              defectProbabilityScore: 1.8,
              status: 'operating',
            }
          : b
      )
    );
  };

  const handleFixGasLeak = (cutterId: string) => {
    setCncCutters((prev) =>
      prev.map((c) =>
        c.id === cutterId
          ? {
              ...c,
              isLeakingGas: false,
              gasFlowScmh: c.machineState === 'cutting' ? 4.5 : 0.0,
              leakRateEstimate: 0,
              status: 'operating',
            }
          : c
      )
    );
  };

  const handleResetNozzleWear = (cutterId: string) => {
    setCncCutters((prev) =>
      prev.map((c) =>
        c.id === cutterId
          ? {
              ...c,
              nozzleWearPercentage: 0,
              nozzleEstimatedHoursRemaining: 120,
            }
          : c
      )
    );
  };

  const handleRescanOcr = (cutterId: string) => {
    setCncCutters((prev) =>
      prev.map((c) =>
        c.id === cutterId
          ? {
              ...c,
              ocrTerminalFeed: [
                {
                  timestamp: new Date().toLocaleTimeString(),
                  text: `OCR_SYNC: RE-SCANNED CRT MONITOR (X:+1428.50, Y:+892.20, G01 F1850)`,
                  level: 'info',
                },
                ...c.ocrTerminalFeed,
              ],
            }
          : c
      )
    );
  };

  const handleUpdateWorkOrderStatus = (id: string, status: WorkOrder['status'], notes?: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === id) {
          // If completed, synchronize machine state
          if (status === 'completed') {
            if (wo.assetId === 'cnc-2' || wo.title.toLowerCase().includes('gas')) {
              setCncCutters((prevCnc) =>
                prevCnc.map((c) => (c.id === 'cnc-2' ? { ...c, isLeakingGas: false, status: 'operating', leakRateEstimate: 0, gasFlowScmh: 0 } : c))
              );
            }
            if (wo.assetId === 'crane-2' || wo.title.toLowerCase().includes('lidar')) {
              setCranes((prevCranes) =>
                prevCranes.map((c) => (c.id === 'crane-2' ? { ...c, proximityDistanceMeters: 6.2, proximityStatus: 'safe', status: 'operating' } : c))
              );
            }
            if (wo.assetId === 'weld-2' || wo.title.toLowerCase().includes('wps')) {
              setWeldingBays((prevBays) =>
                prevBays.map((b) => (b.id === 'weld-2' ? { ...b, liveVoltage: 28.4, wpsCompliancePercentage: 96.5, defectProbabilityScore: 2.1, status: 'operating' } : b))
              );
            }
          }
          return {
            ...wo,
            status,
            resolutionNotes: notes || wo.resolutionNotes,
          };
        }
        return wo;
      })
    );
  };

  // Calibration Handler
  const handleSaveCalibration = (newCalibration: SafeZoneCalibration) => {
    setCalibration(newCalibration);
    // Recalculate proximity statuses based on updated caution distance
    setCranes((prev) =>
      prev.map((c) => {
        let proxStatus: 'safe' | 'caution' | 'breach' = 'safe';
        if (c.proximityDistanceMeters <= newCalibration.craneHardStopDistanceMeters) {
          proxStatus = 'breach';
        } else if (c.proximityDistanceMeters <= newCalibration.craneCautionDistanceMeters) {
          proxStatus = 'caution';
        }
        return {
          ...c,
          proximityStatus: proxStatus,
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Industrial Top Bar Header */}
      <Header
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        simSpeed={simSpeed}
        onChangeSimSpeed={setSimSpeed}
        onTriggerAnomaly={handleTriggerAnomaly}
        onOpenMaintenanceModal={() => setIsMaintenanceModalOpen(true)}
        onOpenRetrofitModal={() => setIsRetrofitModalOpen(true)}
        onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
        onOpenShiftReport={() => setIsShiftReportOpen(true)}
        onOpenCalibrator={() => setIsCalibratorOpen(true)}
        onOpenLiveTelemetry={() => handleOpenLiveTelemetry()}
        onOpenTandemLift={() => setIsTandemLiftOpen(true)}
        onOpenNavalWpsAudit={() => setIsNavalWpsAuditOpen(true)}
        activeAlertsCount={fleetSummary.activeSafetyIncidents.length}
      />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-5 sm:space-y-6">
        {/* Master Executive Summary Bar & Category Tabs */}
        <MasterExecutiveSummary
          summary={fleetSummary}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          timeRange={timeRange}
          onSelectTimeRange={setTimeRange}
          onDismissIncident={handleDismissIncident}
          onOpenRetrofitModal={() => setIsRetrofitModalOpen(true)}
          onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
          onOpenShiftReport={() => setIsShiftReportOpen(true)}
          onDispatchWorkOrderFromIncident={handleDispatchWorkOrderFromIncident}
          onOpenTandemLift={() => setIsTandemLiftOpen(true)}
          onOpenNavalWpsAudit={() => setIsNavalWpsAuditOpen(true)}
        />

        {/* View Routing Based on Category Selection */}
        {activeCategory === 'all' && (
          <div className="space-y-6 animate-fade-in">
            {/* Spatial Yard Map (Digital Twin Layout) */}
            <YardSpatialMap
              cranes={cranes}
              weldingBays={weldingBays}
              cncCutters={cncCutters}
              onSelectAsset={(asset) => setSelectedAssetForModal(asset)}
              selectedAssetId={selectedAssetForModal?.id}
              onSelectCategory={setActiveCategory}
              onOpenLiveTelemetry={() => handleOpenLiveTelemetry()}
            />

            {/* Quick Multi-Module Telemetry Feeds */}
            <div className="space-y-6">
              <HeavyCranesModule
                cranes={cranes}
                onSelectCrane={(crane) => setSelectedAssetForModal(crane)}
                onSimulateTestLift={handleSimulateTestLift}
                onZeroStrainBaseline={handleZeroStrainBaseline}
                onDispatchWorkOrder={handleDispatchWorkOrderForAsset}
                onOpenLiveTelemetry={handleOpenLiveTelemetry}
                onOpenTandemLift={() => setIsTandemLiftOpen(true)}
              />
              <WeldingBaysModule
                bays={weldingBays}
                onSelectBay={(bay) => setSelectedAssetForModal(bay)}
                onBoostFumeHood={handleBoostFumeHood}
                onCalibrateWpsClamp={handleCalibrateWpsClamp}
                onDispatchWorkOrder={handleDispatchWorkOrderForAsset}
                onOpenLiveTelemetry={handleOpenLiveTelemetry}
                onOpenNavalWpsAudit={() => setIsNavalWpsAuditOpen(true)}
              />
              <CncCuttersModule
                cutters={cncCutters}
                onSelectCutter={(cutter) => setSelectedAssetForModal(cutter)}
                onFixGasLeak={handleFixGasLeak}
                onResetNozzleWear={handleResetNozzleWear}
                onRescanOcr={handleRescanOcr}
                onDispatchWorkOrder={handleDispatchWorkOrderForAsset}
                onOpenLiveTelemetry={handleOpenLiveTelemetry}
              />
              <WorkOrdersModule
                workOrders={workOrders}
                onUpdateStatus={handleUpdateWorkOrderStatus}
                onCreateWorkOrder={handleCreateWorkOrder}
              />
            </div>
          </div>
        )}

        {activeCategory === 'cranes' && (
          <div className="space-y-6 animate-fade-in">
            <HeavyCranesModule
              cranes={cranes}
              onSelectCrane={(crane) => setSelectedAssetForModal(crane)}
              onSimulateTestLift={handleSimulateTestLift}
              onZeroStrainBaseline={handleZeroStrainBaseline}
              onDispatchWorkOrder={handleDispatchWorkOrderForAsset}
              onOpenLiveTelemetry={handleOpenLiveTelemetry}
              onOpenTandemLift={() => setIsTandemLiftOpen(true)}
            />
            <YardSpatialMap
              cranes={cranes}
              weldingBays={[]}
              cncCutters={[]}
              onSelectAsset={(asset) => setSelectedAssetForModal(asset)}
              selectedAssetId={selectedAssetForModal?.id}
              onOpenLiveTelemetry={() => handleOpenLiveTelemetry()}
            />
          </div>
        )}

        {activeCategory === 'welding' && (
          <div className="space-y-6 animate-fade-in">
            <WeldingBaysModule
              bays={weldingBays}
              onSelectBay={(bay) => setSelectedAssetForModal(bay)}
              onBoostFumeHood={handleBoostFumeHood}
              onCalibrateWpsClamp={handleCalibrateWpsClamp}
              onDispatchWorkOrder={handleDispatchWorkOrderForAsset}
              onOpenLiveTelemetry={handleOpenLiveTelemetry}
              onOpenNavalWpsAudit={() => setIsNavalWpsAuditOpen(true)}
            />
            <YardSpatialMap
              cranes={[]}
              weldingBays={weldingBays}
              cncCutters={[]}
              onSelectAsset={(asset) => setSelectedAssetForModal(asset)}
              selectedAssetId={selectedAssetForModal?.id}
              onOpenLiveTelemetry={() => handleOpenLiveTelemetry()}
            />
          </div>
        )}

        {activeCategory === 'cnc' && (
          <div className="space-y-6 animate-fade-in">
            <CncCuttersModule
              cutters={cncCutters}
              onSelectCutter={(cutter) => setSelectedAssetForModal(cutter)}
              onFixGasLeak={handleFixGasLeak}
              onResetNozzleWear={handleResetNozzleWear}
              onRescanOcr={handleRescanOcr}
              onDispatchWorkOrder={handleDispatchWorkOrderForAsset}
              onOpenLiveTelemetry={handleOpenLiveTelemetry}
            />
            <YardSpatialMap
              cranes={[]}
              weldingBays={[]}
              cncCutters={cncCutters}
              onSelectAsset={(asset) => setSelectedAssetForModal(asset)}
              selectedAssetId={selectedAssetForModal?.id}
              onOpenLiveTelemetry={() => handleOpenLiveTelemetry()}
            />
          </div>
        )}

        {activeCategory === 'work_orders' && (
          <div className="space-y-6 animate-fade-in">
            <WorkOrdersModule
              workOrders={workOrders}
              onUpdateStatus={handleUpdateWorkOrderStatus}
              onCreateWorkOrder={handleCreateWorkOrder}
            />
          </div>
        )}
      </main>

      {/* Footer Industrial Credentials */}
      <footer className="border-t border-slate-200 bg-white px-4 sm:px-8 py-3.5 sm:py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs text-center sm:text-left">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <span className="font-semibold text-slate-700">SHIPYARDPULSE IIOT + AI RETROFIT PLATFORM</span>
          <span>•</span>
          <span className="text-slate-500">EDGE GATEWAY PROTOCOL: MQTT / OPC UA</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Synthesized Telemetry Engine • 24/7 Yard Operations
        </div>
      </footer>

      {/* Modals & Drawers */}
      <LiveTelemetryStreamModal
        isOpen={isLiveTelemetryOpen}
        onClose={() => setIsLiveTelemetryOpen(false)}
        cranes={cranes}
        weldingBays={weldingBays}
        cncCutters={cncCutters}
        initialAssetId={liveTelemetryAssetId}
      />

      <AiMaintenanceSchedulerModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        tasks={maintenanceTasks}
        onCompleteTask={handleCompleteMaintenanceTask}
      />

      <RetrofitHardwareGuideModal
        isOpen={isRetrofitModalOpen}
        onClose={() => setIsRetrofitModalOpen(false)}
      />

      <AssetDetailModal
        asset={selectedAssetForModal}
        onClose={() => setSelectedAssetForModal(null)}
        onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
        onOpenCalibrator={() => setIsCalibratorOpen(true)}
        onCreateWorkOrder={handleDispatchWorkOrderForAsset}
        onOpenLiveTelemetry={handleOpenLiveTelemetry}
      />

      <AiYardCopilotDrawer
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        cranes={cranes}
        weldingBays={weldingBays}
        cncCutters={cncCutters}
        fleetSummary={fleetSummary}
        onCreateWorkOrder={handleCreateWorkOrderFromAi}
      />

      <ShiftReportModal
        isOpen={isShiftReportOpen}
        onClose={() => setIsShiftReportOpen(false)}
        fleetSummary={fleetSummary}
        cranes={cranes}
        weldingBays={weldingBays}
        cncCutters={cncCutters}
      />

      <SafeZoneCalibratorModal
        isOpen={isCalibratorOpen}
        onClose={() => setIsCalibratorOpen(false)}
        calibration={calibration}
        onSaveCalibration={handleSaveCalibration}
      />

      {/* HSL Presentation Feature Modals */}
      <TandemLiftSynchronizerModal
        isOpen={isTandemLiftOpen}
        onClose={() => setIsTandemLiftOpen(false)}
        cranes={cranes}
      />

      <NavalWpsAuditModal
        isOpen={isNavalWpsAuditOpen}
        onClose={() => setIsNavalWpsAuditOpen(false)}
        auditRecords={navalAudits}
      />
    </div>
  );
}
