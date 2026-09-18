import React from 'react';
import { 
  X, 
  Printer, 
  MapPin, 
  ShieldCheck, 
  ThermometerSnowflake, 
  AlertTriangle, 
  Truck, 
  Ship, 
  Calendar, 
  Barcode,
  Layers,
  Building2
} from 'lucide-react';
import { Container } from '../types/terminal';
import { formatWeight, formatDateTime } from '../utils/validators';

interface ContainerDetailModalProps {
  container: Container | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (c: Container) => void;
}

export const ContainerDetailModal: React.FC<ContainerDetailModalProps> = ({
  container,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !container) return null;

  const loc = container.yardLocation || { block: '-', bay: '-', row: '-', tier: '-' };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="modal-container-detail"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-600 text-white shadow-xs">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-mono font-bold text-slate-900">
                  {container.containerNumber}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  {container.isoType} ({container.teu} TEU)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Equipment Interchange Receipt (EIR) & Kartu Tanda Masuk Terminal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg text-slate-600 hover:text-sky-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Cetak Surat Jalan / EIR"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Tutup detail"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Document printable layout */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Barcode simulation banner */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] tracking-widest text-slate-400 uppercase font-mono">
                TERMINAL OPERATING SYSTEM (TOS) IDENTIFIER
              </span>
              <div className="text-xl font-mono font-black text-sky-400 mt-0.5">
                {container.containerNumber}
              </div>
              <div className="text-xs text-slate-300 font-mono mt-1">
                SEAL NO: <span className="text-white font-bold">{container.sealNumber}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 uppercase">Status Lapangan</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 mt-1">
                {container.status}
              </span>
            </div>
          </div>

          {/* Location & Weights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Yard Coordinate Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>Posisi Lapangan Penumpukan (Yard Slot)</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">BLOK</span>
                  <span className="text-base font-bold text-sky-950">{loc.block}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">BAY</span>
                  <span className="text-base font-bold text-sky-950">{loc.bay}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">ROW</span>
                  <span className="text-base font-bold text-sky-950">{loc.row}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">TIER</span>
                  <span className="text-base font-bold text-sky-950">{loc.tier}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                Tersusun pada tumpukan Tier {loc.tier}, Baris Row {loc.row}
              </p>
            </div>

            {/* Weight Breakdown Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Layers className="w-4 h-4 text-sky-600" />
                <span>Rincian Bobot (SOLAS VGM)</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Bobot Kotor (Gross VGM):</span>
                  <span className="font-bold text-slate-900">{formatWeight(container.grossWeightKg)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Bobot Tara (Tare Box):</span>
                  <span className="font-semibold text-slate-700">{formatWeight(container.tareWeightKg)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Muatan Bersih (Payload):</span>
                  <span className="font-bold text-emerald-700">{formatWeight(container.payloadKg)}</span>
                </div>
              </div>
              <div className="text-[11px] text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sertifikasi Timbangan Port VGM Resmi</span>
              </div>
            </div>
          </div>

          {/* Shipping & Voyage Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Ship className="w-4 h-4 text-sky-600" />
              <span>Informasi Pelayaran & Kapal Angkut</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Perusahaan Pelayaran (Line)</span>
                <span className="font-bold text-slate-900">{container.shippingLine}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Nama Kapal</span>
                <span className="font-bold text-slate-900">{container.vesselName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Nomor Voyage</span>
                <span className="font-bold text-slate-900">{container.voyageNumber || '-'}</span>
              </div>
            </div>
          </div>

          {/* Reefer & Hazardous Goods Spec */}
          {(container.isReefer || container.dangerClass !== 'NON_DG') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {container.isReefer && (
                <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs">
                  <div className="flex items-center gap-2 font-bold text-cyan-900 mb-1">
                    <ThermometerSnowflake className="w-4 h-4 text-cyan-600" />
                    <span>Petikemas Berpendingin (Reefer Active)</span>
                  </div>
                  <p className="text-cyan-800">
                    Suhu target: <span className="font-bold text-cyan-950 font-mono text-sm">{container.temperatureCelsius ?? '-'}°C</span>. Plug listrik aktif di Blok C.
                  </p>
                </div>
              )}
              {container.dangerClass !== 'NON_DG' && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                  <div className="flex items-center gap-2 font-bold text-rose-900 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Muatan Berbahaya (DG / B3)</span>
                  </div>
                  <p className="text-rose-800">
                    Klasifikasi IMO: <span className="font-bold">{container.dangerClass}</span>. Penanganan khusus isolasi api.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Shipper, Consignee & Transport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 block text-[11px] font-semibold">Pengirim (Shipper)</span>
              <p className="font-bold text-slate-900">{container.shipper || '-'}</p>
              <span className="text-slate-400 block text-[11px] font-semibold pt-2">Penerima (Consignee)</span>
              <p className="font-bold text-slate-900">{container.consignee || '-'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2">
                <Truck className="w-4 h-4 text-sky-600" />
                <span>Data Truk & Pengemudi</span>
              </div>
              <p className="text-slate-600">
                No. Polisi Truk: <span className="font-bold font-mono text-slate-900">{container.truckPlateNumber || '-'}</span>
              </p>
              <p className="text-slate-600">
                Supir Pengangkut: <span className="font-bold text-slate-900">{container.driverName || '-'}</span>
              </p>
              <p className="text-slate-600 text-[11px] pt-1">
                Waktu Gate-In: {formatDateTime(container.gateInTime)}
              </p>
              {container.gateOutTime && (
                <p className="text-rose-700 text-[11px] font-semibold">
                  Waktu Gate-Out: {formatDateTime(container.gateOutTime)}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          {container.notes && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
              <span className="font-bold block mb-0.5">Catatan Petugas Terminal:</span>
              <p>{container.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            ID Dokumen: {container.id}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(container);
              }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              Edit Data Ini
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
