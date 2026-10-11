import json,re,soundfile as sf
from kokoro_onnx import Kokoro
K=Kokoro('../voice/kokoro-v1.0.onnx','../voice/voices-v1.0.bin')
F=json.load(open('fil.json'));FL={k.lower():v for k,v in F.items()}
rx=re.compile(r'\b('+'|'.join(map(re.escape,sorted(F,key=len,reverse=True)))+r')\b(’s)?',re.I)
YEARS={'1521':'fifteen twenty-one','1565':'fifteen sixty-five','1980':'nineteen eighty'}
PH=['apple','zebra','violin','marble','tulip','walrus','pepper','candle','rocket']
def spoken(t):
  t=t.replace('"','').replace('“','').replace('”','')
  for y,w in YEARS.items(): t=re.sub(r'\b'+y+r's?\b',w,t)
  t=t.replace('Kalibo, Aklan','Kalibo Aklan').replace('Lucban, Quezon','Lucban Quezon')
  return t
def ph(t):
  t=spoken(t);subs=[]
  def rep(m):
    i=len(subs);subs.append(FL[m.group(1).lower()]+('z' if m.group(2) else ''));return PH[i]
  t2=rx.sub(rep,t);whole=K.tokenizer.phonemize(t2,'en-us')
  for i,ipa in enumerate(subs):
    w=K.tokenizer.phonemize(PH[i],'en-us').strip(' .')
    if w not in whole: raise SystemExit(f'placeholder {PH[i]} ({w}) not found in: {whole}')
    whole=whole.replace(w,ipa,1)
  return whole
L=json.load(open('lines.json'));res=[];dump=[]
for si,s in enumerate(L):
  for li,t in enumerate(s['lines']):
    p=ph(t);dump.append(f'{si}.{li}: {p}');a,sr=K.create(p,voice='af_heart',speed=0.92,is_phonemes=True)
    sf.write(f'n_{si}_{li}.wav',a,sr);res.append([si,li,len(a)/sr])
json.dump(res,open('durs.json','w'));open('phonemes.txt','w').write('\n'.join(dump))
