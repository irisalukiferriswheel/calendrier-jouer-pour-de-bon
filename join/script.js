(() => {
  "use strict";
  const q=new URLSearchParams(location.search);
  const eventId=q.get("event")||"";
  const competitionId=q.get("competition")||"";
  const api=(q.get("api")||"").replace(/\/$/,"");
  let lang=localStorage.getItem("jpdb-calendar-language")||"fr";
  const $=id=>document.getElementById(id);
  const messages={
    fr:{eyebrow:"Jouer pour de bon",title:"Participer",causeLabel:"Cause pour laquelle vous jouez *",accountNote:"Vous devez être connecté à votre compte de joueur pour confirmer l’inscription.",joinButton:"Participer à cette activité",players:"joueurs inscrits",spots:"places restantes",age:"Âge",allAges:"Tous âges",agePlus:"{min} ans et +",ageUpTo:"Jusqu’à {max} ans",ageRange:"{min}–{max} ans",free:"Gratuit",full:"Cette activité est complète.",demo:"Aperçu : la connexion au compte joueur et à l’API sera activée avant les inscriptions réelles.",signIn:"Connectez-vous à votre compte de joueur pour continuer.",success:"Votre inscription a été créée.",error:"Impossible de créer l’inscription pour le moment.",unknown:"Activité sélectionnée"},
    en:{eyebrow:"Playing for Good",title:"Join",causeLabel:"Cause you are playing for *",accountNote:"You must be signed in to your player account to confirm registration.",joinButton:"Join this activity",players:"players joined",spots:"spots left",age:"Age",allAges:"All ages",agePlus:"Ages {min}+",ageUpTo:"Up to age {max}",ageRange:"Ages {min}–{max}",free:"Free",full:"This activity is full.",demo:"Preview: player account and API connection will be enabled before real registrations.",signIn:"Sign in to your player account to continue.",success:"Your registration has been created.",error:"Registration could not be created right now.",unknown:"Selected activity"}
  };
  const demo={
    "demo-basketball":{title:"Basketball Knockout",city:"Sherbrooke",venue:"Parc Jacques-Cartier",participantsCount:8,spotsLeft:4,registrationOpen:true,minAge:18,maxAge:null,feeAmount:20,feeCurrency:"CAD"},
    "demo-chess":{title:"Soirée d’échecs",city:"Granby",venue:"Bibliothèque municipale",participantsCount:15,spotsLeft:1,registrationOpen:true,minAge:12,maxAge:null,feeAmount:10,feeCurrency:"CAD"},
    "demo-tetris":{title:"Tournoi Tetris",city:"Montréal",venue:"Maison de quartier",participantsCount:20,spotsLeft:0,registrationOpen:false,minAge:null,maxAge:null,feeAmount:15,feeCurrency:"CAD"}
  };
  let eventData=demo[eventId]||null;

  init();

  async function init(){
    document.querySelectorAll("[data-lang]").forEach(button=>button.onclick=()=>{lang=button.dataset.lang;localStorage.setItem("jpdb-calendar-language",lang);applyLang();renderSummary();});
    $("joinForm").addEventListener("submit",submit);
    applyLang();
    if(api&&eventId){
      try{
        const response=await fetch(`${api}/v1/calendar/events/${encodeURIComponent(eventId)}`,{headers:{Accept:"application/json"}});
        if(response.ok){const json=await response.json();eventData=json.data||eventData;}
      }catch(error){console.error(error);}
    }
    renderSummary();
  }

  function applyLang(){
    if(!messages[lang])lang="fr"; document.documentElement.lang=lang;
    document.title=lang==="fr"?"Participer — Jouer pour de bon":"Join — Playing for Good";
    document.querySelectorAll("[data-i18n]").forEach(node=>{const value=messages[lang][node.dataset.i18n];if(value)node.textContent=value;});
    document.querySelectorAll("[data-lang]").forEach(button=>button.classList.toggle("active",button.dataset.lang===lang));
  }

  function renderSummary(){
    const e=eventData||{title:messages[lang].unknown,city:"",venue:"",participantsCount:0,spotsLeft:null,registrationOpen:true,minAge:null,maxAge:null,feeAmount:null,feeCurrency:null};
    $("eventSummary").innerHTML="";
    const h=document.createElement("h2");h.textContent=e.title||messages[lang].unknown;$("eventSummary").append(h);
    const facts=document.createElement("div");facts.className="summary-facts";
    const price=formatPrice(e.feeAmount,e.feeCurrency);
    [
      [e.venue,e.city].filter(Boolean).join(" · "),
      `${Number(e.participantsCount)||0} ${messages[lang].players}`,
      e.spotsLeft===null||e.spotsLeft===undefined?"":`${Math.max(0,Number(e.spotsLeft)||0)} ${messages[lang].spots}`,
      `${messages[lang].age}: ${ageLabel(e.minAge,e.maxAge)}`,
      price
    ].filter(Boolean).forEach(value=>{const span=document.createElement("span");span.textContent=value;facts.append(span);});
    $("eventSummary").append(facts);
    const button=$("joinForm").querySelector("button[type=submit]");
    if(e.registrationOpen===false||Number(e.spotsLeft)===0){show(messages[lang].full,"error");button.disabled=true;} else {button.disabled=false;}
  }

  async function submit(event){
    event.preventDefault();
    const cause=$("causeInput").value.trim(); if(!cause)return;
    if(!competitionId){show(messages[lang].error,"error");return;}
    if(!api){show(messages[lang].demo);return;}
    const token=localStorage.getItem("jpdb_api_token")||"";
    if(!token){show(messages[lang].signIn);return;}
    try{
      const response=await fetch(`${api}/v1/registrations`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Accept:"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({competitionId,customCauseName:cause})
      });
      const json=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(json.error||`HTTP ${response.status}`);
      show(messages[lang].success,"success");
      $("joinForm").querySelector("button[type=submit]").disabled=true;
    }catch(error){console.error(error);show(messages[lang].error,"error");}
  }

  function ageLabel(minRaw,maxRaw){
    const min=minRaw===null||minRaw===undefined?null:Number(minRaw);
    const max=maxRaw===null||maxRaw===undefined?null:Number(maxRaw);
    if(min===null&&max===null)return messages[lang].allAges;
    if(min!==null&&max!==null)return messages[lang].ageRange.replace("{min}",min).replace("{max}",max);
    if(min!==null)return messages[lang].agePlus.replace("{min}",min);
    return messages[lang].ageUpTo.replace("{max}",max);
  }

  function formatPrice(amount,currency){
    if(amount===null||amount===undefined)return "";
    const value=Number(amount);
    if(!Number.isFinite(value))return "";
    if(value===0)return messages[lang].free;
    try{return new Intl.NumberFormat(lang==="fr"?"fr-CA":"en-CA",{style:"currency",currency:currency||"CAD"}).format(value);}catch{return `${value} ${currency||"CAD"}`;}
  }

  function show(text,type=""){$("joinMessage").hidden=false;$("joinMessage").className=`message ${type}`.trim();$("joinMessage").textContent=text;}
})();