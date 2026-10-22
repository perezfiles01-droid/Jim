import * as React from 'react';
import { Checkbox } from '@fluentui/react';
import { IDept } from '../lib/data';

/*
 * RAC Item 5 (22 Oct 2026): every department list groups units by location
 * (HQ / RM / RO) and type, with a search box. Sample classification: no
 * source holds unit type or location yet, RAC is asked for them.
 */
const UNIT_TYPE: Record<string, 'D' | 'O' | 'RM' | 'RO'> = {
  ITD: 'D', SARD: 'D', FIN: 'D', PARD: 'D', HRD: 'D', SERD: 'D', EARD: 'D', CWRD: 'D', SPD: 'D',
  OSFG: 'O', OGC: 'O',
  SLRM: 'RM', INRM: 'RM', PRCM: 'RM',
  NARO: 'RO', ERO: 'RO'
};
type Loc = 'All' | 'HQ' | 'RM' | 'RO';
const GROUPS: { key: string; loc: Loc; label: string }[] = [
  { key: 'D', loc: 'HQ', label: 'HQ departments' },
  { key: 'O', loc: 'HQ', label: 'HQ offices' },
  { key: 'RM', loc: 'RM', label: 'Resident Missions (RM)' },
  { key: 'RO', loc: 'RO', label: 'Representative Offices (RO)' }
];
const NONE: Record<string, string> = { HQ: 'HQ units', RM: 'Resident Missions', RO: 'Representative Offices' };

export const unitGroup = (code: string): string => UNIT_TYPE[code] || 'D';

/** Search, location buttons, Select all and the grouped checklist. */
export const UnitChecklist: React.FC<{ depts: IDept[]; draft: string[]; setDraft: (v: string[]) => void }> =
  ({ depts, draft, setDraft }) => {
    const [q, setQ] = React.useState('');
    const [loc, setLoc] = React.useState<Loc>('All');
    const term = q.trim().toLowerCase();
    const sorted = React.useMemo(() => depts.slice().sort((a, b) => a.code.localeCompare(b.code)), [depts]);
    const visible = sorted.filter(d => {
      const g = GROUPS.filter(x => x.key === unitGroup(d.code))[0];
      return (loc === 'All' || g.loc === loc) && (!term || (d.code + ' ' + d.name).toLowerCase().indexOf(term) >= 0);
    });
    const vis = visible.map(d => d.code);
    const on = vis.filter(c => draft.indexOf(c) >= 0).length;
    const setMany = (codes: string[], value: boolean): void =>
      setDraft(value ? draft.concat(codes.filter(c => draft.indexOf(c) < 0)) : draft.filter(c => codes.indexOf(c) < 0));

    return (
      <>
        <div className="ugHead">
          <input type="search" className="ugQ" placeholder="Search code or name" aria-label="Search departments"
            value={q} onChange={e => setQ(e.target.value)} />
          <div className="ugSeg" role="group" aria-label="Location">
            {(['All', 'HQ', 'RM', 'RO'] as Loc[]).map(l => (
              <button key={l} type="button" className={l === loc ? 'on' : ''} aria-pressed={l === loc} onClick={() => setLoc(l)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="fAll">
          <Checkbox label="Select all" checked={vis.length > 0 && on === vis.length}
            indeterminate={on > 0 && on < vis.length} onChange={(_, v) => setMany(vis, !!v)} />
        </div>
        <div className="fList">
          {GROUPS.map(g => {
            const m = visible.filter(d => unitGroup(d.code) === g.key);
            if (!m.length) return null;
            const codes = m.map(d => d.code);
            const n = codes.filter(c => draft.indexOf(c) >= 0).length;
            return (
              <React.Fragment key={g.key}>
                <div className="ugH">
                  <Checkbox label={g.label} checked={n === codes.length} indeterminate={n > 0 && n < codes.length}
                    onChange={(_, v) => setMany(codes, !!v)} />
                </div>
                {m.map(d => (
                  <div key={d.code} className="ugI">
                    <Checkbox checked={draft.indexOf(d.code) >= 0} onChange={(_, v) => setMany([d.code], !!v)}
                      onRenderLabel={() => <span className="ugL"><b>{d.code}</b><span>{d.name}</span></span>} />
                  </div>
                ))}
              </React.Fragment>
            );
          })}
          {!visible.length && <div className="ugNone">{term ? 'No department matches.' : 'No ' + (NONE[loc] || 'units') + ' in the sample data yet.'}</div>}
        </div>
      </>
    );
  };
