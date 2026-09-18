import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Container } from '../types/terminal';

interface DeleteConfirmModalProps {
  container: Container | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, containerNumber: string, reason: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  container,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('Kesalahan input data nomor petikemas');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !container) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(container.id, container.containerNumber, reason);
      onClose();
    } catch (err) {
      console.error('Gagal menghapus data:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="modal-delete-confirm"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-600 text-white shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-950">
                Konfirmasi Hapus Data Petikemas
              </h3>
              <p className="text-xs text-rose-700">
                Tindakan ini akan menghapus dokumen dari Firebase Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="text-slate-500">Nomor Petikemas:</div>
            <div className="text-base font-mono font-black text-slate-900">
              {container.containerNumber}
            </div>
            <div className="text-slate-600 pt-1">
              {container.shippingLine} • {container.isoType} ({container.teu} TEU)
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              Posisi: Blok {container.yardLocation?.block}-{container.yardLocation?.bay}-{container.yardLocation?.row}-{container.yardLocation?.tier}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alasan Penghapusan (Tercatat di Audit Log):
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
            >
              <option value="Kesalahan input data nomor petikemas">Kesalahan input data nomor petikemas</option>
              <option value="Duplikasi entri gate-in">Duplikasi entri gate-in</option>
              <option value="Pembatalan booking pelayaran (Cancel Booking)">Pembatalan booking pelayaran (Cancel Booking)</option>
              <option value="Petikemas ditolak masuk gate (Reject Condition)">Petikemas ditolak masuk gate (Reject Condition)</option>
              <option value="Koreksi administrasi operasional pelabuhan">Koreksi administrasi operasional pelabuhan</option>
            </select>
          </div>

          <p className="text-xs text-rose-600 font-medium">
            Peringatan: Data akan dihapus secara permanen dari server database Firestore. Catatan audit akan tetap tersimpan.
          </p>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-rose-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
            >
              {isDeleting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Permanen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
