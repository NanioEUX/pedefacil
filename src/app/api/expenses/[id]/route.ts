import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await verifyAuth(_req)
  if (!authUser) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  const establishmentId = authUser.establishmentId
  const expense = await prisma.expense.findUnique({ where: { id: params.id } })
  if (!expense || expense.establishmentId !== establishmentId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  await prisma.expense.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
