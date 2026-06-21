import { Suspense } from "react"
import DashboardLogin from "./login"

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    }>
      <DashboardLogin />
    </Suspense>
  )
}
