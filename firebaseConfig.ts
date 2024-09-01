// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAK_OhyTdRO8FvTwgDk9W5_1UdMooDaERk",
  authDomain: "aptostg.firebaseapp.com",
  databaseURL: "https://aptostg-default-rtdb.firebaseio.com",
  projectId: "aptostg",
  storageBucket: "aptostg.appspot.com",
  messagingSenderId: "480114279057",
  appId: "1:480114279057:web:4e0a9be181e7675707b530",
  measurementId: "G-MRQ5W79HZC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export default db;
