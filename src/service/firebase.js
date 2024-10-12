import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDnDbEKg6NAtbAhNI2d4wK0jYWVvutGqTw",
  authDomain: "ecommerce-react-f028c.firebaseapp.com",
  projectId: "ecommerce-react-f028c",
  storageBucket: "ecommerce-react-f028c.appspot.com",
  messagingSenderId: "515809162076",
  appId: "1:515809162076:web:0ccda8c6fed24d9b7ec799",
  measurementId: "G-YK5Q7ERG85",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
