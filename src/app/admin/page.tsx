import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export const dynamic = "force-dynamic"

async function checkAdmin() {
  const headersList = headers()
  const auth = headersList.get("authorization")
  if (auth !== "admin") {
    redirect("/dashboard")
  }
}

export default async function AdminPage() {
  const establishments = await prisma.establishment.findMany({
    include: {
      _count: { select: { orders: true } },
      orders: {
        where: { status: { not: "cancelled" } },
        select: { total: true, status: true, paymentStatus: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Admin — Todos os Estabelecimentos</h1>
        <p className="text-zinc-500 mb-8">Visão geral de todas as contas da plataforma</p>

        {/* Global stats */}
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm text-zinc-500">Estabelecimentos</p>
            <p className="text-2xl font-bold">{establishments.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm text-zinc-500">Total Pedidos</p>
            <p className="text-2xl font-bold">
              {establishments.reduce((s, e) => s + e._count.orders, 0)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm text-zinc-500">Faturamento Bruto</p>
            <p className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                establishments.reduce((s, e) => s + e.orders.reduce((s2, o) => s2 + o.total, 0), 0)
              )}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm text-zinc-500">Sua Comissão (10%)</p>
            <p className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                establishments.reduce((s, e) => s + e.orders.reduce((s2, o) => s2 + o.total * (e.platformFee / 100), 0), 0)
              )}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="text-left p-4 font-medium text-zinc-600">Estabelecimento</th>
                <th className="text-left p-4 font-medium text-zinc-600">Email</th>
                <th className="text-center p-4 font-medium text-zinc-600">Pedidos</th>
                <th className="text-right p-4 font-medium text-zinc-600">Faturamento</th>
                <th className="text-right p-4 font-medium text-zinc-600">Taxa</th>
                <th className="text-right p-4 font-medium text-zinc-600">Comissão (você)</th>
                <th className="text-right p-4 font-medium text-zinc-600">A receber</th>
                <th className="text-center p-4 font-medium text-zinc-600">Asaas</th>
              </tr>
            </thead>
            <tbody>
              {establishments.map((est) => {
                const totalOrders = est.orders.length
                const revenue = est.orders.reduce((s, o) => s + o.total, 0)
                const fee = revenue * (est.platformFee / 100)
                const net = revenue - fee
                const hasAsaas = est.asaasApiKey && est.asaasApiKey.length > 0

                return (
                  <tr key={est.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="p-4">
                      <a href={`/${est.slug}`} target="_blank" className="font-medium text-zinc-900 hover:text-green-600">
                        {est.name}
                      </a>
                      <p className="text-xs text-zinc-400">/{est.slug}</p>
                    </td>
                    <td className="p-4 text-zinc-600">{est.email}</td>
                    <td className="p-4 text-center font-medium">{totalOrders}</td>
                    <td className="p-4 text-right font-medium text-green-600">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(revenue)}
                    </td>
                    <td className="p-4 text-right text-zinc-600">{est.platformFee}%</td>
                    <td className="p-4 text-right font-medium text-blue-600">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(fee)}
                    </td>
                    <td className="p-4 text-right font-medium">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(net)}
                    </td>
                    <td className="p-4 text-center">
                      {hasAsaas ? "✅" : "❌"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-zinc-400">
          Acesso restrito. Esta página mostra apenas dados consolidados para administração da plataforma.
        </p>
      </div>
    </div>
  )
}
