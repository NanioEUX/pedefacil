"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useEstablishmentId } from "@/hooks/use-establishment-id"
import { Plus, Pencil, Trash2, UtensilsCrossed, X, GripVertical, Star, Sparkles, Tag, Image as ImageIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { fetchAuth } from "@/lib/fetch-auth"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  isAvailable: boolean
  order: number
  badge: string | null
  categoryId: string
  stockItemId: string | null
}

interface Category {
  id: string
  name: string
  order: number
  products: Product[]
}

const BADGE_OPTIONS = [
  { value: "", label: "Nenhum", icon: null },
  { value: "mais_vendido", label: "Mais Vendido", icon: Star, color: "text-amber-500 bg-amber-50" },
  { value: "novo", label: "Novo", icon: Sparkles, color: "text-blue-500 bg-blue-50" },
  { value: "promocao", label: "Promoção", icon: Tag, color: "text-red-500 bg-red-50" },
]

function getBadgeDisplay(badge: string | null) {
  const found = BADGE_OPTIONS.find((b) => b.value === badge)
  if (!found || !found.icon) return null
  const Icon = found.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${found.color}`}>
      <Icon className="h-3 w-3" />
      {found.label}
    </span>
  )
}

export default function CardapioPage() {
  const searchParams = useSearchParams()
  const hookEstablishmentId = useEstablishmentId()
  const searchParamsEstablishmentId = searchParams.get("establishment")
  const establishmentId = searchParamsEstablishmentId || hookEstablishmentId
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    image: "",
    badge: "",
    stockItemId: "",
  })
  const [stockItems, setStockItems] = useState<any[]>([])
  const [productLinks, setProductLinks] = useState<{ stockItemId: string; quantity: string }[]>([])

  async function loadData() {
    if (!establishmentId) return
    setLoading(true)
    const [catRes, stockRes] = await Promise.all([
      fetchAuth(`/api/categories?establishmentId=${establishmentId}`),
      fetchAuth(`/api/stock?establishmentId=${establishmentId}`),
    ])
    if (catRes.ok) setCategories(await catRes.json())
    if (stockRes.ok) {
      const data = await stockRes.json()
      setStockItems(data.items)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [establishmentId])

  async function addCategory() {
    if (!newCategoryName.trim() || !establishmentId) return
    await fetchAuth("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "category",
        name: newCategoryName,
        establishmentId,
      }),
    })
    setNewCategoryName("")
    setShowCategoryForm(false)
    loadData()
  }

  async function deleteCategory(id: string) {
    if (!confirm("Remover esta categoria e todos os produtos?")) return
    await fetchAuth(`/api/categories/${id}`, { method: "DELETE" })
    loadData()
  }

  async function saveProduct() {
    if (!establishmentId || !productForm.categoryId) return

    const body: any = {
      name: productForm.name,
      description: productForm.description,
      type: "product",
      price: parseFloat(productForm.price),
      image: productForm.image || null,
      badge: productForm.badge || null,
      stockItemId: productForm.stockItemId || null,
      establishmentId,
      categoryId: productForm.categoryId,
    }

    let productId = editingProduct?.id

    if (editingProduct) {
      await fetchAuth(`/api/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    } else {
      const maxOrder = categories.find((c) => c.id === productForm.categoryId)?.products.length || 0
      body.order = maxOrder
      const res = await fetchAuth("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      productId = data.id
    }

    if (productId) {
      for (const link of productLinks) {
        if (link.stockItemId && parseFloat(link.quantity) > 0) {
          await fetchAuth("/api/stock/links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, stockItemId: link.stockItemId, quantity: parseFloat(link.quantity) }),
          })
        }
      }
    }

    setShowProductForm(false)
    setEditingProduct(null)
    setProductForm({ name: "", description: "", price: "", categoryId: "", image: "", badge: "", stockItemId: "" })
    setProductLinks([])
    loadData()
  }

  async function deleteProduct(id: string) {
    if (!confirm("Remover este produto?")) return
    await fetchAuth(`/api/products/${id}`, { method: "DELETE" })
    loadData()
  }

  function editProduct(product: Product) {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      categoryId: product.categoryId,
      image: product.image || "",
      badge: product.badge || "",
      stockItemId: product.stockItemId || "",
    })
    const links = (product as any).stockLinks || []
    setProductLinks(links.map((l: any) => ({ stockItemId: l.stockItemId, quantity: String(l.quantity) })))
    setShowProductForm(true)
  }

  function openNewProduct(categoryId: string) {
    setEditingProduct(null)
    setProductForm({ name: "", description: "", price: "", categoryId, image: "", badge: "", stockItemId: "" })
    setProductLinks([])
    setShowProductForm(true)
  }

  async function moveProduct(productId: string, categoryId: string, direction: "up" | "down") {
    const cat = categories.find((c) => c.id === categoryId)
    if (!cat) return
    const sorted = [...cat.products].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((p) => p.id === productId)
    if (idx === -1) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const a = sorted[idx]
    const b = sorted[swapIdx]

    await fetchAuth(`/api/products/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: b.order }),
    })
    await fetchAuth(`/api/products/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: a.order }),
    })
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900">Cardápio</h2>
        <Button onClick={() => setShowCategoryForm(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Categories */}
      {categories.map((cat) => {
        const sorted = [...cat.products].sort((a, b) => a.order - b.order)
        return (
          <Card key={cat.id}>
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900">{cat.name}</h3>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openNewProduct(cat.id)}>
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {sorted.length === 0 ? (
                <p className="py-4 text-center text-sm text-zinc-400">
                  Nenhum produto nesta categoria
                </p>
              ) : (
                <div className="space-y-2">
                  {sorted.map((product, idx) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3"
                    >
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveProduct(product.id, cat.id, "up")}
                          disabled={idx === 0}
                          className="text-zinc-300 hover:text-zinc-600 disabled:opacity-30"
                        >
                          <GripVertical className="h-3 w-3 -rotate-90" />
                        </button>
                        <button
                          onClick={() => moveProduct(product.id, cat.id, "down")}
                          disabled={idx === sorted.length - 1}
                          className="text-zinc-300 hover:text-zinc-600 disabled:opacity-30"
                        >
                          <GripVertical className="h-3 w-3 rotate-90" />
                        </button>
                      </div>

                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-200 text-xl">
                          🍕
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-zinc-900">{product.name}</p>
                          {!product.isAvailable && <Badge variant="danger">Indisponível</Badge>}
                          {product.stockItemId && <Badge variant="success">Vendável</Badge>}
                          {getBadgeDisplay(product.badge)}
                        </div>
                        {product.description && (
                          <p className="text-sm text-zinc-500 truncate">{product.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-green-600">
                          {formatCurrency(product.price)}
                        </span>
                        <button
                          onClick={() => editProduct(product)}
                          className="text-zinc-400 hover:text-zinc-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      {categories.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center">
          <UtensilsCrossed className="mx-auto h-8 w-8 text-zinc-300" />
          <p className="mt-2 text-sm text-zinc-500">Crie uma categoria para começar</p>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Nova Categoria</h3>
                <button onClick={() => setShowCategoryForm(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Input
                placeholder="Ex: Bebidas, Sobremesas..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowCategoryForm(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={addCategory}>
                  Criar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Product Modal */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
          <Card className="w-full max-w-lg my-8">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </h3>
                <button onClick={() => { setShowProductForm(false); setEditingProduct(null) }}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <Input
                  label="Nome"
                  placeholder="Ex: Pizza Calabresa"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
                <Textarea
                  label="Descrição"
                  placeholder="Ex: Molho, mussarela, calabresa..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
                <Input
                  label="Preço"
                  type="number"
                  step="0.01"
                  placeholder="29.90"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                />

                {/* Image URL */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    <ImageIcon className="mr-1 inline h-3 w-3" />
                    URL da Imagem
                  </label>
                  <Input
                    placeholder="https://exemplo.com/foto.jpg"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  />
                  {productForm.image && (
                    <img
                      src={productForm.image}
                      alt="Preview"
                      className="mt-2 h-20 w-20 rounded-lg object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                </div>

                {/* Badge */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">Destaque</label>
                  <div className="flex flex-wrap gap-2">
                    {BADGE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setProductForm({ ...productForm, badge: opt.value })}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                          productForm.badge === opt.value
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        {opt.icon && <opt.icon className="mr-1 inline h-3 w-3" />}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Item Link (direct sale) */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Vincular ao Estoque (venda direta)
                  </label>
                  <select
                    value={productForm.stockItemId}
                    onChange={(e) => setProductForm({ ...productForm, stockItemId: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:border-green-500 focus:outline-none"
                  >
                    <option value="">Nenhum (sem controle de estoque)</option>
                    {stockItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.quantity} {item.unit} disponível)
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-zinc-400">
                    Selecione um item do estoque para debitar automaticamente ao vender
                  </p>
                </div>

                {/* BOM Links */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Vincular Insumos (receita)
                  </label>
                  {stockItems.length === 0 ? (
                    <p className="text-xs text-zinc-400">Cadastre insumos no estoque primeiro</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {stockItems.map((item) => {
                        const link = productLinks.find((l) => l.stockItemId === item.id)
                        return (
                          <div key={item.id} className="flex items-center gap-2">
                            <label className="flex items-center gap-2 flex-1 text-sm text-zinc-700">
                              <input
                                type="checkbox"
                                checked={!!link}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setProductLinks([...productLinks, { stockItemId: item.id, quantity: "1" }])
                                  } else {
                                    setProductLinks(productLinks.filter((l) => l.stockItemId !== item.id))
                                  }
                                }}
                                className="rounded"
                              />
                              {item.name}
                            </label>
                            {link && (
                              <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={link.quantity}
                                onChange={(e) =>
                                  setProductLinks(
                                    productLinks.map((l) =>
                                      l.stockItemId === item.id ? { ...l, quantity: e.target.value } : l
                                    )
                                  )
                                }
                                className="w-20"
                                placeholder="Qtd"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setShowProductForm(false); setEditingProduct(null) }}
                  >
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={saveProduct}>
                    {editingProduct ? "Salvar" : "Adicionar"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
