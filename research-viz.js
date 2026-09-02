(()=>{
const q=s=>document.querySelector(s);
const labels={seen:"Seen-Inherent",unseen:"Unseen-Inherent",cross:"Unseen-Cross"};
const settingKeys=["seen","unseen","cross"];
const objective={
  seen:{"DDGM-Acc":[.397,.427,.639,.311],DART:[.321,.357,.555,.153],AccentBox:[.404,.434,.550,.535],Joycent:[.490,.526,.626,.253]},
  unseen:{"DDGM-Acc":[.473,.510,.601,.410],DART:[.350,.403,.557,.165],AccentBox:[.401,.448,.509,.593],Joycent:[.469,.523,.618,.302]},
  cross:{"DDGM-Acc":[.382,.419,.567,.285],DART:[.344,.387,.524,.150],AccentBox:[.337,.376,.512,.555],Joycent:[.412,.448,.584,.258]}
};
const objectiveMetrics=["W-CS ↑","WU-CS ↑","Spk.-CS ↑","CER ↓"];
const subjective={
  seen:{"DDGM-Acc":[[3.40,.25],[2.84,.33],[3.06,.33]],DART:[[2.76,.41],[1.42,.28],[1.71,.37]],AccentBox:[[2.25,.37],[1.81,.33],[2.42,.43]],Joycent:[[3.54,.29],[3.42,.34],[2.94,.33]]},
  unseen:{"DDGM-Acc":[[2.87,.36],[2.69,.36],[2.53,.42]],DART:[[2.82,.30],[1.88,.41],[1.50,.24]],AccentBox:[[2.06,.32],[2.09,.38],[1.84,.29]],Joycent:[[3.42,.29],[2.62,.36],[3.09,.38]]},
  cross:{"DDGM-Acc":[[2.62,.26],[1.91,.30],[1.98,.30]],DART:[[2.20,.26],[1.86,.33],[1.36,.24]],AccentBox:[[2.48,.20],[2.40,.31],[2.21,.36]],Joycent:[[3.38,.26],[2.62,.29],[2.76,.37]]}
};
const subjectiveMetrics=["MOS","SMOS-S","SMOS-A"];
const methods=["DDGM-Acc","DART","AccentBox","Joycent"];

function bestPerColumn(rows,methodOrder,metricIdx,lowerIsBetter){
  let best=lowerIsBetter?Infinity:-Infinity;
  methodOrder.forEach(m=>{const v=rows[m][metricIdx];if(lowerIsBetter?v<best:v>best)best=v;});
  return best;
}
function maxPerColumn(rows,methodOrder,metricIdx){
  return Math.max(...methodOrder.map(m=>rows[m][metricIdx]));
}
function metricCell(v,decimals,pct,isBest,isJoycent){
  return `<td class="${isBest?'best':''}"><div class="cell-metric"><span class="cell-value">${v.toFixed(decimals)}</span><div class="cell-bar-track"><div class="cell-bar${isJoycent?' joycent':''}" style="width:${pct}%"></div></div></div></td>`;
}

function renderObjective(){
  const axisNames=["W-CS","WU-CS","Spk.-CS","CER ↓","MOS","SMOS-S","SMOS-A"],styles={"DDGM-Acc":"ddgm",DART:"dart",AccentBox:"accentbox",Joycent:"joycent"};
  const cx=210,cy=195,radius=138,angles=axisNames.map((_,i)=>-Math.PI/2+i*Math.PI*2/axisNames.length);
  const point=(value,i,scale=1)=>[cx+Math.cos(angles[i])*radius*value*scale,cy+Math.sin(angles[i])*radius*value*scale];
  const cards=settingKeys.map(k=>{
    const rows=objective[k];
    let svg=`<svg class="radar-chart combined-radar" viewBox="5 5 410 385" role="img" aria-label="${labels[k]} objective and subjective comparison">`;
    [.25,.5,.75,1].forEach(level=>svg+=`<polygon class="radar-grid" points="${angles.map((_,i)=>point(level,i).join(',')).join(' ')}"/>`);
    angles.forEach((angle,i)=>{const end=point(1,i),label=point(1,i,1.13),anchor=Math.cos(angle)>.2?'start':Math.cos(angle)<-.2?'end':'middle';svg+=`<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${end[0]}" y2="${end[1]}"/><text class="radar-axis-label" x="${label[0]}" y="${label[1]+4}" text-anchor="${anchor}">${axisNames[i]}</text>`});
    methods.forEach(name=>{
      const rawObjective=rows[name],rawSubjective=subjective[k][name],ranges=[[.30,.55],[.35,.57],[.50,.65],[.10,.60]];
      const objectiveScore=rawObjective.map((v,i)=>i===3?(ranges[i][1]-v)/(ranges[i][1]-ranges[i][0]):(v-ranges[i][0])/(ranges[i][1]-ranges[i][0]));
      const score=objectiveScore.concat(rawSubjective.map((v,i)=>v[0]/(i===0?5:4))).map(v=>Math.max(.08,Math.min(1,v)));
      const coords=score.map((v,i)=>point(v,i)),pts=coords.map(p=>p.join(',')).join(' ');
      const displayValues=rawObjective.map(v=>v.toFixed(3)).concat(rawSubjective.map(v=>`${v[0].toFixed(2)}±${v[1].toFixed(2)}`));
      const values=axisNames.map((axis,i)=>`${axis} ${displayValues[i]}`).join(' · ');
      const valueLabels=coords.map((p,i)=>{const angle=angles[i],anchor=Math.cos(angle)>.2?'start':Math.cos(angle)<-.2?'end':'middle';return `<text class="radar-value" x="${p[0]+Math.cos(angle)*9}" y="${p[1]+Math.sin(angle)*9+3}" text-anchor="${anchor}">${displayValues[i]}</text>`}).join("");
      svg+=`<g class="radar-series ${styles[name]}"><polygon points="${pts}"/><title>${name}: ${values}</title>${coords.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="4"/>`).join("")}${valueLabels}</g>`;
    });
    svg+=`</svg>`;
    return `<div class="radar-card"><h4>${labels[k]}</h4>${svg}</div>`;
  }).join("");
  q("#objective-table").innerHTML=`<div class="objective-visual-grid">${cards}</div><div class="radar-key"><span class="joycent"><i></i>Joycent</span><span class="ddgm"><i></i>DDGM-Acc</span><span class="dart"><i></i>DART</span><span class="accentbox"><i></i>AccentBox</span></div>`;
}

renderObjective();
})();
