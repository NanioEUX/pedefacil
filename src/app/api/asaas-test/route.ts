import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")
  if (!key) {
    return NextResponse.json({ ok: false, error: "API Key não fornecida" }, { status: 400 })
  }

  const envVar = process.env.ASAAS_ENVIRONMENT
  const urls = envVar === "production"
    ? ["https://api.asaas.com/v3"]
    : envVar === "sandbox"
      ? ["https://sandbox.asaas.com/api/v3"]
      : ["https://api.asaas.com/v3", "https://sandbox.asaas.com/api/v3"]

  for (const baseUrl of urls) {
    try {
      const res = await fetch(`${baseUrl}/customers?limit=1`, {
        headers: { access_token: key },
      })

      if (res.ok) {
        const envName = baseUrl.includes("sandbox") ? "sandbox" : "produção"
        return NextResponse.json({ ok: true, message: `Conexão OK (${envName})` })
      }

      if (res.status === 401) {
        continue
      }

      continue
    } catch {
      continue
    }
  }

  return NextResponse.json({ ok: false, error: "API Key inválida em ambos os ambientes (sandbox e produção)" })
}
