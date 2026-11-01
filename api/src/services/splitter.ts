export interface MemberCandidate {
  id: string
  name?: string
}

export interface SplitShare {
  id: string
  memberId: string
  amountCents: number
  paidAt: null
}

/**
 * Splits totalCents evenly across all members.
 * Any remainder cents are allocated one by one to members in their joining order.
 */
export function splitBill(totalCents: number, members: MemberCandidate[]): SplitShare[] {
  const n = members.length
  if (n === 0) {
    throw new Error('Cannot split bill with 0 members')
  }

  const base = Math.floor(totalCents / n)
  const remainder = totalCents % n

  return members.map((member, index) => ({
    id: crypto.randomUUID(),
    memberId: member.id,
    amountCents: base + (index < remainder ? 1 : 0),
    paidAt: null,
  }))
}
