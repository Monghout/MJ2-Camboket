// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBi1Kz0ibFsWBhFOOQUcFARGBL4n7QWMko",
  authDomain: "major2-a97bc.firebaseapp.com",
  projectId: "major2-a97bc",
  storageBucket: "major2-a97bc.firebasestorage.app",
  messagingSenderId: "24381356674",
  appId: "1:24381356674:web:408ac31319447a3f4f929b",
  measurementId: "G-G02P1LM041",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
