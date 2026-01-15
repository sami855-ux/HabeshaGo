import { Check, Wrench, X, Download, Trash2, BusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface BulkActionsProps {
  selectedCount: number
  onBulkAction: (action: string) => void
}

export default function BulkActions({
  selectedCount,
  onBulkAction,
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BusIcon className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">
                {selectedCount} bus{selectedCount !== 1 ? "es" : ""} selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Perform actions on selected items
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction("activate")}
            >
              <Check className="h-4 w-4 mr-2" />
              Activate
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction("maintenance")}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Maintenance
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction("deactivate")}
            >
              <X className="h-4 w-4 mr-2" />
              Deactivate
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction("export")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => onBulkAction("delete")}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onBulkAction("clear")}
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
