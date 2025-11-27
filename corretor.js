import { auth, db, storage } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
  uploadBytes,
  getDownloadURL,
  ref
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";


// Autenticação obrigatória
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  }
});

// ---------------------------------------------------
// 1) CADASTRAR IMÓVEL
// ---------------------------------------------------
const formImovel = document.getElementById("formImovel");

if (formImovel) {
  formImovel.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    const titulo = document.getElementById("titulo").value;
    const descricao = document.getElementById("descricao").value;
    const preco = document.getElementById("preco").value;
    const endereco = document.getElementById("endereco").value;
    const fotos = document.getElementById("fotos").files;

    const urls = [];

    for (let foto of fotos) {
      const caminho = `imoveis/${user.uid}/${Date.now()}_${foto.name}`;
      const storageRef = ref(storage, caminho);
      await uploadBytes(storageRef, foto);
      urls.push(await getDownloadURL(storageRef));
    }

    await addDoc(collection(db, "imoveis"), {
      userId: user.uid,
      titulo,
      descricao,
      preco,
      endereco,
      fotos: urls,
      criadoEm: new Date()
    });

    alert("Imóvel salvo!");
    formImovel.reset();
  });
}

// ---------------------------------------------------
// 2) LISTAR / EXCLUIR IMÓVEIS
// ---------------------------------------------------
const listaImoveis = document.getElementById("listaImoveis");

if (listaImoveis) carregarLista();

async function carregarLista() {
  const user = auth.currentUser;

  const q = query(collection(db, "imoveis"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);

  listaImoveis.innerHTML = "";

  snapshot.forEach((docItem) => {
    const dados = docItem.data();

    listaImoveis.innerHTML += `
      <div class="item">
        <h3>${dados.titulo}</h3>
        <p>${dados.descricao}</p>
        <p><strong>R$ ${dados.preco}</strong></p>

        <button onclick="excluirImovel('${docItem.id}')">Excluir</button>
      </div>
    `;
  });
}

window.excluirImovel = async function (id) {
  await deleteDoc(doc(db, "imoveis", id));
  alert("Imóvel removido!");
  carregarLista();
};

// ---------------------------------------------------
// 3) ATUALIZAR DADOS DO CORRETOR
// ---------------------------------------------------
const formCorretor = document.getElementById("formCorretor");

if (formCorretor) formCorretor.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;

  await updateDoc(doc(db, "corretores", user.uid), {
    nome: document.getElementById("nome").value,
    telefone: document.getElementById("telefone").value,
    bio: document.getElementById("bio").value
  });

  alert("Dados atualizados!");
});
