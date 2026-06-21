import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await verifyAuth(req)
  if (!authUser) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  const establishmentId = authUser.establishmentId
  const coupon = await prisma.coupon.findUnique({ where: { id: params.id } })
  if (!coupon || coupon.establishmentId !== establishmentId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const body = await req.json()
  const data: any = {}
  if (body.code !== undefined) data.code = body.code.toUpperCase().trim()
  if (body.type !== undefined) data.type = body.type
  if (body.value !== undefined) data.value = body.value
  if (body.minOrder !== undefined) data.minOrder = body.minOrder
  if (body.maxUses !== undefined) data.maxUses = body.maxUses || null
  if (body.active !== undefined) data.active = body.active
  if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null

  const updated = await prisma.coupon.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await verifyAuth(_req)
  if (!authUser) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  const establishmentId = authUser.establishmentId
  const coupon = await prisma.coupon.findUnique({ where: { id: params.id } })
  if (!coupon || coupon.establishmentId !== establishmentId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  await prisma.coupon.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
