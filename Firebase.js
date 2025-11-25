// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMZ2r15ablc4LTDzNindBJCFipNdg3vcs",
  authDomain: "waped-imobiliaria.firebaseapp.com",
  projectId: "waped-imobiliaria",
  storageBucket: "waped-imobiliaria.appspot.com",   // ✔ CORRIGIDO
  messagingSenderId: "99875066360",
  appId: "1:99875066360:web:e10681e5d9bb8bc977860d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

