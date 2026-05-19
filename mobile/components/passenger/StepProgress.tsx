// StepProgress.tsx
import React, { useEffect, useRef } from "react"
import { View, Text, Animated } from "react-native"
import { CheckCheck, ChevronRight } from "lucide-react-native"

interface StepProgressProps {
  currentStep: number
}

export function StepProgress({ currentStep }: StepProgressProps) {
  const steps = [
    { number: 1, label: "Find User" },
    { number: 2, label: "Select User" },
    { number: 3, label: "Confirm Share" },
  ]

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const getStepStyles = (stepNumber: number) => {
    if (stepNumber === currentStep) {
      return "bg-orange-500 shadow-lg shadow-orange-500/30 scale-110"
    }
    if (stepNumber < currentStep) {
      return "bg-green-500"
    }
    return "bg-gray-200"
  }

  const getTextStyles = (stepNumber: number) => {
    if (stepNumber === currentStep) return "text-white"
    if (stepNumber < currentStep) return "text-white"
    return "text-gray-400"
  }

  return (
    <Animated.View
      className="mb-8 items-center"
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      <View className="flex-row items-center justify-center mb-3">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <View className="items-center">
              <View
                className={`w-11 h-11 rounded-full items-center justify-center ${getStepStyles(step.number)}`}
              >
                {step.number < currentStep ? (
                  <CheckCheck size={18} color="#fff" />
                ) : (
                  <Text
                    className={`text-base font-semibold ${getTextStyles(step.number)}`}
                  >
                    {step.number}
                  </Text>
                )}
              </View>
            </View>
            {index < steps.length - 1 && (
              <ChevronRight
                size={20}
                color={step.number < currentStep ? "#10b981" : "#d1d5db"}
                className="mx-2"
              />
            )}
          </React.Fragment>
        ))}
      </View>

      <View className="flex-row justify-between w-full px-2">
        {steps.map((step) => (
          <Text
            key={step.number}
            className={`text-xs ${step.number === currentStep ? "text-orange-600 font-medium" : "text-gray-400"}`}
          >
            {step.label}
          </Text>
        ))}
      </View>
    </Animated.View>
  )
}
