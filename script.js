const CITIES=["Delhi","Mumbai","Kolkata","Chennai","Bengaluru","Hyderabad","Lucknow","Jaipur","Ahmedabad","Pune","Aligarh","Bhopal"];
const CLASSES={"Sleeper (SL)":1,"AC 3-Tier (3A)":2.2,"AC 2-Tier (2A)":3.1,"AC First (1A)":5};
const $=id=>document.getElementById(id);
let mode="login",user=null;

// safe storage helpers
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
// memory fallback if storage blocked
let mem={users:{},bk:{}};
const getUsers=()=>store.get("rb_users",mem.users);
const setUsers=u=>{mem.users=u;store.set("rb_users",u)};
const getBk=()=>store.get("rb_bookings",mem.bk);
const setBk=b=>{mem.bk=b;store.set("rb_bookings",b)};

async function hash(s){
  const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
function say(el,t,c){el.textContent=t;el.className="msg "+(c||"")}

function setMode(m){
  mode=m;const reg=m==="register";
  $("authTitle").textContent=reg?"Create your account":"Welcome back";
  $("authSub").textContent=reg?"Register to start booking tickets.":"Log in to book and manage your train tickets.";
  $("authBtn").textContent=reg?"Register":"Log in";
  $("confWrap").classList.toggle("hidden",!reg);
  $("switchTxt").textContent=reg?"Already registered?":"New here?";
  $("switchLink").textContent=reg?"Log in":"Create an account";
  say($("authMsg"),"");
}
$("switchLink").onclick=()=>setMode(mode==="login"?"register":"login");

async function submitAuth(){
  const u=$("u").value.trim().toLowerCase(),p=$("p").value,m=$("authMsg");
  if(!/^[a-z0-9_]{3,30}$/.test(u))return say(m,"Username: 3–30 letters, numbers or underscore.","err");
  if(p.length<6)return say(m,"Password must be at least 6 characters.","err");
  const users=getUsers();
  if(mode==="register"){
    if(p!==$("p2").value)return say(m,"Passwords do not match.","err");
    if(users[u])return say(m,"That username is taken.","err");
    users[u]=await hash(u+":"+p);setUsers(users);
    say(m,"Account created. Logging you in…","ok");
  }else if(users[u]!==await hash(u+":"+p)){
    return say(m,"Invalid username or password.","err");
  }
  user=u;showApp();
}
$("authBtn").onclick=submitAuth;
["u","p","p2"].forEach(i=>$(i).addEventListener("keydown",e=>{if(e.key==="Enter")submitAuth()}));

function showApp(){
  $("auth").classList.add("hidden");$("app").classList.remove("hidden");
  $("userbox").classList.remove("hidden");$("who").textContent="Signed in as "+user;
  $("name").value="";render();updateFare();
}
$("logout").onclick=()=>{
  user=null;$("app").classList.add("hidden");$("auth").classList.remove("hidden");
  $("userbox").classList.add("hidden");$("p").value="";$("p2").value="";setMode("login");
};

// form setup
const opt=(a)=>a.map(x=>`<option>${x}</option>`).join("");
$("from").innerHTML=opt(CITIES);$("to").innerHTML=opt(CITIES);$("to").selectedIndex=1;
$("cls").innerHTML=opt(Object.keys(CLASSES));
$("seats").innerHTML=opt([1,2,3,4,5,6]);
const today=new Date().toISOString().slice(0,10);
$("date").min=today;$("date").value=today;

function fare(){
  const a=CITIES.indexOf($("from").value),b=CITIES.indexOf($("to").value);
  const km=(Math.abs(a-b)+1)*180;
  return Math.round(km*0.9*CLASSES[$("cls").value]*Number($("seats").value));
}
function updateFare(){
  $("fare").textContent=$("from").value===$("to").value?"Estimated fare: –":"Estimated fare: ₹"+fare().toLocaleString("en-IN");
}
["from","to","cls","seats"].forEach(i=>$(i).onchange=updateFare);

$("book").onclick=()=>{
  const m=$("bookMsg"),name=$("name").value.trim();
  if(name.length<2)return say(m,"Enter the passenger name.","err");
  if($("from").value===$("to").value)return say(m,"Origin and destination must differ.","err");
  if(!$("date").value||$("date").value<today)return say(m,"Choose a valid future date.","err");
  const all=getBk();(all[user]=all[user]||[]).unshift({
    pnr:"PNR"+Math.floor(1e9+Math.random()*9e9),name,from:$("from").value,to:$("to").value,
    date:$("date").value,cls:$("cls").value,seats:Number($("seats").value),amount:fare()
  });
  setBk(all);$("name").value="";say(m,"Booking confirmed!","ok");render();
};

function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){
  const list=(getBk()[user]||[]);
  $("list").innerHTML=list.length?list.map(t=>`
    <div class="ticket"><div>
      <div class="route">${esc(t.from)} → ${esc(t.to)}</div>
      <div class="meta">${esc(t.name)} · ${t.seats} passenger${t.seats>1?"s":""} · ${esc(t.cls)}</div>
      <div class="meta">${new Date(t.date+"T00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} · <span class="pnr">${t.pnr}</span></div>
    </div><div><div class="price">₹${t.amount.toLocaleString("en-IN")}</div>
      <button class="danger" data-p="${t.pnr}" style="margin-top:8px">Cancel</button></div></div>`).join("")
    :'<div class="card empty">No bookings yet. Book your first ticket.</div>';
  $("list").querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{
    const all=getBk();all[user]=all[user].filter(t=>t.pnr!==b.dataset.p);setBk(all);render();
  });
}
