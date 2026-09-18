import React, { useState } from 'react';
import { 
  Grid, 
  MapPin, 
  Box, 
  ThermometerSnowflake, 
  AlertTriangle, 
  Layers, 
  Plus
} from 'lucide-react';
import { Container } from '../types/terminal';
import { formatWeight } from '../utils/validators';

interface YardMapVisualizerProps {
  containers: Container[];
  onSelectContainer: (c: Container) => void;
  onOpenCreateWithSlot?: (block: string, bay: string, row: string) => void;
}

export const YardMapVisualizer: React.FC<YardMapVisualizerProps> = ({
  containers,
  onSelectContainer,
  onOpenCreateWithSlot,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string>('A');

  // Blocks configuration
  const BLOCKS = [
    { id: 'A', name: 'Blok A - Lapangan Ekspor Utama', type: 'General Dry Container', maxBays: 8, maxRows: 4, maxTiers: 4 },
    { id: 'B', name: 'Blok B - Lapangan Domestik & Transshipment', type: 'Domestik & Transit', maxBays: 8, maxRows: 4, maxTiers: 4 },
    { id: 'C', name: 'Blok C - Lapangan Reefer (Cold Chain)', type: 'Reefer Electrical Plugs', maxBays: 6, maxRows: 3, maxTiers: 3 },
    { id: 'D', name: 'Blok D - Area Karantina, Bea Cukai & B3', type: 'Inspection & Dangerous Goods', maxBays: 6, maxRows: 3, maxTiers: 3 }
  ];

  const currentBlockConfig = BLOCKS.find(b => b.id === selectedBlock) || BLOCKS[0];

  // Active containers in current block (excluding gate out)
  const blockContainers = containers.filter(
    c => c.status !== 'GATE_OUT' && c.yardLocation?.block === selectedBlock
  );

  // Map to find container at specific bay, row, tier
  const getContainerAt = (bay: number, row: number, tier: number): Container | undefined => {
    const bayStr = bay.toString().padStart(2, '0');
    const rowStr = row.toString().padStart(2, '0');
    const tierStr = tier.toString().padStart(2, '0');

    return blockContainers.find(c => {
      const loc = c.yardLocation;
      return loc && loc.bay === bayStr && loc.row === rowStr && loc.tier === tierStr;
    });
  };

  const getCarrierColor = (line: string) => {
    const lower = line.toLowerCase();
    if (lower.includes('maersk')) return 'bg-sky-500 text-white border-sky-600';
    if (lower.includes('evergreen')) return 'bg-emerald-600 text-white border-emerald-700';
    if (lower.includes('meratus')) return 'bg-red-600 text-white border-red-700';
    if (lower.includes('spil')) return 'bg-blue-700 text-white border-blue-800';
    if (lower.includes('cma')) return 'bg-blue-600 text-white border-blue-700';
    if (lower.includes('one')) return 'bg-pink-600 text-white border-pink-700';
    if (lower.includes('oocl')) return 'bg-orange-600 text-white border-orange-700';
    return 'bg-slate-700 text-white border-slate-800';
  };

  const totalSlots = currentBlockConfig.maxBays * currentBlockConfig.maxRows * currentBlockConfig.maxTiers;
  const occupiedSlots = blockContainers.length;
  const occupancyPercent = Math.round((occupiedSlots / totalSlots) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-5">
      {/* Header & Block Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">
              Visualisasi Peta Lapangan Penumpukan (Container Yard)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Peta penataan bay, row, dan tier petikemas aktif di dermaga pelabuhan.
          </p>
        </div>

        {/* Block Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {BLOCKS.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBlock(b.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedBlock === b.id
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-600/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Blok {b.id}
            </button>
          ))}
        </div>
      </div>

      {/* Block Information Bar */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-slate-900 text-sm">{currentBlockConfig.name}</span>
          <span className="text-slate-500 block text-[11px] mt-0.5">
            Tipe: {currentBlockConfig.type} • Konfigurasi: {currentBlockConfig.maxBays} Bay × {currentBlockConfig.maxRows} Row × {currentBlockConfig.maxTiers} Tier Max
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] text-slate-500">Kepadatan Blok</span>
            <div className="font-bold text-slate-900">
              {occupiedSlots} / {totalSlots} Slot ({occupancyPercent}%)
            </div>
          </div>
          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                occupancyPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${occupancyPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
        <span className="font-semibold text-slate-800">Petunjuk Warna:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-sky-500 border border-sky-600"></span>
          Maersk
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-700"></span>
          Evergreen
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-600 border border-red-700"></span>
          Meratus
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-700 border border-blue-800"></span>
          SPIL
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-100 border border-dashed border-slate-300"></span>
          Slot Kosong (Tersedia)
        </span>
      </div>

      {/* Yard Matrix Display (Bays & Rows) */}
      <div className="space-y-6 pt-2 overflow-x-auto">
        {Array.from({ length: currentBlockConfig.maxBays }, (_, bayIdx) => {
          const bayNum = bayIdx + 1;
          const bayStr = bayNum.toString().padStart(2, '0');

          return (
            <div key={bayStr} className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-3 min-w-[700px]">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono">
                    BAY {bayStr}
                  </span>
                  <span className="text-slate-500 font-normal">
                    (Blok {selectedBlock}, Bay {bayStr})
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Elevasi Penumpukan TIER 1 - {currentBlockConfig.maxTiers}
                </span>
              </div>

              {/* Rows Grid */}
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${currentBlockConfig.maxRows}, minmax(0, 1fr))` }}>
                {Array.from({ length: currentBlockConfig.maxRows }, (_, rowIdx) => {
                  const rowNum = rowIdx + 1;
                  const rowStr = rowNum.toString().padStart(2, '0');

                  return (
                    <div key={rowStr} className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/70">
                      <div className="text-[10px] font-bold text-slate-500 mb-2 text-center uppercase tracking-wider">
                        Row {rowStr}
                      </div>

                      {/* Stacking Tiers (From top tier down to bottom tier 1) */}
                      <div className="flex flex-col-reverse gap-1.5">
                        {Array.from({ length: currentBlockConfig.maxTiers }, (_, tierIdx) => {
                          const tierNum = tierIdx + 1;
                          const tierStr = tierNum.toString().padStart(2, '0');
                          const container = getContainerAt(bayNum, rowNum, tierNum);

                          if (container) {
                            const badgeColor = getCarrierColor(container.shippingLine);
                            return (
                              <div
                                key={tierStr}
                                onClick={() => onSelectContainer(container)}
                                className={`p-2 rounded-md border shadow-xs transition-all cursor-pointer hover:scale-[1.02] ${badgeColor}`}
                                title={`Klik untuk detail: ${container.containerNumber} (${container.shippingLine})`}
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                                  <span className="truncate">{container.containerNumber}</span>
                                  <span className="text-[9px] opacity-80 shrink-0">T{tierStr}</span>
                                </div>
                                <div className="flex items-center justify-between text-[9px] mt-1 opacity-90">
                                  <span className="truncate">{container.shippingLine}</span>
                                  <span>{container.isoType}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 text-[9px]">
                                  {container.isReefer && (
                                    <span className="flex items-center gap-0.5 text-cyan-200">
                                      <ThermometerSnowflake className="w-2.5 h-2.5" />
                                      {container.temperatureCelsius ?? '-'}°C
                                    </span>
                                  )}
                                  {container.dangerClass !== 'NON_DG' && (
                                    <span className="flex items-center gap-0.5 text-rose-200">
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      DG
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          // Empty slot
                          return (
                            <div
                              key={tierStr}
                              onClick={() => {
                                if (onOpenCreateWithSlot) {
                                  onOpenCreateWithSlot(selectedBlock, bayStr, rowStr);
                                }
                              }}
                              className="h-9 border border-dashed border-slate-300 rounded-md bg-white/60 hover:bg-sky-50/60 hover:border-sky-400 flex items-center justify-between px-2 text-[10px] text-slate-400 cursor-pointer transition-colors group"
                              title={`Slot Kosong: Blok ${selectedBlock} Bay ${bayStr} Row ${rowStr} Tier ${tierStr}. Klik untuk menempatkan petikemas.`}
                            >
                              <span className="font-mono text-[9px] text-slate-400">T{tierStr}</span>
                              <span className="text-[10px] group-hover:text-sky-600 flex items-center gap-0.5">
                                <Plus className="w-2.5 h-2.5" /> Kosong
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
