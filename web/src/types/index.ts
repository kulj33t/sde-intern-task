export interface HomeItem {
  id: string
  name: string
  createdAt?: string
}

export interface Member {
  id: string
  name: string
  createdOrder?: number
}

export interface Share {
  id: string
  memberId: string
  memberName?: string
  amountCents: number
  paidAt: string | null
}

export interface Bill {
  id: string
  homeId: string
  title: string
  totalCents: number
  createdAt: string
  shares: Share[]
}

export interface Balance {
  memberId: string
  name: string
  outstandingCents: number
}
