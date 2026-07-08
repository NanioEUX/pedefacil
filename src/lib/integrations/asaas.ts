const ASAAS_API_URL =
  process.env.ASAAS_ENVIRONMENT === "sandbox"
    ? "https://sandbox.asaas.com/api/v3"
    : "https://api.asaas.com/v3"

interface SplitRule {
  walletId: string
  percentual: number
  description?: string
}

interface AsaasPaymentResponse {
  id: string
  invoiceUrl: string
  bankSlipUrl?: string
  status: string
}

export async function createPaymentLink({
  apiKey,
  customerName,
  customerPhone,
  customerCpf,
  value,
  description,
  dueDate,
  splitRules,
}: {
  apiKey: string
  customerName: string
  customerPhone: string
  customerCpf: string
  value: number
  description: string
  dueDate?: string
  splitRules?: SplitRule[]
}): Promise<AsaasPaymentResponse> {
  const due = dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const customerBody: any = {
    name: customerName,
    mobilePhone: customerPhone.replace(/\D/g, ""),
  }
  if (customerCpf) {
    customerBody.cpfCnpj = customerCpf.replace(/\D/g, "")
  }

  console.log("[Asaas] URL:", ASAAS_API_URL)
  console.log("[Asaas] Criando cliente:", { name: customerBody.name, phone: customerBody.mobilePhone, cpfCnpj: customerBody.cpfCnpj || "NENHUM" })

  const customerRes = await fetch(`${ASAAS_API_URL}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", access_token: apiKey },
    body: JSON.stringify(customerBody),
  })

  const customer = await customerRes.json()
  console.log("[Asaas] Resposta cliente:", JSON.stringify({ ok: customerRes.ok, id: customer.id, errors: customer.errors }))

  if (!customerRes.ok || !customer.id) {
    console.error("[Asaas] FALHA cliente:", JSON.stringify(customer))
    throw new Error(`Falha ao criar cliente: ${customer.errors?.[0]?.description || customer.detail || JSON.stringify(customer)}`)
  }

  const paymentBody: any = {
    customer: customer.id,
    billingType: "PIX",
    value,
    dueDate: due,
    description: description.substring(0, 200),
    externalReference: description,
  }

  if (customerCpf) {
    paymentBody.cpfCnpj = customerCpf.replace(/\D/g, "")
  }

  console.log("[Asaas] Criando pagamento:", { customerId: customer.id, value, billingType: "PIX" })

  const paymentRes = await fetch(`${ASAAS_API_URL}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", access_token: apiKey },
    body: JSON.stringify(paymentBody),
  })

  const payment = await paymentRes.json()
  console.log("[Asaas] Resposta pagamento:", JSON.stringify({ ok: paymentRes.ok, id: payment.id, status: payment.status, errors: payment.errors }))

  if (!paymentRes.ok || !payment.id) {
    console.error("[Asaas] FALHA pagamento:", JSON.stringify(payment))
    throw new Error(`Falha ao criar cobrança: ${payment.errors?.[0]?.description || payment.detail || JSON.stringify(payment)}`)
  }

  return {
    id: payment.id,
    invoiceUrl: payment.invoiceUrl,
    bankSlipUrl: payment.bankSlipUrl,
    status: payment.status,
  }
}
