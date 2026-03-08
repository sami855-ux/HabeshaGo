// components/charging-stations/tariffs-card.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";

interface TariffsCardProps {
  tariffs?: any[];  // For the array version
  tariff?: any;      // For the single tariff version
  detailed?: boolean;
}

export function TariffsCard({ tariffs, tariff: singleTariff, detailed }: TariffsCardProps) {
  // Handle single tariff case (when used in map)
  if (singleTariff) {
    return (
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Tariff
          </h3>
          <Badge variant={singleTariff.validTo ? "outline" : "default"} className={!singleTariff.validTo ? "bg-green-500" : ""}>
            {!singleTariff.validTo ? "Active" : "Historical"}
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-primary">
                ETB {singleTariff?.pricePerKwh ? parseFloat(singleTariff.pricePerKwh).toFixed(2) : '0.00'}
              </p>
              <p className="text-xs text-muted-foreground">per kWh</p>
            </div>
            <Badge variant="outline" className="text-lg">
              {singleTariff?.currency || 'ETB'}
            </Badge>
          </div>

          {singleTariff?.pricePerMinute && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>ETB {parseFloat(singleTariff.pricePerMinute).toFixed(2)}/minute</span>
            </div>
          )}

          {singleTariff?.idleFeePerMinute && (
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <Clock className="h-4 w-4" />
              <span>Idle fee: ETB {parseFloat(singleTariff.idleFeePerMinute).toFixed(2)}/min</span>
            </div>
          )}

          <Separator />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {singleTariff?.validFrom ? (
                <>
                  Valid from {format(new Date(singleTariff.validFrom), "MMM dd, yyyy")}
                  {singleTariff?.validTo && ` to ${format(new Date(singleTariff.validTo), "MMM dd, yyyy")}`}
                </>
              ) : (
                'No validity period set'
              )}
            </span>
          </div>

          {detailed && singleTariff?.validTo && (
            <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
              This tariff is no longer active
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Handle array case (original behavior)
  if (!tariffs || tariffs.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <DollarSign className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
        <p>No tariffs available</p>
        <p className="text-xs mt-1">Tariffs will appear here once added</p>
      </Card>
    );
  }

  const tariff = tariffs[0]; // Show current tariff

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-primary" />
        Current Tariff
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-primary">
              ETB {tariff?.pricePerKwh ? parseFloat(tariff.pricePerKwh).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-muted-foreground">per kWh</p>
          </div>
          <Badge variant="outline" className="text-lg">
            {tariff?.currency || 'ETB'}
          </Badge>
        </div>

        {tariff?.pricePerMinute && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>ETB {parseFloat(tariff.pricePerMinute).toFixed(2)}/minute</span>
          </div>
        )}

        {tariff?.idleFeePerMinute && (
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <Clock className="h-4 w-4" />
            <span>Idle fee: ETB {parseFloat(tariff.idleFeePerMinute).toFixed(2)}/min</span>
          </div>
        )}

        <Separator />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            {tariff?.validFrom ? (
              <>
                Valid from {format(new Date(tariff.validFrom), "MMM dd, yyyy")}
                {tariff?.validTo && ` to ${format(new Date(tariff.validTo), "MMM dd, yyyy")}`}
              </>
            ) : (
              'No validity period set'
            )}
          </span>
        </div>

        {detailed && tariffs.length > 1 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Historical Tariffs</h4>
            <div className="space-y-2">
              {tariffs.slice(1).map((t) => (
                <div key={t.id} className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    ETB {t?.pricePerKwh ? parseFloat(t.pricePerKwh).toFixed(2) : '0.00'}/kWh
                  </p>
                  {t?.validFrom && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(t.validFrom), "MMM dd, yyyy")}
                      {t.validTo && ` - ${format(new Date(t.validTo), "MMM dd, yyyy")}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}