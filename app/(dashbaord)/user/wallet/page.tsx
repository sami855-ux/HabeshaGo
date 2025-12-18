import {
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  History,
  TrendingUp,
  Settings,
} from "lucide-react"
import BalanceCard from "@/components/user-dashboard/BalanceCard"
import QuickActions from "@/components/user-dashboard/QuickActions"
import RecentTransactions from "@/components/user-dashboard/RecentTransactions"
import WalletAnalytics from "@/components/user-dashboard/WalletAnalytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-background pb-12 rounded-2xl">
      <div className="container mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
            <p className="text-muted-foreground">
              Manage your finances with ease
            </p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Balance Card */}
        <BalanceCard />

        {/* Quick Actions */}
        <QuickActions />

        {/* Tabs for Transactions & Analytics */}
        <Tabs defaultValue="transactions" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="transactions"
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-4">
            <RecentTransactions />
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <WalletAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
