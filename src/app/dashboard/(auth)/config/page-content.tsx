"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useEstablishmentId } from "@/hooks/use-establishment-id"
import { Save, Loader2, Eye, EyeOff, DollarSign, Info, CreditCard, Banknote, Bike, Store, UserPlus, Trash2, Copy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { fetchAuth } from "@/lib/fetch-auth"

const categories = [
  { value: "restaurante", label: "Restaurante" },
  { value: "pizzaria", label: "Pizzaria" },
  { value: "hamburgueria", label: "Hamburgueria" },
  { value: "lanchonete", label: "Lanchonete" },
  { value: "padaria", label: "Padaria / Confeitaria" },
  { value: "sorveteria", label: "Sorveteria / Açaí" },
  { value: "petiscaria", label: "Petiscaria / Bar" },
  { value: "japonesa", label: "Comida Japonesa" },
  { value: "brasileira", label: "Comida Brasileira" },
  { value: "outro", label: "Outro" },
]

export default function ConfigPage() {
  const searchParams = useSearchParams()
  const hookEstablishmentId = useEstablishmentId()
  const searchParamsEstablishmentId = searchParams.get("establishment")
  const establishmentId = searchParamsEstablishmentId || hookEstablishmentId
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [form, setForm] = useState({
    name: "",
    phone: "",
    category: "",
    address: "",
    description: "",
    logo: "",
    cover: "",
    asaasApiKey: "",
    asaasWalletId: "",
    deliveryFeeType: "free",
    deliveryFeeAmount: "0",
    deliveryFreeAbove: "0",
  })
  const [paymentConfig, setPaymentConfig] = useState({ online: true, delivery: true, pickup: true })
  const [orderConfig, setOrderConfig] = useState({ delivery: true, pickup: true })
  const [finances, setFinances] = useState({ total: 0, fee: 0, net: 0, orders: 0 })
  const [deliveryPeople, setDeliveryPeople] = useState<any[]>([])
  const [showAddMotoboy, setShowAddMotoboy] = useState(false)
  const [newMotoboy, setNewMotoboy] = useState({ name: "", phone: "" })

  useEffect(() => {
    if (!establishmentId) return
    fetchAuth(`/api/establishments?id=${establishmentId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setForm({
            name: data.name || "",
            phone: data.phone || "",
            category: data.category || "",
            address: data.address || "",
            description: data.description || "",
            logo: data.logo || "",
            cover: data.cover || "",
            asaasApiKey: data.asaasApiKey || "",
            asaasWalletId: data.asaasWalletId || "",
            deliveryFeeType: data.deliveryFeeType || "free",
            deliveryFeeAmount: String(data.deliveryFeeAmount || "0"),
            deliveryFreeAbove: String(data.deliveryFreeAbove || "0"),
          })
          if (data.paymentConfig) {
            try { setPaymentConfig(JSON.parse(data.paymentConfig)) } catch {}
          }
          if (data.orderConfig) {
            try { setOrderConfig(JSON.parse(data.orderConfig)) } catch {}
          }
        }
      })

    fetchAuth(`/api/orders?establishmentId=${establishmentId}`)
      .then((r) => r.json())
      .then((orders) => {
        const paid = orders.filter((o: any) => o.paymentStatus === "paid" || o.status !== "cancelled")
        const total = paid.reduce((s: number, o: any) => s + o.total, 0)
        setFinances({
          total,
          fee: total * 0.1,
          net: total * 0.9,
          orders: paid.length,
        })
      })
  }, [establishmentId])

  async function loadDeliveryPeople() {
    if (!establishmentId) return
    const res = await fetchAuth(`/api/delivery-persons?establishmentId=${establishmentId}`)
    if (res.ok) setDeliveryPeople(await res.json())
  }

  useEffect(() => { loadDeliveryPeople() }, [establishmentId])

  async function addMotoboy() {
    if (!establishmentId || !newMotoboy.name || !newMotoboy.phone) return
    const res = await fetchAuth("/api/delivery-persons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newMotoboy, establishmentId }),
    })
    if (res.ok) {
      setNewMotoboy({ name: "", phone: "" })
      setShowAddMotoboy(false)
      loadDeliveryPeople()
    }
  }

  async function removeMotoboy(id: string) {
    await fetchAuth(`/api/delivery-persons/${id}`, { method: "DELETE" })
    loadDeliveryPeople()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    try {
      const res = await fetchAuth(`/api/establishments/${establishmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deliveryFeeAmount: form.deliveryFeeType === "free" ? 0 : Number(form.deliveryFeeAmount),
          deliveryFreeAbove: form.deliveryFeeType === "free_above" ? Number(form.deliveryFreeAbove) : 0,
          paymentConfig: JSON.stringify(paymentConfig),
          orderConfig: JSON.stringify(orderConfig),
        }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900">Configurações</h2>

      {/* Financial Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <h3 className="flex items-center gap-2 font-semibold text-zinc-900 mb-4">
            <DollarSign className="h-5 w-5 text-green-600" />
            Resumo Financeiro
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-zinc-500">Vendas</p>
              <p className="text-lg font-bold text-zinc-900">{formatCurrency(finances.total)}</p>
              <p className="text-xs text-zinc-400">{finances.orders} pedidos</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Taxa da Plataforma (10%)</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(finances.fee)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Seu Líquido</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(finances.net)}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-400 flex items-center gap-1">
            <Info className="h-3 w-3" />
            A taxa de 10% é descontada automaticamente no split do Asaas quando o cliente paga.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-zinc-900">Dados do Estabelecimento</h3>
            <Input label="Nome" id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="WhatsApp (com DDD)" id="phone" placeholder="11999999999" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Select label="Categoria" id="category" options={categories} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input label="Endereço" id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <Textarea label="Descrição" id="description" placeholder="Descreva seu estabelecimento..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-zinc-900">Asaas (Pagamentos Online)</h3>
            <p className="text-sm text-zinc-500">
              Integração com Asaas para aceitar Pix e cartão. O split repassa automaticamente
              sua parte (10%) para nossa plataforma e o restante para sua conta.
            </p>
            <div className="relative">
              <Input label="API Key" id="asaasApiKey" type={showKey ? "text" : "password"} placeholder="asaas_api_key_..." value={form.asaasApiKey} onChange={(e) => setForm({ ...form, asaasApiKey: e.target.value })} />
              <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-8 text-zinc-400 hover:text-zinc-600">
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-zinc-900">
              <Bike className="h-4 w-4" />
              Entregadores
            </h3>

            {deliveryPeople.length > 0 && (
              <div className="space-y-2">
                {deliveryPeople.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <div>
                      <p className="font-medium text-zinc-900">{p.name}</p>
                      <p className="text-xs text-zinc-500">{p.phone}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${p.establishmentSlug}/entregas/${p.token}`) }}
                        className="rounded p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
                        title="Copiar link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMotoboy(p.id)}
                        className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showAddMotoboy ? (
              <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <Input label="Nome" value={newMotoboy.name} onChange={(e) => setNewMotoboy({ ...newMotoboy, name: e.target.value })} placeholder="Ex: João" />
                <Input label="WhatsApp" value={newMotoboy.phone} onChange={(e) => setNewMotoboy({ ...newMotoboy, phone: e.target.value })} placeholder="(11) 99999-9999" />
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={addMotoboy} className="gap-1">
                    <UserPlus className="h-3 w-3" />
                    Adicionar
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => { setShowAddMotoboy(false); setNewMotoboy({ name: "", phone: "" }) }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddMotoboy(true)}
                className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
              >
                <UserPlus className="h-4 w-4" />
                Adicionar entregador
              </button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-zinc-900">Tipos de Pedido</h3>
            <p className="text-sm text-zinc-500">Habilite ou desabilite os tipos de pedido disponíveis no cardápio.</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-50">
                <input type="checkbox" checked={orderConfig.delivery} onChange={(e) => setOrderConfig({ ...orderConfig, delivery: e.target.checked })} className="h-5 w-5 rounded border-zinc-300 text-green-600 focus:ring-green-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <Bike className="h-4 w-4 text-zinc-600" />
                    <span className="font-medium text-zinc-900">Entrega</span>
                  </div>
                  <p className="text-xs text-zinc-500">Cliente recebe em casa</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-50">
                <input type="checkbox" checked={orderConfig.pickup} onChange={(e) => setOrderConfig({ ...orderConfig, pickup: e.target.checked })} className="h-5 w-5 rounded border-zinc-300 text-green-600 focus:ring-green-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-zinc-600" />
                    <span className="font-medium text-zinc-900">Retirada</span>
                  </div>
                  <p className="text-xs text-zinc-500">Cliente busca no local</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-zinc-900">Taxa de Entrega</h3>
            <p className="text-sm text-zinc-500">Configure como a taxa de entrega é calculada.</p>
            <div className="space-y-4">
              <div className="space-y-2">
                {[
                  { value: "free", label: "Grátis", desc: "Sem taxa de entrega" },
                  { value: "fixed", label: "Taxa fixa", desc: "Valor único por pedido" },
                  { value: "free_above", label: "Grátis acima de R$ X", desc: "Cobra taxa só em pedidos abaixo de um valor" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-50">
                    <input
                      type="radio"
                      name="deliveryFeeType"
                      value={opt.value}
                      checked={form.deliveryFeeType === opt.value}
                      onChange={(e) => setForm({ ...form, deliveryFeeType: e.target.value })}
                      className="h-4 w-4 border-zinc-300 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-zinc-900">{opt.label}</span>
                      <p className="text-xs text-zinc-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {form.deliveryFeeType !== "free" && (
                <div className="rounded-lg bg-zinc-50 p-4 space-y-3">
                  <Input label="Valor da taxa (R$)" id="deliveryFeeAmount" type="number" step="0.01" min="0" placeholder="5,00" value={form.deliveryFeeAmount} onChange={(e) => setForm({ ...form, deliveryFeeAmount: e.target.value })} />
                  {form.deliveryFeeType === "free_above" && (
                    <Input label="Grátis a partir de (R$)" id="deliveryFreeAbove" type="number" step="0.01" min="0" placeholder="50,00" value={form.deliveryFreeAbove} onChange={(e) => setForm({ ...form, deliveryFreeAbove: e.target.value })} />
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-zinc-900">Formas de Pagamento</h3>
            <p className="text-sm text-zinc-500">Quais formas de pagamento o cliente vê na hora de fechar o pedido.</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-50">
                <input type="checkbox" checked={paymentConfig.online} onChange={(e) => setPaymentConfig({ ...paymentConfig, online: e.target.checked })} className="h-5 w-5 rounded border-zinc-300 text-green-600 focus:ring-green-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-zinc-600" />
                    <span className="font-medium text-zinc-900">Online (Pix / Cartão)</span>
                  </div>
                  <p className="text-xs text-zinc-500">Cliente paga na hora via Asaas</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-50">
                <input type="checkbox" checked={paymentConfig.delivery} onChange={(e) => setPaymentConfig({ ...paymentConfig, delivery: e.target.checked })} className="h-5 w-5 rounded border-zinc-300 text-green-600 focus:ring-green-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-zinc-600" />
                    <span className="font-medium text-zinc-900">Pagar na Entrega</span>
                  </div>
                  <p className="text-xs text-zinc-500">Cliente paga em dinheiro/cartão na entrega</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-50">
                <input type="checkbox" checked={paymentConfig.pickup} onChange={(e) => setPaymentConfig({ ...paymentConfig, pickup: e.target.checked })} className="h-5 w-5 rounded border-zinc-300 text-green-600 focus:ring-green-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-zinc-600" />
                    <span className="font-medium text-zinc-900">Pagar na Retirada</span>
                  </div>
                  <p className="text-xs text-zinc-500">Cliente paga ao buscar</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-zinc-900">Aparência</h3>
            <Input label="URL da Logo" id="logo" placeholder="https://..." value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
            <Input label="URL da Capa (opcional)" id="cover" placeholder="https://..." value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar alterações
          </Button>
          {saved && <span className="flex items-center gap-1 text-sm text-green-600"><Save className="h-4 w-4" />Salvo!</span>}
        </div>
      </form>
    </div>
  )
}
