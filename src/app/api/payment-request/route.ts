import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const establishmentId = searchParams.get("establishmentId")
  if (!establishmentId) {
    return NextResponse.json({ error: "establishmentId necessário" }, { status: 400 })
  }

  const requests = await prisma.paymentRequest.findMany({
    where: { establishmentId, status: "pending" },
    orderBy: { createdAt: "asc" },
  })

  const grouped: Record<number, any[]> = {}
  for (const req of requests) {
    const table = req.tableNumber
    if (!grouped[table]) grouped[table] = []
    grouped[table].push(req)
  }

  const tables = Object.entries(grouped).map(([tableNum, reqs]) => ({
    tableNumber: parseInt(tableNum),
    total: 0,
    orders: [] as any[],
    requestedAt: reqs[0].createdAt,
    requestIds: reqs.map((r) => r.id),
  }))

  // Fetch orders for these tables
  for (const table of tables) {
    const orders = await prisma.order.findMany({
      where: {
        establishmentId,
        tableNumber: table.tableNumber,
        orderType: "presencial",
        status: { notIn: ["cancelled", "delivered"] },
      },
    })
    table.orders = orders
    table.total = orders.reduce((s: number, o: any) => s + o.total, 0)
  }

  return NextResponse.json(tables)
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { tableNumber, establishmentId, paymentMethod } = body
    if (!tableNumber || !establishmentId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Mark payment requests as resolved
    await prisma.paymentRequest.updateMany({
      where: { establishmentId, tableNumber, status: "pending" },
      data: { status: "resolved", paymentMethod, resolvedAt: new Date() },
    })

    // Mark orders as delivered/paid
    await prisma.order.updateMany({
      where: {
        establishmentId,
        tableNumber,
        orderType: "presencial",
        status: { notIn: ["cancelled", "delivered"] },
      },
      data: {
        paymentStatus: "paid",
        paymentMethod,
        status: "delivered",
        deliveredAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao confirmar pagamento" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tableNumber, establishmentId } = body
    if (!tableNumber || !establishmentId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Check if there's already a pending request for this table
    const existing = await prisma.paymentRequest.findFirst({
      where: { establishmentId, tableNumber, status: "pending" },
    })

    if (!existing) {
      await prisma.paymentRequest.create({
        data: { tableNumber, establishmentId },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao solicitar pagamento" }, { status: 500 })
  }
}
