"""Pronunciation guard for Kokoro narration (Papel Tales).
Kokoro's phonemizer guesses words that are spelled the same but said differently
(live/lives, read, lead, wind, tear, close...). It got "an aswang lives in the next
village" wrong ("layvz"). Two layers fix this:
 1. RULES: context patterns that force the right sound before phonemizing.
 2. AUDIT: after phonemizing, every heteronym in the line is listed in
    pronunciation_audit.txt with the sound chosen, so it is checked by eye, not by luck.
Add a rule whenever a word is misread; the user's respelling goes in the comment."""
import re
LIV='lˈɪv'; LAIV='lˈaɪv'
# (regex on the spoken text, IPA for group 1). Checked in order; first match wins per word.
RULES=[
 # verb "live/lives/lived/living" (rhymes with "give"): after a subject, or before in/on/with/at/near/here/there/alone/together/long/happily/forever
 (r'\b(lives)\b(?=\s+(in|on|with|at|near|here|there|alone|together|forever|happily|deep|among|by|under|inside|beyond)\b)', LIV+'z'),
 (r'\b(?:who|that|which|it|he|she|one|still|also|now|only|really|and|story|legend|spirit|aswang|creature)\s+(lives)\b', LIV+'z'),
 (r'\b(live)\b(?=\s+(in|on|with|at|near|here|there|alone|together|forever|happily|long|among|by|under|inside|again|like)\b)', LIV),
 (r'\b(?:to|they|we|you|i|people|families|spirits|creatures|still|can|could|would|will|may|might|must|should|did|do|does)\s+(live)\b', LIV),
 (r'\blong\s+(live)\b', LIV),
 (r'\b(lived)\b', LIV+'d'),
 (r'\b(living)\b', 'lˈɪvɪŋ'),
 # noun "lives" (plural of life) -> layvz: "their lives", "many lives", "save lives"
 (r'\b(?:their|our|your|his|her|my|many|nine|two|three|past|whole|saved?|risk|risked|ordinary|daily)\s+(lives)\b', LAIV+'z'),
 # adjective "live" (LAIV): live music, live show, live broadcast, live wire
 (r'\b(live)\b(?=\s+(music|show|broadcast|wire|animals?|bait|coals?|audience|performance)\b)', LAIV),
]
WATCH=['live','lives','lived','living','read','lead','leads','wind','winds','tear','tears','close','closes','wound','bow','bows','row','rows',
 'minute','object','present','record','content','desert','dove','does','use','used','close','house','moped','bass','sow','refuse','project','permit','produce','invalid','resume','polish','wicked','learned','aged','blessed']
def apply(text):
    """Return text with forced words replaced by placeholders, plus the IPA list (order kept)."""
    forced=[]
    for pat,ipa in RULES:
        def rep(m,ipa=ipa):
            forced.append(ipa);g=m.group(0);a,b=m.start(1)-m.start(0),m.end(1)-m.start(0)
            return g[:a]+'\x00%d\x00'%(len(forced)-1)+g[b:]
        text=re.sub(pat,rep,text,flags=re.I)
    return text,forced
def audit(text):
    return [w for w in re.findall(r"[A-Za-z']+",text) if w.lower() in WATCH]
