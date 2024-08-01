// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAZygaUMyLbq2v6_Fd03G1XqTYz-IPWVs",
  authDomain: "hspantry-tracker.firebaseapp.com",
  projectId: "hspantry-tracker",
  storageBucket: "hspantry-tracker.appspot.com",
  messagingSenderId: "620457013513",
  appId: "1:620457013513:web:0d5477df0e51cd8998e3d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export {app, firestore}