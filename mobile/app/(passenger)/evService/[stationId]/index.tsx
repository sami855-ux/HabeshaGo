// BookingPage.tsx
import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native"
import { useQuery } from "@tanstack/react-query"
import { useLocalSearchParams, useRouter } from "expo-router"
import { axiosInstance } from "@/service/axiosInstance"
import { useAppSelector, useAppDispatch } from "@/store"
import { fetchUserWallet } from "@/store/slices/walletSlice"
import {
  ChevronLeft,
  Plug,
  Shield,
  MapPin,
  Star,
  Zap,
  Gauge,
  Clock,
  AlertCircle,
  Loader2,
  Car,
  Battery,
  Calendar,
  CheckCircle,
  Wallet,
  Coins,
  CreditCard,
  X,
  Key,
  Info,
} from "lucide-react-native"

// import { ChargingPointsGrid } from './ChargingPointsGrid'
// import { EnergySelector } from "./EnergySelector"
// import { BookingSummary } from "./BookingSummary"
// import { TimeSlotPicker } from "./TimeSlotPicker"
// import { ReservationSuccessComponent } from "./ReservationSuccessComponent"
import { ChargingPointsGrid } from "@/components/passenger/ChargingPointsGrid"
import { TimeSlotPicker } from "@/components/passenger/TimeSlotPicker"
import { BookingSummary } from "@/components/passenger/BookingSummary"
import { ReservationSuccessComponent } from "@/components/passenger/ReservationSuccessComponent"
import { EnergySelector } from "@/components/passenger/EnergySelector"

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

// Types
interface ChargingPoint {
  id: number
  stationId: number
  connectorType: string
  powerKw: number
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"
  averageSessionDuration: number
  slotNumber: string
  chargingSpeed: "SLOW" | "FAST" | "SUPER_FAST"
  maxVoltage: number
  maxCurrent: number
}

interface Tariff {
  id: number
  stationId: number
  pricePerKwh: string
  pricePerMinute: string | null
  idleFeePerMinute: string | null
  currency: string
  validFrom: string
  validTo: string | null
}

interface StationData {
  id: number
  name: string
  address: string
  city: string
  lat: number
  lng: number
  status: string
  isVerified: boolean
  chargingPoints: ChargingPoint[]
  tariffs: Tariff[]
  ratings: Rating[]
}

interface Rating {
  id: number
  stationId: number
  userId: string
  score: number
  comment: string
  createdAt: string
}

interface Vehicle {
  id: number
  type: string
  vin: string
  model: string
  plateNumber: string
  capacity: number
  manufacturer: string
  year: number
  connectorType: string
  vehicleImageUrl?: string
}

interface TimeSlot {
  id: string
  startTime: Date
  endTime: Date
  isAvailable: boolean
  reservedBy?: string
}

async function fetchStationData(stationId: string): Promise<StationData> {
  console.log(stationId)
  const { data } = await axiosInstance.get(`/ev/station/${stationId}`)
  console.log(data)
  if (!data?.success) {
    throw new Error(data?.message || "Failed to fetch station data")
  }
  return data.data
}

async function fetchUserVehicles(): Promise<Vehicle[]> {
  const { data } = await axiosInstance.get("/vehicles/user-vehicles")
  if (!data?.success) {
    throw new Error(data?.message || "Failed to fetch vehicles")
  }
  return data.data
}

// Vehicle Selector Component
const VehicleSelector = ({
  vehicles,
  onSelectVehicle,
  isLoading,
  onBack,
}: {
  vehicles: Vehicle[]
  onSelectVehicle: (id: number) => void
  isLoading: boolean
  onBack: () => void
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <SafeAreaView style={styles.vehicleSelectorContainer}>
      <StatusBar barStyle="dark-content" />

      <Animated.View
        style={[
          styles.vehicleSelectorHeader,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>

        <View style={styles.headerIconContainer}>
          <View>
            <Text style={styles.headerTitle}>Select Your Vehicle</Text>
            <Text style={styles.headerSubtitle}>
              Choose which vehicle to charge
            </Text>
          </View>
        </View>
      </Animated.View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <ScrollView
          style={styles.vehicleList}
          showsVerticalScrollIndicator={false}
        >
          {vehicles.map((vehicle, index) => {
            const cardAnim = useRef(new Animated.Value(0)).current
            const cardSlide = useRef(new Animated.Value(-20)).current

            useEffect(() => {
              Animated.parallel([
                Animated.timing(cardAnim, {
                  toValue: 1,
                  delay: index * 100,
                  duration: 400,
                  useNativeDriver: true,
                }),
                Animated.timing(cardSlide, {
                  toValue: 0,
                  delay: index * 100,
                  duration: 400,
                  useNativeDriver: true,
                }),
              ]).start()
            }, [])

            return (
              <Animated.View
                key={vehicle.id}
                style={[
                  styles.vehicleCard,
                  {
                    opacity: cardAnim,
                    transform: [{ translateX: cardSlide }],
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onSelectVehicle(vehicle.id)}
                  style={styles.vehicleCardContent}
                >
                  <View style={styles.vehicleIcon}>
                    <Car size={32} color="#10b981" />
                  </View>

                  <View style={styles.vehicleInfo}>
                    <View style={styles.vehicleTitleRow}>
                      <Text style={styles.vehicleName}>
                        {vehicle.manufacturer} {vehicle.model}
                      </Text>
                      <View style={styles.connectorBadge}>
                        <Text style={styles.connectorBadgeText}>
                          {vehicle.connectorType}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.vehicleDetails}>
                      {vehicle.year} • {vehicle.plateNumber}
                    </Text>
                    <View style={styles.vehicleStats}>
                      <View style={styles.vehicleStat}>
                        <Battery size={12} color="#6b7280" />
                        <Text style={styles.vehicleStatText}>
                          {vehicle.capacity} kWh
                        </Text>
                      </View>
                      <View style={styles.vehicleStat}>
                        <Zap size={12} color="#6b7280" />
                        <Text style={styles.vehicleStatText}>EV Ready</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => onSelectVehicle(vehicle.id)}
                    >
                      <Text style={styles.selectButtonText}>
                        Select Vehicle
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )
          })}

          {vehicles.length === 0 && (
            <View style={styles.emptyVehicles}>
              <Car size={48} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Vehicles Found</Text>
              <Text style={styles.emptySubtitle}>
                You don't have any vehicles added to your account yet.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

// Quick Stats Component
const QuickStats = ({
  avgWaitTime,
  co2Saved,
  topRating,
}: {
  avgWaitTime: string
  co2Saved: string
  topRating: string
}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const stats = [
    { icon: Clock, label: "Avg Wait", value: avgWaitTime, color: "#10b981" },
    { icon: Zap, label: "CO₂ Saved", value: co2Saved, color: "#10b981" },
    { icon: Star, label: "Top Rated", value: topRating, color: "#10b981" },
  ]

  return (
    <Animated.View
      style={[
        styles.statsContainer,
        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      {stats.map((stat, index) => (
        <View key={index} style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <stat.icon size={16} color={stat.color} />
          </View>
          <Text style={styles.statLabel}>{stat.label}</Text>
          <Text style={styles.statValue}>{stat.value}</Text>
        </View>
      ))}
    </Animated.View>
  )
}

// Wallet Password Dialog
const WalletPasswordDialog = ({
  open,
  onClose,
  onConfirm,
  totalAmount,
  paymentType,
  pointsToUseAmount,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (password: string) => void
  totalAmount: number
  paymentType: "wallet" | "points" | null
  pointsToUseAmount: number
}) => {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current

  useEffect(() => {
    if (open) {
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [open])

  const handleConfirm = async () => {
    if (password.length !== 6) {
      setError("Please enter 6-digit password")
      return
    }
    setIsVerifying(true)
    await onConfirm(password)
    setIsVerifying(false)
    setPassword("")
    setError("")
  }

  const pointsEquivalent =
    paymentType === "points" ? Math.ceil(totalAmount / 0.5) : 0

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.dialogOverlay}>
        <TouchableOpacity style={styles.dialogBackground} onPress={onClose} />
        <Animated.View
          style={[
            styles.dialogContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.dialogHeader}>
            <TouchableOpacity onPress={onClose} style={styles.dialogClose}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.dialogTitle}>
              {paymentType === "points"
                ? "Points Redemption"
                : "Wallet Payment"}
            </Text>
            <Text style={styles.dialogDescription}>
              {paymentType === "points"
                ? "Enter your 6-digit wallet password to authorize points redemption"
                : "Enter your 6-digit wallet password to complete payment"}
            </Text>
          </View>

          <View style={styles.dialogBody}>
            <View
              style={[
                styles.paymentInfoCard,
                paymentType === "points" && styles.pointsCard,
              ]}
            >
              <View style={styles.paymentInfoLeft}>
                <View
                  style={[
                    styles.paymentIcon,
                    paymentType === "points" && styles.pointsIcon,
                  ]}
                >
                  {paymentType === "points" ? (
                    <Coins size={20} color="#fff" />
                  ) : (
                    <Wallet size={20} color="#fff" />
                  )}
                </View>
                <View>
                  <Text style={styles.paymentInfoLabel}>
                    {paymentType === "points" ? "Paying with" : "Paying with"}
                  </Text>
                  <Text style={styles.paymentInfoTitle}>
                    {paymentType === "points"
                      ? "HabeshaGo Points"
                      : "HabeshaGo Wallet"}
                  </Text>
                </View>
              </View>
              <View style={styles.paymentInfoRight}>
                <Text style={styles.paymentInfoAmountLabel}>
                  {paymentType === "points"
                    ? "Points to Redeem"
                    : "Amount to Pay"}
                </Text>
                <Text
                  style={[
                    styles.paymentInfoAmount,
                    paymentType === "points" && styles.pointsAmount,
                  ]}
                >
                  {paymentType === "points"
                    ? `${pointsToUseAmount * 2} pts`
                    : `${totalAmount.toFixed(2)} ETB`}
                </Text>
                {paymentType === "points" && (
                  <Text style={styles.paymentInfoEquivalent}>
                    ≈ {pointsToUseAmount.toFixed(2)} ETB
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.passwordSection}>
              <Text style={styles.passwordLabel}>
                <Key size={14} color="#10b981" /> Wallet Password (6-digit)
              </Text>
              <View style={styles.otpContainer}>
                {[...Array(6)].map((_, i) => (
                  <View key={i} style={styles.otpBox}>
                    <Text style={styles.otpText}>{password[i] || ""}</Text>
                  </View>
                ))}
              </View>
              <TextInput
                style={styles.hiddenInput}
                value={password}
                onChangeText={(text) => {
                  setPassword(text.replace(/[^0-9]/g, "").slice(0, 6))
                  setError("")
                }}
                keyboardType="numeric"
                maxLength={6}
                autoFocus
                secureTextEntry
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          </View>

          <View style={styles.dialogFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                paymentType === "points" && styles.pointsConfirmButton,
              ]}
              onPress={handleConfirm}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {paymentType === "points"
                    ? "Confirm Redemption"
                    : "Confirm Payment"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

// Creating Reservation Dialog
const CreatingReservationDialog = ({
  visible,
  stationData,
  selectedPoint,
  energyKwh,
  selectedTimeSlot,
  paymentMethod,
  totalAmount,
}: {
  visible: boolean
  stationData: StationData | null
  selectedPoint: ChargingPoint | null
  energyKwh: number
  selectedTimeSlot: TimeSlot | null
  paymentMethod: string
  totalAmount: number
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ).start()
    } else {
      spinAnim.setValue(0)
    }
  }, [visible])

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.dialogOverlay}>
        <View style={styles.creatingDialog}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <View style={styles.spinner} />
          </Animated.View>
          <Text style={styles.creatingTitle}>Creating Your Reservation</Text>
          <Text style={styles.creatingSubtitle}>
            Processing payment and securing your slot...
          </Text>
          <View style={styles.creatingDetails}>
            <View style={styles.creatingRow}>
              <Text style={styles.creatingLabel}>Station:</Text>
              <Text style={styles.creatingValue}>{stationData?.name}</Text>
            </View>
            <View style={styles.creatingRow}>
              <Text style={styles.creatingLabel}>Charging Point:</Text>
              <Text style={styles.creatingValue}>
                Slot {selectedPoint?.slotNumber}
              </Text>
            </View>
            <View style={styles.creatingRow}>
              <Text style={styles.creatingLabel}>Energy:</Text>
              <Text style={styles.creatingValue}>{energyKwh} kWh</Text>
            </View>
            <View style={styles.creatingRow}>
              <Text style={styles.creatingLabel}>Payment:</Text>
              <Text style={styles.creatingValue}>{paymentMethod}</Text>
            </View>
            <View style={styles.creatingTotalRow}>
              <Text style={styles.creatingTotalLabel}>Total Amount:</Text>
              <Text style={styles.creatingTotalValue}>
                {totalAmount.toFixed(2)} ETB
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default function BookingPage() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const stationId = params.stationId as string

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null,
  )
  const [pendingPaymentType, setPendingPaymentType] = useState<
    "wallet" | "points" | null
  >(null)
  const [estimatedTimeMin, setEstimatedTimeMin] = useState<number | undefined>()
  const [reservationDetails, setReservationDetails] = useState<any>(null)
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null)
  const [energyKwh, setEnergyKwh] = useState<number>(35)
  const [paymentMethod, setPaymentMethod] = useState<
    "wallet" | "points" | "card"
  >("wallet")
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [applyPoints, setApplyPoints] = useState(false)
  const [selectedTariffId, setSelectedTariffId] = useState<number | null>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null,
  )
  const [showVehicleSelector, setShowVehicleSelector] = useState(true)
  const [showWalletPassword, setShowWalletPassword] = useState(false)
  const [showCreatingReservation, setShowCreatingReservation] = useState(false)
  const [reservationError, setReservationError] = useState<string | null>(null)

  const { wallet, loading: walletLoading } = useAppSelector(
    (state) => state.wallet,
  )
  const { user } = useAppSelector((state) => state.user)

  const {
    data: stationData,
    isLoading: stationLoading,
    error: stationError,
  } = useQuery({
    queryKey: ["station", stationId],
    queryFn: () => fetchStationData(stationId),
    enabled: !!stationId,
  })

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["user-vehicles"],
    queryFn: fetchUserVehicles,
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserWallet())
    }
  }, [dispatch, user])

  const selectedPoint = stationData?.chargingPoints.find(
    (p) => p.id === selectedPointId,
  )
  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId)
  const selectedTariff =
    stationData?.tariffs.find((t) => t.id === selectedTariffId) ||
    stationData?.tariffs[0]
  const pricePerKwh = selectedTariff
    ? parseFloat(selectedTariff.pricePerKwh)
    : 0
  const subtotal = energyKwh * pricePerKwh
  const walletBalance = wallet?.balance || 0
  const pointsBalance = wallet?.points || 0
  const pointsValue = pointsBalance * 0.5
  const pointsToUseAmount = applyPoints ? Math.min(pointsValue, subtotal) : 0
  const totalAmount = subtotal - pointsToUseAmount

  const availablePoints =
    stationData?.chargingPoints.filter((p) => p.status === "AVAILABLE") || []

  const handleSelectPoint = (pointId: number) => {
    setSelectedPointId(pointId)
    setBookingSuccess(false)
    setReservationError(null)
  }

  const handleSelectVehicle = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId)
    setShowVehicleSelector(false)
    setReservationError(null)
  }

  const handleChangeVehicle = () => {
    setShowVehicleSelector(true)
    setSelectedVehicleId(null)
    setSelectedPointId(null)
    setSelectedTimeSlot(null)
    setReservationError(null)
  }

  const calculateTargetBatteryPercentage = (
    energyKwh: number,
    batteryCapacity: number,
  ): number => {
    if (!batteryCapacity || batteryCapacity === 0) return 80
    return Math.min(Math.round((energyKwh / batteryCapacity) * 100), 100)
  }

  const createReservation = async (password?: string) => {
    if (!selectedPoint || !selectedVehicle) {
      setReservationError("Missing required data")
      setShowCreatingReservation(false)
      return
    }

    if (!selectedTimeSlot) {
      setReservationError("Please select a time slot")
      setShowCreatingReservation(false)
      return
    }

    let paymentFlow = "EXTERNAL_ONLY"
    if (paymentMethod === "points" && applyPoints) {
      paymentFlow = "POINTS_EXTERNAL"
    } else if (paymentMethod === "wallet") {
      paymentFlow =
        applyPoints && pointsToUseAmount > 0 ? "POINTS_WALLET" : "WALLET_ONLY"
    } else if (paymentMethod === "card") {
      paymentFlow =
        applyPoints && pointsToUseAmount > 0
          ? "POINTS_EXTERNAL"
          : "EXTERNAL_ONLY"
    }

    const reservationData = {
      vehicleId: selectedVehicle.id,
      chargingPointId: selectedPoint.id,
      startTime: selectedTimeSlot.startTime.toISOString(),
      endTime: selectedTimeSlot.endTime.toISOString(),
      userId: user?.id,
      targetBatteryPercentage: calculateTargetBatteryPercentage(
        energyKwh,
        selectedVehicle.capacity,
      ),
      targetKwh: energyKwh,
      calculatedAmount: subtotal,
      paymentFlow: paymentFlow,
      paymentMethod: "MOBILE_MONEY",
      walletPin: password,
    }

    try {
      const { data } = await axiosInstance.post(
        "/ev/reservation",
        reservationData,
      )

      if (data.data.needsExternalPayment && data.data.paymentUrl) {
        // Handle external payment - open URL
        // You'll need to use Linking API here
      }

      if (data?.success) {
        setReservationDetails({
          ...reservationData,
          reservationCode: data.data.reservation.reservationCode,
          stationName: stationData?.name,
          stationAddress: stationData?.address,
          pointNumber: selectedPoint.slotNumber,
          pointPower: selectedPoint.powerKw,
          connectorType: selectedPoint.connectorType,
          vehicleModel: selectedVehicle.model,
          vehiclePlate: selectedVehicle.plateNumber,
          energyKwh: energyKwh,
          totalAmount: totalAmount,
          originalAmount: subtotal,
          pointsUsed: applyPoints ? pointsToUseAmount : 0,
          paymentMethod: paymentMethod,
        })
        setBookingSuccess(true)
        setShowCreatingReservation(false)
      }
    } catch (error: any) {
      setReservationError(
        error?.response?.data?.message || "Failed to create reservation",
      )
      setShowCreatingReservation(false)
    }
  }

  const handleWalletPasswordConfirm = async (password: string) => {
    setShowWalletPassword(false)
    setShowCreatingReservation(true)
    await createReservation(password)
  }

  const handleOpenPayment = () => {
    if (!selectedPoint) {
      setReservationError("Please select a charging point")
      return
    }
    if (!selectedVehicleId) {
      setReservationError("Please select a vehicle")
      return
    }
    if (!selectedTimeSlot) {
      setReservationError("Please select a time slot")
      return
    }

    setReservationError(null)

    if (paymentMethod === "wallet") {
      if (walletBalance >= totalAmount) {
        setPendingPaymentType("wallet")
        setShowWalletPassword(true)
      } else {
        setReservationError(
          `Insufficient wallet balance. Need ${(totalAmount - walletBalance).toFixed(2)} ETB more`,
        )
      }
    } else if (paymentMethod === "points") {
      if (!applyPoints) {
        setReservationError("Please apply your points first")
        return
      }
      if (pointsBalance === 0) {
        setReservationError("No points available")
        return
      }
      setPendingPaymentType("points")
      setShowWalletPassword(true)
    } else if (paymentMethod === "card") {
      setShowCreatingReservation(true)
      createReservation()
    }
  }

  if (
    showVehicleSelector &&
    vehicles &&
    vehicles.length > 0 &&
    !selectedVehicleId
  ) {
    return (
      <VehicleSelector
        vehicles={vehicles}
        onSelectVehicle={handleSelectVehicle}
        isLoading={vehiclesLoading}
        onBack={() => router.back()}
      />
    )
  }

  if (stationLoading || vehiclesLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading station details...</Text>
      </View>
    )
  }

  if (stationError || !stationData) {
    return (
      <View style={styles.errorScreen}>
        <View style={styles.errorIcon}>
          <Zap size={32} color="#ef4444" />
        </View>
        <Text style={styles.errorTitle}>Failed to Load Station</Text>
        <Text style={styles.errorSubtitle}>
          {stationError instanceof Error
            ? stationError.message
            : "Unable to fetch station details"}
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (bookingSuccess && reservationDetails) {
    return (
      <ReservationSuccessComponent
        reservationDetails={reservationDetails}
        onNavigateToMyReservations={() => router.push("/my-booking")}
        onBookAnother={() => {
          setBookingSuccess(false)
          setReservationDetails(null)
          setSelectedPointId(null)
          setSelectedTimeSlot(null)
          setEnergyKwh(35)
          setApplyPoints(false)
          setShowVehicleSelector(true)
          setSelectedVehicleId(null)
          setReservationError(null)
        }}
        onBackToHome={() => router.push("/evService")}
      />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Selected Vehicle Banner */}
      {selectedVehicle && (
        <View style={styles.vehicleBanner}>
          <View style={styles.vehicleBannerContent}>
            <Car size={16} color="#10b981" />
            <Text style={styles.vehicleBannerText}>
              Charging: {selectedVehicle.manufacturer} {selectedVehicle.model} (
              {selectedVehicle.plateNumber})
            </Text>
            <View style={styles.connectorBadgeSmall}>
              <Text style={styles.connectorBadgeSmallText}>
                {selectedVehicle.connectorType}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleChangeVehicle}>
            <Text style={styles.changeVehicleText}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error Alert */}
      {reservationError && (
        <View style={styles.errorAlert}>
          <AlertCircle size={16} color="#dc2626" />
          <Text style={styles.errorAlertText}>{reservationError}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#10b981" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Plug size={24} color="#fff" />
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>{stationData.name}</Text>
            {stationData.isVerified && (
              <View style={styles.verifiedBadge}>
                <Shield size={12} color="#10b981" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.headerAddress}>
            <MapPin size={12} color="#10b981" />
            <Text style={styles.headerAddressText}>
              {stationData.address}, {stationData.city}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Charging Points Grid */}
        <ChargingPointsGrid
          chargingPoints={stationData.chargingPoints}
          selectedPointId={selectedPointId}
          onSelectPoint={handleSelectPoint}
          selectedVehicle={selectedVehicle}
          handleChangeVehicle={handleChangeVehicle}
        />

        {/* Energy Selector */}
        <EnergySelector
          selectedPoint={selectedPoint}
          energyKwh={energyKwh}
          setEnergyKwh={setEnergyKwh}
          pricePerKwh={pricePerKwh}
          estimatedTimeMin={estimatedTimeMin}
          setEstimatedTimeMin={setEstimatedTimeMin}
          vehicleCapacity={selectedVehicle?.capacity}
        />

        {/* Time Slot Picker */}
        <TimeSlotPicker
          selectedPointId={selectedPointId}
          workingHours={{ start: "00:00", end: "23:59" }}
          reservations={[]}
          onTimeSlotSelect={setSelectedTimeSlot}
          selectedTimeSlot={selectedTimeSlot}
          estimatedTimeMin={estimatedTimeMin}
        />

        {/* Booking Summary */}
        <BookingSummary
          selectedPoint={selectedPoint}
          energyKwh={energyKwh}
          pricePerKwh={pricePerKwh}
          stationData={stationData}
          pointsBalance={pointsBalance}
          walletBalance={walletBalance}
          selectedTimeSlot={selectedTimeSlot}
          estimatedTimeMin={estimatedTimeMin}
          applyPoints={applyPoints}
          setApplyPoints={setApplyPoints}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          totalAmount={totalAmount}
          pointsToUseAmount={pointsToUseAmount}
          isBooking={false}
          bookingSuccess={bookingSuccess}
          pointsPaymentSuccess={false}
          walletLoading={walletLoading}
          onOpenPayment={handleOpenPayment}
          onRefreshBalances={() => dispatch(fetchUserWallet())}
          selectedVehicle={selectedVehicle}
        />
      </ScrollView>

      {/* Dialogs */}
      <WalletPasswordDialog
        open={showWalletPassword}
        onClose={() => setShowWalletPassword(false)}
        onConfirm={handleWalletPasswordConfirm}
        totalAmount={totalAmount}
        paymentType={pendingPaymentType}
        pointsToUseAmount={pointsToUseAmount}
      />

      <CreatingReservationDialog
        visible={showCreatingReservation}
        stationData={stationData}
        selectedPoint={selectedPoint}
        energyKwh={energyKwh}
        selectedTimeSlot={selectedTimeSlot}
        paymentMethod={paymentMethod}
        totalAmount={totalAmount}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 24,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 20,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  vehicleBanner: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  vehicleBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vehicleBannerText: {
    fontSize: 13,
    color: "#374151",
  },
  connectorBadgeSmall: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  connectorBadgeSmallText: {
    fontSize: 10,
    color: "#10b981",
    fontWeight: "500",
  },
  changeVehicleText: {
    fontSize: 13,
    color: "#10b981",
    fontWeight: "500",
  },
  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fee2e2",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 13,
    color: "#dc2626",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 12,
  },
  backButton: {
    display: "flex",
    padding: 4,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: "#10b981",
    fontWeight: "500",
  },
  headerAddress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  headerAddressText: {
    fontSize: 12,
    color: "#6b7280",
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  vehicleSelectorContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 20,
  },
  vehicleSelectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 16,
  },
  backText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 4,
  },
  headerIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  vehicleList: {
    flex: 1,
    padding: 16,
  },
  vehicleCard: {
    marginBottom: 16,
  },
  vehicleCardContent: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  connectorBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  connectorBadgeText: {
    fontSize: 10,
    color: "#10b981",
    fontWeight: "500",
  },
  vehicleDetails: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  vehicleStats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  vehicleStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vehicleStatText: {
    fontSize: 12,
    color: "#6b7280",
  },
  selectButton: {
    backgroundColor: "#10b981",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyVehicles: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dialogOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dialogBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialogContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  dialogHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  dialogClose: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 4,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  dialogDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  dialogBody: {
    marginBottom: 20,
  },
  paymentInfoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ecfdf5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  pointsCard: {
    backgroundColor: "#fffbeb",
  },
  paymentInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  pointsIcon: {
    backgroundColor: "#f59e0b",
  },
  paymentInfoLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  paymentInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  paymentInfoRight: {
    alignItems: "flex-end",
  },
  paymentInfoAmountLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  paymentInfoAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
  },
  pointsAmount: {
    color: "#f59e0b",
  },
  paymentInfoEquivalent: {
    fontSize: 11,
    color: "#6b7280",
  },
  passwordSection: {
    alignItems: "center",
  },
  passwordLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
  },
  otpBox: {
    width: 50,
    height: 56,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  otpText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    textAlign: "center",
  },
  dialogFooter: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  pointsConfirmButton: {
    backgroundColor: "#f59e0b",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  creatingDialog: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "#e5e7eb",
    borderTopColor: "#10b981",
  },
  creatingTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 20,
    marginBottom: 8,
  },
  creatingSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
  },
  creatingDetails: {
    width: "100%",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  creatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  creatingLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  creatingValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  creatingTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  creatingTotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  creatingTotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10b981",
  },
})
