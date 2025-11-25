// script.js (versão corrigida completa)
// centraliza comportamento que pode rodar em várias páginas
import { auth, db, storage } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

/*
  Nota importante:
  - ESTE script é carregado em páginas públicas e privadas.
  - Para evitar que público seja forçado a logar, só aplicamos o
    redirecionamento se a <body> tiver data-require-auth="true".
*/

// ---------- Proteção de acesso condicional ----------
const requireAuth = document.body && document.body.dataset.requireAuth === "true";
if (requireAuth) {
  // só faz essa checagem em páginas que explicitamente exigem autenticação
  auth.onAuthStateChanged(user => { 
    if (!user) location.href = 'login.html';
  });
}

// ---------- Logout (aplica onde houver elemento #logout ou #logout2) ----------
document.getElementById('logout')?.addEventListener('click', async e=>{
  e.preventDefault();
  await signOut(auth);
  sessionStorage.removeItem('waped_user');
  location.href='index.html';
});
document.getElementById('logout2')?.addEventListener('click', async e=>{
  e.preventDefault();
  await signOut(auth);
  sessionStorage.removeItem('waped_user');
  location.href='index.html';
});

// ---------- Buscar CEP (se existir o botão) ----------
document.getElementById('buscarCep')?.addEventListener('click', async ()=>{
  const cepEl = document.getElementById('cep');
  if(!cepEl) return;
  const cep = (cepEl.value||'').replace(/\D/g,'');
  if(!cep) return alert('Informe o CEP');
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if(data.erro) return alert('CEP não encontrado');
    document.getElementById('cidade').value = data.localidade || '';
    document.getElementById('estado').value = data.uf || '';
  } catch(err) {
    console.error(err);
    alert('Erro ao buscar CEP');
  }
});

// ---------- Cadastro de Imóveis (se houver formulário) ----------
document.getElementById('formCadastro')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // coletar campos (se algum campo não existir, usamos fallback)
  const titulo = document.getElementById('titulo')?.value.trim() || '';
  const tipo = document.getElementById('tipo')?.value || '';
  const cep = document.getElementById('cep')?.value.trim() || '';
  const cidade = document.getElementById('cidade')?.value.trim() || '';
  const estado = document.getElementById('estado')?.value.trim() || '';
  const banheiros = Number(document.getElementById('banheiros')?.value) || 0;
  const garagem = Number(document.getElementById('garagem')?.value) || 0;
  const area = Number(document.getElementById('area')?.value) || 0;
  const valor = Number(document.getElementById('valor')?.value) || 0;
  const iptu = Number(document.getElementById('iptu')?.value) || 0;
  const agio = Number(document.getElementById('agio')?.value) || 0;
  const descricao = document.getElementById('descricao')?.value.trim() || '';

  // arquivos
  const fotosFiles = document.getElementById('fotos')?.files || [];
  const docsFiles = document.getElementById('docs')?.files || [];

  // arrays para urls
  const fotosUrls = [];
  const docsUrls = [];

  try {
    // upload fotos (se houver)
    for (let i = 0; i < fotosFiles.length; i++) {
      const f = fotosFiles[i];
      const nome = `${Date.now()}_${f.name}`;
      const r = ref(storage, `imoveis/${nome}`);
      await uploadBytes(r, f);
      const url = await getDownloadURL(r);
      fotosUrls.push(url);
    }

    // upload docs (se houver)
    for (let i = 0; i < docsFiles.length; i++) {
      const f = docsFiles[i];
      const nome = `${Date.now()}_${f.name}`;
      const r = ref(storage, `imoveis/${nome}`);
      await uploadBytes(r, f);
      const url = await getDownloadURL(r);
      docsUrls.push(url);
    }

    // gerar id sequencial simples (pega último e incrementa)
    const q = query(collection(db,'imoveis'), orderBy('createdAt','desc'), limit(1));
    const lastSnap = await getDocs(q);
    let nextId = 'IMV001';
    if (!lastSnap.empty) {
      const lastData = lastSnap.docs[0].data();
      if (lastData && lastData.id) {
        const num = Number((lastData.id||'IMV000').replace(/\D/g,'')) + 1;
        nextId = 'IMV' + String(num).padStart(3,'0');
      }
    }

    // montar payload
    const payload = {
      id: nextId,
      titulo, tipo, cep, cidade, estado,
      banheiros, garagem, area, valor, iptu, agio, descricao,
      fotos: fotosUrls, docs: docsUrls,
      createdAt: serverTimestamp()
    };

    // salvar no Firestore
    await addDoc(collection(db,'imoveis'), payload);

    alert('Imóvel salvo com sucesso!');
    // redireciona para dashboard (ou imoveis)
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error('Erro ao salvar imóvel:', err);
    alert('Erro ao salvar imóvel. Veja o console.');
  }
});

// ---------- Listagem e filtros (páginas que usam buscarimoveis) ----------
export async function fetchAllImoveis() {
  const snap = await getDocs(collection(db,'imoveis'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ---------- Utility: se precisar carregar estatísticas no dashboard ----------
export async function loadStatsToDom() {
  try {
    const all = await fetchAllImoveis();
    document.getElementById('statTotal') && (document.getElementById('statTotal').innerText = all.length);
    document.getElementById('statFotos') && (document.getElementById('statFotos').innerText = all.reduce((s,i)=>s+(i.fotos?.length||0),0));
    const total = all.reduce((s,i)=>s+(Number(i.valor)||0),0);
    document.getElementById('statValor') && (document.getElementById('statValor').innerText = 'R$ ' + total.toLocaleString());
  } catch(err) {
    console.error('Erro ao carregar stats', err);
  }
}
