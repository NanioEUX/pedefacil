import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Removendo pedidos de teste do Geladolate Sorveteria...")

  // Buscar o estabelecimento
  const establishment = await prisma.establishment.findFirst({
    where: { slug: "geladolate-sorveteria" },
  })

  if (!establishment) {
    console.log("Estabelecimento não encontrado.")
    return
  }

  // Deletar pedidos de teste
  const deletedOrders = await prisma.order.deleteMany({
    where: {
      establishmentId: establishment.id,
      trackingToken: {
        in: ["test-order-001", "test-order-002"],
      },
    },
  })

  console.log(`  ${deletedOrders.count} pedidos de teste removidos.`)

  // Deletar clientes de teste também (Maria Silva e João Pereira)
  const deletedCustomers = await prisma.customer.deleteMany({
    where: {
      establishmentId: establishment.id,
      phone: {
        in: ["11911111111", "11922222222"],
      },
    },
  })

  console.log(`  ${deletedCustomers.count} clientes de teste removidos.`)

  console.log("\nConcluído!")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(() => prisma.$disconnect())