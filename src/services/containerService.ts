import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Container, YardLocation, ContainerStatus } from '../types/terminal';
import { INITIAL_CONTAINERS } from '../utils/sampleData';
import { logAuditAction } from './auditService';

const CONTAINER_COLLECTION = 'containers';

export function subscribeContainers(
  onUpdate: (containers: Container[]) => void,
  onError: (err: Error) => void
) {
  const colRef = collection(db, CONTAINER_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Container[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Container, 'id'>)
      }));
      onUpdate(items);
    },
    (err) => {
      console.error('Firestore subscribeContainers error:', err);
      onError(err);
    }
  );
}

export async function createContainer(
  data: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>,
  operatorName: string
): Promise<string> {
  const now = new Date().toISOString();
  const colRef = collection(db, CONTAINER_COLLECTION);

  // Normalization
  const newContainerData = {
    ...data,
    containerNumber: data.containerNumber.trim().toUpperCase(),
    sealNumber: data.sealNumber.trim().toUpperCase(),
    vesselName: data.vesselName.trim().toUpperCase(),
    shippingLine: data.shippingLine.trim(),
    createdAt: now,
    updatedAt: now,
    updatedBy: operatorName
  };

  const docRef = await addDoc(colRef, newContainerData);

  await logAuditAction(
    'CREATE',
    data.containerNumber,
    `Penerimaan Petikemas Baru (Gate-In / Registrasi) di Blok ${data.yardLocation.block}-${data.yardLocation.bay}-${data.yardLocation.row}-${data.yardLocation.tier}`,
    operatorName,
    { id: docRef.id, weight: data.grossWeightKg, line: data.shippingLine }
  );

  return docRef.id;
}

export async function updateContainer(
  id: string,
  updates: Partial<Container>,
  operatorName: string
): Promise<void> {
  const docRef = doc(db, CONTAINER_COLLECTION, id);
  const now = new Date().toISOString();

  const cleanedUpdates = {
    ...updates,
    updatedAt: now,
    updatedBy: operatorName
  };

  if (cleanedUpdates.containerNumber) {
    cleanedUpdates.containerNumber = cleanedUpdates.containerNumber.trim().toUpperCase();
  }
  if (cleanedUpdates.sealNumber) {
    cleanedUpdates.sealNumber = cleanedUpdates.sealNumber.trim().toUpperCase();
  }

  await updateDoc(docRef, cleanedUpdates);

  await logAuditAction(
    'UPDATE',
    updates.containerNumber || id,
    `Pembaruan data spesifikasi/operasional petikemas oleh ${operatorName}`,
    operatorName,
    updates
  );
}

export async function deleteContainer(
  id: string,
  containerNumber: string,
  operatorName: string,
  reason?: string
): Promise<void> {
  const docRef = doc(db, CONTAINER_COLLECTION, id);
  await deleteDoc(docRef);

  await logAuditAction(
    'DELETE',
    containerNumber,
    `Penghapusan data petikemas dari sistem. Alasan: ${reason || 'Pembatalan transaksi operasional'}`,
    operatorName,
    { deletedId: id, reason }
  );
}

export async function relocateContainer(
  id: string,
  containerNumber: string,
  newLocation: YardLocation,
  oldLocation: YardLocation,
  operatorName: string
): Promise<void> {
  const docRef = doc(db, CONTAINER_COLLECTION, id);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    yardLocation: newLocation,
    status: 'YARD_STACKING' as ContainerStatus,
    updatedAt: now,
    updatedBy: operatorName
  });

  await logAuditAction(
    'RELOCATE',
    containerNumber,
    `Pemindahan lokasi lapangan (Relocation) dari Blok ${oldLocation.block}-${oldLocation.bay}-${oldLocation.row}-${oldLocation.tier} ke Blok ${newLocation.block}-${newLocation.bay}-${newLocation.row}-${newLocation.tier}`,
    operatorName,
    { from: oldLocation, to: newLocation }
  );
}

export async function processGateOut(
  id: string,
  containerNumber: string,
  truckPlate: string,
  driverName: string,
  notes: string,
  operatorName: string
): Promise<void> {
  const docRef = doc(db, CONTAINER_COLLECTION, id);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    status: 'GATE_OUT' as ContainerStatus,
    gateOutTime: now,
    truckPlateNumber: truckPlate.trim().toUpperCase(),
    driverName: driverName.trim(),
    notes: notes ? `${notes} (Gate-out diproses)` : 'Gate-out keluar terminal',
    updatedAt: now,
    updatedBy: operatorName
  });

  await logAuditAction(
    'GATE_OUT',
    containerNumber,
    `Pelepasan Petikemas (Gate-Out) keluar terminal dengan Truk ${truckPlate.toUpperCase()} (Supir: ${driverName})`,
    operatorName,
    { truckPlate, driverName, gateOutTime: now }
  );
}

export async function seedInitialDataIfEmpty(operatorName: string = 'Sistem'): Promise<boolean> {
  const colRef = collection(db, CONTAINER_COLLECTION);
  const snap = await getDocs(colRef);

  if (snap.empty) {
    console.log('Database kosong. Memasukkan data awal operasional terminal...');
    for (const item of INITIAL_CONTAINERS) {
      await addDoc(colRef, item);
      await logAuditAction(
        'CREATE',
        item.containerNumber,
        `Inisialisasi data awal terminal (Sample Slot ${item.yardLocation.block})`,
        operatorName
      );
    }
    return true;
  }
  return false;
}
