import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@react-navigation/native"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  Navigation,
  Phone,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react-native"
import { useEffect, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native"

const { width, height } = Dimensions.get("window")

// Slide 4: Trusted Community
const Slide4 = ({ isActive }) => {
  const { colors } = useTheme()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const userScale = useRef(new Animated.Value(0.5)).current
  const [displayCount, setDisplayCount] = useState("0")

  useEffect(() => {
    if (isActive) {
      // Use native driver for these animations
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start()

      Animated.spring(userScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start()

      // Manual count animation (can't use native driver)
      let currentCount = 0
      const targetCount = 100000
      const duration = 2000
      const steps = 60
      const increment = targetCount / steps

      const interval = setInterval(() => {
        currentCount += increment
        if (currentCount >= targetCount) {
          currentCount = targetCount
          clearInterval(interval)
        }
        setDisplayCount(Math.floor(currentCount).toLocaleString())
      }, duration / steps)

      return () => clearInterval(interval)
    } else {
      // Reset animations when slide is not active
      fadeAnim.setValue(0)
      userScale.setValue(0.5)
      setDisplayCount("0")
    }
  }, [isActive])

  return (
    <View className="flex-1 bg-gradient-to-b from-indigo-900 to-black">
      <View className="flex-1 px-6 py-10 justify-center">
        <Animated.View
          style={{
            opacity: fadeAnim,
            alignItems: "center",
            transform: [{ scale: userScale }],
          }}
        >
          <View className="w-40 h-40 items-center justify-center mb-10">
            <View className="w-32 h-32 rounded-3xl items-center justify-center bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 backdrop-blur-xl border border-indigo-500/20">
              <Users size={72} color="#6366F1" strokeWidth={1.5} />
            </View>

            <View className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center">
              <Text className="text-white font-bold text-xs">AP</Text>
            </View>
            <View className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 items-center justify-center">
              <Text className="text-white font-bold text-xs">MP</Text>
            </View>
            <View className="absolute -bottom-4 -left-6 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 items-center justify-center">
              <Text className="text-white font-bold text-xs">TD</Text>
            </View>
          </View>

          <View className="items-center mb-8">
            <Text className="text-white text-5xl font-extrabold text-center mb-6 tracking-tight">
              Trusted Community
            </Text>
            <Text className="text-white/90 text-lg text-center max-w-sm leading-relaxed font-medium mb-8">
              Join thousands of travelers who trust us for their daily commute
            </Text>

            <View className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 w-full max-w-xs">
              <View className="flex-row items-center justify-center gap-3 mb-3">
                <CheckCircle size={20} color="#10B981" />
                <Text className="text-white/70 text-sm">Active Users</Text>
              </View>
              <Text className="text-white text-4xl font-extrabold text-center">
                {displayCount}+
              </Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <View className="flex-row items-center justify-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons key={i} name="star" size={16} color="#FBBF24" />
                ))}
              </View>
              <Text className="text-white/70 text-xs text-center">
                4.8 Rating
              </Text>
            </View>
            <View className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <Text className="text-white font-bold text-center text-xl mb-1">
                98%
              </Text>
              <Text className="text-white/70 text-xs text-center">
                Satisfaction
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  )
}

// Slide 3: Best Value

const Slide3 = ({ isActive }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const slideInAnim = useRef(new Animated.Value(-50)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const [progressWidth, setProgressWidth] = useState("0%")

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(slideInAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start()

      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      )
      pulseLoop.start()

      // Progress animation
      const progressAnimation = Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: false,
      })

      progressAnimation.start(({ finished }) => {
        if (finished) {
          setProgressWidth("70%")
        }
      })

      const progressListener = progressAnim.addListener(({ value }) => {
        setProgressWidth(`${Math.round(value * 70)}%`)
      })

      return () => {
        pulseLoop.stop()
        progressAnim.removeListener(progressListener)
        progressAnimation.stop()
      }
    } else {
      scaleAnim.setValue(0.8)
      slideInAnim.setValue(-50)
      fadeAnim.setValue(0)
      pulseAnim.setValue(1)
      progressAnim.setValue(0)
      setProgressWidth("0%")
    }
  }, [isActive])

  return (
    <View style={{ flex: 1, backgroundColor: "#0c140c" }}>
      {/* Background Image - Money/Finance themed */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2020&auto=format&fit=crop",
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        placeholder="L5Hv~1M|%2t7?wIot7RjM{xuRjof"
        contentFit="cover"
        transition={300}
      />
      {/* Dark overlay */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(10,10,10,0.85)",
        }}
      />

      {/* Money particles effect */}
      <Animated.View
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {[...Array(15)].map((_, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              width: Math.random() * 12 + 4,
              height: Math.random() * 12 + 4,
              borderRadius: 4,
              backgroundColor: "rgba(34, 197, 94, 0.3)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: [{ rotate: `${Math.random() * 90}deg` }],
            }}
          />
        ))}
      </Animated.View>

      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingVertical: 40,
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateX: slideInAnim }],
            alignItems: "center",
          }}
        >
          {/* Icon Container */}
          <View
            style={{
              width: 192,
              height: 192,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 48,
            }}
          >
            {/* Outer glow */}
            <View
              style={{
                position: "absolute",
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: "rgba(34, 197, 94, 0.1)",
              }}
            />

            {/* Rings */}
            <View
              style={{
                position: "absolute",
                width: 192,
                height: 192,
                borderRadius: 96,
                borderWidth: 2,
                borderColor: "rgba(34, 197, 94, 0.3)",
              }}
            />
            <View
              style={{
                position: "absolute",
                width: 224,
                height: 224,
                borderRadius: 112,
                borderWidth: 1,
                borderColor: "rgba(34, 197, 94, 0.15)",
              }}
            />

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <View
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(34, 197, 94, 0.3)",
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                }}
              >
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#22c55e",
                    }}
                  >
                    {/* Choose one of these attractive icons */}
                    <TrendingUp size={44} color="white" strokeWidth={2} />
                    {/* <BadgePercent size={64} color="white" strokeWidth={2} /> */}
                    {/* <Tag size={64} color="white" strokeWidth={2} /> */}
                  </View>
                </Animated.View>
              </View>
            </Animated.View>

            {/* Percentage badge */}
            <Animated.View
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: 40,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#22c55e",
                shadowColor: "#22c55e",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 8,
                elevation: 8,
                transform: [{ scale: scaleAnim }],
              }}
            >
              <Text
                style={{ color: "white", fontSize: 20 }}
                className="font-groteskBold"
              >
                40%
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 10,
                  fontWeight: "600",
                }}
              >
                SAVE
              </Text>
            </Animated.View>

            {/* Sparkles */}
            <View
              style={{
                position: "absolute",
                top: -16,
                left: -16,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(34, 197, 94, 0.4)",
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: -16,
                right: -16,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "rgba(34, 197, 94, 0.3)",
              }}
            />
          </View>

          {/* Text Section */}
          <View style={{ alignItems: "center", marginBottom: 56 }}>
            <Text
              style={{
                color: "white",
                fontSize: 42,
                textAlign: "center",
                marginBottom: 24,
                letterSpacing: -1,
              }}
              className="font-groteskBold"
            >
              Best Value
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
                maxWidth: 360,
                lineHeight: 28,
              }}
              className="font-geist text-lg"
            >
              Smart price comparison across all providers to save you money
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.2)", // light green background
              borderRadius: 20,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "rgba(16, 185, 129, 0.4)", // slightly darker green border
            }}
          >
            <Text
              style={{
                color: "#10B981", // green text
                fontSize: 14,
                textAlign: "center",
              }}
              className="font-geist"
            >
              Best Value: Premium features at affordable prices
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  )
}

const Slide2 = ({ isActive }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const slideInAnim = useRef(new Animated.Value(50)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(slideInAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start()

      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      )
      pulseLoop.start()

      return () => {
        pulseLoop.stop()
      }
    } else {
      scaleAnim.setValue(0.8)
      slideInAnim.setValue(50)
      fadeAnim.setValue(0)
      pulseAnim.setValue(1)
    }
  }, [isActive])

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      {/* Background Image */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop",
        }}
        style={StyleSheet.absoluteFill}
        placeholder="LWI]8+_300000009F8_3D%9F-;"
        contentFit="cover"
        transition={300}
      />

      {/* Dark overlay */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(10,10,10,0.85)",
        }}
      />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingVertical: 40,
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideInAnim }],
            alignItems: "center",
          }}
        >
          {/* Logo Container */}
          <View
            style={{
              width: 192,
              height: 192,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 48,
            }}
          >
            {/* Outer glow */}
            <View
              style={{
                position: "absolute",
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: "rgba(245, 158, 11, 0.1)",
              }}
            />

            {/* Rings */}
            <View
              style={{
                position: "absolute",
                width: 192,
                height: 192,
                borderRadius: 96,
                borderWidth: 2,
                borderColor: "rgba(245, 158, 11, 0.3)",
              }}
            />
            <View
              style={{
                position: "absolute",
                width: 224,
                height: 224,
                borderRadius: 112,
                borderWidth: 1,
                borderColor: "rgba(245, 158, 11, 0.15)",
              }}
            />

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <View
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(245, 158, 11, 0.3)",
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                }}
              >
                <Animated.View>
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f59e0b",
                    }}
                  >
                    <Zap size={44} color="white" strokeWidth={2} />
                  </View>
                </Animated.View>
              </View>
            </Animated.View>

            {/* Sparkles */}
            <View
              style={{
                position: "absolute",
                top: -16,
                right: -16,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(245, 158, 11, 0.4)",
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: -16,
                left: -16,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "rgba(245, 158, 11, 0.3)",
              }}
            />
          </View>

          {/* Text Section */}
          <View style={{ alignItems: "center", marginBottom: 56 }}>
            <Text
              style={{
                color: "white",
                fontSize: 42,
                textAlign: "center",
                marginBottom: 24,
                letterSpacing: -1,
              }}
              className="font-groteskBold"
            >
              Lightning Fast
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
                maxWidth: 360,
                lineHeight: 28,
                fontWeight: "500",
              }}
              className="font-geist text-lg"
            >
              Instant bookings and real-time tracking for stress-free travel
            </Text>
          </View>

          {/* Stats Cards */}

          {/* Badge */}
          <View
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              borderRadius: 20,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "rgba(245, 158, 11, 0.2)",
            }}
          >
            <Text
              style={{
                color: "#fbbf24",
                fontSize: 14,
                textAlign: "center",
              }}
              className="font-geist"
            >
              3x faster than traditional apps
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  )
}

// Slide 1: Smart Navigation
const Slide1 = ({ isActive }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const iconScale = useRef(new Animated.Value(0.8)).current
  const featuresOpacity = useRef(new Animated.Value(0)).current
  const cardTranslate = useRef(new Animated.Value(20)).current

  useEffect(() => {
    if (isActive) {
      // All animations use native driver
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(featuresOpacity, {
          toValue: 1,
          duration: 800,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslate, {
          toValue: 0,
          duration: 700,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      // Reset animations
      fadeAnim.setValue(0)
      slideAnim.setValue(30)
      iconScale.setValue(0.8)
      featuresOpacity.setValue(0)
      cardTranslate.setValue(20)
    }
  }, [isActive])

  return (
    <View className="flex-1">
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop",
        }}
        style={StyleSheet.absoluteFill}
        placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
        contentFit="cover"
        transition={300}
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        className="flex-1 px-6 py-10 justify-between pb-40"
      >
        <View className="items-center mt-8">
          <View className="w-32 h-32 items-center justify-center mb-8">
            <Animated.View style={{ transform: [{ scale: iconScale }] }}>
              <View className="w-28 h-28 rounded-3xl items-center  mt-7 justify-center bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl ">
                <Navigation size={64} color="white" strokeWidth={1.5} />
              </View>
            </Animated.View>

            <View className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-400/30" />
            <View className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-blue-300/20" />
          </View>

          <View className="items-center my-2">
            <Text className="text-white text-5xl font-groteskBold text-center mb-4 tracking-tight">
              Smart Navigation
            </Text>
            <Text className="text-white/90 text-lg font-geist text-center max-w-xs leading-relaxed font-medium">
              AI-powered routes that adapt to traffic conditions in real-time
            </Text>
          </View>
        </View>

        <Animated.View
          style={{
            opacity: featuresOpacity,
            transform: [{ translateY: cardTranslate }],
          }}
        >
          <View className="gap-4">
            <Text className="text-white/70 text-sm font-medium text-center mb-4 uppercase">
              SMART FEATURES
            </Text>

            <View className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
              <View className="flex-row items-start gap-4">
                <View className="w-12 h-12 rounded-2xl items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                  <MapPin size={24} color="white" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-groteskBold text-lg mb-1">
                    Real-Time Updates
                  </Text>
                  <Text className="text-white/80 text-sm font-geist leading-relaxed">
                    Alternative routes to avoid congestion and save time
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
              <View className="flex-row items-start gap-4">
                <View className="w-12 h-12 rounded-2xl items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600">
                  <Clock size={24} color="white" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-groteskBold text-lg mb-1">
                    Accurate ETAs
                  </Text>
                  <Text className="text-white/80 text-sm font-geist leading-relaxed">
                    Machine learning predictions using historical data
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  )
}

// AuthSlide
const AuthSlide = ({ isActive }) => {
  const colorScheme = useColorScheme()
  const router = useRouter()

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideUpAnim = useRef(new Animated.Value(50)).current
  const buttonScale = useRef(new Animated.Value(0.95)).current
  const logoScale = useRef(new Animated.Value(0.8)).current
  const shimmerAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isActive) {
      // All animations use native driver
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start()

      // Shimmer animation (can't use native driver for backgroundColor)
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false, // Can't use native driver for transform with non-layout properties
        })
      ).start()
    } else {
      // Reset animations
      fadeAnim.setValue(0)
      slideUpAnim.setValue(50)
      buttonScale.setValue(0.95)
      logoScale.setValue(0.8)
      shimmerAnim.setValue(0)
    }
  }, [isActive])

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  })

  const handleGoogleLogin = () => {
    console.log("Google login pressed")
    // Implement Google OAuth logic here
  }

  const handleAppleLogin = () => {
    console.log("Apple login pressed")
    // Implement Apple OAuth logic here
  }

  return (
    <View className="flex-1 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <View className="absolute inset-0 opacity-10">
        <View className="absolute top-20 right-10 w-64 h-64 rounded-full bg-blue-500 blur-3xl" />
        <View className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-purple-500 blur-3xl" />
      </View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }],
        }}
        className="flex-1 px-6 py-10 justify-between"
      >
        <View className="items-center mt-10">
          {/* Glowing orb background */}
          <View className="absolute top-0 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/20 blur-3xl" />

          {/* 3D Logo Container */}
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <View className="relative">
              {/* Back shadow layer */}
              <View className="absolute -inset-4 bg-gradient-to-br from-blue-600/40 to-purple-600/30 rounded-3xl blur-xl" />

              {/* Main 3D card */}
              <View className="w-40 h-40 rounded-3xl items-center justify-center bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-2xl border border-transparent shadow-2xl shadow-blue-500/20">
                {/* Inner glow */}
                <View className="absolute inset-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/5" />

                {/* Pulse animation circles */}

                {/* Main icon with floating effect */}
              </View>
            </View>
          </Animated.View>

          {/* Text section with staggered animation */}
          <View className="mt-12 items-center">
            <Text className="text-white/70 text-sm font-medium tracking-widest uppercase mb-4">
              Welcome to
            </Text>

            <Text className=" text-6xl text-white text-center font-groteskBold mb-4 bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Addis Pulse
            </Text>

            {/* Animated underline */}
            <View className="w-48 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6" />

            <Text className="text-white/90 text-lg text-center max-w-sm leading-relaxed font-light font-geist">
              Your{" "}
              <Text className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                smart transportation
              </Text>{" "}
              companion
            </Text>
            <Text className="text-white/80 text-base text-center max-w-sm mt-2">
              for seamless city journeys
            </Text>
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <View className="space-y-4">
            {/* Phone Login */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/phone/")}
              activeOpacity={0.8}
              className="relative overflow-hidden"
            >
              <View className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 py-2 border border-white/20">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 rounded-2xl items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                    <Phone size={25} color="white" strokeWidth={2} />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-white text-lg font-geist">
                      Continue with Phone
                    </Text>
                    <Text className="text-white/70 text-sm mt-1">
                      Secure and instant verification
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Email Login */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/email/")}
              activeOpacity={0.8}
              className="relative overflow-hidden my-2"
            >
              <View className="bg-white/10 backdrop-blur-xl rounded-2xl p-5  py-2 border border-white/20">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 rounded-2xl items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600">
                    <Mail size={25} color="white" strokeWidth={2} />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-white text-lg font-geist">
                      Continue with Email
                    </Text>
                    <Text className="text-white/70 text-sm mt-1">
                      Traditional sign in method
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-white/10" />
              <Text className="mx-4 text-white/50 text-sm font-medium">OR</Text>
              <View className="flex-1 h-px bg-white/10" />
            </View>

            {/* Social Login Buttons */}
            <View className="flex-row gap-3">
              {/* Google Login */}
              <TouchableOpacity
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
                className="flex-1"
              >
                <View className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 items-center justify-center">
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                    <Text className="text-white font-geist">Google</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Apple Login */}
              <TouchableOpacity
                onPress={handleAppleLogin}
                activeOpacity={0.8}
                className="flex-1"
              >
                <View className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 items-center justify-center">
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name="logo-apple"
                      size={24}
                      color={colorScheme === "dark" ? "white" : "black"}
                    />
                    <Text className="text-white font-geist">Apple</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy and Terms */}
          <View className="mt-8">
            <Text className="text-white/50 text-xs text-center px-4 mb-2">
              By continuing, you agree to our
            </Text>
            <View className="flex-row justify-center gap-4">
              <TouchableOpacity onPress={() => console.log("Terms pressed")}>
                <Text className="text-white/70 text-xs font-medium">
                  Terms of Service
                </Text>
              </TouchableOpacity>
              <Text className="text-white/50 text-xs">•</Text>
              <TouchableOpacity onPress={() => console.log("Privacy pressed")}>
                <Text className="text-white/70 text-xs font-medium">
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Already have an account? */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login/")}
            className="mt-6"
          >
            <Text className="text-white/70 text-center text-sm font-medium">
              Already have an account?{" "}
              <Text className="text-blue-400 font-semibold">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  )
}

// FIXED Progress Dots - Simplified without conflicting animations
const ProgressDots = ({ currentIndex, total }) => {
  const [dots, setDots] = useState(
    Array(total).fill({ width: 8, opacity: 0.4 })
  )

  useEffect(() => {
    const newDots = Array(total).fill({ width: 8, opacity: 0.4 })
    newDots[currentIndex] = { width: 32, opacity: 1 }
    setDots(newDots)
  }, [currentIndex, total])

  return (
    <View style={styles.progressContainer}>
      {dots.map((dot, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            {
              width: dot.width,
              backgroundColor:
                index === currentIndex ? "#3B82F6" : "rgba(255,255,255,0.4)",
              opacity: dot.opacity,
            },
          ]}
        />
      ))}
    </View>
  )
}

// Join Button Component
const JoinButton = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Pulse animation with native driver
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start()

    return () => {
      pulseAnim.setValue(1)
    }
  }, [])

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      tension: 150,
      friction: 3,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 150,
      friction: 3,
      useNativeDriver: true,
    }).start()
  }

  return (
    <View style={styles.joinButtonContainer}>
      <Animated.View>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Animated.View className="relative overflow-hidden rounded-3xl group">
            {/* Animated background */}
            <View className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Border animation */}
            <View className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/30 transition-all" />

            {/* Main content */}
            <View className="bg-black/40 backdrop-blur-sm rounded-3xl border border-white/10 group-hover:border-transparent transition-all">
              <View className="flex-row items-center justify-center gap-3 py-4 px-8">
                <View className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 items-center justify-center group-hover:from-blue-500 group-hover:to-purple-500 transition-all">
                  <ArrowRight
                    size={16}
                    color="white"
                    className="group-hover:scale-110 transition-transform"
                  />
                </View>
                <Text className="text-white text-xl font-medium text-center group-hover:font-semibold transition-all">
                  Join Addis Pulse
                </Text>
                <View className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* <Sparkles size={16} color="white" /> */}
                </View>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

// Main Component
export default function Welcome() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef(null)
  const router = useRouter()

  const slides = [
    { id: "1", component: Slide1 },
    { id: "2", component: Slide2 },
    { id: "3", component: Slide3 },
    { id: "4", component: Slide4 },
    { id: "5", component: AuthSlide },
  ]

  const onMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x
    setCurrentIndex(Math.round(offsetX / width))
  }

  const renderItem = ({ item, index }) => {
    const SlideComponent = item.component
    return (
      <View style={{ width, height }}>
        <SlideComponent isActive={currentIndex === index} />
      </View>
    )
  }

  const handleJoinPress = () => {
    flatListRef.current?.scrollToIndex({
      index: 4,
      animated: true,
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
      />

      <ProgressDots currentIndex={currentIndex} total={slides.length} />

      {/* {currentIndex < 4 && <JoinButton onPress={handleJoinPress} />} */}

      {currentIndex < 4 && (
        <TouchableOpacity
          onPress={() =>
            flatListRef.current?.scrollToIndex({ index: 4, animated: true })
          }
          style={styles.skipButton}
        >
          <Text className="text-white/70 text-sm font-medium">Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

// Styles
const styles = StyleSheet.create({
  progressContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  progressDot: {
    height: 4,
    borderRadius: 2,
    transitionProperty: "all",
    transitionDuration: "300ms",
  },
  joinButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
  },
  joinButton: {
    backgroundColor: "transparent",
    backgroundImage: "linear-gradient(to right, #3B82F6, #8B5CF6)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 50,
    padding: 8,
  },
})
