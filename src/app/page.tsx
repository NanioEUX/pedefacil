import Link from "next/link"
import { Store, Smartphone, BarChart3, CreditCard, ShoppingBag, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Store,
    title: "Cardápio Digital",
    desc: "Cardápio online com fotos, categorias e variações. Seu cliente vê tudo bonito.",
  },
  {
    icon: ShoppingBag,
    title: "Pedidos via WhatsApp",
    desc: "Cliente monta o pedido no site e finaliza pelo WhatsApp. Sem app pra baixar.",
  },
  {
    icon: CreditCard,
    title: "Pagamento Asaas",
    desc: "Link de pagamento por Pix, boleto ou cartão. Taxa zero de plataforma.",
  },
  {
    icon: Smartphone,
    title: "Funciona como App",
    desc: "PWA instalável na tela inicial. Parece um app de verdade, sem custo de loja.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Completo",
    desc: "Gerencie pedidos, produtos, relatórios e configurações em tempo real.",
  },
  {
    icon: QrCode,
    title: "QR Code na Mesa",
    desc: "Cliente escaneia o QR Code e já abre o cardápio. Perfeito para restaurantes.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold text-zinc-900">PedeFácil</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm">Criar Cardápio</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pt-20 pb-16 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
            ✦ Substitua o iFood por uma solução própria
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
            Seu cardápio online.
            <br />
            <span className="text-green-600">Sem taxa abusiva.</span>
          </h1>
          <p className="mt-6 text-lg text-zinc-600">
            Sua própria plataforma de pedidos. Cliente pede pelo site, paga por Pix/cartão
            e você gerencia tudo num painel completo. De graça até 50 pedidos/mês.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/cadastro">
              <Button size="lg">Criar meu cardápio grátis</Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg">Ver demonstração</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-100 bg-zinc-50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold text-zinc-900">
            Tudo que o iFood tem, sem o iFood
          </h2>
          <p className="mt-2 text-center text-zinc-600">
            Taxa fixa de R$ 29/mês ou grátis (até 50 pedidos). Sem comissão por pedido.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <f.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-zinc-900">Quanto você economiza?</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 p-6">
              <p className="text-4xl font-bold text-green-600">R$ 29</p>
              <p className="mt-2 text-sm text-zinc-600">Taxa fixa mensal</p>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-6">
              <p className="text-4xl font-bold text-green-600">0%</p>
              <p className="mt-2 text-sm text-zinc-600">Comissão por pedido</p>
            </div>
            <div className="rounded-xl border border-zinc-200 p-6">
              <p className="text-4xl font-bold text-green-600">~12%</p>
              <p className="mt-2 text-sm text-zinc-600">vs iFood por pedido</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            * Apenas taxa do Asaas (1.99% no Pix, 3.99% no cartão) - igual qualquer maquininha.
          </p>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-500">
          <p>PedeFácil © 2024 - Sua plataforma de pedidos online</p>
        </div>
      </footer>
    </div>
  )
}
