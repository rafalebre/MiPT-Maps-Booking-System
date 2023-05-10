import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

// Import the functions I'll need from the SDKs I'll need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that I might want to use
// https://firebase.google.com/docs/web/setup#available-libraries

//  web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAI70b4EyAJ5CgCnGltObzuFIOd2eLBZWU",
    authDomain: "mi-pt-booking-system.firebaseapp.com",
    projectId: "mi-pt-booking-system",
    storageBucket: "mi-pt-booking-system.appspot.com",
    messagingSenderId: "62148864314",
    appId: "1:62148864314:web:26d0b6399bd46fb0df4803"
  };
  
  firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

export default db;