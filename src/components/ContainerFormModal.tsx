import React, { useState, useEffect } from 'react';
import { 
  X, 
  Container as ContainerIcon, 
  Save, 
  AlertCircle, 
  MapPin, 
  Truck, 
  Ship, 
  Check, 
  ThermometerSnowflake,
  ShieldAlert
} from 'lucide-react';
import { 
  Container, 
  ContainerSize, 
  ContainerStatus, 
  ContainerCategory, 
  DangerClass, 
  YardLocation 
} from '../types/terminal';
import { 
  validateContainerNumber, 
  validateGrossWeight, 
  calculateTeu 
} from '../utils/validators';

interface ContainerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Container | null;
  defaultLocation?: { block: string; bay: string; row: string } | null;
  defaultVessel?: { vesselName: string; voyage: string; shippingLine: string } | null;
}

const SHIPPING_LINES = [
  'Maersk Line',
  'Evergreen Marine',
  'MSC (Mediterranean Shipping Co)',
  'CMA CGM',
  'ONE (Ocean Network Express)',
  'Meratus Line',
  'SPIL (Salam Pacific Indonesia Lines)',
  'Samudera Indonesia',
  'COSCO Shipping',
  'Hapag-Lloyd'
];

export const ContainerFormModal: React.FC<ContainerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultLocation,
  defaultVessel,
}) => {
  const isEditing = !!initialData;

  // Form states
  const [containerNumber, setContainerNumber] = useState('');
  const [isoType, setIsoType] = useState<ContainerSize>('40HC');
  const [status, setStatus] = useState<ContainerStatus>('GATE_IN');
  const [category, setCategory] = useState<ContainerCategory>('EKSPOR');
  const [grossWeightKg, setGrossWeightKg] = useState<number>(24000);
  const [tareWeightKg, setTareWeightKg] = useState<number>(3900);
  const [vgmVerified, setVgmVerified] = useState<boolean>(true);
  const [sealNumber, setSealNumber] = useState('');
  const [shippingLine, setShippingLine] = useState('Maersk Line');
  const [vesselName, setVesselName] = useState('');
  const [voyageNumber, setVoyageNumber] = useState('');
  const [yardLocation, setYardLocation] = useState<YardLocation>({
    block: 'A',
    bay: '01',
    row: '01',
    tier: '01'
  });
  const [isReefer, setIsReefer] = useState(false);
  const [temperatureCelsius, setTemperatureCelsius] = useState<string>('-18.0');
  const [dangerClass, setDangerClass] = useState<DangerClass>('NON_DG');
  const [shipper, setShipper] = useState('');
  const [consignee, setConsignee] = useState('');
  const [truckPlateNumber, setTruckPlateNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [notes, setNotes] = useState('');

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Sync initial data or defaults
  useEffect(() => {
    if (initialData) {
      setContainerNumber(initialData.containerNumber);
      setIsoType(initialData.isoType);
      setStatus(initialData.status);
      setCategory(initialData.category);
      setGrossWeightKg(initialData.grossWeightKg);
      setTareWeightKg(initialData.tareWeightKg);
      setVgmVerified(initialData.vgmVerified);
      setSealNumber(initialData.sealNumber);
      setShippingLine(initialData.shippingLine);
      setVesselName(initialData.vesselName);
      setVoyageNumber(initialData.voyageNumber || '');
      setYardLocation(initialData.yardLocation || { block: 'A', bay: '01', row: '01', tier: '01' });
      setIsReefer(initialData.isReefer);
      setTemperatureCelsius(initialData.temperatureCelsius?.toString() || '-18.0');
      setDangerClass(initialData.dangerClass || 'NON_DG');
      setShipper(initialData.shipper || '');
      setConsignee(initialData.consignee || '');
      setTruckPlateNumber(initialData.truckPlateNumber || '');
      setDriverName(initialData.driverName || '');
      setNotes(initialData.notes || '');
    } else {
      // Reset form
      setContainerNumber('');
      setIsoType('40HC');
      setStatus('GATE_IN');
      setCategory('EKSPOR');
      setGrossWeightKg(24500);
      setTareWeightKg(3900);
      setVgmVerified(true);
      setSealNumber('');
      setShippingLine(defaultVessel?.shippingLine || 'Maersk Line');
      setVesselName(defaultVessel?.vesselName || 'MV MAERSK PROSPECTOR');
      setVoyageNumber(defaultVessel?.voyage || '2410E');
      setYardLocation(
        defaultLocation
          ? { block: defaultLocation.block, bay: defaultLocation.bay, row: defaultLocation.row, tier: '01' }
          : { block: 'A', bay: '01', row: '01', tier: '01' }
      );
      setIsReefer(false);
      setTemperatureCelsius('-18.0');
      setDangerClass('NON_DG');
      setShipper('PT NUSANTARA EKSPOR LOGISTIK');
      setConsignee('GLOBAL CARGO LOGISTICS B.V.');
      setTruckPlateNumber('B 9123 UKL');
      setDriverName('Mulyadi');
      setNotes('');
    }
    setFieldErrors({});
    setGeneralError(null);
  }, [initialData, defaultLocation, defaultVessel, isOpen]);

  // Adjust tare weight suggestion when isoType changes
  const handleIsoTypeChange = (type: ContainerSize) => {
    setIsoType(type);
    if (type.includes('RF')) {
      setIsReefer(true);
      setTareWeightKg(type === '20RF' ? 2900 : 4600);
      setYardLocation(prev => ({ ...prev, block: 'C' })); // Block C is Reefer yard
    } else {
      setIsReefer(false);
      if (type.startsWith('20')) {
        setTareWeightKg(2200);
      } else {
        setTareWeightKg(3900);
      }
    }
  };

  const validateAll = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Container Number
    const contValid = validateContainerNumber(containerNumber);
    if (!contValid.isValid) {
      errors.containerNumber = contValid.error!;
    }

    // 2. Weights
    const weightValid = validateGrossWeight(grossWeightKg, tareWeightKg);
    if (!weightValid.isValid) {
      errors.grossWeightKg = weightValid.error!;
    }

    // 3. Seal Number
    if (!sealNumber.trim()) {
      errors.sealNumber = 'Nomor segel keamanan (Seal Number) wajib diisi.';
    } else if (sealNumber.trim().length < 4) {
      errors.sealNumber = 'Nomor segel minimal 4 karakter.';
    }

    // 4. Shipping Line & Vessel
    if (!shippingLine.trim()) {
      errors.shippingLine = 'Nama perusahaan pelayaran wajib dipilih.';
    }
    if (!vesselName.trim()) {
      errors.vesselName = 'Nama kapal pengangkut wajib diisi.';
    }

    // 5. Reefer temp
    if (isReefer) {
      const temp = parseFloat(temperatureCelsius);
      if (isNaN(temp) || temp < -35 || temp > 25) {
        errors.temperatureCelsius = 'Suhu reefer harus di antara -35°C s/d +25°C.';
      }
    }

    // 6. Shipper & Consignee
    if (!shipper.trim()) {
      errors.shipper = 'Nama Pengirim (Shipper) wajib diisi.';
    }
    if (!consignee.trim()) {
      errors.consignee = 'Nama Penerima (Consignee) wajib diisi.';
    }

    // 7. Gate-In truck info
    if (status === 'GATE_IN' && !truckPlateNumber.trim()) {
      errors.truckPlateNumber = 'Nomor polisi truk gate-in wajib diisi.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateAll()) {
      setGeneralError('Terdapat isian formulir yang belum sesuai validasi. Silakan periksa tanda merah.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payloadKg = Math.max(0, grossWeightKg - tareWeightKg);
      const teu = calculateTeu(isoType);

      await onSubmit({
        containerNumber: containerNumber.trim().toUpperCase(),
        isoType,
        teu,
        status,
        category,
        grossWeightKg: Number(grossWeightKg),
        tareWeightKg: Number(tareWeightKg),
        payloadKg,
        vgmVerified,
        sealNumber: sealNumber.trim().toUpperCase(),
        shippingLine: shippingLine.trim(),
        vesselName: vesselName.trim().toUpperCase(),
        voyageNumber: voyageNumber.trim().toUpperCase(),
        yardLocation: {
          block: yardLocation.block,
          bay: yardLocation.bay.padStart(2, '0'),
          row: yardLocation.row.padStart(2, '0'),
          tier: yardLocation.tier.padStart(2, '0'),
        },
        isReefer,
        temperatureCelsius: isReefer ? parseFloat(temperatureCelsius) : null,
        dangerClass,
        shipper: shipper.trim(),
        consignee: consignee.trim(),
        gateInTime: initialData?.gateInTime || new Date().toISOString(),
        truckPlateNumber: truckPlateNumber.trim().toUpperCase(),
        driverName: driverName.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setGeneralError(err.message || 'Gagal menyimpan data ke Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="modal-container-form"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-600 text-white shadow-xs">
              <ContainerIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? `Edit Spesifikasi Petikemas: ${initialData?.containerNumber}` : 'Penerimaan / Gate-In Petikemas Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Validasi ketat standar ISO 6346, alokasi yard slot, dan bobot VGM bersertifikat.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Tutup form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {generalError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Section 1: Identitas Petikemas & Spesifikasi */}
          <div>
            <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              1. Identitas ISO & Spesifikasi Petikemas
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Container Number */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Petikemas (ISO 6346) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                  placeholder="Contoh: MSKU8291034"
                  maxLength={11}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.containerNumber 
                      ? 'border-rose-400 ring-rose-300 focus:ring-rose-400 text-rose-900 bg-rose-50/30' 
                      : 'border-slate-300 focus:ring-sky-500 focus:border-sky-500 text-slate-900'
                  }`}
                />
                {fieldErrors.containerNumber ? (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.containerNumber}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">4 huruf prefiks pemilik + 7 angka serial</p>
                )}
              </div>

              {/* ISO Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ukuran & Tipe ISO <span className="text-rose-600">*</span>
                </label>
                <select
                  value={isoType}
                  onChange={(e) => handleIsoTypeChange(e.target.value as ContainerSize)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="20GP">20' General Purpose (1 TEU)</option>
                  <option value="40GP">40' General Purpose (2 TEU)</option>
                  <option value="40HC">40' High Cube (2 TEU)</option>
                  <option value="45HC">45' High Cube (2 TEU)</option>
                  <option value="20RF">20' Reefer (Pendingin)</option>
                  <option value="40RF">40' Reefer High Cube</option>
                  <option value="20TK">20' ISO Tank Container</option>
                  <option value="40OT">40' Open Top</option>
                  <option value="40FR">40' Flat Rack</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Arus Petikemas <span className="text-rose-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ContainerCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="EKSPOR">EKSPOR (Ke Luar Negeri)</option>
                  <option value="IMPOR">IMPOR (Dari Luar Negeri)</option>
                  <option value="TRANSSHIPMENT">TRANSSHIPMENT (Transit Kapal)</option>
                  <option value="DOMESTIK">DOMESTIK (Antar Pulau)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Bobot & Segel Keamanan */}
          <div>
            <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              2. Bobot Petikemas & Segel Keamanan (SOLAS VGM)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Gross Weight */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bobot Kotor / Gross (Kg) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min={2000}
                  max={36000}
                  value={grossWeightKg}
                  onChange={(e) => setGrossWeightKg(Number(e.target.value))}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                    fieldErrors.grossWeightKg ? 'border-rose-400 ring-rose-300' : 'border-slate-300 focus:ring-sky-500'
                  }`}
                />
                {fieldErrors.grossWeightKg && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.grossWeightKg}</p>
                )}
              </div>

              {/* Tare Weight */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bobot Kosong / Tara (Kg)
                </label>
                <input
                  type="number"
                  value={tareWeightKg}
                  onChange={(e) => setTareWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Seal Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Segel (Seal No) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={sealNumber}
                  onChange={(e) => setSealNumber(e.target.value.toUpperCase())}
                  placeholder="Contoh: MSK-990182"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 ${
                    fieldErrors.sealNumber ? 'border-rose-400 ring-rose-300' : 'border-slate-300 focus:ring-sky-500'
                  }`}
                />
                {fieldErrors.sealNumber && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.sealNumber}</p>
                )}
              </div>

              {/* VGM Verified Checkbox */}
              <div className="flex items-center pt-5">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vgmVerified}
                    onChange={(e) => setVgmVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                  />
                  <span>Sertifikasi VGM Terverifikasi</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Pelayaran & Kapal Sandar */}
          <div>
            <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              3. Pelayaran & Kapal Angkut
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Shipping Line */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perusahaan Pelayaran (Carrier) <span className="text-rose-600">*</span>
                </label>
                <select
                  value={shippingLine}
                  onChange={(e) => setShippingLine(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  {SHIPPING_LINES.map(line => (
                    <option key={line} value={line}>{line}</option>
                  ))}
                </select>
              </div>

              {/* Vessel Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kapal (Vessel Name) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value.toUpperCase())}
                  placeholder="Contoh: MV WAN HAI 512"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-semibold uppercase focus:outline-none focus:ring-2 ${
                    fieldErrors.vesselName ? 'border-rose-400 ring-rose-300' : 'border-slate-300 focus:ring-sky-500'
                  }`}
                />
              </div>

              {/* Voyage */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Voyage / Pelayaran
                </label>
                <input
                  type="text"
                  value={voyageNumber}
                  onChange={(e) => setVoyageNumber(e.target.value.toUpperCase())}
                  placeholder="Contoh: 2408W"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Alokasi Lapangan Penumpukan (Yard Slot) */}
          <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-200">
            <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              4. Penempatan Lokasi Lapangan (Yard Slot Block-Bay-Row-Tier)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Block */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blok Lapangan
                </label>
                <select
                  value={yardLocation.block}
                  onChange={(e) => setYardLocation({ ...yardLocation, block: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="A">Blok A (Ekspor Umum)</option>
                  <option value="B">Blok B (Domestik)</option>
                  <option value="C">Blok C (Area Reefer)</option>
                  <option value="D">Blok D (Karantina & B3)</option>
                </select>
              </div>

              {/* Bay */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bay (Panjang Slot)
                </label>
                <select
                  value={yardLocation.bay}
                  onChange={(e) => setYardLocation({ ...yardLocation, bay: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const val = (i + 1).toString().padStart(2, '0');
                    return <option key={val} value={val}>Bay {val}</option>;
                  })}
                </select>
              </div>

              {/* Row */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Row (Lebar Baris)
                </label>
                <select
                  value={yardLocation.row}
                  onChange={(e) => setYardLocation({ ...yardLocation, row: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  {Array.from({ length: 6 }, (_, i) => {
                    const val = (i + 1).toString().padStart(2, '0');
                    return <option key={val} value={val}>Row {val}</option>;
                  })}
                </select>
              </div>

              {/* Tier */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tier (Tingkat Tumpukan)
                </label>
                <select
                  value={yardLocation.tier}
                  onChange={(e) => setYardLocation({ ...yardLocation, tier: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const val = (i + 1).toString().padStart(2, '0');
                    return <option key={val} value={val}>Tier {val} (Tk.{i + 1})</option>;
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Status Operasional, Reefer & DG */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Operasional Saat Ini <span className="text-rose-600">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContainerStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="GATE_IN">Gate In (Penerimaan Gerbang)</option>
                <option value="YARD_STACKING">Yard Stacking (Tertumpuk di Lapangan)</option>
                <option value="CUSTOMS_HOLD">Tahanan Bea Cukai (Jalur Merah)</option>
                <option value="CUSTOMS_CLEARED">Clearance Bea Cukai Selesai</option>
                <option value="VESSEL_LOADING">Muat ke Palka Kapal</option>
                <option value="VESSEL_DISCHARGED">Bongkar dari Kapal</option>
                <option value="GATE_OUT">Gate Out (Keluar Terminal)</option>
              </select>
            </div>

            {/* Reefer Temperature Setting */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kondisi Reefer & Suhu (°C)
              </label>
              <div className="flex gap-2">
                <div className="flex items-center px-2 py-1 bg-slate-100 rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    checked={isReefer}
                    onChange={(e) => setIsReefer(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                  />
                  <span className="text-xs font-semibold ml-1.5 text-slate-700">Reefer</span>
                </div>
                <input
                  type="text"
                  disabled={!isReefer}
                  value={temperatureCelsius}
                  onChange={(e) => setTemperatureCelsius(e.target.value)}
                  placeholder="-18.0"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>

            {/* Dangerous Goods (DG) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas Bahaya IMO (B3 / DG)
              </label>
              <select
                value={dangerClass}
                onChange={(e) => setDangerClass(e.target.value as DangerClass)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="NON_DG">Non-DG (Kargo Umum / Aman)</option>
                <option value="CLASS_3_FLAMMABLE">Kelas 3: Cairan Mudah Terbakar</option>
                <option value="CLASS_8_CORROSIVE">Kelas 8: Bahan Korosif</option>
                <option value="CLASS_6_TOXIC">Kelas 6: Beracun & Menular</option>
                <option value="CLASS_9_MISC">Kelas 9: Muatan Berbahaya Lainnya</option>
              </select>
            </div>
          </div>

          {/* Section 6: Shipper, Consignee & Truk */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pengirim (Shipper) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={shipper}
                onChange={(e) => setShipper(e.target.value.toUpperCase())}
                placeholder="PT..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs uppercase text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Penerima (Consignee) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={consignee}
                onChange={(e) => setConsignee(e.target.value.toUpperCase())}
                placeholder="PT..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs uppercase text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No Polisi Truk Pengangkut
              </label>
              <input
                type="text"
                value={truckPlateNumber}
                onChange={(e) => setTruckPlateNumber(e.target.value.toUpperCase())}
                placeholder="Contoh: B 9821 UIO"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs uppercase font-mono font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Supir Truk
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Nama supir"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Section 7: Catatan Operasional */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Khusus Petugas / Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kondisi fisik kontainer, instruksi penanganan palka, atau catatan surveyor..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-sky-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Menyimpan ke Firestore...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Simpan Perubahan' : 'Registrasi Masuk (Gate-In)'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
