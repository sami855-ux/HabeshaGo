import { motion } from "framer-motion"
import { CheckCheck, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepProgressProps {
  currentStep: number
}

export function StepProgress({ currentStep }: StepProgressProps) {
  const steps = [
    { number: 1, label: "Find User" },
    { number: 2, label: "Select User" },
    { number: 3, label: "Confirm Share" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                step.number === currentStep
                  ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30 scale-110"
                  : step.number < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
              )}
            >
              {step.number < currentStep ? (
                <CheckCheck className="h-5 w-5" />
              ) : (
                step.number
              )}
            </div>
            {index < steps.length - 1 && (
              <ChevronRight
                className={cn(
                  "h-5 w-5 mx-2",
                  step.number < currentStep
                    ? "text-green-500"
                    : "text-gray-300 dark:text-gray-700",
                )}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-500 max-w-md mx-auto">
        {steps.map((step) => (
          <span
            key={step.number}
            className={cn(
              "transition-colors",
              step.number === currentStep ? "text-orange-600 font-medium" : "",
            )}
          >
            {step.label}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
