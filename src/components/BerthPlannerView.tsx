import React, { useState } from 'react';
import { 
  Ship, 
  Anchor, 
  Clock, 
  Layers, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  Compass, 
  MapPin, 
  Filter,
  ShieldCheck,
  ChevronRight,
  Radio
} from 'lucide-react';
import { Container } from '../types/terminal';
import { playTerminalSound } from '../utils/sound';

interface BerthPlannerViewProps {
  containers: Container[];
  onFilterVessel: (vesselName: string) => void;
  onOpenCreateForVessel: (vesselName: string, voyage: string, shippingLine: string) => void;
}

interface VesselSchedule {
  id: string;
  name: string;
  callSign: string;
  flag: string;
  shippingLine: string;
  voyageIn: string;
  voyageOut: string;
  berthId: 'BERTH-01' | 'BERTH-02' | 'ANCHORAGE';
  berthPosition: string; // e.g., 'Meter 00 - 300'
  lengthOverallMeters: number;
  draftMeters: number;
  status: 'MOORED_WORKING' | 'MOORED_COMPLETED' | 'PILOT_BOARDING' | 'ANCHORAGE_WAITING';
  statusLabel: string;
  eta: string;
  etd: string;
  totalDischargeTeu: number;
  completedDischargeTeu: number;
  totalLoadTeu: number;
  completedLoadTeu: number;
  assignedCranes: string[];
  movesPerHour: number;
}

export const BerthPlannerView: React.FC<BerthPlannerViewProps> = ({
  containers,
  onFilterVessel,
  onOpenCreateForVessel,
}) => {
  const [activeBerthTab, setActiveBerthTab] = useState<'ALL' | 'BERTH-01' | 'BERTH-02'>('ALL');
  const [selectedVessel, setSelectedVessel] = useState<string | null>('MV MAERSK PROSPECTOR');

  const VESSELS: VesselSchedule[] = [
    {
      id: 'VESSEL-001',
      name: 'MV MAERSK PROSPECTOR',
      callSign: '9V8201',
      flag: '🇸🇬 Singapore',
      shippingLine: 'Maersk Line',
      voyageIn: '2410W',
      voyageOut: '2410E',
      berthId: 'BERTH-01',
      berthPosition: 'Quay 01: Meter 20 - 314',
      lengthOverallMeters: 294,
      draftMeters: 13.8,
      status: 'MOORED_WORKING',
      statusLabel: 'Sandar & Bongkar Muat Aktif',
      eta: 'Kemarin, 08:30 WIB',
      etd: 'Hari Ini, 22:00 WIB',
      totalDischargeTeu: 420,
      completedDischargeTeu: 345,
      totalLoadTeu: 380,
      completedLoadTeu: 210,
      assignedCranes: ['STS-01 (Quayside Crane)', 'STS-02 (Quayside Crane)'],
      movesPerHour: 28.5,
    },
    {
      id: 'VESSEL-002',
      name: 'MV EVER GLORY',
      callSign: 'BK8992',
      flag: '🇵🇦 Panama',
      shippingLine: 'Evergreen Marine',
      voyageIn: '089N',
      voyageOut: '090S',
      berthId: 'BERTH-01',
      berthPosition: 'Quay 01: Meter 330 - 664',
      lengthOverallMeters: 334,
      draftMeters: 14.2,
      status: 'MOORED_WORKING',
      statusLabel: 'Sandar & Proses Muat Ekspor',
      eta: 'Hari Ini, 04:15 WIB',
      etd: 'Besok, 14:00 WIB',
      totalDischargeTeu: 280,
      completedDischargeTeu: 280,
      totalLoadTeu: 510,
      completedLoadTeu: 215,
      assignedCranes: ['STS-03 (Super Post-Panamax Crane)'],
      movesPerHour: 31.0,
    },
    {
      id: 'VESSEL-003',
      name: 'KM MERATUS MEDAN',
      callSign: 'PK7712',
      flag: '🇮🇩 Indonesia',
      shippingLine: 'Meratus Line',
      voyageIn: 'M24-11',
      voyageOut: 'M24-12',
      berthId: 'BERTH-02',
      berthPosition: 'Quay 02: Meter 10 - 180',
      lengthOverallMeters: 170,
      draftMeters: 9.5,
      status: 'MOORED_WORKING',
      statusLabel: 'Sandar & Bongkar Domestik',
      eta: 'Hari Ini, 09:00 WIB',
      etd: 'Hari Ini, 19:30 WIB',
      totalDischargeTeu: 180,
      completedDischargeTeu: 160,
      totalLoadTeu: 140,
      completedLoadTeu: 95,
      assignedCranes: ['STS-04 (Gantry Feeder Crane)'],
      movesPerHour: 24.2,
    },
    {
      id: 'VESSEL-004',
      name: 'KM SPIL NIKEN',
      callSign: 'PK3390',
      flag: '🇮🇩 Indonesia',
      shippingLine: 'SPIL',
      voyageIn: 'SP-908',
      voyageOut: 'SP-909',
      berthId: 'ANCHORAGE',
      berthPosition: 'Area Labuh Luar (Anchorage Waypoint C)',
      lengthOverallMeters: 160,
      draftMeters: 8.8,
      status: 'PILOT_BOARDING',
      statusLabel: 'Menunggu Pandu / Menuju Berth 02',
      eta: 'Hari Ini, 18:00 WIB',
      etd: 'Besok, 20:00 WIB',
      totalDischargeTeu: 120,
      completedDischargeTeu: 0,
      totalLoadTeu: 160,
      completedLoadTeu: 0,
      assignedCranes: ['STS-04 (Antrian Berikutnya)'],
      movesPerHour: 0,
    }
  ];

  const filteredVessels = activeBerthTab === 'ALL' 
    ? VESSELS 
    : VESSELS.filter(v => v.berthId === activeBerthTab);

  const activeVesselData = VESSELS.find(v => v.name === selectedVessel) || VESSELS[0];

  // Count related containers in Firestore
  const relatedContainers = containers.filter(
    c => c.vesselName?.toLowerCase().includes(activeVesselData.name.toLowerCase().split(' ')[1]?.toLowerCase() || '')
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Telemetry */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Ship className="w-5 h-5 text-sky-600" />
              <h2 className="text-base font-bold text-slate-900">
                Pusat Perencanaan Sandar Kapal & Manajemen Dermaga (Berth & Quay)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Alokasi panjang tambatan dermaga, produktivitas gantry crane (MPH), dan jadwal kedatangan kapal.
            </p>
          </div>

          {/* Tab Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setActiveBerthTab('ALL');
                playTerminalSound('click');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeBerthTab === 'ALL'
                  ? 'bg-white text-sky-900 shadow-xs border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Dermaga (4 Kapal)
            </button>
            <button
              onClick={() => {
                setActiveBerthTab('BERTH-01');
                playTerminalSound('click');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeBerthTab === 'BERTH-01'
                  ? 'bg-white text-sky-900 shadow-xs border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quay 01 (Internasional)
            </button>
            <button
              onClick={() => {
                setActiveBerthTab('BERTH-02');
                playTerminalSound('click');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeBerthTab === 'BERTH-02'
                  ? 'bg-white text-sky-900 shadow-xs border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quay 02 (Domestik)
            </button>
          </div>
        </div>

        {/* Visual Quay Representation */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quay 01 Representation */}
          <div className="p-4 rounded-xl bg-slate-900 text-white relative overflow-hidden border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-bold text-sky-400 flex items-center gap-1.5">
                <Anchor className="w-4 h-4" />
                DERMAGA QUAY 01 (Panjang 700m • Draft 14.5m)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                2 Kapal Sandar
              </span>
            </div>

            {/* Visual Dock Meter Line */}
            <div className="space-y-2">
              <div className="flex gap-2 h-14 bg-slate-800 rounded-lg p-1.5 relative">
                {/* Vessel 1 on Berth 01 */}
                <div 
                  onClick={() => {
                    setSelectedVessel('MV MAERSK PROSPECTOR');
                    playTerminalSound('click');
                  }}
                  className="w-[45%] bg-sky-600 hover:bg-sky-500 rounded-md p-1.5 flex flex-col justify-between cursor-pointer transition-all border border-sky-400/40"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="truncate">MV MAERSK PROSPECTOR</span>
                    <span className="text-sky-200 font-mono">294m</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-sky-100">
                    <span>STS-01 & STS-02</span>
                    <span className="bg-sky-900/60 px-1 rounded">68%</span>
                  </div>
                </div>

                {/* Vessel 2 on Berth 01 */}
                <div 
                  onClick={() => {
                    setSelectedVessel('MV EVER GLORY');
                    playTerminalSound('click');
                  }}
                  className="w-[50%] bg-emerald-700 hover:bg-emerald-600 rounded-md p-1.5 flex flex-col justify-between cursor-pointer transition-all border border-emerald-400/40"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="truncate">MV EVER GLORY</span>
                    <span className="text-emerald-200 font-mono">334m</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-emerald-100">
                    <span>STS-03</span>
                    <span className="bg-emerald-950/60 px-1 rounded">54%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Meter 0</span>
                <span>Meter 350 (Bollard 12)</span>
                <span>Meter 700 (Bollard 24)</span>
              </div>
            </div>
          </div>

          {/* Quay 02 Representation */}
          <div className="p-4 rounded-xl bg-slate-900 text-white relative overflow-hidden border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <Anchor className="w-4 h-4" />
                DERMAGA QUAY 02 (Panjang 350m • Draft 12.5m)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                1 Sandar • 1 Menunggu
              </span>
            </div>

            {/* Visual Dock Meter Line */}
            <div className="space-y-2">
              <div className="flex gap-2 h-14 bg-slate-800 rounded-lg p-1.5 relative">
                {/* Vessel on Berth 02 */}
                <div 
                  onClick={() => {
                    setSelectedVessel('KM MERATUS MEDAN');
                    playTerminalSound('click');
                  }}
                  className="w-[55%] bg-rose-700 hover:bg-rose-600 rounded-md p-1.5 flex flex-col justify-between cursor-pointer transition-all border border-rose-400/40"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="truncate">KM MERATUS MEDAN</span>
                    <span className="text-rose-200 font-mono">170m</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-rose-100">
                    <span>STS-04 Feeder</span>
                    <span className="bg-rose-950/60 px-1 rounded">82%</span>
                  </div>
                </div>

                {/* Empty buffer slot */}
                <div className="flex-1 border border-dashed border-slate-600 rounded-md flex items-center justify-center text-[10px] text-slate-400">
                  Buffer Sandar 180m (Siap KM SPIL NIKEN)
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Meter 0</span>
                <span>Meter 175 (Bollard 06)</span>
                <span>Meter 350 (Bollard 12)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Vessel List & Selected Detail Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Vessel Schedule Cards (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>Daftar Kapal Sandar & Kedatangan:</span>
            <span>{filteredVessels.length} Kapal Terdaftar</span>
          </div>

          {filteredVessels.map((v) => {
            const isSelected = selectedVessel === v.name;
            const totalWork = v.totalDischargeTeu + v.totalLoadTeu;
            const completedWork = v.completedDischargeTeu + v.completedLoadTeu;
            const progressPercent = Math.round((completedWork / (totalWork || 1)) * 100);

            return (
              <div
                key={v.id}
                onClick={() => {
                  setSelectedVessel(v.name);
                  playTerminalSound('click');
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                  isSelected 
                    ? 'border-sky-500 shadow-md ring-2 ring-sky-500/20' 
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs shrink-0">
                      <Ship className="w-4 h-4 text-sky-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900">{v.name}</h3>
                        <span className="text-[10px] font-mono text-slate-500">{v.flag}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {v.shippingLine} • Voyage {v.voyageIn} / {v.voyageOut}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border self-start sm:self-center ${
                    v.status === 'MOORED_WORKING'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {v.statusLabel}
                  </span>
                </div>

                {/* Progress Bar & Cranes */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Kemajuan Bongkar Muat:</span>
                    <span className="font-bold text-slate-900">
                      {completedWork} / {totalWork} TEU ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                    <span className="font-mono">{v.berthPosition}</span>
                    <span className="font-bold text-sky-800">
                      Kecepatan: {v.movesPerHour} Box / Jam
                    </span>
                  </div>
                </div>

                {/* Quick Times */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>ETA: <strong className="text-slate-700">{v.eta}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>ETD: <strong className="text-slate-700">{v.etd}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Vessel Inspector Card (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-600 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900">
                Inspeksi Kapal & Rencana Kontainer
              </h3>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
              {activeVesselData.callSign}
            </span>
          </div>

          {/* Vessel Meta */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 text-white space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                KAPAL AKTIF TERPILIH
              </span>
              <h4 className="text-base font-black text-sky-400 font-mono">
                {activeVesselData.name}
              </h4>
              <p className="text-xs text-slate-300">
                Panjang: {activeVesselData.lengthOverallMeters}m • Kedalaman Draft: {activeVesselData.draftMeters}m
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Total Bongkar (Inbound)</span>
                <span className="font-bold text-slate-900">{activeVesselData.completedDischargeTeu} / {activeVesselData.totalDischargeTeu} TEU</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Total Muat (Outbound)</span>
                <span className="font-bold text-slate-900">{activeVesselData.completedLoadTeu} / {activeVesselData.totalLoadTeu} TEU</span>
              </div>
            </div>

            {/* Cranes List */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 block">
                Alokasi STS Quay Crane:
              </span>
              {activeVesselData.assignedCranes.map((crane, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{crane}</span>
                </div>
              ))}
            </div>

            {/* Matching Containers in Firestore Count */}
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-center justify-between">
              <div>
                <span className="font-bold block">Petikemas Terkait di Sistem:</span>
                <span className="text-[11px] text-sky-700">
                  {relatedContainers.length} unit terdaftar untuk kapal ini
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onFilterVessel(activeVesselData.name);
                  playTerminalSound('click');
                }}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Lihat Daftar
              </button>
            </div>
          </div>

          {/* Vessel Quick Actions */}
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenCreateForVessel(
                  activeVesselData.name,
                  activeVesselData.voyageOut,
                  activeVesselData.shippingLine
                );
                playTerminalSound('gate_in');
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Ship className="w-4 h-4 text-sky-400" />
              <span>Input Gate-In Muat Kapal Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
