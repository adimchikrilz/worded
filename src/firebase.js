import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA9MLeey2Xk8PrwQh_DBDVLzz5rxAZa65k",
  authDomain: "my-worded-app.firebaseapp.com",
  projectId: "my-worded-app",
  storageBucket: "my-worded-app.firebasestorage.app",
  messagingSenderId: "722269602553",
  appId: "1:722269602553:web:338c32ce832334b5e29828",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);