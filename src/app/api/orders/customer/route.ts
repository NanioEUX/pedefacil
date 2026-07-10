import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const ASAAS_API_URL =
  process.env.ASAAS_ENVIRONMENT === "sandbox"
    ? "https://sandbox.asaas.com/api/v3"
    : "https://api.asaas.com/v3"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get("phone")
  const establishmentId = searchParams.get("establishmentId")

  if (!phone || !establishmentId) {
    return NextResponse.json({ error: "phone e establishmentId são obrigatórios" }, { status: 400 })
  }

  const orders = await prisma.order.findMany({
    where: { customerPhone: phone, establishmentId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      items: true,
      total: true,
      status: true,
      createdAt: true,
      orderType: true,
      paymentMethod: true,
      paymentStatus: true,
      paymentLink: true,
      paymentId: true,
      trackingToken: true,
      deliveryFee: true,
      establishment: { select: { asaasApiKey: true } },
    },
  })

  // Verify pending orders against Asaas and update DB
  const verifiedOrders = await Promise.all(
    orders.map(async (order) => {
      if (order.paymentStatus !== "pending" || !order.paymentId || !order.establishment.asaasApiKey) {
        const { establishment: _, paymentId: __, ...rest } = order
        return rest
      }
      try {
        const res = await fetch(`${ASAAS_API_URL}/payments/${order.paymentId}`, {
          headers: { access_token: order.establishment.asaasApiKey },
        })
        if (res.ok) {
          const asaasPayment = await res.json()
          if (["CONFIRMED", "RECEIVED", "AUTHORIZED"].includes(asaasPayment.status)) {
            await prisma.order.update({
              where: { id: order.id },
              data: { paymentStatus: "paid", status: "confirmed" },
            })
            const { establishment: _, paymentId: __, ...rest } = order
            return { ...rest, paymentStatus: "paid", status: "confirmed" }
          }
        }
      } catch {}
      const { establishment: _, paymentId: __, ...rest } = order
      return rest
    })
  )

  return NextResponse.json(verifiedOrders)
}
