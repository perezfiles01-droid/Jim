import json,re,sys,os,soundfile as sf
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)));import heteronyms
from kokoro_onnx import Kokoro
K=Kokoro('../voice/kokoro-v1.0.onnx','../voice/voices-v1.0.bin')
F=json.load(open('fil.json'));FL={k.lower():v for k,v in F.items()}
rx=re.compile(r'\b('+'|'.join(map(re.escape,sorted(F,key=len,reverse=True)))+r')\b(’s)?',re.I)
YEARS={'1582':'fifteen eighty-two','1589':'fifteen eighty-nine'}
PH=['apple','zebra','violin','marble','tulip','walrus','pepper','candle','rocket','button','pillow','ladder','basket','helmet','muffin','window']
AUDIT=[]
def spoken(t):
  t=t.replace('"','').replace('“','').replace('”','')
  for y,w in YEARS.items(): t=re.sub(r'\b'+y+r's?\b',w,t)
  t=t.replace('Capiz, on','Capiz on')
  return t
def ph(t):
  t=spoken(t);subs=[]
  t,forced=heteronyms.apply(t)
  def rep(m):
    i=len(subs);subs.append(FL[m.group(1).lower()]+('z' if m.group(2) else ''));return PH[i]
  t2=rx.sub(rep,t)
  def frep(m):
    i=len(subs);subs.append(forced[int(m.group(1))]);return PH[i]
  t2=re.sub('\x00(\\d+)\x00',frep,t2);whole=K.tokenizer.phonemize(t2,'en-us')
  for i,ipa in enumerate(subs):
    w=K.tokenizer.phonemize(PH[i],'en-us').strip(' .')
    if w not in whole: raise SystemExit(f'placeholder {PH[i]} ({w}) not found in: {whole}')
    whole=whole.replace(w,ipa,1)
  return whole
L=json.load(open('lines.json'));res=[];dump=[]
for si,s in enumerate(L):
  for li,t in enumerate(s['lines']):
    p=ph(t);dump.append(f'{si}.{li}: {p}')
    for w in heteronyms.audit(t): AUDIT.append(f'{si}.{li}  {w:10s} {t}')
    a,sr=K.create(p,voice='af_heart',speed=0.92,is_phonemes=True)
    sf.write(f'n_{si}_{li}.wav',a,sr);res.append([si,li,len(a)/sr])
json.dump(res,open('durs.json','w'));open('phonemes.txt','w').write('\n'.join(dump))
open('pronunciation_audit.txt','w').write('Check each word below sounds right in phonemes.txt before rendering.\n'+'\n'.join(AUDIT));print('\n'.join(AUDIT))
