import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAGigO1LKx4WM653lJwc_v3FWTqpaNTI7k",
  authDomain: "habsehago.firebaseapp.com",
  projectId: "habsehago",
  storageBucket: "habsehago.firebasestorage.app",
  messagingSenderId: "688606733318",
  appId: "1:688606733318:web:a3ad75e9f9decb97db4f87",
  measurementId: "G-KM9TT2K2BZ",
}

// Prevent re-initializing on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)
export default app
