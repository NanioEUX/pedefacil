export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string | null
}

export interface OrderFormData {
  customerName: string
  customerPhone: string
  customerAddress: string
  notes?: string
}
