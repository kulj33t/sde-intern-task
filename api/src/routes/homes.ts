import { Hono } from 'hono'
import { splitBill } from '../services/splitter'
import type { AppEnv } from '../types'

export const homesRouter = new Hono<AppEnv>()

// GET /api/homes - List all homes (used by Web UI)
homesRouter.get('/', async (c) => {
  const { results: homes } = await c.env.DB.prepare(
    'SELECT id, name, created_at AS createdAt FROM homes ORDER BY created_at DESC',
  ).all<{ id: string; name: string; createdAt: string }>()

  return c.json({ homes: homes ?? [] }, 200)
})

// POST /api/homes - Create a home
homesRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return c.json({ error: 'Name is required' }, 400)
  }

  const id = crypto.randomUUID()
  const name = body.name.trim()

  await c.env.DB.prepare('INSERT INTO homes (id, name) VALUES (?, ?)').bind(id, name).run()

  return c.json({ id, name }, 201)
})

// GET /api/homes/:homeId - Get single home with members (used by Web UI)
homesRouter.get('/:homeId', async (c) => {
  const homeId = c.req.param('homeId')
  const home = await c.env.DB.prepare('SELECT id, name FROM homes WHERE id = ?')
    .bind(homeId)
    .first<{ id: string; name: string }>()

  if (!home) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const { results: members } = await c.env.DB.prepare(
    'SELECT id, name, created_order AS createdOrder FROM members WHERE home_id = ? ORDER BY created_order ASC',
  )
    .bind(homeId)
    .all<{ id: string; name: string; createdOrder: number }>()

  return c.json({ ...home, members: members ?? [] }, 200)
})

// POST /api/homes/:homeId/members - Add member to a home
homesRouter.post('/:homeId/members', async (c) => {
  const homeId = c.req.param('homeId')

  const home = await c.env.DB.prepare('SELECT id FROM homes WHERE id = ?').bind(homeId).first()
  if (!home) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return c.json({ error: 'Name is required' }, 400)
  }

  const orderRow = await c.env.DB.prepare(
    'SELECT COALESCE(MAX(created_order), 0) + 1 AS next_order FROM members WHERE home_id = ?',
  )
    .bind(homeId)
    .first<{ next_order: number }>()

  const nextOrder = orderRow?.next_order ?? 1
  const id = crypto.randomUUID()
  const name = body.name.trim()

  await c.env.DB.prepare(
    'INSERT INTO members (id, home_id, name, created_order) VALUES (?, ?, ?, ?)',
  )
    .bind(id, homeId, name, nextOrder)
    .run()

  return c.json({ id, homeId, name }, 201)
})

// GET /api/homes/:homeId/bills - List bills of a home with shares (used by Web UI)
homesRouter.get('/:homeId/bills', async (c) => {
  const homeId = c.req.param('homeId')

  const home = await c.env.DB.prepare('SELECT id FROM homes WHERE id = ?').bind(homeId).first()
  if (!home) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const { results: bills } = await c.env.DB.prepare(
    'SELECT id, home_id AS homeId, title, total_cents AS totalCents, created_at AS createdAt FROM bills WHERE home_id = ? ORDER BY created_at DESC',
  )
    .bind(homeId)
    .all<{ id: string; homeId: string; title: string; totalCents: number; createdAt: string }>()

  const billList = bills ?? []
  const billsWithShares = await Promise.all(
    billList.map(async (bill) => {
      const { results: shares } = await c.env.DB.prepare(
        `SELECT s.id, s.member_id AS memberId, m.name AS memberName, s.amount_cents AS amountCents, s.paid_at AS paidAt
         FROM shares s
         JOIN members m ON m.id = s.member_id
         WHERE s.bill_id = ?
         ORDER BY m.created_order ASC`,
      )
        .bind(bill.id)
        .all<{
          id: string
          memberId: string
          memberName: string
          amountCents: number
          paidAt: string | null
        }>()

      return {
        ...bill,
        shares: shares ?? [],
      }
    }),
  )

  return c.json({ bills: billsWithShares }, 200)
})

// POST /api/homes/:homeId/bills - Create a bill and split between members
homesRouter.post('/:homeId/bills', async (c) => {
  const homeId = c.req.param('homeId')

  const body = await c.req.json().catch(() => null)
  if (
    !body ||
    typeof body.totalCents !== 'number' ||
    !Number.isInteger(body.totalCents) ||
    body.totalCents <= 0
  ) {
    return c.json({ error: 'totalCents must be a positive integer' }, 422)
  }

  if (typeof body.title !== 'string' || body.title.trim().length === 0) {
    return c.json({ error: 'Title is required' }, 422)
  }

  const home = await c.env.DB.prepare('SELECT id FROM homes WHERE id = ?').bind(homeId).first()
  if (!home) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const { results: members } = await c.env.DB.prepare(
    'SELECT id, name FROM members WHERE home_id = ? ORDER BY created_order ASC',
  )
    .bind(homeId)
    .all<{ id: string; name: string }>()

  if (!members || members.length === 0) {
    return c.json({ error: 'Home has no members' }, 422)
  }

  const totalCents = body.totalCents
  const billId = crypto.randomUUID()
  const title = body.title.trim()

  const shares = splitBill(totalCents, members)

  const statements = [
    c.env.DB.prepare(
      'INSERT INTO bills (id, home_id, title, total_cents) VALUES (?, ?, ?, ?)',
    ).bind(billId, homeId, title, totalCents),
    ...shares.map((share) =>
      c.env.DB.prepare(
        'INSERT INTO shares (id, bill_id, member_id, amount_cents) VALUES (?, ?, ?, ?)',
      ).bind(share.id, billId, share.memberId, share.amountCents),
    ),
  ]

  await c.env.DB.batch(statements)

  return c.json(
    {
      id: billId,
      homeId,
      title,
      totalCents,
      shares,
    },
    201,
  )
})

// GET /api/homes/:homeId/balances - Get balances for all members of a home
homesRouter.get('/:homeId/balances', async (c) => {
  const homeId = c.req.param('homeId')

  const home = await c.env.DB.prepare('SELECT id FROM homes WHERE id = ?').bind(homeId).first()
  if (!home) {
    return c.json({ error: 'Home not found' }, 404)
  }

  const { results: balances } = await c.env.DB.prepare(
    `SELECT
       m.id AS memberId,
       m.name AS name,
       COALESCE(SUM(s.amount_cents), 0) AS outstandingCents
     FROM members m
     LEFT JOIN shares s ON s.member_id = m.id AND s.paid_at IS NULL
     WHERE m.home_id = ?
     GROUP BY m.id, m.name, m.created_order
     ORDER BY m.created_order ASC`,
  )
    .bind(homeId)
    .all<{ memberId: string; name: string; outstandingCents: number }>()

  return c.json({ balances: balances ?? [] }, 200)
})
