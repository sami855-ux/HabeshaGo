// components/charging-stations/export-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileJson, FileSpreadsheet,  } from "lucide-react";
import { useState } from "react";
import { ChargingStation } from "@/types/ev"

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ChargingStation[];
}

export function ExportDialog({ open, onOpenChange, data }: ExportDialogProps) {
  const [format, setFormat] = useState("csv");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "name",
    "city",
    "status",
    "totalChargers",
    "available",
    "occupied",
    "revenueToday",
    "energyDelivered",
  ]);

  const fields = [
    { id: "name", label: "Station Name" },
    { id: "city", label: "City" },
    { id: "address", label: "Address" },
    { id: "status", label: "Status" },
    { id: "totalChargers", label: "Total Chargers" },
    { id: "available", label: "Available" },
    { id: "occupied", label: "Occupied" },
    { id: "revenueToday", label: "Revenue (Today)" },
    { id: "energyDelivered", label: "Energy Delivered" },
    { id: "createdAt", label: "Created Date" },
    { id: "isVerified", label: "Verified" },
  ];

  const handleExport = () => {
    // Implement export logic based on format and selected fields
    console.log("Exporting:", { format, includeHeaders, selectedFields, data });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Export Stations</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-1">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center gap-1">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center gap-1">
                  <FileJson className="h-4 w-4" />
                  JSON
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Fields Selection */}
          <div className="space-y-2">
            <Label>Fields to Export</Label>
            <div className="grid grid-cols-2 gap-2 border rounded-lg p-3">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFields([...selectedFields, field.id]);
                      } else {
                        setSelectedFields(selectedFields.filter(f => f !== field.id));
                      }
                    }}
                  />
                  <Label htmlFor={field.id} className="text-sm">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Include Headers */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="headers"
              checked={includeHeaders}
              onCheckedChange={(checked) => setIncludeHeaders(checked as boolean)}
            />
            <Label htmlFor="headers">Include headers</Label>
          </div>

          {/* Summary */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Exporting {data.length} stations with {selectedFields.length} fields
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}