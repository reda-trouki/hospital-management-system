import type { Invoice } from "./types"
import { today } from "./utils"

const r2 = (n: number) => Math.round(n * 100) / 100

export function calc(inv: Invoice) {
  const subtotal = r2(inv.items.reduce((s, i) => s + i.qty * i.price, 0))
  const discount = r2((subtotal * inv.discount) / 100)
  const tax = r2(((subtotal - discount) * inv.tax) / 100)
  const total = r2(subtotal - discount + tax)
  const insurance = r2((total * inv.insurance) / 100)
  const patientDue = r2(total - insurance)
  const paid = r2(inv.payments.reduce((s, p) => s + p.amount, 0))
  const balance = r2(Math.max(0, patientDue - paid))
  const status: "Paid" | "Partial" | "Overdue" | "Pending" =
    balance <= 0 ? "Paid" : inv.dueDate < today() ? "Overdue" : paid > 0 ? "Partial" : "Pending"
  return { subtotal, discount, tax, total, insurance, patientDue, paid, balance, status }
}
