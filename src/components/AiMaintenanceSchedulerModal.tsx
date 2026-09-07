import React, { useState } from 'react';
import { 
  Wrench, 
  X, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Cpu, 
  Anchor, 
  Flame, 
  Check, 
  ChevronRight 
} from 'lucide-react';
import { MaintenanceTask } from '../types/dashboard';

interface AiMaintenanceSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: MaintenanceTask[];
  onCompleteTask: (taskId: string) => void;
}

export const AiMaintenanceSchedulerModal: React.FC<AiMaintenanceSchedulerModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onCompleteTask,
}) => {
  const [scheduledSuccessId, setScheduledSuccessId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSchedule = (id: string) => {
    setScheduledSuccessId(id);
    setTimeout(() => {
      onCompleteTask(id);
      setScheduledSuccessId(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  AI-DRIVEN PREDICTIVE UPKEEP
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Maintenance Downtime Scheduler (Condition-Based Prioritization)
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

        {/* Modal Description Banner */}
        <div className="px-6 py-3 bg-indigo-50/70 border-b border-indigo-100/70 text-xs text-indigo-900 flex items-center justify-between">
          <p>
            Upkeep windows scheduled by <strong>actual sensor wear</strong> (vibration FFT, gas leak rate, WPS deviation) rather than arbitrary calendar dates.
          </p>
          <span className="font-mono text-indigo-700 font-bold bg-white px-2.5 py-0.5 rounded-md border border-indigo-100">
            {tasks.length} Pending Actions
          </span>
        </div>

        {/* Task List */}
        <div className="p-5 lg:p-6 overflow-y-auto space-y-4 flex-1">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <div className="text-base font-bold text-slate-900">All Machinery Operating at Optimal Health</div>
              <p className="text-xs">No imminent sensor degradation or fatigue anomalies detected.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const isUrgent = task.urgency === 'critical' || task.urgency === 'high';
              const isSuccess = scheduledSuccessId === task.id;

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isUrgent
                      ? 'bg-rose-50/40 border-rose-200 shadow-xs'
                      : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      {task.assetType === 'crane' && <Anchor className="w-4 h-4 text-indigo-600" />}
                      {task.assetType === 'welding' && <Flame className="w-4 h-4 text-amber-600" />}
                      {task.assetType === 'cnc' && <Cpu className="w-4 h-4 text-blue-600" />}
                      <span className="font-bold text-sm text-slate-900 font-mono">{task.assetName}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className={`px-2.5 py-0.5 rounded-md font-bold uppercase ${
                        task.urgency === 'critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        task.urgency === 'high' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {task.urgency} Priority
                      </span>
                      <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 font-bold">
                        AI Conf: {task.aiConfidence}%
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                  
                  {/* Root cause telemetry */}
                  <div className="mt-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-mono">
                    <strong className="text-amber-700">Sensor Evidence:</strong> {task.reason}
                  </div>

                  {/* Recommendation and Action */}
                  <div className="mt-2.5 text-xs text-slate-600">
                    <span className="text-emerald-700 font-bold">Recommended Fix: </span>
                    {task.recommendedAction}
                  </div>

                  {/* Parts required & Scheduling bar */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Downtime: <strong className="text-slate-800">{task.estimatedDowntimeHours}h</strong></span>
                      <span className="text-slate-300">|</span>
                      <span>Target: <strong className="text-slate-800">{task.predictedFailureDate}</strong></span>
                    </div>

                    <button
                      onClick={() => handleSchedule(task.id)}
                      disabled={isSuccess}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all shadow-xs ${
                        isSuccess
                          ? 'bg-emerald-600 text-white'
                          : isUrgent
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Dispatched to Crew</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Dispatch Work Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Maintenance intervals automatically sync to Dry Dock production schedules</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
