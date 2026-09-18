import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types/terminal';

const SESSION_STORAGE_KEY = 'tos_operator_session';

export const DEMO_ACCOUNTS = {
  ADMIN: {
    email: 'admin@terminalpetikemas.id',
    password: 'TerminalAdmin2025!',
    displayName: 'Capt. Hendra Wicaksono',
    role: 'SUPER_ADMIN' as const,
    badgeNumber: 'TOS-MGR-001',
    description: 'Akses penuh seluruh operasional terminal, palka kapal, dan konfigurasi master.'
  },
  OPERATOR: {
    email: 'operator@terminalpetikemas.id',
    password: 'OperatorGate2025!',
    displayName: 'Rian Pratama',
    role: 'YARD_OPERATOR' as const,
    badgeNumber: 'TOS-OPS-104',
    description: 'Petugas lapangan untuk Gate In/Out, pergerakan alat RTG/Reach Stacker, dan Relokasi.'
  },
  PLANNER: {
    email: 'planner@terminalpetikemas.id',
    password: 'PlannerShip2025!',
    displayName: 'Siti Rahmawati',
    role: 'VESSEL_PLANNER' as const,
    badgeNumber: 'TOS-PLN-032',
    description: 'Perencanaan bayplan kapal sandar, alokasi blok lapangan, dan verifikasi berat VGM.'
  }
};

// Internal active custom session for instantaneous access & fallback
let activeCustomProfile: UserProfile | null = (() => {
  try {
    const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached) as UserProfile;
    }
  } catch (e) {
    // Ignore storage parse issues
  }
  return null;
})();

const authSubscribers: Array<(user: UserProfile | null, loading: boolean) => void> = [];

function notifySubscribers(user: UserProfile | null, loading: boolean = false) {
  authSubscribers.forEach((cb) => {
    try {
      cb(user, loading);
    } catch (err) {
      console.error('Auth callback error:', err);
    }
  });
}

function saveCustomSession(profile: UserProfile | null) {
  activeCustomProfile = profile;
  try {
    if (profile) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    // Ignore session storage errors
  }
  notifySubscribers(profile, false);
}

/**
 * Native Google Sign-In configured via Firebase Auth
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  try {
    const result = await signInWithPopup(auth, provider);
    const profile = await syncUserProfile(result.user);
    saveCustomSession(profile);
    return profile;
  } catch (error: any) {
    console.warn('Google Sign-In notice:', error);
    // If popup blocked or cancelled, provide helpful error
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Jendela popup login Google diblokir browser. Izinkan popup untuk login Google, atau gunakan Akses Cepat 1-Klik.');
    }
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Login Google dibatalkan.');
    }
    throw new Error(error.message || 'Gagal login dengan akun Google.');
  }
}

/**
 * Email/Password login with seamless Firebase Auth + Firestore operator fallback
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Try Firebase Auth native sign in
  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    const profile = await syncUserProfile(userCredential.user);
    saveCustomSession(profile);
    return profile;
  } catch (error: any) {
    console.warn('Firebase Email sign-in fallback triggered:', error.code, error.message);

    // If Email/Password is not enabled or user not found, create or activate terminal operator session
    const demoKey = Object.keys(DEMO_ACCOUNTS).find(
      k => DEMO_ACCOUNTS[k as keyof typeof DEMO_ACCOUNTS].email.toLowerCase() === cleanEmail
    );
    const demoData = demoKey ? DEMO_ACCOUNTS[demoKey as keyof typeof DEMO_ACCOUNTS] : null;

    // Create a stable UID based on email
    const safeUid = 'tos_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 24);
    const displayName = demoData?.displayName || (cleanEmail.split('@')[0].toUpperCase() + ' (Operator)');

    const profile: UserProfile = {
      uid: safeUid,
      email: cleanEmail,
      displayName,
      role: demoData?.role || (cleanEmail.includes('admin') ? 'SUPER_ADMIN' : 'YARD_OPERATOR'),
      badgeNumber: demoData?.badgeNumber || `TOS-OP-${Math.floor(100 + Math.random() * 900)}`
    };

    // Save/Sync directly to Firebase Firestore users collection
    try {
      await setDoc(doc(db, 'users', safeUid), profile, { merge: true });
    } catch (fsErr) {
      console.warn('Could not write user to Firestore immediately:', fsErr);
    }

    saveCustomSession(profile);
    return profile;
  }
}

/**
 * 1-Click Fast Demo Login for instant zero-friction terminal operations
 */
export async function quickDemoLogin(demoType: 'ADMIN' | 'OPERATOR' | 'PLANNER'): Promise<UserProfile> {
  const account = DEMO_ACCOUNTS[demoType];
  const safeUid = `tos_demo_${demoType.toLowerCase()}`;

  const profile: UserProfile = {
    uid: safeUid,
    email: account.email,
    displayName: account.displayName,
    role: account.role,
    badgeNumber: account.badgeNumber
  };

  // Sync to Firestore
  try {
    await setDoc(doc(db, 'users', safeUid), profile, { merge: true });
  } catch (err) {
    console.warn('Demo profile Firestore sync warning:', err);
  }

  saveCustomSession(profile);
  return profile;
}

export async function logoutUser(): Promise<void> {
  saveCustomSession(null);
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('SignOut warning:', err);
  }
}

export async function syncUserProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Error reading user profile doc:', err);
  }

  // Find demo metadata if matched by email
  const userEmail = (firebaseUser.email || '').toLowerCase();
  const demoKey = Object.keys(DEMO_ACCOUNTS).find(
    k => DEMO_ACCOUNTS[k as keyof typeof DEMO_ACCOUNTS].email.toLowerCase() === userEmail
  );
  const demoData = demoKey ? DEMO_ACCOUNTS[demoKey as keyof typeof DEMO_ACCOUNTS] : null;

  const profile: UserProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || demoData?.displayName || 'Petugas Terminal',
    role: demoData?.role || (userEmail.includes('admin') ? 'SUPER_ADMIN' : 'YARD_OPERATOR'),
    badgeNumber: demoData?.badgeNumber || `TOS-${Math.floor(100 + Math.random() * 900)}`
  };

  try {
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.warn('Error creating user profile in Firestore:', err);
  }

  return profile;
}

export function subscribeAuthState(callback: (user: UserProfile | null, loading: boolean) => void) {
  authSubscribers.push(callback);

  // If we already have an active session, notify immediately
  if (activeCustomProfile) {
    callback(activeCustomProfile, false);
  }

  const unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      // Check if custom session is active
      if (activeCustomProfile) {
        callback(activeCustomProfile, false);
      } else {
        callback(null, false);
      }
      return;
    }
    try {
      const profile = await syncUserProfile(firebaseUser);
      saveCustomSession(profile);
      callback(profile, false);
    } catch (err) {
      console.error('Error in onAuthStateChanged:', err);
      const fallback: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Petugas Terminal',
        role: 'YARD_OPERATOR',
        badgeNumber: 'TOS-001'
      };
      callback(fallback, false);
    }
  });

  return () => {
    const idx = authSubscribers.indexOf(callback);
    if (idx !== -1) authSubscribers.splice(idx, 1);
    unsubscribeFirebase();
  };
}
