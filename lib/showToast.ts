import { Alert, Platform, ToastAndroid } from "react-native"

export const showToast = (
  message: string,
  duration: number = ToastAndroid.SHORT
) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, duration)
  } else {
    // Fallback for iOS - could use a different approach here
    Alert.alert("Info", message)
  }
}
