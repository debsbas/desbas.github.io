// script.js
import { auth, db, storage } from './firebase.js';
import { 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { 
  collection, addDoc, getDocs, query, orderBy, limit 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// ==========================
// Proteção de acesso
// ==========================
auth.onAuthStateChanged(user => { 
  if(!user) location.href='index.html'; 
});

// ==========================
// Logout
// ==========================
document.getElementById('logout')?.addEventListener('click', async e=>{
  e.preventDefault();
  await signOut(auth);
  location.href='index.html';
});
document.getElementById('logout2')?.addEventListener('click', async e=>{
  e.preventDefault();
  await signOut(auth);
  location.href='index.html';
});

// ==========================
// Busca de CEP
// ==========================
document.getElementById('buscarCep')?.addEventListener('click', async ()=>{
  const cep = (document.getElementById('cep').value||'').replace(/\D/g,'');
  if(!cep) return alert('Informe o CEP');
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if(data.erro) return alert('CEP não encontrado');
    document.getElementById('cidade').value = data.localidade || '';
    document.getElementById('estado').value = data.uf || '';
  } catch(e){ alert('Erro ao buscar CEP'); }
});

// ==========================
// Cadastro de Imóveis
// ==========================
document.getElementById('formCadastro')?.addEventListener('submit', async e=>{
  e.preventDefault();

  const titulo = document.getElementById('titulo').value.trim();
  const tipo = document.getElementById('tipo').value;
  const subtipo = document.getElementById('subtipo').value.trim();
  const pronto = document.getElementById('pronto')?.value === 'true';
  const cep = document.getElementById('cep').value.trim();
  const cidade = document.getElementById('cidade').value.trim();
  const estado = document.getElementById('estado').value.trim();
  const banheiros = Number(document.getElementById('banheiros').value)||0;
  const garagem = Number(document.getElementById('garagem').value)||0;
  const area = Number(document.getElementById('area').value)||0;
  const valor = Number(document.getElementById('valor').value)||0;
  const iptu = Number(document.getElementById('iptu').value)||0;
  const precoM2 = Number(document.getElementById('precoM2').value)||0;
  const descricao = document.getElementById('descricao').value.trim();

  const fotosFiles = document.getElementById('fotos').files;
  const docsFiles = document.getElementById('docs').files;

  const fotosUrls = [];
  const docsUrls = [];

  // Upload das fotos
  for(const foto of fotosFiles){
    const refFoto = ref(storage, `imoveis/${Date.now()}_${foto.name}`);
    await uploadBytes(refFoto, foto);
    fotosUrls.push(await

