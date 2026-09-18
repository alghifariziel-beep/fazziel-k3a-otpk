import React, { useState, useEffect } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  LoginForm 
} from './components/LoginForm';
import { 
  TerminalHeroBanner 
} from './components/TerminalHeroBanner';
import { 
  StatsBanner 
} from './components/StatsBanner';
import portTerminalBg from './assets/images/port_terminal_bg_1789101669324.jpg';
import { 
  ContainerTable 
} from './components/ContainerTable';
import { 
  YardMapVisualizer 
} from './components/YardMapVisualizer';
import { 
  BerthPlannerView 
} from './components/BerthPlannerView';
import { 
  ContainerFormModal 
} from './components/ContainerFormModal';
import { 
  ContainerDetailModal 
} from './components/ContainerDetailModal';
import { 
  RelocateModal 
} from './components/RelocateModal';
import { 
  GateOutModal 
} from './components/GateOutModal';
import { 
  DeleteConfirmModal 
} from './components/DeleteConfirmModal';
import { 
  AuditLogModal 
} from './components/AuditLogModal';
import { 
  ToastContainer, 
  ToastMessage 
} from './components/Toast';
import { 
  Container, 
  UserProfile, 
  YardLocation,
  ContainerStatus
} from './types/terminal';
import { 
  subscribeContainers, 
  createContainer, 
  updateContainer, 
  deleteContainer, 
  relocateContainer, 
  processGateOut, 
  seedInitialDataIfEmpty 
} from './services/containerService';
import { 
  subscribeAuthState, 
  logoutUser 
} from './services/authService';
import { 
  History, 
  RefreshCw, 
  Anchor, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Ship,
  Grid,
  Table as TableIcon
} from 'lucide-react';

export default function App() {
  // Auth state - Firebase is the sole source of truth (no localStorage)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isFullBgEnabled, setIsFullBgEnabled] = useState<boolean>(true);

  // Operational Data from Firebase Firestore
  const [containers, setContainers] = useState<Container[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Active view: 'table' | 'yard' | 'berth'
  const [activeView, setActiveView] = useState<'table' | 'yard' | 'berth'>('table');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<Container | null>(null);
  const [detailContainer, setDetailContainer] = useState<Container | null>(null);
  const [relocateTarget, setRelocateTarget] = useState<Container | null>(null);
  const [gateOutTarget, setGateOutTarget] = useState<Container | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Container | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [slotPreset, setSlotPreset] = useState<{ block: string; bay: string; row: string } | null>(null);
  const [vesselPreset, setVesselPreset] = useState<{ vesselName: string; voyage: string; shippingLine: string } | null>(null);

  // Seeding state
  const [isSeeding, setIsSeeding] = useState(false);

  // Toast feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = subscribeAuthState((user, loading) => {
      setCurrentUser(user);
      setIsAuthLoading(loading);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Subscribe to Firestore containers collection
  useEffect(() => {
    if (!currentUser) return;

    setIsDataLoading(true);
    setDbError(null);

    const unsubscribeContainers = subscribeContainers(
      (items) => {
        setContainers(items);
        setIsDataLoading(false);
      },
      (err) => {
        console.error('Firestore connection error:', err);
        setDbError('Gagal menyinkronkan data petikemas dari server Firebase.');
        setIsDataLoading(false);
        addToast('error', 'Koneksi Database Terputus', err.message);
      }
    );

    return () => unsubscribeContainers();
  }, [currentUser]);

  // Handle Seed Data
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const seeded = await seedInitialDataIfEmpty(currentUser?.displayName || 'Admin');
      if (seeded) {
        addToast('success', 'Data Contoh Dimuat', '7 data petikemas standar pelabuhan berhasil dimasukkan ke Firestore.');
      } else {
        addToast('info', 'Database Telah Terisi', 'Koleksi petikemas di Firestore sudah memiliki data aktif.');
      }
    } catch (err: any) {
      addToast('error', 'Gagal Memuat Data Contoh', err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  // CRUD: Create or Edit Container
  const handleSaveContainer = async (formData: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>) => {
    const operatorName = currentUser?.displayName || 'Operator';

    if (editingContainer) {
      // Update
      await updateContainer(editingContainer.id, formData, operatorName);
      addToast(
        'success',
        'Data Petikemas Diperbarui',
        `Perubahan spesifikasi petikemas ${formData.containerNumber} telah tersimpan di Firebase.`
      );
    } else {
      // Create
      await createContainer(formData, operatorName);
      addToast(
        'success',
        'Penerimaan Berhasil (Gate-In)',
        `Petikemas ${formData.containerNumber} berhasil diregistrasi dan dialokasikan ke Blok ${formData.yardLocation.block}-${formData.yardLocation.bay}.`
      );
    }
    setEditingContainer(null);
    setSlotPreset(null);
    setVesselPreset(null);
  };

  // CRUD: Delete Container
  const handleDeleteConfirm = async (id: string, containerNumber: string, reason: string) => {
    const operatorName = currentUser?.displayName || 'Operator';
    await deleteContainer(id, containerNumber, operatorName, reason);
    addToast(
      'success',
      'Petikemas Dihapus',
      `Data petikemas ${containerNumber} telah dihapus permanen dari database Firebase.`
    );
  };

  // Action: Relocate Yard Location
  const handleRelocateConfirm = async (
    id: string,
    containerNumber: string,
    newLoc: YardLocation,
    oldLoc: YardLocation
  ) => {
    const operatorName = currentUser?.displayName || 'Operator';
    await relocateContainer(id, containerNumber, newLoc, oldLoc, operatorName);
    addToast(
      'success',
      'Relokasi Lapangan Berhasil',
      `Petikemas ${containerNumber} dipindahkan dari Blok ${oldLoc.block}-${oldLoc.bay} ke Blok ${newLoc.block}-${newLoc.bay}-${newLoc.row}-${newLoc.tier}.`
    );
  };

  // Action: Process Gate-Out
  const handleGateOutConfirm = async (
    id: string,
    containerNumber: string,
    truckPlate: string,
    driverName: string,
    notes: string
  ) => {
    const operatorName = currentUser?.displayName || 'Operator';
    await processGateOut(id, containerNumber, truckPlate, driverName, notes, operatorName);
    addToast(
      'success',
      'Gate-Out Selesai Diproses',
      `Petikemas ${containerNumber} telah dikeluarkan dari terminal bersama truk ${truckPlate}.`
    );
  };

  // Action: Batch Status Update (e.g. Customs Cleared, Ready for Vessel Loading)
  const handleBatchStatusUpdate = async (ids: string[], newStatus: ContainerStatus) => {
    const operatorName = currentUser?.displayName || 'Supervisor';
    let count = 0;
    for (const id of ids) {
      const target = containers.find(c => c.id === id);
      if (target) {
        await updateContainer(id, { ...target, status: newStatus }, operatorName);
        count++;
      }
    }
    addToast(
      'success',
      'Operasi Massal Berhasil',
      `${count} petikemas berhasil diperbarui menjadi status ${newStatus}.`
    );
  };

  // Open create modal with preset slot clicked on yard map
  const handleOpenCreateWithSlot = (block: string, bay: string, row: string) => {
    setSlotPreset({ block, bay, row });
    setEditingContainer(null);
    setVesselPreset(null);
    setIsCreateOpen(true);
  };

  // Open create modal pre-filled for a specific vessel
  const handleOpenCreateForVessel = (vesselName: string, voyage: string, shippingLine: string) => {
    setVesselPreset({ vesselName, voyage, shippingLine });
    setSlotPreset(null);
    setEditingContainer(null);
    setIsCreateOpen(true);
  };

  // Auth logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      addToast('info', 'Anda Telah Keluar', 'Sesi login telah ditutup dengan aman.');
    } catch (err: any) {
      addToast('error', 'Gagal Keluar', err.message);
    }
  };

  // 1. Initial Loading Spinner
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 relative flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={portTerminalBg}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.5] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-slate-950/80" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-600/40 mb-4 animate-bounce">
            <Anchor className="w-7 h-7" />
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <span className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
            <span>Menghubungkan ke Sistem Terminal Firebase...</span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            Sinkronisasi real-time Cloud Firestore & Firebase Authentication
          </p>
        </div>
      </div>
    );
  }

  // 2. Default View when NOT Logged In: Form Login
  if (!currentUser) {
    return (
      <>
        <LoginForm
          onLoginSuccess={() => {
            addToast('success', 'Berhasil Masuk', 'Selamat bertugas di Sistem Operasional Terminal Petikemas.');
          }}
          onError={(msg) => {
            addToast('error', 'Gagal Masuk', msg);
          }}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  // 3. Authenticated View: Full Terminal Operations System
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative">
      {/* Background Container Terminal Photographic Layer */}
      {isFullBgEnabled && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={portTerminalBg}
            alt="Latar Terminal Petikemas"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-[0.08] filter saturate-150 brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-100/90 via-slate-100/95 to-slate-100" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c708_1px,transparent_1px),linear-gradient(to_bottom,#0284c708_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
      )}

      {/* Top Navigation */}
      <div className="relative z-20">
        <Navbar
          user={currentUser}
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenCreate={() => {
            setEditingContainer(null);
            setSlotPreset(null);
            setVesselPreset(null);
            setIsCreateOpen(true);
          }}
          onOpenAuditLogs={() => setIsAuditOpen(true)}
          onLogout={handleLogout}
          onSeedData={handleSeedData}
          isSeeding={isSeeding}
          totalCount={containers.length}
        />
      </div>

      {/* Main Workspace */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error notification if Firestore is down */}
        {dbError && (
          <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{dbError}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 font-semibold cursor-pointer"
            >
              Muat Ulang
            </button>
          </div>
        )}

        {/* Port Terminal Photographic Hero Banner with Quay & Telemetry Status */}
        <TerminalHeroBanner
          totalContainers={containers.length}
          onToggleFullBackground={setIsFullBgEnabled}
          isFullBgEnabled={isFullBgEnabled}
        />

        {/* Real-time KPI Stats Banner */}
        <StatsBanner containers={containers} />

        {/* Sub-header Controls: Quick Actions & View Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {activeView === 'table' && 'Monitoring & Inventaris Petikemas (Table View)'}
              {activeView === 'yard' && 'Peta Lapangan Penumpukan (Yard Matrix View)'}
              {activeView === 'berth' && 'Perencanaan Sandar Kapal & Quayside Gantry (Berth Planner)'}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
              {containers.length} Box Terdaftar
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-open-audit-log"
              onClick={() => setIsAuditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-sky-600" />
              <span>Log Audit Operasional</span>
            </button>

            {containers.length === 0 && !isDataLoading && (
              <button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-900 transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-amber-600" />
                <span>{isSeeding ? 'Memuat...' : 'Muat Contoh Box'}</span>
              </button>
            )}
          </div>
        </div>

        {/* View Component: Table, Yard Grid, or Berth Planner */}
        {isDataLoading && containers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold text-slate-700">Mengambil data real-time dari Firebase Firestore...</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Memastikan sinkronisasi single source of truth</p>
          </div>
        ) : activeView === 'table' ? (
          <ContainerTable
            containers={containers}
            onViewDetail={(c) => setDetailContainer(c)}
            onEdit={(c) => {
              setEditingContainer(c);
              setIsCreateOpen(true);
            }}
            onRelocate={(c) => setRelocateTarget(c)}
            onGateOut={(c) => setGateOutTarget(c)}
            onDelete={(c) => setDeleteTarget(c)}
            onOpenCreate={() => {
              setEditingContainer(null);
              setSlotPreset(null);
              setVesselPreset(null);
              setIsCreateOpen(true);
            }}
            onSeedData={handleSeedData}
            onBatchStatusUpdate={handleBatchStatusUpdate}
            isSeeding={isSeeding}
          />
        ) : activeView === 'yard' ? (
          <YardMapVisualizer
            containers={containers}
            onSelectContainer={(c) => setDetailContainer(c)}
            onOpenCreateWithSlot={handleOpenCreateWithSlot}
          />
        ) : (
          <BerthPlannerView
            containers={containers}
            onFilterVessel={(vessel) => {
              setActiveView('table');
            }}
            onOpenCreateForVessel={handleOpenCreateForVessel}
          />
        )}
      </main>

      {/* Footer info */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-3.5 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">TOS Nusantara (Terminal Operating System)</span>
            <span>•</span>
            <span>Standar ISO 6346 & ISPS Code Certified</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Cloud Database: <code className="text-slate-600 font-mono">Firestore (containers, audit_logs)</code></span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Create / Edit Container Modal */}
      <ContainerFormModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingContainer(null);
          setSlotPreset(null);
          setVesselPreset(null);
        }}
        onSubmit={handleSaveContainer}
        initialData={editingContainer}
        defaultLocation={slotPreset}
        defaultVessel={vesselPreset}
      />

      {/* 2. Detail & Printable EIR Receipt Modal */}
      <ContainerDetailModal
        container={detailContainer}
        isOpen={!!detailContainer}
        onClose={() => setDetailContainer(null)}
        onEdit={(c) => {
          setDetailContainer(null);
          setEditingContainer(c);
          setIsCreateOpen(true);
        }}
      />

      {/* 3. Relocate Yard Slot Modal */}
      <RelocateModal
        container={relocateTarget}
        isOpen={!!relocateTarget}
        onClose={() => setRelocateTarget(null)}
        onConfirm={handleRelocateConfirm}
      />

      {/* 4. Fast Gate-Out Modal */}
      <GateOutModal
        container={gateOutTarget}
        isOpen={!!gateOutTarget}
        onClose={() => setGateOutTarget(null)}
        onConfirm={handleGateOutConfirm}
      />

      {/* 5. Safe Delete Confirmation Modal */}
      <DeleteConfirmModal
        container={deleteTarget}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* 6. Real-time Audit Activity Logs */}
      <AuditLogModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />

      {/* Toast Feedback System */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

