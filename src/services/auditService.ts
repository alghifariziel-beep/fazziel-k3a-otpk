import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AuditLog } from '../types/terminal';

const AUDIT_COLLECTION = 'audit_logs';

export async function logAuditAction(
  action: AuditLog['action'],
  containerNumber: string,
  description: string,
  performedBy: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const colRef = collection(db, AUDIT_COLLECTION);
    await addDoc(colRef, {
      action,
      containerNumber,
      description,
      performedBy: performedBy || 'Operator',
      timestamp: new Date().toISOString(),
      details: details || {}
    });
  } catch (error) {
    console.error('Gagal mencatat log audit:', error);
  }
}

export function subscribeAuditLogs(
  onUpdate: (logs: AuditLog[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, AUDIT_COLLECTION);
  const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const logs: AuditLog[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<AuditLog, 'id'>)
      }));
      onUpdate(logs);
    },
    (err) => {
      console.error('Audit log listener error:', err);
      if (onError) onError(err);
    }
  );
}
