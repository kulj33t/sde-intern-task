import { Hono } from 'hono'
import type { AppEnv } from '../types'

export const billsRouter = new Hono<AppEnv>()

// POST /api/bills/:billId/shares/:shareId/pay - Pay a share idempotently
billsRouter.post('/:billId/shares/:shareId/pay', async (c) => {
  const billId = c.req.param('billId')
  const shareId = c.req.param('shareId')

  const key = c.req.header('Idempotency-Key')?.trim()
  if (!key) {
    return c.json({ error: 'Idempotency-Key header is required' }, 400)
  }

  const bill = await c.env.DB.prepare('SELECT id FROM bills WHERE id = ?').bind(billId).first()
  if (!bill) {
    return c.json({ error: 'Bill not found' }, 404)
  }

  const share = await c.env.DB.prepare(
    'SELECT id, bill_id, member_id, amount_cents, paid_at, idempotency_key FROM shares WHERE id = ? AND bill_id = ?',
  )
    .bind(shareId, billId)
    .first<{
      id: string
      bill_id: string
      member_id: string
      amount_cents: number
      paid_at: string | null
      idempotency_key: string | null
    }>()

  if (!share) {
    return c.json({ error: 'Share not found' }, 404)
  }

  // If already paid, check idempotency key
  if (share.paid_at !== null) {
    if (share.idempotency_key === key) {
      return c.json(
        {
          id: share.id,
          memberId: share.member_id,
          amountCents: share.amount_cents,
          paidAt: share.paid_at,
        },
        200,
      )
    }
    return c.json({ error: 'Share already paid with a different idempotency key' }, 409)
  }

  // Attempt atomic conditional update for concurrency safety
  const now = new Date().toISOString()
  const updateResult = await c.env.DB.prepare(
    'UPDATE shares SET paid_at = ?, idempotency_key = ? WHERE id = ? AND bill_id = ? AND paid_at IS NULL',
  )
    .bind(now, key, shareId, billId)
    .run()

  if (updateResult.meta.changes === 1) {
    return c.json(
      {
        id: share.id,
        memberId: share.member_id,
        amountCents: share.amount_cents,
        paidAt: now,
      },
      200,
    )
  }

  // Another concurrent request updated it first: re-fetch and evaluate
  const updatedShare = await c.env.DB.prepare(
    'SELECT id, member_id, amount_cents, paid_at, idempotency_key FROM shares WHERE id = ?',
  )
    .bind(shareId)
    .first<{
      id: string
      member_id: string
      amount_cents: number
      paid_at: string | null
      idempotency_key: string | null
    }>()

  if (updatedShare?.paid_at !== null && updatedShare?.idempotency_key === key) {
    return c.json(
      {
        id: updatedShare.id,
        memberId: updatedShare.member_id,
        amountCents: updatedShare.amount_cents,
        paidAt: updatedShare.paid_at,
      },
      200,
    )
  }

  return c.json({ error: 'Share already paid with a different idempotency key' }, 409)
})
