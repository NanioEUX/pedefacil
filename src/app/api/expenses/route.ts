import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const establishmentId = req.nextUrl.searchParams.get("establishmentId")
  const from = req.nextUrl.searchParams.get("from")
  const to = req.nextUrl.searchParams.get("to")

  if (!establishmentId) return NextResponse.json({ error: "establishmentId required" }, { status: 400 })

  const where: any = { establishmentId }
  if (from || to) {
    where.date = {}
    if (from) where.date.gte = new Date(from)
    if (to) where.date.lte = new Date(to + "T23:59:59")
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
  })

  return NextResponse.json(expenses)
}

export async function POST(req: NextRequest) {
  const { description, amount, category, date, cashRegisterId, establishmentId } = await req.json()

  if (!description || !amount || !establishmentId) {
    return NextResponse.json({ error: "description, amount, establishmentId required" }, { status: 400 })
  }

  const expense = await prisma.expense.create({
    data: {
      description,
      amount,
      category: category || "variavel",
      date: date ? new Date(date) : new Date(),
      cashRegisterId: cashRegisterId || null,
      establishmentId,
    },
  })

  // If linked to a cash register, also create a cash movement
  if (cashRegisterId) {
    await prisma.cashMovement.create({
      data: {
        type: "expense",
        amount,
        description,
        cashRegisterId,
      },
    })
  }

  return NextResponse.json(expense)
}
