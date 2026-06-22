import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const authUser = await verifyAuth(req)
    if (!authUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const mime = file.type || "image/jpeg"
    const dataUrl = `data:${mime};base64,${base64}`

    // Save to a temporary product-image record and return the ID
    // For now, just return the data URL (same as before but via FormData)
    return NextResponse.json({ url: dataUrl })
  } catch (error) {
    console.error("[UPLOAD]", error)
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 })
  }
}
