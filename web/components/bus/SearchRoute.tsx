"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Calendar, ArrowRight, ChevronDown, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { searchBusesThunk } from "@/store/slices/bus.Slice";

// Example sub-cities in Addis Ababa
const subCities = [
  { value: "bole", label: "Bole" },
  { value: "gullele", label: "Gullele" },
  { value: "piassa", label: "Piassa" },
  { value: "mekanisa", label: "Mekanisa" },
  { value: "keranio", label: "Keranio" },
  { value: "addis-ketema", label: "Addis Ketema" },
];

// Example bus types
const busTypes = [
  { value: "minibus", label: "Minibus" },
  { value: "luxury", label: "Luxury Bus" },
  { value: "city-bus", label: "City Bus" },
];

export function SearchRoute() {
  const dispatch = useDispatch();
  const { buses, loading, error } = useSelector((state: any) => state.bus);

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  const [fromValue, setFromValue] = useState("bole");
  const [toValue, setToValue] = useState("gullele");
  const [busType, setBusType] = useState("minibus");

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [passengers, setPassengers] = useState(1);

  const fromCity = subCities.find((c) => c.value === fromValue);
  const toCity = subCities.find((c) => c.value === toValue);
  const selectedType = busTypes.find((t) => t.value === busType);

  const handleSearch = () => {
    if (!fromCity || !toCity || !selectedType) return;

    dispatch(
      searchBusesThunk({
        start: fromCity.label,
        end: toCity.label,
        type: selectedType.value,
        date: date?.toISOString().split("T")[0],
      })
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Card */}
      <Card className="border-none shadow-xl rounded-2xl">
        <CardContent className="p-8 space-y-6">
          {/* FROM & TO */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* FROM */}
            <div className="md:col-span-4">
              <Label>From</Label>
              <Popover open={fromOpen} onOpenChange={setFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-14 justify-between"
                  >
                    {fromCity?.label}
                    <ChevronDown />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {subCities.map((city) => (
                          <CommandItem
                            key={city.value}
                            onSelect={() => {
                              setFromValue(city.value);
                              setFromOpen(false);
                            }}
                          >
                            {city.label}
                            {fromValue === city.value && (
                              <Check className="ml-auto" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* SWAP */}
            <div className="md:col-span-1 flex items-center justify-center">
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  setFromValue(toValue);
                  setToValue(fromValue);
                }}
              >
                <ArrowRight />
              </Button>
            </div>

            {/* TO */}
            <div className="md:col-span-4">
              <Label>To</Label>
              <Popover open={toOpen} onOpenChange={setToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-14 justify-between"
                  >
                    {toCity?.label}
                    <ChevronDown />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {subCities
                          .filter((c) => c.value !== fromValue)
                          .map((city) => (
                            <CommandItem
                              key={city.value}
                              onSelect={() => {
                                setToValue(city.value);
                                setToOpen(false);
                              }}
                            >
                              {city.label}
                              {toValue === city.value && (
                                <Check className="ml-auto" />
                              )}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* TYPE */}
            <div className="md:col-span-3">
              <Label>Bus Type</Label>
              <Popover open={typeOpen} onOpenChange={setTypeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-14 justify-between"
                  >
                    {selectedType?.label}
                    <ChevronDown />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {busTypes.map((type) => (
                          <CommandItem
                            key={type.value}
                            onSelect={() => {
                              setBusType(type.value);
                              setTypeOpen(false);
                            }}
                          >
                            {type.label}
                            {busType === type.value && (
                              <Check className="ml-auto" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* DATE + PASSENGERS + SEARCH */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Travel Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-14 justify-start"
                  >
                    <Calendar className="mr-2" />
                    {date?.toDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Passengers</Label>
              <Input
                type="number"
                min={1}
                value={passengers}
                onChange={(e) => setPassengers(+e.target.value)}
                className="h-14"
              />
            </div>

            <div className="flex items-end">
              <Button className="w-full h-14 text-lg" onClick={handleSearch}>
                <Search className="mr-2" />
                Search Buses
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="space-y-4">
        {loading && <p>Loading buses...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && buses.length === 0 && <p>No buses found.</p>}
        {!loading && buses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buses.map((bus: any) => (
              <Card key={bus.id} className="border-none shadow-lg rounded-xl">
                <CardContent className="space-y-2">
                  <p>
                    <strong>Bus:</strong> {bus.busNumber}
                  </p>
                  <p>
                    <strong>Capacity:</strong> {bus.capacity}
                  </p>
                  <p>
                    <strong>Route:</strong> {bus.route?.origin} →{" "}
                    {bus.route?.destination}
                  </p>
                  <p>
                    <strong>Type:</strong> {bus.type || "Standard"}
                  </p>
                  <p>
                    <strong>Driver:</strong>{" "}
                    {bus.driver?.name || "Not assigned"}
                  </p>
                  <p>
                    <strong>Status:</strong> {bus.status}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
