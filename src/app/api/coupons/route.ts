import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const establishmentId = req.nextUrl.searchParams.get("establishmentId")
  if (!establishmentId) return NextResponse.json({ error: "establishmentId required" }, { status: 400 })

  const coupons = await prisma.coupon.findMany({
    where: { establishmentId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(coupons)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { code, type, value, minOrder, maxUses, expiresAt, establishmentId } = body

  if (!code || !establishmentId) {
    return NextResponse.json({ error: "code and establishmentId required" }, { status: 400 })
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        type: type || "percent",
        value: value || 0,
        minOrder: minOrder || 0,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        establishmentId,
      },
    })
    return NextResponse.json(coupon)
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Cupom já existe" }, { status: 409 })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
