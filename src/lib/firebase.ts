// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDt0UQv2cZGn9SmhuTfXM2SLwk0Zq0_XqQ",
  authDomain: "technify-3869a.firebaseapp.com",
  projectId: "technify-3869a",
  storageBucket: "technify-3869a.firebasestorage.app",
  messagingSenderId: "881612125927",
  appId: "1:881612125927:web:25d5cac1205f2fad039442",
  measurementId: "G-27SEFTCZFZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics: any = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };
export default app;
