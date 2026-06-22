"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useEstablishmentId } from "@/hooks/use-establishment-id"
import { DollarSign, Plus, Trash2, ShoppingBag, CreditCard, Banknote, X, CheckCircle, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { fetchAuth } from "@/lib/fetch-auth"

const paymentLabels: Record<string, string> = { cash: "Dinheiro", card: "Cartão", pix: "Pix" }

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export default function CaixaPage() {
  const searchParams = useSearchParams()
  const hookEstablishmentId = useEstablishmentId()
  const searchParamsEstablishmentId = searchParams.get("establishment")
  const establishmentId = searchParamsEstablishmentId || hookEstablishmentId
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [customItem, setCustomItem] = useState({ name: "", price: "" })
  const [payment, setPayment] = useState("cash")
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)
  const [cashRegister, setCashRegister] = useState<any>(null)

  async function loadAll() {
    if (!establishmentId) return
    const [prodRes, orderRes] = await Promise.all([
      fetchAuth(`/api/categories?establishmentId=${establishmentId}`),
      fetchAuth(`/api/orders?establishmentId=${establishmentId}`),
    ])
    if (prodRes.ok) {
      const cats = await prodRes.json()
      const allProducts = cats.flatMap((c: any) => c.products || [])
      setProducts(allProducts.filter((p: any) => p.isAvailable))
    }
    if (orderRes.ok) {
      const data = await orderRes.json()
      setOrders(data)
    }
    const regRes = await fetchAuth(`/api/cash-register?establishmentId=${establishmentId}`)
    const regData = await regRes.json()
    setCashRegister(regData)
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [establishmentId])

  const todayOrders = orders.filter((o) => {
    const d = new Date(o.createdAt)
    const now = new Date()
    return d.toDateString() === now.toDateString() && o.status !== "cancelled"
  })

  const todayCash = todayOrders.filter((o) => o.paymentMethod === "cash").reduce((s, o) => s + o.total, 0)
  const todayCard = todayOrders.filter((o) => o.paymentMethod === "card").reduce((s, o) => s + o.total, 0)
  const todayPix = todayOrders.filter((o) => o.paymentMethod === "pix").reduce((s, o) => s + o.total, 0)
  const todayTotal = todayCash + todayCard + todayPix

  function addToCart(product: any) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      if (existing) {
        return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
  }

  function addCustomItem() {
    if (!customItem.name || !customItem.price) return
    setCart((prev) => [...prev, { productId: "custom", name: customItem.name, price: Number(customItem.price), quantity: 1 }])
    setCustomItem({ name: "", price: "" })
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) => prev.map((i) => {
      if (i.productId !== productId) return i
      const newQty = i.quantity + delta
      return newQty > 0 ? { ...i, quantity: newQty } : i
    }).filter((i) => i.quantity > 0))
  }

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  async function finalizeSale() {
    if (!establishmentId || cart.length === 0) return
    setClosing(true)
    try {
      await fetchAuth("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          establishmentId,
          customerName: "Cliente Balcão",
          items: JSON.stringify(cart),
          total: cartTotal,
          orderType: "presencial",
          paymentMethod: payment,
          method: "caixa",
          status: "delivered",
        }),
      })
      if (cashRegister) {
        await fetchAuth(`/api/cash-register/${cashRegister.id}/movements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "sale",
            amount: cartTotal,
            description: `Venda ${payment === "cash" ? "Dinheiro" : payment === "card" ? "Cartão" : "Pix"}`,
            paymentMethod: payment,
          }),
        })
      }
      setCart([])
      loadAll()
    } catch (err) {
      console.error(err)
    } finally {
      setClosing(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900">Caixa</h2>
      </div>

      {/* Resumo do dia */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-green-800 mb-3">
            <TrendingUp className="h-4 w-4" />
            Resumo do Dia
          </h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-green-700">{formatCurrency(todayTotal)}</p>
              <p className="text-xs text-green-600">Total</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">{formatCurrency(todayCash)}</p>
              <p className="text-xs text-green-500">Dinheiro</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(todayCard)}</p>
              <p className="text-xs text-blue-500">Cartão</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-600">{formatCurrency(todayPix)}</p>
              <p className="text-xs text-purple-500">Pix</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-green-600 text-center">{todayOrders.length} vendas hoje</p>
        </CardContent>
      </Card>

      {!cashRegister && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          Abra o caixa no financeiro antes de vender
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Produtos */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-zinc-900 mb-3">Produtos</h3>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {products.length === 0 && <p className="text-sm text-zinc-400">Nenhum produto disponível</p>}
              {products.map((p) => (
                <button key={p.id} onClick={() => addToCart(p)} className="flex w-full items-center justify-between rounded-lg border border-zinc-200 p-3 text-left hover:bg-green-50 hover:border-green-300 transition-colors">
                  <div>
                    <p className="font-medium text-zinc-900">{p.name}</p>
                    <p className="text-sm text-green-600">{formatCurrency(p.price)}</p>
                  </div>
                  <Plus className="h-4 w-4 text-green-600" />
                </button>
              ))}
            </div>

            {/* Item personalizado */}
            <div className="mt-3 flex gap-2">
              <Input placeholder="Item avulso" value={customItem.name} onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })} className="flex-1" />
              <Input placeholder="R$" type="number" step="0.01" value={customItem.price} onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })} className="w-24" />
              <Button size="sm" onClick={addCustomItem} disabled={!customItem.name || !customItem.price}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Carrinho */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-zinc-900 mb-3">Venda Atual</h3>
            {cart.length === 0 ? (
              <p className="text-sm text-zinc-400 py-8 text-center">Selecione produtos ou adicione itens avulsos</p>
            ) : (
              <>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                        <p className="text-xs text-zinc-500">{formatCurrency(item.price)} cada</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.productId, -1)} className="h-6 w-6 rounded-full bg-zinc-200 text-xs font-bold hover:bg-zinc-300">-</button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, 1)} className="h-6 w-6 rounded-full bg-zinc-200 text-xs font-bold hover:bg-zinc-300">+</button>
                        <button onClick={() => removeFromCart(item.productId)} className="ml-1 text-red-400 hover:text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-zinc-200 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-zinc-700">Total</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(cartTotal)}</span>
                  </div>

                  {/* Forma de pagamento */}
                  <div className="flex gap-2 mb-3">
                    {[
                      { value: "cash", icon: Banknote, label: "Dinheiro" },
                      { value: "card", icon: CreditCard, label: "Cartão" },
                      { value: "pix", icon: DollarSign, label: "Pix" },
                    ].map((p) => (
                      <button key={p.value} onClick={() => setPayment(p.value)} className={`flex flex-1 items-center justify-center gap-1 rounded-lg border p-2 text-xs font-medium transition-colors ${payment === p.value ? "border-green-500 bg-green-50 text-green-700" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>
                        <p.icon className="h-3 w-3" />
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <Button onClick={finalizeSale} disabled={closing || cart.length === 0 || !cashRegister} className="w-full gap-2">
                    {closing ? "Registrando..." : <><CheckCircle className="h-4 w-4" />Finalizar Venda</>}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Últimas vendas do dia */}
      {todayOrders.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-zinc-900 mb-3">Vendas de Hoje ({todayOrders.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {todayOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{o.customerName}</p>
                    <p className="text-xs text-zinc-400">{new Date(o.createdAt).toLocaleTimeString("pt-BR")} • {paymentLabels[o.paymentMethod] || o.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{formatCurrency(o.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
