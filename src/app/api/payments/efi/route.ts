import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { createEfiPixCharge } from "@/lib/integrations/efi"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const authUser = await verifyAuth(req)
    if (!authUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: "orderId obrigatório" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { establishment: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    if (authUser.establishmentId !== order.establishmentId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const est = order.establishment

    if (!est.efiClientId || !est.efiClientSecret || !est.efiCertificate) {
      return NextResponse.json({ error: "Efi não configurada. Configure client ID, secret e certificado." }, { status: 400 })
    }

    const config = {
      clientId: est.efiClientId,
      clientSecret: est.efiClientSecret,
      certificate: est.efiCertificate,
      environment: (est.efiEnvironment || "sandbox") as "sandbox" | "production",
    }

    const txid = `flo${order.id.substring(0, 20)}${Date.now()}`.replace(/[^a-zA-Z0-9]/g, "").substring(0, 35)

    const items = JSON.parse(order.items)
    const description = items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")

    console.log("[Efi] Creating Pix charge:", { txid, amount: order.total, description })

    const charge = await createEfiPixCharge(config, {
      amount: order.total,
      description: `Pedido #${order.orderNumber} - ${description}`.substring(0, 140),
      expiration: 3600,
      txid,
    })

    console.log("[Efi] Charge created:", { txid: charge.txid, status: charge.status })

    const pixQrCodeUrl = charge.location
      ? `https://pix.sejaefi.com.br/v2/${charge.location.split("/").pop()}`
      : null

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: charge.txid,
        paymentLink: pixQrCodeUrl || `https://pix.sejaefi.com.br/v2/${charge.txid}`,
        paymentStatus: "pending",
      },
    })

    return NextResponse.json({
      txid: charge.txid,
      pixCopiaECola: charge.pixCopiaECola,
      qrCodeUrl: pixQrCodeUrl,
      status: charge.status,
      expiracao: charge.expiracao,
    })
  } catch (error: any) {
    console.error("[Efi] Error:", error.message)
    return NextResponse.json(
      { error: error.message || "Erro ao criar cobrança Efi" },
      { status: 500 }
    )
  }
}
