import { FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { CameraView, useCameraPermissions } from "expo-camera" // New API
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import {
  Alert,
  Animated,
  Easing,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const QRScannerScreen = () => {
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const scanLineAnim = useState(new Animated.Value(0))[0]

  // Animated scan line loop
  useEffect(() => {
    const animate = () => {
      scanLineAnim.setValue(0)
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => animate())
    }
    animate()
  }, [])

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true)
    Alert.alert("QR Scanned!", `Code: ${data}`, [
      { text: "Scan Again", onPress: () => setScanned(false) },
      { text: "Done", style: "cancel" },
    ])
  }

  const toggleFlash = () => {
    setIsFlashOn((prev) => !prev)
  }

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-700">Requesting camera permission...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-8">
        <MaterialIcons name="no-photography" size={80} color="#dc2626" />
        <Text className="text-2xl font-groteskBold text-center mt-6 text-gray-900">
          Camera Access Required
        </Text>
        <Text className="text-gray-600 text-center mt-4 leading-6">
          Please enable camera in Settings to scan QR codes
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-orange-500 px-8 py-4 rounded-xl mt-8"
        >
          <Text className="text-white font-bold">Allow Camera</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280],
  })

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Camera View - Flashlight Fixed Here */}
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        torch={isFlashOn ? "on" : "off"} // This is the correct way in 2025
      >
        {/* Overlay UI */}
        <View className="flex-1">
          {/* Top Bar */}
          <View className="pt-12 px-6 pb-4 bg-gradient-to-b from-black/60 to-transparent">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-3 bg-white/20 backdrop-blur-xl rounded-xl"
              >
                <MaterialIcons name="close" size={24} color="white" />
              </TouchableOpacity>

              <View className="items-center">
                <Text className="text-white text-xl font-groteskBold">
                  Scan QR
                </Text>
                <Text className="text-white/80 text-sm">
                  Align code in frame
                </Text>
              </View>

              <TouchableOpacity
                onPress={toggleFlash}
                className="p-3 bg-white/20 backdrop-blur-xl rounded-xl"
              >
                <MaterialIcons
                  name={isFlashOn ? "flash-on" : "flash-off"}
                  size={28}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scanner Frame */}
          <View className="flex-1 justify-center items-center px-8">
            <View className="relative">
              <View className="w-72 h-72 rounded-3xl overflow-hidden ">
                <Animated.View
                  style={{
                    transform: [{ translateY: scanLineTranslate }],
                  }}
                  className="absolute left-0 right-0 h-1 bg-orange-500 shadow-lg shadow-orange-500"
                />
              </View>

              {/* Corner Brackets */}
              {[
                "top-0 left-0 border-t-8 border-l-8 rounded-tl-3xl",
                "top-0 right-0 border-t-8 border-r-8 rounded-tr-3xl",
                "bottom-0 left-0 border-b-8 border-l-8 rounded-bl-3xl",
                "bottom-0 right-0 border-b-8 border-r-8 rounded-br-3xl",
              ].map((style, i) => (
                <View
                  key={i}
                  className={`absolute w-16 h-16 border-orange-500 ${style}`}
                />
              ))}
            </View>

            <Text className="text-white text-lg font-groteskBold mt-8 text-center">
              Point camera at QR code
            </Text>
          </View>

          {/* Bottom Wallet Card */}
          <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-600 text-sm font-medium">
                  Wallet Balance
                </Text>
                <Text className="text-3xl font-groteskBold text-gray-900 mt-1">
                  ETB 245.75
                </Text>
                <Text className="text-green-700 pt-2 text-sm">
                  ● Sufficient funds
                </Text>
              </View>
              <TouchableOpacity className="bg-orange-500 px-6 py-3 rounded-xl flex-row items-center">
                <MaterialIcons name="add" size={20} color="white" />
                <Text className="text-white font-bold ml-1">Top Up</Text>
              </TouchableOpacity>
            </View>

            {scanned && (
              <TouchableOpacity
                onPress={() => setScanned(false)}
                className="mt-4 bg-gray-900 py-4 rounded-xl"
              >
                <Text className="text-white text-center font-bold">
                  Scan Again
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  )
}

export default QRScannerScreen
