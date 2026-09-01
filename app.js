const ACCENTS = ["Sichuan", "Henan", "singapore", "Wuhan", "Tianjin", "Shanghai", "Guangdong"];
const SAME_ACCENT_ORDER = ["Shanghai", "Guangdong", "singapore", "Sichuan", "Henan", "Wuhan", "Tianjin"];
const DISPLAY = {Sichuan:"Sichuan",Henan:"Henan",singapore:"Singapore",Wuhan:"Wuhan",Tianjin:"Tianjin",Shanghai:"Shanghai",Guangdong:"Guangdong"};
const ACCENT_PROMPTS = {Sichuan:"accent-prompt_sichuan.wav",Henan:"accent-prompt_henan.wav",singapore:"accent-prompt_singapore.wav",Wuhan:"accent-prompt_wuhan.wav",Tianjin:"accent-prompt_tianjin.wav",Shanghai:"accent-prompt_shanghai.wav",Guangdong:"accent-prompt_guangdong.wav"};
const REPLACED_VOICE_DEMOS = new Set(["unseen_in_accent__tgt-Sichuan__src-Sichuan__spk-376__02__G0055_S0002_0_SPK030_1827-423_1829-77","unseen_in_accent__tgt-Sichuan__src-Sichuan__spk-376__06__G0060_S0002_0_SPK005_1436-96_1439-77","unseen_in_accent__tgt-Tianjin__src-Tianjin__spk-391__06__A0004_S002_0_G0004_1125-047_1127-138","unseen_in_accent__tgt-Tianjin__src-Tianjin__spk-391__07__A0004_S002_0_G0004_124-159_127-479"]);
const $ = (s) => document.querySelector(s);
const audio = (src) => `<audio controls preload="none"><source src="${src}" type="audio/wav"></audio>`;

async function init(){
  const [samples,voiceDemos,curatedVoiceDemos,comparisonSamples] = await Promise.all([fetch("data/retained_samples_39.json").then(r=>r.json()),fetch("data/voice_demos.json").then(r=>r.json()),fetch("data/curated_voice_demos.json").then(r=>r.json()),fetch("data/comparison_samples_40.json").then(r=>r.json())]);
  const replacementAccents=new Set(["Shanghai","Guangdong","Sichuan","Wuhan"]);
  const retainedVoiceSamples=SAME_ACCENT_ORDER.flatMap(accent=>{
    if(replacementAccents.has(accent)) return [];
    const sameAccent=samples.filter(x=>x.target_accent===accent&&x.source_accent===accent&&!REPLACED_VOICE_DEMOS.has(x.id));
    return sameAccent.length?sameAccent:samples.filter(x=>x.target_accent===accent);
  });
  const voiceSamples=retainedVoiceSamples.concat(voiceDemos.filter(x=>!replacementAccents.has(x.target_accent)),curatedVoiceDemos);
  renderSameSpeaker(); renderTabs(voiceSamples); renderSameAccent(voiceSamples,"Shanghai"); renderCross(samples); renderComparisons(comparisonSamples); renderEnvironment();
}
function renderSameSpeaker(){
  $("#same-speaker-prompts-grid").innerHTML=ACCENTS.map((a,i)=>`<article class="audio-card accent-prompt-card"><span class="number">0${i+1}</span><h3>${DISPLAY[a]}</h3><div class="case-audio"><label>Accent prompt</label>${audio(`audio/same-speaker/${ACCENT_PROMPTS[a]}`)}</div></article>`).join("");
  $("#same-speaker-grid").innerHTML=ACCENTS.map((a,i)=>`<article class="audio-card accent-case"><span class="number">0${i+1}</span><h3>${DISPLAY[a]}</h3><div class="case-audio output-audio"><label>Generated speech</label>${audio(`audio/same-speaker/${a}.wav`)}</div></article>`).join("");
}
function renderTabs(samples){
  const root=$("#accent-tabs"); root.innerHTML=SAME_ACCENT_ORDER.map((a,i)=>`<button class="tab ${i===0?'active':''}" data-accent="${a}">${DISPLAY[a]}</button>`).join("");
  root.addEventListener("click",e=>{if(!e.target.matches("button"))return;root.querySelectorAll("button").forEach(x=>x.classList.remove("active"));e.target.classList.add("active");renderSameAccent(samples,e.target.dataset.accent)});
}
function renderSameAccent(samples,accent){
  const rows=samples.filter(x=>x.target_accent===accent);
  $("#same-accent-grid").innerHTML=rows.map(x=>`<article class="sample-card"><span class="meta">Speaker ${x.speaker_id}${x.candidate?' · Candidate':''}</span><p class="transcript">${x.text}</p>${audio(x.systems.ours)}</article>`).join("");
}
function renderCross(samples){
  const rows=samples.filter(x=>x.source_accent!==x.target_accent).filter((x,i,a)=>a.findIndex(y=>y.speaker_id===x.speaker_id)===i);
  $("#cross-grid").innerHTML=rows.map(x=>`<article class="cross-card"><h3>${DISPLAY[x.source_accent]} voice → ${DISPLAY[x.target_accent]} accent</h3><p class="cross-text" lang="zh-CN">${x.text}</p><div class="cross-flow"><div class="mini-audio"><label>Speaker prompt<br>${DISPLAY[x.source_accent]}</label>${audio(x.speaker_reference)}</div><div class="arrow">→</div><div class="mini-audio"><label>Accent prompt<br>${DISPLAY[x.target_accent]}</label>${audio(x.accent_reference)}</div><div class="arrow">→</div><div class="mini-audio"><label>Generated<br>Joycent</label>${audio(x.systems.ours)}</div></div></article>`).join("");
}
function renderComparisons(samples){
  const tabs=$("#comparison-accent-tabs");
  const selectedTexts={Wuhan:"自 然 界 里 头 么 斯 东 西 最 宝 贵",Tianjin:"你 知 道 吗 比 咱 们 医 院 最 少 大 四 倍",Shanghai:"吾 伐 再 啊 伐 求 拧 任 何 拧 了 包 括 侬",Henan:"就 这 好 好 使 就 行",Sichuan:"这 个 手 机 不 错 价 格 也",singapore:"漂 亮 女 孩 子",Guangdong:"它 这 种 就 是 第 三 人 称 我 就 比 较 少 玩"};
  const accents=["Tianjin","Wuhan","Sichuan","Shanghai","Henan","singapore","Guangdong"];
  const selected=Object.fromEntries(accents.map(a=>[a,samples.find(x=>x.target_accent===a&&x.text===selectedTexts[a])]));
  let activeAccent=accents[0];
  const models=[["ours","Joycent","Ours"],["diffusion_TTS","DDGM-Acc","Baseline"],["accentbox","AccentBox","Baseline"],["dart","DART","Baseline"],["ours_no_grl","Joycent w/o GRL","Ablation"],["ours_add","Joycent w/o CLN","Ablation"],["ours_acc_blk3","Joycent acc-blk3","Ablation"],["ours_small","Joycent-small","Variant"],["ours_large","Joycent-turbo","Variant"]];
  const update=()=>{
    const x=selected[activeAccent];
    $("#comparison-text").textContent=x.text;
    $("#comparison-references").innerHTML=`<div class="comparison-audio reference"><span>Speaker prompt</span><small>${DISPLAY[x.source_accent]} source</small>${audio(x.speaker_prompt)}</div><div class="comparison-audio reference"><span>Accent prompt</span><small>${DISPLAY[x.target_accent]} target</small>${audio(x.accent_prompt)}</div>`;
    $("#comparison-models").innerHTML=models.map(([key,name])=>`<div class="comparison-audio model ${key==='ours'?'featured':''}"><span>${name}</span>${audio(x.systems[key])}</div>`).join("");
  };
  tabs.innerHTML=accents.map((a,i)=>`<button class="comparison-accent-tab ${i===0?'active':''}" data-accent="${a}" role="tab">${DISPLAY[a]}</button>`).join("");
  tabs.addEventListener("click",e=>{if(!e.target.matches("button"))return;activeAccent=e.target.dataset.accent;tabs.querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===e.target));update()});
  update();
}
function renderEnvironment(){
  $("#environment-grid").innerHTML=Array.from({length:4},(_,i)=>`<article class="environment-case compact"><div class="environment-heading"><span class="slot">0${i+1}</span><h3>Case ${i+1}</h3></div><div class="environment-pair"><div class="environment-audio"><span>Speaker reference</span><small>Original environment</small>${audio(`audio/environment/case-${i+1}-reference.wav`)}</div><div class="environment-audio generated"><span>Generated speech</span><small>Reconstructed environment</small>${audio(`audio/environment/case-${i+1}-generated.wav`)}</div></div></article>`).join("");
}
window.addEventListener("scroll",()=>{const y=Math.min(scrollY/(innerHeight*.7),1);const hero=$(".hero-sticky");hero.style.opacity=1-y;hero.style.transform=`translateY(${-y*55}px) scale(${1-y*.04})`});
init().catch(err=>{console.error(err);document.body.insertAdjacentHTML("beforeend",`<p style="position:fixed;bottom:10px;left:10px;background:#fee;padding:10px">Run through a local web server to load demo data.</p>`)});
