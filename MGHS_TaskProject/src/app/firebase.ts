// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore,  } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4pzVSxk2RVPRDDpa5-bHvIUVW9OtQmxQ",
  authDomain: "mghs-internsystem.firebaseapp.com",
  projectId: "mghs-internsystem",
  storageBucket: "mghs-internsystem.appspot.com",
  messagingSenderId: "592403883541",
  appId: "1:592403883541:web:c69b2e096bfb12eae6501c"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth(app);

export { app, db, auth}