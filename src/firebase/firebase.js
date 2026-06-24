import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAsQxOHBriDYNUBZWvoZ2YKCY7l-cvuUlM",
  authDomain: "imposter-4de97.firebaseapp.com",
  projectId: "imposter-4de97",
  storageBucket: "imposter-4de97.firebasestorage.app",
  messagingSenderId: "80464330823",
  appId: "1:80464330823:web:c90fa261a38c1f57607162"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
