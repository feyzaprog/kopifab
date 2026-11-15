// ===== SUARA KOPIFAB =====
// Semua suara dibuat langsung oleh browser (Web Audio API), jadi tidak ada file mp3 yang perlu diunduh.
// 1) Musik lofi chill yang terus berputar (generatif: drum, bass, piano elektrik, gema).
// 2) Efek suara: klik, pilih menu, buka/tutup menu & foto, langkah barista, ojek datang, pesan terkirim.
// Satu ikon speaker di pojok kanan atas menghidupkan/mematikan semuanya. Pilihan tersimpan di localStorage.
// Catatan: browser hanya mengizinkan suara setelah pengunjung mengklik/menyentuh halaman, jadi musik mulai dari interaksi pertama.
(()=>{
const AC=window.AudioContext||window.webkitAudioContext;
const KEY="kopifab_sound2";
const st={on:true};                                   // default: suara hidup
try{Object.assign(st,JSON.parse(localStorage.getItem(KEY))||{})}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
const $=s=>document.querySelector(s);
const MUSIC_VOL=.8;                                   // volume musik (0 sampai 1). Naik/turunkan di sini.
let ctx,sfxBus,musBus,keysBus,drumBus,noiseBuf,started=false;

// ---------- mesin suara ----------
function init(){
  if(!AC)return false;
  if(!ctx){
    try{ctx=new AC()}catch(e){return false}
    const comp=ctx.createDynamicsCompressor(),master=ctx.createGain();
    master.gain.value=.8;comp.connect(ctx.destination);master.connect(comp);
    sfxBus=ctx.createGain();sfxBus.gain.value=st.on?1:0;sfxBus.connect(master);
    // jalur musik: warm low-pass supaya terdengar "kusam" khas lofi
    musBus=ctx.createGain();musBus.gain.value=0;
    const warm=ctx.createBiquadFilter();warm.type="lowpass";warm.frequency.value=6500;
    musBus.connect(warm);warm.connect(master);
    keysBus=ctx.createGain();keysBus.connect(musBus);
    drumBus=ctx.createGain();const dl=ctx.createBiquadFilter();dl.type="lowpass";dl.frequency.value=5500;drumBus.connect(dl);dl.connect(musBus);
    // gema (dotted eighth) untuk piano
    const send=ctx.createGain(),dly=ctx.createDelay(2),fb=ctx.createGain(),fl=ctx.createBiquadFilter(),ret=ctx.createGain();
    send.gain.value=.4;dly.delayTime.value=.608;fb.gain.value=.38;fl.type="lowpass";fl.frequency.value=2200;ret.gain.value=.5;
    keysBus.connect(send);send.connect(dly);dly.connect(fl);fl.connect(fb);fb.connect(dly);dly.connect(ret);ret.connect(musBus);
    const n=ctx.sampleRate*2;noiseBuf=ctx.createBuffer(1,n,ctx.sampleRate);
    const d=noiseBuf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
    ctx.onstatechange=()=>{if(ctx.state==="running"){started=true;apply();openGate()}paint()};
  }
  if(ctx.state==="suspended")ctx.resume().catch(()=>{});
  return true;
}
const env=(g,t,a,peak,d)=>{g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)};
// t = jeda (detik) dari sekarang, at = waktu absolut di jam audio (dipakai musik)
function tone({f=440,f2,type="sine",t=0,at,a=.005,d=.12,v=.2,bus=sfxBus,cents=0}){
  const t0=at!==undefined?at:ctx.currentTime+t,o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t0);if(cents)o.detune.value=cents;
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+a+d);
  env(g,t0,a,v,d);o.connect(g);g.connect(bus);o.start(t0);o.stop(t0+a+d+.05);
}
function noise({t=0,at,a=.005,d=.1,v=.2,type="bandpass",f=1000,f2,q=1,bus=sfxBus}){
  const t0=at!==undefined?at:ctx.currentTime+t,s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();
  s.buffer=noiseBuf;s.loop=true;fl.type=type;fl.Q.value=q;fl.frequency.setValueAtTime(f,t0);
  if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t0+a+d);
  env(g,t0,a,v,d);s.connect(fl);fl.connect(g);g.connect(bus);s.start(t0);s.stop(t0+a+d+.05);
}
function engine(dur,up){
  const t0=ctx.currentTime,o=ctx.createOscillator(),lp=ctx.createBiquadFilter(),trem=ctx.createGain(),
        lfo=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain();
  o.type="sawtooth";
  o.frequency.setValueAtTime(up?40:85,t0);
  o.frequency.linearRampToValueAtTime(up?85:38,t0+dur*.6);
  o.frequency.linearRampToValueAtTime(up?55:30,t0+dur);
  lp.type="lowpass";lp.frequency.value=380;
  trem.gain.value=.7;lfo.frequency.value=21;lg.gain.value=.3;lfo.connect(lg);lg.connect(trem.gain);
  g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(.17,t0+.15);g.gain.linearRampToValueAtTime(.0001,t0+dur);
  o.connect(lp);lp.connect(trem);trem.connect(g);g.connect(sfxBus);
  o.start(t0);lfo.start(t0);o.stop(t0+dur+.1);lfo.stop(t0+dur+.1);
}

// ---------- efek suara ----------
const S={
  tick(){tone({f:1200,f2:700,type:"triangle",d:.05,v:.12})},
  hover(){tone({f:900,d:.035,v:.035})},
  pop(){tone({f:380,f2:760,d:.09,v:.22});noise({type:"highpass",f:4000,d:.03,v:.05})},
  sel(){tone({f:660,type:"triangle",d:.08,v:.16});tone({f:990,t:.07,type:"triangle",d:.12,v:.14})},
  size(){tone({f:520,f2:620,type:"triangle",d:.07,v:.15})},
  open(){noise({f:400,f2:2400,q:.8,a:.04,d:.28,v:.25});tone({f:300,f2:600,d:.18,v:.1})},
  close(){noise({f:2400,f2:400,q:.8,a:.03,d:.22,v:.22});tone({f:520,f2:260,d:.14,v:.08})},
  flip(){noise({type:"highpass",f:3200,a:.008,d:.09,v:.2});tone({f:500,f2:380,type:"triangle",d:.06,v:.06})},
  page(){noise({f:600,f2:1800,q:.7,a:.05,d:.25,v:.13})},
  key(){tone({f:1600+Math.random()*500,type:"triangle",d:.02,v:.04})},
  step(n){tone({f:n%2?95:112,f2:55,d:.09,v:.3});noise({type:"lowpass",f:500,a:.004,d:.05,v:.12})},
  honk(t0=0){for(const t of[t0,t0+.2]){tone({f:620,type:"square",t,d:.12,v:.05});tone({f:780,type:"square",t,d:.12,v:.05})}},
  arrive(){engine(1.3,true);S.honk(.9)},
  leave(){engine(1,false)},
  chime(){[523.25,659.25,783.99,1046.5].forEach((f,i)=>tone({f,t:i*.09,type:"triangle",a:.01,d:.5,v:.16}))},
  err(){tone({f:200,f2:140,type:"sawtooth",d:.18,v:.09});tone({f:170,f2:110,t:.17,type:"sawtooth",d:.22,v:.09})}
};
const play=(n,...a)=>{if(st.on&&ctx&&ctx.state==="running"&&S[n]){try{S[n](...a)}catch(e){}}};

// ---------- musik lofi (generatif, 74 BPM, swing) ----------
// Untuk mengubah suasana: BPM, urutan akor (CH, nomor MIDI), dan volume tiap alat di bawah.
const BPM=74,STEP=60/BPM/4;                         // 1 langkah = 1/16 not
const m2f=m=>440*Math.pow(2,(m-69)/12);
const CH=[[48,52,55,59,62],[45,48,52,55,59],[50,53,57,60,64],[43,47,53,57,64]]; // Cmaj9 - Am9 - Dm9 - G13
const BASS=[36,33,38,31];
const pick=a=>a[Math.floor(Math.random()*a.length)];
const hum=()=>(Math.random()-.5)*.014;               // "tangan manusia": jitter waktu kecil

function ep(f,t0,dur,v,bus){                         // piano elektrik ala Rhodes
  const o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),g2=ctx.createGain(),lp=ctx.createBiquadFilter();
  o.type="sine";o.frequency.value=f;o.detune.value=(Math.random()-.5)*12;
  o2.type="sine";o2.frequency.value=f*4;
  lp.type="lowpass";lp.frequency.value=2600;
  g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(v,t0+.008);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  g2.gain.setValueAtTime(.0001,t0);g2.gain.exponentialRampToValueAtTime(v*.35,t0+.004);g2.gain.exponentialRampToValueAtTime(.0001,t0+.18);
  o.connect(g);o2.connect(g2);g.connect(lp);g2.connect(lp);lp.connect(bus);
  o.start(t0);o2.start(t0);o.stop(t0+dur+.05);o2.stop(t0+.25);
}
function chordHit(notes,T,dur,v){notes.forEach((n,i)=>ep(m2f(n),T+i*.022+hum(),dur,v,keysBus))}   // sedikit "dirol"
function kick(T){tone({at:T+hum(),f:130,f2:42,a:.003,d:.28,v:.55,bus:drumBus})}
function snare(T){T+=hum();noise({at:T,f:1900,q:.6,a:.002,d:.16,v:.26,bus:drumBus});tone({at:T,f:190,f2:140,type:"triangle",a:.002,d:.1,v:.14,bus:drumBus})}
function hat(T,v){noise({at:T+hum(),type:"highpass",f:7000,a:.001,d:.035,v,bus:drumBus})}
function bass(T,m,d,v){tone({at:T+hum(),f:m2f(m),type:"triangle",a:.01,d,v,bus:keysBus});tone({at:T+hum(),f:m2f(m),a:.01,d,v:v*.8,bus:keysBus})}

function playStep(s,T){
  const bar=(s>>4)&3,k=s&15,ch=CH[bar],upper=ch.slice(2);
  // drum
  if(k===0||k===10||(k===7&&bar%2))kick(T);
  if(k===4||k===12)snare(T);
  if(k===15&&Math.random()<.3)snare(T+.02);            // ghost note
  if(k%2===0)hat(T+(k%4===2?.024:0),k%4===0?.055:.032); // hi-hat 1/8 dengan swing
  // piano (comping)
  if(k===0)chordHit(ch,T,2.6,.05);
  else if(k===7)chordHit(upper,T,1,.032);
  else if(k===10&&Math.random()<.5)chordHit(upper,T,.8,.028);
  // bass
  if(k===0)bass(T,BASS[bar],.9,.2);
  else if((k===7||k===10)&&Math.random()<.6)bass(T,BASS[bar]+(Math.random()<.5?0:7),.4,.15);
  // melodi jarang-jarang
  if([2,5,8,11,14].includes(k)&&Math.random()<.2)ep(m2f(pick(ch)+12+(Math.random()<.3?12:0)),T+hum(),1.3,.026,keysBus);
}

let sched=null,nextT=0,step=0;
function loop(){
  sched=setTimeout(loop,90);
  if(!ctx||!st.on||ctx.state!=="running")return;
  if(nextT<ctx.currentTime)nextT=ctx.currentTime+.06;
  while(nextT<ctx.currentTime+.35){playStep(step&63,nextT);nextT+=STEP;step++}
}

// terapkan status on/off ke semua jalur suara
function apply(){
  if(!ctx)return;
  const now=ctx.currentTime;
  sfxBus.gain.setTargetAtTime(st.on?1:0,now,.03);
  musBus.gain.setTargetAtTime(st.on?MUSIC_VOL:0,now,st.on?.8:.25);
  if(st.on&&ctx.state==="running"){if(!sched)loop()}
  else{clearTimeout(sched);sched=null}
}

// ---------- tombol speaker (pojok kanan atas) ----------
const btn=document.createElement("button");
btn.type="button";btn.id="snd";btn.className="snd-btn";
btn.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor"/><g class="w"><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/></g><g class="x"><path d="M16 9.5l5 5M21 9.5l-5 5"/></g></svg>';
const nav=$("nav");(nav||document.body).appendChild(btn);
function paint(){
  btn.classList.toggle("off",!st.on);
  btn.classList.toggle("wait",st.on&&!started);       // berdenyut = menunggu klik pertama
  btn.setAttribute("aria-pressed",String(st.on));
  const t=!st.on?"Suara mati. Klik untuk menyalakan / Sound off":started?"Suara hidup. Klik untuk mematikan / Sound on":"Klik di mana saja untuk memutar musik / Click anywhere to start the music";
  btn.title=t;btn.setAttribute("aria-label",t);
}
btn.onclick=()=>{st.on=!st.on;save();init();apply();paint();if(st.on)play("tick")};
paint();

// ---------- layar masuk: satu klik = musik langsung hidup ----------
// Browser memblokir suara sebelum ada klik/sentuhan. Karena itu layar loading menampilkan "KLIK UNTUK MASUK";
// klik itu sekaligus membuka audio. Tidak muncul jika pengunjung sebelumnya mematikan suara, atau browser mengizinkan autoplay.
const ld=$("#load");let gateOn=false;
window.kfGate=()=>st.on&&!!AC&&!started&&gateOn;
function openGate(){gateOn=false;if(ld)ld.classList.add("off")}
if(ld&&st.on&&AC){
  gateOn=true;
  const en=typeof LANG!=="undefined"&&LANG==="en",h=document.createElement("div");
  h.className="enter";h.textContent=en?"CLICK TO ENTER ♪":"KLIK UNTUK MASUK ♪";ld.appendChild(h);ld.classList.add("gate");
}

// ---------- membuka audio (aturan browser: butuh klik/sentuhan pertama) ----------
const wake=()=>{if(init())apply();if(gateOn)setTimeout(openGate,1200)};   // cadangan: layar masuk tetap tertutup walau audio gagal jalan
["pointerdown","keydown","touchstart"].forEach(ev=>addEventListener(ev,wake,{capture:true,passive:true}));
init();                                               // kalau browser mengizinkan autoplay, musik langsung jalan
document.addEventListener("visibilitychange",()=>{    // tab di latar belakang = suara berhenti
  if(!ctx)return;
  if(document.hidden)ctx.suspend().catch(()=>{});
  else ctx.resume().catch(()=>{});
});

// ---------- klik ----------
document.addEventListener("click",e=>{
  const t=e.target;if(!t.closest)return;const c=s=>t.closest(s);
  if(c("#snd")||c(".p")||c("#lx")||c("#mx"))return;   // buka/tutup foto & menu dibunyikan oleh pengamat di bawah
  if(c("#lp,#ln2"))return play("flip");
  if(c("#mg button,#items button,.tabs button"))return play("sel");
  if(c(".sizes button[data-s]"))return play("size");
  if(c("#board"))return;
  if(c(".spot,.sign"))return play("pop");
  if(c("button,a,select,label"))play("tick");
},true);

// ---------- hover (hanya mouse) ----------
let lastH=0;
document.addEventListener("pointerover",e=>{
  if(e.pointerType!=="mouse"||!e.target.closest)return;
  const s=e.target.closest(".spot,.sign,.p,.tabs button,.items button,.links a,.more");
  if(s&&!s.contains(e.relatedTarget)&&performance.now()-lastH>70){lastH=performance.now();play("hover")}
},true);

// ---------- ketik di halaman Pesan ----------
let lastK=0;
["#pName","#pText"].forEach(s=>{const el=$(s);el&&el.addEventListener("input",()=>{if(performance.now()-lastK>40){lastK=performance.now();play("key")}})});

// ---------- pindah halaman ----------
addEventListener("hashchange",()=>play("page"));

// ---------- pengamat perubahan tampilan ----------
const watch=(el,fn)=>el&&new MutationObserver(fn).observe(el,{attributes:true,attributeFilter:["class"]});
const onOff=(el,yes,no)=>{let was=el.classList.contains("on");watch(el,()=>{const n=el.classList.contains("on");if(n!==was){was=n;play(n?yes:no)}})};
const lb=$("#lb"),mnu=$("#mnu");
lb&&onOff(lb,"open","close");mnu&&onOff(mnu,"open","close");

const vis=el=>{if(!el||el.offsetParent===null)return false;const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight};

// langkah barista saat berjalan mengikuti kursor
const wk=$("#walker");let stT=null,sn=0;
wk&&watch(wk,()=>{
  const w=wk.classList.contains("walking");
  if(w&&!stT){const go=()=>{if(vis(wk))play("step",sn++)};go();stT=setInterval(go,360)}
  else if(!w&&stT){clearInterval(stT);stT=null}
});

// ojek datang dan pergi
const co=$("#courier");let came=co&&co.classList.contains("come");
co&&watch(co,()=>{
  const n=co.classList.contains("come");
  if(n!==came){came=n;if(vis(co))play(n?"arrive":"leave")}
});

// hasil kirim pesan: berhasil = lonceng, gagal/kosong = nada rendah
const pst=$("#pSt"),pf=$("#pForm");
pst&&new MutationObserver(()=>{const x=pst.textContent;if(/terkirim|sent/i.test(x))play("chime");else if(/gagal|failed/i.test(x))play("err")}).observe(pst,{childList:true});
pf&&pf.addEventListener("submit",()=>setTimeout(()=>{if([...pf.querySelectorAll("em")].some(m=>m.textContent.trim()))play("err")},0),true);
})();
