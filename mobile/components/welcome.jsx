import { useState, useRef, useEffect } from "react";
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  Animated,
  FlatList,
} from "react-native";
import {
  Navigation,
  Zap,
  DollarSign,
  Heart,
  Train,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  MapPin,
  TrendingUp,
} from "lucide-react-native";
import { FontAwesome, AntDesign, Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// Animated Icon Component
const AnimatedIcon = ({ Icon, color, delay = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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
    ]).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }, { rotate }],
      }}
    >
      <Icon size={60} color={color} strokeWidth={1.5} />
    </Animated.View>
  );
};

// Floating Element with Animation
const FloatingElement = ({ Icon, color, delay, position }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

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
    ]).start();
  }, []);

  return (
    <Animated.View
      className={`absolute ${position}`}
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View
        className="w-14 h-14 rounded-full items-center justify-center backdrop-blur-sm"
        style={{
          backgroundColor: color + "20",
          borderWidth: 1.5,
          borderColor: color + "5",
        }}
      >
        <Icon size={24} color={color} strokeWidth={1.5} />
      </View>
    </Animated.View>
  );
};

// Slide 1: Smart Navigation
const Slide1 = () => {
  return (
    <View
      className="w-full items-center justify-center px-8 bg-gradient-to-br from-blue-50 to-cyan-50"
      style={{ width }}
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

      <Text className="font-inter text-4xl text-center text-[#00796B] mb-4 leading-tight">
        Smart Navigation
      </Text>

      <Text className="text-[17px] font-jakarta text-center text-[#095048] leading-7 max-w-xs">
        Discover optimal routes with AI-powered suggestions and live traffic
        intelligence
      </Text>

      <View
        className="mt-10 rounded-3xl p-3 border border-[#bcf3ed] backdrop-blur-sm"
        style={{ backgroundColor: "rgba(59, 130, 246, 0.08)" }}
      >
        <Text className="text-sm font-inter text-[#00796B] text-center font-medium">
          Advanced AI algorithms power every route
        </Text>
      </View>
    </View>
  );
};

// Slide 2: Lightning Fast
const Slide2 = () => {
  return (
    <View
      className="w-full items-center justify-center px-8 bg-gradient-to-br from-purple-50 to-pink-50"
      style={{ width }}
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

      <Text className="font-inter text-4xl text-center text-purple-950 mb-4 leading-tight">
        Lightning Fast
      </Text>

      <Text className="text-lg font-jakarta text-center text-purple-800 leading-7 max-w-xs">
        Get real-time updates and instant booking confirmations for stress-free
        travel
      </Text>

      <View
        className="mt-10 rounded-3xl p-3 border border-purple-200 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(139, 92, 246, 0.08)" }}
      >
        <Text className="text-sm font-inter text-purple-800 text-center font-medium">
          Real-time tracking & instant confirmations
        </Text>
      </View>
    </View>
  );
};

// Slide 3: Best Value
const Slide3 = () => {
  return (
    <View
      className="w-full items-center justify-center px-8 bg-gradient-to-br from-emerald-50 to-green-50"
      style={{ width }}
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

      <Text className="font-semibold font-inter text-4xl text-center text-emerald-950 mb-4 leading-tight">
        Best Value
      </Text>

      <Text className="text-lg font-jakarta text-center text-emerald-800 leading-7 max-w-xs">
        Compare prices across all providers and save up to 40% on your daily
        commute
      </Text>

      <View
        className="mt-10 rounded-3xl p-3 border border-emerald-200 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(16, 185, 129, 0.08)" }}
      >
        <Text className="text-sm font-inter text-emerald-800 text-center font-medium">
          Save up to 40% on every journey
        </Text>
      </View>
    </View>
  );
};

// Slide 4: Loved by Thousands
const Slide4 = () => {
  return (
    <View
      className="w-full items-center justify-center px-8 bg-gradient-to-br from-rose-50 to-red-50"
      style={{ width }}
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

      <Text className="font-semibold font-inter text-4xl text-center text-rose-950 mb-4 leading-tight">
        Loved by Thousands
      </Text>

      <Text className="text-lg text-center font-jakarta text-rose-800 leading-7 max-w-md">
        Join our community of happy travelers enjoying seamless transportation
        experiences
      </Text>

      <View
        className="mt-10 rounded-3xl p-3 border border-rose-200 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(244, 63, 94, 0.08)" }}
      >
        <Text className="text-sm font-inter text-rose-800 text-center font-medium">
          Trusted by over 100,000 happy users
        </Text>
      </View>
    </View>
  );
};

// Slide 5: Auth Slide
const LoginSlide = ({ onPhonePress }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const logoScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.4],
  });

  const contentStyle = {
    opacity: fadeInAnim,
    transform: [{ translateY: slideUpAnim }],
  };

  return (
    <View
      className="w-full px-8 justify-center items-center bg-gray-900"
      style={{ width }}
    >
      {/* Logo Section */}
      <Animated.View style={contentStyle} className="mb-14 relative">
        <Animated.View
          style={{
            transform: [{ scale: logoScale }],
            opacity: glowOpacity,
            position: "absolute",
            inset: -25,
          }}
        >
          <View
            className="w-36 h-36 bg-blue-500 rounded-[45px]"
            style={{ opacity: 0.25 }}
          />
        </Animated.View>

        <View className="w-32 h-32 bg-blue-600 rounded-[35px] flex items-center justify-center shadow-2xl shadow-blue-500/30 border border-blue-400">
          <Train size={46} color="white" strokeWidth={1.8} />
        </View>

        <View className="absolute -top-2 -right-2 w-12 h-12 bg-amber-500 rounded-full items-center justify-center shadow-lg border-4 border-gray-900">
          <Sparkles size={16} color="white" strokeWidth={2.5} />
        </View>
      </Animated.View>

      {/* Content Section */}
      <Animated.View style={contentStyle} className="w-full items-center">
        <Text className="text-4xl font-interBold text-center text-white mb-4 leading-tight">
          Start Your Journey
        </Text>

        <Text className="text-lg font-inter text-center text-gray-300 mb-10 leading-7 max-w-[320px]">
          Join thousands of travelers enjoying seamless transportation
          experiences
        </Text>

        {/* Auth Buttons */}
        <View className="w-full gap-4">
          <TouchableOpacity
            className="w-full h-16 bg-blue-600 rounded-2xl justify-center items-center shadow-xl shadow-blue-500/30 border border-blue-500"
            onPress={onPhonePress}
          >
            <Text className="font-interBold text-lg text-white">
              Continue with Phone
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="w-full h-16 bg-gray-800 rounded-2xl justify-center items-center border border-gray-700 shadow-lg">
            <Text className="font-interBold text-lg text-gray-200">
              Continue with Email
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-700" />
            <Text className="mx-4 font-inter text-gray-500 text-sm">
              or continue with
            </Text>
            <View className="flex-1 h-px bg-gray-700" />
          </View>

          <View className="w-full flex-row gap-3">
            <TouchableOpacity className="flex-1 h-14 bg-gray-800 rounded-xl items-center justify-center border border-gray-700 shadow-lg">
              <FontAwesome name="google" size={20} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 h-14 bg-gray-800 rounded-xl items-center justify-center border border-gray-700 shadow-lg">
              <AntDesign name="apple1" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-8 bg-gray-800 rounded-xl p-3 border border-gray-700">
          <Text className="font-inter text-gray-400 text-center text-xs">
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

// Navigation Arrows
const NavigationArrows = ({ currentIndex, totalSlides, onPrev, onNext }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
    ]).start();
    callback();
  };

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
  );
};

// Pagination Dots
const PaginationDots = ({ scrollX, totalSlides }) => {
  const renderDot = (index) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const dotWidth = scrollX.interpolate({
      inputRange,
      outputRange: [6, 24, 6],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: "clamp",
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1.2, 0.8],
      extrapolate: "clamp",
    });

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
    );
  };

  return (
    <View className="flex-row justify-center items-center mt-8 mb-6">
      {Array.from({ length: totalSlides }).map((_, index) => renderDot(index))}
    </View>
  );
};

// Action Button
const ActionButton = ({ currentIndex, totalSlides, onNext, onPhonePress }) => {
  const colors = ["#3B82F6", "#8B5CF6", "#10B981", "#F43F5E", "#3B82F6"];
  const currentColor = colors[Math.min(currentIndex, colors.length - 1)];

  if (currentIndex < totalSlides - 1) {
    return (
      <TouchableOpacity
        className="w-full h-14 rounded-2xl justify-center items-center flex-row gap-2 shadow-lg"
        style={{ backgroundColor: currentColor }}
        onPress={onNext}
      >
        <Text className="font-semibold text-lg text-white">
          {currentIndex === totalSlides - 2 ? "Get Started" : "Continue"}
        </Text>
        <ChevronRight size={20} color="white" strokeWidth={2} />
      </TouchableOpacity>
    );
  }

  return (
    <View className="w-full flex-row gap-3">
      <TouchableOpacity
        className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl justify-center items-center shadow-lg"
        onPress={onPhonePress}
      >
        <Text className="font-semibold text-lg text-white">Phone</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-1 h-14 bg-white border-2 border-gray-200 rounded-2xl justify-center items-center shadow-lg">
        <Text className="font-semibold text-lg text-gray-900">Email</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main Component
export default function Welcome() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const slideComponents = [Slide1, Slide2, Slide3, Slide4, LoginSlide];
  const allSlides = slideComponents.map((_, index) => ({
    id: String(index + 1),
  }));

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    if (newIndex >= 0 && newIndex < allSlides.length) {
      setCurrentIndex(newIndex);
    }
  };

  const scrollTo = (index) => {
    if (flatListRef.current && index >= 0 && index < allSlides.length) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const nextSlide = () => {
    if (currentIndex < allSlides.length - 1) {
      scrollTo(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      scrollTo(currentIndex - 1);
    }
  };

  const goToAuth = () => {
    console.log("Navigate to phone auth");
  };

  const renderItem = ({ item, index }) => {
    const SlideComponent = slideComponents[index];
    return index === slideComponents.length - 1 ? (
      <SlideComponent onPhonePress={goToAuth} />
    ) : (
      <SlideComponent />
    );
  };

  const backgroundGradients = [
    "from-blue-50 to-cyan-50",
    "from-purple-50 to-pink-50",
    "from-emerald-50 to-green-50",
    "from-rose-50 to-red-50",
    "from-slate-900 to-black",
  ];

  const currentBackground =
    backgroundGradients[Math.min(currentIndex, backgroundGradients.length - 1)];

  return (
    <View className={`flex-1 bg-gradient-to-br ${currentBackground}`}>
      <View className="flex-1 justify-center items-center pt-10">
        <View className="w-11/12 h-[70vh] rounded-3xl overflow-hidden">
          <NavigationArrows
            currentIndex={currentIndex}
            totalSlides={allSlides.length}
            onPrev={prevSlide}
            onNext={nextSlide}
          />

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
                  });
                }
              }, 100);
            }}
          />

          <PaginationDots scrollX={scrollX} totalSlides={allSlides.length} />
        </View>

        <View className="mt-8 px-8 w-full gap-4">
          <Text className="text-xs text-gray-600 text-center">
            By continuing, you agree to our Terms • Privacy • Policy
          </Text>
        </View>
      </View>
    </View>
  );
}
