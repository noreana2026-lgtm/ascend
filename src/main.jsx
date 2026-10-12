import React from 'react';
import ReactDOM from 'react-dom/client';
import './lib/storage.js';   // instala window.storage antes de montar
import { fetchPlayers } from './lib/supabase.js';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

function Loading() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'#0b0b0b',color:'#C9A227',fontFamily:'system-ui,sans-serif',fontWeight:800,fontSize:18}}>
      Cargando ASCEND…
    </div>
  );
}
function ErrorBox({msg}) {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'#0b0b0b',color:'#e5533c',fontFamily:'system-ui,sans-serif',padding:24,textAlign:'center'}}>
      No se pudieron cargar los datos.<br/>{msg}
    </div>
  );
}

async function boot() {
  root.render(<Loading/>);
  try {
    const players = await fetchPlayers();
    if (players && players.length) globalThis.__ASCEND_PLAYERS__ = players;
  } catch (e) {
    console.warn('Supabase no disponible, uso respaldo local:', e);
  }
  try {
    const { default: App } = await import('./App.jsx');
    root.render(<App/>);
  } catch (e) {
    console.error(e);
    root.render(<ErrorBox msg={String(e)}/>);
  }
}
boot();
