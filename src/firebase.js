// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
// For the Realtime Database, we primarily need the databaseURL and projectId
const firebaseConfig = {
  apiKey: "AIzaSyDummy-key-for-demo", // This is a dummy key for demo
  authDomain: "naan-stop-data.firebaseapp.com",
  databaseURL: "https://naan-stop-data-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "naan-stop-data",
  storageBucket: "naan-stop-data.appspot.com",
  messagingSenderId: "123456789", // Dummy sender ID
  appId: "1:123456789:web:abcdef123456" // Dummy app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);
export default app;
