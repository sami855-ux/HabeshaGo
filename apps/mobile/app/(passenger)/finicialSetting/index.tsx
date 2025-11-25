import { useRouter } from "expo-router"
import {
  ArrowLeft,
  ChevronRight,
  Info,
  Download,
  Cloud,
  HelpCircle,
} from "lucide-react-native"
import { useState } from "react"
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
} from "react-native"

const FinancialSettings = () => {
  const router = useRouter()

  // State for various toggles and settings
  const [requirePin, setRequirePin] = useState(false)
  const [requireBiometric, setRequireBiometric] = useState(false)
  const [internationalTransactions, setInternationalTransactions] =
    useState(false)
  const [autoSave, setAutoSave] = useState(false)
  const [autoBillPayments, setAutoBillPayments] = useState(false)
  const [spendingInsights, setSpendingInsights] = useState(true)
  const [showFeesModal, setShowFeesModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  const handleResetSettings = () => {
    // Reset logic here
    setShowResetModal(false)
    Alert.alert("Success", "Financial settings have been reset to defaults")
  }

  return (
    <>
      <StatusBar translucent={true} barStyle={"dark-content"} />

      <ScrollView className="flex-1 bg-gray-50">
        <View className="pt-12 p-6">
          {/* Header */}
          <View className="flex flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-2xl ml-4 font-groteskBold text-gray-700">
              Financial Settings
            </Text>
          </View>

          {/* A. Wallet Preferences */}
          <View className="bg-white rounded-xl p-4 mb-4 ">
            <Text className="text-lg font-groteskBold text-gray-800 mb-4">
              Wallet Preferences
            </Text>

            <TouchableOpacity className="flex-row justify-between items-center py-3">
              <Text className="text-gray-700">Default Top-Up Method</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-500 mr-2">Bank Account</Text>
                <ChevronRight size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* B. Spending Controls */}
          <View className="bg-white rounded-xl p-4 mb-4 ">
            <Text className="text-lg font-groteskBold text-gray-800 mb-4">
              Spending Controls
            </Text>

            <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-gray-50">
              <Text className="text-gray-700">Daily Spending Limit</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-500 mr-2">5,000 birr</Text>
                <ChevronRight size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-gray-50">
              <Text className="text-gray-700">Single Transaction Limit</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-500 mr-2">2,000 birr</Text>
                <ChevronRight size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <View className="flex-row justify-between items-center ">
              <Text className="text-gray-700">International Transactions</Text>
              <Switch
                value={internationalTransactions}
                onValueChange={setInternationalTransactions}
              />
            </View>
          </View>

          {/* C. Security Settings */}
          <View className="bg-white rounded-xl p-4 mb-4 ">
            <Text className="text-lg font-groteskBold text-gray-800 mb-4">
              Security Settings
            </Text>

            <View className="flex-row justify-between items-center  border-b border-gray-50">
              <Text className="text-gray-700">
                Require PIN for Every Payment
              </Text>
              <Switch
                value={requirePin}
                onValueChange={setRequirePin}
                trackColor={{ false: "#E5E7EB", true: "#30D158" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
                style={{ transform: [{ scale: 0.9 }] }}
              />
            </View>

            <View className="flex-row justify-between items-center  border-b border-gray-50">
              <Text className="text-gray-700">
                Require Biometric for Transfers
              </Text>
              <Switch
                value={requireBiometric}
                onValueChange={setRequireBiometric}
                trackColor={{ false: "#E5E7EB", true: "#34C759" }}
                thumbColor={requireBiometric ? "#FFFFFF" : "#F3F4F6"}
                ios_backgroundColor="#E5E7EB"
              />
            </View>

            <TouchableOpacity className="flex-row justify-between items-center py-3">
              <Text className="text-gray-700">Auto-Lock Wallet</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-500 mr-2">1 min</Text>
                <ChevronRight size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* D. Linked Financial Sources */}
          <View className="bg-white rounded-xl p-4 mb-4 ">
            <Text className="text-lg font-groteskBold text-gray-800 mb-4">
              Linked Financial Sources
            </Text>

            <TouchableOpacity className="flex-row justify-between items-center py-4">
              <Text className="text-gray-700">Linked Bank Accounts</Text>
              <View className="flex-row items-center">
                <Text className="text-blue-600 mr-2">Manage</Text>
                <ChevronRight size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* E. Fees & Limits */}
          <View className="bg-white rounded-xl p-4 mb-4 ">
            <Text className="text-lg font-groteskBold text-gray-800 mb-4">
              Fees & Limits
            </Text>

            <TouchableOpacity
              className="flex-row justify-between items-center py-4 border-b border-gray-100"
              onPress={() => setShowFeesModal(true)}
            >
              <Text className="text-gray-700">View Transaction Fees</Text>
              <Info size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <Text className="text-gray-700">Withdrawal Limits</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-500 mr-2">View</Text>
                <ChevronRight size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row justify-between items-center py-4">
              <Text className="text-gray-700">Top-Up Limits</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-500 mr-2">View</Text>
                <ChevronRight size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View className="bg-white rounded-xl p-4 mb-8 ">
            <TouchableOpacity
              className="flex-row justify-between items-center py-3 font-geist"
              onPress={() => setShowResetModal(true)}
            >
              <Text className="text-red-600">Reset to Default Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fees Info Modal */}
      <Modal
        visible={showFeesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFeesModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-6 m-4 w-11/12">
            <Text className="text-xl font-groteskBold text-gray-800 mb-4">
              Transaction Fees
            </Text>
            <Text className="text-gray-600 mb-4">
              • Local transfers: 0.5%{"\n"}• International transfers: 2%{"\n"}•
              ATM withdrawals: 1%{"\n"}• No fees for peer-to-peer transfers
            </Text>
            <TouchableOpacity
              className="bg-blue-600 py-3 rounded-lg mt-2"
              onPress={() => setShowFeesModal(false)}
            >
              <Text className="text-white text-center font-semibold">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-6 m-4 w-11/12">
            <Text className="text-xl font-groteskBold text-gray-800 mb-2">
              Reset Settings?
            </Text>
            <Text className="text-gray-600 mb-6">
              This will reset all your financial settings to their default
              values. This action cannot be undone.
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 bg-gray-300 py-3 rounded-lg mr-2"
                onPress={() => setShowResetModal(false)}
              >
                <Text className="text-gray-800 text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-600 py-3 rounded-lg ml-2"
                onPress={handleResetSettings}
              >
                <Text className="text-white text-center font-semibold">
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

export default FinancialSettings
