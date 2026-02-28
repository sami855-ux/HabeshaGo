import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, 
  Wallet, 
  Sparkles, 
  Home, 
  Building2, 
  GraduationCap,
  ShoppingBag,
  Dumbbell,
  Settings,
  HelpCircle,
  ChevronRight,
  X
} from 'lucide-react';

const IntroOverlay = () => {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const tourSteps = [
    {
      title: "Welcome to your dashboard",
      description: "Your transportation hub. Let's take a quick look around.",
      target: "welcome"
    },
    {
      title: "Your stats",
      description: "248 bus trips this month, ETB 124 saved, and ETB 85.50 in your wallet.",
      target: "stats"
    },
    {
      title: "Quick actions",
      description: "Book buses, reserve parking, or find shuttle jobs in one tap.",
      target: "actions"
    },
    {
      title: "Saved places",
      description: "Home, office, university, mall, and gym — all with ETAs and distances.",
      target: "favorites"
    },
    {
      title: "Settings & support",
      description: "Manage your account or get help anytime.",
      target: "tools"
    },
    {
      title: "You're all set",
      description: "Start exploring your dashboard. Need help? Support is always here.",
      target: "welcome"
    }
  ];

  useEffect(() => {
    const visited = localStorage.getItem("hasVisited");
    if (!visited) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Scroll to section
      const element = document.getElementById(tourSteps[currentStep + 1].target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      finishIntro();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      
      // Scroll to section
      const element = document.getElementById(tourSteps[currentStep - 1].target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const finishIntro = () => {
    localStorage.setItem("hasVisited", "true");
    setShow(false);
    document.body.style.overflow = 'unset';
  };

  if (!show) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Simple dark overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40"
        onClick={finishIntro}
      />

      {/* Simple white tooltip */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[400px] bg-white rounded-xl shadow-xl overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <motion.div 
            className="h-full bg-black"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <div className="p-5">
          {/* Title and close button */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-base font-semibold text-gray-900">
              {currentTourStep.title}
            </h3>
            <button 
              onClick={finishIntro}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-5">
            {currentTourStep.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`text-sm font-medium transition-colors ${
                  currentStep === 0 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ← Back
              </button>
              <span className="text-xs text-gray-400">
                {currentStep + 1} / {tourSteps.length}
              </span>
            </div>
            
            <button
              onClick={nextStep}
              className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              {currentStep === tourSteps.length - 1 ? 'Done' : 'Next'}
              {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default IntroOverlay;