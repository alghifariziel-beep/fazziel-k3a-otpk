import React, { useState } from 'react';
import { 
  Anchor, 
  ShieldCheck, 
  UserCheck, 
  Compass, 
  ArrowRight, 
  Lock, 
  Mail, 
  AlertCircle, 
  Container as ContainerIcon,
  CheckCircle,
  Eye,
  EyeOff,
  Zap,
  Ship,
  Layers,
  Radio
} from 'lucide-react';
import { DEMO_ACCOUNTS, loginWithEmail, loginWithGoogle, quickDemoLogin } from '../services/authService';
import portTerminalBg from '../assets/images/port_terminal_bg_1789101669324.jpg';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onError: (msg: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoadingRole('google');
    try {
      await loginWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      const msg = err.message || 'Gagal masuk dengan akun Google.';
      setErrorMessage(msg);
      onError(msg);
    } finally {
      setLoadingRole(null);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Silakan masukkan alamat email atau username petugas.');
      return;
    }

    setLoadingRole('manual');
    try {
      await loginWithEmail(email, password || 'terminal123');
      onLoginSuccess();
    } catch (err: any) {
      const msg = err.message || 'Gagal masuk. Periksa kembali kredensial Anda.';
      setErrorMessage(msg);
      onError(msg);
    } finally {
      setLoadingRole(null);
    }
  };

  const handleQuickDemo = async (roleKey: 'ADMIN' | 'OPERATOR' | 'PLANNER') => {
    const acc = DEMO_ACCOUNTS[roleKey];
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMessage(null);
    setLoadingRole(roleKey);

    try {
      await quickDemoLogin(roleKey);
      onLoginSuccess();
    } catch (err: any) {
      const msg = err.message || `Gagal login demo ${acc.displayName}`;
      setErrorMessage(msg);
      onError(msg);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Container Terminal Photographic Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={portTerminalBg}
          alt="Terminal Petikemas Internasional"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.7] contrast-[1.1]"
        />
        {/* Deep maritime slate gradient overlay for high contrast & readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95" />
        {/* Subtle coordinate grid accent resembling container yard markings */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf80a_1px,transparent_1px),linear-gradient(to_bottom,#38bdf80a_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      {/* Decorative Top Accent & Port Status */}
      <div className="relative z-10 max-w-4xl mx-auto w-full mb-6 text-center">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-sky-950/80 text-sky-300 text-xs font-semibold mb-3 border border-sky-700/50 shadow-sm backdrop-blur-md">
          <Anchor className="w-3.5 h-3.5 text-sky-400" />
          <span>Sistem Operasional Terminal Petikemas (TOS)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-emerald-300 font-medium">Real Firebase Online</span>
        </div>
        
        <h1 className="text-3xl font-black text-white tracking-tight sm:text-4xl drop-shadow-md">
          Portal Operasional Pelabuhan
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-xl mx-auto drop-shadow">
          Gerbang manajemen terminal kontainer terpadu: pemantauan lapangan penumpukan, arus peti kemas, dan kapal sandar secara real-time.
        </p>

        {/* Live Port Indicators Ribbon */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] font-semibold text-slate-300">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-700/60 backdrop-blur-xs">
            <Ship className="w-3.5 h-3.5 text-sky-400" />
            <span>Quay Berth: 2 Kapal Sandar</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-700/60 backdrop-blur-xs">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Yard Gantry Crane: Siap Operasi</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-700/60 backdrop-blur-xs">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>ISPS Code: Level 1 (Normal)</span>
          </span>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Login Form */}
        <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Masuk Akun Petugas</h2>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan email terdaftar atau pilih salah satu akun demo di samping untuk akses cepat.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Google Sign-In Option (Configured in Firebase) */}
          <div className="mb-5">
            <button
              id="btn-login-google"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loadingRole !== null}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loadingRole === 'google' ? (
                <>
                  <span className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></span>
                  <span>Menghubungkan ke Akun Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Masuk dengan Akun Google (Resmi)</span>
                </>
              )}
            </button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-white px-3 text-slate-400 font-semibold">Atau Masuk dengan Email Operator</span>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email / Username Petugas
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@terminalpetikemas.id"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi (Opsional untuk Petugas Demo)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label="Tampilkan atau sembunyikan password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-login-submit"
                type="submit"
                disabled={loadingRole !== null}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-sky-600/20 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loadingRole === 'manual' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Mengautentikasi ke Terminal...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem Operasional</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Sertifikasi Keamanan ISPS Code Port
            </span>
            <span className="text-slate-400">Versi 4.2-Prod</span>
          </div>
        </div>

        {/* Right / Quick Demo Logins */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="bg-slate-900/85 border border-slate-700/80 rounded-2xl p-5 backdrop-blur-md shadow-xl text-white">
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Akses Cepat Demo (1-Klik)</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Klik salah satu peran operasional di bawah untuk otomatis masuk ke sistem tanpa mengetik:
            </p>

            <div className="space-y-2.5">
              {/* Demo Admin Card */}
              <button
                id="btn-demo-admin"
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                disabled={loadingRole !== null}
                className="w-full text-left p-3.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 hover:border-sky-400 shadow-xs hover:shadow-md transition-all group flex items-start gap-3 disabled:opacity-60 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-sky-600 text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs shadow-sky-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-sky-300">
                      Super Admin (Terminal Manager)
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-900/80 text-sky-200 border border-sky-700/50">
                      Utama
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                    {DEMO_ACCOUNTS.ADMIN.email}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                    {DEMO_ACCOUNTS.ADMIN.description}
                  </p>
                </div>
              </button>

              {/* Demo Operator Card */}
              <button
                id="btn-demo-operator"
                type="button"
                onClick={() => handleQuickDemo('OPERATOR')}
                disabled={loadingRole !== null}
                className="w-full text-left p-3.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all group flex items-start gap-3 disabled:opacity-60 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs shadow-emerald-500/30">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                      Yard & Gate Operator
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-700/50">
                      Lapangan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                    {DEMO_ACCOUNTS.OPERATOR.email}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                    {DEMO_ACCOUNTS.OPERATOR.description}
                  </p>
                </div>
              </button>

              {/* Demo Planner Card */}
              <button
                id="btn-demo-planner"
                type="button"
                onClick={() => handleQuickDemo('PLANNER')}
                disabled={loadingRole !== null}
                className="w-full text-left p-3.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all group flex items-start gap-3 disabled:opacity-60 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs shadow-indigo-500/30">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                      Vessel & Berthing Planner
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-900/80 text-indigo-200 border border-indigo-700/50">
                      Dermaga
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                    {DEMO_ACCOUNTS.PLANNER.email}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                    {DEMO_ACCOUNTS.PLANNER.description}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Real Database Indicator Card */}
          <div className="bg-slate-900/85 rounded-2xl p-4 border border-slate-700/80 backdrop-blur-md shadow-xl text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <ContainerIcon className="w-4 h-4 text-sky-400" />
              <span>Penyimpanan Nyata Cloud Firestore</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Semua transaksi petikemas, penumpukan lapangan, dan audit log disimpan secara persisten di Google Cloud Firestore tanpa localStorage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
