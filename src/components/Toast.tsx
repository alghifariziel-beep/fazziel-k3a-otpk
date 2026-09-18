import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = 'bg-white border-slate-200 text-slate-800';
        let icon = <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />;

        if (toast.type === 'success') {
          bgClass = 'bg-white border-emerald-300 text-slate-900 shadow-emerald-100/50';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />;
        } else if (toast.type === 'error') {
          bgClass = 'bg-white border-rose-300 text-slate-900 shadow-rose-100/50';
          icon = <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />;
        } else if (toast.type === 'warning') {
          bgClass = 'bg-white border-amber-300 text-slate-900 shadow-amber-100/50';
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 ${bgClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
