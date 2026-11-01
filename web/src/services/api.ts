import type { Balance, Bill, HomeItem, Member, Share } from '../types'

export async function getHomes(): Promise<HomeItem[]> {
  const res = await fetch('/api/homes')
  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.error || `Failed to fetch homes: HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.homes || []
}

export async function getHomeDetails(
  homeId: string,
): Promise<{ id: string; name: string; members: Member[] }> {
  const res = await fetch(`/api/homes/${homeId}`)
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || `Failed to fetch home details: HTTP ${res.status}`)
  }
  return res.json()
}

export async function getBills(homeId: string): Promise<Bill[]> {
  const res = await fetch(`/api/homes/${homeId}/bills`)
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || `Failed to fetch bills: HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.bills || []
}

export async function getBalances(homeId: string): Promise<Balance[]> {
  const res = await fetch(`/api/homes/${homeId}/balances`)
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || `Failed to fetch balances: HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.balances || []
}

export async function createHomeApi(name: string): Promise<HomeItem> {
  const res = await fetch('/api/homes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || `Failed to create home: HTTP ${res.status}`)
  }
  return res.json()
}

export async function addMemberApi(homeId: string, name: string): Promise<Member> {
  const res = await fetch(`/api/homes/${homeId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || `Failed to add member: HTTP ${res.status}`)
  }
  return res.json()
}

export async function createBillApi(
  homeId: string,
  title: string,
  totalCents: number,
): Promise<Bill> {
  const res = await fetch(`/api/homes/${homeId}/bills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, totalCents }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || `Failed to create bill: HTTP ${res.status}`)
  }
  return res.json()
}

export async function payShareApi(billId: string, shareId: string): Promise<Share> {
  const idempotencyKey = crypto.randomUUID()
  const res = await fetch(`/api/bills/${billId}/shares/${shareId}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || `Payment failed (HTTP ${res.status})`)
  }
  return res.json()
}
