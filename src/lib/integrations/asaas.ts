const ASAAS_API_URL =
  process.env.ASAAS_ENVIRONMENT === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3"

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
  value,
  description,
  dueDate,
  splitRules,
}: {
  apiKey: string
  customerName: string
  customerPhone: string
  value: number
  description: string
  dueDate?: string
  splitRules?: SplitRule[]
}): Promise<AsaasPaymentResponse> {
  const due = dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const customerRes = await fetch(`${ASAAS_API_URL}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", access_token: apiKey },
    body: JSON.stringify({
      name: customerName,
      mobilePhone: customerPhone.replace(/\D/g, ""),
      cpfCnpj: "00000000000",
    }),
  })

  const customer = await customerRes.json()

  const paymentBody: any = {
    customer: customer.id,
    billingType: "UNDEFINED",
    value,
    dueDate: due,
    description: description.substring(0, 200),
    externalReference: description,
  }

  if (splitRules && splitRules.length > 0) {
    paymentBody.split = splitRules.map((r) => ({
      walletId: r.walletId,
      percentual: r.percentual,
      description: r.description || "Divisão de pagamento",
    }))
  }

  const paymentRes = await fetch(`${ASAAS_API_URL}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", access_token: apiKey },
    body: JSON.stringify(paymentBody),
  })

  const payment = await paymentRes.json()

  return {
    id: payment.id,
    invoiceUrl: payment.invoiceUrl,
    bankSlipUrl: payment.bankSlipUrl,
    status: payment.status,
  }
}
