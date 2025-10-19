import { fetchAuthSession } from 'aws-amplify/auth'

export async function logAuthDebug() {
  try {
    const s = await fetchAuthSession()
    const id = s.tokens?.idToken?.toString()
    console.info('[auth-debug] idToken?', id ? `yes (...${id.slice(-12)})` : 'NO')
  } catch (e) {
    console.warn('[auth-debug] fetchAuthSession failed', e)
  }
}
