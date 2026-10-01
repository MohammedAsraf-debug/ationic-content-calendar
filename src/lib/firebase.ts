import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { firebaseApp } from './firebaseApp'

export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

// Local development against the Firebase Emulator Suite.
// Enabled with VITE_USE_FIREBASE_EMULATORS=true (see README).
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}