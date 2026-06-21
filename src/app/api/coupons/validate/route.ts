import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { code, establishmentId, orderTotal } = await req.json()

  if (!code || !establishmentId) {
    return NextResponse.json({ error: "code and establishmentId required" }, { status: 400 })
  }

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: code.toUpperCase().trim(),
      establishmentId,
      active: true,
    },
  })

  if (!coupon) {
    return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 })
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Cupom expirado" }, { status: 400 })
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "Cupom esgotado" }, { status: 400 })
  }

  if (orderTotal && coupon.minOrder > 0 && orderTotal < coupon.minOrder) {
    return NextResponse.json({
      error: `Pedido mínimo R$ ${coupon.minOrder.toFixed(2)}`,
    }, { status: 400 })
  }

  let discount = 0
  if (coupon.type === "percent") {
    discount = (orderTotal || 0) * (coupon.value / 100)
  } else {
    discount = coupon.value
  }

  return NextResponse.json({
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    },
    discount: Math.min(discount, orderTotal || Infinity),
  })
}
