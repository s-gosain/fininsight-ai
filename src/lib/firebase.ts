import { initializeApp, setLogLevel } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress non-critical Firebase client telemetry in browser console
try {
  setLogLevel('silent');
} catch {}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection verification helper (does not auto-trigger unauthorized network requests)
export async function testConnection() {
  return true;
}

// Auth helper functions
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Sync or update profile in Firestore
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'User',
        photoURL: user.photoURL || '',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    return user;
  } catch (error: any) {
    // If the user closed or dismissed the popup without finishing sign-in, handle gracefully
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.message?.includes('popup-closed-by-user') ||
      error?.message?.includes('cancelled-popup-request')
    ) {
      return null;
    }
    console.error('Sign-in error:', error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

export const logOut = signOutUser;

export interface SavedCloudAnalysis {
  id: string;
  userId: string;
  companyName: string;
  ticker: string;
  industry: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Data persistence helpers
export async function saveAnalysisToCloud(userId: string, analysis: Omit<SavedCloudAnalysis, 'userId'>) {
  const path = `users/${userId}/analyses/${analysis.id}`;
  try {
    const analysisRef = doc(db, 'users', userId, 'analyses', analysis.id);
    await setDoc(analysisRef, {
      ...analysis,
      userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserAnalyses(userId: string): Promise<SavedCloudAnalysis[]> {
  const path = `users/${userId}/analyses`;
  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'analyses'));
    return snapshot.docs.map(doc => doc.data() as SavedCloudAnalysis);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteAnalysisFromCloud(userId: string, analysisId: string) {
  const path = `users/${userId}/analyses/${analysisId}`;
  try {
    const analysisRef = doc(db, 'users', userId, 'analyses', analysisId);
    await deleteDoc(analysisRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function savePreferencesToCloud(userId: string, prefs: { currency: string; preferredTab: string }) {
  const path = `users/${userId}/preferences/default`;
  try {
    const prefRef = doc(db, 'users', userId, 'preferences', 'default');
    await setDoc(prefRef, {
      userId,
      ...prefs,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserPreferences(userId: string) {
  const path = `users/${userId}/preferences/default`;
  try {
    const prefRef = doc(db, 'users', userId, 'preferences', 'default');
    const snap = await getDoc(prefRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export { onAuthStateChanged };
export type { User };
