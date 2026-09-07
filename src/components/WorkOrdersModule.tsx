import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Wrench, 
  Filter, 
  ArrowRight,
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import { WorkOrder } from '../types/dashboard';

interface WorkOrdersModuleProps {
  workOrders: WorkOrder[];
  onUpdateStatus: (id: string, status: WorkOrder['status'], notes?: string) => void;
  onCreateWorkOrder: (order: Omit<WorkOrder, 'id' | 'createdAt'>) => void;
}

export const WorkOrdersModule: React.FC<WorkOrdersModuleProps> = ({
  workOrders,
  onUpdateStatus,
  onCreateWorkOrder,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTrade, setFilterTrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Form State for creating new work order
  const [newTitle, setNewTitle] = useState('');
  const [newAssetName, setNewAssetName] = useState('Goliath Gantry 600T (CR-G600-01)');
  const [newAssetCategory, setNewAssetCategory] = useState<'crane' | 'welding' | 'cnc' | 'facility'>('crane');
  const [newPriority, setNewPriority] = useState<'emergency' | 'high' | 'medium' | 'low'>('high');
  const [newTechnician, setNewTechnician] = useState('D. Vance (Lead Rigging Engineer)');
  const [newTrade, setNewTrade] = useState<WorkOrder['trade']>('Rigging/Mechanic');
  const [newEstimatedHours, setNewEstimatedHours] = useState(1.5);
  const [newTelemetryTrigger, setNewTelemetryTrigger] = useState('Manual supervisor dispatch from yard inspection.');

  const filteredOrders = workOrders.filter((wo) => {
    const matchesStatus = filterStatus === 'all' || wo.status === filterStatus;
    const matchesTrade = filterTrade === 'all' || wo.trade === filterTrade;
    const matchesSearch = 
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.assignedTechnician.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesTrade && matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateWorkOrder({
      title: newTitle,
      assetId: newAssetCategory === 'crane' ? 'crane-1' : newAssetCategory === 'welding' ? 'weld-1' : 'cnc-1',
      assetName: newAssetName,
      assetCategory: newAssetCategory,
      priority: newPriority,
      status: 'dispatched',
      assignedTechnician: newTechnician,
      trade: newTrade,
      estimatedHours: Number(newEstimatedHours),
      telemetryTrigger: newTelemetryTrigger,
    });

    setNewTitle('');
    setIsCreateModalOpen(false);
  };

  const getPriorityBadge = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'emergency':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase font-mono">Emergency</span>;
      case 'high':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase font-mono">High Priority</span>;
      case 'medium':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 font-medium px-2 py-0.5 rounded-md text-[10px] uppercase font-mono">Medium</span>;
      case 'low':
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] uppercase font-mono">Low</span>;
    }
  };

  const getStatusBadge = (status: WorkOrder['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Pending</span>;
      case 'dispatched':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Dispatched</span>;
      case 'in_progress':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase animate-pulse">In Progress</span>;
      case 'completed':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Completed</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Module Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider text-indigo-700 uppercase bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                MODULE 04: FIELD DISPATCH & CMMS
              </span>
              <span className="text-xs text-slate-500">Telemetry-Triggered Maintenance & Technician Workflow</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Shipyard Work Order Dispatch & Technician Task Board
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Work Order</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-5">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search work order, machine, technician..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="px-2 text-slate-400 font-bold text-[10px] uppercase">Status:</span>
              {['all', 'dispatched', 'in_progress', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium capitalize text-xs transition-colors ${
                    filterStatus === st
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="px-2 text-slate-400 font-bold text-[10px] uppercase">Trade:</span>
              {['all', 'Rigging/Mechanic', 'Weld Inspector', 'Gas Fitter'].map((tr) => (
                <button
                  key={tr}
                  onClick={() => setFilterTrade(tr)}
                  className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-colors ${
                    filterTrade === tr
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Work Orders List */}
        <div className="space-y-3.5">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-slate-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="text-sm font-bold text-slate-800">No Matching Work Orders</div>
              <p className="text-xs text-slate-500">All requested maintenance and safety tasks have been completed.</p>
            </div>
          ) : (
            filteredOrders.map((wo) => (
              <div
                key={wo.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {wo.id.toUpperCase()}
                    </span>
                    {getPriorityBadge(wo.priority)}
                    {getStatusBadge(wo.status)}
                    <span className="text-[11px] font-mono text-slate-400">
                      Logged: {wo.createdAt}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{wo.title}</h4>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-semibold text-slate-800">Asset: {wo.assetName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      {wo.assignedTechnician} ({wo.trade})
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-500 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Est: {wo.estimatedHours}h
                    </span>
                  </div>

                  {wo.telemetryTrigger && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-mono text-slate-600">
                      <strong className="text-indigo-700">Telemetry Cause:</strong> {wo.telemetryTrigger}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {wo.status === 'pending' && (
                    <button
                      onClick={() => onUpdateStatus(wo.id, 'dispatched')}
                      className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs border border-indigo-200 transition-colors shadow-2xs"
                    >
                      Dispatch Tech
                    </button>
                  )}
                  {wo.status === 'dispatched' && (
                    <button
                      onClick={() => onUpdateStatus(wo.id, 'in_progress')}
                      className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs border border-amber-200 transition-colors shadow-2xs"
                    >
                      Start Work
                    </button>
                  )}
                  {wo.status === 'in_progress' && (
                    <button
                      onClick={() => onUpdateStatus(wo.id, 'completed')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                  {wo.status === 'completed' && (
                    <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Closed & Verified</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Create New Work Order */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Dispatch New Field Work Order</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Work Order Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Inspect Crane 2 LiDAR reflector & gantry brake"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Asset</label>
                  <select
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Goliath Gantry 600T (CR-G600-01)">Goliath Gantry 600T</option>
                    <option value="Overhead Gantry 150T (CR-OH150-02)">Overhead Gantry 150T</option>
                    <option value="Portal Jib Crane 80T (CR-JB80-03)">Portal Jib Crane 80T</option>
                    <option value="Welding Bay 01 (WB-01)">Welding Bay 01</option>
                    <option value="Welding Bay 02 (WB-02)">Welding Bay 02</option>
                    <option value="ESAB Telerex Heavy Gantry 01 (CNC-01)">ESAB Telerex CNC 01</option>
                    <option value="Messer Retrofit Gantry 02 (CNC-02)">Messer Retrofit CNC 02</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="emergency">Emergency</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Technician</label>
                  <input
                    type="text"
                    value={newTechnician}
                    onChange={(e) => setNewTechnician(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trade Discipline</label>
                  <select
                    value={newTrade}
                    onChange={(e) => setNewTrade(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Rigging/Mechanic">Rigging/Mechanic</option>
                    <option value="Weld Inspector">Weld Inspector</option>
                    <option value="Gas Fitter">Gas Fitter</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Automation Edge">Automation Edge</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Telemetry Reason / Field Notes</label>
                <textarea
                  rows={2}
                  value={newTelemetryTrigger}
                  onChange={(e) => setNewTelemetryTrigger(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
