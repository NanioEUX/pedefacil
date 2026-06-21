"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"

export default function DashboardLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao entrar")
      }

      const data = await res.json()

      localStorage.setItem("pedefacil_token", JSON.stringify({
        establishmentId: data.establishment.id,
        token: data.token,
      }))

      router.push(`/dashboard/pedidos?establishment=${data.establishment.id}&token=${data.token}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex items-center justify-center gap-2">
            <Store className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold">PedeFácil</span>
          </div>
          <h1 className="text-center text-xl font-bold text-zinc-900">Entrar</h1>
          <p className="text-center text-sm text-zinc-500">
            Acesse seu dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="E-mail"
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Senha"
              id="password"
              type="password"
              placeholder="Sua senha"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Entrar
            </Button>

            <p className="text-center text-sm text-zinc-500">
              Não tem conta?{" "}
              <Link href="/cadastro" className="text-green-600 underline">
                Criar cardápio grátis
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
