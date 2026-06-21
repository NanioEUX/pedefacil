"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store, Loader2, Eye, EyeOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao fazer login")
        return
      }

      localStorage.setItem("pedefacil-user", JSON.stringify({
        ...data.user,
        establishmentId: data.establishment.id,
        establishment: data.establishment,
        token: data.token,
      }))

      if (data.user.role === "motoboy" && data.user.deliveryPerson) {
        const { slug, token: dpToken } = data.user.deliveryPerson
        router.push(`/${slug}/entregas/${dpToken}`)
      } else if (data.user.permissions?.includes("caixa")) {
        const caixaOnlyPerms = ["caixa", "pedidos", "entregas", "clientes"]
        const hasOnlyCaixaPerms = data.user.permissions.every((p: string) => caixaOnlyPerms.includes(p))
        if (hasOnlyCaixaPerms && !data.user.permissions.includes("dashboard")) {
          router.push("/caixa")
        } else {
          router.push("/dashboard/home")
        }
      } else {
        router.push("/dashboard/home")
      }
    } catch {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8">
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
              <Store className="h-7 w-7 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900">PedeFácil</h1>
            <p className="text-sm text-zinc-500">Acesse seu painel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
