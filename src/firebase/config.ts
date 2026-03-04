import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyBKZhdmfLVoo8W6iePg5_aKZ4UhdQe8w3U',
  authDomain: 'restaurant-app-full.firebaseapp.com',
  projectId: 'restaurant-app-full',
  storageBucket: 'restaurant-app-full.appspot.com',
  messagingSenderId: '358212326114',
  appId: '1:358212326114:web:ca6b1ce68ff2f5f51f84bb',
  measurementId: 'G-7XEEQ0XGP3',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
