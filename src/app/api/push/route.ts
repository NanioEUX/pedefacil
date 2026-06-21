import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Store push subscription for a delivery person
export async function POST(req: NextRequest) {
  const { subscription, deliveryPersonId, establishmentId } = await req.json()

  if (!subscription || !deliveryPersonId) {
    return NextResponse.json({ error: "subscription and deliveryPersonId required" }, { status: 400 })
  }

  // Store in a simple JSON field on DeliveryPerson or use a separate table
  // For simplicity, we'll use a PushSubscription model or store in memory
  // For production, use a proper database table

  try {
    // Store subscription (upsert by endpoint)
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS PushSubscription (
        id TEXT PRIMARY KEY,
        endpoint TEXT UNIQUE,
        p256dh TEXT,
        auth TEXT,
        deliveryPersonId TEXT,
        establishmentId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Try to insert or update
    const existing = await prisma.$queryRaw`
      SELECT id FROM PushSubscription WHERE endpoint = ${subscription.endpoint}
    ` as any[]

    if (existing.length > 0) {
      await prisma.$executeRaw`
        UPDATE PushSubscription
        SET p256dh = ${subscription.keys.p256dh},
            auth = ${subscription.keys.auth},
            deliveryPersonId = ${deliveryPersonId},
            establishmentId = ${establishmentId}
        WHERE endpoint = ${subscription.endpoint}
      `
    } else {
      const id = `push_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      await prisma.$executeRaw`
        INSERT INTO PushSubscription (id, endpoint, p256dh, auth, deliveryPersonId, establishmentId)
        VALUES (${id}, ${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth}, ${deliveryPersonId}, ${establishmentId})
      `
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    // If table doesn't exist, just return ok (graceful degradation)
    if (e.message?.includes("no such table")) {
      return NextResponse.json({ ok: true, note: "Table not created yet" })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Get VAPID public key
export async function GET() {
  return NextResponse.json({
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  })
}
