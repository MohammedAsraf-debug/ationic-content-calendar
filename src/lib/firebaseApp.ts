const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missing = Object.entries(config)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missing.length > 0) {
  console.warn(
    `[ationic] Missing Firebase environment variables: ${missing.join(', ')}. ` +
      'Copy .env.example to .env and add your Firebase project values.',
  )
}

import { initializeApp, getApps, getApp } from 'firebase/app'

const app = getApps().length > 0 ? getApp() : initializeApp(config)

export const firebaseApp = app