import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = await prisma.order.findFirst({
    where: {
      trackingToken: params.id,
    },
    include: {
      establishment: {
        select: { name: true, phone: true, logo: true },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
  }

  return NextResponse.json({
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentLink: order.paymentLink,
    items: JSON.parse(order.items),
    total: order.total,
    customerName: order.customerName,
    customerAddress: order.customerAddress,
    notes: order.notes,
    deliveryPerson: order.deliveryPerson,
    method: order.method,
    createdAt: order.createdAt,
    establishment: order.establishment,
  })
}
