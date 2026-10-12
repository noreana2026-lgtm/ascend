// Shim de persistencia: reemplaza el window.storage del entorno de artifacts
// por una implementación async sobre localStorage, mismo contrato.
const storage = {
  async get(k){ try{ const v=localStorage.getItem(k); return v===null?null:{key:k,value:v}; }catch{ return null; } },
  async set(k,v){ try{ localStorage.setItem(k,String(v)); return {key:k,value:v}; }catch{ return null; } },
  async delete(k){ try{ localStorage.removeItem(k); return {key:k,deleted:true}; }catch{ return null; } },
  async list(p=''){ try{ return {keys:Object.keys(localStorage).filter(k=>k.startsWith(p))}; }catch{ return {keys:[]}; } },
};
if (typeof window!=='undefined' && !window.storage) window.storage = storage;
export default storage;
