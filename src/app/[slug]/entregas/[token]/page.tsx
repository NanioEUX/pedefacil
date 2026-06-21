import { DeliveryPage } from "./delivery-page"

export default function Page({ params }: { params: { token: string } }) {
  return <DeliveryPage token={params.token} />
}
