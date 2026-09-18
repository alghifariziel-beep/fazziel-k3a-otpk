import React, { useState, useEffect } from 'react';
import { X, MapPin, ArrowRight, Save, AlertCircle } from 'lucide-react';
import { Container, YardLocation } from '../types/terminal';

interface RelocateModalProps {
  container: Container | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, containerNumber: string, newLocation: YardLocation, oldLocation: YardLocation) => Promise<void>;
}

export const RelocateModal: React.FC<RelocateModalProps> = ({
  container,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [newLocation, setNewLocation] = useState<YardLocation>({
    block: 'A',
    bay: '01',
    row: '01',
    tier: '01',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (container?.yardLocation) {
      setNewLocation({ ...container.yardLocation });
    }
    setError(null);
  }, [container, isOpen]);

  if (!isOpen || !container) return null;

  const oldLoc = container.yardLocation || { block: '-', bay: '-', row: '-', tier: '-' };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check if location unchanged
    if (
      oldLoc.block === newLocation.block &&
      oldLoc.bay === newLocation.bay &&
      oldLoc.row === newLocation.row &&
      oldLoc.tier === newLocation.tier
    ) {
      setError('Lokasi tujuan sama dengan lokasi saat ini. Silakan pilih slot yang berbeda.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(container.id, container.containerNumber, newLocation, oldLoc);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal memindahkan posisi kontainer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="modal-relocate"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pindah Slot Lapangan (Relokasi)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Petikemas: {container.containerNumber} ({container.shippingLine})
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

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Old vs New Location Flow */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="text-center flex-1">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Slot Asal</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                Blok {oldLoc.block}-{oldLoc.bay}-{oldLoc.row}-{oldLoc.tier}
              </span>
            </div>
            <div className="px-2 text-slate-400">
              <ArrowRight className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-center flex-1">
              <span className="text-[10px] text-emerald-600 block uppercase font-semibold">Slot Baru Target</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                Blok {newLocation.block}-{newLocation.bay}-{newLocation.row}-{newLocation.tier}
              </span>
            </div>
          </div>

          {/* New Slot Pickers */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Pilih Koordinat Lapangan Baru (Target):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Blok</span>
                <select
                  value={newLocation.block}
                  onChange={(e) => setNewLocation({ ...newLocation, block: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                >
                  <option value="A">Blok A (Ekspor)</option>
                  <option value="B">Blok B (Domestik)</option>
                  <option value="C">Blok C (Reefer)</option>
                  <option value="D">Blok D (BC & B3)</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Bay</span>
                <select
                  value={newLocation.bay}
                  onChange={(e) => setNewLocation({ ...newLocation, bay: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const val = (i + 1).toString().padStart(2, '0');
                    return <option key={val} value={val}>Bay {val}</option>;
                  })}
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Row</span>
                <select
                  value={newLocation.row}
                  onChange={(e) => setNewLocation({ ...newLocation, row: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                >
                  {Array.from({ length: 6 }, (_, i) => {
                    const val = (i + 1).toString().padStart(2, '0');
                    return <option key={val} value={val}>Row {val}</option>;
                  })}
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Tier</span>
                <select
                  value={newLocation.tier}
                  onChange={(e) => setNewLocation({ ...newLocation, tier: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const val = (i + 1).toString().padStart(2, '0');
                    return <option key={val} value={val}>Tier {val}</option>;
                  })}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Menyimpan ke Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Konfirmasi Pindah Slot</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
