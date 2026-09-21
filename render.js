window.JPDBCalendarRender = function ({ st, el, t, norm, cfg }) {
  function render() {
    if (st.loading) return;
    hide();
    el.note.classList.toggle("visible", st.demo);
    if(st.loadFailed) message(t(st.demo?"demoUnavailable":"loadError"),true);
    const rows = st.events.filter(cityGame).filter(searchMatch).filter(dateMatch)
      .sort((a,b)=>new Date(a.startAt)-new Date(b.startAt));
    el.count.textContent = rows.length===1 ? t("oneResult") : t("manyResults").replace("{count}",rows.length);
    el.events.innerHTML = "";
    if (!rows.length) { if(!st.loadFailed)message(t("noEvents")); return; }
    const groups = new Map();
    rows.forEach(e => { const k=dateKey(e.startAt,e.timezone||cfg.tz); if(!groups.has(k))groups.set(k,[]); groups.get(k).push(e); });
    for (const group of groups.values()) {
      const s=document.createElement("section"); s.className="day-group";
      const h=document.createElement("h2"); h.className="day-heading"; h.textContent=day(group[0]); s.append(h);
      group.forEach(e=>s.append(card(e))); el.events.append(s);
    }
  }

  function card(e) {
    const a=document.createElement("article"); a.className="event-card";
    const m=document.createElement("div"); m.className="event-main";
    const tm=document.createElement("div"); tm.className="event-time";
    tm.innerHTML=`<strong>${esc(time(e.startAt,e.timezone))}</strong><span>${esc(e.endAt?time(e.endAt,e.timezone):"")}</span>`;
    const c=document.createElement("div"); c.className="event-content";
    const h=document.createElement("h3"); h.className="event-title"; h.textContent=e.title||""; c.append(h);
    const meta=document.createElement("div"); meta.className="event-meta";
    meta.textContent=[e.venue,e.city].filter(Boolean).join(" · ")||t("locationFallback"); c.append(meta);

    if(Array.isArray(e.games)){
      const tags=document.createElement("div"); tags.className="game-tags";
      e.games.forEach(g=>{ const x=document.createElement("span"); x.className="game-tag"; x.textContent=g; tags.append(x); });
      c.append(tags);
    }

    const facts=document.createElement("div"); facts.className="event-facts";
    facts.append(fact(`${Number(e.participantsCount)||0} ${t("players")}`));
    if(e.maxParticipants!==null&&e.maxParticipants!==undefined&&e.spotsLeft!==null&&e.spotsLeft!==undefined){
      facts.append(fact(`${Math.max(0,Number(e.spotsLeft)||0)} ${t("spotsLeft")}`, Number(e.spotsLeft)===0));
    }
    facts.append(fact(`${t("ageGroup")}: ${ageLabel(e)}`));
    c.append(facts);

    let d=null;
    if(e.description){
      const b=document.createElement("button"); b.className="details-button"; b.type="button"; b.textContent=`${t("details")} ↓`; c.append(b);
      d=document.createElement("div"); d.className="event-details"; const p=document.createElement("p"); p.textContent=e.description; d.append(p);
      b.onclick=()=>{ const open=d.classList.toggle("open"); b.textContent=`${open?t("hideDetails"):t("details")} ${open?"↑":"↓"}`; };
    }

    if(e.competitionId){
      const actions=document.createElement("div"); actions.className="event-actions";
      if(e.registrationOpen&&(e.spotsLeft===null||e.spotsLeft===undefined||Number(e.spotsLeft)>0)){
        const join=document.createElement("a"); join.className="join-button";
        const params=new URLSearchParams({event:String(e.id),competition:String(e.competitionId)});
        if(st.demo)params.set("demo","1");
        else if(cfg.api)params.set("api",cfg.api);
        params.set("lang",st.lang);
        join.href=`join/?${params.toString()}`;
        join.textContent=t("join"); actions.append(join);
      } else {
        const closed=document.createElement("span"); closed.className="join-button disabled";
        closed.textContent=e.spotsLeft!=null&&Number(e.spotsLeft)===0?t("full"):t("registrationClosed"); actions.append(closed);
      }
      c.append(actions);
    }

    const badge=document.createElement("span"); badge.className="event-status"; badge.textContent=t("scheduled");
    m.append(tm,c,badge); a.append(m); if(d)a.append(d); return a;
  }

  function fact(text,alert=false){
    const x=document.createElement("span"); x.className=`event-fact${alert?" alert":""}`; x.textContent=text; return x;
  }

  function ageLabel(e){
    const min=e.minAge===null||e.minAge===undefined?null:Number(e.minAge);
    const max=e.maxAge===null||e.maxAge===undefined?null:Number(e.maxAge);
    if(min===null&&max===null)return t("allAges");
    if(min!==null&&max!==null)return t("ageRange").replace("{min}",min).replace("{max}",max);
    if(min!==null)return t("agePlus").replace("{min}",min);
    return t("ageUpTo").replace("{max}",max);
  }

  function cityGame(e){
    const cm=!st.city||norm(e.city)===norm(st.city);
    const gm=!st.game||(Array.isArray(e.games)&&e.games.some(g=>norm(g)===norm(st.game)));
    return cm&&gm;
  }
  function searchMatch(e){
    if(!st.search)return true;
    return norm([e.title,e.description,e.city,e.venue,...(e.games||[])].filter(Boolean).join(" ")).includes(norm(st.search));
  }
  function dateMatch(e){
    if(st.range==="all")return true;
    const d=new Date(e.startAt),n=new Date();
    if(!Number.isFinite(d.getTime())||d<n)return false;
    // Use calendar dates in Montreal, not the visitor's machine timezone.
    // UTC arithmetic here advances date labels, avoiding DST hour offsets.
    const today=dateKey(n,cfg.tz),eventDate=dateKey(d,cfg.tz);
    const anchor=new Date(`${today}T00:00:00Z`);
    const weekday=anchor.getUTCDay();
    const offset=days=>{const v=new Date(anchor);v.setUTCDate(v.getUTCDate()+days);return v.toISOString().slice(0,10);};
    const sunday=offset((7-weekday)%7);
    if(st.range==="week")return eventDate>=today&&eventDate<=sunday;
    const saturday=offset(weekday===0?-1:6-weekday);
    return eventDate>=saturday&&eventDate<=sunday;
  }
  function day(e){ return new Intl.DateTimeFormat(st.lang==="fr"?"fr-CA":"en-CA",{timeZone:e.timezone||cfg.tz,weekday:"long",day:"numeric",month:"long"}).format(new Date(e.startAt)); }
  function time(v,z){ return new Intl.DateTimeFormat(st.lang==="fr"?"fr-CA":"en-CA",{timeZone:z||cfg.tz,hour:"numeric",minute:"2-digit"}).format(new Date(v)); }
  function dateKey(v,z){
    const p=new Intl.DateTimeFormat("en-CA",{timeZone:z,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(v));
    const g=k=>p.find(x=>x.type===k)?.value||""; return `${g("year")}-${g("month")}-${g("day")}`;
  }
  function message(s,err=false){ el.msg.hidden=false; el.msg.textContent=s; el.msg.classList.toggle("error",err); }
  function hide(){ el.msg.hidden=true; el.msg.textContent=""; el.msg.classList.remove("error"); }
  function esc(v){ return String(v||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
  return { render, message, hide };
};
