import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const authUser = await verifyAuth(req)
    if (!authUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const establishmentId = authUser.establishmentId
    const { productId, stockItemId, quantity } = await req.json()
    if (!productId || !stockItemId || !quantity) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product || product.establishmentId !== establishmentId) {
      return NextResponse.json({ error: "Produto não pertence a este estabelecimento" }, { status: 403 })
    }

    const stockItem = await prisma.stockItem.findUnique({ where: { id: stockItemId } })
    if (!stockItem || stockItem.establishmentId !== establishmentId) {
      return NextResponse.json({ error: "Item de estoque não pertence a este estabelecimento" }, { status: 403 })
    }

    const existing = await prisma.productStockLink.findUnique({
      where: { productId_stockItemId: { productId, stockItemId } },
    })

    if (existing) {
      const updated = await prisma.productStockLink.update({
        where: { id: existing.id },
        data: { quantity },
      })
      return NextResponse.json(updated)
    }

    const link = await prisma.productStockLink.create({
      data: { productId, stockItemId, quantity },
    })
    return NextResponse.json(link)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID necessário" }, { status: 400 })
    }

    const link = await prisma.productStockLink.findUnique({ where: { id } })
    if (!link) {
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 })
    }

    await prisma.productStockLink.delete({ where: { id } })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 })
  }
}
