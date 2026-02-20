import { useState, useEffect, FormEvent } from 'react';
import { 
  Monitor, 
  UserPlus, 
  History, 
  CheckCircle2, 
  XCircle, 
  ArrowRightLeft,
  User,
  GraduationCap,
  Calendar,
  Clock,
  RotateCcw,
  Settings,
  Plus,
  Edit2,
  Trash2,
  X,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PC, Assignment } from './types';

export default function App() {
  const [pcs, setPcs] = useState<PC[]>([]);
  const [history, setHistory] = useState<Assignment[]>([]);
  const [view, setView] = useState<'dashboard' | 'history' | 'manage'>('dashboard');
  
  // Form state for assignment
  const [selectedPcId, setSelectedPcId] = useState<number | null>(null);
  const [personName, setPersonName] = useState('');
  const [personType, setPersonType] = useState<'student' | 'teacher'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for PC management
  const [newPcName, setNewPcName] = useState('');
  const [editingPcId, setEditingPcId] = useState<number | null>(null);
  const [editPcName, setEditPcName] = useState('');

  useEffect(() => {
    // Initialize LocalStorage if empty
    const savedPcs = localStorage.getItem('pcs');
    const savedHistory = localStorage.getItem('history');
    
    if (!savedPcs) {
      const initialPcs: PC[] = [
        { id: 1, name: 'PC-01', status: 'available' },
        { id: 2, name: 'PC-02', status: 'available' },
        { id: 3, name: 'PC-03', status: 'available' },
        { id: 4, name: 'PC-04', status: 'available' },
        { id: 5, name: 'PC-05', status: 'available' },
        { id: 6, name: 'MacBook-Pro-01', status: 'available' },
        { id: 7, name: 'Surface-01', status: 'available' },
      ];
      localStorage.setItem('pcs', JSON.stringify(initialPcs));
      setPcs(initialPcs);
    } else {
      setPcs(JSON.parse(savedPcs));
    }

    if (!savedHistory) {
      localStorage.setItem('history', JSON.stringify([]));
      setHistory([]);
    } else {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToLocalStorage = (newPcs: PC[], newHistory: Assignment[]) => {
    localStorage.setItem('pcs', JSON.stringify(newPcs));
    localStorage.setItem('history', JSON.stringify(newHistory));
    setPcs(newPcs);
    setHistory(newHistory);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      timeZone: 'Europe/Copenhagen'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('da-DK', {
      timeZone: 'Europe/Copenhagen',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAssign = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPcId || !personName) return;

    setIsSubmitting(true);
    
    const newPcs = pcs.map(pc => 
      pc.id === selectedPcId ? { ...pc, status: 'assigned' as const } : pc
    );

    const newAssignment: Assignment = {
      id: Date.now(),
      pc_id: selectedPcId,
      pc_name: pcs.find(p => p.id === selectedPcId)?.name || 'Unknown',
      person_name: personName,
      person_type: personType,
      assigned_at: new Date().toISOString(),
      returned_at: null
    };

    const newHistory = [newAssignment, ...history];
    
    saveToLocalStorage(newPcs, newHistory);
    setPersonName('');
    setSelectedPcId(null);
    setIsSubmitting(false);
  };

  const handleReturn = (assignmentId: number) => {
    const assignment = history.find(h => h.id === assignmentId);
    if (!assignment) return;

    const newHistory = history.map(h => 
      h.id === assignmentId ? { ...h, returned_at: new Date().toISOString() } : h
    );

    const newPcs = pcs.map(pc => 
      pc.id === assignment.pc_id ? { ...pc, status: 'available' as const } : pc
    );

    saveToLocalStorage(newPcs, newHistory);
  };

  const handleAddPc = (e: FormEvent) => {
    e.preventDefault();
    if (!newPcName) return;

    if (pcs.some(p => p.name.toLowerCase() === newPcName.toLowerCase())) {
      alert('PC name must be unique');
      return;
    }

    const newPc: PC = {
      id: Date.now(),
      name: newPcName,
      status: 'available'
    };

    saveToLocalStorage([...pcs, newPc], history);
    setNewPcName('');
  };

  const handleUpdatePc = (id: number) => {
    if (!editPcName) return;

    if (pcs.some(p => p.id !== id && p.name.toLowerCase() === editPcName.toLowerCase())) {
      alert('PC name must be unique');
      return;
    }

    const newPcs = pcs.map(pc => 
      pc.id === id ? { ...pc, name: editPcName } : pc
    );

    saveToLocalStorage(newPcs, history);
    setEditingPcId(null);
  };

  const handleDeletePc = (id: number) => {
    const pc = pcs.find(p => p.id === id);
    if (!pc) return;

    if (pc.status === 'assigned') {
      alert(`Cannot remove "${pc.name}" because it is currently assigned. Please return it first.`);
      return;
    }

    const newPcs = pcs.filter(p => p.id !== id);
    const newHistory = history.filter(h => h.pc_id !== id);

    saveToLocalStorage(newPcs, newHistory);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-[#e31a22] text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between py-6 gap-6">
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center md:items-start">
                <h1 className="text-7xl font-black tracking-tighter leading-none">SG</h1>
                <p className="text-xl font-bold mt-1">IT Afdeling</p>
              </div>
              <div className="hidden md:block w-px h-20 bg-white/20" />
              <div className="flex flex-col items-center md:items-start">
                <div className="relative">
                  <Monitor className="w-16 h-16 text-white/90" />
                  <div className="absolute -top-1 -right-1 bg-white text-[#e31a22] rounded-md p-0.5 shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold mt-2 tracking-tight">Udlån af Computere</h2>
              </div>
            </div>
            
            <nav className="flex gap-2 bg-black/10 p-1.5 rounded-2xl backdrop-blur-sm">
              <button 
                onClick={() => setView('dashboard')}
                className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  view === 'dashboard' ? 'bg-white text-[#e31a22] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Dashboard
              </button>
              <button 
                onClick={() => setView('history')}
                className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  view === 'history' ? 'bg-white text-[#e31a22] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <History className="w-4 h-4" />
                History
              </button>
              <button 
                onClick={() => setView('manage')}
                className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  view === 'manage' ? 'bg-white text-[#e31a22] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Settings className="w-4 h-4" />
                Manage
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* PC Grid */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-slate-700">
                    <Monitor className="w-5 h-5 text-slate-400" />
                    Workstations
                  </h2>
                  <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      {pcs.filter(p => p.status === 'available').length} Available
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      {pcs.filter(p => p.status === 'assigned').length} Assigned
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pcs.map((pc) => {
                    const activeAssignment = history.find(h => h.pc_id === pc.id && h.returned_at === null);
                    return (
                      <div 
                        key={pc.id}
                        className={`p-6 rounded-3xl border transition-all ${
                          pc.status === 'available' 
                            ? 'bg-white border-slate-200 hover:border-red-200 shadow-sm' 
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${
                              pc.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              <Monitor className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-black text-slate-800 tracking-tight">{pc.name}</h3>
                              <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                                pc.status === 'available' ? 'text-emerald-500' : 'text-amber-500'
                              }`}>
                                {pc.status}
                              </span>
                            </div>
                          </div>
                          {pc.status === 'assigned' && activeAssignment && (
                            <button 
                              onClick={() => handleReturn(activeAssignment.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Return
                            </button>
                          )}
                        </div>

                        {pc.status === 'assigned' && activeAssignment ? (
                          <div className="mt-4 p-4 bg-white/50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3 text-sm text-slate-700">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                {activeAssignment.person_type === 'teacher' ? <User className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-bold leading-none">{activeAssignment.person_name}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-black mt-1 tracking-wider">{activeAssignment.person_type}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setSelectedPcId(pc.id)}
                            className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-bold hover:border-red-300 hover:text-red-500 hover:bg-red-50/30 transition-all active:scale-[0.98]"
                          >
                            Assign Workstation
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {pcs.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                       <Monitor className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-slate-400 font-bold">No PCs added yet.</p>
                       <button onClick={() => setView('manage')} className="mt-4 text-red-600 font-bold text-sm hover:underline">Manage PCs</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment Form */}
              <div className="space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-700">
                  <UserPlus className="w-5 h-5 text-slate-400" />
                  New Assignment
                </h2>

                <form onSubmit={handleAssign} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                      Select Workstation
                    </label>
                    <select 
                      value={selectedPcId || ''}
                      onChange={(e) => setSelectedPcId(Number(e.target.value))}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Choose a PC...</option>
                      {pcs.filter(p => p.status === 'available').map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                      Full Name
                    </label>
                    <input 
                      type="text"
                      placeholder="Enter name..."
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                      User Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setPersonType('student')}
                        className={`py-4 rounded-2xl text-sm font-black border transition-all flex items-center justify-center gap-2 active:scale-95 ${
                          personType === 'student' 
                            ? 'bg-[#e31a22] border-[#e31a22] text-white shadow-lg shadow-red-200' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <GraduationCap className="w-5 h-5" />
                        Student
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPersonType('teacher')}
                        className={`py-4 rounded-2xl text-sm font-black border transition-all flex items-center justify-center gap-2 active:scale-95 ${
                          personType === 'teacher' 
                            ? 'bg-[#e31a22] border-[#e31a22] text-white shadow-lg shadow-red-200' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <User className="w-5 h-5" />
                        Teacher
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting || !selectedPcId || !personName}
                    className="w-full py-5 rounded-[1.5rem] bg-slate-900 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                  >
                    Confirm Assignment
                  </button>
                </form>
              </div>
            </motion.div>
          ) : view === 'history' ? (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-700">
                  <History className="w-5 h-5 text-slate-400" />
                  Assignment History
                </h2>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Workstation</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Returned</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <Monitor className="w-4 h-4 text-slate-300" />
                              <span className="font-black text-slate-800 tracking-tight">{item.pc_name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{item.person_name}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{item.person_type}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(item.assigned_at)}
                              <span className="text-slate-200 mx-1">|</span>
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(item.assigned_at)}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            {item.returned_at ? (
                              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(item.returned_at)}
                                <span className="text-slate-200 mx-1">|</span>
                                <Clock className="w-3.5 h-3.5" />
                                {formatTime(item.returned_at)}
                              </div>
                            ) : (
                              <span className="text-amber-500 font-bold text-xs uppercase tracking-widest">In use...</span>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            {item.returned_at ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest">
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                                Active
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {history.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">
                            No assignment history found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="manage"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-700">
                  <Settings className="w-5 h-5 text-slate-400" />
                  Manage Workstations
                </h2>
              </div>

              {/* Add PC Form */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <form onSubmit={handleAddPc} className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                      Add New PC
                    </label>
                    <div className="relative">
                      <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input 
                        type="text"
                        placeholder="Enter PC name (e.g. PC-10)..."
                        value={newPcName}
                        onChange={(e) => setNewPcName(e.target.value)}
                        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button 
                      type="submit"
                      disabled={!newPcName}
                      className="px-8 py-4 rounded-2xl bg-[#e31a22] text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition-all disabled:opacity-50 active:scale-95"
                    >
                      Add PC
                    </button>
                  </div>
                </form>
              </div>

              {/* PC List */}
              <div className="grid grid-cols-1 gap-3">
                {pcs.map((pc) => (
                  <div key={pc.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-red-200 transition-all">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-all">
                        <Monitor className="w-5 h-5" />
                      </div>
                      {editingPcId === pc.id ? (
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                          <input 
                            type="text"
                            value={editPcName}
                            onChange={(e) => setEditPcName(e.target.value)}
                            className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-red-200 text-sm font-bold outline-none"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleUpdatePc(pc.id)}
                            className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingPcId(null)}
                            className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-black text-slate-800 tracking-tight">{pc.name}</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Status: <span className={pc.status === 'available' ? 'text-emerald-500' : 'text-amber-500'}>{pc.status}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {editingPcId !== pc.id && (
                        <>
                          <button 
                            onClick={() => {
                              setEditingPcId(pc.id);
                              setEditPcName(pc.name);
                            }}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Edit Name"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeletePc(pc.id);
                            }}
                            className={`p-2.5 rounded-xl transition-all ${
                              pc.status === 'assigned' 
                                ? 'text-slate-200 cursor-not-allowed' 
                                : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title={pc.status === 'assigned' ? 'Cannot delete assigned PC' : 'Remove PC'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
