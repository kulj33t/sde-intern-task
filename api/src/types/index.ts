export type AppEnv = {
  Bindings: Env
}

export interface HomeRecord {
  id: string
  name: string
  createdAt?: string
}

export interface MemberRecord {
  id: string
  homeId: string
  name: string
  createdOrder: number
  createdAt?: string
}

export interface BillRecord {
  id: string
  homeId: string
  title: string
  totalCents: number
  createdAt?: string
}

export interface ShareRecord {
  id: string
  billId: string
  memberId: string
  amountCents: number
  paidAt: string | null
  idempotencyKey?: string | null
}

export interface BalanceRecord {
  memberId: string
  name: string
  outstandingCents: number
}
