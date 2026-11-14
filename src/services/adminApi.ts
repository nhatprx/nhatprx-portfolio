// Client for the nhatprx-portfolio admin API (served from the same origin at /api).
// The browser never holds AWS credentials: it asks the API for a short-lived
// presigned URL and PUTs the file straight to S3.

const TOKEN_KEY = 'nhatprx_admin_token'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // sessionStorage unavailable (private mode) - login will not persist.
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(path, { ...init, headers })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // non-JSON error body
    }
    throw new ApiError(res.status, message)
  }
  return (await res.json()) as T
}

export async function login(passkey: string): Promise<void> {
  const { token } = await request<{ token: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ passkey }),
  })
  setToken(token)
}

export function logout(): void {
  setToken(null)
}

export function isLoggedIn(): boolean {
  return getToken() !== null
}

export interface PresignedUpload {
  uploadUrl: string
  key: string
  publicUrl: string
  fileName: string
  expiresIn: number
}

/** Requests a presigned PUT URL for the resume, then uploads the file to S3. */
export async function uploadResume(file: File): Promise<PresignedUpload> {
  const presigned = await request<PresignedUpload>('/api/resume/presign', {
    method: 'POST',
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type || 'application/pdf',
      size: file.size,
    }),
  })

  const putRes = await fetch(presigned.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/pdf' },
    body: file,
  })
  if (!putRes.ok) {
    throw new ApiError(putRes.status, `Upload failed (${putRes.status})`)
  }
  return presigned
}

export async function deleteResume(key: string): Promise<void> {
  await request('/api/resume/delete', {
    method: 'POST',
    body: JSON.stringify({ key }),
  })
}

/** Loads the persisted portfolio content from S3. Returns null when none exists yet. */
export async function fetchRemoteContent<T>(): Promise<T | null> {
  const res = await fetch('/api/content')
  if (!res.ok) throw new ApiError(res.status, `Failed to load content (${res.status})`)
  const body = await res.json()
  console.log('[fetchRemoteContent] Response status:', res.status, 'Body:', body)
  return (body?.content ?? null) as T | null
}

/** Translates portfolio sections through the authenticated server-side Bedrock API. */
export async function translatePortfolio({
  source,
  sourceLang,
  targetLang,
  onProgress,
}: {
  source: Record<string, unknown>
  sourceLang: string
  targetLang: string
  onProgress?: (message: string) => void
}): Promise<Record<string, unknown>> {
  const sections = ['about', 'skills', 'experience', 'projects', 'blog']
  const translated: Record<string, unknown> = { ...source }

  for (const sectionName of sections) {
    const section = source[sectionName]
    if (!section || typeof section !== 'object' || Array.isArray(section)) continue

    onProgress?.(`Đang dịch ${sectionName} bằng AWS Bedrock...`)
    const response = await request<{ content?: Record<string, unknown> }>('/api/translate', {
      method: 'POST',
      body: JSON.stringify({ source, sourceLang, targetLang }),
    })

    const translatedSection = response.content?.[sectionName]
    if (!translatedSection || typeof translatedSection !== 'object') {
      throw new Error(`Bedrock did not return the ${sectionName} section`)
    }
    translated[sectionName] = translatedSection
  }

  return translated
}

/** Persists the portfolio content JSON to S3. */
export async function saveRemoteContent(content: unknown): Promise<void> {
  await request('/api/content', {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}
