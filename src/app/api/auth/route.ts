import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit"

const JWT_SECRET = process.env.JWT_SECRET!

function isSha256Hash(password: string): boolean {
  return /^[a-f0-9]{64}$/.test(password)
}

function sha256(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatórios" }, { status: 400 })
    }

    // Rate limit: 5 attempts per minute per IP
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const { allowed, remaining } = checkRateLimit(`login:${ip}`, 5, 60_000)
    if (!allowed) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 minuto." }, { status: 429 })
    }

    const establishment = await prisma.establishment.findUnique({ where: { email } })

    if (!establishment) {
      return NextResponse.json({ error: "E-mail não cadastrado" }, { status: 401 })
    }

    let passwordValid = await bcrypt.compare(password, establishment.password)

    // Migration: if bcrypt fails, try SHA256 and re-hash with bcrypt
    if (!passwordValid && isSha256Hash(establishment.password)) {
      if (establishment.password === sha256(password)) {
        passwordValid = true
        const newHash = await bcrypt.hash(password, 12)
        await prisma.establishment.update({
          where: { id: establishment.id },
          data: { password: newHash },
        })
      }
    }

    if (!passwordValid) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    }

    // Success: reset rate limit
    resetRateLimit(`login:${ip}`)

    const token = jwt.sign(
      { userId: establishment.id, email: establishment.email, role: "admin", permissions: ["admin"], establishmentId: establishment.id },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    const { password: _, ...safeData } = establishment

    return NextResponse.json({ establishment: safeData, token })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
