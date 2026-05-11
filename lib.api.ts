// lib/api.ts
// Next.js frontend-аас backend руу дуудах бүх API functions

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ─── AUTH ────────────────────────────────────────────────
export async function register(username: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return res.json()
}

export async function login(username: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json()
  if (data.success && data.token) {
    localStorage.setItem('token', data.token)
  }
  return data
}

export function logout() {
  localStorage.removeItem('token')
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/api/users/me`, { headers: authHeaders() })
  return res.json()
}

// ─── GROUPS ──────────────────────────────────────────────
export async function getGroups() {
  const res = await fetch(`${BASE_URL}/api/groups`, { headers: authHeaders() })
  return res.json()
}

export async function createGroup(data: { group_name: string; description?: string }) {
  const res = await fetch(`${BASE_URL}/api/groups`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateGroup(uuid: string, data: { group_name: string; description?: string }) {
  const res = await fetch(`${BASE_URL}/api/groups/${uuid}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteGroup(uuid: string) {
  const res = await fetch(`${BASE_URL}/api/groups/${uuid}`, {
    method: 'DELETE', headers: authHeaders(),
  })
  return res.json()
}

// ─── DEPARTMENTS ─────────────────────────────────────────
export async function getDepartments() {
  const res = await fetch(`${BASE_URL}/api/departments`, { headers: authHeaders() })
  return res.json()
}

export async function createDepartment(data: { name: string; description?: string }) {
  const res = await fetch(`${BASE_URL}/api/departments`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateDepartment(uuid: string, data: { name: string; description?: string }) {
  const res = await fetch(`${BASE_URL}/api/departments/${uuid}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteDepartment(uuid: string) {
  const res = await fetch(`${BASE_URL}/api/departments/${uuid}`, {
    method: 'DELETE', headers: authHeaders(),
  })
  return res.json()
}

// ─── REGULATIONS ─────────────────────────────────────────
export async function getRegulations(params?: {
  status?: string
  group_name?: string
  division_name?: string
  search?: string
}) {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const res = await fetch(`${BASE_URL}/api/regulations${query ? `?${query}` : ''}`, {
    headers: authHeaders(),
  })
  return res.json()
}

export async function createRegulation(data: {
  file_name: string
  group_name?: string
  division_name?: string
  approved_date?: string
  decline_date?: string
  status?: 'active' | 'inactive'
  file_size?: number
}) {
  const res = await fetch(`${BASE_URL}/api/regulations`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateRegulation(uuid: string, data: {
  file_name: string
  group_name?: string
  division_name?: string
  approved_date?: string
  decline_date?: string
  status?: 'active' | 'inactive'
  file_size?: number
}) {
  const res = await fetch(`${BASE_URL}/api/regulations/${uuid}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteRegulation(uuid: string) {
  const res = await fetch(`${BASE_URL}/api/regulations/${uuid}`, {
    method: 'DELETE', headers: authHeaders(),
  })
  return res.json()
}
