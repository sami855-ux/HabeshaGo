import { FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { Camera, CameraView } from "expo-camera"
// import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import {
  Alert,
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const QRScannerScreen = () => {
  // //   const router = useRouter()
  const [hasPermission, setHasPermission] = useState(null)
  const [scanned, setScanned] = useState(false)
  const [walletBalance, setWalletBalance] = useState(245.75)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const scanLineAnim = useState(new Animated.Value(0))[0]

  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    })()
  }, [])

  // Animated scan line
  useEffect(() => {
    const animateScanLine = () => {
      scanLineAnim.setValue(0)
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => animateScanLine())
    }
    animateScanLine()
  }, [])

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true)
    Alert.alert("QR Code Scanned Successfully!", `Payment Code: ${data}`, [
      {
        text: "Scan Again",
        onPress: () => setScanned(false),
      },
      {
        text: "Done",
        // onPress: () => router.back(),
        style: "cancel",
      },
    ])
  }

  const handleTopUp = () => {
    Alert.alert("Top Up Wallet", "Choose your payment method", [
      {
        text: "Credit Card",
        onPress: () => console.log("Credit card selected"),
      },
      {
        text: "Bank Transfer",
        onPress: () => console.log("Bank transfer selected"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ])
  }

  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn)
  }

  if (hasPermission === null) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <View className="items-center">
          <MaterialIcons name="qr-code-scanner" size={64} color="#ea580c" />
          <Text className="text-gray-900 text-lg font-semibold mt-4">
            Requesting Camera Access
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            Please allow camera permissions to scan QR codes
          </Text>
        </View>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <View className="items-center">
          <MaterialIcons name="no-photography" size={64} color="#dc2626" />
          <Text className="text-gray-900 text-xl font-bold mt-4 text-center">
            Camera Access Required
          </Text>
          <Text className="text-gray-600 text-center mt-2 leading-6">
            To scan QR codes, please enable camera permissions in your device
            settings
          </Text>
          <TouchableOpacity
            className="bg-orange-500 px-8 py-4 rounded-xl mt-6 flex-row items-center"
            // onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 260],
  })

  return (
    <View className="flex-1 bg-white">
      {/* Enhanced Header */}
      <View className="pt-12 px-6 pb-4 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            // onPress={() => router.back()}
            className="p-3 bg-gray-100 rounded-xl"
          >
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-gray-900 text-xl font-bold">
              Scan QR Code
            </Text>
            <Text className="text-gray-600 text-sm">
              Point camera at the QR code
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleFlash}
            className="p-3 bg-gray-100 rounded-xl"
          >
            <MaterialIcons
              name={isFlashOn ? "flash-on" : "flash-off"}
              size={24}
              color="#374151"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Camera View with White Theme */}
      <View className="flex-1 justify-center bg-gray-50">
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          style={{ flex: 1 }}
          flash={isFlashOn ? "on" : "off"}
        >
          <View className="flex-1 justify-center items-center bg-black/20">
            {/* Rounded Scanner Frame */}
            <View className="relative">
              {/* Main Rounded Frame */}
              <View className="w-72 h-72 rounded-3xl border-4 border-white/80 bg-transparent overflow-hidden">
                {/* Animated Scan Line */}
                <Animated.View
                  style={{
                    transform: [{ translateY: scanLineTranslate }],
                  }}
                  className="absolute left-4 right-4 h-1 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"
                />
              </View>

              {/* Corner Accents */}
              <View className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl" />
              <View className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl" />
              <View className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-2xl" />
              <View className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-2xl" />

              {/* Center Guide */}
              <View className="absolute inset-0 justify-center items-center">
                <MaterialIcons
                  name="qr-code-2"
                  size={40}
                  color="white"
                  opacity={0.4}
                />
              </View>
            </View>

            {/* Instructions */}
            <View className="absolute bottom-20 items-center px-8">
              <Text className="text-white text-lg font-semibold text-center mb-2">
                Align QR Code within Frame
              </Text>
              <Text className="text-gray-200 text-center text-sm leading-5">
                Position the QR code in the center to scan automatically
              </Text>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Enhanced Bottom Wallet Section - White Theme */}
      <View className="bg-white p-6 border-t border-gray-200 shadow-lg">
        <View className="flex-row justify-between items-center mb-4">
          {/* Wallet Balance with White Theme */}
          <View className="flex-1">
            <Text className="text-gray-600 text-sm font-medium mb-1">
              CURRENT BALANCE
            </Text>
            <View className="flex-row items-center">
              <View className="bg-orange-100 p-2 rounded-lg">
                <FontAwesome5 name="wallet" size={20} color="#ea580c" />
              </View>
              <View className="ml-3">
                <Text className="text-gray-900 text-2xl font-bold">
                  ${walletBalance.toFixed(2)}
                </Text>
                <Text className="text-green-600 text-xs font-medium">
                  ● Sufficient funds
                </Text>
              </View>
            </View>
          </View>

          {/* Top Up Button */}
          <TouchableOpacity
            className="bg-orange-500 px-6 py-4 rounded-xl flex-row items-center shadow-lg shadow-orange-500/25"
            onPress={handleTopUp}
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Top Up</Text>
          </TouchableOpacity>
        </View>

        {/* Scan Again Button */}
        {scanned && (
          <TouchableOpacity
            className="bg-gray-900 py-4 rounded-xl items-center shadow-lg mb-2"
            onPress={() => setScanned(false)}
          >
            <Text className="text-white font-bold text-base">
              Scan Another Code
            </Text>
          </TouchableOpacity>
        )}

        {/* Help Text */}
        {!scanned && (
          <Text className="text-gray-500 text-center text-xs mt-2">
            Scan bus tickets, charging station codes, or payment QR codes
          </Text>
        )}
      </View>
    </View>
  )
}

export default QRScannerScreen
