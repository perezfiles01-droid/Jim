import * as React from 'react';
import { Checkbox } from '@fluentui/react';
import { IDept } from '../lib/data';
import { CATEGORY_LABELS, categoryOf, mainOrder } from '../lib/categories';

/*
 * RAC Item 5 (22 Oct 2026): every department list is a tree built from the
 * dynamic categories (lib/categories.ts): Main Category, then Sub Category,
 * then the unit. The quick buttons are the Main Category values themselves,
 * so a new or renamed category appears without a code change.
 */
interface INode { key: string; label: string; codes: string[]; items: IDept[] }

export const UnitChecklist: React.FC<{ depts: IDept[]; draft: string[]; setDraft: (v: string[]) => void }> =
  ({ depts, draft, setDraft }) => {
    const [q, setQ] = React.useState('');
    const [main, setMain] = React.useState('All');
    const term = q.trim().toLowerCase();
    const sorted = React.useMemo(() => depts.slice().sort((a, b) => a.code.localeCompare(b.code)), [depts]);
    const mains = React.useMemo(() => {
      const order = mainOrder(), found = Array.from(new Set(sorted.map(d => categoryOf(d.code).main)));
      const rank = (m: string): number => (order.indexOf(m) < 0 ? order.length : order.indexOf(m));
      return found.sort((a, b) => rank(a) - rank(b));
    }, [sorted]);
    const visible = sorted.filter(d => {
      const c = categoryOf(d.code);
      const text = [d.code, d.name, c.main, c.sub, c.subSub || ''].join(' ').toLowerCase();
      return (main === 'All' || c.main === main) && (!term || text.indexOf(term) >= 0);
    });
    const vis = visible.map(d => d.code);
    const on = (codes: string[]): number => codes.filter(c => draft.indexOf(c) >= 0).length;
    const setMany = (codes: string[], value: boolean): void =>
      setDraft(value ? draft.concat(codes.filter(c => draft.indexOf(c) < 0)) : draft.filter(c => codes.indexOf(c) < 0));
    const groupBox = (label: string, codes: string[], cls: string, title?: string): JSX.Element => {
      const n = on(codes);
      return (
        <div className={cls} title={title}>
          <Checkbox label={label} checked={n === codes.length} indeterminate={n > 0 && n < codes.length} onChange={(_, v) => setMany(codes, !!v)} />
        </div>
      );
    };
    const leaf = (d: IDept, depth: number): JSX.Element => (
      <div key={d.code} className={'ugI d' + depth}>
        <Checkbox checked={draft.indexOf(d.code) >= 0} onChange={(_, v) => setMany([d.code], !!v)}
          onRenderLabel={() => <span className="ugL"><b>{d.code}</b><span>{d.name}</span></span>} />
      </div>
    );

    return (
      <>
        <div className="ugHead">
          <input type="search" className="ugQ" placeholder="Search a category, code or name" aria-label="Search departments"
            value={q} onChange={e => setQ(e.target.value)} />
          <div className="ugSeg" role="group" aria-label={CATEGORY_LABELS[0]}>
            {['All'].concat(mains).map(m => (
              <button key={m} type="button" className={m === main ? 'on' : ''} aria-pressed={m === main} onClick={() => setMain(m)}>{m}</button>
            ))}
          </div>
        </div>
        <div className="fAll">
          <Checkbox label="Select all" checked={vis.length > 0 && on(vis) === vis.length}
            indeterminate={on(vis) > 0 && on(vis) < vis.length} onChange={(_, v) => setMany(vis, !!v)} />
        </div>
        <div className="fList">
          {mains.map(m => {
            const inMain = visible.filter(d => categoryOf(d.code).main === m);
            if (!inMain.length) return null;
            // Sub Category groups inside this Main Category, in first-seen order.
            const subs: INode[] = [];
            inMain.forEach(d => {
              const s = categoryOf(d.code).sub;
              let g = subs.filter(x => x.key === s)[0];
              if (!g) { g = { key: s, label: s, codes: [], items: [] }; subs.push(g); }
              g.codes.push(d.code); g.items.push(d);
            });
            return (
              <React.Fragment key={m}>
                {groupBox(m, inMain.map(d => d.code), 'ugH', CATEGORY_LABELS[0])}
                {subs.map(g => {
                  // A Sub Category that is the unit itself is shown as the unit; one that
                  // holds Sub Sub Categories (e.g. a department's resident missions) is a group.
                  const self = g.items.length === 1 && g.items[0].code === g.key && !categoryOf(g.key).subSub;
                  if (self) return leaf(g.items[0], 1);
                  const owner = sorted.filter(d => d.code === g.key)[0];
                  return (
                    <React.Fragment key={m + '/' + g.key}>
                      {groupBox(g.key + (owner ? '  ' + owner.name : ''), g.codes, 'ugS', CATEGORY_LABELS[1])}
                      {g.items.map(d => leaf(d, 2))}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}
          {!visible.length && <div className="ugNone">{term ? 'Nothing matches.' : 'Nothing in this category in the sample data yet.'}</div>}
        </div>
      </>
    );
  };
