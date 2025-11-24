// funções utilitárias usadas pelas páginas (carregadas via <script src="script.js">)
const ScriptUtil = {
  formatCurrency(v){ return Number(v||0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' }); }
};

// expor StorageLib global para páginas
if (typeof window !== 'undefined') window.StorageLib = StorageLib;
