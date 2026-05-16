import AsyncStorage from "@react-native-async-storage/async-storage"
// import notifee, { AndroidImportance } from "@notifee/react-native"

export async function sendNotification(title: string, body: string) {
  const saved = await AsyncStorage.getItem("notifSettings")
  const s = saved
    ? JSON.parse(saved)
    : {
        pushNotifications: true,
        sound: true,
        vibration: true,
      }

  if (!s.pushNotifications) return

  //   const channelId = await notifee.createChannel({
  //     id: "default",
  //     name: "Default",
  //     importance: AndroidImportance.HIGH,
  //     sound: s.sound ? "default" : undefined,
  //     vibration: s.vibration ?? true,
  //     vibrationPattern: s.vibration ? [300, 500] : undefined,
  //   })

  //   await notifee.displayNotification({
  //     title,
  //     body,
  //     android: { channelId },
  //     ios: { sound: s.sound ? "default" : undefined },
  //   })
}
