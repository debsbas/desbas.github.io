import { auth, provider } from "./firebase.js";
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

document.getElementById("loginGoogle").addEventListener("click", () => {

  signInWithPopup(auth, provider)
    .then(() => {
      window.location.href = "painel-corretor.html";
    })
    .catch((error) => {
      alert("Erro ao fazer login: " + error.message);
    });

});
