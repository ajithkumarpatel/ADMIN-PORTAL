import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQwslRai5qHWuIie0gFQs5ygx-o2lVWMA",
  authDomain: "myportfoliowebsite-2410d.firebaseapp.com",
  projectId: "myportfoliowebsite-2410d",
  storageBucket: "myportfoliowebsite-2410d.firebasestorage.app",
  messagingSenderId: "681329054825",
  appId: "1:681329054825:web:83db414e5065b6ed98bef8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
