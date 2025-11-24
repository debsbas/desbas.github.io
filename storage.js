// StorageLib: salva e recupera imóveis em localStorage com ID sequencial IMV001...
const StorageLib = (function(){
  const KEY = 'waped_imoveis_v1';
  const KEY_SEQ = 'waped_imoveis_seq';
  function _all(){
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  }
  function _saveAll(arr){
    localStorage.setItem(KEY, JSON.stringify(arr));
  }
  function _nextId(){
    let n = Number(localStorage.getItem(KEY_SEQ) || 0);
    n = n + 1;
    localStorage.setItem(KEY_SEQ, String(n));
    return 'IMV' + String(n).padStart(3,'0');
  }
  return {
    save(obj){
      const arr = _all();
      const id = _nextId();
      const now = new Date().toISOString();
      const item = Object.assign({ id, createdAt: now }, obj);
      arr.unshift(item);
      _saveAll(arr);
      return item;
    },
    getAll(){ return _all(); },
    get(id){ return _all().find(x=>x.id===id) || null; },
    remove(id){
      const arr = _all().filter(x=>x.id!==id);
      _saveAll(arr);
    },
    clear(){ localStorage.removeItem(KEY); localStorage.removeItem(KEY_SEQ); },
    lastId(){ const n = Number(localStorage.getItem(KEY_SEQ) || 0); return n ? 'IMV'+String(n).padStart(3,'0') : null; },
    getAllSorted(){ return _all().slice().sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)); }
  };
})();
