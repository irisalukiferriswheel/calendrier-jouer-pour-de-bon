const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function setup(fail=false){
 const nodes=new Map(),sent=[];
 function node(){return {value:'',children:[],listeners:{},classList:{toggle(){}},append(x){this.children.push(x)},replaceChildren(){this.children=[]},addEventListener(k,f){this.listeners[k]=f},querySelector(){return get('submit')}}}
 function get(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);}
 const parent={postMessage:(message,origin)=>sent.push({message,origin})};
 const context={URLSearchParams,URL,location:{search:'?event=event-1&competition=competition-1'},localStorage:{getItem:()=>null,setItem(){}},
  document:{referrer:'https://www.jouerpourdebon.ca/competitions',documentElement:{},getElementById:get,querySelectorAll:()=>[],createElement:node},
  window:{parent,addEventListener(){}},console,crypto:{randomUUID:()=> 'request-1'},setTimeout:()=>1,clearTimeout(){},
  fetch:async url=>url.includes('/causes/choices')?{ok:!fail,json:async()=>({data:[{id:'cause-1',name:'Shared cause'}]})}:{ok:true,json:async()=>({data:{title:'Event',causeId:fail?null:'cause-1',causeName:'Shared cause',registrationOpen:true,spotsLeft:8,feeAmount:20,feeCurrency:'CAD'}})}};
 vm.runInNewContext(fs.readFileSync(__dirname+'/script.js','utf8'),context);
 return {get,sent};
}

test('join shows the organizer cause and sends no player-selected cause',async()=>{
 const s=setup();await new Promise(setImmediate);
 assert.equal(s.get('causeName').textContent,'Shared cause');
 await s.get('joinForm').listeners.submit({preventDefault(){}});
 assert.equal(s.sent.length,1);assert.equal(s.sent[0].message.payload.competitionId,'competition-1');
 assert.equal(s.sent[0].message.payload.causeId,undefined);assert.equal(s.sent[0].message.payload.customCauseName,undefined);
});
test('missing event cause prevents joining',async()=>{
 const s=setup(true);await new Promise(setImmediate);assert.equal(s.get('submit').disabled,true);
 await s.get('joinForm').listeners.submit({preventDefault(){}});assert.equal(s.sent.length,0);
});
