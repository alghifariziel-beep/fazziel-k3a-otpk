import React, { useState, useEffect } from 'react';
import { 
  Anchor, 
  LogOut, 
  Plus, 
  Grid, 
  Table as TableIcon, 
  Ship,
  History,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Clock
} from 'lucide-react';
import { UserProfile } from '../types/terminal';
import { playTerminalSound } from '../utils/sound';

interface NavbarProps {
  user: UserProfile;
  activeView: 'table' | 'yard' | 'berth';
  setActiveView: (v: 'table' | 'yard' | 'berth') => void;
  onOpenCreate: () => void;
  onOpenAuditLogs: () => void;
  onLogout: () => void;
  onSeedData: () => void;
  isSeeding: boolean;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  setActiveView,
  onOpenCreate,
  onOpenAuditLogs,
  onLogout,
  onSeedData,
  isSeeding,
  totalCount,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [shiftStr, setShiftStr] = useState<string>('Shift 1');
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);

  // Live Terminal Clock & Shift Calculator
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setTimeStr(time);

      if (hours >= 8 && hours < 16) {
        setShiftStr('Shift 1 (Pagi)');
      } else if (hours >= 16 && hours < 24) {
        setShiftStr('Shift 2 (Sore)');
      } else {
        setShiftStr('Shift 3 (Malam)');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', bg: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'YARD_OPERATOR':
        return { label: 'Yard Operator', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'VESSEL_PLANNER':
        return { label: 'Vessel Planner', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      default:
        return { label: 'Petugas', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const roleInfo = getRoleLabel(user.role);

  const handleTabChange = (tab: 'table' | 'yard' | 'berth') => {
    setActiveView(tab);
    if (isSoundOn) playTerminalSound('click');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs">
      {/* Top Professional Port Sub-Header Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 sm:px-8 py-1 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sky-400 font-bold">UN/LOCODE: IDTPP</span>
          <span className="text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-300">Terminal Petikemas Nusantara 1</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-emerald-400 font-medium hidden sm:inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ISPS Level 1 (Normal Security)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-mono text-slate-300">
            <Clock className="w-3 h-3 text-sky-400" />
            <span>{timeStr || '12:00:00 WIB'}</span>
          </div>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-semibold border border-slate-700">
            {shiftStr}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsSoundOn(!isSoundOn);
              if (!isSoundOn) playTerminalSound('gate_in');
            }}
            className="text-slate-400 hover:text-white cursor-pointer p-0.5"
            title={isSoundOn ? 'Matikan Suara Terminal' : 'Aktifkan Suara Terminal'}
          >
            {isSoundOn ? <Volume2 className="w-3 h-3 text-sky-400" /> : <VolumeX className="w-3 h-3" />}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Terminal Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm shadow-sky-600/20 shrink-0">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg">
                  TOS NUSANTARA
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Firebase Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Terminal Operating System & Port Operations
              </p>
            </div>
          </div>

          {/* Center: View Switcher Tabs (Table, Yard Map, Berth Planner) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              id="tab-view-table"
              onClick={() => handleTabChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'table'
                  ? 'bg-white text-sky-900 shadow-xs border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Daftar</span> Petikemas
            </button>
            <button
              id="tab-view-yard"
              onClick={() => handleTabChange('yard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'yard'
                  ? 'bg-white text-sky-900 shadow-xs border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Peta</span> Yard
            </button>
            <button
              id="tab-view-berth"
              onClick={() => handleTabChange('berth')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'berth'
                  ? 'bg-white text-sky-900 shadow-xs border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ship className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Dermaga</span> Kapal
            </button>
          </div>

          {/* Right Actions: Audit Logs, Seed, Create, User profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audit Log Button */}
            <button
              id="btn-audit-logs"
              onClick={() => {
                onOpenAuditLogs();
                if (isSoundOn) playTerminalSound('click');
              }}
              className="p-2 text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors cursor-pointer hidden md:flex items-center gap-1 text-xs font-semibold"
              title="Lihat Rekam Jejak / Audit Log Aktivitas"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span className="hidden lg:inline">Audit Log</span>
            </button>

            {totalCount === 0 && (
              <button
                id="btn-seed-data"
                onClick={onSeedData}
                disabled={isSeeding}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg border border-amber-200 cursor-pointer transition-colors"
                title="Muat data contoh terminal ke Firestore"
              >
                {isSeeding ? (
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>Muat Data Contoh</span>
              </button>
            )}

            {/* Create New Container (Gate-In) */}
            <button
              id="btn-create-container"
              onClick={() => {
                onOpenCreate();
                if (isSoundOn) playTerminalSound('gate_in');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-sky-600/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Gate-In Petikemas</span>
              <span className="sm:hidden">Tambah</span>
            </button>

            {/* User details badge */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {user.displayName}
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${roleInfo.bg}`}>
                    {roleInfo.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {user.badgeNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              id="btn-logout"
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
              title="Keluar dari sistem"
              aria-label="Keluar dari sistem"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

