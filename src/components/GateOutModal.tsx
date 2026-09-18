import React, { useState } from 'react';
import { X, Truck, ArrowUpRight, AlertCircle } from 'lucide-react';
import { Container } from '../types/terminal';

interface GateOutModalProps {
  container: Container | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, containerNumber: string, truckPlate: string, driverName: string, notes: string) => Promise<void>;
}

export const GateOutModal: React.FC<GateOutModalProps> = ({
  container,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [truckPlate, setTruckPlate] = useState('B 9481 UKP');
  const [driverName, setDriverName] = useState('Hadi Purnomo');
  const [notes, setNotes] = useState('Pengeluaran kontainer impor SPPB Bea Cukai lengkap');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !container) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!truckPlate.trim()) {
      setError('Nomor polisi truk penjemput wajib diisi.');
      return;
    }
    if (!driverName.trim()) {
      setError('Nama supir penjemput wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(container.id, container.containerNumber, truckPlate, driverName, notes);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal memproses Gate-Out.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="modal-gateout"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-600 text-white shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pelepasan Gerbang (Gate-Out)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {container.containerNumber} ({container.isoType})
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <span className="font-bold">Konfirmasi Pengeluaran Fisik:</span>
            <p className="text-[11px] mt-0.5">
              Tindakan ini akan mencatat status keluar dari area terminal dan mengosongkan slot lapangan {container.yardLocation?.block}-{container.yardLocation?.bay}-{container.yardLocation?.row}-{container.yardLocation?.tier}.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Polisi Truk Penjemput <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={truckPlate}
              onChange={(e) => setTruckPlate(e.target.value.toUpperCase())}
              placeholder="Contoh: B 9481 UKP"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Supir Pengangkut <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="Nama pengemudi"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Pengeluaran / No. SPPB
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-amber-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Menyimpan ke Firestore...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Proses Gate-Out</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
