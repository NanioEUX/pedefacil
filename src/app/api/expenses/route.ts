import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const establishmentId = req.nextUrl.searchParams.get("establishmentId")
  const from = req.nextUrl.searchParams.get("from")
  const to = req.nextUrl.searchParams.get("to")
  const category = req.nextUrl.searchParams.get("category")
  const paymentMethod = req.nextUrl.searchParams.get("paymentMethod")
  const status = req.nextUrl.searchParams.get("status")
  const search = req.nextUrl.searchParams.get("search")

  if (!establishmentId) return NextResponse.json({ error: "establishmentId required" }, { status: 400 })

  const where: any = { establishmentId }
  if (from || to) {
    where.date = {}
    if (from) where.date.gte = new Date(from)
    if (to) where.date.lte = new Date(to + "T23:59:59")
  }
  if (category && category !== "all") where.category = category
  if (paymentMethod && paymentMethod !== "all") where.paymentMethod = paymentMethod

  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ]
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
  })

  // Enrich with computed status
  const today = new Date().toISOString().split("T")[0]
  const enriched = expenses.map((e) => {
    let computedStatus = "pago"
    if (e.isRecurring) {
      computedStatus = "pendente"
    }
    if (e.dueDate && computedStatus === "pendente") {
      const due = new Date(e.dueDate).toISOString().split("T")[0]
      if (due < today) computedStatus = "atrasada"
    }
    return { ...e, computedStatus }
  })

  // Filter by status if requested
  const filtered = status && status !== "all"
    ? enriched.filter((e) => e.computedStatus === status)
    : enriched

  return NextResponse.json(filtered)
}

export async function POST(req: NextRequest) {
  const { description, amount, category, date, dueDate, paymentMethod, isRecurring, recurrenceFreq, receiptUrl, cashRegisterId, establishmentId } = await req.json()

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
      dueDate: dueDate ? new Date(dueDate) : null,
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
