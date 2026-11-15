// ===== Halaman PESAN: nama + pesan, disimpan di browser (localStorage), sama seperti komentar di web contoh =====
// Isi dua baris ini setelah membuat project Supabase (lihat README). Kosong = pesan hanya tersimpan di browser (localStorage).
const SUPABASE_URL="https://sfcofsahxcpiwctawiao.supabase.co";       // contoh: "https://abcdxyz.supabase.co"
const SUPABASE_ANON_KEY="sb_publishable_IfgiMvn3V6Cfq8LEtO-t7Q_7fDlXSVZ";  // anon public key
(()=>{
const KEY="kopifab_pesan",live=!!(SUPABASE_URL&&SUPABASE_ANON_KEY);
const HD={apikey:SUPABASE_ANON_KEY,"Content-Type":"application/json"};if(!SUPABASE_ANON_KEY.startsWith("sb_"))HD.Authorization="Bearer "+SUPABASE_ANON_KEY; // key baru (sb_publishable_) cukup lewat header apikey
const fmt=d=>new Date(d).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});
const lsLoad=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}};
const lsSave=l=>{try{localStorage.setItem(KEY,JSON.stringify(l.slice(0,50)))}catch(e){}};
async function load(){if(!live)return lsLoad();const r=await fetch(`${SUPABASE_URL}/rest/v1/pesan?select=name,text,created_at&tampil=eq.true&order=created_at.desc&limit=100`,{headers:HD});if(!r.ok)throw 0;return(await r.json()).map(c=>({name:c.name,text:c.text,date:fmt(c.created_at)}))}
async function add(name,text){if(!live){const l=lsLoad();l.unshift({name,text,date:fmt(new Date())});lsSave(l);return}const r=await fetch(`${SUPABASE_URL}/rest/v1/pesan`,{method:"POST",headers:{...HD,Prefer:"return=minimal"},body:JSON.stringify({name,text})});if(!r.ok)throw 0}
Object.assign(EN,{"PESAN":"MESSAGES","Pesan":"Messages","Nama":"Name","Tulis nama dan pesanmu untuk kami.":"Leave us your name and a message.","KIRIM PESAN":"SEND MESSAGE","Pesan dari tetangga":"Messages from neighbors","Belum ada pesan. Jadilah yang pertama!":"No messages yet. Be the first!","Isi nama.":"Please enter your name.","Isi pesan.":"Please write a message.","Terkirim! Terima kasih ✨":"Sent! Thank you ✨","Pesan tersimpan di browser ini saja (localStorage).":"Messages are saved in this browser only (localStorage).","Gagal memuat pesan.":"Failed to load messages.","Gagal mengirim. Coba lagi nanti.":"Failed to send. Try again later."});
const D=["✿","★","✎","♥","☺","♪"],n=$("#pName"),t=$("#pText"),st=$("#pSt");
const ph=()=>{const e=LANG==="en";n.placeholder=e?"Enter your name…":"Masukkan nama kamu…";t.placeholder=e?"Write your message here…":"Tulis pesanmu di sini…"};
const chk=(el,ok,msg)=>{el.parentNode.querySelector("em").textContent=ok?"":msg;return ok};
async function draw(){let l=[];try{l=await load()}catch(e){st.textContent="Gagal memuat pesan."}const ul=$("#pList");$("#pN").textContent=l.length?"("+l.length+")":"";ul.innerHTML=l.length?"":"<li class='note'><p>Belum ada pesan. Jadilah yang pertama!</p></li>";
l.forEach((c,i)=>{const li=document.createElement("li");li.className="note";const p=document.createElement("p");p.textContent=c.text;const s=document.createElement("small"),b=document.createElement("b");b.textContent=c.name;s.append("— ",b," · "+c.date);const d=document.createElement("i");d.className="dd";d.textContent=D[i%D.length];li.append(p,s,d);ul.append(li)})}
t.oninput=()=>{$("#pCnt").textContent=t.value.length+"/300"};
$("#pForm").onsubmit=async e=>{e.preventDefault();st.textContent="";
if(![chk(n,n.value.trim().length>1,"Isi nama."),chk(t,t.value.trim().length>1,"Isi pesan.")].every(Boolean))return;
try{await add(n.value.trim(),t.value.trim());n.value=t.value="";t.oninput();st.textContent="Terkirim! Terima kasih ✨";await draw()}catch(x){st.textContent="Gagal mengirim. Coba lagi nanti."}applyLang()};
$("#pDemo").textContent=live?"":"Pesan tersimpan di browser ini saja (localStorage).";
$("#lang").addEventListener("change",ph);ph();draw().then(applyLang);
})();
