import React, { useState } from 'react';
import { 
  Anchor, 
  Ship, 
  Layers, 
  Radio, 
  Wind, 
  Sun, 
  Moon, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  CheckCircle2,
  Compass,
  Sparkles
} from 'lucide-react';
import dayPortImg from '../assets/images/port_terminal_bg_1789101669324.jpg';
import duskPortImg from '../assets/images/terminal_yard_dusk_1789101707585.jpg';

interface TerminalHeroBannerProps {
  totalContainers: number;
  onToggleFullBackground?: (enabled: boolean) => void;
  isFullBgEnabled?: boolean;
}

export const TerminalHeroBanner: React.FC<TerminalHeroBannerProps> = ({
  totalContainers,
  onToggleFullBackground,
  isFullBgEnabled = true
}) => {
  const [selectedTheme, setSelectedTheme] = useState<'day' | 'dusk'>('day');
  const [isExpanded, setIsExpanded] = useState(true);

  const activeImg = selectedTheme === 'day' ? dayPortImg : duskPortImg;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-lg mb-6 bg-slate-950 text-white">
      {/* Container Terminal Photographic Background with Glass Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={activeImg}
          alt="Latar Terminal Petikemas"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.7] contrast-[1.1] transform transition-transform duration-1000 scale-100 hover:scale-105"
        />
        {/* Cinematic Gradient Overlays for optimal contrast & text sharpness */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />
        {/* High-tech terminal coordinate grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf80d_1px,transparent_1px),linear-gradient(to_bottom,#38bdf80d_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-5 sm:p-6">
        {/* Top Header Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold backdrop-blur-md">
              <Anchor className="w-3.5 h-3.5 text-sky-400" />
              <span>Nusantara Container Terminal (NCT-1)</span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Operasional Maritim 24/7
            </span>
          </div>

          {/* Quick Controls: Theme & Wallpaper Toggle */}
          <div className="flex items-center gap-2">
            {/* Day / Dusk Selector */}
            <div className="flex items-center bg-slate-900/80 border border-slate-700/80 rounded-xl p-1 text-xs backdrop-blur-md">
              <button
                type="button"
                onClick={() => setSelectedTheme('day')}
                title="Latar Siang Quayside"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedTheme === 'day' 
                    ? 'bg-sky-600 text-white font-bold shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dermaga Siang</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTheme('dusk')}
                title="Latar Senja Yard"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedTheme === 'dusk' 
                    ? 'bg-amber-600 text-white font-bold shadow-xs' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lapangan Senja</span>
              </button>
            </div>

            {/* Background Fullscreen Wallpaper Toggle */}
            {onToggleFullBackground && (
              <button
                type="button"
                onClick={() => onToggleFullBackground(!isFullBgEnabled)}
                title="Aktifkan/Matikan latar terminal pada seluruh halaman"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
                  isFullBgEnabled
                    ? 'bg-sky-500/20 border-sky-400/50 text-sky-200 hover:bg-sky-500/30'
                    : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden md:inline">Latar Belakang:</span>
                <span>{isFullBgEnabled ? 'Aktif' : 'Minimalis'}</span>
              </button>
            )}

            {/* Minimize / Maximize */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors backdrop-blur-md cursor-pointer"
              title={isExpanded ? 'Sembunyikan Detail Dermaga' : 'Buka Detail Dermaga'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Banner Headline */}
        <div className="max-w-2xl">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md flex items-center gap-2">
            <span>Pusat Kendali Operasional Terminal Petikemas</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed drop-shadow">
            Pemantauan real-time Ship-to-Shore (STS) Crane, alokasi blok penumpukan yard (Blok A-D), dan pergerakan gerbang peti kemas terintegrasi Google Cloud Firestore.
          </p>
        </div>

        {/* Expandable Port Telemetry Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Dermaga Sandar */}
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-3 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Ship className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Dermaga Quayside</span>
              </div>
              <div className="text-sm font-bold text-white">Berth 01 & 02</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>2 Kapal Sandar (Aktif)</span>
              </div>
            </div>

            {/* Status RTG & STS Crane */}
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-3 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Alat Bongkar Muat</span>
              </div>
              <div className="text-sm font-bold text-white">STS & RTG Crane</div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                14/14 Unit Operasional 100%
              </div>
            </div>

            {/* Kondisi Maritim Cuaca */}
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-3 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Cuaca Maritim</span>
              </div>
              <div className="text-sm font-bold text-white">12 Knot • Barat Daya</div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                Gelombang 0.4m • Tenang
              </div>
            </div>

            {/* Standar Keamanan ISPS */}
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-3 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">ISPS Code Security</span>
              </div>
              <div className="text-sm font-bold text-white">Security Level 1</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Gerbang Terjaga Aman</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
