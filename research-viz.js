(()=>{
const q=s=>document.querySelector(s);
const labels={seen:"Seen-Inherent",unseen:"Unseen-Inherent",cross:"Unseen-Cross"};
const objective={
  seen:{"DDGM-Acc":[.397,.427,.639,.311],DART:[.321,.357,.555,.153],AccentBox:[.404,.434,.550,.535],Joycent:[.490,.526,.626,.253]},
  unseen:{"DDGM-Acc":[.473,.510,.601,.410],DART:[.350,.403,.557,.165],AccentBox:[.401,.448,.509,.593],Joycent:[.469,.523,.618,.302]},
  cross:{"DDGM-Acc":[.382,.419,.567,.285],DART:[.344,.387,.524,.150],AccentBox:[.337,.376,.512,.555],Joycent:[.412,.448,.584,.258]}
};
const objectiveMetrics=["W-CS ↑","WU-CS ↑","Spk.-CS ↑","CER ↓"];
const subjective={AccentBox:[2.26,2.10,2.16],DART:[2.59,1.72,1.52],"DDGM-Acc":[2.96,2.48,2.52],Joycent:[3.45,2.89,2.93]};
const subjectiveMetrics=["MOS","SMOS-S","SMOS-A"];
function chips(root,items,active,onchange){
  root.innerHTML=items.map(([key,name])=>`<button class="viz-chip ${key===active?'active':''}" data-key="${key}">${name}</button>`).join("");
  root.onclick=e=>{if(!e.target.matches("button"))return;root.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b===e.target));onchange(e.target.dataset.key)};
}
let objectiveSetting="cross",objectiveMetric=1;
function renderObjective(){const rows=objective[objectiveSetting],max=objectiveMetric===3?.65:.7;q("#objective-chart").innerHTML=Object.entries(rows).map(([name,v])=>`<div class="bar-row ${name==='Joycent'?'joycent':''}"><span class="bar-name">${name}</span><div class="bar-track"><div class="bar-fill" style="width:${v[objectiveMetric]/max*100}%"></div></div><span class="bar-value">${v[objectiveMetric].toFixed(3)}</span></div>`).join("");q("#objective-note").textContent=objectiveMetric===3?"Character error rate (CER): lower is better.":`${objectiveMetrics[objectiveMetric]}: higher is better.`;}
chips(q("#objective-setting"),Object.entries(labels),objectiveSetting,k=>{objectiveSetting=k;renderObjective()});
chips(q("#objective-metric"),objectiveMetrics.map((x,i)=>[String(i),x]),String(objectiveMetric),k=>{objectiveMetric=Number(k);renderObjective()});renderObjective();
let subjectiveMetric=0;
function renderSubjective(){q("#subjective-chart").innerHTML=Object.entries(subjective).map(([name,v])=>`<div class="bar-row ${name==='Joycent'?'joycent':''}"><span class="bar-name">${name}</span><div class="bar-track"><div class="bar-fill" style="width:${v[subjectiveMetric]/5*100}%"></div></div><span class="bar-value">${v[subjectiveMetric].toFixed(2)}</span></div>`).join("");}
chips(q("#subjective-metric"),subjectiveMetrics.map((x,i)=>[String(i),x]),"0",k=>{subjectiveMetric=Number(k);renderSubjective()});renderSubjective();
})();
