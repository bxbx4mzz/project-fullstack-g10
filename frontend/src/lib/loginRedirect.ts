import { googleLoginUrl } from './api'

const RETURN_KEY = 'rental:returnTo'

export function saveReturnPath(path: string) {
  try {
    sessionStorage.setItem(RETURN_KEY, path)
  } catch {
    // storage unavailable (private mode): login still works, user just lands on their home page
  }
}

export function peekReturnPath(): string | null {
  try {
    return sessionStorage.getItem(RETURN_KEY)
  } catch {
    return null
  }
}

export function clearReturnPath() {
  try {
    sessionStorage.removeItem(RETURN_KEY)
  } catch {
    // nothing stored
  }
}

export function startGoogleLogin(returnTo?: string) {
  if (returnTo) saveReturnPath(returnTo)
  window.location.href = googleLoginUrl
}
