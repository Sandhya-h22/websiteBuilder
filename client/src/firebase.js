// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getAuth, GoogleAuthProvider} from "firebase/auth"
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDsOO8t__ybvAQ0V-YqZVa5EL7iVLJN4k",
  authDomain: "website-110f5.firebaseapp.com",
  projectId: "website-110f5",
  storageBucket: "website-110f5.firebasestorage.app",
  messagingSenderId: "45852293041",
  appId: "1:45852293041:web:f85528b1d224928d966f90",
  measurementId: "G-DW591B7EH3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth= getAuth(app)
const provider=new GoogleAuthProvider()

export {auth,provider}
