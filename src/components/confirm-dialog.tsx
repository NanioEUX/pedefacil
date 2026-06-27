"use client"

import { useEffect, useCallback } from "react"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning"
  confirmed?: boolean
  successTitle?: string
  successMessage?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  confirmed = false,
  successTitle,
  successMessage,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !confirmed) onCancel()
    },
    [onCancel, confirmed]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, handleKeyDown])

  if (!open) return null

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50">
        <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">{successTitle || title}</h3>
          </div>
          {successMessage && <p className="mb-2 text-sm text-zinc-600">{successMessage}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              variant === "danger" ? "bg-red-100" : "bg-amber-100"
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${
                variant === "danger" ? "text-red-600" : "text-amber-600"
              }`}
            />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        </div>
        <p className="mb-6 text-sm text-zinc-600">{message}</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            className="flex-1"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
