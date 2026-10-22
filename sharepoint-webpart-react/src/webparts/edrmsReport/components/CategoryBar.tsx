import * as React from 'react';
import { Dropdown, IDropdownOption, DropdownMenuItemType } from '@fluentui/react';
import { IDept } from '../lib/data';
import { CATEGORY_LABELS, categoryOf, mainOrder } from '../lib/categories';
import { Caret } from './ui';

/*
 * RAC Item 5 (22 Oct 2026): Category > Sub-category > Sub-group > Site, each
 * box narrowing the next. Values come from the dynamic categories
 * (lib/categories.ts); an empty box means all. The chosen departments are
 * handed back as codes, as the department picker did before.
 */
const ALL = '__all__';

interface ISel { cat: string[]; sub: string[]; grp: string[] }

const Multi: React.FC<{ label: string; values: string[]; value: string[]; allText: string; onChange: (v: string[]) => void; text?: (v: string) => string }> =
  ({ label, values, value, allText, onChange, text }) => {
    const options: IDropdownOption[] = [{ key: ALL, text: allText }, { key: 'div', text: '-', itemType: DropdownMenuItemType.Divider }]
      .concat(values.map(v => ({ key: v, text: text ? text(v) : v })));
    return (
      <Dropdown onRenderCaretDown={Caret} className="picker cgPick" multiSelect options={options} selectedKeys={value.length ? value : [ALL]} ariaLabel={label}
        disabled={!values.length}
        onRenderTitle={() => <span>{!values.length ? 'None' : value.length ? value.join(', ') : allText}</span>}
        onChange={(_, o) => {
          if (!o) return;
          if (o.key === ALL) { onChange([]); return; }
          const next = o.selected ? value.concat(String(o.key)) : value.filter(v => v !== o.key);
          onChange(next.length === values.length ? [] : next);
        }} />
    );
  };

export const CategoryBar: React.FC<{ depts: IDept[]; codes: string[]; onChange: (codes: string[]) => void; site: React.ReactNode }> =
  ({ depts, codes, onChange, site }) => {
    const [sel, setSel] = React.useState<ISel>({ cat: [], sub: [], grp: [] });
    const nameOf = (code: string): string => { const d = depts.filter(x => x.code === code)[0]; return d ? code + ' - ' + d.name : code; };
    const pass = (s: ISel): ((d: IDept) => boolean) => (d: IDept): boolean => {
      const c = categoryOf(d.code);
      return (!s.cat.length || s.cat.indexOf(c.main) >= 0) && (!s.sub.length || s.sub.indexOf(c.sub) >= 0) &&
        (!s.grp.length || (!!c.subSub && s.grp.indexOf(c.subSub) >= 0));
    };
    const pick = (s: ISel): string[] => {
      const any = s.cat.length || s.sub.length || s.grp.length;
      return any ? depts.filter(pass(s)).map(d => d.code) : [];
    };
    // A department chosen elsewhere (a link from Bank-wide) shows as its own categories.
    React.useEffect(() => {
      if (pick(sel).join() === codes.join()) return;
      if (!codes.length) { setSel({ cat: [], sub: [], grp: [] }); return; }
      const cs = codes.map(categoryOf);
      const uniq = (a: string[]): string[] => a.filter((v, i) => a.indexOf(v) === i);
      const withGrp = cs.every(c => !!c.subSub);
      setSel({ cat: uniq(cs.map(c => c.main)), sub: uniq(cs.map(c => c.sub)), grp: withGrp ? uniq(cs.map(c => c.subSub as string)) : [] });
    }, [codes.join()]);

    const order = mainOrder();
    const cats = Array.from(new Set(depts.map(d => categoryOf(d.code).main)))
      .sort((a, b) => (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 99 : order.indexOf(b)));
    const inCat = depts.filter(d => !sel.cat.length || sel.cat.indexOf(categoryOf(d.code).main) >= 0);
    const subs = Array.from(new Set(inCat.map(d => categoryOf(d.code).sub)));
    const inSub = inCat.filter(d => !sel.sub.length || sel.sub.indexOf(categoryOf(d.code).sub) >= 0);
    const grps = Array.from(new Set(inSub.map(d => categoryOf(d.code).subSub).filter(Boolean) as string[]));
    const apply = (s: ISel): void => {
      // A narrower box keeps only choices still possible under the wider ones.
      const c2 = depts.filter(d => !s.cat.length || s.cat.indexOf(categoryOf(d.code).main) >= 0);
      const okSub = c2.map(d => categoryOf(d.code).sub);
      s.sub = s.sub.filter(v => okSub.indexOf(v) >= 0);
      const s2 = c2.filter(d => !s.sub.length || s.sub.indexOf(categoryOf(d.code).sub) >= 0);
      const okGrp = s2.map(d => categoryOf(d.code).subSub);
      s.grp = s.grp.filter(v => okGrp.indexOf(v) >= 0);
      setSel(s); onChange(pick(s));
    };
    const scope = (v: string[], all: string): string => (v.length ? 'All in ' + v.join(', ') : all);

    return (
      <div className="cgBar">
        <div className="cgG"><span className="cgL">{CATEGORY_LABELS[0]}</span>
          <Multi label={CATEGORY_LABELS[0]} values={cats} value={sel.cat} allText="All" onChange={v => apply({ cat: v, sub: sel.sub, grp: sel.grp })} /></div>
        <span className="cgA" aria-hidden="true">&#8250;</span>
        <div className="cgG"><span className="cgL">{CATEGORY_LABELS[1]}</span>
          <Multi label={CATEGORY_LABELS[1]} values={subs} value={sel.sub} allText={scope(sel.cat, 'All')} text={nameOf} onChange={v => apply({ cat: sel.cat, sub: v, grp: sel.grp })} /></div>
        <span className="cgA" aria-hidden="true">&#8250;</span>
        <div className="cgG"><span className="cgL">{CATEGORY_LABELS[2]}</span>
          <Multi label={CATEGORY_LABELS[2]} values={grps} value={sel.grp} allText={scope(sel.sub, 'All')} text={nameOf} onChange={v => apply({ cat: sel.cat, sub: sel.sub, grp: v })} /></div>
        <span className="cgA" aria-hidden="true">&#8250;</span>
        <div className="cgG"><span className="cgL">Site</span>{site}</div>
      </div>
    );
  };
