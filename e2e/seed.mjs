/**
 * Creates the emulator test users via the Identity Toolkit REST API so the
 * Playwright suite is reproducible. Points exclusively at the local emulator.
 *
 * The first two accounts mirror the production allowlist enforced by
 * firestore.rules, so the emulator exercises the exact same access rules.
 *
 *   firebase emulators:start --only auth,firestore --project demo-ationic
 *   node e2e/seed.mjs
 */
const AUTH_URL = process.env.E2E_AUTH_URL ?? 'http://127.0.0.1:9099'
const API_KEY = 'fake-api-key'

const USERS = [
  { email: 'sudalaikannan.work@gmail.com', password: 'Test1234!', displayName: 'Mohammed' },
  { email: 'ationic.it@gmail.com', password: 'Test1234!', displayName: 'Team Member' },
  // Valid Firebase account that is NOT on the allowlist, used by the denial tests.
  { email: 'outsider@ationic.com', password: 'Test1234!', displayName: 'Outsider' },
]

for (const { email, password, displayName } of USERS) {
  const res = await fetch(
    `${AUTH_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true, displayName }),
    },
  )
  const body = await res.json()
  if (res.ok) {
    console.log(`created ${email}`)
    continue
  }
  if (JSON.stringify(body).includes('EMAIL_EXISTS')) {
    console.log(`${email} already exists`)
    continue
  }
  console.error(`failed to seed ${email}:`, JSON.stringify(body))
  process.exitCode = 1
}
