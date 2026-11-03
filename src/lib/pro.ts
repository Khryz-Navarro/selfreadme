// Unlock for the Pro templates pack, sold as a Buy Me a Coffee extra whose thank-you note holds the code.
// shortcut: a static site can't hide the templates or stop code sharing; move to per-buyer keys (Lemon Squeezy) if sales justify it.

export const PRO_URL = 'https://buymeacoffee.com/khryznavarz'
export const PRO_KEY = 'selfreadme-pro'
// SHA-256 of the unlock code, so the code itself is not in the source.
const PRO_HASH = '776aa6c629c8c7396b55596a559cbb645a3515c247cadd2e47198b7b478ac162'

export function isUnlocked() {
  try { return localStorage.getItem(PRO_KEY) === '1' } catch { return false }
}

export async function hashCode(code: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code.trim().toUpperCase()))
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function unlock(code: string) {
  if (await hashCode(code) !== PRO_HASH) return false
  try { localStorage.setItem(PRO_KEY, '1') } catch { /* private mode: unlocked for this visit only */ }
  return true
}
