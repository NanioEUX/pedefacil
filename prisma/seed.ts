import { PrismaClient } from "@prisma/client"
import crypto from "crypto"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

async function main() {
  console.log("Iniciando seed...")

  // Verificar se já existem dados
  const existingUsers = await prisma.user.count()
  if (existingUsers > 0) {
    console.log("Dados já existem. Seed pulado.")
    return
  }

  const demo = await prisma.establishment.create({
    data: {
      name: "Geladolate Sorveteria",
      slug: "geladolate-sorveteria",
      email: "demo@pizzaria.com",
      password: hashPassword("123456"),
      phone: "11999999999",
      category: "sorveteria",
      description: "Os melhores sorvetes artesanais da cidade!",
      address: "Rua Augusta, 1500 - Consolação, São Paulo - SP",
      logo: "/geladolate-logo.png",
      paymentConfig: JSON.stringify({ online: true, delivery: true, pickup: true }),
      orderConfig: JSON.stringify({ delivery: true, pickup: true }),
      deliveryFeeType: "free_above",
      deliveryFeeAmount: 5,
      deliveryFreeAbove: 50,
    },
  })
  console.log(`  ${demo.name} (email: demo@pizzaria.com / senha: 123456)`)

  const burger = await prisma.establishment.create({
    data: {
      name: "Hamburgueria Teste",
      slug: "hamburgueria-teste",
      email: "teste@hamburgueria.com",
      password: hashPassword("123456"),
      phone: "11988888888",
      category: "hamburgueria",
      description: "Hambúrgueres artesanais",
      address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    },
  })
  console.log(`  ${burger.name} (email: teste@hamburgueria.com / senha: 123456)`)

  const adminPassword = await bcrypt.hash("123456", 10)
  const atendentePassword = await bcrypt.hash("123456", 10)

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "demo@pizzaria.com",
      password: adminPassword,
      role: "admin",
      permissions: JSON.stringify(["dashboard", "caixa", "pedidos", "clientes", "cardapio", "estoque", "entregas", "relatorios", "config", "usuarios"]),
      establishmentId: demo.id,
    },
  })
  console.log("  Usuário Admin: demo@pizzaria.com / 123456")

  await prisma.user.create({
    data: {
      name: "Atendente",
      email: "atendente@pizzaria.com",
      password: atendentePassword,
      role: "atendente",
      permissions: JSON.stringify(["caixa", "pedidos", "entregas"]),
      establishmentId: demo.id,
    },
  })
  console.log("  Usuário Atendente: atendente@pizzaria.com / 123456")

  const maria = await prisma.customer.create({
    data: {
      name: "Maria Silva",
      phone: "11911111111",
      establishmentId: demo.id,
      totalOrders: 1,
      totalSpent: 70.7,
    },
  })

  const joao = await prisma.customer.create({
    data: {
      name: "João Pereira",
      phone: "11922222222",
      establishmentId: demo.id,
      totalOrders: 1,
      totalSpent: 64.8,
    },
  })

  const catSorvetes = await prisma.category.create({ data: { name: "Sorvetes", order: 0, establishmentId: demo.id } })
  const catAcais = await prisma.category.create({ data: { name: "Açaís & Bowls", order: 1, establishmentId: demo.id } })
  const catMilkshakes = await prisma.category.create({ data: { name: "Milkshakes", order: 2, establishmentId: demo.id } })
  const catBebidas = await prisma.category.create({ data: { name: "Bebidas", order: 3, establishmentId: demo.id } })

  await prisma.product.createMany({
    data: [
      { name: "Casquinha Dupla", description: "Duas bolas de sorvete artesanal na casquinha", price: 12.9, categoryId: catSorvetes.id, establishmentId: demo.id, image: "https://images.unsplash.com/photo-1570197788417-0e82375c9571?w=400&h=400&fit=crop" },
      { name: "Sorvete Pote 500g", description: "500g de sorvete artesanal para levar", price: 29.9, categoryId: catSorvetes.id, establishmentId: demo.id, image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=400&fit=crop" },
      { name: "Sorvete Pote 1kg", description: "1kg de sorvete artesanal para levar", price: 49.9, categoryId: catSorvetes.id, establishmentId: demo.id, image: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&h=400&fit=crop" },
      { name: "Picolé Artesanal", description: "Picolé feito com frutas naturais", price: 7.9, categoryId: catSorvetes.id, establishmentId: demo.id, image: "https://images.unsplash.com/photo-1576506542790-51c4285a5bf2?w=400&h=400&fit=crop" },
      { name: "Sundae", description: "Sorvete com calda, chantilly e granulado", price: 18.9, categoryId: catSorvetes.id, establishmentId: demo.id, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop" },
      { name: "Açaí Tradicional 500ml", description: "Açaí batido com banana e guaraná, com granola e banana", price: 22.9, categoryId: catAcais.id, establishmentId: demo.id, image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop" },
      { name: "Açaí Premium 500ml", description: "Açaí cremoso com morango, kiwi, granola e leite condensado", price: 29.9, categoryId: catAcais.id, establishmentId: demo.id, image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop" },
      { name: "Bowls de Frutas", description: "Mix de frutas da estação com granola e mel", price: 24.9, categoryId: catAcais.id, establishmentId: demo.id, image: "https://images.unsplash.com/photo-1511690743698-d9d18f7e20f1?w=400&h=400&fit=crop" },
      { name: "Milkshake Clássico", description: "Milkshake cremoso de chocolate, morango ou baunilha", price: 16.9, categoryId: catMilkshakes.id, establishmentId: demo.id, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop" },
      { name: "Milkshake Especial", description: "Milkshake com Nutella, Oreo ou creme belga", price: 21.9, categoryId: catMilkshakes.id, establishmentId: demo.id, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop" },
      { name: "Coca-Cola Lata", description: "Coca-Cola 350ml gelada", price: 6.9, categoryId: catBebidas.id, establishmentId: demo.id, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop" },
      { name: "Suco Natural 500ml", description: "Suco de laranja natural", price: 8.9, categoryId: catBebidas.id, establishmentId: demo.id, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop" },
      { name: "Água Mineral 500ml", description: "Água mineral sem gás", price: 4.5, categoryId: catBebidas.id, establishmentId: demo.id, image: "https://images.unsplash.com/photo-1548839140-29a74984ff79?w=400&h=400&fit=crop" },
    ],
  })

  const catHamburgers = await prisma.category.create({ data: { name: "Hambúrgueres", order: 0, establishmentId: burger.id } })
  const catPorcoes = await prisma.category.create({ data: { name: "Porções", order: 1, establishmentId: burger.id } })
  const catBebidas2 = await prisma.category.create({ data: { name: "Bebidas", order: 2, establishmentId: burger.id } })

  await prisma.product.createMany({
    data: [
      { name: "Classic Burger", description: "Pão brioche, hambúrguer 150g, queijo cheddar, alface, tomate", price: 29.9, categoryId: catHamburgers.id, establishmentId: burger.id },
      { name: "Cheese Bacon", description: "Pão australiano, hambúrguer 180g, cheddar, bacon crocante, barbecue", price: 36.9, categoryId: catHamburgers.id, establishmentId: burger.id },
      { name: "Smash Duplo", description: "Dois hambúrgueres 100g, queijo prato, picles, molho especial", price: 39.9, categoryId: catHamburgers.id, establishmentId: burger.id },
      { name: "Batata Frita", description: "Batata frita crocante com cheddar e bacon", price: 19.9, categoryId: catPorcoes.id, establishmentId: burger.id },
      { name: "Anéis de Cebola", description: "Anéis de cebola empanados com molho ranch", price: 16.9, categoryId: catPorcoes.id, establishmentId: burger.id },
      { name: "Coca-Cola Lata", description: "Coca-Cola 350ml", price: 6.9, categoryId: catBebidas2.id, establishmentId: burger.id },
    ],
  })

  await prisma.order.create({
    data: {
      establishmentId: demo.id,
      customerId: maria.id,
      customerName: "Maria Silva",
      customerPhone: "11911111111",
      customerAddress: "Rua Teste, 123 - Apto 45",
      orderType: "delivery",
      paymentMethod: "online",
      items: JSON.stringify([
        { id: "1", name: "Açaí Premium 500ml", price: 29.9, quantity: 1 },
        { id: "2", name: "Milkshake Clássico", price: 16.9, quantity: 2 },
      ]),
      total: 70.7,
      deliveryFee: 5,
      status: "preparing",
      method: "site",
      deliveryPerson: "Carlos (motoboy)",
      trackingToken: "test-order-001",
    },
  })

  await prisma.order.create({
    data: {
      establishmentId: demo.id,
      customerId: joao.id,
      customerName: "João Pereira",
      customerPhone: "11922222222",
      customerAddress: "Av. Principal, 500",
      orderType: "delivery",
      paymentMethod: "delivery",
      items: JSON.stringify([
        { id: "3", name: "Casquinha Dupla", price: 12.9, quantity: 1 },
        { id: "4", name: "Sundae", price: 18.9, quantity: 2 },
      ]),
      total: 64.8,
      status: "pending",
      method: "whatsapp",
      trackingToken: "test-order-002",
    },
  })

  console.log("  Pedidos: (preparando, pendente)")
  console.log("\nSeed concluído!")
  console.log("\nAcessos:")
  console.log("   /geladolate-sorveteria       -> Cardápio")
  console.log("   /dashboard                   -> Login")
  console.log("   Email: demo@pizzaria.com")
  console.log("   Senha: 123456")
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
