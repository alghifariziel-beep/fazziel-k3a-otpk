import React from 'react';
import { 
  Box, 
  Layers, 
  PieChart, 
  Truck, 
  ThermometerSnowflake, 
  ShieldAlert
} from 'lucide-react';
import { Container } from '../types/terminal';

interface StatsBannerProps {
  containers: Container[];
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ containers }) => {
  const activeContainers = containers.filter(c => c.status !== 'GATE_OUT');
  const totalBoxes = activeContainers.length;
  const totalTeus = activeContainers.reduce((acc, c) => acc + (c.teu || 1), 0);
  
  // Total yard capacity assumption: 200 TEUs capacity for prototype terminal blocks A-D
  const totalCapacityTeus = 120;
  const occupancyRate = Math.min(100, Math.round((totalTeus / totalCapacityTeus) * 100));

  const reeferCount = activeContainers.filter(c => c.isReefer).length;
  const dgCount = activeContainers.filter(c => c.dangerClass !== 'NON_DG').length;
  const customsHoldCount = activeContainers.filter(c => c.status === 'CUSTOMS_HOLD').length;
  const gateOutCount = containers.filter(c => c.status === 'GATE_OUT').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
      {/* Box Count */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold">Total Box Aktif</span>
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
            <Box className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {totalBoxes}
          <span className="text-xs font-medium text-slate-500 ml-1.5 font-sans">Unit</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Di dalam area terminal
        </div>
      </div>

      {/* TEU Calculation */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold">Total Kapasitas</span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {totalTeus}
          <span className="text-xs font-medium text-slate-500 ml-1.5 font-sans">TEU</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Twenty-Foot Equiv. Unit
        </div>
      </div>

      {/* Yard Occupancy */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold">Okupansi Yard</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
          {occupancyRate}%
          <span className="text-xs font-medium text-slate-500">/ {totalCapacityTeus} TEU</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              occupancyRate > 85 ? 'bg-rose-500' : occupancyRate > 65 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${occupancyRate}%` }}
          ></div>
        </div>
      </div>

      {/* Reefer Plugged */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold">Kontainer Reefer</span>
          <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
            <ThermometerSnowflake className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {reeferCount}
          <span className="text-xs font-medium text-slate-500 ml-1.5 font-sans">Box</span>
        </div>
        <div className="text-[11px] text-cyan-700 font-medium mt-1">
          Plug-in monitor aktif
        </div>
      </div>

      {/* Dangerous Goods & Customs */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold">DG & Bea Cukai</span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {dgCount + customsHoldCount}
          <span className="text-xs font-medium text-slate-500 ml-1.5 font-sans">Box</span>
        </div>
        <div className="text-[11px] text-amber-700 font-medium mt-1">
          {customsHoldCount} Tahanan BC, {dgCount} B3/DG
        </div>
      </div>

      {/* Gate Out Total */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold">Telah Gate-Out</span>
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {gateOutCount}
          <span className="text-xs font-medium text-slate-500 ml-1.5 font-sans">Unit</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Keluar ke truk consignee
        </div>
      </div>
    </div>
  );
};
