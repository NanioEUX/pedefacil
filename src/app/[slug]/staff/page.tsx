import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { StaffPage } from "./staff-page"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const establishment = await prisma.establishment.findFirst({
    where: { slug },
    select: { id: true, name: true, slug: true },
  })
  if (!establishment) return notFound()
  return <StaffPage establishment={establishment} />
}
