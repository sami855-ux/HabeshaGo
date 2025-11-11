import { AntDesign, Ionicons } from "@expo/vector-icons"
import * as WebBrowser from "expo-web-browser"
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Heart,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Sparkles,
  Train,
  TrendingUp,
  Zap,
} from "lucide-react-native"
import { useEffect, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import GoogleIcon from "./utils/GoogleIcon"

WebBrowser.maybeCompleteAuthSession()

const { width, height } = Dimensions.get("window")

// Animated Icon Component
const AnimatedIcon = ({ Icon, color, delay = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
    ]).start()
  }, [])

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }, { rotate }],
      }}
    >
      <Icon size={60} color={color} strokeWidth={1.5} />
    </Animated.View>
  )
}

// Floating Element with Animation
const FloatingElement = ({ Icon, color, delay, position }) => {
  const translateY = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: -20,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ),
    ]).start()
  }, [])

  return (
    <Animated.View
      className={`absolute ${position}`}
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View
        className="w-14 h-14 border border-white rounded-3xl  items-center justify-center backdrop-blur-sm "
        style={{
          backgroundColor: color + "20",
          borderWidth: 1.5,
        }}
      >
        <Icon size={24} color={color} strokeWidth={1.5} />
      </View>
    </Animated.View>
  )
}

// Slide 1: Smart Navigation
const Slide1 = () => {
  return (
    <View
      className="w-full items-center justify-center px-8 bg-gradient-to-br from-blue-50 to-cyan-50"
      style={{ width, height: height * 0.78 }}
    >
      <FloatingElement
        Icon={MapPin}
        color="#00796B"
        delay={0}
        position="top-12 right-10"
      />
      <FloatingElement
        Icon={Navigation}
        color="#00796B"
        delay={300}
        position="bottom-24 left-8"
      />

      <View className="mb-8 bg-[#b9e9e3] w-24 h-24 rounded-[50px] flex justify-center items-center">
        <Ionicons name="compass" size={50} color={"#00796B"} />
      </View>

      <Text className="font-groteskBold text-4xl text-center text-[#00796B] mb-4 leading-tight">
        Smart Navigation
      </Text>

      <Text className="text-[17px] font-geist text-center text-[#095048] leading-7 max-w-sm">
        Discover optimal routes with AI-powered suggestions and live traffic
        intelligence
      </Text>

      <View
        className="mt-10 rounded-3xl p-3 border border-[#cffaf5] backdrop-blur-sm"
        style={{ backgroundColor: "rgba(59, 130, 246, 0.08)" }}
      >
        <Text className="text-sm font-geist text-[#00796B] text-center font-medium">
          Advanced AI algorithms power every route
        </Text>
      </View>
    </View>
  )
}

// Slide 2: Lightning Fast
const Slide2 = () => {
  return (
    <View
      className="w-full items-center justify-center px-8 bg-gradient-to-br from-purple-50 to-pink-50"
      style={{ width, height: height * 0.78 }}
    >
      <FloatingElement
        Icon={Zap}
        color="#A855F7"
        delay={0}
        position="top-16 right-12"
      />
      <FloatingElement
        Icon={TrendingUp}
        color="#EC4899"
        delay={300}
        position="bottom-16 left-10"
      />

      <View className="mb-8 bg-purple-200 w-24 h-24 rounded-full flex justify-center items-center">
        <Ionicons
          name="speedometer"
          size={50}
          color={"#c749f8"}
          className="text-[#c749f8]"
        />
      </View>

      <Text className="font-groteskBold text-4xl text-center text-purple-950 mb-4 leading-tight">
        Lightning Fast
      </Text>

      <Text className="text-lg font-geist text-center text-purple-800 leading-7 max-w-sm">
        Get real-time updates and instant booking confirmations for stress-free
        travel
      </Text>

      <View
        className="mt-10 rounded-3xl p-3 border border-purple-200 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(139, 92, 246, 0.08)" }}
      >
        <Text className="text-sm font-geist text-purple-800 text-center font-medium">
          Real-time tracking & instant confirmations
        </Text>
      </View>
    </View>
  )
}

// Slide 3: Best Value
const Slide3 = () => {
  return (
    <View
      className="w-full items-center justify-center px-8 bg-gradient-to-br from-emerald-50 to-green-50"
      style={{ width, height: height * 0.78 }}
    >
      <FloatingElement
        Icon={DollarSign}
        color="#10B981"
        delay={0}
        position="top-20 left-12"
      />
      <FloatingElement
        Icon={TrendingUp}
        color="#059669"
        delay={300}
        position="bottom-32 right-10"
      />

      <View className="mb-8 bg-[#a5f3e2] w-24 h-24 rounded-[50px] flex justify-center items-center">
        <Ionicons
          name="ribbon-outline"
          size={50}
          color={"#1d7e69"}
          className="text-[#a5f3e2]"
        />
      </View>

      <Text className="font-semibold font-groteskBold text-4xl text-center text-emerald-950 mb-4 leading-tight">
        Best Value
      </Text>

      <Text className="text-lg font-geist text-center text-emerald-800 leading-7 max-w-sm">
        Compare prices across all providers and save up to 40% on your daily
        commute
      </Text>

      <View
        className="mt-10 rounded-3xl p-3 border border-emerald-200 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(16, 185, 129, 0.08)" }}
      >
        <Text className="text-sm font-geist text-emerald-800 text-center font-medium">
          Save up to 40% on every journey
        </Text>
      </View>
    </View>
  )
}

// Slide 4: Loved by Thousands
const Slide4 = () => {
  return (
    <View
      className="w-full items-center justify-center px-8 bg-gradient-to-br from-rose-50 to-red-50"
      style={{ width, height: height * 0.78 }}
    >
      <FloatingElement
        Icon={Heart}
        color="#F43F5E"
        delay={0}
        position="top-24 right-14"
      />
      <FloatingElement
        Icon={Sparkles}
        color="#FB7185"
        delay={300}
        position="bottom-28 left-12"
      />

      <View className="mb-8 bg-[#f0d3c2] w-24 h-24 rounded-[50px] flex justify-center items-center">
        <Ionicons
          name="heart-outline"
          size={50}
          color={"#ee6d22"}
          className="text-[#f3b38e]"
        />
      </View>

      <Text className="font-semibold font-groteskBold text-4xl text-center text-rose-950 mb-4 leading-tight">
        Loved by Thousands
      </Text>

      <Text className="text-lg text-center font-geist text-rose-800 leading-7 max-w-sm">
        Join our community of happy travelers enjoying seamless transportation
        experiences
      </Text>

      <View
        className="mt-10 rounded-3xl p-3 border border-rose-200 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(244, 63, 94, 0.08)" }}
      >
        <Text className="text-sm font-geist text-rose-800 text-center font-medium">
          Trusted by over 100,000 happy users
        </Text>
      </View>
    </View>
  )
}

// Slide 5: Auth Slide
const LoginSlide = ({ onPhonePress, isActive = true }) => {
  const fadeInAnim = useRef(new Animated.Value(0)).current
  const slideUpAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const backgroundImageOpacity = useRef(new Animated.Value(0)).current
  const slideInAnim = useRef(new Animated.Value(width)).current

  const router = useRouter()

  useEffect(() => {
    if (isActive) {
      // Mount animation - slide in from right and fade in
      Animated.parallel([
        Animated.timing(slideInAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeInAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundImageOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      // Unmount animation - slide out to left and fade out
      Animated.parallel([
        Animated.timing(slideInAnim, {
          toValue: -width,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeInAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundImageOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [
    isActive,
    fadeInAnim,
    slideUpAnim,
    scaleAnim,
    backgroundImageOpacity,
    slideInAnim,
  ])

  const contentStyle = {
    opacity: fadeInAnim,
    transform: [{ translateY: slideUpAnim }, { scale: scaleAnim }],
  }

  const backgroundStyle = {
    opacity: backgroundImageOpacity,
    transform: [{ translateX: slideInAnim }],
  }

  const containerStyle = {
    transform: [{ translateX: slideInAnim }],
  }

  return (
    <Animated.View style={[{ width, height, flex: 1 }, containerStyle]}>
      {/* Background Image */}
      <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80",
          }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          {/* Gradient Overlay */}
          <LinearGradient
            colors={[
              "rgba(234, 88, 12, 0.85)",
              "rgba(249, 115, 22, 0.75)",
              "rgba(251, 146, 60, 0.85)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
      </Animated.View>

      {/* Content */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 32,
          paddingBottom: 48,
        }}
      >
        <Animated.View style={contentStyle} className="items-center">
          {/* Logo Section */}
          <View className="mb-12 items-center relative">
            <View className="w-24 h-24 bg-white/20 rounded-3xl items-center justify-center mb-6 border-2 border-white/30 shadow-2xl">
              <Train size={48} color="white" strokeWidth={2} />
            </View>
            <View className="absolute top-0 right-0 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg">
              <Sparkles size={14} color="#ea580c" strokeWidth={2.5} />
            </View>
          </View>

          {/* Title Section */}
          <View className="mb-8 items-center">
            <Text className="text-5xl font-groteskBold text-center text-white mb-4 leading-tight">
              Welcome to
            </Text>
            <Text className="text-5xl font-groteskBold text-center text-white mb-4 leading-tight">
              Addis Pulse
            </Text>
            <Text className="text-lg font-geist text-center text-white/90 leading-6 max-w-sm">
              Your smart transportation companion for seamless journeys across
              the city
            </Text>
          </View>

          {/* Auth Buttons */}
          <View className="w-full gap-4">
            {/* Phone Button */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/phone/")}
              activeOpacity={0.9}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={["#ffffff", "#f8f9fa"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl p-1"
              >
                <View className="bg-white rounded-2xl px-6 py-4 flex-row items-center justify-center">
                  <View className="w-10 h-10 bg-[#ea580c]/10 rounded-xl items-center justify-center mr-4">
                    <Phone size={20} color="#ea580c" />
                  </View>
                  <Text className="font-groteskBold text-lg text-gray-900 flex-1">
                    Continue with Phone
                  </Text>
                  <ChevronRight size={20} color="#6B7280" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Email Button */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/email/")}
              activeOpacity={0.9}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={["#ffffff", "#f8f9fa"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl p-1"
              >
                <View className="bg-white rounded-2xl px-6 py-4 flex-row items-center justify-center">
                  <View className="w-10 h-10 bg-[#f97316]/10 rounded-xl items-center justify-center mr-4">
                    <Mail size={20} color="#f97316" />
                  </View>
                  <Text className="font-groteskBold text-lg text-gray-900 flex-1">
                    Continue with Email
                  </Text>
                  <ChevronRight size={20} color="#6B7280" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-8 w-full">
            <View className="flex-1 h-px bg-white/30" />
            <Text className="mx-4 font-geist text-white/80 text-sm">
              or continue with
            </Text>
            <View className="flex-1 h-px bg-white/30" />
          </View>

          {/* Social Login Buttons */}
          <View className="w-full flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              className="flex-1 h-14 rounded-2xl overflow-hidden"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <BlurView
                intensity={80}
                tint="light"
                className="flex-1 rounded-2xl"
              >
                <View className="flex-1 bg-white/95 border border-white/50 items-center justify-center rounded-2xl">
                  <GoogleIcon />
                </View>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              className="flex-1 h-14 rounded-2xl overflow-hidden"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <BlurView
                intensity={80}
                tint="light"
                className="flex-1 rounded-2xl"
              >
                <View className="flex-1 bg-white/95 border border-white/50 items-center justify-center rounded-2xl">
                  <AntDesign name="apple" size={24} color="#000" />
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  )
}

// Navigation Arrows
const NavigationArrows = ({ currentIndex, totalSlides, onPrev, onNext }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePress = (callback) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
    callback()
  }

  return (
    <>
      {currentIndex > 0 && (
        <TouchableOpacity
          className="absolute left-4 bottom-0 -translate-y-6 z-10 w-14 h-14 bg-white/90 rounded-2xl items-center justify-center shadow-2xl border border-white/80"
          onPress={() => handlePress(onPrev)}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <ChevronLeft size={28} color="#1F2937" strokeWidth={2} />
          </Animated.View>
        </TouchableOpacity>
      )}

      {currentIndex < totalSlides - 1 && (
        <TouchableOpacity
          className="absolute right-4 bottom-0 -translate-y-6 z-10 w-14 h-14 bg-white/90 rounded-2xl items-center justify-center shadow-2xl border border-white/80"
          onPress={() => handlePress(onNext)}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <ChevronRight size={28} color="#1F2937" strokeWidth={2} />
          </Animated.View>
        </TouchableOpacity>
      )}
    </>
  )
}

// Pagination Dots
const PaginationDots = ({ scrollX, totalSlides }) => {
  const renderDot = (index) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]

    const dotWidth = scrollX.interpolate({
      inputRange,
      outputRange: [6, 24, 6],
      extrapolate: "clamp",
    })

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: "clamp",
    })

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1.2, 0.8],
      extrapolate: "clamp",
    })

    return (
      <Animated.View
        key={index}
        className="h-1.5 bg-gray-800 rounded-full mx-1"
        style={{
          width: dotWidth,
          opacity,
          transform: [{ scale }],
        }}
      />
    )
  }

  return (
    <View className="flex-row justify-center items-center mt-8 mb-6">
      {Array.from({ length: totalSlides }).map((_, index) => renderDot(index))}
    </View>
  )
}

// Main Component
export default function Welcome() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollX = useRef(new Animated.Value(0)).current
  const flatListRef = useRef(null)

  const slideComponents = [Slide1, Slide2, Slide3, Slide4, LoginSlide]
  const allSlides = slideComponents.map((_, index) => ({
    id: String(index + 1),
  }))

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  )

  const onMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const newIndex = Math.round(offsetX / width)
    if (newIndex >= 0 && newIndex < allSlides.length) {
      setCurrentIndex(newIndex)
    }
  }

  const scrollTo = (index) => {
    if (flatListRef.current && index >= 0 && index < allSlides.length) {
      flatListRef.current.scrollToIndex({ index, animated: true })
    }
  }

  const nextSlide = () => {
    if (currentIndex < allSlides.length - 1) {
      scrollTo(currentIndex + 1)
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      scrollTo(currentIndex - 1)
    }
  }

  const goToAuth = () => {
    console.log("Navigate to phone auth")
  }

  const renderItem = ({ item, index }) => {
    const SlideComponent = slideComponents[index]
    const isLoginSlide = index === slideComponents.length - 1
    const isActive = currentIndex === index

    if (isLoginSlide) {
      return <SlideComponent onPhonePress={goToAuth} isActive={isActive} />
    }

    return (
      <View style={{ width, height: height * 0.78 }}>
        <SlideComponent />
      </View>
    )
  }

  const backgroundGradients = [
    "from-blue-50 to-cyan-50",
    "from-purple-50 to-pink-50",
    "from-emerald-50 to-green-50",
    "from-rose-50 to-red-50",
    "from-slate-900 to-black",
  ]

  const currentBackground =
    backgroundGradients[Math.min(currentIndex, backgroundGradients.length - 1)]

  const isLoginSlide = currentIndex === allSlides.length - 1

  return (
    <View className={`flex-1 bg-white`}>
      <View className="flex-1 justify-center items-center pt-10">
        <View
          style={{
            width: "100%",
            height: isLoginSlide ? height : height * 0.78,
            borderRadius: isLoginSlide ? 0 : 24,
            overflow: "hidden",
          }}
        >
          {/* <NavigationArrows
            currentIndex={currentIndex}
            totalSlides={allSlides.length}
            onPrev={prevSlide}
            onNext={nextSlide}
          /> */}

          <FlatList
            ref={flatListRef}
            data={allSlides}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            keyExtractor={(item) => item.id}
            onScroll={onScroll}
            onMomentumScrollEnd={onMomentumScrollEnd}
            scrollEventThrottle={16}
            onScrollToIndexFailed={() => {
              setTimeout(() => {
                if (flatListRef.current) {
                  flatListRef.current.scrollToIndex({
                    index: currentIndex,
                    animated: true,
                  })
                }
              }, 100)
            }}
          />

          {!isLoginSlide && (
            <PaginationDots scrollX={scrollX} totalSlides={allSlides.length} />
          )}
        </View>

        <View className="mt-8 px-8 w-full gap-4">
          <Text className="text-xs text-gray-600 text-center">
            By continuing, you agree to our Terms • Privacy • Policy
          </Text>
        </View>
      </View>
    </View>
  )
}
// ios:505583262465-b9b3cok4u4noumh31lj70qjvrn7t2jhp.apps.googleusercontent.com
