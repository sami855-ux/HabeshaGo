"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DocumentUpload } from "./document-upload";
import { ImageUpload } from "./image-upload";
import {
  Save,
  Loader2,
  MapPin,
  Globe,
  CheckCircle2,
  AlertCircle,
  Info,
  Home,
  Navigation,
  FileText,
  Image,
  Shield,
  CircleSlash,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";
import { motion, AnimatePresence } from "framer-motion";

interface FormData {
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  isVerified: boolean;
  description: string;
  documents: File[];
  images: File[];
  chargingPoints: any[];
}

export function NewChargingStationForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      lat: 0,
      lng: 0,
      status: "ACTIVE",
      isVerified: false,
      description: "",
      documents: [],
      images: [],
      chargingPoints: [],
    },
  });

  const status = watch("status");
  const isVerified = watch("isVerified");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log("Form data:", data);
      // router.push("/charging-stations");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Info, color: "from-blue-500 to-cyan-500" },
    { id: "location", label: "Location", icon: MapPin, color: "from-emerald-500 to-teal-500" },
    { id: "documents", label: "Documents", icon: FileText, color: "from-amber-500 to-orange-500" },
    { id: "images", label: "Images", icon: Image, color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header with enhanced styling */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/80 shadow-sm"
                onClick={() => router.back()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                  Add New Station
                </h1>
              </div>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                Create a new charging station with documents and images
              </p>
            </div>
          </div>
          
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="border-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className={cn(
                "min-w-[140px] bg-gradient-to-r from-primary to-primary/80",
                "hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl",
                "transition-all duration-300 border-0"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Station
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Upload Progress Bar with animation */}
        <AnimatePresence>
          {isSubmitting && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    Uploading files...
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress 
                  value={uploadProgress} 
                  className="h-2.5 bg-blue-200 dark:bg-blue-900"
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Minimal Modern Tabs */}
              <div className="flex justify-center mb-8">
                <TabsList className="inline-flex h-12 items-center justify-center rounded-full bg-muted/50 p-1 text-muted-foreground backdrop-blur-sm">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                          "inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium ring-offset-background transition-all",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          "disabled:pointer-events-none disabled:opacity-50",
                          "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
                          "hover:text-foreground/80"
                        )}
                      >
                        <tab.icon className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {/* Basic Information Tab */}
              <TabsContent value="basic">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="p-8 border-none shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          Basic Information
                        </h2>
                        <p className="text-muted-foreground ml-14">
                          Enter the basic details of the charging station
                        </p>
                      </div>
                      <Separator className="my-4" />

                      <div className="grid gap-8">
                        {/* Station Name */}
                        <div className="space-y-2 group">
                          <Label htmlFor="name" className="flex items-center gap-2 text-base">
                            Station Name
                            <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="name"
                              {...register("name", { required: "Station name is required" })}
                              placeholder="e.g., Downtown EV Station"
                              className={cn(
                                "pl-4 py-6 text-lg border-2 transition-all",
                                "focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                                "group-hover:border-blue-300",
                                errors.name && "border-red-500 focus:border-red-500 focus:ring-red-200"
                              )}
                            />
                            {errors.name && (
                              <motion.p 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-6 left-0 text-sm text-red-500 flex items-center gap-1"
                              >
                                <AlertCircle className="h-3 w-3" />
                                {errors.name.message}
                              </motion.p>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-base">Description</Label>
                          <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Describe the station location, amenities, and any special features..."
                            rows={4}
                            className="resize-none border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                        </div>

                        {/* Status and Verification */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label className="text-base">Station Status</Label>
                            <Select
                              onValueChange={(value: any) => setValue("status", value)}
                              defaultValue="ACTIVE"
                            >
                              <SelectTrigger className="h-12 border-2">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ACTIVE">
                                  <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                    <span className="font-medium">Active</span>
                                    <span className="text-xs text-muted-foreground ml-2">Fully operational</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="INACTIVE">
                                  <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                                    <span className="font-medium">Inactive</span>
                                    <span className="text-xs text-muted-foreground ml-2">Not in service</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="MAINTENANCE">
                                  <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                                    <span className="font-medium">Maintenance</span>
                                    <span className="text-xs text-muted-foreground ml-2">Under maintenance</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-base">Verification</Label>
                            <div className="flex items-center h-12 px-4 border-2 rounded-lg bg-white dark:bg-slate-950">
                              <Checkbox
                                id="verified"
                                onCheckedChange={(checked) => 
                                  setValue("isVerified", checked as boolean)
                                }
                                className="mr-3"
                              />
                              <Label htmlFor="verified" className="cursor-pointer flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-500" />
                                Mark as verified station
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Status Preview */}
                        <motion.div 
                          layout
                          className={cn(
                            "rounded-xl p-6 border-2 transition-all",
                            status === "ACTIVE" && "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800",
                            status === "INACTIVE" && "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/50 dark:to-slate-950/50 border-gray-200 dark:border-gray-800",
                            status === "MAINTENANCE" && "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50 border-yellow-200 dark:border-yellow-800"
                          )}
                        >
                          <div className="flex items-center gap-6">
                            <motion.div 
                              className={cn(
                                "p-3 rounded-xl",
                                status === "ACTIVE" && "bg-green-500/20",
                                status === "INACTIVE" && "bg-gray-500/20",
                                status === "MAINTENANCE" && "bg-yellow-500/20"
                              )}
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              {status === "ACTIVE" && <CheckCircle2 className="h-8 w-8 text-green-600" />}
                              {status === "INACTIVE" && <AlertCircle className="h-8 w-8 text-gray-600" />}
                              {status === "MAINTENANCE" && <AlertCircle className="h-8 w-8 text-yellow-600" />}
                            </motion.div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-semibold">
                                  Station will be {status.toLowerCase()}
                                </h3>
                                {status === "ACTIVE" && (
                                  <Badge className="bg-green-500 text-white">Live</Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground">
                                {status === "ACTIVE" && "Station will be immediately available for charging sessions"}
                                {status === "INACTIVE" && "Station will be disabled and hidden from users"}
                                {status === "MAINTENANCE" && "Station will show maintenance mode to users"}
                              </p>
                            </div>

                            {isVerified && (
                              <>
                                <Separator orientation="vertical" className="h-12" />
                                <motion.div 
                                  className="flex items-center gap-3"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                >
                                  <div className="p-2 rounded-lg bg-blue-500/20">
                                    <CircleSlash className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold">Verified Station</p>
                                    <p className="text-sm text-muted-foreground">Trusted & confirmed</p>
                                  </div>
                                </motion.div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Location Tab */}
              <TabsContent value="location">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="p-8 border-none shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          Location Details
                        </h2>
                        <p className="text-muted-foreground ml-14">
                          Enter the physical location of the charging station
                        </p>
                      </div>
                      <Separator className="my-4" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Address */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address" className="text-base">Street Address</Label>
                          <div className="relative">
                            <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="address"
                              {...register("address")}
                              placeholder="123 Main Street"
                              className="pl-10 py-6 border-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>
                        </div>

                        {/* City */}
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-base">City</Label>
                          <Input
                            id="city"
                            {...register("city")}
                            placeholder="e.g., New York"
                            className="py-6 border-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                          />
                        </div>

                        {/* Coordinates */}
                        <div className="space-y-2">
                          <Label className="text-base">GPS Coordinates</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...register("lat", { valueAsNumber: true })}
                                placeholder="Latitude"
                                type="number"
                                step="any"
                                className="pl-9 py-6 border-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                              />
                            </div>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...register("lng", { valueAsNumber: true })}
                                placeholder="Longitude"
                                type="number"
                                step="any"
                                className="pl-9 py-6 border-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <DocumentUpload
                    onFilesChange={(files) => setValue("documents", files)}
                    register={register}
                  />
                </motion.div>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <ImageUpload
                    onFilesChange={(files) => setValue("images", files)}
                    register={register}
                  />
                </motion.div>
              </TabsContent>
            </Tabs>

            {/* Enhanced Form Footer */}
            <motion.div 
              className="mt-8 flex justify-end gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  if (activeTab === "basic") router.back();
                  if (activeTab === "location") setActiveTab("basic");
                  if (activeTab === "documents") setActiveTab("location");
                  if (activeTab === "images") setActiveTab("documents");
                }}
                className="border-2 px-8"
              >
                Previous
              </Button>
              
              <Button
                type="button"
                size="lg"
                onClick={() => {
                  if (activeTab === "basic") setActiveTab("location");
                  if (activeTab === "location") setActiveTab("documents");
                  if (activeTab === "documents") setActiveTab("images");
                  if (activeTab === "images") handleSubmit(onSubmit)();
                }}
                className={cn(
                  "px-8 bg-gradient-to-r from-primary to-primary/80",
                  "hover:from-primary/90 hover:to-primary/70",
                  "shadow-lg hover:shadow-xl transition-all duration-300"
                )}
              >
                {activeTab === "images" ? "Complete Setup" : "Continue"}
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}