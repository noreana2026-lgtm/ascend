import { useState, useEffect, useRef } from 'react';
import { RotateCcw, Trophy, X, Info, Shuffle, Dices, Calendar, Sun, Moon, ArrowLeftRight, Home, User, Users, Award, Lock, ChevronRight, ChevronLeft, Share2, BarChart3, Gamepad2, Search, DollarSign } from 'lucide-react';

import { PLAYERS as SEED_PLAYERS } from './data/players.js';
// Datos: los inyecta main.jsx desde Supabase antes de importar este módulo.
// Si Supabase no respondiera, se usa el respaldo local (SEED_PLAYERS).
const PLAYERS = (typeof globalThis !== 'undefined' && Array.isArray(globalThis.__ASCEND_PLAYERS__) && globalThis.__ASCEND_PLAYERS__.length)
  ? globalThis.__ASCEND_PLAYERS__ : SEED_PLAYERS;

PLAYERS.forEach(p=>{ if(p.liga===undefined) p.liga="Liga EBA"; if(p.grupo===undefined) p.grupo="B"; });
const TEAMS = [...new Set(PLAYERS.map(p=>p.eq))];
const TEAM_SHORT = {"NCS ALCOBENDAS":"Alcobendas","REAL MADRID":"Real Madrid","GRAN CANARIA":"Gran Canaria","EUROCOLEGIO CASVI":"Casvi","MOVISTAR ESTUDIANTES":"Estudiantes"};
const TEAM_COLOR = {"NCS ALCOBENDAS":"#2E6FB7","REAL MADRID":"#7C8390","GRAN CANARIA":"#D4A017","EUROCOLEGIO CASVI":"#E0662A","MOVISTAR ESTUDIANTES":"#2E9E5B"};
const SEASONS = [...new Set(PLAYERS.map(p=>p.temp))].sort();
const SEA_SHORT = {"2014/2015":"14/15","2015/2016":"15/16","2016/2017":"16/17","2017/2018":"17/18","2018/2019":"18/19","2019/2020":"19/20"};
TEAMS.forEach(t=>{ if(!(t in TEAM_SHORT)) TEAM_SHORT[t]=t.length>13?t.slice(0,13)+"…":t; if(!(t in TEAM_COLOR)) TEAM_COLOR[t]="#C9A227"; });
SEASONS.forEach(s=>{ if(!(s in SEA_SHORT)) SEA_SHORT[s]=(s.length>=9?s.slice(2,4)+"/"+s.slice(7,9):s); });
const LIGAS = [...new Set(PLAYERS.map(p=>p.liga))];
const GRUPOS_OF = (ls)=>[...new Set(PLAYERS.filter(p=>ls.has(p.liga)).map(p=>p.grupo))].sort();
const STAT_KEYS=[["pt","PTS"],["reb","REB"],["ast","AST"],["stl","ROB"],["blk","TAP"],["va","VA"]];
const _PID = p => p.eq+"|"+p.n+"|"+p.temp;
const TOP10 = {};
STAT_KEYS.forEach(([k])=>{ TOP10[k]=PLAYERS.slice().sort((a,b)=>(b[k]||0)-(a[k]||0)).slice(0,10).map(_PID); });
const psStars = p => STAT_KEYS.map(([k,lab])=>{ const r=TOP10[k].indexOf(_PID(p)); return r>=0?{k,lab,rank:r+1}:null; }).filter(Boolean);
const nameStars = name => STAT_KEYS.map(([k,lab])=>{ let best=99; PLAYERS.forEach(p=>{ if(p.n===name){ const r=TOP10[k].indexOf(_PID(p)); if(r>=0&&r+1<best) best=r+1; } }); return best<99?{k,lab,rank:best}:null; }).filter(Boolean);
const STAT_FULL={pt:"Puntos",reb:"Rebotes",ast:"Asistencias",stl:"Robos",blk:"Tapones",va:"Valoración"};
const STAT_MAX=(()=>{ const m={}; STAT_KEYS.forEach(([k])=>{ m[k]=Math.max(1,...PLAYERS.map(p=>p[k]||0)); }); return m; })();
const STAT_SORTED=(()=>{ const m={}; STAT_KEYS.forEach(([k])=>{ m[k]=PLAYERS.map(p=>p[k]||0).sort((a,b)=>a-b); }); return m; })();
function topPct(k,v){ const a=STAT_SORTED[k]; let lo=0,hi=a.length; while(lo<hi){ const mid=(lo+hi)>>1; if(a[mid]<v) lo=mid+1; else hi=mid; } return Math.max(1,Math.round((a.length-lo)/a.length*100)); }
function StarBadge({rank, lab, C, worded}){
  if(worded) return (
    <span style={{display:"inline-flex", alignItems:"center", gap:5, background:C.panel2, border:`1px solid ${C.gold}`, borderRadius:20, padding:"3px 11px 3px 8px"}}>
      <span style={{fontSize:13, lineHeight:1, color:C.gold}}>★</span>
      <span style={{fontSize:11.5, fontWeight:800, color:C.gold, whiteSpace:"nowrap"}}><b style={{fontWeight:900}}>{rank}º</b> en {lab}</span>
    </span>
  );
  return (
    <span style={{display:"inline-flex", alignItems:"center", gap:3, background:C.panel2, border:`1px solid ${C.gold}`, borderRadius:20, padding:"1px 6px 1px 3px"}}>
      <span style={{position:"relative", display:"inline-flex", width:13, height:13, alignItems:"center", justifyContent:"center"}}>
        <span style={{position:"absolute", fontSize:13, lineHeight:1, color:C.gold}}>★</span>
        <span style={{position:"relative", fontSize:6.5, fontWeight:900, color:"#0b0b0b"}}>{rank}</span>
      </span>
      <span style={{fontSize:8.5, fontWeight:800, color:C.gold, whiteSpace:"nowrap"}}>{lab}</span>
    </span>
  );
}
function careerOf(name){ const rows=PLAYERS.filter(p=>p.n===name).slice().sort((a,b)=>a.temp<b.temp?-1:1); const g=rows.reduce((s,p)=>s+p.part,0)||1; const agg=k=>Math.round(rows.reduce((s,p)=>s+(p[k]||0)*p.part,0)/g*10)/10; const teams=[...new Set(rows.map(p=>p.eq))]; const pos=[...new Set(rows.flatMap(p=>p.pos))]; return {rows, games:rows.reduce((s,p)=>s+p.part,0), pt:agg("pt"),reb:agg("reb"),ast:agg("ast"),stl:agg("stl"),blk:agg("blk"),va:agg("va"), teams, pos, seasons:rows.length}; }
function analyzePlayer(c){ const S=[],W=[],plan=[];
  if(c.pt>=14) S.push("Anotador principal: castiga cualquier espacio."); else if(c.pt<=4) W.push("Poca presencia anotadora.");
  if(c.reb>=7) S.push("Domina el rebote en ambos aros."); else if(c.reb<=2) W.push("Aporta muy poco al rebote.");
  if(c.ast>=3.5) S.push("Genera juego y lee bien al rival."); else if(c.ast<=0.7) W.push("No distribuye; juego muy directo.");
  if(c.stl>=1.2) S.push("Manos activas: roba e interrumpe líneas de pase.");
  if(c.blk>=0.9) S.push("Protege el aro con tapones."); else if(c.blk<=0.1) W.push("Nula presencia en el tapón.");
  if(c.va>=15) S.push("Valoración de élite: impacto integral."); else if(c.va<=3) W.push("Impacto global limitado.");
  if(c.pt>=14) plan.push("Defensa individual ajustada con ayudas tempranas; niégale su mano buena.");
  if(c.reb>=7) plan.push("Box-out constante y baja a colaborar al rebote defensivo.");
  if(c.ast>=3.5) plan.push("Presiona la línea de pase y corta el primer pase tras bote.");
  if(c.blk>=0.9) plan.push("Atácale en carrera y con fintas para sacarle del aro.");
  if(c.pt<=6&&c.ast<=1) plan.push("Puedes ayudar desde su lado: no te castiga en el 1c1.");
  if(!plan.length) plan.push("Defensa estándar; fuérzale a decidir lejos de su zona cómoda.");
  if(!S.length) S.push("Perfil de complemento, sin un punto dominante claro.");
  if(!W.length) W.push("Sin debilidades marcadas en su perfil.");
  return {S,W,plan}; }
const POSITIONS = ["Base","Escolta","Alero","Ala-pívot","Pívot"];
const POS_SHORT = {"Base":"Base","Escolta":"Escolta","Alero":"Alero","Ala-pívot":"Ala-piv","Pívot":"Pívot"};
const POS_COLOR = {"Base":"#4FA3FF","Escolta":"#46B96E","Alero":"#E8B23A","Ala-pívot":"#E0883C","Pívot":"#E0556B"};

const DARK = { bg:"#0E0E0E", panel:"#1B1B1B", panel2:"#151515", line:"#3A3A3A",
  gold:"#E8B23A", text:"#F5EFE2", muted:"#9C968A", win:"#46B96E", loss:"#E0554C", ctaText:"#161106" };
const LIGHT = { bg:"#FFFFFF", panel:"#F3F1EA", panel2:"#FAF8F2", line:"#DAD5C9",
  gold:"#B8860B", text:"#141414", muted:"#6B675E", win:"#1F9E55", loss:"#C8362F", ctaText:"#FFFFFF" };

const SLOTS = 5, GAMES = 30, BONUS = 3, BUDGET = 18;
const fmt = x => (Math.round(x*10)/10).toString().replace('.', ',');
const surname = n => n.split(',')[0].split(' ').slice(0,2).join(' ');
function fullName(n){ const parts=n.split(','); const cap=s=>s.toLowerCase().replace(/(^|[\s\-])([a-záéíóúñü])/g,(m,a,b)=>a+b.toUpperCase());
  return parts[1]?`${cap(parts[1].trim())} ${cap(parts[0].trim())}`:cap(parts[0].trim()); }
const pid = p => p.n+"|"+p.eq+"|"+p.temp;
const hasRodrigo = pks => pks.some(p=>p.n.indexOf("RODRIGO YANGUAS")===0);
const priceOf = va => Math.max(1, Math.min(6, Math.round(va/3)));

const BY_NAME = (()=>{ const m={}; PLAYERS.forEach(p=>{ (m[p.n]=m[p.n]||[]).push(p); }); return m; })();

const POS5 = ["Base","Escolta","Alero","Ala-pívot","Pívot"];
function eliteQuintetVA(pool){
  return POS5.reduce((s,pos)=>{ let mx=0; for(const p of pool){ if(p.pos.indexOf(pos)>=0 && p.va>mx) mx=p.va; } return s+mx; },0);
}
const ELITE_GLOBAL = eliteQuintetVA(PLAYERS) || 1;

const KN_NORMAL = [[40,0.10],[55,0.48],[63,0.60],[72,0.72],[82,0.84],[92,0.91],[102,0.96]];
const KN_MONEY  = [[18,0.10],[30,0.44],[40,0.56],[50,0.70],[60,0.82],[72,0.91],[86,0.96]];
function winProb(v, table){
  const K=table||KN_NORMAL;
  if(v<=K[0][0]) return K[0][1];
  if(v>=K[K.length-1][0]) return K[K.length-1][1];
  for(let i=0;i<K.length-1;i++){ if(v<=K[i+1][0]){ const [x0,y0]=K[i],[x1,y1]=K[i+1]; return y0+(y1-y0)*(v-x0)/(x1-x0); } }
  return 0.5;
}

const BADGES = [
  {id:'playoffs', cat:'Rendimiento', scope:'game', name:'A los playoffs', emoji:'🎟️', desc:'Consigue 20+ victorias.', test:r=>r.wins>=20},
  {id:'ascenso', cat:'Rendimiento', scope:'game', name:'Ascenso', emoji:'⬆️', desc:'Consigue 26+ victorias.', test:r=>r.wins>=26},
  {id:'invicto', cat:'Rendimiento', scope:'game', name:'Invicto 30-0', emoji:'🏆', desc:'Completa una temporada perfecta.', test:r=>r.wins>=30},
  {id:'oro', cat:'Rendimiento', scope:'game', name:'Quinteto de oro', emoji:'⭐', desc:'Suma 90+ de valoración.', test:r=>r.teamVal>=90},
  {id:'chollo', cat:'Rendimiento', scope:'game', name:'Chollo', emoji:'💰', desc:'20+ victorias en modo Money.', test:r=>r.money&&r.wins>=20},
  {id:'trotamundos', cat:'Rendimiento', scope:'game', name:'Trotamundos', emoji:'🌍', desc:'5 equipos distintos en el quinteto.', test:r=>r.teams>=5},
  {id:'tiempo', cat:'Rendimiento', scope:'game', name:'Viaje en el tiempo', emoji:'⏳', desc:'4 temporadas distintas en el quinteto.', test:r=>r.seasons>=4},
  {id:'pulso', cat:'Rendimiento', scope:'game', name:'Pulso firme', emoji:'🧊', desc:'20+ victorias sin gastar ningún cambio.', test:r=>r.wins>=20&&r.changes===0},
  {id:'muralla', cat:'Rendimiento', scope:'game', name:'Muralla', emoji:'🛡️', desc:'12+ robos+tapones por partido.', test:r=>(r.stl+r.blk)>=12},
  {id:'artilleria', cat:'Rendimiento', scope:'game', name:'Artillería', emoji:'🎯', desc:'70+ puntos por partido.', test:r=>r.pt>=70},
  {id:'debut', cat:'Constancia', scope:'cum', name:'Debut', emoji:'🎫', desc:'Juega tu primera temporada.', test:s=>s.games>=1},
  {id:'habitual', cat:'Constancia', scope:'cum', name:'Habitual', emoji:'🗓️', desc:'Juega 10 temporadas.', test:s=>s.games>=10},
  {id:'maraton', cat:'Constancia', scope:'cum', name:'Maratón', emoji:'🏃', desc:'Juega 25 temporadas.', test:s=>s.games>=25},
  {id:'ojeador', cat:'Constancia', scope:'cum', name:'Ojeador', emoji:'🔍', desc:'Escoge 100 jugadores en total.', test:s=>s.players>=100},
  {id:'coleccionista', cat:'Constancia', scope:'cum', name:'Coleccionista', emoji:'💎', desc:'Acumula 1500 de valoración.', test:s=>s.vaSum>=1500},
  {id:'ganador', cat:'Constancia', scope:'cum', name:'Ganador nato', emoji:'🥇', desc:'Acumula 200 victorias en total.', test:s=>s.wins>=200},
];
const EMPTY_STATS = {games:0, players:0, vaSum:0, wins:0, perfect:0};

function MoneyMini({ C, onDone }){
  const SHOTS = 3;
  const [shot, setShot] = useState(0);
  const [step, setStep] = useState(0);
  const [log, setLog] = useState([]);
  const [flash, setFlash] = useState(null);
  const [ended, setEnded] = useState(false);
  const hRef = useRef(null), vRef = useRef(null);
  const raf = useRef(0);
  const st = useRef({ x:0.5, y:0.5, yLock:0.5, xLock:0.5, t0:0 });
  const speed = 1 + shot*0.65;
  const K = 2.6 + shot*0.7;
  const acc = pos => Math.exp(-K * Math.abs(pos-0.5) * 2);
  useEffect(()=>{
    if(ended || flash) return;
    let alive = true;
    const tri = u => { u=((u%1)+1)%1; return u<0.5 ? u*2 : 2-u*2; };
    st.current.t0 = 0;
    const loop = now => {
      if(!alive) return;
      const s = st.current; if(!s.t0) s.t0 = now; const tt=(now-s.t0)/1000;
      if(step===0){ s.y = tri(tt*speed*0.55); if(hRef.current) hRef.current.style.top = (s.y*100)+"%"; }
      else { s.x = tri(tt*speed*0.64 + 0.13); if(vRef.current) vRef.current.style.left = (s.x*100)+"%"; }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return ()=>{ alive=false; cancelAnimationFrame(raf.current); };
  }, [step, shot, ended, flash]);
  const tap = () => {
    if(flash || ended) return;
    if(step===0){ st.current.yLock = st.current.y; setStep(1); return; }
    const xv = st.current.x; st.current.xLock = xv;
    const prob = (acc(st.current.yLock) + acc(xv)) / 2;
    const made = Math.random() < prob;
    const val = shot + 1;
    setFlash({ made, prob, val });
    setTimeout(()=>{
      const nl = [...log, { val, made, prob }];
      setLog(nl); setFlash(null);
      if(shot+1 >= SHOTS){
        const bonus = nl.reduce((s,e)=> s + (e.made ? e.val : 0), 0);
        setEnded(true);
        setTimeout(()=> onDone(bonus), 1300);
      } else { setShot(shot+1); setStep(0); }
    }, 1150);
  };
  const running = log.reduce((s,e)=> s + (e.made ? e.val : 0), 0);
  return (
    <div className="px-4 pt-3">
      <div style={{fontWeight:900, fontSize:20}}>Tiro previo · Modo Money</div>
      <div style={{color:C.muted, fontSize:12, marginTop:2, marginBottom:10}}>Mete tiros para ganar saldo extra. Tiro 1 = +1€, 2 = +2€, 3 = +3€. Si fallas, 0€ (no resta). ¡Cada ronda cuesta más acertar!</div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1.5">
          {[1,2,3].map(v=>{ const e=log[v-1]; const cur=(v-1===shot)&&!ended; const bg = e ? (e.made?C.win:C.loss) : (cur?C.gold:C.panel2); const col = (e||cur) ? "#0b0b0b" : C.muted; return <div key={v} style={{minWidth:34, textAlign:"center", fontWeight:900, fontSize:13, padding:"3px 8px", borderRadius:8, background:bg, color:col, border:`1px solid ${e?bg:C.line}`}}>€{v}</div>; })}
        </div>
        <div style={{fontWeight:900, fontSize:15, color: running>0?C.win:C.muted}}>+€{running}</div>
      </div>
      <div onClick={tap} style={{position:"relative", width:"100%", aspectRatio:"1 / 1", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:16, overflow:"hidden", cursor:"pointer", userSelect:"none"}}>
        <div style={{position:"absolute", left:"50%", top:"50%", width:54, height:54, transform:"translate(-50%,-50%)", border:`2px dashed ${C.gold}`, borderRadius:"50%", opacity:0.5}}/>
        <div style={{position:"absolute", left:"50%", top:"50%", width:8, height:8, transform:"translate(-50%,-50%)", background:C.gold, borderRadius:"50%"}}/>
        <div ref={hRef} style={{position:"absolute", left:0, right:0, top:(step===0?"50%":(st.current.yLock*100)+"%"), height:0, borderTop:`2px solid ${step===0?C.text:C.gold}`, boxShadow:`0 0 8px ${C.gold}`}}/>
        {step===1 && <div ref={vRef} style={{position:"absolute", top:0, bottom:0, left:"50%", width:0, borderLeft:`2px solid ${C.text}`, boxShadow:`0 0 8px ${C.gold}`}}/>}
        {flash && (
          <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", background:"rgba(0,0,0,0.45)"}}>
            <div style={{fontWeight:900, fontSize:30, color: flash.made?C.win:C.loss}}>{flash.made?"¡CANASTA!":"FALLO"}</div>
            <div style={{fontWeight:900, fontSize:20, color: flash.made?C.win:C.loss}}>{flash.made?`+€${flash.val}`:"0€"}</div>
            <div style={{color:C.muted, fontSize:12, marginTop:4}}>Acierto {Math.round(flash.prob*100)}%</div>
          </div>
        )}
        {ended && (
          <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", background:"rgba(0,0,0,0.55)"}}>
            <div style={{fontWeight:900, fontSize:22, color:C.text}}>Saldo extra</div>
            <div style={{fontWeight:900, fontSize:34, color: running>0?C.win:C.gold}}>+€{running}</div>
            <div style={{color:C.muted, fontSize:12, marginTop:6}}>Empezando el modo Money…</div>
          </div>
        )}
      </div>
      {!ended && (<>
        <button onClick={tap} style={{width:"100%", height:52, marginTop:12, borderRadius:13, fontWeight:900, fontSize:16, background:C.gold, color:C.ctaText}}>{step===0 ? "Fija la línea horizontal" : "Fija la vertical y tira"}</button>
        <button onClick={()=>{ setEnded(true); setTimeout(()=>onDone(running),300); }} style={{width:"100%", height:40, marginTop:8, borderRadius:11, fontWeight:700, fontSize:13, background:"transparent", color:C.muted, border:`1px solid ${C.line}`}}>Saltar minijuego</button>
      </>)}
    </div>
  );
}

export default function App(){
  const [dark, setDark] = useState(true);
  const C = dark ? DARK : LIGHT;
  const [screen, setScreen] = useState("home");          // home | explore | play
  const [mode, setMode] = useState("solo");              // solo | money | versus
  const [vsMode, setVsMode] = useState("seq");
  const [vsTurn, setVsTurn] = useState(1);
  const [active, setActive] = useState(1);
  const [otherPicks, setOtherPicks] = useState([]);
  const [altTokens, setAltTokens] = useState({1:{team:false,year:false},2:{team:false,year:false}});
  const [vsResults, setVsResults] = useState([]);
  const [phase, setPhase] = useState("draft");
  const [picks, setPicks] = useState([]);
  const [team, setTeam] = useState(TEAMS[0]);
  const [temp, setTemp] = useState(SEASONS[1]);
  const [spinTeam, setSpinTeam] = useState(false);
  const [spinYear, setSpinYear] = useState(false);
  const [teamChangeUsed, setTeamChangeUsed] = useState(false);
  const [yearChangeUsed, setYearChangeUsed] = useState(false);
  const [moved, setMoved] = useState(false);
  const [pendingPick, setPendingPick] = useState(null);
  const [pendingMove, setPendingMove] = useState(null);
  const [pendingSell, setPendingSell] = useState(null);
  const [bonusBudget, setBonusBudget] = useState(0);
  const [sold, setSold] = useState(false);
  const [selLigas, setSelLigas] = useState(()=>new Set(LIGAS));
  const [selGrupos, setSelGrupos] = useState(()=>new Set(GRUPOS_OF(new Set(LIGAS))));
  const [selYears, setSelYears] = useState(()=>new Set(SEASONS));
  const [setupMode, setSetupMode] = useState(null);
  const gameUni = PLAYERS.filter(p=> selLigas.has(p.liga) && selGrupos.has(p.grupo) && selYears.has(p.temp));
  const activeTeams = [...new Set(gameUni.map(p=>p.eq))];
  const activeSeasons = [...new Set(gameUni.map(p=>p.temp))].sort();
  const eliteSel = eliteQuintetVA(gameUni);
  const scaleVA = eliteSel>0 ? Math.min(2.2, Math.max(0.85, ELITE_GLOBAL/eliteSel)) : 1;
  const [season, setSeason] = useState([]);
  const [revealed, setRevealed] = useState(0);
  const [best, setBest] = useState(null);
  const [history, setHistory] = useState([]);
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [justEarned, setJustEarned] = useState([]);
  const [toast, setToast] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [showHist, setShowHist] = useState(false);
  const [showVsChoice, setShowVsChoice] = useState(false);
  const [expSeasons, setExpSeasons] = useState(new Set());
  const [expQuery, setExpQuery] = useState("");
  const [expPlayer, setExpPlayer] = useState(null);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [addTeamLink, setAddTeamLink] = useState("");
  const [pendingTeams, setPendingTeams] = useState([]);
  const [expTab, setExpTab] = useState("comparar");
  const [cmpA, setCmpA] = useState(null);
  const [cmpB, setCmpB] = useState(null);
  const [cmpPick, setCmpPick] = useState(null);
  const [pkTeam, setPkTeam] = useState(null);
  const [pkYear, setPkYear] = useState(null);
  const [rkStat, setRkStat] = useState("pt");
  const [rkMode, setRkMode] = useState("avg");
  const [rkSeason, setRkSeason] = useState("");
  const [rkTeam, setRkTeam] = useState("");
  const [rkLiga, setRkLiga] = useState("");
  const [rkGrupo, setRkGrupo] = useState("");
  const [pvName, setPvName] = useState(null);
  const [pvAnalysis, setPvAnalysis] = useState(false);
  const [pvCmp, setPvCmp] = useState(null);
  const [pvPick, setPvPick] = useState(false);
  const [difficulty, setDifficulty] = useState(0);
  const spinRef = useRef(null), simRef = useRef(null), toastRef = useRef(null);
  const spinning = spinTeam || spinYear;
  const isAlt = mode==="versus" && vsMode==="alt";
  const isMoney = mode==="money";
  const curPlayer = mode==="versus" ? (isAlt?active:vsTurn) : null;
  const curve = isMoney ? KN_MONEY : KN_NORMAL;

  const pickedIds = new Set(picks.map(x=>x.pid));
  const filledPos = new Set(picks.map(x=>x.slot));
  const openPos = POSITIONS.filter(x=>!filledPos.has(x));
  const complete = picks.length===SLOTS;
  const byPos = {}; picks.forEach(x=>byPos[x.slot]=x);
  const spent = picks.reduce((s,p)=>s+priceOf(p.va),0);
  const remaining = BUDGET + bonusBudget - spent;
  const eligOpen = p => p.pos.filter(pos=>openPos.includes(pos));
  const canAfford = p => priceOf(p.va) <= remaining - (SLOTS - picks.length - 1);
  const pickableP = p => !pickedIds.has(pid(p)) && eligOpen(p).length>0 && (!isMoney || canAfford(p));

  useEffect(()=>{ (async()=>{
    try{ const r=await window.storage.get('feb300v7:best'); if(r) setBest(JSON.parse(r.value)); }catch(e){}
    try{ const h=await window.storage.get('feb300v7:history'); if(h) setHistory(JSON.parse(h.value)); }catch(e){}
    try{ const t=await window.storage.get('feb300v7:theme'); if(t) setDark(JSON.parse(t.value)); }catch(e){}
    try{ const bg=await window.storage.get('feb300v7:badges'); if(bg) setBadges(JSON.parse(bg.value)); }catch(e){}
    try{ const st=await window.storage.get('feb300v7:stats'); if(st) setStats({...EMPTY_STATS, ...JSON.parse(st.value)}); }catch(e){}
  })(); return ()=>{ clearInterval(spinRef.current); clearInterval(simRef.current); clearTimeout(toastRef.current); }; },[]);

  function toggleTheme(){ const d=!dark; setDark(d); window.storage.set('feb300v7:theme', JSON.stringify(d)).catch(()=>{}); }
  function flash(msg){ setToast(msg); clearTimeout(toastRef.current); toastRef.current=setTimeout(()=>setToast(""),2600); }

  function tier(w){
    if(w>=30) return {t:"¡HAS ASCENDIDO!", s:"Temporada perfecta 30-0", c:C.gold, kind:"asc"};
    if(w>=26) return {t:"Fase de ascenso", s:`${w} victorias · pelea por subir`, c:C.win, kind:"fase"};
    if(w>=20) return {t:"Playoffs", s:`${w} victorias · clasificado`, c:C.win, kind:"po"};
    if(w>=6)  return {t:"Sin nada en juego", s:`${w} victorias · mitad de tabla`, c:C.muted, kind:"mid"};
    return {t:"Has descendido", s:`${w} victorias · bajas de categoría`, c:C.loss, kind:"desc"};
  }

  function resetTurnState(){ setPicks([]); setSeason([]); setRevealed(0); setTeamChangeUsed(false); setYearChangeUsed(false);
    setMoved(false); setPendingPick(null); setPendingMove(null); setPendingSell(null); setSold(false); setJustEarned([]); }
  function startSolo(){ openSetup("solo"); }
  function startMoney(){ openSetup("money"); }
  function openSetup(m){ setSetupMode(m); setScreen("setup"); }
  function beginGame(){ if(setupMode==="versus"){ setShowVsChoice(true); return; } setScreen("play"); resetTurnState(); if(setupMode==="money"){ setMode("money"); setBonusBudget(0); setPhase("mini"); } else { setMode("solo"); setPhase("draft"); spinReels([],'both'); } }
  
  function startVersus(vm){ setMode("versus"); setVsMode(vm); setVsTurn(1); setActive(1); setOtherPicks([]);
    setAltTokens({1:{team:false,year:false},2:{team:false,year:false}}); setVsResults([]);
    setShowVsChoice(false); setScreen("play"); resetTurnState(); setPhase("draft"); spinReels([],'both'); }
  function goHome(){ clearInterval(spinRef.current); clearInterval(simRef.current); setScreen("home"); setPhase("draft"); }

  async function bumpStats(d){
    const ns={ games:stats.games+(d.games||0), players:stats.players+(d.players||0),
      vaSum:stats.vaSum+(d.vaSum||0), wins:stats.wins+(d.wins||0), perfect:stats.perfect+(d.perfect||0) };
    setStats(ns); try{ await window.storage.set('feb300v7:stats', JSON.stringify(ns)); }catch(e){}
    return ns;
  }
  async function unlock(ids){
    const fresh=ids.filter(id=>!badges.includes(id));
    if(fresh.length){ const nb=[...badges,...fresh]; setBadges(nb); try{ await window.storage.set('feb300v7:badges', JSON.stringify(nb)); }catch(e){} }
    return fresh;
  }

  function combosOpen(curPicks){
    const ids=new Set(curPicks.map(x=>x.pid)); const filled=new Set(curPicks.map(x=>x.slot));
    const open=POSITIONS.filter(x=>!filled.has(x));
    const rem=BUDGET + bonusBudget - curPicks.reduce((s,p)=>s+priceOf(p.va),0); const after=SLOTS-curPicks.length-1;
    const ok=(t,s)=>PLAYERS.some(p=>p.eq===t&&p.temp===s&&selLigas.has(p.liga)&&selGrupos.has(p.grupo)&&!ids.has(pid(p))&&p.pos.some(pos=>open.includes(pos))&&(!isMoney || priceOf(p.va)<=rem-after));
    return {ok};
  }
  function spinReels(curPicks, mode2){
    const {ok}=combosOpen(curPicks);
    const TT=activeTeams.length?activeTeams:TEAMS, SS=activeSeasons.length?activeSeasons:SEASONS;
    let tgtT=team, tgtS=temp;
    if(mode2==='both'){
      const combos=[]; for(const t of TT) for(const s of SS) if(ok(t,s)) combos.push([t,s]);
      const pool=combos.length?combos:[[TT[0],SS[1]||SS[0]]]; [tgtT,tgtS]=pool[Math.floor(Math.random()*pool.length)];
    } else if(mode2==='team'){
      let c=TT.filter(t=>t!==team&&ok(t,temp)); if(!c.length) c=TT.filter(t=>ok(t,temp)); if(!c.length) c=TT.filter(t=>t!==team);
      tgtT=c.length?c[Math.floor(Math.random()*c.length)]:team; tgtS=temp;
    } else {
      let c=SS.filter(s=>s!==temp&&ok(team,s)); if(!c.length) c=SS.filter(s=>ok(team,s)); if(!c.length) c=SS.filter(s=>s!==temp);
      tgtS=c.length?c[Math.floor(Math.random()*c.length)]:temp; tgtT=team;
    }
    const aT=(mode2==='both'||mode2==='team'), aS=(mode2==='both'||mode2==='year');
    if(aT) setSpinTeam(true); if(aS) setSpinYear(true);
    clearInterval(spinRef.current); let k=0;
    spinRef.current=setInterval(()=>{
      if(aT) setTeam(TT[Math.floor(Math.random()*TT.length)]);
      if(aS) setTemp(SS[Math.floor(Math.random()*SS.length)]);
      k++;
      if(k>11){ clearInterval(spinRef.current); setTeam(tgtT); setTemp(tgtS); setSpinTeam(false); setSpinYear(false); }
    },55);
  }
  function changeTeam(){ if(teamChangeUsed||spinning||complete) return; setTeamChangeUsed(true); if(isAlt) setAltTokens(t=>({...t,[active]:{...t[active],team:true}})); spinReels(picks,'team'); }
  function changeYear(){ if(yearChangeUsed||spinning||complete) return; setYearChangeUsed(true); if(isAlt) setAltTokens(t=>({...t,[active]:{...t[active],year:true}})); spinReels(picks,'year'); }

  const teamPlayers = PLAYERS.filter(p=>p.eq===team && p.temp===temp && selLigas.has(p.liga) && selGrupos.has(p.grupo));
  const rosterAll = [...teamPlayers].sort((a,b)=>b.pt-a.pt);

  const agg = picks.reduce((a,p)=>({pt:a.pt+p.pt,reb:a.reb+p.reb,ast:a.ast+p.ast,stl:a.stl+p.stl,blk:a.blk+p.blk}),{pt:0,reb:0,ast:0,stl:0,blk:0});
  const teamVal = picks.reduce((s,p)=>s+p.va,0);
  const projVal = picks.length ? (teamVal/picks.length)*5 : 0;
  const pGame = picks.length ? winProb(projVal*scaleVA, curve)*(1-difficulty) : 0;

  function draft(p){
    if(spinning||complete||!pickableP(p)) return;
    const opts=eligOpen(p);
    if(opts.length===1) commit(p,opts[0]); else setPendingPick({p,options:opts});
  }
  function commit(p,slot){
    const np=[...picks,{pid:pid(p),n:p.n,eq:p.eq,temp:p.temp,pt:p.pt,reb:p.reb,ast:p.ast,stl:p.stl,blk:p.blk,va:p.va,pos:p.pos,slot}];
    setPendingPick(null);
    if(isAlt){ commitAlt(np); return; }
    setPicks(np);
    if(np.length<SLOTS) spinReels(np,'both');
  }
  async function commitAlt(np){
    const other=otherPicks;
    if(np.length===SLOTS && other.length===SLOTS){
      const p1 = active===1?np:other, p2 = active===1?other:np;
      const r1=summaryFor(p1,simWins(p1)), r2=summaryFor(p2,simWins(p2));
      setVsResults([r1,r2]); setPicks(np); setPhase("compare");
      const ns=await bumpStats({games:2,players:10,vaSum:r1.val+r2.val,wins:r1.w+r2.w,perfect:(r1.w===30?1:0)+(r2.w===30?1:0)});
      unlock(BADGES.filter(b=>b.scope==='cum'&&b.test(ns)).map(b=>b.id));
      return;
    }
    if(other.length<SLOTS){
      const nx=active===1?2:1;
      setPicks(other); setOtherPicks(np); setActive(nx);
      setTeamChangeUsed(altTokens[nx].team); setYearChangeUsed(altTokens[nx].year);   // NO se renuevan
      spinReels(other,'both');
    } else { setPicks(np); spinReels(np,'both'); }   // el otro ya tiene 5: sigo sin renovar fichas
  }
  function altFreeFor(pk){ const occ=new Set(picks.filter(x=>x.pid!==pk.pid).map(x=>x.slot)); return pk.pos.filter(pos=>pos!==pk.slot && !occ.has(pos)); }
  function tapQuintet(pk){ if(phase!=='draft'||spinning) return; const alt=altFreeFor(pk); if(isMoney){ if(sold){ if(!alt.length) return; if(alt.length===1) move(pk,alt[0]); else setPendingMove({pick:pk,options:alt}); } else { setPendingSell({pick:pk,options:alt}); } return; } if(!alt.length) return; if(alt.length===1) move(pk,alt[0]); else setPendingMove({pick:pk,options:alt}); }
  function move(pk,slot){ setPicks(picks.map(x=>x.pid===pk.pid?{...x,slot}:x)); setPendingMove(null); setPendingSell(null); setMoved(true); }
  function sellPick(pk){ const np=picks.filter(x=>x.pid!==pk.pid); setPicks(np); setPendingSell(null); setSold(true); }
  useEffect(()=>{ (async()=>{ try{ const r=await window.storage.get("feb300v7:pendingTeams"); if(r&&r.value) setPendingTeams(JSON.parse(r.value)); }catch(e){} })(); },[]);
  async function saveTeamLink(){ const l=addTeamLink.trim(); if(!l) return; const np=[...pendingTeams,l]; setPendingTeams(np); setAddTeamLink(""); try{ await window.storage.set("feb300v7:pendingTeams", JSON.stringify(np)); }catch(e){} }
  async function delTeamLink(i){ const np=pendingTeams.filter((_,j)=>j!==i); setPendingTeams(np); try{ await window.storage.set("feb300v7:pendingTeams", JSON.stringify(np)); }catch(e){} }

  function simWins(pk){ const tv=pk.reduce((s,p)=>s+p.va,0); const pg=winProb(tv*scaleVA, KN_NORMAL); let w=0; for(let i=0;i<GAMES;i++) if(Math.random()<pg) w++; if(hasRodrigo(pk)) w=Math.min(GAMES,w+BONUS); return w; }
  function summaryFor(pk,w){
    const tv=pk.reduce((s,p)=>s+p.va,0);
    const ag=pk.reduce((a,p)=>({pt:a.pt+p.pt,reb:a.reb+p.reb,ast:a.ast+p.ast,stl:a.stl+p.stl,blk:a.blk+p.blk}),{pt:0,reb:0,ast:0,stl:0,blk:0});
    return { w, l:GAMES-w, val:Math.round(tv*10)/10, perfect:w===GAMES, titulo:tier(w).t, agg:ag,
      players: pk.map(p=>({n:surname(p.n),full:fullName(p.n),eq:TEAM_SHORT[p.eq],pos:p.slot,temp:SEA_SHORT[p.temp],pt:p.pt,reb:p.reb,ast:p.ast,stl:p.stl,blk:p.blk,va:p.va})) };
  }

  function simulate(){
    let res=Array.from({length:GAMES},()=>Math.random()<pGame);
    if(hasRodrigo(picks)){ let need=BONUS; res=res.map(w=>{ if(!w&&need>0){need--; return true;} return w; }); }
    setSeason(res); setRevealed(0); setPhase("sim");
    let i=0; simRef.current=setInterval(()=>{ i++; setRevealed(i); if(i>=GAMES){ clearInterval(simRef.current); finish(res); } },70);
  }
  async function finish(res){
    const w=res.filter(Boolean).length;
    if(mode==='versus'){
      const sm=summaryFor(picks,w);
      if(vsTurn===1){ setVsResults([sm]); setPhase("handoff"); }
      else {
        const r1=vsResults[0]; setVsResults([r1,sm]); setPhase("compare");
        const ns=await bumpStats({games:2,players:10,vaSum:r1.val+sm.val,wins:r1.w+sm.w,perfect:(r1.w===30?1:0)+(sm.w===30?1:0)});
        unlock(BADGES.filter(b=>b.scope==='cum'&&b.test(ns)).map(b=>b.id));
      }
      return;
    }
    setPhase("result");
    const entry={...summaryFor(picks,w), date:new Date().toISOString(), money:isMoney};
    const nh=[entry,...history].slice(0,12); setHistory(nh);
    const isBest=!best||w>best.w||(w===best.w&&entry.val>best.val); if(isBest) setBest(entry);
    try{ await window.storage.set('feb300v7:history', JSON.stringify(nh)); }catch(e){}
    if(isBest){ try{ await window.storage.set('feb300v7:best', JSON.stringify(entry)); }catch(e){} }
    const ns=await bumpStats({games:1,players:5,vaSum:teamVal,wins:w,perfect:w===30?1:0});
    const r={ wins:w, teamVal, pt:agg.pt, stl:agg.stl, blk:agg.blk, money:isMoney,
      teams:new Set(picks.map(p=>p.eq)).size, seasons:new Set(picks.map(p=>p.temp)).size,
      changes:(teamChangeUsed?1:0)+(yearChangeUsed?1:0), moved };
    const g=BADGES.filter(b=>b.scope==='game'&&b.test(r)).map(b=>b.id);
    const c=BADGES.filter(b=>b.scope==='cum'&&b.test(ns)).map(b=>b.id);
    const fresh=await unlock([...g,...c]); if(fresh.length) setJustEarned(fresh);
  }
  function nextVersus(){ setVsTurn(2); resetTurnState(); setPhase("draft"); spinReels([],'both'); }

  async function doShare(text){
    try{ if(navigator.share){ await navigator.share({text}); return; } }catch(e){ if(e&&e.name==='AbortError') return; }
    try{ await navigator.clipboard.writeText(text); flash("¡Copiado! Pégalo en WhatsApp"); }
    catch(e){ flash("Copia manual no disponible"); }
  }
  function gridEmoji(arr){ let s=""; for(let i=0;i<arr.length;i++){ s+=arr[i]?"🟩":"🟥"; if((i+1)%10===0&&i<arr.length-1) s+="\n"; } return s; }
  function shareSolo(){
    const fW=season.filter(Boolean).length;
    const quint=POSITIONS.map(pos=>byPos[pos]?fullName(byPos[pos].n):"").filter(Boolean).join(", ");
    const txt=`🏀 ASCEND — Liga EBA${isMoney?" · Money":""}\n${fW}-${GAMES-fW} · ${tier(fW).t}\n${gridEmoji(season)}\nValoración ${fmt(teamVal)}\nQuinteto: ${quint}`;
    doShare(txt);
  }
  function shareVersus(a,bv,winner,tie){
    const txt=`🏀 ASCEND — Duelo\nJugador 1: ${a.w}-${a.l} (VA ${fmt(a.val)})\nJugador 2: ${bv.w}-${bv.l} (VA ${fmt(bv.val)})\n${tie?"¡Empate!":"Gana el Jugador "+winner+" 👑"}`;
    doShare(txt);
  }

  const wins=season.slice(0,revealed).filter(Boolean).length, losses=revealed-wins;
  const finalW=season.filter(Boolean).length;
  const T = phase==="result" ? tier(finalW) : null;

  const Reel = ({label, value, color, spinningThis, icon}) => (
    <div style={{flex:1, borderRadius:12, border:`2px solid ${color}`, background:C.panel2}} className="px-3 py-2">
      <div className="flex items-center gap-1.5" style={{color:C.muted, fontSize:9, letterSpacing:"0.08em"}}>{icon} {label}</div>
      <div style={{fontWeight:900, fontSize:15, lineHeight:1.15, marginTop:2, color: spinningThis?C.muted:C.text}} className="truncate">{spinningThis?"· · ·":value}</div>
    </div>
  );
  const StatGrid = ({d, big})=>(
    <div className="grid grid-cols-5 gap-0.5" style={{flex:1}}>
      {[["PT",d.pt],["REB",d.reb],["AS",d.ast],["ROB",d.stl],["TAP",d.blk]].map(([k,v])=>(
        <div key={k} className="text-center">
          <div style={{fontWeight:900, fontSize:big?15:12, fontVariantNumeric:"tabular-nums"}}>{fmt(v)}</div>
          <div style={{color:C.muted, fontSize:8, letterSpacing:"0.03em"}}>{k}</div>
        </div>
      ))}
    </div>
  );
  const ShareBtn = ({onClick})=>(
    <button onClick={onClick} style={{width:"100%", borderRadius:12, border:`1px solid ${C.gold}`, background:"transparent", color:C.gold}} className="py-2.5 mb-3 flex items-center justify-center gap-2">
      <Share2 size={16}/> <span style={{fontWeight:800, fontSize:14}}>Compartir resultado</span>
    </button>
  );

  // ---- Explorar: lista filtrada ----
  const expSel = expSeasons.size ? [...expSeasons] : SEASONS;
  const nameList = Object.keys(BY_NAME).map(n=>{
    const rows=BY_NAME[n].filter(r=>expSel.includes(r.temp));
    if(!rows.length) return null;
    const g=rows.reduce((a,r)=>a+r.part,0)||1;
    const avgPt=rows.reduce((a,r)=>a+r.pt*r.part,0)/g;
    return {n, full:fullName(n), avgPt, pos:BY_NAME[n][0].pos};
  }).filter(Boolean)
    .filter(o=> !expQuery || o.full.toLowerCase().includes(expQuery.toLowerCase()))
    .sort((a,b)=>b.avgPt-a.avgPt).slice(0,80);

  function curios(name){
    const rows=BY_NAME[name]; const g=rows.reduce((a,r)=>a+r.part,0)||1;
    const w=k=>rows.reduce((a,r)=>a+r[k]*r.part,0)/g;
    const seasons=new Set(rows.map(r=>r.temp)).size, teams=new Set(rows.map(r=>r.eq)).size;
    const bestPt=[...rows].sort((a,b)=>b.pt-a.pt)[0], bestVa=[...rows].sort((a,b)=>b.va-a.va)[0];
    const wpt=w('pt'), wre=w('reb'), was=w('ast'), wbl=w('blk');
    const f=[];
    f.push(`${seasons} temporada${seasons>1?'s':''} · ${teams} equipo${teams>1?'s':''} · ${Math.round(g)} partidos`);
    f.push(`Promedios de carrera: ${fmt(wpt)} pts, ${fmt(wre)} reb, ${fmt(was)} as`);
    f.push(`Tope anotador: ${fmt(bestPt.pt)} pts en ${SEA_SHORT[bestPt.temp]} (${TEAM_SHORT[bestPt.eq]})`);
    f.push(`Mejor valoración: ${fmt(bestVa.va)} en ${SEA_SHORT[bestVa.temp]}`);
    if(wpt>=15) f.push(`Anotador fiable: más de 15 pts de media`);
    if(was>=4) f.push(`Cerebro del equipo: ${fmt(was)} asistencias por partido`);
    if(wbl>=1.2) f.push(`Intimidador: ${fmt(wbl)} tapones por partido`);
    if(teams>=2) f.push(`Trotamundos: ha vestido ${teams} camisetas`);
    return f;
  }

  return (
    <div style={{background:C.bg, color:C.text, minHeight:"100%", fontFamily:"ui-sans-serif, system-ui, sans-serif"}} className="w-full">
      <div className="mx-auto" style={{maxWidth:520, paddingBottom:120}}>

        <div style={{background:C.panel, borderBottom:`1px solid ${C.line}`, position:"sticky", top:0, zIndex:20}} className="px-4 pt-3 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {screen==="play" && <button onClick={goHome} style={{color:C.muted}} aria-label="Inicio"><Home size={18}/></button>}
              <div className="leading-none">
                <span style={{color:C.gold, fontWeight:900, letterSpacing:"0.02em", fontSize:21}}>ASCEND</span>
                <span style={{color:C.muted, fontSize:9, fontWeight:600, marginLeft:6}}>by P. Rodrigo</span>
              </div>
              <span style={{color:C.muted, fontSize:9, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em"}}>{mode==="versus"&&screen==="play"?`· Duelo J${curPlayer}`:(isMoney&&screen==="play"?"· Money":"")}</span>
            </div>
            <div className="flex gap-3 items-center">
              <button onClick={toggleTheme} style={{color:C.muted}} aria-label="Tema">{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
              <button onClick={()=>setShowHist(true)} style={{color:C.muted}} aria-label="Marcas"><Trophy size={18}/></button>
              <button onClick={()=>setShowHelp(true)} style={{color:C.muted}} aria-label="Ayuda"><Info size={18}/></button>
            </div>
          </div>

          {screen==="play" && isMoney && phase==="mini" && (
            <MoneyMini C={C} onDone={(bonus)=>{ setBonusBudget(bonus); setPhase("draft"); spinReels([],'both'); }}/>
          )}

          {screen==="play" && phase==="draft" && (<>
          <div className="grid grid-cols-5 gap-1 mt-3">
            {[["PTS",agg.pt],["REB",agg.reb],["AST",agg.ast],["ROB",agg.stl],["TAP",agg.blk]].map(([k,v])=>(
              <div key={k} style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10}} className="py-1.5 text-center">
                <div style={{fontWeight:900, fontSize:16, fontVariantNumeric:"tabular-nums"}}>{fmt(v)}</div>
                <div style={{color:C.muted, fontSize:9, letterSpacing:"0.08em"}}>{k}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2" style={{fontSize:12}}>
            <span style={{color:C.muted}}>{isAlt?`Turno J${active}`:"Quinteto"} <b style={{color:C.text}}>{picks.length}/5</b>{isMoney && <> · <b style={{color: remaining>0?C.win:C.loss}}>€{remaining}</b>/<span>€{BUDGET+bonusBudget}</span></>}</span>
            {picks.length>0 && <span style={{color:C.muted}}>{hasRodrigo(picks)&&<b style={{color:C.gold}}>+3 · </b>}Prob. <b style={{color: pGame>0.7?C.win:pGame>0.45?C.gold:C.loss}}>{Math.round(pGame*100)}%</b></span>}
          </div>
          <div className="flex gap-1.5 mt-2">
            {POSITIONS.map(pos=>{
              const p=byPos[pos]; const movable=p && altFreeFor(p).length>0;
              return (
                <button key={pos} onClick={()=>p&&tapQuintet(p)} disabled={!p}
                  style={{flex:1, height:50, borderRadius:9, border:`1px solid ${p?TEAM_COLOR[p.eq]:POS_COLOR[pos]}`, background:p?(dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"):"transparent", position:"relative"}}
                  className="flex flex-col items-center justify-center overflow-hidden px-1">
                  {p && isMoney && <span style={{fontSize:10, fontWeight:900, color:C.gold, lineHeight:1}}>€{priceOf(p.va)}</span>}
                  <span style={{fontSize:8, fontWeight:800, color:p?C.muted:POS_COLOR[pos]}}>{POS_SHORT[pos]}</span>
                  {p ? <span style={{fontSize:9, fontWeight:700, lineHeight:1.05, textAlign:"center", color:C.text}} className="truncate">{surname(p.n)}</span> : <span style={{fontSize:9, color:C.line}}>—</span>}
                  {movable && <ArrowLeftRight size={9} style={{position:"absolute", top:3, right:3, color:C.gold}}/>}
                </button>
              );
            })}
          </div>
          {picks.some(p=>altFreeFor(p).length>0) && <div style={{color:C.muted,fontSize:9,marginTop:3,textAlign:"center"}}>Toca un jugador con ⇄ para moverlo a otra de sus posiciones libres</div>}
          </>)}
        </div>

        {/* ===== HOME ===== */}
        {screen==="home" && (
          <div className="px-4">
            <div className="text-center mt-6 mb-5">
              <div style={{color:C.gold, fontWeight:900, fontSize:46, letterSpacing:"0.04em", lineHeight:1}}>ASCEND</div>
              <div style={{color:C.muted, fontSize:11, fontWeight:700, marginTop:2, letterSpacing:"0.04em"}}>by P. Rodrigo</div>
              <div style={{color:C.text, fontWeight:800, fontSize:15, marginTop:8}}>Temporada perfecta 30-0 · Liga EBA</div>
            </div>

            <button onClick={startSolo} style={{width:"100%", background:C.gold, color:C.ctaText, borderRadius:14}} className="px-4 py-4 flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-3"><User size={22}/><div className="text-left"><div style={{fontWeight:900, fontSize:16}}>Juego individual</div><div style={{fontSize:11, opacity:0.85}}>Una temporada de 30 partidos</div></div></div>
              <ChevronRight size={20}/>
            </button>
            <button onClick={startMoney} style={{width:"100%", background:C.panel, color:C.text, border:`1px solid ${C.gold}`, borderRadius:14}} className="px-4 py-4 flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-3"><DollarSign size={22} style={{color:C.gold}}/><div className="text-left"><div style={{fontWeight:900, fontSize:16}}>Modo Money</div><div style={{fontSize:11, color:C.muted}}>Monta el mejor quinteto con €18</div></div></div>
              <ChevronRight size={20} style={{color:C.muted}}/>
            </button>
            <button onClick={()=>openSetup("versus")} style={{width:"100%", background:C.panel, color:C.text, border:`1px solid ${C.line}`, borderRadius:14}} className="px-4 py-4 flex items-center justify-between mb-5">
              <div className="flex items-center gap-3"><Users size={22} style={{color:C.gold}}/><div className="text-left"><div style={{fontWeight:900, fontSize:16}}>Jugar contra un amigo</div><div style={{fontSize:11, color:C.muted}}>Dos quintetos cara a cara</div></div></div>
              <ChevronRight size={20} style={{color:C.muted}}/>
            </button>

            <button onClick={()=>setShowAddTeam(true)} style={{width:"100%", background:C.panel, color:C.text, border:`1px dashed ${C.gold}`, borderRadius:14}} className="px-4 py-3 flex items-center justify-between mb-5">
              <div className="flex items-center gap-3"><BarChart3 size={20} style={{color:C.gold}}/><div className="text-left"><div style={{fontWeight:900, fontSize:15}}>Añadir equipo</div><div style={{fontSize:11, color:C.muted}}>Pega el enlace de una plantilla FEB</div></div></div>
              <ChevronRight size={20} style={{color:C.muted}}/>
            </button>
            <div className="flex items-center gap-2 mb-2"><BarChart3 size={16} style={{color:C.gold}}/><span style={{fontWeight:800, fontSize:14}}>Tus estadísticas</span></div>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[["Partidas",stats.games],["Jugadores",stats.players],["VA acumulada",Math.round(stats.vaSum)],["Victorias",stats.wins],["Perfectas",stats.perfect],["Mejor récord",best?`${best.w}-${best.l}`:"—"]].map(([k,v])=>(
                <div key={k} style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:11}} className="px-2 py-2.5 text-center">
                  <div style={{fontWeight:900, fontSize:19, color:C.gold, fontVariantNumeric:"tabular-nums"}}>{typeof v==="number"?v.toLocaleString("es-ES"):v}</div>
                  <div style={{color:C.muted, fontSize:10, marginTop:1}}>{k}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><Award size={16} style={{color:C.gold}}/><span style={{fontWeight:800, fontSize:14}}>Insignias</span></div>
              <span style={{color:C.muted, fontSize:12}}>{badges.length}/{BADGES.length}</span>
            </div>
            {["Rendimiento","Constancia"].map(cat=>(
              <div key={cat} className="mb-3">
                <div style={{color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 6px 2px"}}>{cat}</div>
                <div className="grid grid-cols-2 gap-2">
                  {BADGES.filter(b=>b.cat===cat).map(bd=>{ const got=badges.includes(bd.id); return (
                    <div key={bd.id} style={{background:C.panel, border:`1px solid ${got?C.gold:C.line}`, borderRadius:11, opacity:got?1:0.55}} className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span style={{fontSize:18, filter:got?"none":"grayscale(1)"}}>{bd.emoji}</span>
                        <span style={{fontWeight:800, fontSize:12.5}} className="truncate">{bd.name}</span>
                        {!got && <Lock size={11} style={{color:C.muted, marginLeft:"auto"}}/>}
                      </div>
                      <div style={{color:C.muted, fontSize:10, marginTop:3, lineHeight:1.3}}>{bd.desc}</div>
                    </div>
                  ); })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== EXPLORAR (portal estadísticas) ===== */}
        {screen==="setup" && (() => {
          const grupos = GRUPOS_OF(selLigas);
          const allOn = selLigas.size===LIGAS.length && selYears.size===SEASONS.length && grupos.length>0 && grupos.every(g=>selGrupos.has(g));
          const nTeams = activeTeams.length, nSeas = activeSeasons.length;
          const canStart = nTeams>0 && nSeas>0;
          const modeLabel = setupMode==="money"?"Modo Money":(setupMode==="versus"?"Contra un amigo":"Juego individual");
          const Chip=({on,onClick,children})=>(<button onClick={onClick} style={{fontSize:12, fontWeight:700, padding:"7px 13px", borderRadius:20, border:`1px solid ${on?C.gold:C.line}`, background:on?C.gold:C.panel, color:on?C.ctaText:C.text}}>{children}</button>);
          const toggleLiga = l => { const n=new Set(selLigas); if(n.has(l)) n.delete(l); else n.add(l); setSelLigas(n); setSelGrupos(new Set(GRUPOS_OF(n))); };
          const toggleGrupo = g => { const n=new Set(selGrupos); if(n.has(g)) n.delete(g); else n.add(g); setSelGrupos(n); };
          const toggleYear = y => { const n=new Set(selYears); if(n.has(y)) n.delete(y); else n.add(y); setSelYears(n); };
          const selectAll = () => { const L=new Set(LIGAS); setSelLigas(L); setSelGrupos(new Set(GRUPOS_OF(L))); setSelYears(new Set(SEASONS)); };
          return (
          <div className="px-4 pt-4" style={{paddingBottom:40}}>
            <div className="flex items-center gap-2 mb-1">
              <button onClick={()=>setScreen("home")} style={{color:C.muted}}><ChevronLeft size={22}/></button>
              <div style={{fontWeight:900, fontSize:20}}>Configura la partida</div>
            </div>
            <div style={{color:C.muted, fontSize:12, marginBottom:14, marginLeft:30}}>{modeLabel} · elige de qué ligas, grupos y años saldrá tu quinteto.</div>

            <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:12, padding:"11px 14px", marginBottom:14}}>
              <div className="flex items-center justify-between" style={{marginBottom:6}}>
                <span style={{fontSize:12, fontWeight:800}}>Dificultad extra</span>
                <span style={{fontSize:12, fontWeight:900, color:C.gold}}>+{Math.round(difficulty*100)}%</span>
              </div>
              <input type="range" min="0" max="50" step="5" value={Math.round(difficulty*100)} onChange={e=>setDifficulty(Number(e.target.value)/100)} style={{width:"100%", accentColor:C.gold}}/>
              <div style={{fontSize:10, color:C.muted, marginTop:2}}>0% = normal · +50% = máxima exigencia · la curva se recalibra sola según los equipos elegidos{scaleVA>1.04?` (·${scaleVA.toFixed(2)})`:""}</div>
            </div>
            <button onClick={selectAll} style={{width:"100%", height:44, borderRadius:12, fontWeight:800, fontSize:13, marginBottom:18, background:allOn?C.gold:C.panel, color:allOn?C.ctaText:C.text, border:`1px solid ${C.gold}`}}>Todas las categorías</button>

            <div style={{fontSize:11, fontWeight:800, color:C.gold, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:7}}>Liga</div>
            <div className="flex gap-2 flex-wrap mb-5">
              {LIGAS.map(l=>(<Chip key={l} on={selLigas.has(l)} onClick={()=>toggleLiga(l)}>{l}</Chip>))}
            </div>

            <div style={{fontSize:11, fontWeight:800, color:C.gold, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:7}}>Grupo</div>
            <div className="flex gap-2 flex-wrap mb-5">
              {grupos.length? grupos.map(g=>(<Chip key={g} on={selGrupos.has(g)} onClick={()=>toggleGrupo(g)}>Grupo {g}</Chip>)) : <span style={{color:C.muted, fontSize:12}}>Elige al menos una liga</span>}
            </div>

            <div style={{fontSize:11, fontWeight:800, color:C.gold, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:7}}>Años</div>
            <div className="flex gap-2 flex-wrap mb-6">
              {SEASONS.map(s=>(<Chip key={s} on={selYears.has(s)} onClick={()=>toggleYear(s)}>{SEA_SHORT[s]}</Chip>))}
            </div>

            <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:12, padding:"12px 14px", marginBottom:14}}>
              <div style={{fontSize:13, fontWeight:700}}>{nTeams} equipo{nTeams===1?"":"s"} · {nSeas} temporada{nSeas===1?"":"s"} en juego</div>
              {!canStart && <div style={{fontSize:11, color:C.loss, marginTop:3}}>Selecciona al menos una liga, un grupo y un año.</div>}
            </div>

            <button onClick={beginGame} disabled={!canStart} style={{width:"100%", height:54, borderRadius:14, fontWeight:900, fontSize:17, background:canStart?C.gold:C.panel2, color:canStart?C.ctaText:C.muted, border:`1px solid ${canStart?C.gold:C.line}`}}>Empezar</button>
          </div>
          );
        })()}

        {screen==="explore" && (() => {
          const STATS=[["pt","PTS"],["reb","REB"],["ast","AST"],["stl","ROB"],["blk","TAP"],["va","VA"]];
          const totOf=(p,k)=> Math.round((p[k]||0)*p.part);
          const poolBase = PLAYERS.filter(p=> (!rkLiga||p.liga===rkLiga) && (!rkGrupo||p.grupo===rkGrupo));
          const seasonsAvail = SEASONS.filter(s=> poolBase.some(p=>p.temp===s));
          const teamsAvail = TEAMS.filter(t=> poolBase.some(p=>p.eq===t));
          const gruposForLiga = rkLiga ? GRUPOS_OF(new Set([rkLiga])).filter(g=>g!=="Único") : [];
          const lbl={fontSize:10.5, fontWeight:800, color:C.gold, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6, marginTop:2};
          const rkList = poolBase.filter(p=> (!rkSeason||p.temp===rkSeason) && (!rkTeam||p.eq===rkTeam)).map(p=>({p, v: rkMode==="tot"? totOf(p,rkStat) : (p[rkStat]||0)})).sort((a,b)=> b.v-a.v).slice(0,40);
          const Chip=({on,onClick,children})=>(<button onClick={onClick} style={{fontSize:11, fontWeight:700, padding:"5px 11px", borderRadius:20, border:`1px solid ${on?C.gold:C.line}`, background:on?C.gold:C.panel, color:on?C.ctaText:C.text}}>{children}</button>);
          const CmpSlot=({pl,which})=>(
            <button onClick={()=>{setCmpPick(which); setPkTeam(null); setPkYear(null);}} style={{flex:1, minHeight:64, background:C.panel, border:`1px solid ${pl?C.gold:C.line}`, borderRadius:12}} className="px-3 py-2 text-left">
              {pl? (<>
                <div style={{fontWeight:800, fontSize:12.5, lineHeight:1.15}} className="truncate">{fullName(pl.n)}</div>
                <div style={{fontSize:10, color:C.muted, marginTop:2}}>{TEAM_SHORT[pl.eq]} · {SEA_SHORT[pl.temp]} · {pl.part}j</div>
              </>) : (<div style={{color:C.muted, fontSize:13, fontWeight:700}}>+ Elegir jugador</div>)}
            </button>
          );
          return (
          <div className="px-4 pt-4" style={{paddingBottom:90}}>
            <div style={{fontWeight:900, fontSize:20}}>Estadísticas de la liga</div>
            <div className="flex gap-1.5 mt-3 mb-4">
              <button onClick={()=>setExpTab("comparar")} style={{flex:1, height:40, borderRadius:11, fontWeight:800, fontSize:13, background:expTab==="comparar"?C.gold:C.panel, color:expTab==="comparar"?C.ctaText:C.text, border:`1px solid ${expTab==="comparar"?C.gold:C.line}`}}>Comparar</button>
              <button onClick={()=>setExpTab("rankings")} style={{flex:1, height:40, borderRadius:11, fontWeight:800, fontSize:13, background:expTab==="rankings"?C.gold:C.panel, color:expTab==="rankings"?C.ctaText:C.text, border:`1px solid ${expTab==="rankings"?C.gold:C.line}`}}>Rankings</button>
            </div>
            {expTab==="comparar" && (<>
              <div className="flex gap-2 mb-3"><CmpSlot pl={cmpA} which="A"/><CmpSlot pl={cmpB} which="B"/></div>
              {(cmpA&&cmpB) ? (
                <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:13}} className="px-3 py-3">
                  <div className="flex items-center mb-1" style={{fontSize:11, fontWeight:800, color:C.gold}}>
                    <div style={{flex:1, textAlign:"right"}} className="truncate">{surname(cmpA.n)}</div>
                    <div style={{width:64, textAlign:"center", color:C.muted}}>vs</div>
                    <div style={{flex:1}} className="truncate">{surname(cmpB.n)}</div>
                  </div>
                  {[["part","PARTIDOS"]].concat(STATS).map(([k,lab])=>{ const a=k==="part"?cmpA.part:(cmpA[k]||0); const b=k==="part"?cmpB.part:(cmpB[k]||0); const aw=a>b, bw=b>a; return (
                    <div key={k} className="flex items-center" style={{padding:"5px 0", borderTop:`1px solid ${C.line}`}}>
                      <div style={{flex:1, textAlign:"right", fontWeight:900, fontSize:14, color:aw?C.gold:C.text, fontVariantNumeric:"tabular-nums"}}>{fmt(a)}</div>
                      <div style={{width:64, textAlign:"center", fontSize:10, fontWeight:800, color:C.muted, textTransform:"uppercase"}}>{lab}</div>
                      <div style={{flex:1, fontWeight:900, fontSize:14, color:bw?C.gold:C.text, fontVariantNumeric:"tabular-nums"}}>{fmt(b)}</div>
                    </div>
                  ); })}
                  <div style={{fontSize:10, color:C.muted, marginTop:8, textAlign:"center"}}>Medias por partido · oro = mejor valor</div>
                </div>
              ) : <div style={{color:C.muted, fontSize:13, textAlign:"center", marginTop:34, lineHeight:1.5}}>Elige dos jugadores‑temporada para compararlos.<br/>Puedes comparar el mismo jugador en años distintos.</div>}
            </>)}
            {expTab==="rankings" && (<>
              <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:12, padding:"10px 12px 12px", marginBottom:14}}>
                <div style={lbl}>Estadística</div>
                <div className="flex gap-1.5 flex-wrap mb-2">{STATS.map(([k,lab])=>(<Chip key={k} on={rkStat===k} onClick={()=>setRkStat(k)}>{lab}</Chip>))}</div>
                <div className="flex gap-1.5"><Chip on={rkMode==="avg"} onClick={()=>setRkMode("avg")}>Por partido</Chip><Chip on={rkMode==="tot"} onClick={()=>setRkMode("tot")}>Totales</Chip></div>
              </div>
              <div style={lbl}>Liga</div>
              <div className="flex gap-1.5 flex-wrap mb-3"><Chip on={rkLiga===""} onClick={()=>{setRkLiga("");setRkGrupo("");setRkTeam("");setRkSeason("");}}>Todas</Chip>{LIGAS.map(l=>(<Chip key={l} on={rkLiga===l} onClick={()=>{const nv=rkLiga===l?"":l; setRkLiga(nv); setRkGrupo(""); setRkTeam(""); setRkSeason("");}}>{l}</Chip>))}</div>
              {gruposForLiga.length>0 && (<><div style={lbl}>Grupo</div><div className="flex gap-1.5 flex-wrap mb-3"><Chip on={rkGrupo===""} onClick={()=>{setRkGrupo("");setRkTeam("");}}>Todos</Chip>{gruposForLiga.map(g=>(<Chip key={g} on={rkGrupo===g} onClick={()=>{setRkGrupo(rkGrupo===g?"":g);setRkTeam("");}}>Grupo {g}</Chip>))}</div></>)}
              <div style={lbl}>Años</div>
              <div className="flex gap-1.5 flex-wrap mb-3"><Chip on={rkSeason===""} onClick={()=>setRkSeason("")}>Todos</Chip>{seasonsAvail.map(s=>(<Chip key={s} on={rkSeason===s} onClick={()=>setRkSeason(rkSeason===s?"":s)}>{SEA_SHORT[s]}</Chip>))}</div>
              <div style={lbl}>Equipos</div>
              <div className="flex gap-1.5 flex-wrap mb-3"><Chip on={rkTeam===""} onClick={()=>setRkTeam("")}>Todos</Chip>{teamsAvail.map(t=>(<Chip key={t} on={rkTeam===t} onClick={()=>setRkTeam(rkTeam===t?"":t)}>{TEAM_SHORT[t]}</Chip>))}</div>
              <div className="flex flex-col gap-1.5">
                {rkList.map((o,i)=>{ const stars=psStars(o.p); return (
                  <button key={i} onClick={()=>setPvName(o.p.n)} style={{background:C.panel, border:`1px solid ${i<3?C.gold:C.line}`, borderRadius:11}} className="px-3 py-2 flex items-center gap-2 text-left w-full">
                    <div style={{width:22, textAlign:"center", fontWeight:900, fontSize:14, color:i<3?C.gold:C.muted}}>{i+1}</div>
                    <div className="min-w-0" style={{flex:1}}>
                      <div style={{fontWeight:700, fontSize:12.5, lineHeight:1.1}} className="truncate">{fullName(o.p.n)}</div>
                      <div style={{fontSize:10, color:C.muted}} className="flex items-center gap-1 flex-wrap">{TEAM_SHORT[o.p.eq]} · {SEA_SHORT[o.p.temp]} · {o.p.part}j {stars.map(st=>(<StarBadge key={st.k} rank={st.rank} lab={st.lab} C={C}/>))}</div>
                    </div>
                    <div style={{fontWeight:900, fontSize:17, color:C.gold, fontVariantNumeric:"tabular-nums"}}>{rkMode==="tot"?o.v:fmt(o.v)}</div>
                  </button>
                ); })}
              </div>
            </>)}
          </div>
          );
        })()}

        {/* ===== DRAFT ===== */}
        {screen==="play" && phase==="draft" && (
          <div className="px-4">
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span style={{color:C.muted, fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:700}}>{isAlt?`Jugador ${active} · pick`:"Jugador"} {Math.min(picks.length+1,SLOTS)} de {SLOTS}</span>
                {!spinning && <span style={{color:C.muted, fontSize:11}}>FALTAN: {openPos.map(x=>POS_SHORT[x]).join(", ")}</span>}
              </div>
              <div className="flex gap-2">
                <Reel label="EQUIPO" value={TEAM_SHORT[team]} color={TEAM_COLOR[team]} spinningThis={spinTeam} icon={<Dices size={12}/>} />
                <Reel label="AÑO" value={SEA_SHORT[temp]} color={C.gold} spinningThis={spinYear} icon={<Calendar size={12}/>} />
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={changeTeam} disabled={teamChangeUsed||spinning||complete} className="flex-1 flex items-center justify-center gap-1"
                  style={{height:34, borderRadius:9, fontSize:12, fontWeight:700, border:`1px solid ${C.line}`, background:C.panel, color:teamChangeUsed?C.muted:C.text, opacity:(spinning||complete)?0.5:1}}>
                  <Shuffle size={12}/> {teamChangeUsed?"Equipo usado":"Cambiar equipo (1)"}
                </button>
                <button onClick={changeYear} disabled={yearChangeUsed||spinning||complete} className="flex-1 flex items-center justify-center gap-1"
                  style={{height:34, borderRadius:9, fontSize:12, fontWeight:700, border:`1px solid ${C.line}`, background:C.panel, color:yearChangeUsed?C.muted:C.text, opacity:(spinning||complete)?0.5:1}}>
                  <Shuffle size={12}/> {yearChangeUsed?"Año usado":"Cambiar año (1)"}
                </button>
              </div>
              {isAlt && <div style={{color:C.muted, fontSize:9, marginTop:4, textAlign:"center"}}>En pick a pick cada jugador tiene 1 cambio de equipo y 1 de año para sus 5 fichajes (no se renuevan)</div>}
            </div>

            <div className="mt-4 mb-2 flex items-center justify-between">
              <span style={{fontWeight:800, fontSize:13}}>{spinning?"…":(complete?"Quinteto completo":"Elige un jugador")}</span>
              <span style={{color:C.muted, fontSize:11}}>orden por puntos</span>
            </div>
            <div className="flex flex-col gap-1.5" style={{opacity:spinning?0.4:1, pointerEvents:(spinning||complete)?"none":"auto"}}>
              {rosterAll.map(p=>{
                const hueco=eligOpen(p).length>0; const taken=pickedIds.has(pid(p)); const aff=!isMoney||canAfford(p);
                const okp=!taken&&hueco&&aff; const low=p.part<8; const opts=eligOpen(p); const rod=p.n.indexOf("RODRIGO YANGUAS")===0; const price=priceOf(p.va);
                const label = okp ? (opts.length>1?"Elegir posición":"Fichar") : (taken?"✓ en tu quinteto":(isMoney&&hueco&&!aff?`Sin saldo`:"sin hueco"));
                return (
                  <button key={pid(p)} onClick={()=>draft(p)} disabled={!okp}
                    style={{borderRadius:11, border:`1px solid ${rod&&okp?C.gold:C.line}`, background:C.panel, opacity: okp?1:0.4}}
                    className="px-3 py-2 flex items-center gap-2">
                    <div className="text-left min-w-0" style={{width:"48%"}}>
                      <div className="flex items-center gap-1 flex-wrap">
                        {p.pos.map(ps=>(
                          <span key={ps} style={{fontSize:8, fontWeight:800, color:"#0b0b0b", background:POS_COLOR[ps], borderRadius:4, padding:"1px 4px", opacity: (openPos.includes(ps)||!okp)?1:0.3}}>{POS_SHORT[ps]}</span>
                        ))}
                        {isMoney && <span style={{fontSize:14, fontWeight:900, color:aff?C.gold:C.loss, border:`1.5px solid ${aff?C.gold:C.loss}`, borderRadius:6, padding:"1px 8px"}}>€{price}</span>}
                        {low && <span title="Pocos partidos" style={{color:C.muted, fontSize:9, border:`1px solid ${C.line}`, borderRadius:4, padding:"0 3px"}}>{p.part}j</span>}
                      </div>
                      <div style={{fontWeight:700, fontSize:12.5, marginTop:2, lineHeight:1.15}}>{fullName(p.n)}{rod?" ⭐":""}</div>
                      <div style={{fontSize:10, fontWeight:700, marginTop:1, color: okp?C.gold:C.muted}}>{label}</div>
                    </div>
                    <StatGrid d={p} big={true}/>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== SIM / RESULT ===== */}
        {screen==="play" && (phase==="sim"||phase==="result") && (
          <div className="px-4 mt-5">
            <div className="flex items-end justify-center gap-4 mb-4">
              <div className="text-center"><div style={{fontWeight:900,fontSize:40,color:C.win,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{phase==="result"?finalW:wins}</div><div style={{color:C.muted,fontSize:10,letterSpacing:"0.1em"}}>VICTORIAS</div></div>
              <div style={{color:C.muted,fontWeight:800,fontSize:26}}>-</div>
              <div className="text-center"><div style={{fontWeight:900,fontSize:40,color:C.loss,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{phase==="result"?GAMES-finalW:losses}</div><div style={{color:C.muted,fontSize:10,letterSpacing:"0.1em"}}>DERROTAS</div></div>
            </div>
            <div className="grid gap-1.5 mb-5" style={{gridTemplateColumns:"repeat(10, 1fr)"}}>
              {season.map((w,i)=>(
                <div key={i} style={{aspectRatio:"1", borderRadius:6, background:i<revealed?(w?C.win:C.loss):C.panel2, border:`1px solid ${i<revealed?(w?C.win:C.loss):C.line}`, transition:"all .15s", display:"flex", alignItems:"center", justifyContent:"center", color:dark?"#0a0a0a":"#fff", fontWeight:900, fontSize:10}}>{i<revealed?(w?"G":"P"):""}</div>
              ))}
            </div>

            {phase==="result" && T && (
              <div>
                <div style={{background: T.kind==="asc"?C.gold:(T.kind==="desc"?C.loss:(T.kind==="mid"?C.panel:C.win)), color:(T.kind==="mid")?C.text:(dark?"#0E0E0E":"#fff"), border:`1px solid ${T.kind==="mid"?C.line:"transparent"}`, borderRadius:14}} className="p-4 text-center mb-3">
                  <div style={{fontWeight:900, fontSize: T.kind==="asc"?22:18}}>{T.t}{T.kind==="asc"?" 🏆":""}</div>
                  <div style={{fontSize:12, marginTop:2, opacity:0.9}}>{T.s}{isMoney?` · $${spent} gastados`:""}{hasRodrigo(picks)?" · +3 de Rodrigo ⭐":""}</div>
                </div>
                <ShareBtn onClick={shareSolo}/>
                {justEarned.length>0 && (
                  <div style={{background:C.panel, border:`1px solid ${C.gold}`, borderRadius:12}} className="p-3 mb-3">
                    <div style={{color:C.gold, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6}}>¡Nuevas insignias!</div>
                    <div className="flex flex-wrap gap-2">
                      {justEarned.map(id=>{ const bd=BADGES.find(b=>b.id===id); return (
                        <span key={id} style={{fontSize:12, fontWeight:700, border:`1px solid ${C.gold}`, borderRadius:20, padding:"3px 10px"}}>{bd.emoji} {bd.name}</span>
                      ); })}
                    </div>
                  </div>
                )}
                <div style={{background:C.panel, border:`1px solid ${C.gold}`, borderRadius:14}} className="p-4 mb-3 text-center">
                  <div style={{color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em"}}>Valoración total del equipo</div>
                  <div style={{fontWeight:900, fontSize:44, color:C.gold, lineHeight:1.05, fontVariantNumeric:"tabular-nums"}}>{fmt(teamVal)}</div>
                  <div className="grid grid-cols-5 gap-1 mt-3">
                    {[["PTS",agg.pt],["REB",agg.reb],["AST",agg.ast],["ROB",agg.stl],["TAP",agg.blk]].map(([k,v])=>(
                      <div key={k}><div style={{fontWeight:800, fontSize:15, fontVariantNumeric:"tabular-nums"}}>{fmt(v)}</div><div style={{color:C.muted, fontSize:9}}>{k}</div></div>
                    ))}
                  </div>
                </div>
                <div style={{color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6}}>Tu quinteto</div>
                <div className="flex flex-col gap-1.5">
                  {POSITIONS.map(pos=>{ const p=byPos[pos]; if(!p) return null; return (
                    <div key={pos} style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:11}} className="px-3 py-2 flex items-center gap-2">
                      <div className="min-w-0" style={{width:"48%"}}>
                        <div className="flex items-center gap-1.5">
                          <span style={{fontSize:8, fontWeight:800, color:"#0b0b0b", background:POS_COLOR[pos], borderRadius:4, padding:"1px 5px"}}>{POS_SHORT[pos]}</span>
                          <span style={{fontWeight:700, fontSize:12.5, lineHeight:1.1}} className="truncate">{fullName(p.n)}</span>
                        </div>
                        <div style={{fontSize:9, color:C.muted, marginTop:2}} className="truncate">{TEAM_SHORT[p.eq]} {SEA_SHORT[p.temp]}</div>
                        <div style={{fontSize:14, fontWeight:900, color:C.gold, marginTop:1, fontVariantNumeric:"tabular-nums"}}>VA {fmt(p.va)}{isMoney?<span style={{color:C.text, fontWeight:800}}> · €{priceOf(p.va)}</span>:""}</div>
                      </div>
                      <StatGrid d={p} big={true}/>
                    </div>
                  ); })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== HANDOFF ===== */}
        {screen==="play" && phase==="handoff" && (
          <div className="px-4 mt-10 text-center">
            <Users size={48} style={{color:C.gold, margin:"0 auto"}}/>
            <div style={{fontWeight:900, fontSize:22, marginTop:14}}>Jugador 1 ha terminado</div>
            <div style={{color:C.muted, fontSize:14, marginTop:6}}>Récord: <b style={{color:C.text}}>{vsResults[0]?.w}-{vsResults[0]?.l}</b></div>
            <div style={{color:C.muted, fontSize:13, marginTop:14, lineHeight:1.5}}>Pasa el móvil al <b style={{color:C.text}}>Jugador 2</b>.<br/>Que monte su quinteto sin mirar el del rival.</div>
          </div>
        )}

        {/* ===== COMPARE ===== */}
        {screen==="play" && phase==="compare" && vsResults.length===2 && (() => {
          const [a,bv]=vsResults; const tie=a.w===bv.w&&a.val===bv.val; const winner = a.w>bv.w?1:(bv.w>a.w?2:(a.val>=bv.val?1:2));
          const Rec=({r,idx})=>(
            <div style={{flex:1, background:C.panel, border:`1px solid ${(!tie&&winner===idx)?C.gold:C.line}`, borderRadius:13}} className="p-3 text-center">
              <div style={{fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em"}}>Jugador {idx}{!tie&&winner===idx?" 👑":""}</div>
              <div style={{fontWeight:900, fontSize:32, lineHeight:1, marginTop:2, fontVariantNumeric:"tabular-nums"}}>{r.w}-{r.l}</div>
              <div style={{color:C.gold, fontSize:13, fontWeight:800, marginTop:2}}>VA {fmt(r.val)}</div>
            </div>
          );
          const Cell=({pl})=> pl ? (
            <div style={{flex:1, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10}} className="px-2 py-2 min-w-0">
              <div className="flex items-center gap-1">
                <span style={{fontSize:7, fontWeight:800, color:"#0b0b0b", background:POS_COLOR[pl.pos], borderRadius:3, padding:"1px 3px"}}>{POS_SHORT[pl.pos]}</span>
                <span style={{fontWeight:700, fontSize:11}} className="truncate">{pl.n}</span>
              </div>
              <div style={{fontSize:13, fontWeight:900, color:C.gold, marginTop:1, fontVariantNumeric:"tabular-nums"}}>VA {fmt(pl.va)}</div>
              <div style={{fontSize:8, color:C.muted}} className="truncate">{pl.eq} {pl.temp}</div>
              <div className="mt-1"><StatGrid d={pl} big={false}/></div>
            </div>
          ) : <div style={{flex:1}}/>;
          const Tot=({r})=>(
            <div style={{flex:1, background:C.panel, border:`1px solid ${C.line}`, borderRadius:10}} className="px-2 py-2">
              <div className="grid grid-cols-6 gap-0.5">
                {[["PTS",r.agg.pt],["REB",r.agg.reb],["AST",r.agg.ast],["ROB",r.agg.stl],["TAP",r.agg.blk],["VA",r.val]].map(([k,v])=>(
                  <div key={k} className="text-center"><div style={{fontWeight:900,fontSize:11,color:k==="VA"?C.gold:C.text,fontVariantNumeric:"tabular-nums"}}>{fmt(v)}</div><div style={{color:C.muted,fontSize:7}}>{k}</div></div>
                ))}
              </div>
            </div>
          );
          return (
            <div className="px-4 mt-5">
              <div className="text-center mb-4">
                <div style={{fontWeight:900, fontSize:20}}>{tie?"¡Empate!":`Gana el Jugador ${winner}`}</div>
                <div style={{color:C.muted, fontSize:12, marginTop:2}}>Más victorias gana · empate por valoración</div>
              </div>
              <div className="flex gap-2 items-stretch mb-3"><Rec r={a} idx={1}/><Rec r={bv} idx={2}/></div>
              <ShareBtn onClick={()=>shareVersus(a,bv,winner,tie)}/>
              <div className="flex items-center justify-between mb-2" style={{padding:"0 2px"}}>
                <span style={{fontWeight:800, fontSize:12, color:C.text}}>Jugador 1</span>
                <span style={{color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em"}}>por posición</span>
                <span style={{fontWeight:800, fontSize:12, color:C.text}}>Jugador 2</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {POSITIONS.map(pos=>{ const p1=a.players.find(x=>x.pos===pos), p2=bv.players.find(x=>x.pos===pos);
                  return <div key={pos} className="flex gap-1.5 items-stretch"><Cell pl={p1}/><Cell pl={p2}/></div>; })}
                <div className="flex gap-1.5 items-stretch mt-1"><Tot r={a}/><Tot r={bv}/></div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ===== BOTTOM TAB NAV ===== */}
      {(screen==="home"||screen==="explore") && (
        <div style={{position:"fixed", bottom:0, left:0, right:0, background:C.panel, borderTop:`1px solid ${C.line}`, zIndex:30}}>
          <div className="mx-auto flex" style={{maxWidth:520}}>
            {[["home","Jugar",Gamepad2],["explore","Explorar",BarChart3]].map(([sc,lab,Icon])=>{
              const on=screen===sc; return (
                <button key={sc} onClick={()=>setScreen(sc)} className="flex-1 flex flex-col items-center justify-center gap-0.5" style={{padding:"10px 0 14px", color:on?C.gold:C.muted}}>
                  <Icon size={21}/><span style={{fontSize:10, fontWeight:on?800:600}}>{lab}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== BOTTOM CTA (play) ===== */}
      {screen==="play" && phase!=="mini" && (
        <div style={{position:"fixed", bottom:0, left:0, right:0, background:`linear-gradient(180deg, transparent, ${C.bg} 30%)`}} className="px-4 pt-6 pb-4">
          <div className="mx-auto" style={{maxWidth:520}}>
            {phase==="draft" && !isAlt && (
              <button onClick={simulate} disabled={!complete} style={{width:"100%", height:52, borderRadius:13, fontWeight:900, fontSize:16, background:!complete?C.panel2:C.gold, color:!complete?C.muted:C.ctaText, border:`1px solid ${!complete?C.line:C.gold}`}}>
                {!complete ? `Ficha ${SLOTS-picks.length} jugador${SLOTS-picks.length>1?"es":""} más` : (mode==="versus"?`Simular (Jugador ${vsTurn})`:"Simular temporada 30-0")}
              </button>
            )}
            {phase==="draft" && isAlt && (
              <div style={{textAlign:"center", color:C.muted, fontSize:12, padding:"14px 0"}}>Draft alternado · cuando ambos tengáis 5, se comparan</div>
            )}
            {phase==="sim" && <button disabled style={{width:"100%", height:52, borderRadius:13, fontWeight:900, fontSize:16, background:C.panel2, color:C.muted, border:`1px solid ${C.line}`}}>Jugando la temporada…</button>}
            {phase==="result" && <button onClick={goHome} style={{width:"100%", height:52, borderRadius:13, fontWeight:900, fontSize:16, background:C.gold, color:C.ctaText}} className="flex items-center justify-center gap-2"><Home size={18}/> Volver al inicio</button>}
            {phase==="handoff" && <button onClick={nextVersus} style={{width:"100%", height:52, borderRadius:13, fontWeight:900, fontSize:16, background:C.gold, color:C.ctaText}} className="flex items-center justify-center gap-2"><Users size={18}/> Empezar turno del Jugador 2</button>}
            {phase==="compare" && (
              <div className="flex gap-2">
                <button onClick={()=>startVersus(vsMode)} style={{flex:1, height:52, borderRadius:13, fontWeight:900, fontSize:15, background:C.panel, color:C.text, border:`1px solid ${C.line}`}} className="flex items-center justify-center gap-2"><RotateCcw size={16}/> Revancha</button>
                <button onClick={goHome} style={{flex:1, height:52, borderRadius:13, fontWeight:900, fontSize:15, background:C.gold, color:C.ctaText}} className="flex items-center justify-center gap-2"><Home size={16}/> Inicio</button>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <div style={{position:"fixed", bottom:90, left:0, right:0, display:"flex", justifyContent:"center", zIndex:60}}><div style={{background:C.text, color:C.bg, borderRadius:20, padding:"8px 16px", fontWeight:700, fontSize:13}}>{toast}</div></div>}

      {/* ===== PLAYER PORTAL ===== */}
      {pvName && (() => {
        const c=careerOf(pvName); const stars=nameStars(pvName); const cc=pvCmp?careerOf(pvCmp):null;
        const KS=[["pt","PTS"],["reb","REB"],["ast","AST"],["stl","ROB"],["blk","TAP"],["va","VA"]];
        return (
        <div style={{position:"fixed", inset:0, background:C.bg, zIndex:40, overflowY:"auto"}}>
          <div className="px-4 pt-4" style={{maxWidth:560, margin:"0 auto", paddingBottom:40}}>
            <div className="flex items-center justify-between mb-3">
              <button onClick={()=>{ setPvName(null); setPvCmp(null); }} style={{color:C.text, display:"flex", alignItems:"center", gap:4, fontWeight:700, fontSize:13}}><ChevronLeft size={20}/> Volver</button>
              <div className="flex items-center gap-2">
                <button onClick={()=>setPvAnalysis(true)} style={{background:C.gold, color:C.ctaText, borderRadius:9, fontWeight:800, fontSize:12}} className="px-3 py-1.5">Análisis</button>
                <button onClick={()=>setPvPick(true)} title="Comparar" style={{background:C.panel, color:C.gold, border:`1px solid ${C.gold}`, borderRadius:9, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:18}}>+</button>
              </div>
            </div>
            <div style={{fontWeight:900, fontSize:22, lineHeight:1.1}}>{fullName(pvName)}</div>
            <div className="flex items-center gap-1.5 flex-wrap mt-2 mb-1">
              {c.pos.map(ps=>(<span key={ps} style={{fontSize:9, fontWeight:800, color:"#0b0b0b", background:POS_COLOR[ps], borderRadius:5, padding:"2px 7px"}}>{ps}</span>))}
            </div>
            <div style={{fontSize:12, color:C.muted, marginBottom:6}}>{c.seasons} temporada{c.seasons===1?"":"s"} · {c.games} partidos · {c.teams.map(t=>TEAM_SHORT[t]).join(", ")}</div>
            {stars.length>0 && <div className="flex gap-1.5 flex-wrap mb-3">{stars.map(st=>(<StarBadge key={st.k} rank={st.rank} lab={STAT_FULL[st.k]} C={C} worded/>))}</div>}

            <div className="flex gap-2 mb-3" style={{marginTop:2}}>
              {[["va","VA"],["pt","PTS"],["reb","REB"]].map(([k,lab])=>(
                <div key={k} style={{flex:1, background:k==="va"?"rgba(201,162,39,0.10)":C.panel, border:`1px solid ${k==="va"?C.gold:C.line}`, borderRadius:11, padding:"9px 4px 8px", textAlign:"center"}}>
                  <div style={{fontWeight:900, fontSize:21, color:k==="va"?C.gold:C.text, fontVariantNumeric:"tabular-nums", lineHeight:1}}>{fmt(c[k])}</div>
                  <div style={{fontSize:9, color:C.muted, letterSpacing:"0.05em", marginTop:2}}>{lab}/partido</div>
                  <div style={{fontSize:8.5, fontWeight:800, color:C.gold, marginTop:3}}>Top {topPct(k,c[k])}%</div>
                </div>
              ))}
            </div>
            <div style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:13}} className="px-3 py-3 mb-3">
              <div style={{fontSize:11, fontWeight:800, color:C.gold, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4}}>Medias de su carrera{cc?` · vs ${surname(pvCmp)}`:""}</div>
              {KS.map(([k,lab])=>{ const frac=Math.max(0.04,Math.min(1,(c[k]||0)/STAT_MAX[k])); return (
                <div key={k} style={{padding:"5px 0", borderTop:`1px solid ${C.line}`}}>
                  <div className="flex items-center">
                    <div style={{width:46, fontSize:11, fontWeight:800, color:C.muted}}>{lab}</div>
                    <div style={{flex:1, fontWeight:900, fontSize:15, color: cc&&c[k]>cc[k]?C.gold:C.text, fontVariantNumeric:"tabular-nums"}}>{fmt(c[k])}</div>
                    {cc ? <div style={{flex:1, textAlign:"right", fontWeight:900, fontSize:15, color: cc[k]>c[k]?C.gold:C.text, fontVariantNumeric:"tabular-nums"}}>{fmt(cc[k])}</div>
                        : <div style={{fontSize:9.5, fontWeight:800, color:C.gold, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:20, padding:"2px 8px", whiteSpace:"nowrap"}}>Top {topPct(k,c[k])}%</div>}
                  </div>
                  {!cc && <div style={{height:5, background:C.line, borderRadius:3, marginTop:4, overflow:"hidden"}}><div style={{width:`${Math.round(frac*100)}%`, height:"100%", background:k==="va"?C.gold:C.text, opacity:k==="va"?1:0.5, borderRadius:3}}/></div>}
                </div>
              ); })}
              {cc && <button onClick={()=>setPvCmp(null)} style={{marginTop:8, fontSize:11, color:C.muted}}>Quitar comparación</button>}
            </div>
            <div style={{fontSize:11, color:C.muted, marginBottom:14}} className="flex gap-3 flex-wrap">
              <span style={{fontWeight:800, color:C.gold}}>Totales:</span>
              {[["pt","pts"],["reb","reb"],["ast","as"],["stl","ro"],["blk","ta"]].map(([k,lab])=>{ const tot=c.rows.reduce((s,p)=>s+Math.round((p[k]||0)*p.part),0); return <span key={k}><b style={{color:C.text}}>{tot.toLocaleString("es-ES")}</b> {lab}</span>; })}
            </div>

            <div style={{fontSize:11, fontWeight:800, color:C.gold, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6}}>Por temporada</div>
            <div className="flex flex-col gap-1.5">
              {c.rows.map((p,i)=>(
                <div key={i} style={{background:C.panel, border:`1px solid ${C.line}`, borderRadius:10}} className="px-3 py-2">
                  <div className="flex items-center justify-between" style={{marginBottom:3}}>
                    <div style={{fontWeight:800, fontSize:12}}>{SEA_SHORT[p.temp]} · {TEAM_SHORT[p.eq]}</div>
                    <div style={{fontSize:10, color:C.muted}}>{p.part}j</div>
                  </div>
                  <div className="flex gap-2 flex-wrap" style={{fontSize:11, color:C.text}}>
                    <span><b>{fmt(p.pt)}</b> pt</span><span><b>{fmt(p.reb)}</b> reb</span><span><b>{fmt(p.ast)}</b> as</span><span><b>{fmt(p.stl)}</b> ro</span><span><b>{fmt(p.blk)}</b> ta</span><span style={{color:C.gold}}><b>{fmt(p.va)}</b> va</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        );
      })()}
      {pvAnalysis && pvName && (() => { const a=analyzePlayer(careerOf(pvName)); return (
        <Overlay c={C} onClose={()=>setPvAnalysis(false)} title={"Scouting · "+surname(pvName)}>
          <div style={{fontSize:11, fontWeight:800, color:C.win, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5}}>Fortalezas</div>
          <ul style={{margin:"0 0 14px", paddingLeft:18, fontSize:13, lineHeight:1.55}}>{a.S.map((x,i)=><li key={i}>{x}</li>)}</ul>
          <div style={{fontSize:11, fontWeight:800, color:C.loss, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5}}>Debilidades</div>
          <ul style={{margin:"0 0 14px", paddingLeft:18, fontSize:13, lineHeight:1.55}}>{a.W.map((x,i)=><li key={i}>{x}</li>)}</ul>
          <div style={{fontSize:11, fontWeight:800, color:C.gold, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5}}>Plan para defenderle</div>
          <ul style={{margin:0, paddingLeft:18, fontSize:13, lineHeight:1.55}}>{a.plan.map((x,i)=><li key={i}>{x}</li>)}</ul>
        </Overlay>
      ); })()}
      {pvPick && (
        <Overlay c={C} onClose={()=>setPvPick(false)} title="Comparar con…">
          <div className="flex flex-col gap-1.5" style={{maxHeight:380, overflowY:"auto"}}>
            {[...new Set(PLAYERS.map(p=>p.n))].filter(n=>n!==pvName).sort().map((n,i)=>{ const c=careerOf(n); return (
              <button key={i} onClick={()=>{ setPvCmp(n); setPvPick(false); }} style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10}} className="px-3 py-2 flex items-center gap-2 text-left">
                <div className="min-w-0" style={{flex:1}}>
                  <div style={{fontWeight:700, fontSize:12.5}} className="truncate">{fullName(n)}</div>
                  <div style={{fontSize:10, color:C.muted}}>{c.teams.map(t=>TEAM_SHORT[t]).join(", ")} · {c.seasons} temp.</div>
                </div>
                <div style={{fontWeight:900, fontSize:13, color:C.gold}}>{fmt(c.pt)} <span style={{fontSize:9, color:C.muted}}>pt</span></div>
              </button>
            ); })}
          </div>
        </Overlay>
      )}
      {showAddTeam && (
        <Overlay c={C} onClose={()=>setShowAddTeam(false)} title="Añadir equipo">
          <div style={{fontSize:12.5, color:C.muted, lineHeight:1.5, marginBottom:10}}>Pega el enlace de la página de <b style={{color:C.text}}>estadísticas acumuladas</b> de una temporada (baloncestoenvivo.feb.es). Se guarda aquí y se incorpora a la base de datos.</div>
          <input value={addTeamLink} onChange={e=>setAddTeamLink(e.target.value)} placeholder="https://baloncestoenvivo.feb.es/estadisticasacumuladas/…" style={{width:"100%", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:"9px 12px", color:C.text, fontSize:12, outline:"none", marginBottom:10}}/>
          <button onClick={saveTeamLink} disabled={!addTeamLink.trim()} style={{width:"100%", height:46, borderRadius:11, fontWeight:900, fontSize:14, background:addTeamLink.trim()?C.gold:C.panel2, color:addTeamLink.trim()?C.ctaText:C.muted, border:`1px solid ${addTeamLink.trim()?C.gold:C.line}`}}>Guardar enlace</button>
          {pendingTeams.length>0 && <div style={{marginTop:14}}>
            <div style={{fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6}}>Enlaces guardados ({pendingTeams.length})</div>
            <div className="flex flex-col gap-1.5">
              {pendingTeams.map((l,i)=>(
                <div key={i} style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9}} className="px-3 py-2 flex items-center gap-2">
                  <span style={{flex:1, minWidth:0, fontSize:11, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{l}</span>
                  <button onClick={()=>delTeamLink(i)} style={{color:C.loss}}><X size={15}/></button>
                </div>
              ))}
            </div>
          </div>}
        </Overlay>
      )}
      {cmpPick && (
        <Overlay c={C} onClose={()=>setCmpPick(null)} title="Elegir jugador">
          <div className="flex gap-1.5 flex-wrap mb-2">
            {TEAMS.map(t=>(<button key={t} onClick={()=>setPkTeam(pkTeam===t?null:t)} style={{fontSize:11, fontWeight:700, padding:"4px 9px", borderRadius:16, border:`1px solid ${pkTeam===t?C.gold:C.line}`, background:pkTeam===t?C.gold:C.panel2, color:pkTeam===t?C.ctaText:C.text}}>{TEAM_SHORT[t]}</button>))}
          </div>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {SEASONS.map(s=>(<button key={s} onClick={()=>setPkYear(pkYear===s?null:s)} style={{fontSize:11, fontWeight:700, padding:"4px 9px", borderRadius:16, border:`1px solid ${pkYear===s?C.gold:C.line}`, background:pkYear===s?C.gold:C.panel2, color:pkYear===s?C.ctaText:C.text}}>{SEA_SHORT[s]}</button>))}
          </div>
          <div className="flex flex-col gap-1.5" style={{maxHeight:320, overflowY:"auto"}}>
            {PLAYERS.filter(p=>(!pkTeam||p.eq===pkTeam)&&(!pkYear||p.temp===pkYear)).sort((a,b)=>b.pt-a.pt).slice(0,80).map((p,i)=>(
              <button key={i} onClick={()=>{ if(cmpPick==="A")setCmpA(p); else setCmpB(p); setCmpPick(null); }} style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10}} className="px-3 py-2 flex items-center gap-2 text-left">
                <div className="min-w-0" style={{flex:1}}>
                  <div style={{fontWeight:700, fontSize:12.5}} className="truncate">{fullName(p.n)}</div>
                  <div style={{fontSize:10, color:C.muted}}>{TEAM_SHORT[p.eq]} · {SEA_SHORT[p.temp]} · {p.part}j</div>
                </div>
                <div style={{fontWeight:900, fontSize:14, color:C.gold}}>{fmt(p.pt)} <span style={{fontSize:9, color:C.muted}}>pts</span></div>
              </button>
            ))}
          </div>
        </Overlay>
      )}
      {expPlayer && (
        <Overlay c={C} onClose={()=>setExpPlayer(null)} title={fullName(expPlayer)}>
          <div className="flex gap-1 mb-3 flex-wrap">
            {BY_NAME[expPlayer][0].pos.map(ps=>(<span key={ps} style={{fontSize:9, fontWeight:800, color:"#0b0b0b", background:POS_COLOR[ps], borderRadius:5, padding:"2px 7px"}}>{ps}</span>))}
          </div>
          <div style={{color:C.gold, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6}}>Datos curiosos</div>
          <div className="flex flex-col gap-1.5 mb-4">
            {curios(expPlayer).map((f,i)=>(
              <div key={i} style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9, fontSize:12.5}} className="px-3 py-2">{f}</div>
            ))}
          </div>
          <div style={{color:C.gold, fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6}}>Temporada a temporada</div>
          <div className="flex flex-col gap-1.5">
            {[...BY_NAME[expPlayer]].sort((a,b)=>a.temp.localeCompare(b.temp)).map((r,i)=>(
              <div key={i} style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10}} className="px-3 py-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{fontWeight:800, fontSize:12.5}}>{SEA_SHORT[r.temp]} · {TEAM_SHORT[r.eq]}</span>
                  <span style={{color:C.muted, fontSize:10}}>{r.part} part · <b style={{color:C.gold}}>VA {fmt(r.va)}</b></span>
                </div>
                <StatGrid d={r} big={false}/>
              </div>
            ))}
          </div>
        </Overlay>
      )}

      {showVsChoice && (
        <Overlay c={C} onClose={()=>setShowVsChoice(false)} title="¿Cómo hacéis el draft?">
          <div className="flex flex-col gap-2 mt-1">
            <button onClick={()=>startVersus('seq')} style={{borderRadius:12, border:`1px solid ${C.line}`, background:C.panel2}} className="px-3 py-3 text-left">
              <div style={{fontWeight:800, fontSize:14}}>Cada uno su equipo (seguido)</div>
              <div style={{color:C.muted, fontSize:11, marginTop:2}}>El Jugador 1 monta su quinteto entero, luego el Jugador 2.</div>
            </button>
            <button onClick={()=>startVersus('alt')} style={{borderRadius:12, border:`1px solid ${C.line}`, background:C.panel2}} className="px-3 py-3 text-left">
              <div style={{fontWeight:800, fontSize:14}}>Pick a pick (uno en uno)</div>
              <div style={{color:C.muted, fontSize:11, marginTop:2}}>Os turnáis: un jugador cada uno hasta tener los 5.</div>
            </button>
          </div>
        </Overlay>
      )}
      {pendingPick && (
        <Overlay c={C} onClose={()=>setPendingPick(null)} title={`¿En qué posición juega ${surname(pendingPick.p.n)}?`}>
          <div className="flex flex-col gap-2 mt-1">
            {pendingPick.options.map(pos=>(
              <button key={pos} onClick={()=>commit(pendingPick.p,pos)} style={{borderRadius:11, border:`1px solid ${POS_COLOR[pos]}`, background:C.panel2}} className="px-3 py-3 flex items-center gap-2">
                <span style={{fontSize:9, fontWeight:800, color:"#0b0b0b", background:POS_COLOR[pos], borderRadius:4, padding:"2px 6px"}}>{POS_SHORT[pos]}</span>
                <span style={{fontWeight:700, fontSize:14}}>{pos}</span>
              </button>
            ))}
          </div>
        </Overlay>
      )}
      {pendingSell && (
        <Overlay c={C} onClose={()=>setPendingSell(null)} title={surname(pendingSell.pick.n)}>
          <div className="flex flex-col gap-2 mt-1">
            <button onClick={()=>sellPick(pendingSell.pick)} style={{borderRadius:11, border:`1.5px solid ${C.gold}`, background:C.panel2}} className="px-3 py-3 flex items-center justify-between">
              <span style={{fontWeight:800, fontSize:14, color:C.gold}}>Vender jugador</span>
              <span style={{fontWeight:900, fontSize:16, color:C.gold}}>+€{priceOf(pendingSell.pick.va)}</span>
            </button>
            {pendingSell.options.map(pos=>(
              <button key={pos} onClick={()=>move(pendingSell.pick,pos)} style={{borderRadius:11, border:`1px solid ${POS_COLOR[pos]}`, background:C.panel2}} className="px-3 py-3 flex items-center gap-2">
                <ArrowLeftRight size={14} style={{color:POS_COLOR[pos]}}/>
                <span style={{fontWeight:700, fontSize:14}}>Mover a {pos}</span>
              </button>
            ))}
            <div style={{fontSize:11, color:C.muted, textAlign:"center", marginTop:2}}>Al vender recuperas su precio y liberas el hueco. Solo puedes vender una vez por partida.</div>
          </div>
        </Overlay>
      )}
      {pendingMove && (
        <Overlay c={C} onClose={()=>setPendingMove(null)} title={`Mover a ${surname(pendingMove.pick.n)} a…`}>
          <div className="flex flex-col gap-2 mt-1">
            {pendingMove.options.map(pos=>(
              <button key={pos} onClick={()=>move(pendingMove.pick,pos)} style={{borderRadius:11, border:`1px solid ${POS_COLOR[pos]}`, background:C.panel2}} className="px-3 py-3 flex items-center gap-2">
                <span style={{fontSize:9, fontWeight:800, color:"#0b0b0b", background:POS_COLOR[pos], borderRadius:4, padding:"2px 6px"}}>{POS_SHORT[pos]}</span>
                <span style={{fontWeight:700, fontSize:14}}>{pos}</span>
              </button>
            ))}
          </div>
        </Overlay>
      )}
      {showHelp && (
        <Overlay c={C} onClose={()=>setShowHelp(false)} title="Cómo se juega">
          <ul style={{fontSize:13, lineHeight:1.6, paddingLeft:18, listStyle:"disc"}}>
            <li>Quinteto con <b>una posición de cada</b>. Cada turno giran <b>dos ruletas</b>: <b>equipo</b> y <b>año</b>.</li>
            <li>Los jugadores salen <b>ordenados por puntos</b> con las estadísticas a la derecha; los no disponibles, apagados.</li>
            <li>Un cambio de <b>equipo</b> y uno de <b>año</b> por turno (en pick a pick, uno de cada para los 5 fichajes).</li>
            <li><b>Modo Money</b>: empiezas con <b>€18</b> + lo que ganes en el minijuego, cada jugador cuesta según su nivel (máx €6) y puedes <b>vender</b> una vez.</li>
            <li>Si fichas a <b>Rodrigo Yanguas ⭐</b>, sumas <b>+3 victorias</b> automáticas.</li>
            <li><b>Explorar</b>: portal de estadísticas de la liga, con selector de temporadas y ficha de cada jugador.</li>
          </ul>
        </Overlay>
      )}
      {showHist && (
        <Overlay c={C} onClose={()=>setShowHist(false)} title="Tus marcas">
          {best ? (
            <div style={{background:C.gold, color:dark?"#0E0E0E":"#fff", borderRadius:11}} className="p-3 mb-3">
              <div style={{fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:800}}>Mejor marca · {best.titulo}</div>
              <div style={{fontWeight:900, fontSize:22}}>{best.w}-{best.l}{best.perfect?" 🏆":""}</div>
              <div style={{fontSize:11}}>{best.players.map(p=>p.full||p.n).join(" · ")}</div>
            </div>
          ) : <p style={{color:C.muted, fontSize:13}}>Aún no has jugado ninguna temporada.</p>}
          {history.length>0 && <div style={{color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", margin:"4px 0 6px"}}>Historial</div>}
          <div className="flex flex-col gap-1.5">
            {history.map((h,i)=>(
              <div key={i} style={{background:C.panel2, border:`1px solid ${C.line}`, borderRadius:9}} className="px-3 py-2 flex items-center justify-between">
                <div><span style={{fontWeight:800, fontSize:14, color:h.perfect?C.gold:C.text, fontVariantNumeric:"tabular-nums"}}>{h.w}-{h.l}</span> <span style={{fontSize:10, color:C.muted}}>{h.titulo}{h.money?" · Money":""}</span></div>
                <span style={{color:C.muted, fontSize:10}} className="truncate ml-2">{h.players.map(p=>p.n).join(", ")}</span>
              </div>
            ))}
          </div>
        </Overlay>
      )}
    </div>
  );
}

function Overlay({title, children, onClose, c}){
  return (
    <div onClick={onClose} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:c.panel, borderTop:`1px solid ${c.line}`, color:c.text, width:"100%", maxWidth:520, borderTopLeftRadius:18, borderTopRightRadius:18, maxHeight:"82vh", overflowY:"auto"}} className="p-5 pb-8">
        <div className="flex items-center justify-between mb-3">
          <span style={{fontWeight:900, fontSize:17}}>{title}</span>
          <button onClick={onClose} style={{color:c.muted}}><X size={20}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

