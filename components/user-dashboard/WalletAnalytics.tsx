"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function WalletAnalytics({ analytics }) {
  if (!analytics)
    return (
      <p className="text-muted-foreground text-center">
        No analytics available.
      </p>
    );

  const data = {
    labels: analytics.trends.map((t) => t.month),
    datasets: [
      {
        label: "Income",
        data: analytics.trends.map((t) => t.income),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
      },
      {
        label: "Expenses",
        data: analytics.trends.map((t) => t.expenses),
        backgroundColor: "rgba(239, 68, 68, 0.7)",
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Bar
          data={data}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
          }}
        />
      </CardContent>
    </Card>
  );
}
