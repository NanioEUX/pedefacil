"use client"

import Link from "next/link"
import { Smartphone, BarChart3, CreditCard, ShoppingBag, QrCode, Store, Check, ChevronDown, Zap, Shield, TrendingDown, ArrowRight, Star, Sparkles, Globe, Users, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

const features = [
  {
    icon: Store,
    title: "Cardápio Digital",
    desc: "Fotos, categorias e preços. Seu cliente vê tudo bonito e pede em segundos.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: ShoppingBag,
    title: "Pedidos Automáticos",
    desc: "Cliente monta, paga e o pedido vai direto para seu painel. Zero intervenção.",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    icon: CreditCard,
    title: "Pagamento Integrado",
    desc: "Pix, cartão ou boleto. Link de pagamento automático via Asaas.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Smartphone,
    title: "PWA (parece um App)",
    desc: "Instalável na tela inicial. Sem Play Store, sem custo de desenvolvimento.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Dashboard Inteligente",
    desc: "Vendas, pedidos, estoque, financeiro. Tudo em tempo real.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: QrCode,
    title: "QR Code na Mesa",
    desc: "Cliente escaneia e abre o cardápio. Perfeito para restaurantes e bares.",
    gradient: "from-amber-500 to-orange-500",
  },
]

const plans = [
  {
    name: "Grátis",
    price: "0",
    period: "/mês",
    desc: "Para testar e começar a vender",
    features: ["Até 50 pedidos/mês", "Cardápio digital", "1 usuário"],
    cta: "Começar grátis",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "49",
    period: "/mês",
    desc: "Para crescer sem limites",
    features: ["Até 200 pedidos/mês", "Tudo do Grátis", "Dashboard completo", "Relatórios", "3 usuários"],
    cta: "Assinar Starter",
    highlighted: true,
    badge: "Mais popular",
  },
  {
    name: "Pro",
    price: "99",
    period: "/mês",
    desc: "Para quem quer escalar",
    features: ["Pedidos ilimitados", "Tudo do Starter", "Controle de estoque", "Financeiro completo", "Cupons e promoções", "Entregadores", "10 usuários"],
    cta: "Assinar Pro",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "199",
    period: "/mês",
    desc: "Para redes e franquias",
    features: ["Multi-unidade", "Tudo do Pro", "Multi-tenant", "Suporte prioritário", "Usuários ilimitados", "API personalizada"],
    cta: "Falar com vendas",
    highlighted: false,
  },
]

const faq = [
  {
    q: "Preciso saber programar para usar?",
    a: "Não! O PedeFácil é completamente visual. Você cadastra seus produtos, configura as opções e o sistema funciona automaticamente.",
  },
  {
    q: "Como o cliente faz o pedido?",
    a: "O cliente acessa seu cardápio pelo link ou QR Code, monta o pedido e finaliza. Tudo muito rápido e simples.",
  },
  {
    q: "Preciso pagar por transação?",
    a: "Não cobramos nada por transação. Você paga apenas a taxa do gateway de pagamento (Asaas), igual a qualquer maquininha.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento sem multa.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim! O PedeFácil é um PWA, funciona como um app no celular sem precisar baixar nada da Play Store.",
  },
  {
    q: "Tem app para o motoboy?",
    a: "Sim! O motoboy recebe um link e visualiza os pedidos prontos para entrega, com mapa e status em tempo real.",
  },
]

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Pizzaria do Carlos",
    text: "Saí do marketplace e economizo R$ 800/mês. O PedeFácil é muito mais simples e meus clientes adoram.",
    rating: 5,
  },
  {
    name: "Maria Santos",
    role: "Lanchonete da Mari",
    text: "Em 1 semana já estava com meu cardápio online. O suporte é incrível, respondem em minutos.",
    rating: 5,
  },
  {
    name: "João Costa",
    role: "Hamburgueria JB",
    text: "O dashboard é incrível. Consigo ver tudo em tempo real: pedidos, estoque, financeiro. Perfeito!",
    rating: 5,
  },
]

const stats = [
  { value: "2.500+", label: "Estabelecimentos" },
  { value: "150K+", label: "Pedidos processados" },
  { value: "R$ 0", label: "Comissão por pedido" },
  { value: "99.9%", label: "Uptime" },
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    function handleScroll() { setScrollY(window.scrollY) }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated background orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#FF6B35]/10 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-blue-600/8 blur-[100px] animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      {/* Header */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrollY > 50 ? "border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl" : "bg-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src="/icons/pedefacil-logo.svg" alt="PedeFácil" className="h-10" />
            <span className="text-lg font-bold text-white hidden sm:block">PedeFácil</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm" className="bg-[#FF6B35] hover:bg-[#E55A2B] shadow-lg shadow-[#FF6B35]/25">
                Criar Cardápio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Big Logo */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-[#FF6B35]/20 blur-3xl" />
                <img src="/icons/pedefacil-logo.svg" alt="PedeFácil" className="relative h-20 drop-shadow-2xl" />
              </div>
            </div>

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-[#FF6B35]" />
              Seu cardápio, seu controle. Sem comissão.
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
              <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Seu cardápio online.
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F6B] bg-clip-text text-transparent">
                Mensalidade fixa, sem surpresas.
              </span>
            </h1>

            {/* Sub */}
            <p className="mt-6 text-lg text-white/50 max-w-2xl mx-auto">
              Plataforma completa de pedidos e gerenciamento para seu estabelecimento.
              Cliente acessa seu cardápio, escolhe, paga e o pedido vai direto para seu painel.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/cadastro">
                <Button size="lg" className="bg-[#FF6B35] hover:bg-[#E55A2B] px-8 text-base shadow-xl shadow-[#FF6B35]/30 group">
                  Criar meu cardápio grátis
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#planos">
                <Button size="lg" variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 px-8 text-base">
                  Ver planos
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF8F6B] bg-clip-text text-transparent">{s.value}</p>
                  <p className="mt-1 text-xs text-white/40">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Showcase */}
      <section className="relative z-10 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm sm:p-12">
            <div className="grid items-center gap-8 sm:grid-cols-2">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <img src="/icons/pedefacil-logo.svg" alt="PedeFácil" className="h-12" />
                  <span className="text-2xl font-bold text-white">PedeFácil</span>
                </div>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                    Não é só cardápio.
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F6B] bg-clip-text text-transparent">
                    É o sistema completo.
                  </span>
                </h2>
                <p className="mt-4 text-white/50">
                  Do cardápio digital ao controle total do seu negócio. Pedidos, caixa, estoque, financeiro, entregadores, relatórios — tudo em um só lugar. Uma mensalidade fixa, zero comissão.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Globe, label: "Cardápio Online" },
                  { icon: ShoppingBag, label: "Pedidos Automáticos" },
                  { icon: CreditCard, label: "Pagamento Integrado" },
                  { icon: BarChart3, label: "Dashboard" },
                  { icon: Users, label: "Gestão de Equipe" },
                  { icon: Clock, label: "Controle de Caixa" },
                  { icon: TrendingUp, label: "Relatórios" },
                  { icon: Smartphone, label: "PWA (App)" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
                    <item.icon className="h-4 w-4 text-[#FF6B35]" />
                    <span className="text-xs font-medium text-white/70">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Tudo que você precisa.
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F6B] bg-clip-text text-transparent">
                Sem taxas escondidas.
              </span>
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-[#FF6B35]/5"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-lg`}>
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-white/50">{f.desc}</p>
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FF6B35]/0 to-[#FF6B35]/0 transition-all duration-300 group-hover:from-[#FF6B35]/5 group-hover:to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots / How it works */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Veja como funciona
              </span>
            </h2>
            <p className="mt-4 text-white/40">Um sistema completo no seu bolso</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Dashboard", desc: "Vendas, pedidos e relatórios em tempo real", gradient: "from-green-500/20 to-emerald-500/20", border: "border-green-500/20" },
              { title: "Cardápio", desc: "Categorias, produtos com fotos e preços", gradient: "from-[#FF6B35]/20 to-orange-500/20", border: "border-[#FF6B35]/20" },
              { title: "Pedidos", desc: "Acompanhe pedidos em tempo real com status", gradient: "from-blue-500/20 to-purple-500/20", border: "border-blue-500/20" },
              { title: "Entregas", desc: "Painel do motoboy com mapa e status", gradient: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/20" },
              { title: "Caixa", desc: "Vendas presenciais simplificadas", gradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/20" },
              { title: "Estoque", desc: "Controle de insumos e baixa automática", gradient: "from-amber-500/20 to-yellow-500/20", border: "border-amber-500/20" },
            ].map((item) => (
              <div key={item.title} className={`group relative rounded-2xl border ${item.border} bg-gradient-to-br ${item.gradient} p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}>
                {/* Mock UI */}
                <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-[#FF6B35]" />
                    <div className="h-2 w-16 rounded bg-white/10" />
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-6 rounded bg-white/5" />
                    ))}
                  </div>
                </div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Marketplace</span>
              {" vs "}
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F6B] bg-clip-text text-transparent">PedeFácil</span>
            </h2>
            <p className="mt-4 text-white/40">Compare e veja quanto você economiza por mês</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Marketplace */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-red-400">Marketplace Tradicional</h3>
                  <p className="text-xs text-white/30">iFood, Rappi, etc.</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Comissão por pedido</span>
                  <span className="font-bold text-red-400">12% a 27%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Processamento pagamento</span>
                  <span className="font-bold text-red-400">3.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Mensalidade</span>
                  <span className="font-bold text-red-400">R$ 150+</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Total em 100 pedidos (R$50)</span>
                    <span className="font-bold text-red-400">R$ 1.325/mês</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PedeFácil */}
            <div className="relative rounded-2xl border-2 border-[#FF6B35]/50 bg-[#FF6B35]/5 p-6 backdrop-blur-sm shadow-2xl shadow-[#FF6B35]/10">
              <div className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF8F6B] px-3 py-1 text-xs font-bold text-white shadow-lg">
                Economia de R$ 15.000/ano
              </div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B35]/20">
                  <Check className="h-5 w-5 text-[#FF6B35]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#FF6B35]">PedeFácil</h3>
                  <p className="text-xs text-white/30">Seu cardápio, seu controle</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Comissão por pedido</span>
                  <span className="font-bold text-green-400">0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Processamento pagamento</span>
                  <span className="font-bold text-green-400">Taxa do Asaas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Mensalidade</span>
                  <span className="font-bold text-green-400">R$ 0 a R$ 199</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Total em 100 pedidos (R$50)</span>
                    <span className="font-bold text-green-400">R$ 49/mês</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 py-24" id="planos">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Mensalidade fixa.
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F6B] bg-clip-text text-transparent">
                Sem surpresas.
              </span>
            </h2>
            <p className="mt-4 text-white/40">Escolha o plano ideal. Cancele quando quiser.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                  plan.highlighted
                    ? "border-[#FF6B35]/50 bg-[#FF6B35]/10 shadow-2xl shadow-[#FF6B35]/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-4 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF8F6B] px-3 py-1 text-xs font-bold text-white shadow-lg">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">R$ {plan.price}</span>
                  <span className="text-sm text-white/40">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-white/40">{plan.desc}</p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                      <Check className="h-4 w-4 text-[#FF6B35]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/cadastro" className="mt-6 block">
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-[#FF6B35] hover:bg-[#E55A2B] shadow-lg shadow-[#FF6B35]/25"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Quem usa, recomenda
              </span>
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10">
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-white/60">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4">
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/30">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Perguntas frequentes
              </span>
            </h2>
          </div>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/20"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-white">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-white/40 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-5 pb-5 text-sm text-white/50">
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative rounded-3xl border border-[#FF6B35]/30 bg-gradient-to-br from-[#FF6B35]/10 to-purple-600/10 p-12 text-center backdrop-blur-sm shadow-2xl shadow-[#FF6B35]/10">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#FF6B35]/5 to-transparent" />
            <div className="relative">
              <h2 className="text-4xl font-bold sm:text-5xl">
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Comece a vender online
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F6B] bg-clip-text text-transparent">
                  hoje mesmo.
                </span>
              </h2>
              <p className="mt-4 text-lg text-white/50">
                Crie seu cardápio em 2 minutos. Sem cartão. Sem mensalidade no plano grátis.
              </p>
              <div className="mt-8">
                <Link href="/cadastro">
                  <Button size="lg" className="bg-[#FF6B35] hover:bg-[#E55A2B] px-10 text-base shadow-xl shadow-[#FF6B35]/30 group">
                    Criar meu cardápio grátis
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-white/30">
          <div className="mb-4">
            <img src="/icons/pedefacil-logo.svg" alt="PedeFácil" className="mx-auto h-10 opacity-50" />
          </div>
          <p>PedeFácil © 2024 — Seu cardápio, seu controle</p>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <Link href="/cadastro" className="hover:text-[#FF6B35] transition-colors">Criar conta</Link>
            <Link href="/dashboard" className="hover:text-[#FF6B35] transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
