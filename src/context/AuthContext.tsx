import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { isAuthorizedEmail } from '../lib/authorizedEmails'

export const GOOGLE_UNAUTHORIZED_MESSAGE = 'This Google account is not authorized.'
export const EMAIL_UNAUTHORIZED_MESSAGE = 'This email address is not authorized.'

export type Profile = {
  uid: string
  name: string
  email: string
  initials: string
}

type AuthContextValue = {
  user: User | null
  profile: Profile | null
  loading: boolean
  accessError: string | null
  clearAccessError: () => void
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Incorrect email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again in a minute.'
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      return 'This sign-in method is not enabled for this Firebase project yet. Enable it in Firebase Console → Authentication → Sign-in method.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled. No problem — try again when you are ready.'
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google pop-up. Allow pop-ups for this site, then try again.'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorised for sign-in. Add it in Firebase Console → Authentication → Authorized domains.'
    case 'auth/account-exists-with-different-credential':
      return 'This email already has a password. Sign in with your email and password instead.'
    case 'auth/account-disabled':
      return 'This account has been disabled. Contact an administrator.'
    case 'ationic/account-not-authorized':
      return (error as Error)?.message || 'This account is not authorized.'
    default:
      return (error as Error)?.message || 'Something went wrong. Please try again.'
  }
}

class NotAuthorizedError extends Error {
  code = 'ationic/account-not-authorized'
}

function unauthorizedMessage(user: User): string {
  return user.providerData.some((entry) => entry.providerId === 'google.com')
    ? GOOGLE_UNAUTHORIZED_MESSAGE
    : EMAIL_UNAUTHORIZED_MESSAGE
}

/** Signs an unauthorized user straight back out; never lets them reach the app. */
async function rejectUser(user: User) {
  const message = unauthorizedMessage(user)
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.warn('[ationic] Sign-out after a rejected sign-in failed', error)
  }
  return new NotAuthorizedError(message)
}

function toProfile(user: User): Profile {
  const name = user.displayName?.trim() || user.email?.split('@')[0] || 'Team Member'
  const initials = name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  return { uid: user.uid, name, email: user.email ?? '', initials: initials || 'TM' }
}

/**
 * Keeps users/{userId} in sync, keyed by the Auth uid so one account can never
 * produce a second profile. An existing custom displayName in Firestore always
 * wins over the Google display name so manual edits are never overwritten.
 * Failures are non-fatal (rules may deny the write).
 */
async function syncProfile(user: User): Promise<Profile> {
  const base = toProfile(user)
  try {
    const ref = doc(db, 'users', user.uid)
    const snapshot = await getDoc(ref)
    const storedName = snapshot.exists()
      ? String(snapshot.data().displayName ?? '').trim()
      : ''
    const displayName = storedName || base.name
    await setDoc(
      ref,
      { displayName, email: user.email ?? '', lastSeenAt: serverTimestamp() },
      { merge: true },
    )
    return base.name === displayName ? base : { ...base, name: displayName }
  } catch (error) {
    console.warn('[ationic] Could not sync user profile', error)
    return base
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [storedProfile, setStoredProfile] = useState<Profile | null>(null)
  const [accessError, setAccessError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null)
        setStoredProfile(null)
        setLoading(false)
        return
      }
      // A restored session (Google keeps you signed in) is re-checked on every
      // load, and `loading` stays true until it passes so no protected screen
      // can render for a rejected account.
      if (!isAuthorizedEmail(nextUser.email)) {
        const error = await rejectUser(nextUser)
        setUser(null)
        setStoredProfile(null)
        setAccessError(error.message)
        setLoading(false)
        return
      }
      setUser(nextUser)
      setLoading(false)
      const resolved = await syncProfile(nextUser)
      if (auth.currentUser?.uid === resolved.uid) setStoredProfile(resolved)
    })
    return unsubscribe
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
    if (!isAuthorizedEmail(credential.user.email)) throw await rejectUser(credential.user)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const credential = await signInWithPopup(auth, provider)
    if (!isAuthorizedEmail(credential.user.email)) throw await rejectUser(credential.user)
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
  }, [])

  const clearAccessError = useCallback(() => setAccessError(null), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile: user ? storedProfile ?? toProfile(user) : null,
      loading,
      accessError,
      clearAccessError,
      signIn,
      signInWithGoogle,
      signOut,
    }),
    [user, storedProfile, loading, accessError, clearAccessError, signIn, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
