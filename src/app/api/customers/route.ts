import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get("phone")
  const establishmentId = searchParams.get("establishmentId")

  if (!establishmentId) {
    return NextResponse.json({ error: "establishmentId é obrigatório" }, { status: 400 })
  }

  // Phone lookup: public (used by menu page)
  if (phone) {
    const customer = await prisma.customer.findFirst({
      where: { phone, establishmentId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(customer || { notFound: true })
  }

  // List all customers: requires auth
  const user = await verifyAuth(req)
  if (!user || user.establishmentId !== establishmentId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const customers = await prisma.customer.findMany({
    where: { establishmentId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(customers)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone, name, address, cep, establishmentId } = body

    if (!phone || !establishmentId) {
      return NextResponse.json({ error: "phone e establishmentId são obrigatórios" }, { status: 400 })
    }

    const existing = await prisma.customer.findFirst({
      where: { phone, establishmentId },
    })

    if (existing) {
      const customer = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          name: name || existing.name,
          address: address !== undefined ? address : existing.address,
          cep: cep !== undefined ? cep : existing.cep,
        },
      })
      return NextResponse.json(customer)
    }

    const customer = await prisma.customer.create({
      data: { phone, name, address, cep, establishmentId },
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 })
  }
}
