"""Pull the TREE builder out of index.html and check it standalone.

The drill data is built inside an IIFE closure, so it cannot be reached from
page.evaluate. Extracting the pieces is the only way to assert on the tree
itself rather than on what happens to be rendered.
"""
import sys

s = open('/home/user/Jim/index.html').read()


def grab(start, end):
    i = s.index(start)
    j = s.index(end, i)
    return s[i:j]


js = (
    grab('function split(total,k,seed){', 'function monthly')
    + grab('const DEPTS=[', 'DEPTS.forEach')
    + grab('const SITESTEMS=', 'const LIBPOOL')
    + grab('const LIBPOOL=', '\n\n  const TREE')
    + grab('const TREE=DEPTS.map', 'const LEVELS')
    + grab('const LEVELS=', '\n')
    + """
const bad = [];
TREE.forEach(d => {
  const sum = k => d.children.reduce((a, s) => a + s[k], 0);
  ['rec', 'phys', 'docs'].forEach(k => {
    if (sum(k) !== d[k]) bad.push(`${d.label} ${k}: sites total ${sum(k)} vs department ${d[k]}`);
  });
  d.children.forEach(st => {
    ['rec', 'phys', 'docs'].forEach(k => {
      const ls = st.children.reduce((a, l) => a + l[k], 0);
      if (ls !== st[k]) bad.push(`${st.label} ${k}: libraries total ${ls} vs site ${st[k]}`);
    });
    st.children.forEach(l => {
      if (l.children) bad.push(`${st.label} > ${l.label} has children, tree is deeper than Library`);
    });
  });
});

const depth = (n, k = 0) => (n.children ? depth(n.children[0], k + 1) : k);
console.log('LEVELS         :', JSON.stringify(LEVELS));
console.log('deepest level  :', depth(TREE[0]), '(0 department, 1 site, 2 library)');
console.log('departments    :', TREE.length);
console.log('sites          :', TREE.reduce((a, d) => a + d.children.length, 0));
console.log('declared total :', TREE.reduce((a, d) => a + d.rec, 0));
console.log('documents total:', TREE.reduce((a, d) => a + d.docs, 0));
console.log('reconciliation :', bad.length ? bad : 'every site and library total matches its parent');
process.exit(bad.length ? 1 : 0);
"""
)

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/tree_check.js'
open(out, 'w').write(js)
print('wrote', out)
