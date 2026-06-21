import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, payment } = body

    if (!event || !payment) {
      return NextResponse.json({ received: true })
    }

    // Find order by payment ID
    const order = await prisma.order.findFirst({
      where: { paymentId: payment.id },
    })

    if (!order) {
      return NextResponse.json({ received: true })
    }

    const statusMap: Record<string, string> = {
      RECEIVED: "paid",
      CONFIRMED: "paid",
      OVERDUE: "overdue",
      REFUNDED: "refunded",
      REFUND_REQUESTED: "refund_requested",
    }

    const newStatus = statusMap[payment.status] || "pending"

    const orderStatusMap: Record<string, string> = {
      RECEIVED: "confirmed",
      CONFIRMED: "confirmed",
      OVERDUE: "cancelled",
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: newStatus,
        status: orderStatusMap[payment.status] || order.status,
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ received: true })
  }
}
