"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useEstablishmentId } from "@/hooks/use-establishment-id"
import { Bike, Phone, MapPin, Copy, UserPlus, Trash2, CheckCircle, Clock, Package, MessageCircle, ExternalLink, Loader2, Search, DollarSign, History, Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { fetchAuth } from "@/lib/fetch-auth"

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  payment_pending: "Aguard. Pagamento",
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready: "Pronto",
  out_for_delivery: "Saiu p/ Entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
}

const statusColors: Record<string, "info" | "warning" | "success" | "danger" | "default"> = {
  ready: "success",
  out_for_delivery: "info",
  delivered: "success",
}

export default function EntregasPage() {
  const searchParams = useSearchParams()
  const hookEstablishmentId = useEstablishmentId()
  const searchParamsEstablishmentId = searchParams.get("establishment")
  const establishmentId = searchParamsEstablishmentId || hookEstablishmentId
  const [deliveryPeople, setDeliveryPeople] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMotoboy, setSelectedMotoboy] = useState<string>("")
  const [showAdd, setShowAdd] = useState(false)
  const [newMotoboy, setNewMotoboy] = useState({ name: "", phone: "", defaultPassword: "123456" })
  const [tab, setTab] = useState<"entregas" | "financeiro">("entregas")
  const [payingMotoboy, setPayingMotoboy] = useState<string | null>(null)
  const [createdPassword, setCreatedPassword] = useState<string | null>(null)

  async function loadAll() {
    if (!establishmentId) return
    const [peopleRes, ordersRes, paymentsRes] = await Promise.all([
      fetchAuth(`/api/delivery-persons?establishmentId=${establishmentId}`),
      fetchAuth(`/api/orders?establishmentId=${establishmentId}`),
      fetchAuth(`/api/delivery-payments?establishmentId=${establishmentId}`),
    ])
    if (peopleRes.ok) setDeliveryPeople(await peopleRes.json())
    if (ordersRes.ok) setOrders(await ordersRes.json())
    if (paymentsRes.ok) setPayments(await paymentsRes.json())
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [establishmentId])
  useEffect(() => { const i = setInterval(loadAll, 10000); return () => clearInterval(i) }, [establishmentId])

  async function addMotoboy() {
    if (!establishmentId || !newMotoboy.name || !newMotoboy.phone) return
    const res = await fetchAuth("/api/delivery-persons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newMotoboy, establishmentId }),
    })
    const data = await res.json()
    setNewMotoboy({ name: "", phone: "", defaultPassword: "123456" })
    setShowAdd(false)
    if (data.defaultPassword) {
      setCreatedPassword(`Login: ${newMotoboy.phone} / Senha: ${data.defaultPassword}`)
      setTimeout(() => setCreatedPassword(null), 10000)
    }
    loadAll()
  }

  async function removeMotoboy(id: string) {
    await fetchAuth(`/api/delivery-persons/${id}`, { method: "DELETE" })
    loadAll()
  }

  async function reassignOrder(orderId: string, deliveryPersonId: string) {
    const person = deliveryPeople.find((p: any) => p.id === deliveryPersonId)
    await fetchAuth(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryPersonId, deliveryPersonName: person?.name || "" }),
    })
    loadAll()
  }

  function calcPendingAmount(person: any) {
    const completedOrders = orders.filter(
      (o: any) => o.deliveryPersonId === person.id && o.status === "delivered" && o.orderType === "delivery"
    )
    const totalEarned = completedOrders.reduce((sum: number, o: any) => sum + (o.deliveryFee || 0), 0)
    const totalPaid = (person.payments || []).reduce((sum: number, p: any) => sum + p.amount, 0)
    return totalEarned - totalPaid
  }

  async function payMotoboy(person: any) {
    if (!establishmentId) return
    const pending = calcPendingAmount(person)
    if (pending <= 0) return

    setPayingMotoboy(person.id)
    try {
      await fetchAuth("/api/delivery-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryPersonId: person.id,
          amount: pending,
          period: "manual",
          notes: `Pagamento referente a ${orders.filter((o: any) => o.deliveryPersonId === person.id && o.status === "delivered" && o.orderType === "delivery").length} entregas`,
          establishmentId,
        }),
      })
      loadAll()
    } finally {
      setPayingMotoboy(null)
    }
  }

  const filteredPeople = selectedMotoboy
    ? deliveryPeople.filter((p: any) => p.id === selectedMotoboy)
    : deliveryPeople

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900">Entregas</h2>
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo entregador
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("entregas")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "entregas" ? "bg-green-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
        >
          <Bike className="h-4 w-4" />
          Entregas
        </button>
        <button
          onClick={() => setTab("financeiro")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === "financeiro" ? "bg-green-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
        >
          <DollarSign className="h-4 w-4" />
          Financeiro
        </button>
      </div>

      {/* Created password banner */}
      {createdPassword && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          {createdPassword}
        </div>
      )}

      {/* Add motoboy form */}
      {showAdd && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Nome" value={newMotoboy.name} onChange={(e) => setNewMotoboy({ ...newMotoboy, name: e.target.value })} placeholder="Nome" />
              <Input label="WhatsApp" value={newMotoboy.phone} onChange={(e) => setNewMotoboy({ ...newMotoboy, phone: e.target.value })} placeholder="(11) 99999-9999" />
              <Input label="Senha padrão" value={newMotoboy.defaultPassword} onChange={(e) => setNewMotoboy({ ...newMotoboy, defaultPassword: e.target.value })} placeholder="123456" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={addMotoboy} className="gap-1"><UserPlus className="h-3 w-3" />Adicionar</Button>
              <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setNewMotoboy({ name: "", phone: "", defaultPassword: "123456" }) }}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== TAB: ENTREGAS ===== */}
      {tab === "entregas" && (
        <>
          {/* Motoboy filter tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedMotoboy("")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!selectedMotoboy ? "bg-green-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
            >
              Todos
            </button>
            {deliveryPeople.map((p: any) => {
              const pendings = orders.filter((o: any) => o.deliveryPersonId === p.id && ["ready", "out_for_delivery"].includes(o.status)).length
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedMotoboy(p.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedMotoboy === p.id ? "bg-green-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                >
                  <Bike className="h-3 w-3" />
                  {p.name}
                  {pendings > 0 && <span className="rounded-full bg-white/20 px-1.5 text-[10px]">{pendings}</span>}
                </button>
              )
            })}
          </div>

          {filteredPeople.map((person: any) => {
            const personOrders = orders.filter((o: any) => o.deliveryPersonId === person.id)
            const activeOrders = personOrders.filter((o: any) => ["ready", "out_for_delivery"].includes(o.status))
            const completedOrders = personOrders.filter((o: any) => o.status === "delivered")
            const hasOutForDelivery = personOrders.some((o: any) => o.status === "out_for_delivery")

            return (
              <Card key={person.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <Bike className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">{person.name}</p>
                        <p className="text-xs text-zinc-500">{person.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${person.establishmentSlug}/entregas/${person.token}`)}
                        className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                        title="Copiar link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeMotoboy(person.id)}
                        disabled={hasOutForDelivery}
                        className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-red-400"
                        title={hasOutForDelivery ? "Possui entrega em andamento" : "Remover"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-amber-50 p-3 text-center">
                      <p className="text-lg font-bold text-amber-600">{activeOrders.filter((o: any) => o.status === "ready").length}</p>
                      <p className="text-xs text-amber-500">Prontos</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                      <p className="text-lg font-bold text-blue-600">{activeOrders.filter((o: any) => o.status === "out_for_delivery").length}</p>
                      <p className="text-xs text-blue-500">Em rota</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3 text-center">
                      <p className="text-lg font-bold text-green-600">{completedOrders.length}</p>
                      <p className="text-xs text-green-500">Entregues</p>
                    </div>
                  </div>

                  {activeOrders.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pedidos ativos</p>
                      {activeOrders.map((order: any) => (
                        <OrderRow key={order.id} order={order} deliveryPeople={deliveryPeople} onReassign={reassignOrder} />
                      ))}
                    </div>
                  )}

                  {activeOrders.length === 0 && completedOrders.length === 0 && (
                    <p className="text-sm text-zinc-400 italic">Nenhum pedido atribuído</p>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {!selectedMotoboy && (
            <PendingOrdersSection orders={orders.filter((o: any) => o.status === "ready" && !o.deliveryPersonId)} deliveryPeople={deliveryPeople} onReassign={reassignOrder} />
          )}
        </>
      )}

      {/* ===== TAB: FINANCEIRO ===== */}
      {tab === "financeiro" && (
        <>
          {/* Pending amounts */}
          <Card>
            <CardContent className="p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 mb-3">
                <Wallet className="h-4 w-4" />
                Saldo Pendente por Motoboy
              </h3>
              <div className="space-y-3">
                {deliveryPeople.map((person: any) => {
                  const pending = calcPendingAmount(person)
                  const completedCount = orders.filter((o: any) => o.deliveryPersonId === person.id && o.status === "delivered" && o.orderType === "delivery").length
                  return (
                    <div key={person.id} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <Bike className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">{person.name}</p>
                          <p className="text-xs text-zinc-500">{completedCount} entregas • Taxa recebida: {formatCurrency(completedCount * 5)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${pending > 0 ? "text-amber-600" : "text-green-600"}`}>
                          {formatCurrency(pending)}
                        </span>
                        {pending > 0 && (
                          <Button
                            size="sm"
                            onClick={() => payMotoboy(person)}
                            disabled={payingMotoboy === person.id}
                            className="gap-1"
                          >
                            {payingMotoboy === person.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <DollarSign className="h-3 w-3" />}
                            Pagar
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {deliveryPeople.length === 0 && (
                  <p className="text-sm text-zinc-400 text-center py-4">Nenhum entregador cadastrado</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment history */}
          <Card>
            <CardContent className="p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 mb-3">
                <History className="h-4 w-4" />
                Histórico de Pagamentos
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {payments.length === 0 ? (
                  <p className="text-sm text-zinc-400 text-center py-4">Nenhum pagamento registrado</p>
                ) : (
                  payments.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{p.deliveryPerson?.name}</p>
                          <p className="text-xs text-zinc-400">
                            {new Date(p.createdAt).toLocaleString("pt-BR")}
                            {p.notes && ` • ${p.notes}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-green-600">{formatCurrency(p.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function OrderRow({ order, deliveryPeople, onReassign }: { order: any; deliveryPeople: any[]; onReassign: (id: string, personId: string) => void }) {
  const isLocked = ["out_for_delivery", "delivered", "cancelled"].includes(order.status)
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {order.orderNumber && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              #{order.orderNumber}
            </span>
          )}
          <p className="font-medium text-zinc-900">{order.customerName}</p>
          <Badge variant={statusColors[order.status] || "default"}>{statusLabels[order.status] || order.status}</Badge>
        </div>
        <p className="text-xs text-zinc-400">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
        {order.customerAddress && <p className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5"><MapPin className="h-3 w-3" />{order.customerAddress}</p>}
        {order.customerPhone && (
          <a href={`https://wa.me/55${order.customerPhone.replace(/\D/g, "")}`} target="_blank" className="flex items-center gap-1 text-xs text-green-600 hover:underline mt-0.5">
            <MessageCircle className="h-3 w-3" />{order.customerPhone}
          </a>
        )}
        <p className="text-xs text-zinc-500 mt-0.5">{formatCurrency(order.total)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <select
          value={order.deliveryPersonId || ""}
          onChange={(e) => onReassign(order.id, e.target.value)}
          disabled={isLocked}
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Sem motoboy</option>
          {deliveryPeople.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          onClick={() => {
            if (confirm("Cancelar este pedido?")) {
              fetchAuth(`/api/orders/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "cancelled" }),
              }).then(() => window.location.reload())
            }
          }}
          disabled={isLocked}
          className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-red-400"
          title={isLocked ? "Pedido em entrega/entregue" : "Cancelar pedido"}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function PendingOrdersSection({ orders, deliveryPeople, onReassign }: { orders: any[]; deliveryPeople: any[]; onReassign: (id: string, personId: string) => void }) {
  if (orders.length === 0) return null

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-3">
          <Package className="h-4 w-4" />
          Pedidos prontos sem motoboy ({orders.length})
        </h3>
        <div className="space-y-2">
          {orders.map((order: any) => (
            <OrderRow key={order.id} order={order} deliveryPeople={deliveryPeople} onReassign={onReassign} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
