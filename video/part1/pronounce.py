# Exact pronunciations the requester set (31 Oct 2026). Kokoro guesses these wrong:
# it reads the A in "A D B" and "R A C" as a schwa ("RC"), and AvePoint as "Ah-vay-point".
# Each token is voiced from the IPA here; everything else goes through Kokoro's own phonemizer.
import re
IPA = {
    'A D B': 'eɪdˈiːbiː',              # Ey-DB, soft Ey, D B run together
    'R A C': 'ˈɑːɹ ˈeɪ sˈiː',           # R-A-C, every letter
    'T C S Q A': 'tˈiː sˈiː ˈɛs kjˈuː ˈeɪ',
    'Q A': 'kjˈuː ˈeɪ',                 # Q A, American "Ey"
    'I T D': 'ˈaɪ tˈiː dˈiː',
    'E D R M S': 'ˈiː dˈiː ˈɑːɹ ˈɛm ˈɛs',
    'AvePoint': 'ˈævpɔɪnt',            # Av-Point
    'live': 'lˈaɪv',                    # went live / goes live = "layv"
    'I D': 'ˈaɪ dˈiː',
}
PAT = re.compile(r'(?<![A-Za-z])(' + '|'.join(sorted(map(re.escape, IPA), key=len, reverse=True)) + r')(?![A-Za-z])')

def phonemes(k, text):
    out = []
    for i, part in enumerate(PAT.split(text)):
        if i % 2: out.append(IPA[part])
        elif part.strip(): out.append(k.tokenizer.phonemize(part, 'en-us'))
        if part[-1:] == ' ' or part[:1] == ' ': out.append(' ')
    return re.sub(r'\s+([.,?!;:])', r'\1', re.sub(r'\s+', ' ', ' '.join(out))).strip()
