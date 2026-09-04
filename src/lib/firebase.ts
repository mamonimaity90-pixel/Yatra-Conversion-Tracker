import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Hospital, StateLocation, TrainingCohort, YatraEvent, CallStatus, SATStatus } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId for custom named databases
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, check connection.');
      return false;
    }
    // Not an offline error, connection reached server
    return true;
  }
}

const HOSPITALS_COLLECTION = 'hospitals';
const CONFIG_COLLECTION = 'config';
const APP_CONFIG_DOC = 'app_state';

// Seed initial hospitals if collection is empty
export async function seedInitialHospitalsIfEmpty(
  initialHospitals: Hospital[],
  initialCohorts: TrainingCohort[],
  initialStates: StateLocation[],
  initialYatras: YatraEvent[]
): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, HOSPITALS_COLLECTION));
    if (!snap.empty) {
      return false; // Already populated
    }

    console.log(`[Firestore] Seeding ${initialHospitals.length} initial hospitals into Firestore...`);
    // Firestore batches are limited to 500 operations. We have 219 hospitals, so 1 batch is enough!
    const batch = writeBatch(db);

    initialHospitals.forEach((hosp) => {
      const docRef = doc(db, HOSPITALS_COLLECTION, hosp.id);
      batch.set(docRef, hosp);
    });

    const configRef = doc(db, CONFIG_COLLECTION, APP_CONFIG_DOC);
    batch.set(configRef, {
      cohorts: initialCohorts,
      states: initialStates,
      yatras: initialYatras,
      version: 1,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'System Seed'
    });

    await batch.commit();
    console.log('[Firestore] Seeding complete!');
    return true;
  } catch (err) {
    console.error('[Firestore] Seeding error:', err);
    return false;
  }
}

// Real-time listener for hospitals collection
export function subscribeToHospitals(
  onUpdate: (hospitals: Hospital[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, HOSPITALS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Hospital[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Hospital);
      });
      // Maintain consistent sort order by original sheet id
      list.sort((a, b) => {
        const numA = parseInt(a.id.replace('hosp-sheet-', ''), 10) || 0;
        const numB = parseInt(b.id.replace('hosp-sheet-', ''), 10) || 0;
        return numA - numB;
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, HOSPITALS_COLLECTION);
      if (onError) onError(error);
    }
  );
}

// Real-time listener for config (cohorts, states, yatras)
export function subscribeToConfig(
  onUpdate: (data: { cohorts?: TrainingCohort[]; states?: StateLocation[]; yatras?: YatraEvent[] }) => void
) {
  const configDocRef = doc(db, CONFIG_COLLECTION, APP_CONFIG_DOC);
  return onSnapshot(
    configDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as any);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${CONFIG_COLLECTION}/${APP_CONFIG_DOC}`);
    }
  );
}

// Update single hospital SAT status
export async function updateHospitalSatStatus(
  hospitalId: string,
  satStatus: SATStatus,
  author = 'Advisor'
): Promise<void> {
  const docRef = doc(db, HOSPITALS_COLLECTION, hospitalId);
  try {
    const snap = await getDoc(docRef);
    const existingData = snap.exists() ? (snap.data() as Hospital) : null;
    const oldSat = existingData?.satStatus || 'SAT not filled';
    const nowIso = new Date().toISOString();

    const newRemark = {
      id: `rem-sat-${Date.now()}`,
      date: nowIso,
      author,
      callStatus: existingData?.callStatus || 'Engaged',
      remark: `SAT Filling Status updated to "${satStatus}" (was "${oldSat}").`,
      channel: 'Phone Call',
      tags: ['SAT Status']
    };

    const existingRemarks = existingData?.remarks || [];

    await updateDoc(docRef, {
      satStatus,
      satUpdatedDate: nowIso.split('T')[0],
      updatedAt: nowIso,
      remarks: [newRemark, ...existingRemarks]
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${HOSPITALS_COLLECTION}/${hospitalId}`);
  }
}

// Update single hospital call status
export async function updateHospitalCallStatus(
  hospitalId: string,
  callStatus: CallStatus,
  author = 'Advisor'
): Promise<void> {
  const docRef = doc(db, HOSPITALS_COLLECTION, hospitalId);
  try {
    const snap = await getDoc(docRef);
    const existingData = snap.exists() ? (snap.data() as Hospital) : null;
    const oldStatus = existingData?.callStatus || 'Engaged';
    const nowIso = new Date().toISOString();

    const newRemark = {
      id: `rem-quick-${Date.now()}`,
      date: nowIso,
      author,
      callStatus,
      remark: `Quick status updated from ${oldStatus} to ${callStatus}.`,
      channel: 'Phone Call'
    };

    const existingRemarks = existingData?.remarks || [];

    await updateDoc(docRef, {
      callStatus,
      updatedAt: nowIso,
      remarks: [newRemark, ...existingRemarks]
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${HOSPITALS_COLLECTION}/${hospitalId}`);
  }
}

// Update entire hospital doc
export async function saveHospitalDoc(hospital: Hospital): Promise<void> {
  const docRef = doc(db, HOSPITALS_COLLECTION, hospital.id);
  try {
    await setDoc(docRef, hospital, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${HOSPITALS_COLLECTION}/${hospital.id}`);
  }
}

// Save config (cohorts, states, yatras)
export async function saveAppConfig(
  cohorts: TrainingCohort[],
  states: StateLocation[],
  yatras: YatraEvent[],
  updatedBy = 'Advisor'
): Promise<void> {
  const configRef = doc(db, CONFIG_COLLECTION, APP_CONFIG_DOC);
  try {
    await setDoc(
      configRef,
      {
        cohorts,
        states,
        yatras,
        lastUpdated: new Date().toISOString(),
        updatedBy
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CONFIG_COLLECTION}/${APP_CONFIG_DOC}`);
  }
}

// Google Authentication helper
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google login error:', err);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
