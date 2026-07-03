import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const establishmentId = req.nextUrl.searchParams.get("establishmentId")
  const from = req.nextUrl.searchParams.get("from")
  const to = req.nextUrl.searchParams.get("to")
  const category = req.nextUrl.searchParams.get("category")
  const paymentMethod = req.nextUrl.searchParams.get("paymentMethod")

  if (!establishmentId) return NextResponse.json({ error: "establishmentId required" }, { status: 400 })

  const where: any = { establishmentId }
  if (from || to) {
    where.date = {}
    if (from) where.date.gte = new Date(from)
    if (to) where.date.lte = new Date(to + "T23:59:59")
  }
  if (category && category !== "all") where.category = category
  if (paymentMethod && paymentMethod !== "all") where.paymentMethod = paymentMethod

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
  })

  return NextResponse.json(expenses)
}

export async function POST(req: NextRequest) {
  const { description, amount, category, date, paymentMethod, isRecurring, recurrenceFreq, receiptUrl, cashRegisterId, establishmentId } = await req.json()

  if (!description || !amount || !establishmentId) {
    return NextResponse.json({ error: "description, amount, establishmentId required" }, { status: 400 })
  }

  const expense = await prisma.expense.create({
    data: {
      description,
      amount,
      category: category || "variavel",
      paymentMethod: paymentMethod || "dinheiro",
      isRecurring: isRecurring || false,
      recurrenceFreq: recurrenceFreq || null,
      receiptUrl: receiptUrl || null,
      date: date ? new Date(date) : new Date(),
      cashRegisterId: cashRegisterId || null,
      establishmentId,
    },
  })

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
