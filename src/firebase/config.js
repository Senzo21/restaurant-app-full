import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBKZhdmfLVoo8W6iePg5_aKZ4UhdQe8w3U",
  authDomain: "restaurant-app-full.firebaseapp.com",
  projectId: "restaurant-app-full",
  storageBucket: "restaurant-app-full.appspot.com",
  messagingSenderId: "358212326114",
  appId: "1:358212326114:web:ca6b1ce68ff2f5f51f84bb",
  measurementId: "G-7XEEQ0XGP3"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

export const auth =
  !getApps().length && getAuth(app).app ? getAuth(app) :
  initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
