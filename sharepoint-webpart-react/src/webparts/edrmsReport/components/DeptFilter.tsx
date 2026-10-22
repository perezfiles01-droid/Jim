import * as React from 'react';
import { Callout, DirectionalHint } from '@fluentui/react';
import { IDept } from '../lib/data';
import { FunnelGlyph } from './ui';
import { UnitChecklist } from './UnitChecklist';
import { CATEGORY_LABELS } from '../lib/categories';

/**
 * The Filter button on department tables: tick the departments to show, then
 * Apply. An empty selection means every department.
 */
export const DeptFilter: React.FC<{ depts: IDept[]; selected: string[]; onApply: (codes: string[]) => void }> =
  ({ depts, selected, onApply }) => {
    const [open, setOpen] = React.useState(false);
    const [draft, setDraft] = React.useState<string[]>([]);
    const btn = React.useRef<HTMLButtonElement>(null);
    const sortedDepts = React.useMemo(() => depts.slice().sort((a, b) => a.code.localeCompare(b.code)), [depts]);
    const all = sortedDepts.map(d => d.code);

    const show = (): void => { setDraft(selected.length ? selected.slice() : all.slice()); setOpen(true); };
    const apply = (): void => { onApply(draft.length === all.length ? [] : draft); setOpen(false); };
    const reset = (): void => { onApply([]); setOpen(false); };

    return (
      <>
        <button type="button" ref={btn} className={'fBtn' + (selected.length ? ' on' : '')} aria-haspopup="true" aria-expanded={open}
          onClick={() => (open ? setOpen(false) : show())}>
          <FunnelGlyph />Filter{selected.length ? ` (${selected.length})` : ''}
        </button>
        {open && (
          <Callout target={btn} onDismiss={() => setOpen(false)} directionalHint={DirectionalHint.bottomRightEdge} gapSpace={6} setInitialFocus role="dialog" ariaLabel="Filter departments">
            <div className="fPop">
              <div className="fHead">{CATEGORY_LABELS.join(" \u203a ")}</div>
              <UnitChecklist depts={sortedDepts} draft={draft} setDraft={setDraft} />
              <div className="fBtns">
                <button type="button" className="btn" onClick={reset}>Reset</button>
                <button type="button" className="btn primary" disabled={!draft.length} onClick={apply}>Apply</button>
              </div>
            </div>
          </Callout>
        )}
      </>
    );
  };

/** Filters and searches a department list the same way on every table. */
export function filterDepts(depts: IDept[], selected: string[], query: string): IDept[] {
  const q = query.trim().toLowerCase();
  return depts.filter(d => (!selected.length || selected.indexOf(d.code) >= 0) &&
    (!q || (d.code + ' ' + d.name).toLowerCase().indexOf(q) >= 0));
}
