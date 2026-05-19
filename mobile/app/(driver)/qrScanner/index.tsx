import { useThemeContext } from "@/context/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { CheckCircle, QrCode, User, X, Bus, MapPin, Clock } from "lucide-react-native"
import { useState, useRef } from "react"
import {
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Vibration,
} from "react-native"
import { checkInPassenger } from "@/service/driver"

export default function DriverQRScanner() {
  const router = useRouter()
  const { colors, actualTheme } = useThemeContext()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<"front" | "back">("back")
  const [isVerifying, setIsVerifying] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [checkInResult, setCheckInResult] = useState<any>(null)
  
  const toastAnim = useRef(new Animated.Value(0)).current
  const scanLineAnim = useRef(new Animated.Value(0)).current

  const isDarkMode = actualTheme === "dark" ? true : false

  if (!permission) {
    return <View className="flex-1" />
  }

  if (!permission.granted) {
    return (
      <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View className="items-center p-8">
          <View className="w-24 h-24 rounded-full items-center justify-center mb-6 bg-white/20">
            <QrCode size={48} color="#FFFFFF" />
          </View>
          <Text className="text-white text-2xl font-bold mb-3 text-center">
            Camera Access Required
          </Text>
          <Text className="text-white/80 text-center mb-8">
            To scan passenger tickets and verify bookings, we need access to your camera.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="px-8 py-4 bg-white rounded-xl items-center"
          >
            <Text className="text-[#1E3A8A] font-semibold text-base">
              Grant Camera Permission
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    )
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage({ message, type })
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(null))
  }

  const startScanLineAnimation = () => {
    scanLineAnim.setValue(0)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned || isVerifying) return

    setScanned(true)
    setIsVerifying(true)
    
    // Haptic feedback
    Vibration.vibrate(100)

    try {
      // Parse QR code data (assuming it contains ticket info)
      let qrData
      try {
        qrData = JSON.parse(data)
      } catch {
        qrData = { ticketId: data }
      }

      const result = await checkInPassenger(qrData)
      
      setCheckInResult(result)
      setScannedData(data)
      setShowResultModal(true)
      showToast(`✓ ${result.passenger.name} checked in successfully`, 'success')
      
    } catch (error: any) {
      console.error("Check-in error:", error)
      const errorMessage = error.message || "Failed to verify ticket"
      showToast(errorMessage, 'error')
      
      // Show error alert
      Alert.alert(
        "Check-in Failed",
        errorMessage,
        [{ text: "OK", onPress: () => setScanned(false) }]
      )
    } finally {
      setIsVerifying(false)
      setTimeout(() => {
        setScanned(false)
      }, 2000)
    }
  }

  const toggleTorch = () => {
    setTorchOn(!torchOn)
  }

  const toggleCameraFacing = () => {
    setCameraFacing((current) => (current === "back" ? "front" : "back"))
  }

  const closeModal = () => {
    setShowResultModal(false)
    setScannedData(null)
    setCheckInResult(null)
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        className="flex-1"
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417", "ean13", "upc_e"],
        }}
        onBarcodeScanned={handleBarCodeScanned}
        facing={cameraFacing}
        enableTorch={torchOn}
        onCameraReady={startScanLineAnimation}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <Animated.View
          className={`absolute bottom-24 left-4 right-4 z-50 rounded-xl px-4 py-3 ${
            toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
          style={{
            transform: [{
              translateY: toastAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              })
            }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text className="text-white text-center font-semibold">
            {toastMessage.message}
          </Text>
        </Animated.View>
      )}

      {/* Overlay */}
      <View className="absolute inset-0 bg-transparent">
        {/* Header */}
        <LinearGradient
          colors={["rgba(0,0,0,0.8)", "transparent"]}
          className="pt-16 pb-5 px-5 flex-row justify-between items-center"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center bg-white/20"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text className="text-white text-xl font-bold">
            Scan Ticket
          </Text>

          <TouchableOpacity
            onPress={toggleTorch}
            className="w-10 h-10 rounded-full items-center justify-center bg-white/20"
          >
            <Ionicons
              name={torchOn ? "flash-off" : "flash"}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </LinearGradient>

        {/* Scanning Frame */}
        <View className="absolute top-1/3 left-[10%] w-[80%] h-[40%] items-center justify-center">
          {/* Corner borders */}
          <View className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
          <View className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
          <View className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
          <View className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

          <View className="absolute -top-12 items-center">
            <Text className="text-white text-lg font-semibold">
              Align QR Code Inside Frame
            </Text>
            <Text className="text-white/70 text-sm mt-1">
              Scan passenger tickets for verification
            </Text>
          </View>

          {/* Scanning Line Animation */}
          <Animated.View
            className="w-full h-0.5 bg-blue-500 absolute"
            style={{
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              elevation: 5,
              transform: [{
                translateY: scanLineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-150, 150],
                })
              }]
            }}
          />
        </View>

        {/* Footer Controls */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          className="absolute bottom-0 left-0 right-0 pb-10 px-8 pt-6 flex-row justify-between items-center"
        >
          <TouchableOpacity
            onPress={toggleCameraFacing}
            className="w-14 h-14 rounded-full items-center justify-center bg-white/20"
          >
            <Ionicons name="camera-reverse" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-white text-sm">Scan Count: {checkInResult?.bus?.passengersAboard || 0}</Text>
            <Text className="text-white/70 text-xs mt-1">Passengers aboard</Text>
          </View>

          <TouchableOpacity
            onPress={() => setScanned(true)}
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Ionicons name="scan" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Result Modal */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                Check-in Successful
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color={colors.mutedText} />
              </TouchableOpacity>
            </View>

            {checkInResult && (
              <View className="items-center mb-6">
                <View
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: colors.primary + "15" }}
                >
                  <CheckCircle size={40} color={colors.primary} />
                </View>

                <Text
                  className="text-lg font-semibold text-center mb-4"
                  style={{ color: colors.text }}
                >
                  Passenger Boarding Confirmed
                </Text>

                {/* Check-in Time */}
                <View className="w-full bg-green-500/10 rounded-xl p-3 mb-4 flex-row items-center justify-center space-x-2">
                  <Clock size={16} color={colors.primary} />
                  <Text className="text-green-600 font-semibold">
                    Checked in at {new Date(checkInResult.checkedInAt).toLocaleTimeString()}
                  </Text>
                </View>

                {/* Passenger Info Card */}
                <View className="w-full rounded-xl p-4 mb-4 border"
                  style={{ borderColor: colors.border, backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }}
                >
                  <View className="flex-row items-center mb-4">
                    <View className="w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center">
                      <User size={24} color={colors.primary} />
                    </View>
                    <View className="ml-3">
                      <Text className="font-semibold text-lg" style={{ color: colors.text }}>
                        {checkInResult.passenger.name}
                      </Text>
                      <Text className="text-sm" style={{ color: colors.mutedText }}>
                        {checkInResult.passenger.phone}
                      </Text>
                    </View>
                  </View>

                  <View className="space-y-3">
                    <View className="flex-row justify-between">
                      <Text className="text-sm" style={{ color: colors.mutedText }}>Ticket ID:</Text>
                      <Text className="font-medium" style={{ color: colors.text }}>
                        #{checkInResult.ticketId}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm" style={{ color: colors.mutedText }}>Seat Number:</Text>
                      <Text className="font-bold text-lg" style={{ color: colors.primary }}>
                        {checkInResult.seatNumber}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm" style={{ color: colors.mutedText }}>Route:</Text>
                      <Text className="font-medium" style={{ color: colors.text }}>
                        {checkInResult.boardingStop} → {checkInResult.alightingStop}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bus Info Card */}
                <View className="w-full rounded-xl p-4 border"
                  style={{ borderColor: colors.border, backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }}
                >
                  <View className="flex-row items-center mb-3">
                    <Bus size={20} color={colors.primary} />
                    <Text className="font-semibold ml-2" style={{ color: colors.text }}>
                      Bus Information
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm" style={{ color: colors.mutedText }}>Bus Number:</Text>
                    <Text className="font-medium" style={{ color: colors.text }}>
                      {checkInResult.bus.busNumber}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-sm" style={{ color: colors.mutedText }}>Passengers Aboard:</Text>
                    <Text className="font-bold" style={{ color: colors.primary }}>
                      {checkInResult.bus.passengersAboard}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                onPress={closeModal}
                className="flex-1 py-4 rounded-xl items-center border"
                style={{ borderColor: colors.border }}
              >
                <Text
                  className="font-semibold"
                  style={{ color: colors.text }}
                >
                  Close
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  closeModal()
                  setScanned(false)
                }}
                className="flex-1 py-4 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-semibold">
                  Scan Next Ticket
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isVerifying && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-6 items-center">
            <View className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-3" />
            <Text className="text-gray-900 dark:text-white font-semibold">
              Verifying Ticket...
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}