/**
 * The only accounts allowed to use the Content Hub.
 *
 * To add or remove a teammate, edit DEFAULT_AUTHORIZED_EMAILS below. Setting
 * VITE_AUTHORIZED_EMAILS (comma separated) overrides it, e.g. in
 * .env.emulator.local for local testing. An empty or invalid value falls back
 * to the defaults, so the app can never end up locked for everyone.
 */
const DEFAULT_AUTHORIZED_EMAILS = ['sudalaikannan.work@gmail.com', 'ationic.it@gmail.com']

function parseEmails(raw: string | undefined | null): string[] {
  return (raw ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

const configured = parseEmails(import.meta.env.VITE_AUTHORIZED_EMAILS)

export const AUTHORIZED_EMAILS: string[] = configured.length ? configured : DEFAULT_AUTHORIZED_EMAILS

export function isAuthorizedEmail(email: string | null | undefined): boolean {
  const value = email?.trim().toLowerCase()
  return value ? AUTHORIZED_EMAILS.includes(value) : false
}
