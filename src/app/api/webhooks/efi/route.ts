import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseEfiWebhookStatus } from "@/lib/integrations/efi"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ received: true })
  }

  processEfiWebhook(body).catch((err) => {
    console.error("[Efi Webhook] Background error:", err.message)
  })

  return NextResponse.json({ received: true })
}

async function processEfiWebhook(body: any) {
  console.log("[Efi Webhook] Received:", JSON.stringify(body).substring(0, 500))

  const pix = body.pix
  if (!pix || !Array.isArray(pix) || pix.length === 0) {
    console.log("[Efi Webhook] No pix data in payload")
    return
  }

  for (const transaction of pix) {
    const txid = transaction.txid
    const e2eId = transaction.endToEndId
    const valor = transaction.valor
    const horario = transaction.horario

    console.log("[Efi Webhook] Processing pix:", { txid, e2eId, valor })

    if (!txid) {
      console.log("[Efi Webhook] No txid in transaction")
      continue
    }

    const order = await prisma.order.findFirst({
      where: { paymentId: txid },
    })

    if (!order) {
      console.log("[Efi Webhook] Order not found for txid:", txid)
      continue
    }

    console.log("[Efi Webhook] Found order:", order.id, "current:", order.paymentStatus)

    const newPaymentStatus = "paid"
    const newOrderStatus = "confirmed"

    const updateData: Record<string, unknown> = {}
    if (order.paymentStatus !== newPaymentStatus) updateData.paymentStatus = newPaymentStatus
    if (order.status !== newOrderStatus) updateData.status = newOrderStatus

    if (Object.keys(updateData).length > 0) {
      await prisma.order.update({
        where: { id: order.id },
        data: updateData,
      })
      console.log("[Efi Webhook] Order #", order.orderNumber, "updated:", updateData)
    } else {
      console.log("[Efi Webhook] No update needed")
    }
  }
}
