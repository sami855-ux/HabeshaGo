import { useThemeContext } from "@/context/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { CheckCircle, QrCode, User, X } from "lucide-react-native"
import { useState } from "react"
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

export default function DriverQRScanner() {
  const router = useRouter()
  const { colors } = useThemeContext()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<"front" | "back">("back")

  if (!permission) {
    return <View />
  }

  if (!permission.granted) {
    return (
      <LinearGradient colors={["#1E3A8A", "#3B82F6"]} style={styles.center}>
        <View className="items-center p-8">
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <QrCode size={48} color="#FFFFFF" />
          </View>
          <Text className="text-white text-2xl font-bold mb-3 text-center font-groteskBold">
            Camera Access Required
          </Text>
          <Text className="text-white/80 text-center mb-8 font-geist">
            To scan passenger tickets and verify bookings, we need access to
            your camera.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="px-8 py-4 rounded-xl items-center"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <Text className="text-[#1E3A8A] font-semibold text-base font-geist">
              Grant Camera Permission
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    )
  }

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned) return

    setScanned(true)
    setScannedData(data)
    setShowResultModal(true)

    // Play sound or vibration here
    // Vibration.vibrate(200);

    // Simulate API call to verify ticket
    console.log("QR DATA:", data)

    // Reset scanner after 2 seconds
    setTimeout(() => {
      setScanned(false)
    }, 2000)
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
  }

  const verifyTicket = () => {
    // In real app, this would be an API call
    Alert.alert(
      "✅ Ticket Verified",
      "Passenger boarding confirmed successfully!",
      [{ text: "OK", onPress: closeModal }]
    )
  }

  const rejectTicket = () => {
    Alert.alert(
      "❌ Ticket Rejected",
      "This ticket is invalid or already used.",
      [{ text: "OK", onPress: closeModal }]
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417", "ean13", "upc_e"],
        }}
        onBarcodeScanned={handleBarCodeScanned}
        facing={cameraFacing}
        enableTorch={torchOn}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <LinearGradient
          colors={["rgba(0,0,0,0.8)", "transparent"]}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text className="text-white text-xl font-bold font-groteskBold">
            Scan Ticket
          </Text>

          <TouchableOpacity
            onPress={toggleTorch}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <Ionicons
              name={torchOn ? "flash-off" : "flash"}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </LinearGradient>

        {/* Scanning Frame */}
        <View style={styles.scanArea}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />

          <View className="absolute top-[-40] items-center">
            <Text className="text-white text-lg font-semibold font-geist">
              Align QR Code Inside Frame
            </Text>
            <Text className="text-white/70 text-sm mt-1 font-geist">
              Scan passenger tickets for verification
            </Text>
          </View>

          {/* Scanning Animation */}
          <View style={styles.scanLine} />
        </View>

        {/* Footer Controls */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.footer}
        >
          <TouchableOpacity
            onPress={toggleCameraFacing}
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <Ionicons name="camera-reverse" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-white text-sm font-geist">Scan Count: 0</Text>
            <Text className="text-white/70 text-xs mt-1 font-geist">
              Tap to scan manually
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setScanned(true)} // Manual scan trigger
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
                className="text-xl font-bold font-groteskBold"
                style={{ color: colors.text }}
              >
                Ticket Verification
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color={colors.mutedText} />
              </TouchableOpacity>
            </View>

            {scannedData && (
              <View className="items-center mb-6">
                <View
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: colors.primary + "15" }}
                >
                  <CheckCircle size={40} color={colors.primary} />
                </View>

                <Text
                  className="text-lg font-semibold text-center mb-2 font-geist"
                  style={{ color: colors.text }}
                >
                  Ticket Scanned Successfully
                </Text>

                <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 w-full mb-4">
                  <Text
                    className="text-sm font-geist mb-2"
                    style={{ color: colors.mutedText }}
                  >
                    Scanned Data:
                  </Text>
                  <Text
                    className="font-mono text-sm font-geist"
                    style={{ color: colors.text }}
                  >
                    {scannedData.substring(0, 50)}...
                  </Text>
                </View>

                {/* Ticket Info (Mock) */}
                <View className="w-full mb-6">
                  <View className="flex-row items-center mb-3">
                    <User size={18} color={colors.primary} />
                    <Text
                      className="font-semibold ml-2 font-geist"
                      style={{ color: colors.text }}
                    >
                      Passenger Details
                    </Text>
                  </View>
                  <View className="space-y-2">
                    <View className="flex-row justify-between">
                      <Text
                        className="font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Name:
                      </Text>
                      <Text
                        className="font-medium font-geist"
                        style={{ color: colors.text }}
                      >
                        Yohannes Tesfaye
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text
                        className="font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Seat:
                      </Text>
                      <Text
                        className="font-medium font-geist"
                        style={{ color: colors.text }}
                      >
                        A12
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text
                        className="font-geist"
                        style={{ color: colors.mutedText }}
                      >
                        Bus:
                      </Text>
                      <Text
                        className="font-medium font-geist"
                        style={{ color: colors.text }}
                      >
                        ETH-1223
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={rejectTicket}
                className="flex-1 py-4 rounded-xl items-center border"
                style={{ borderColor: colors.border }}
              >
                <Text
                  className="font-semibold font-geist"
                  style={{ color: colors.text }}
                >
                  Reject
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={verifyTicket}
                className="flex-1 py-4 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-semibold font-geist">
                  Verify & Board
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scanArea: {
    position: "absolute",
    top: "40%",
    left: "10%",
    width: "80%",
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#3B82F6",
    borderRadius: 8,
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#3B82F6",
    borderRadius: 8,
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#3B82F6",
    borderRadius: 8,
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#3B82F6",
    borderRadius: 8,
  },
  scanLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#3B82F6",
    position: "absolute",
    top: 0,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    transform: [{ translateY: 0 }],
    animation: "scanAnimation 2s ease-in-out infinite",
  },
})
