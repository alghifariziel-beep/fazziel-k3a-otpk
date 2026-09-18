import React, { useState, useEffect } from 'react';
import { X, History, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { AuditLog } from '../types/terminal';
import { subscribeAuditLogs } from '../services/auditService';
import { formatDateTime } from '../utils/validators';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    const unsubscribe = subscribeAuditLogs(
      (data) => {
        setLogs(data);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">CREATE</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">UPDATE</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">DELETE</span>;
      case 'RELOCATE':
        return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">RELOCATE</span>;
      case 'GATE_OUT':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">GATE-OUT</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">{action}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="modal-audit-log"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-white shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Log Audit & Jejak Aktivitas Operasional
              </h3>
              <p className="text-xs text-slate-500">
                Catatan mutasi data real-time tersimpan persisten di Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center">
              <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mb-2"></div>
              <span>Memuat log audit dari Firestore...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Belum ada catatan aktivitas operasional.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action)}
                      <span className="font-mono font-bold text-slate-900">
                        {log.containerNumber}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDateTime(log.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">
                    {log.description}
                  </p>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1 border-t border-slate-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Petugas: <strong className="text-slate-700">{log.performedBy}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
