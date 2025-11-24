// script.js
import { auth, db, storage } from './firebase.js';
import { collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// Proteção de acesso
auth.onAuthStateChanged(user => { if(!user) location.href='index.html'; });

// Logout
document.getElementById('logout')?.addEventListener('click', async e=>{
  e.preventDefault();
  await auth.signOut();
  location.href='index.html';
});

// Buscar CEP
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

// Cadastro
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

  for(const foto of fotosFiles){
    const refFoto = ref(storage, `imoveis/${foto.name}`);
    await uploadBytes(refFoto, foto);
    fotosUrls.push(await getDownloadURL(refFoto));
  }

  for(const doc of docsFiles){
    const refDoc = ref(storage, `imoveis/${doc.name}`);
    await uploadBytes(refDoc, doc);
    docsUrls.push(await getDownloadURL(refDoc));
  }

  // ID sequencial
  const q = query(collection(db,'imoveis'), orderBy('createdAt','desc'), limit(1));
  const last = await getDocs(q);
  let nextId = 'IMV001';
  if(!last.empty){
    const lastId = last.docs[0].data().id;
    const num = Number(lastId.replace('IMV','')) + 1;
    nextId = 'IMV'+String(num).padStart(3,'0');
  }

  await addDoc(collection(db,'imoveis'), {
    id: nextId, titulo, tipo, subtipo, pronto, cep, cidade, estado,
    banheiros, garagem, area, valor, iptu, precoM2, descricao,
    fotos: fotosUrls, docs: docsUrls, createdAt: new Date()
  });

  alert('Imóvel cadastrado!');
  location.href='imoveis.html';
});

// Limpar formulário
document.getElementById('limparBtn')?.addEventListener('click', ()=>document.getElementById('formCadastro').reset());
