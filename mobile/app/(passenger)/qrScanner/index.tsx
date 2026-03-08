import { useThemeContext } from "@/context/ThemeContext"
import { MaterialIcons } from "@expo/vector-icons"
import { CameraView, useCameraPermissions } from "expo-camera"
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
  const { colors, actualTheme } = useThemeContext()
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

  const handleBarCodeScanned = ({ data }: { data: string }) => {
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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.text }}>
          Requesting camera permission...
        </Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          backgroundColor: colors.background,
        }}
      >
        <MaterialIcons name="no-photography" size={80} color={colors.error} />
        <Text
          style={{
            color: colors.text,
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            marginTop: 16,
          }}
        >
          Camera Access Required
        </Text>
        <Text
          style={{
            color: colors.mutedText,
            textAlign: "center",
            marginTop: 8,
            lineHeight: 22,
          }}
        >
          Please enable camera in Settings to scan QR codes
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 16,
            marginTop: 16,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Allow Camera
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280],
  })

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={actualTheme === "dark" ? "light-content" : "dark-content"}
      />

      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        torch={isFlashOn ? "on" : "off"}
      >
        <View style={{ flex: 1 }}>
          {/* Top Bar */}
          <View
            style={{
              paddingTop: 48,
              paddingHorizontal: 16,
              paddingBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  padding: 8,
                  borderRadius: 16,
                  backgroundColor:
                    actualTheme === "dark" ? "#33333380" : "#ffffff80",
                }}
              >
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>

              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                >
                  Scan QR
                </Text>
                <Text style={{ color: colors.mutedText, fontSize: 14 }}>
                  Align code in frame
                </Text>
              </View>

              <TouchableOpacity
                onPress={toggleFlash}
                style={{
                  padding: 8,
                  borderRadius: 16,
                  backgroundColor:
                    actualTheme === "dark" ? "#33333380" : "#ffffff80",
                }}
              >
                <MaterialIcons
                  name={isFlashOn ? "flash-on" : "flash-off"}
                  size={28}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scanner Frame */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 32,
            }}
          >
            <View style={{ position: "relative" }}>
              <View
                style={{
                  width: 288,
                  height: 288,
                  borderRadius: 24,
                  overflow: "hidden",
                }}
              >
                <Animated.View
                  style={{
                    transform: [{ translateY: scanLineTranslate }],
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>

              {/* Corner Brackets */}
              {[
                { top: 0, left: 0 },
                { top: 0, right: 0 },
                { bottom: 0, left: 0 },
                { bottom: 0, right: 0 },
              ].map((pos, i) => (
                <View
                  key={i}
                  style={{
                    position: "absolute",
                    width: 32,
                    height: 32,
                    borderColor: colors.primary,
                    borderWidth: 4,
                    borderTopLeftRadius: i === 0 ? 24 : 0,
                    borderTopRightRadius: i === 1 ? 24 : 0,
                    borderBottomLeftRadius: i === 2 ? 24 : 0,
                    borderBottomRightRadius: i === 3 ? 24 : 0,
                    top: pos.top,
                    left: pos.left,
                    right: pos.right,
                    bottom: pos.bottom,
                  }}
                />
              ))}
            </View>

            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 24,
                textAlign: "center",
              }}
            >
              Point camera at QR code
            </Text>
          </View>

          {/* Bottom Wallet Card */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: colors.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 16,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{
                    color: colors.mutedText,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  Wallet Balance
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 28,
                    marginTop: 4,
                  }}
                  className="font-groteskBold"
                >
                  ETB 245.75
                </Text>
                <Text
                  style={{ color: "#34C759", fontSize: 14, paddingTop: 4 }}
                  className="font-groteskBold"
                >
                  ● Sufficient funds
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text
                  style={{ color: "#fff", marginLeft: 4 }}
                  className="font-groteskBold"
                >
                  Top Up
                </Text>
              </TouchableOpacity>
            </View>

            {scanned && (
              <TouchableOpacity
                onPress={() => setScanned(false)}
                style={{
                  marginTop: 12,
                  backgroundColor: colors.primary + "20",
                  paddingVertical: 12,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
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
