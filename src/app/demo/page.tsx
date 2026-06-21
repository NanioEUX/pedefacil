import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function DemoPage() {
  let establishment = await prisma.establishment.findUnique({
    where: { slug: "geladolate-sorveteria" },
  })

  if (!establishment) {
    redirect("/login")
  }

  redirect(`/${establishment.slug}`)
}
