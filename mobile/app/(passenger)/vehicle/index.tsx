import { useThemeContext } from "@/context/ThemeContext"
import { Vehicle } from "@/types/vehicle"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import React, { useState, useRef } from "react"
import { vehicleService } from "@/service/vehicle.api"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Image,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import {
  Plus,
  Car,
  ChevronLeft,
  Trash2,
  CheckCircle,
  Zap,
  Battery,
  Calendar,
  Plug,
  Gauge,
  X,
  Upload,
  User,
  Phone,
  MapPin,
  AlertCircle,
  Fingerprint,
} from "lucide-react-native"
import { useAppSelector } from "@/store"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

const connectorTypeLabels: Record<string, { label: string; icon: string }> = {
  TYPE2: { label: "Type 2", icon: "🔌" },
  CCS: { label: "CCS", icon: "⚡" },
  CHADEMO: { label: "CHAdeMO", icon: "🔋" },
}

const vehicleTypeIcons: Record<string, string> = {
  BUS: "🚌",
  MINIBUS: "🚐",
  TAXI: "🚕",
  VAN: "🚐",
  TRUCK: "🚛",
}

const vehicleTypes = [
  { value: "BUS", label: "Bus", icon: "🚌" },
  { value: "MINIBUS", label: "Minibus", icon: "🚐" },
  { value: "TAXI", label: "Taxi", icon: "🚕" },
  { value: "VAN", label: "Van", icon: "🚐" },
  { value: "TRUCK", label: "Truck", icon: "🚛" },
]

const connectorTypes = [
  { value: "TYPE2", label: "Type 2", icon: "🔌" },
  { value: "CCS", label: "CCS", icon: "⚡" },
  { value: "CHADEMO", label: "CHAdeMO", icon: "🔋" },
]

export default function MyVehiclesPage() {
  const { colors, actualTheme } = useThemeContext()
  const isDark = actualTheme === "dark"
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAppSelector((state) => state.user)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null,
  )
  const [refreshing, setRefreshing] = useState(false)

  const {
    data: vehicles = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleService.getVehicles,
  })

  const createMutation = useMutation({
    mutationFn: vehicleService.createVehicle,
    onSuccess: (newVehicle) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      queryClient.setQueryData(["vehicles"], (old: any) => {
        if (!old) return [newVehicle]
        return [newVehicle, ...old]
      })
      setIsAddModalOpen(false)
      setSelectedVehicleId(newVehicle.id)
      Alert.alert(
        "Success",
        `${newVehicle.manufacturer} ${newVehicle.model} has been added to your garage.`,
      )
    },
    onError: () => {
      Alert.alert("Error", "Failed to add vehicle. Please try again.")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: vehicleService.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      Alert.alert("Success", "Vehicle deleted successfully.")
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete vehicle.")
    },
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const handleAddVehicle = (data: any) => {
    createMutation.mutate(data)
  }

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.id)
    Alert.alert(
      "Vehicle Selected",
      `${vehicle.manufacturer} ${vehicle.model} is ready for reservation.`,
    )
  }

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    Alert.alert(
      "Delete Vehicle",
      `Are you sure you want to delete ${vehicle.manufacturer} ${vehicle.model}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(vehicle.id),
        },
      ],
    )
  }

  if (isLoading) {
    return <VehiclesSkeleton colors={colors} />
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-3 ">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <View>
              <Text
                className="text-xs uppercase font-semibold font-geist"
                style={{ color: colors.mutedText }}
              >
                My Garage
              </Text>
              <Text
                className="text-xl font-semibold font-geist"
                style={{ color: colors.text }}
              >
                My Vehicles
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl flex-row items-center gap-2"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={18} color="#fff" />
            <Text className="text-white font-semibold font-geist">Add</Text>
          </TouchableOpacity>
        </View>
        <Text
          className="text-sm mt-1 pl-12 font-geist"
          style={{ color: colors.mutedText }}
        >
          Manage your EV vehicles for charging sessions
        </Text>
      </View>

      {/* Vehicle List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {vehicles.length === 0 ? (
          <EmptyState onAdd={() => setIsAddModalOpen(true)} colors={colors} />
        ) : (
          <View className="gap-4">
            {vehicles.map((vehicle: Vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isSelected={selectedVehicleId === vehicle.id}
                onSelect={() => handleSelectVehicle(vehicle)}
                onDelete={() => handleDeleteVehicle(vehicle)}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddVehicle}
        isSubmitting={createMutation.isPending}
        colors={colors}
        user={user}
      />
    </SafeAreaView>
  )
}

// Vehicle Card Component
function VehicleCard({
  vehicle,
  isSelected,
  onSelect,
  onDelete,
  colors,
  isDark,
}: any) {
  const vehicleTypeIcon = vehicleTypeIcons[vehicle.type] || "🚗"
  const connectorInfo = connectorTypeLabels[vehicle.connectorType] || {
    label: vehicle.connectorType,
    icon: "🔌",
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onSelect}
      className="rounded-2xl overflow-hidden border"
      style={{
        backgroundColor: colors.card,
        borderColor: isSelected ? colors.primary : colors.border,
        borderWidth: isSelected ? 1 : 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Vehicle Image or Placeholder */}
      {vehicle.vehicleImageUrl ? (
        <Image
          source={{ uri: vehicle.vehicleImageUrl }}
          className="h-48 w-full"
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={isDark ? ["#1a1a2e", "#16213e"] : ["#fff7ed", "#ffedd5"]}
          className="h-48 items-center justify-center"
        >
          <Text className="text-6xl">{vehicleTypeIcon}</Text>
          <Text className="text-sm mt-2" style={{ color: colors.mutedText }}>
            No Image
          </Text>
        </LinearGradient>
      )}

      {/* Selected Badge */}
      {isSelected && (
        <View
          className="absolute top-3 right-3 px-2 py-1 rounded-full flex-row items-center gap-1"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white text-xs font-medium font-geist">
            Selected
          </Text>
        </View>
      )}

      {/* Content */}
      <View className="p-4">
        <View className="flex-row items-center gap-2 mb-2">
          <Text
            className="text-lg font-bold flex-1"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {vehicle.manufacturer} {vehicle.model}
          </Text>
        </View>

        <View className="flex-row items-center gap-2 mb-3">
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: `${colors.success}15` }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: colors.success }}
            >
              Active
            </Text>
          </View>
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: `${colors.mutedText}10` }}
          >
            <Text
              className="text-xs font-mono"
              style={{ color: colors.mutedText }}
            >
              {vehicle.plateNumber}
            </Text>
          </View>
        </View>

        {/* Specs Grid */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          <SpecBadge
            icon={<Battery size={14} color={colors.primary} />}
            label={`${vehicle.capacity} kWh`}
            colors={colors}
          />
          <SpecBadge
            icon={<Plug size={14} color={colors.primary} />}
            label={connectorInfo.label}
            colors={colors}
          />
          {vehicle.year && (
            <SpecBadge
              icon={<Calendar size={14} color={colors.primary} />}
              label={vehicle.year.toString()}
              colors={colors}
            />
          )}
          {vehicle.mileage > 0 && (
            <SpecBadge
              icon={<Gauge size={14} color={colors.primary} />}
              label={`${vehicle.mileage.toLocaleString()} km`}
              colors={colors}
            />
          )}
        </View>

        {/* VIN */}
        {vehicle.vin && (
          <Text
            className="text-xs font-mono mb-3"
            style={{ color: colors.mutedText }}
          >
            VIN: {vehicle.vin}
          </Text>
        )}

        {/* Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onSelect}
            className="flex-1 py-3 rounded-xl items-center"
            style={{
              backgroundColor: isSelected
                ? `${colors.primary}15`
                : colors.primary,
            }}
          >
            <Text
              className="font-semibold"
              style={{ color: isSelected ? colors.primary : "#fff" }}
            >
              {isSelected ? "Selected" : "Select Vehicle"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            className="px-4 py-3 rounded-xl items-center border"
            style={{ borderColor: colors.border }}
          >
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function SpecBadge({ icon, label, colors }: any) {
  return (
    <View
      className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
      style={{ backgroundColor: `${colors.mutedText}10` }}
    >
      {icon}
      <Text className="text-xs font-medium" style={{ color: colors.text }}>
        {label}
      </Text>
    </View>
  )
}

function EmptyState({ onAdd, colors }: any) {
  return (
    <View className="items-center justify-center py-16 px-8">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: `${colors.mutedText}10` }}
      >
        <Car size={40} color={colors.mutedText} />
      </View>
      <Text
        className="text-lg font-bold mb-2 text-center"
        style={{ color: colors.text }}
      >
        No Vehicles Yet
      </Text>
      <Text
        className="text-sm text-center mb-6"
        style={{ color: colors.mutedText }}
      >
        Add your first vehicle to start charging
      </Text>
      <TouchableOpacity
        onPress={onAdd}
        className="px-6 py-3 rounded-xl"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="text-white font-semibold">Add Your First Vehicle</Text>
      </TouchableOpacity>
    </View>
  )
}

function VehiclesSkeleton({ colors }: any) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        className="px-5 pt-4 pb-3 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View
              className="w-10 h-10 rounded-full"
              style={{ backgroundColor: colors.mutedText }}
            />
            <View>
              <View
                className="h-3 w-20 rounded"
                style={{ backgroundColor: colors.mutedText }}
              />
              <View
                className="h-6 w-32 rounded mt-1"
                style={{ backgroundColor: colors.mutedText }}
              />
            </View>
          </View>
          <View
            className="h-10 w-20 rounded-xl"
            style={{ backgroundColor: colors.mutedText }}
          />
        </View>
      </View>
      <View className="p-4 gap-4">
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            className="h-80 rounded-2xl"
            style={{ backgroundColor: colors.mutedText }}
          />
        ))}
      </View>
    </SafeAreaView>
  )
}

// Add Vehicle Modal
function AddVehicleModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  colors,
  user,
}: any) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    type: "VAN",
    manufacturer: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    plateNumber: "",
    capacity: 0,
    connectorType: "",
    gpsDeviceId: "",
    mileage: 0,
    ownerName: user?.name || "",
    ownerPhone: user?.phone || "",
    image: null as any,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImagePick = () => {
    // Implement image picker
    Alert.alert(
      "Coming Soon",
      "Image upload will be available in the next update.",
    )
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          formData.type &&
          formData.manufacturer &&
          formData.model &&
          formData.year > 1900
        )
      case 2:
        return formData.vin?.length === 17 && formData.plateNumber
      case 3:
        return formData.capacity > 0 && formData.connectorType
      default:
        return true
    }
  }

  const nextStep = () => {
    if (isStepValid() && step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    if (step === 4) {
      onSubmit(formData)
      onClose()
      setStep(1)
      setFormData({
        type: "VAN",
        manufacturer: "",
        model: "",
        year: new Date().getFullYear(),
        vin: "",
        plateNumber: "",
        capacity: 0,
        connectorType: "",
        gpsDeviceId: "",
        mileage: 0,
        ownerName: user?.name || "",
        ownerPhone: user?.phone || "",
        image: null,
      })
      setImagePreview(null)
    } else {
      nextStep()
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <BlurView
        intensity={Platform.OS === "ios" ? 40 : 80}
        tint="dark"
        className="flex-1 justify-end"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="justify-end"
        >
          <View
            className="rounded-t-3xl"
            style={{
              backgroundColor: colors.background,
              maxHeight: SCREEN_HEIGHT * 0.9,
            }}
          >
            {/* Header */}
            <LinearGradient
              colors={[`${colors.primary}20`, `${colors.primary}10`]}
              className="p-5 border-b"
              style={{ borderBottomColor: colors.border }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Car size={20} color="#fff" />
                  </View>
                  <Text
                    className="text-xl font-bold"
                    style={{ color: colors.text }}
                  >
                    Add New Vehicle
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: `${colors.mutedText}20` }}
                >
                  <X size={20} color={colors.mutedText} />
                </TouchableOpacity>
              </View>

              {/* Progress Steps */}
              <View className="flex-row items-center justify-between gap-2 mt-5">
                {[1, 2, 3, 4].map((s) => (
                  <View key={s} className="flex-1 flex-row items-center">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{
                        backgroundColor:
                          step >= s ? colors.primary : `${colors.mutedText}20`,
                      }}
                    >
                      <Text className="text-white font-semibold text-sm">
                        {step > s ? "✓" : s}
                      </Text>
                    </View>
                    {s < 4 && (
                      <View
                        className="flex-1 h-px ml-1"
                        style={{ backgroundColor: `${colors.mutedText}30` }}
                      />
                    )}
                  </View>
                ))}
              </View>
            </LinearGradient>

            <ScrollView
              showsVerticalScrollIndicator={false}
              className="p-5"
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <View className="gap-4">
                  <Text
                    className="text-lg font-semibold"
                    style={{ color: colors.text }}
                  >
                    Basic Information
                  </Text>

                  <View>
                    <Text
                      className="text-sm font-medium mb-1"
                      style={{ color: colors.mutedText }}
                    >
                      Vehicle Type *
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="flex-row "
                    >
                      {vehicleTypes.map((type) => (
                        <TouchableOpacity
                          key={type.value}
                          onPress={() => updateField("type", type.value)}
                          className="px-8 py-2 rounded-xl mx-2"
                          style={{
                            backgroundColor:
                              formData.type === type.value
                                ? colors.primary
                                : `${colors.mutedText}10`,
                          }}
                        >
                          <Text className="text-lg">{type.icon}</Text>
                          <Text
                            className="text-xs mt-1"
                            style={{
                              color:
                                formData.type === type.value
                                  ? "#fff"
                                  : colors.text,
                            }}
                          >
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <InputField
                    label="Brand *"
                    value={formData.manufacturer}
                    onChangeText={(v: string) => updateField("manufacturer", v)}
                    placeholder="Tesla, BMW..."
                    colors={colors}
                  />
                  <InputField
                    label="Model *"
                    value={formData.model}
                    onChangeText={(v: string) => updateField("model", v)}
                    placeholder="Model 3, i4..."
                    colors={colors}
                  />
                  <InputField
                    label="Year *"
                    value={formData.year.toString()}
                    onChangeText={(v: string) =>
                      updateField(
                        "year",
                        parseInt(v) || new Date().getFullYear(),
                      )
                    }
                    placeholder="2024"
                    keyboardType="numeric"
                    colors={colors}
                  />
                </View>
              )}

              {/* Step 2: Identification */}
              {step === 2 && (
                <View className="gap-4">
                  <Text
                    className="text-lg font-semibold"
                    style={{ color: colors.text }}
                  >
                    Identification
                  </Text>
                  <InputField
                    label="VIN *"
                    value={formData.vin}
                    onChangeText={(v: string) =>
                      updateField("vin", v.toUpperCase())
                    }
                    placeholder="17-character VIN"
                    colors={colors}
                    maxLength={17}
                  />
                  <InputField
                    label="Plate Number *"
                    value={formData.plateNumber}
                    onChangeText={(v: string) =>
                      updateField("plateNumber", v.toUpperCase())
                    }
                    placeholder="ABC-1234"
                    colors={colors}
                  />
                  <InputField
                    label="GPS Device ID (Optional)"
                    value={formData.gpsDeviceId}
                    onChangeText={(v: string) => updateField("gpsDeviceId", v)}
                    placeholder="Enter GPS device identifier"
                    colors={colors}
                  />
                  <InputField
                    label="Current Mileage (km)"
                    value={formData.mileage.toString()}
                    onChangeText={(v: string) =>
                      updateField("mileage", parseInt(v) || 0)
                    }
                    placeholder="0"
                    keyboardType="numeric"
                    colors={colors}
                  />
                </View>
              )}

              {/* Step 3: EV Details */}
              {step === 3 && (
                <View className="gap-4">
                  <Text
                    className="text-lg font-semibold"
                    style={{ color: colors.text }}
                  >
                    EV Specifications
                  </Text>
                  <InputField
                    label="Battery Capacity (kWh) *"
                    value={formData.capacity.toString()}
                    onChangeText={(v: string) =>
                      updateField("capacity", parseFloat(v) || 0)
                    }
                    placeholder="75"
                    keyboardType="numeric"
                    colors={colors}
                  />

                  <View>
                    <Text
                      className="text-sm font-medium mb-1"
                      style={{ color: colors.mutedText }}
                    >
                      Connector Type *
                    </Text>
                    <View className="flex-row gap-2">
                      {connectorTypes.map((type) => (
                        <TouchableOpacity
                          key={type.value}
                          onPress={() =>
                            updateField("connectorType", type.value)
                          }
                          className="flex-1 px-4 py-3 rounded-xl items-center"
                          style={{
                            backgroundColor:
                              formData.connectorType === type.value
                                ? colors.primary
                                : `${colors.mutedText}10`,
                          }}
                        >
                          <Text className="text-xl">{type.icon}</Text>
                          <Text
                            className="text-xs mt-1"
                            style={{
                              color:
                                formData.connectorType === type.value
                                  ? "#fff"
                                  : colors.text,
                            }}
                          >
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text
                      className="text-sm font-medium mb-1"
                      style={{ color: colors.mutedText }}
                    >
                      Vehicle Image (Optional)
                    </Text>
                    <TouchableOpacity
                      onPress={handleImagePick}
                      className="h-32 rounded-xl border-2 border-dashed items-center justify-center"
                      style={{ borderColor: colors.border }}
                    >
                      {imagePreview ? (
                        <Image
                          source={{ uri: imagePreview }}
                          className="h-full w-full rounded-xl"
                          resizeMode="cover"
                        />
                      ) : (
                        <>
                          <Upload size={32} color={colors.mutedText} />
                          <Text
                            className="text-sm mt-2"
                            style={{ color: colors.mutedText }}
                          >
                            Tap to upload image
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Step 4: Owner Info */}
              {step === 4 && (
                <View className="gap-4">
                  <Text
                    className="text-lg font-semibold"
                    style={{ color: colors.text }}
                  >
                    Owner Information
                  </Text>
                  <Text className="text-xs" style={{ color: colors.mutedText }}>
                    Optional - Helps us contact you if needed
                  </Text>
                  <InputField
                    label="Owner Name"
                    value={formData.ownerName}
                    onChangeText={(v: string) => updateField("ownerName", v)}
                    placeholder="Full name"
                    colors={colors}
                  />
                  <InputField
                    label="Owner Phone"
                    value={formData.ownerPhone}
                    onChangeText={(v: string) => updateField("ownerPhone", v)}
                    placeholder="+1 234 567 8900"
                    keyboardType="phone-pad"
                    colors={colors}
                  />

                  <View
                    className="p-4 rounded-xl flex-row gap-3"
                    style={{ backgroundColor: `${colors.info}15` }}
                  >
                    <MapPin size={20} color={colors.info} />
                    <View className="flex-1">
                      <Text
                        className="text-sm font-medium"
                        style={{ color: colors.info }}
                      >
                        Why provide owner information?
                      </Text>
                      <Text
                        className="text-xs mt-1"
                        style={{ color: colors.info }}
                      >
                        This helps us contact the vehicle owner if needed for
                        charging sessions or emergencies.
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Footer Buttons */}
            <View
              className="flex-row gap-3 p-5 border-t"
              style={{ borderTopColor: colors.border }}
            >
              <TouchableOpacity
                onPress={step === 1 ? onClose : prevStep}
                className="flex-1 py-3 rounded-xl border items-center"
                style={{ borderColor: colors.border }}
              >
                <Text style={{ color: colors.text }}>
                  {step === 1 ? "Cancel" : "Back"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                className="flex-1 py-3 rounded-xl items-center"
                style={{
                  backgroundColor: isStepValid()
                    ? colors.primary
                    : `${colors.mutedText}30`,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">
                    {step === 4 ? "Add Vehicle" : "Continue"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  )
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  colors,
  maxLength,
}: any) {
  return (
    <View>
      <Text
        className="text-sm font-medium mb-1"
        style={{ color: colors.mutedText }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        className="px-4 py-3 rounded-xl text-base"
        style={{ backgroundColor: `${colors.mutedText}10`, color: colors.text }}
      />
    </View>
  )
}
