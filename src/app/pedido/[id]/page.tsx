import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { TrackingPage } from "./tracking-page"
import { redirect } from "next/navigation"

const allStatusSteps = [
  { key: "pending", label: "Pedido recebido", icon: "📥" },
  { key: "payment_pending", label: "Aguardando pagamento", icon: "⏳" },
  { key: "confirmed", label: "Confirmado", icon: "✅" },
  { key: "preparing", label: "Preparando", icon: "👨‍🍳" },
  { key: "ready", label: "Pronto", icon: "📦" },
  { key: "out_for_delivery", label: "Saiu para entrega", icon: "🛵" },
  { key: "delivered", label: "Entregue", icon: "🎉" },
]

export default async function OrderTrackingPage({
  params,
}: {
  params: { id: string }
}) {
  const order = await prisma.order.findFirst({
    where: {
      trackingToken: params.id,
    },
    include: { establishment: true },
  })

  if (!order) {
    notFound()
  }

  const statusSteps = order.paymentMethod === "online"
    ? allStatusSteps
    : allStatusSteps.filter(s => s.key !== "payment_pending")

  return <TrackingPage order={order} statusSteps={statusSteps} />
}
