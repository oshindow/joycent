const ACCENTS = ["Sichuan", "Henan", "singapore", "Wuhan", "Tianjin", "Shanghai", "Guangdong"];
const DISPLAY = {Sichuan:"Sichuan",Henan:"Henan",singapore:"Singapore",Wuhan:"Wuhan",Tianjin:"Tianjin",Shanghai:"Shanghai",Guangdong:"Guangdong"};
const $ = (s) => document.querySelector(s);
const audio = (src) => `<audio controls preload="none"><source src="${src}" type="audio/wav"></audio>`;

async function init(){
  const samples = await fetch("data/retained_samples_39.json").then(r=>r.json());
  renderSameSpeaker(); renderTabs(samples); renderSameAccent(samples,"Sichuan"); renderCross(samples); renderComparisons(samples); renderEnvironment();
}
function renderSameSpeaker(){
  $("#same-speaker-grid").innerHTML=ACCENTS.map((a,i)=>`<article class="audio-card"><span class="number">0${i+1}</span><h3>${DISPLAY[a]}</h3>${audio(`audio/same-speaker/${a}.wav`)}</article>`).join("");
}
function renderTabs(samples){
  const root=$("#accent-tabs"); root.innerHTML=ACCENTS.map((a,i)=>`<button class="tab ${i===0?'active':''}" data-accent="${a}">${DISPLAY[a]}</button>`).join("");
  root.addEventListener("click",e=>{if(!e.target.matches("button"))return;root.querySelectorAll("button").forEach(x=>x.classList.remove("active"));e.target.classList.add("active");renderSameAccent(samples,e.target.dataset.accent)});
}
function renderSameAccent(samples,accent){
  let rows=samples.filter(x=>x.target_accent===accent&&x.source_accent===accent);
  if(!rows.length) rows=samples.filter(x=>x.target_accent===accent);
  $("#same-accent-grid").innerHTML=rows.slice(0,6).map(x=>`<article class="sample-card"><span class="meta">Speaker ${x.speaker_id} · ${x.category.replaceAll('_',' ')}</span><p class="transcript">${x.text}</p>${audio(x.systems.ours)}</article>`).join("");
}
function renderCross(samples){
  const rows=samples.filter(x=>x.source_accent!==x.target_accent).filter((x,i,a)=>a.findIndex(y=>y.source_accent===x.source_accent&&y.target_accent===x.target_accent)===i).slice(0,8);
  $("#cross-grid").innerHTML=rows.map(x=>`<article class="cross-card"><span class="meta">Speaker ${x.speaker_id}</span><h3>${DISPLAY[x.source_accent]} voice → ${DISPLAY[x.target_accent]} accent</h3><div class="cross-flow"><div class="mini-audio"><label>Speaker reference<br>${DISPLAY[x.source_accent]}</label>${audio(x.speaker_reference)}</div><div class="arrow">→</div><div class="mini-audio"><label>Accent reference<br>${DISPLAY[x.target_accent]}</label>${audio(x.accent_reference)}</div><div class="arrow">→</div><div class="mini-audio"><label>Generated<br>Our model</label>${audio(x.systems.ours)}</div></div></article>`).join("");
}
function renderComparisons(samples){
  const select=$("#comparison-case");
  select.innerHTML=samples.map((x,i)=>`<option value="${i}">${String(i+1).padStart(2,"0")} · ${DISPLAY[x.source_accent]} → ${DISPLAY[x.target_accent]} · Speaker ${x.speaker_id}</option>`).join("");
  $("#comparison-count").textContent=`${samples.length} retained cases`;
  const update=()=>{
    const x=samples[Number(select.value)];
    $("#comparison-route").textContent=`${DISPLAY[x.source_accent]} → ${DISPLAY[x.target_accent]}`;
    $("#comparison-speaker").textContent=`Speaker ${x.speaker_id}`;
    $("#comparison-text").textContent=x.text;
    $("#comparison-references").innerHTML=`<div class="comparison-audio reference"><span>Speaker reference</span><small>${DISPLAY[x.source_accent]} source</small>${audio(x.speaker_reference)}</div><div class="comparison-audio reference"><span>Accent reference</span><small>${DISPLAY[x.target_accent]} target</small>${audio(x.accent_reference)}</div>`;
    const models=[["diffusion_TTS","Diffusion TTS","Baseline"],["accentbox","AccentBox","Baseline"],["dart","DART","Baseline"],["ours","Joycent","Ours"]];
    $("#comparison-models").innerHTML=models.map(([key,name,type])=>`<div class="comparison-audio model ${key==='ours'?'featured':''}"><span>${name}</span><small>${type}</small>${audio(x.systems[key])}</div>`).join("");
  };
  select.addEventListener("change",update); update();
}
function renderEnvironment(){
  $("#environment-grid").innerHTML=Array.from({length:5},(_,i)=>`<article class="environment-case"><div class="environment-heading"><span class="slot">0${i+1}</span><div><span class="meta">Environment reconstruction</span><h3>Case ${i+1}</h3></div></div><div class="environment-pair"><div class="environment-audio"><span>Speaker reference</span><small>Original voice &amp; environment</small>${audio(`audio/environment/case-${i+1}-reference.wav`)}<code>case-${i+1}-reference.wav</code></div><div class="pair-arrow">→</div><div class="environment-audio generated"><span>Generated speech</span><small>Reconstructed voice &amp; environment</small>${audio(`audio/environment/case-${i+1}-generated.wav`)}<code>case-${i+1}-generated.wav</code></div></div></article>`).join("");
}
window.addEventListener("scroll",()=>{const y=Math.min(scrollY/(innerHeight*.7),1);const hero=$(".hero-sticky");hero.style.opacity=1-y;hero.style.transform=`translateY(${-y*55}px) scale(${1-y*.04})`});
init().catch(err=>{console.error(err);document.body.insertAdjacentHTML("beforeend",`<p style="position:fixed;bottom:10px;left:10px;background:#fee;padding:10px">Run through a local web server to load demo data.</p>`)});
