import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Truck, 
  Trash2, 
  MapPin, 
  ThermometerSnowflake, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpDown,
  Ship,
  Sparkles,
  Plus,
  Download,
  CheckSquare,
  Square,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { Container, ContainerStatus, ContainerCategory } from '../types/terminal';
import { formatWeight, formatDateTime } from '../utils/validators';
import { exportContainersToCSV } from '../utils/exporter';
import { playTerminalSound } from '../utils/sound';

interface ContainerTableProps {
  containers: Container[];
  onViewDetail: (c: Container) => void;
  onEdit: (c: Container) => void;
  onRelocate: (c: Container) => void;
  onGateOut: (c: Container) => void;
  onDelete: (c: Container) => void;
  onOpenCreate: () => void;
  onSeedData: () => void;
  onBatchStatusUpdate?: (ids: string[], newStatus: ContainerStatus) => Promise<void>;
  isSeeding: boolean;
}

export const ContainerTable: React.FC<ContainerTableProps> = ({
  containers,
  onViewDetail,
  onEdit,
  onRelocate,
  onGateOut,
  onDelete,
  onOpenCreate,
  onSeedData,
  onBatchStatusUpdate,
  isSeeding,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [blockFilter, setBlockFilter] = useState<string>('ALL');
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'REEFER' | 'DG' | 'CUSTOMS_HOLD' | 'EKSPOR' | 'IMPOR'>('ALL');
  const [sortField, setSortField] = useState<'createdAt' | 'grossWeightKg' | 'containerNumber'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);

  const filteredContainers = useMemo(() => {
    return containers.filter((item) => {
      // Quick filter pills
      if (quickFilter === 'REEFER' && !item.isReefer) return false;
      if (quickFilter === 'DG' && (item.dangerClass === 'NON_DG' || !item.dangerClass)) return false;
      if (quickFilter === 'CUSTOMS_HOLD' && item.status !== 'CUSTOMS_HOLD') return false;
      if (quickFilter === 'EKSPOR' && item.category !== 'EKSPOR') return false;
      if (quickFilter === 'IMPOR' && item.category !== 'IMPOR') return false;

      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase().trim();
        const matchNumber = item.containerNumber.toLowerCase().includes(query);
        const matchSeal = item.sealNumber?.toLowerCase().includes(query);
        const matchVessel = item.vesselName?.toLowerCase().includes(query);
        const matchLine = item.shippingLine?.toLowerCase().includes(query);
        const matchShipper = item.shipper?.toLowerCase().includes(query);
        const matchConsignee = item.consignee?.toLowerCase().includes(query);
        const matchTruck = item.truckPlateNumber?.toLowerCase().includes(query);

        if (!matchNumber && !matchSeal && !matchVessel && !matchLine && !matchShipper && !matchConsignee && !matchTruck) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }

      // Category
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }

      // Block
      if (blockFilter !== 'ALL' && item.yardLocation?.block !== blockFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'grossWeightKg') {
        comparison = (a.grossWeightKg || 0) - (b.grossWeightKg || 0);
      } else if (sortField === 'containerNumber') {
        comparison = a.containerNumber.localeCompare(b.containerNumber);
      } else {
        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [containers, searchTerm, statusFilter, categoryFilter, blockFilter, quickFilter, sortField, sortOrder]);

  const toggleSort = (field: 'createdAt' | 'grossWeightKg' | 'containerNumber') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    playTerminalSound('click');
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredContainers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContainers.map(c => c.id));
    }
    playTerminalSound('click');
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    playTerminalSound('click');
  };

  const handleExportCSV = () => {
    const dataToExport = selectedIds.length > 0 
      ? containers.filter(c => selectedIds.includes(c.id))
      : filteredContainers;
    
    exportContainersToCSV(dataToExport, `Manifest_Terminal_TOS_${new Date().toISOString().slice(0, 10)}.csv`);
    playTerminalSound('gate_in');
  };

  const handleBatchStatus = async (newStatus: ContainerStatus) => {
    if (!onBatchStatusUpdate || selectedIds.length === 0) return;
    try {
      setIsProcessingBatch(true);
      await onBatchStatusUpdate(selectedIds, newStatus);
      setSelectedIds([]);
      playTerminalSound(newStatus === 'CUSTOMS_CLEARED' ? 'clearance' : 'relocate');
    } catch {
      // Error handled by parent
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const renderStatusBadge = (status: ContainerStatus) => {
    switch (status) {
      case 'GATE_IN':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Gate In
          </span>
        );
      case 'YARD_STACKING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Yard Stacking
          </span>
        );
      case 'CUSTOMS_HOLD':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            Tahanan BC
          </span>
        );
      case 'CUSTOMS_CLEARED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
            <CheckCircle2 className="w-3 h-3 text-teal-600" />
            Clearance BC
          </span>
        );
      case 'VESSEL_LOADING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Ship className="w-3 h-3 text-indigo-600" />
            Muat Kapal
          </span>
        );
      case 'VESSEL_DISCHARGED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
            Bongkar Kapal
          </span>
        );
      case 'GATE_OUT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            Gate Out
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  const renderCategoryBadge = (category: ContainerCategory) => {
    switch (category) {
      case 'EKSPOR':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">EKSPOR</span>;
      case 'IMPOR':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">IMPOR</span>;
      case 'TRANSSHIPMENT':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">TRANS</span>;
      case 'DOMESTIK':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">DOMESTIK</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
        {/* Row 1: Search, Export CSV, and Quick Count */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="search-containers"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari no petikemas (MSKU...), segel, kapal, pelayaran, atau supir..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all font-medium"
            />
          </div>

          {/* Export & Count */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <button
              id="btn-export-csv"
              type="button"
              onClick={handleExportCSV}
              disabled={filteredContainers.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200 disabled:opacity-50"
              title="Unduh format Manifest CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>Ekspor Manifest CSV</span>
            </button>

            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
                {filteredContainers.length} / {containers.length} Box
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-xs font-semibold text-slate-500 mr-1">Preset:</span>
          {[
            { id: 'ALL', label: 'Semua Petikemas' },
            { id: 'REEFER', label: '❄️ Reefer Aktif' },
            { id: 'DG', label: '⚠️ Muatan B3 (DG)' },
            { id: 'CUSTOMS_HOLD', label: '🛑 Tahanan Bea Cukai' },
            { id: 'EKSPOR', label: '🚢 Muatan Ekspor' },
            { id: 'IMPOR', label: '📦 Bongkaran Impor' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                setQuickFilter(pill.id as any);
                playTerminalSound('click');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                quickFilter === pill.id
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Row 3: Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5 text-sky-600" />
            <span>Spesifik:</span>
          </div>

          {/* Status Filter */}
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="GATE_IN">Gate In</option>
            <option value="YARD_STACKING">Di Lapangan (Yard Stacking)</option>
            <option value="CUSTOMS_HOLD">Tahanan Bea Cukai</option>
            <option value="CUSTOMS_CLEARED">Clearance Bea Cukai</option>
            <option value="VESSEL_LOADING">Muat Kapal</option>
            <option value="VESSEL_DISCHARGED">Bongkar Kapal</option>
            <option value="GATE_OUT">Gate Out</option>
          </select>

          {/* Category Filter */}
          <select
            id="filter-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer font-medium"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="EKSPOR">Ekspor</option>
            <option value="IMPOR">Impor</option>
            <option value="TRANSSHIPMENT">Transshipment</option>
            <option value="DOMESTIK">Domestik</option>
          </select>

          {/* Block Yard Filter */}
          <select
            id="filter-block"
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer font-medium"
          >
            <option value="ALL">Semua Blok Lapangan</option>
            <option value="A">Blok A (Ekspor Utama)</option>
            <option value="B">Blok B (Domestik)</option>
            <option value="C">Blok C (Reefer Area)</option>
            <option value="D">Blok D (Karantina & B3)</option>
          </select>

          {(searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || blockFilter !== 'ALL' || quickFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
                setBlockFilter('ALL');
                setQuickFilter('ALL');
                playTerminalSound('click');
              }}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 underline px-1 cursor-pointer"
            >
              Reset Semua Filter
            </button>
          )}
        </div>

        {/* Batch Operations Bar (When items are selected) */}
        {selectedIds.length > 0 && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-sky-900 font-bold">
              <CheckSquare className="w-4 h-4 text-sky-600" />
              <span>{selectedIds.length} Petikemas Terpilih untuk Operasi Massal</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isProcessingBatch}
                onClick={() => handleBatchStatus('CUSTOMS_CLEARED')}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Clearance Bea Cukai (Massal)</span>
              </button>
              <button
                type="button"
                disabled={isProcessingBatch}
                onClick={() => handleBatchStatus('VESSEL_LOADING')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1"
              >
                <Ship className="w-3.5 h-3.5" />
                <span>Siap Muat Kapal (Massal)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 bg-white text-slate-600 hover:bg-slate-100 rounded-lg font-semibold border border-slate-200 cursor-pointer"
              >
                Batal Pilih
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <th className="py-3 px-3 w-10 text-center">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="cursor-pointer text-slate-400 hover:text-sky-600"
                  title="Pilih Semua Baris"
                >
                  {selectedIds.length > 0 && selectedIds.length === filteredContainers.length ? (
                    <CheckSquare className="w-4 h-4 text-sky-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-4">
                <button
                  onClick={() => toggleSort('containerNumber')}
                  className="flex items-center gap-1 hover:text-slate-900 cursor-pointer font-bold"
                >
                  <span>No. Petikemas</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4">Tipe & Kategori</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Lokasi Yard (Slot)</th>
              <th className="py-3 px-4">
                <button
                  onClick={() => toggleSort('grossWeightKg')}
                  className="flex items-center gap-1 hover:text-slate-900 cursor-pointer font-bold"
                >
                  <span>Bobot Kotor (VGM)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4">Pelayaran & Kapal</th>
              <th className="py-3 px-4">
                <button
                  onClick={() => toggleSort('createdAt')}
                  className="flex items-center gap-1 hover:text-slate-900 cursor-pointer font-bold"
                >
                  <span>Waktu Masuk</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 text-center">Aksi Operasional</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContainers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 px-4 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="p-3 rounded-full bg-slate-100 text-slate-400 mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Tidak ada petikemas yang cocok</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      {containers.length === 0 
                        ? 'Database Firestore Anda saat ini belum memiliki data petikemas.'
                        : 'Coba ubah kata kunci pencarian atau sesuaikan opsi filter di atas.'}
                    </p>
                    {containers.length === 0 ? (
                      <div className="flex gap-2">
                        <button
                          onClick={onSeedData}
                          disabled={isSeeding}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg border border-amber-200 cursor-pointer transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Muat Data Contoh Terminal</span>
                        </button>
                        <button
                          onClick={onOpenCreate}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Penerimaan Kontainer Baru</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('ALL');
                          setCategoryFilter('ALL');
                          setBlockFilter('ALL');
                          setQuickFilter('ALL');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                      >
                        Bersihkan Pencarian
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredContainers.map((c) => {
                const loc = c.yardLocation || { block: '-', bay: '-', row: '-', tier: '-' };
                const isGateOut = c.status === 'GATE_OUT';
                const isSelected = selectedIds.includes(c.id);

                return (
                  <tr 
                    key={c.id} 
                    id={`container-row-${c.id}`}
                    className={`hover:bg-sky-50/40 transition-colors ${
                      isSelected ? 'bg-sky-50/70' : isGateOut ? 'bg-slate-50/50 opacity-75' : ''
                    }`}
                  >
                    {/* Checkbox Column */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(c.id)}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                    </td>

                    {/* Container Number & Highlights */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-sm tracking-wide">
                          {c.containerNumber}
                        </span>
                        {c.isReefer && (
                          <span 
                            title={`Reefer Temp: ${c.temperatureCelsius ?? '-'}°C`}
                            className="p-1 rounded bg-cyan-100 text-cyan-700"
                          >
                            <ThermometerSnowflake className="w-3 h-3" />
                          </span>
                        )}
                        {c.dangerClass && c.dangerClass !== 'NON_DG' && (
                          <span 
                            title={`Muatan Berbahaya (B3): ${c.dangerClass}`}
                            className="p-1 rounded bg-rose-100 text-rose-700"
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Segel: {c.sealNumber || '-'}
                      </div>
                    </td>

                    {/* Size & Category */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">
                          {c.isoType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({c.teu} TEU)
                        </span>
                      </div>
                      <div className="mt-1">
                        {renderCategoryBadge(c.category)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {renderStatusBadge(c.status)}
                    </td>

                    {/* Yard Location */}
                    <td className="py-3 px-4">
                      {isGateOut ? (
                        <span className="text-slate-400 italic">Sudah keluar</span>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-800 font-semibold font-mono">
                          <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span>
                            Blok {loc.block} | Bay {loc.bay} | Row {loc.row} | T.{loc.tier}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Weight & VGM */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {formatWeight(c.grossWeightKg)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Tara: {formatWeight(c.tareWeightKg)}
                      </div>
                    </td>

                    {/* Line & Vessel */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 truncate max-w-[150px]">
                        {c.shippingLine}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {c.vesselName} {c.voyageNumber ? `(${c.voyageNumber})` : ''}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                      {formatDateTime(c.gateInTime || c.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        {/* View Detail */}
                        <button
                          id={`btn-view-${c.id}`}
                          onClick={() => {
                            onViewDetail(c);
                            playTerminalSound('click');
                          }}
                          className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-md transition-colors cursor-pointer"
                          title="Lihat Detail Petikemas & EIR"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Container */}
                        <button
                          id={`btn-edit-${c.id}`}
                          onClick={() => {
                            onEdit(c);
                            playTerminalSound('click');
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                          title="Edit Spesifikasi & Muatan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Relocate Yard Slot */}
                        {!isGateOut && (
                          <button
                            id={`btn-relocate-${c.id}`}
                            onClick={() => {
                              onRelocate(c);
                              playTerminalSound('relocate');
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            title="Pindah Lokasi Lapangan (Relocate)"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                        )}

                        {/* Gate-Out Process */}
                        {!isGateOut && (
                          <button
                            id={`btn-gateout-${c.id}`}
                            onClick={() => {
                              onGateOut(c);
                              playTerminalSound('gate_out');
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                            title="Proses Gate-Out (Pengeluaran)"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Container */}
                        <button
                          id={`btn-delete-${c.id}`}
                          onClick={() => {
                            onDelete(c);
                            playTerminalSound('alert');
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Hapus / Batalkan Data"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

