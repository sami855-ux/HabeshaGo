// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAGigO1LKx4WM653lJwc_v3FWTqpaNTI7k",
  authDomain: "habsehago.firebaseapp.com",
  projectId: "habsehago",
  storageBucket: "habsehago.firebasestorage.app",
  messagingSenderId: "688606733318",
  appId: "1:688606733318:web:a3ad75e9f9decb97db4f87",
  measurementId: "G-KM9TT2K2BZ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
