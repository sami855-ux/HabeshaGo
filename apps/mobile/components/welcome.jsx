import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@react-navigation/native"
import { useRouter } from "expo-router"
import {
  Clock,
  DollarSign,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Users,
  Zap,
} from "lucide-react-native"
import { useEffect, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native"

const { width, height } = Dimensions.get("window")

// Slide 1: Smart Navigation
const Slide1 = ({ isActive }) => {
  const { colors } = useTheme()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const iconScale = useRef(new Animated.Value(0.8)).current
  const featuresOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isActive) {
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
      ]).start()
    }
  }, [isActive])

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
      }}
      className="flex-1"
      imageStyle={{ resizeMode: "cover" }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        className="flex-1 px-4 py-20 justify-between bg-black/30"
      >
        <View className="items-center mt-10">
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <View className="w-28 h-28 rounded-2xl items-center justify-center mb-8 bg-white/15 shadow-lg">
              <Navigation size={56} color="white" />
            </View>
          </Animated.View>

          <View className="items-center my-4">
            <Text className="text-white text-4xl font-bold text-center">
              Smart{"\n"}Navigation
            </Text>
            <Text className="text-white/80 text-lg text-center max-w-xs leading-7">
              AI-powered routes that adapt to traffic conditions in real-time
              for the fastest journey
            </Text>
          </View>
        </View>

        <Animated.View style={{ opacity: featuresOpacity }}>
          <View className="my-2">
            <Text className="text-white text-lg font-bold text-center mb-2">
              Why choose our navigation?
            </Text>

            <View className="bg-white/10 border-l-4 border-blue-500 rounded-3xl p-4 my-1">
              <View className="flex-row items-start gap-4">
                <View className="w-10 h-10 rounded-full items-center justify-center bg-blue-500/30 mt-1">
                  <MapPin size={20} color="#3B82F6" />
                </View>
                <Text className="flex-1 text-white/80 text-base leading-6">
                  Real-time updates and alternative routes to avoid congestion
                  and save time
                </Text>
              </View>
            </View>

            <View className="bg-white/10 border-l-4 border-blue-500 rounded-3xl p-4 my-1">
              <View className="flex-row items-start gap-4">
                <View className="w-10 h-10 rounded-full items-center justify-center bg-blue-500/30 mt-1">
                  <Clock size={20} color="#3B82F6" />
                </View>
                <Text className="flex-1 text-white/80 text-base leading-6">
                  Accurate arrival times using machine learning and historical
                  data patterns
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </ImageBackground>
  )
}
// Slide 2: Fast Booking
const Slide2 = ({ isActive }) => {
  const { colors } = useTheme()
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.loop(
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
        ),
      ]).start()
    }
  }, [isActive])

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        paddingHorizontal: 16,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 64 }}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.primary + "15",
            }}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Zap size={48} color={colors.primary} />
            </Animated.View>
          </View>
        </Animated.View>
      </View>

      <View style={{ alignItems: "center", gap: 16 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            textAlign: "center",
            color: colors.text,
          }}
        >
          Lightning Fast
        </Text>
        <Text
          style={{
            fontSize: 18,
            textAlign: "center",
            color: colors.text + "CC",
            lineHeight: 28,
          }}
        >
          Instant bookings and real-time updates for stress-free travel
        </Text>
      </View>
    </View>
  )
}

// Slide 3: Best Value
const Slide3 = ({ isActive }) => {
  const { colors } = useTheme()
  const progressAnim = useRef(new Animated.Value(0)).current
  const slideInAnim = useRef(new Animated.Value(-50)).current

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(slideInAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isActive])

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "70%"],
  })

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        paddingHorizontal: 16,
      }}
    >
      <Animated.View style={{ transform: [{ translateX: slideInAnim }] }}>
        <View style={{ alignItems: "center", marginBottom: 64 }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
              backgroundColor: colors.primary + "15",
            }}
          >
            <DollarSign size={48} color={colors.primary} />
          </View>
        </View>

        <View style={{ alignItems: "center", gap: 16 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              textAlign: "center",
              color: colors.text,
            }}
          >
            Best Value
          </Text>
          <Text
            style={{
              fontSize: 18,
              textAlign: "center",
              color: colors.text + "CC",
              lineHeight: 28,
            }}
          >
            Save up to 40% with smart price comparison across all providers
          </Text>
        </View>

        <View style={{ marginTop: 64 }}>
          <View
            style={{
              backgroundColor: colors.border + "40",
              height: 8,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{
                width: widthInterpolate,
                height: "100%",
                backgroundColor: colors.primary,
              }}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  )
}

// Slide 4: Trusted Community
const Slide4 = ({ isActive }) => {
  const { colors } = useTheme()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const staggerAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isActive) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start()
      Animated.stagger(200, [
        Animated.timing(staggerAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
      ]).start()
    }
  }, [isActive])

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        paddingHorizontal: 16,
      }}
    >
      <Animated.View
        style={{ opacity: fadeAnim, alignItems: "center", marginBottom: 64 }}
      >
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.primary + "15",
          }}
        >
          <Users size={48} color={colors.primary} />
        </View>
      </Animated.View>
      <View style={{ alignItems: "center", gap: 16 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            textAlign: "center",
            color: colors.text,
          }}
        >
          Trusted Community
        </Text>
        <Text
          style={{
            fontSize: 18,
            textAlign: "center",
            color: colors.text + "CC",
            lineHeight: 28,
          }}
        >
          Join 100,000+ travelers who trust us for their daily commute
        </Text>
      </View>
    </View>
  )
}

// AuthSlide
const AuthSlide = ({ isActive }) => {
  const { colors } = useTheme()
  const colorScheme = useColorScheme()
  const router = useRouter()

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideUpAnim = useRef(new Animated.Value(50)).current
  const buttonScale = useRef(new Animated.Value(0.95)).current
  const socialScale = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    if (isActive) {
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
        Animated.spring(socialScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isActive])

  const handleSocialLogin = (provider) =>
    console.log(`${provider} login pressed`)

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "space-between",
        padding: 32,
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }],
          flex: 1,
          justifyContent: "center",
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              textAlign: "center",
              color: colors.text,
            }}
          >
            Welcome to Addis Pulse
          </Text>
          <Text
            style={{
              fontSize: 16,
              textAlign: "center",
              maxWidth: 280,
              marginTop: 8,
              color: colorScheme === "light" ? "#6B7280" : colors.text + "CC",
            }}
          >
            Your smart transportation companion for seamless city journeys
          </Text>
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }], gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/phone/")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.primary + "15",
                marginRight: 16,
              }}
            >
              <Phone size={24} color={"white"} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: colors.text }}
              >
                Continue with Phone
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.text + "99",
                  marginTop: 4,
                }}
              >
                Secure and instant verification
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text + "99"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/email/")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.primary + "15",
                marginRight: 16,
              }}
            >
              <Mail size={24} color={"white"} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: colors.text }}
              >
                Continue with Email
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.text + "99",
                  marginTop: 4,
                }}
              >
                Traditional sign in method
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text + "99"}
            />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  )
}

// Progress Dots
const ProgressDots = ({ currentIndex, total }) => {
  const { colors } = useTheme()
  return (
    <View
      style={{
        position: "absolute",
        top: 64,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        gap: 4,
      }}
    >
      {Array.from({ length: total }).map((_, index) => {
        const widthAnim = useRef(
          new Animated.Value(index === currentIndex ? 24 : 8)
        ).current
        const colorAnim = useRef(
          new Animated.Value(index === currentIndex ? 1 : 0)
        ).current

        useEffect(() => {
          Animated.parallel([
            Animated.spring(widthAnim, {
              toValue: index === currentIndex ? 24 : 8,
              tension: 50,
              friction: 5,
              useNativeDriver: false,
            }),
            Animated.timing(colorAnim, {
              toValue: index === currentIndex ? 1 : 0,
              duration: 300,
              useNativeDriver: false,
            }),
          ]).start()
        }, [currentIndex])

        const backgroundColor = colorAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.text + "40", colors.primary],
        })
        return (
          <Animated.View
            key={index}
            style={{
              width: widthAnim,
              height: 8,
              borderRadius: 4,
              backgroundColor,
              marginHorizontal: 2,
            }}
          />
        )
      })}
    </View>
  )
}

// Main Component
export default function Welcome() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef(null)
  const { colors } = useTheme()

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
      />
      <ProgressDots currentIndex={currentIndex} total={slides.length} />
    </View>
  )
}
