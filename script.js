const TWINKLE=['C4','C4','G4','G4','A4','A4','G4','F4','F4','E4','E4','D4','D4','C4','G4','G4','F4','F4','E4','E4','D4','G4','G4','F4','F4','E4','E4','D4','C4','C4','G4','G4','A4','A4','G4','F4','F4','E4','E4','D4','D4','C4'];
const NOTE_FREQS={'C4':261.63,'C#4':277.18,'D4':293.66,'D#4':311.13,'E4':329.63,'F4':349.23,'F#4':369.99,'G4':392.00,'G#4':415.30,'A4':440.00,'A#4':466.16,'B4':493.88,'C5':523.25,'C#5':554.37,'D5':587.33,'D#5':622.25,'E5':659.25,'F5':698.46,'F#5':739.99,'G5':783.99,'G#5':830.61,'A5':880.00,'A#5':932.33,'B5':987.77};
const KEYS = [
  { note:'Z', name:'C4', freq:261.63, type:'white', pos:0 },
  { note:'S', name:'C#4', freq:277.18, type:'black', pos:42 },
  { note:'X', name:'D4', freq:293.66, type:'white', pos:62 },
  { note:'D', name:'D#4', freq:311.13, type:'black', pos:104 },
  { note:'C', name:'E4', freq:329.63, type:'white', pos:124 },
  { note:'V', name:'F4', freq:349.23, type:'white', pos:186 },
  { note:'G', name:'F#4', freq:369.99, type:'black', pos:228 },
  { note:'B', name:'G4', freq:392.00, type:'white', pos:248 },
  { note:'H', name:'G#4', freq:415.30, type:'black', pos:290 },
  { note:'N', name:'A4', freq:440.00, type:'white', pos:310 },
  { note:'J', name:'A#4', freq:466.16, type:'black', pos:352 },
  { note:'M', name:'B4', freq:493.88, type:'white', pos:372 },
  { note:'Q', name:'C5', freq:523.25, type:'white', pos:434 },
  { note:'2', name:'C#5', freq:554.37, type:'black', pos:476 },
  { note:'W', name:'D5', freq:587.33, type:'white', pos:496 },
  { note:'3', name:'D#5', freq:622.25, type:'black', pos:538 },
  { note:'E', name:'E5', freq:659.25, type:'white', pos:558 },
  { note:'R', name:'F5', freq:698.46, type:'white', pos:620 },
  { note:'5', name:'F#5', freq:739.99, type:'black', pos:662 },
  { note:'T', name:'G5', freq:783.99, type:'white', pos:682 },
  { note:'6', name:'G#5', freq:830.61, type:'black', pos:724 },
  { note:'Y', name:'A5', freq:880.00, type:'white', pos:744 },
  { note:'7', name:'A#5', freq:932.33, type:'black', pos:786 },
  { note:'U', name:'B5', freq:987.77, type:'white', pos:806 }
];


let recordedMelody=[], currentTab='record', scheduledNotes=[], activeOscillators={};
let synthParams={additiveMix:0.9,amMix:0.1,fmMix:0.1,numPartials:4,amModFreq:8,amModDepth:0.5,fmRatio:2.0,fmModDepth:100,lfoFreq:5,lfoDepth:10,attackTime:0.01,decayTime:0.1,sustainLevel:0.7,releaseTime:0.3};


const audioCtx=new(window.AudioContext||window.webkitAudioContext)();
const globalGain=audioCtx.createGain();
globalGain.gain.setValueAtTime(0.3,audioCtx.currentTime);
globalGain.connect(audioCtx.destination);

// stub out the removed visual functions so nothing crashes
function createHeart(){}
function changeColor(){}

function toggleSynth(){
  const body=document.getElementById('synthBody');
  const arrow=document.getElementById('synthArrow');
  body.classList.toggle('hidden');
  arrow.classList.toggle('open');
}

const keyboard=document.getElementById('keyboard');
const temperature = document.getElementById("temperature");
const tempValue = document.getElementById("tempValue");

temperature.addEventListener("input", function () {
  tempValue.textContent = Number(this.value).toFixed(1);
});

KEYS.forEach(k=>{
  const el=document.createElement('div');
  el.className=`key ${k.type}`;
  el.style.left=k.pos+'px';
  el.textContent=k.note;
  el.dataset.note=k.note;
  el.dataset.name=k.name;
  el.addEventListener('mousedown',()=>{audioCtx.resume();playNote(NOTE_FREQS[k.name],el,k.note);recordNote(k.name);});
  el.addEventListener('mouseup',()=>stopNote(k.note));
  el.addEventListener('mouseleave',()=>stopNote(k.note));
  keyboard.appendChild(el);
});
keyboard.style.width=(650+50)+'px';

const keyMap={};
KEYS.forEach(k=>{keyMap[k.note.toLowerCase()]=k;});
document.addEventListener('keydown',e=>{
  const k=keyMap[e.key.toLowerCase()];
  if(k&&!e.repeat&&!activeOscillators[k.note]){
    audioCtx.resume();
    const el=document.querySelector(`[data-note="${k.note}"]`);
    playNote(NOTE_FREQS[k.name],el,k.note);
    recordNote(k.name);
  }
});
document.addEventListener('keyup',e=>{
  const k=keyMap[e.key.toLowerCase()];
  if(k)stopNote(k.note);
});

function recordNote(noteName){
  if(currentTab!=='record')return;
  recordedMelody.push(noteName);
  renderMelodyDisplay();
}

function renderMelodyDisplay(){
  const el=document.getElementById('melodyDisplay');
  if(recordedMelody.length===0){el.innerHTML='<span class="melody-empty">No notes recorded yet — click the keys above!</span>';return;}
  el.innerHTML=recordedMelody.map(n=>`<span class="melody-note">${n}</span>`).join('');
  el.scrollLeft=el.scrollWidth;
}

function clearRecorded(){recordedMelody=[];renderMelodyDisplay();}

function playRecorded(){
  if(recordedMelody.length<2){alert('Record at least 2 notes first!');return;}
  playSequence(recordedMelody);
}

function switchTab(tab){
  currentTab=tab;
  document.getElementById('tabRecord').classList.toggle('active',tab==='record');
  document.getElementById('tabTwinkle').classList.toggle('active',tab==='twinkle');
  document.getElementById('panelRecord').style.display=tab==='record'?'':'none';
  document.getElementById('panelTwinkle').style.display=tab==='twinkle'?'':'none';
  if(tab==='twinkle'){
    const el=document.getElementById('twinkleDisplay');
    el.innerHTML=TWINKLE.map(n=>`<span class="melody-note">${n}</span>`).join('');
  }
}

function buildChain(notes,order){
  const chain={};
  for(let i=0;i<notes.length-order;i++){
    const state=notes.slice(i,i+order).join(',');
    const next=notes[i+order];
    if(!chain[state])chain[state]=[];
    chain[state].push(next);
  }
  return chain;
}

function generateSequence(chain, notes, order, length) {
  const temp = parseFloat(document.getElementById('temperature').value);
  const startIdx = Math.floor(Math.random() * (notes.length - order));
  let current = notes.slice(startIdx, startIdx + order);
  const result = [...current];

  for (let i = 0; i < length - order; i++) {
    const state = current.join(',');
    const options = chain[state];
    if (!options) break;

    // const how often each next note appears
    const counts = {};
    options.forEach(n => { counts[n] = (counts[n] || 0) + 1; });

    // apply temperature to the distribution
    // low temp sharpens it (most common wins), high temp flattens it (more random)
    const notes_list = Object.keys(counts);
    const weights = notes_list.map(n => Math.pow(counts[n], 1 / temp));
    const total = weights.reduce((a, b) => a + b, 0);
    const probs = weights.map(w => w / total);

    // sample from the distribution
    let r = Math.random();
    let chosen = notes_list[notes_list.length - 1]; // fallback
    for (let j = 0; j < probs.length; j++) {
      r -= probs[j];
      if (r <= 0) { chosen = notes_list[j]; break; }
    }

    result.push(chosen);
    current = [...current.slice(1), chosen];
  }
  return result;
}

async function generate(){
  await audioCtx.resume();
  const order=parseInt(document.getElementById('order').value);
  const numNotes=parseInt(document.getElementById('numNotes').value);
  const source=currentTab==='record'?recordedMelody:TWINKLE;
  if(source.length<order+1){alert(`Need at least ${order+1} notes. Record more!`);return;}
  const chain=buildChain(source,order);
  const sequence=generateSequence(chain,source,order,numNotes);
  const outSection=document.getElementById('outputSection');
  outSection.style.display='';
  document.getElementById('statusText').textContent=`Generated ${sequence.length} notes (order ${order}):`;
  const outEl=document.getElementById('outputNotes');
  outEl.innerHTML=sequence.map((n,i)=>`<span class="output-note" id="on${i}">${n}</span>`).join('');
  playSequence(sequence,true);
}

function stopPlayback(){scheduledNotes.forEach(t=>clearTimeout(t));scheduledNotes=[];}

function playSequence(sequence,highlight=false){
  stopPlayback();
  const noteDuration=0.32;
  sequence.forEach((noteName,i)=>{
    const freq=NOTE_FREQS[noteName];
    if(!freq)return;
    const t=setTimeout(()=>{
      if(highlight){
        document.querySelectorAll('.output-note').forEach(el=>el.classList.remove('playing'));
        const el=document.getElementById('on'+i);
        if(el){el.classList.add('playing');el.scrollIntoView({block:'nearest'});}
      }
      const keyEl=document.querySelector(`[data-name="${noteName}"]`);
      triggerNoteOnce(freq,noteName,keyEl);
    },i*noteDuration*1000);
    scheduledNotes.push(t);
  });
}

function triggerNoteOnce(freq,noteName,keyEl){
  if(keyEl)keyEl.classList.add('active');
  const now=audioCtx.currentTime;
  const osc=audioCtx.createOscillator();
  const gain=audioCtx.createGain();
  osc.type='sine';
  osc.frequency.setValueAtTime(freq,now);
  gain.gain.setValueAtTime(0,now);
  gain.gain.linearRampToValueAtTime(0.3,now+0.02);
  gain.gain.linearRampToValueAtTime(0.15,now+0.1);
  gain.gain.exponentialRampToValueAtTime(0.001,now+0.28);
  osc.connect(gain);
  gain.connect(globalGain);
  osc.start(now);
  osc.stop(now+0.3);
  setTimeout(()=>{if(keyEl)keyEl.classList.remove('active');},250);
}

function playNote(frequency,element,noteKey){
  const now=audioCtx.currentTime;
  const allOscillators=[],allGainNodes=[];
  const{additiveMix,amMix,fmMix}=synthParams;
  if(additiveMix>0){
    const additiveGain=audioCtx.createGain();
    additiveGain.gain.setValueAtTime(additiveMix,now);
    const lfo=audioCtx.createOscillator();
    lfo.type='sine';lfo.frequency.setValueAtTime(synthParams.lfoFreq,now);
    const lfoGain=audioCtx.createGain();
    lfoGain.gain.setValueAtTime(synthParams.lfoDepth,now);
    lfo.connect(lfoGain);lfo.start();allOscillators.push(lfo);
    for(let i=0;i<synthParams.numPartials;i++){
      const harmonic=2*i+1,amplitude=0.4/(i+1);
      const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
      osc.type='sine';osc.frequency.setValueAtTime(frequency*harmonic,now);
      lfoGain.connect(osc.frequency);
      gain.gain.setValueAtTime(0,now);
      gain.gain.linearRampToValueAtTime(amplitude,now+synthParams.attackTime);
      gain.gain.linearRampToValueAtTime(amplitude*synthParams.sustainLevel,now+synthParams.attackTime+synthParams.decayTime);
      osc.connect(gain);gain.connect(additiveGain);osc.start();
      allOscillators.push(osc);allGainNodes.push(gain);
    }
    additiveGain.connect(globalGain);allGainNodes.push(additiveGain);
  }
  if(amMix>0){
    const carrier=audioCtx.createOscillator(),modulator=audioCtx.createOscillator();
    const modGain=audioCtx.createGain(),carrierGain=audioCtx.createGain(),outGain=audioCtx.createGain();
    carrier.frequency.setValueAtTime(frequency,now);carrier.type='sine';
    modulator.frequency.setValueAtTime(synthParams.amModFreq,now);modulator.type='sine';
    modGain.gain.setValueAtTime(synthParams.amModDepth,now);
    carrierGain.gain.setValueAtTime(1,now);outGain.gain.setValueAtTime(amMix,now);
    modulator.connect(modGain);modGain.connect(carrierGain.gain);
    carrier.connect(carrierGain);carrierGain.connect(outGain);outGain.connect(globalGain);
    carrier.start();modulator.start();
    allOscillators.push(carrier,modulator);allGainNodes.push(carrierGain,outGain);
  }
  if(fmMix>0){
    const carrier=audioCtx.createOscillator(),modulator=audioCtx.createOscillator();
    const modGain=audioCtx.createGain(),outGain=audioCtx.createGain();
    carrier.frequency.setValueAtTime(frequency,now);carrier.type='sine';
    modulator.frequency.setValueAtTime(frequency*synthParams.fmRatio,now);
    modGain.gain.setValueAtTime(synthParams.fmModDepth,now);outGain.gain.setValueAtTime(fmMix,now);
    modulator.connect(modGain);modGain.connect(carrier.frequency);
    carrier.connect(outGain);outGain.connect(globalGain);
    carrier.start();modulator.start();
    allOscillators.push(carrier,modulator);allGainNodes.push(outGain);
  }
  activeOscillators[noteKey]={oscillators:allOscillators,gainNodes:allGainNodes};
  if(element)element.classList.add('active');
}

function stopNote(noteKey){
  if(!activeOscillators[noteKey])return;
  const{oscillators,gainNodes}=activeOscillators[noteKey];
  const now=audioCtx.currentTime;
  gainNodes.forEach((g,i)=>{
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value,now);
    g.gain.exponentialRampToValueAtTime(0.001,now+synthParams.releaseTime);
    if(oscillators[i])oscillators[i].stop(now+synthParams.releaseTime);
  });
  delete activeOscillators[noteKey];
  document.querySelectorAll(`[data-note="${noteKey}"]`).forEach(el=>el.classList.remove('active'));
}

[['additiveMix','additiveMix',parseFloat],['amMix','amMix',parseFloat],['fmMix','fmMix',parseFloat],
 ['numPartials','numPartials',parseInt],['amModFreq','amModFreq',parseFloat],['amModDepth','amModDepth',parseFloat],
 ['fmRatio','fmRatio',parseFloat],['fmModDepth','fmModDepth',parseFloat],['lfoFreq','lfoFreq',parseFloat],
 ['lfoDepth','lfoDepth',parseFloat],['attackTime','attackTime',parseFloat],['decayTime','decayTime',parseFloat],
 ['sustainLevel','sustainLevel',parseFloat],['releaseTime','releaseTime',parseFloat]
].forEach(([id,param,parse])=>{
  document.getElementById(id).addEventListener('input',e=>{
    synthParams[param]=parse(e.target.value);
    document.getElementById(id+'Value').textContent=e.target.value;
  });
});