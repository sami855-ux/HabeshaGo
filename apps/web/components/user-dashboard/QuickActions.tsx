import {
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  Smartphone,
  Banknote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function QuickActions() {
  const actions = [
    {
      label: "Send Money",
      icon: ArrowUpRight,
      href: "/wallet/send",
    },
    {
      label: "Receive",
      icon: ArrowDownLeft,
      href: "/wallet/receive",
    },
    {
      label: "Top Up",
      icon: PlusCircle,
      href: "/wallet/topup",
    },
    {
      label: "Mobile",
      icon: Smartphone,
      href: "/wallet/airtime",
    },
    {
      label: "Bills",
      icon: Banknote,
      href: "/wallet/bills",
    },
  ]

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-8">
      {actions.map((action) => (
        <Link key={action.label} href={action.href}>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4 px-2 rounded-2xl hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <action.icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        </Link>
      ))}
    </div>
  )
}
