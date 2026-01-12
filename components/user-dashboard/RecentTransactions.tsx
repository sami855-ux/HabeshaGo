import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function RecentTransactions({ transactions }: any) {
  if (!transactions.length) {
    return <p className="text-center">No transactions yet</p>;
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx: any) => (
        <Card key={tx.id}>
          <CardHeader className="flex justify-between">
            <span>{tx.type}</span>
            <span className={tx.amount > 0 ? "text-green-600" : "text-red-600"}>
              {tx.amount} ETB
            </span>
          </CardHeader>
          <CardContent className="text-sm">
            {new Date(tx.createdAt).toLocaleString()}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
