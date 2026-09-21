(() => {
  "use strict";
  const q=new URLSearchParams(location.search);
  const DEFAULT_API="https://jouer-pour-de-bon-api.onrender.com";
  const cfg={api:(q.get("demo")==="1"?"":(q.get("api")||DEFAULT_API)).replace(/\/$/,""),tz:"America/Montreal",lang:q.get("lang")==="en"?"en":"fr"};
  const tr=window.JPDB_CALENDAR_I18N;
  const st={lang:localStorage.getItem("jpdb-calendar-language")||cfg.lang,city:"",game:"",range:"all",search:"",filters:{cities:[],games:[]},events:[],loading:false,demo:!cfg.api,pagination:null};
  const $=id=>document.getElementById(id);
  const el={langs:[...document.querySelectorAll("[data-lang]")],ranges:[...document.querySelectorAll("[data-range]")],city:$("citySelect"),game:$("gameSelect"),search:$("searchInput"),reset:$("resetButton"),count:$("resultCount"),events:$("events"),msg:$("message"),note:$("connectionNote")};
  const t=k=>tr[st.lang]?.[k]||tr.fr[k]||k;
  const norm=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase();
  const view=window.JPDBCalendarRender({st,el,t,norm,cfg});
  let selectedRange="all";

  init();

  async function init(){
    bind(); applyLang(); loading(true);
    try {
      if(cfg.api){
        await loadEvents();
        if(!st.events.length) useDemo();
        else { try { await loadFilters(); } catch { st.filters=derive(st.events); } }
      }
      else useDemo();
      fillSelects(); loading(false); view.render();
    } catch(err){ console.error(err); useDemo(); st.loadFailed=true; fillSelects(); loading(false); view.render(); }
  }

  function useDemo(){ st.demo=true; st.events=window.makeJPDBDemoEvents(cfg.tz); st.filters=derive(st.events); st.pagination=null; }

  function bind(){
    $("searchForm").onsubmit=async event=>{
      event.preventDefault();
      if(st.loading)return;
      st.city=el.city.value;
      st.game=el.game.value;
      st.range=selectedRange;
      st.search=el.search.value.trim();
      await refresh();
      view.render();
    };
    el.langs.forEach(b=>b.onclick=()=>{ st.lang=b.dataset.lang; localStorage.setItem("jpdb-calendar-language",st.lang); applyLang(); fillSelects(); view.render(); });
    el.ranges.forEach(b=>b.onclick=()=>{ selectedRange=b.dataset.range; el.ranges.forEach(x=>{const on=x===b;x.classList.toggle("active",on);x.setAttribute("aria-pressed",String(on));}); });
    el.reset.onclick=async()=>{ if(st.loading)return; st.city=st.game=st.search=""; st.range=selectedRange="all"; el.city.value=el.game.value=el.search.value=""; el.ranges.forEach(x=>{const on=x.dataset.range==="all";x.classList.toggle("active",on);x.setAttribute("aria-pressed",String(on));}); fillSelects(); await refresh(); view.render(); };
  }

  async function refresh(){
    if(st.demo||!cfg.api)return;
    loading(true);
    try{ await loadEvents(); }
    catch(err){ console.error(err); st.loadFailed=true; st.events=[]; }
    finally{ loading(false); }
  }

  async function loadFilters(){
    const r=await fetch(`${cfg.api}/v1/events/search/filters`,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(15000)});
    if(!r.ok)throw Error(`filters ${r.status}`);
    const j=await r.json(); st.filters={cities:Array.isArray(j?.data?.cities)?j.data.cities:[],games:Array.isArray(j?.data?.games)?j.data.games:[]};
  }

  async function loadEvents(){
    const p=new URLSearchParams({from:new Date().toISOString(),limit:"100"});
    if(st.city)p.set("city",st.city);
    if(st.game)p.set("game",st.game);
    const r=await fetch(`${cfg.api}/v1/events/search?${p}`,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(15000)});
    if(!r.ok)throw Error(`events ${r.status}`);
    const j=await r.json();
    st.events=Array.isArray(j?.data)?j.data:[];
    st.loadFailed=false;
    st.pagination=j?.pagination&&typeof j.pagination==="object"?j.pagination:null;
  }

  function fillSelects(){ fill(el.city,t("allCities"),st.filters.cities,el.city.value); fill(el.game,t("allGames"),st.filters.games,el.game.value); }
  function fill(node,first,items,value){ node.innerHTML=""; option(node,first,""); items.forEach(x=>option(node,x,x)); node.value=value; }
  function option(node,label,value){ const o=document.createElement("option"); o.textContent=label; o.value=value; node.append(o); }

  function applyLang(){
    if(!tr[st.lang])st.lang="fr"; document.documentElement.lang=st.lang;
    document.title=st.lang==="fr"?"Calendrier — Jouer pour de bon":"Calendar — Playing for Good";
    document.querySelectorAll("[data-i18n]").forEach(x=>{const k=x.dataset.i18n;if(tr[st.lang][k])x.textContent=tr[st.lang][k]});
    document.querySelectorAll("[data-i18n-placeholder]").forEach(x=>{const k=x.dataset.i18nPlaceholder;if(tr[st.lang][k])x.placeholder=tr[st.lang][k]});
    el.langs.forEach(b=>{const on=b.dataset.lang===st.lang;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on))});
  }

  function derive(es){return{cities:uniq(es.map(e=>e.city).filter(Boolean)),games:uniq(es.flatMap(e=>e.games||[]))};}
  function uniq(a){const m=new Map();a.forEach(v=>{const k=norm(v);if(!m.has(k))m.set(k,v)});return[...m.values()].sort((a,b)=>a.localeCompare(b,st.lang));}
  function loading(on){st.loading=on;if(on){view.message(t("loading"));el.events.innerHTML="";el.count.textContent=""}else if(el.msg.textContent===t("loading"))view.hide();}
})();
