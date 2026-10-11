// Papel Tales word-synced beats. Load in the renderer after timeline.json, with words.json:
//   await p.evaluate(w=>{window.WORDS=w},JSON.parse(fs.readFileSync('words.json')));
// and inside R(gt), before drawing the scene, set the current line clock:
//   window.CL={s:cs,l:cl,lt:gt-(TL.find(r=>r[0]===cs&&r[1]===cl)||[0,0,gt])[2]};
// In a scene's draw(t,li) use:
//   since('manananggal')  -> seconds since that word was spoken in the current line (-1 if not yet)
//   pop(since('dog'))     -> 0..1 springy entrance the moment the word is said
//   after('garlic',1.5)   -> true once 1.5 s have passed since the word
window.since=function(word){const c=window.CL;if(!c||!window.WORDS)return -1;const L=(WORDS[c.s]||{})[c.l]||[];
  const w=word.toLowerCase();const hit=L.find(x=>x[0]===w||x[0].startsWith(w));if(!hit)return -1;const d=c.lt-hit[1];return d>=0?d:-1};
window.popIn=function(d,dur=.45){if(d<0)return 0;const p=Math.min(1,d/dur);return 1+Math.sin(p*Math.PI*1.5)*(1-p)*.35-(1-p)*(1-p)*(p<1?1:0)};
window.after=function(word,sec=0){const d=since(word);return d>=sec};
