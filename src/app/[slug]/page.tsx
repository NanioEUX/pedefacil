import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { MenuPage } from "./menu-page"

export default async function EstablishmentPage({
  params,
}: {
  params: { slug: string }
}) {
  const establishment = await prisma.establishment.findUnique({
    where: { slug: params.slug },
    include: {
      categories: {
        include: { products: { where: { isAvailable: true }, orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!establishment) {
    notFound()
  }

  const { password, paymentConfig: pc, orderConfig: oc, ...rest } = establishment
  const paymentConfig = JSON.parse(pc || '{"online":true,"delivery":true,"pickup":true}')
  const orderConfig = JSON.parse(oc || '{"delivery":true,"pickup":true}')

  return <MenuPage establishment={rest} paymentConfig={paymentConfig} orderConfig={orderConfig} />
}
