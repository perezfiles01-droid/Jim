"""Picks the most important screens of the crawl (at most 98, plus cover and help = 100 slides).
Keeps every base view and its scroll pages, then the screens one click away from them,
key controls first (Filter, Export, Import, menu, paging, search), round robin across the views."""
import json, re
g = json.load(open('prototype2/graph.json')); S = g['states']
LIMIT = 98
keep = [k for fr in g['frames'].values() for k in fr]
KEY = re.compile(r'Filter|Export|Import|navigation|Next|Search|Category|Close', re.I)
queues = []
for b in list(keep):
    hs = sorted(S[b]['hot'], key=lambda h: 0 if KEY.search(h['name']) else 1)
    queues.append([h['target'] for h in hs])
while len(keep) < LIMIT and any(queues):
    for q in queues:
        while q and q[0] in keep: q.pop(0)
        if q and len(keep) < LIMIT: keep.append(q.pop(0))
# second level: inside a just-opened pop-up (e.g. Filter > Category) one more click
for k in list(keep):
    if len(keep) >= LIMIT: break
    if S[k].get('popOpen'):
        for h in S[k]['hot']:
            if h['target'] not in keep and len(keep) < LIMIT: keep.append(h['target']); break
json.dump(keep, open('prototype2/key_states.json', 'w'))
print(len(keep))
