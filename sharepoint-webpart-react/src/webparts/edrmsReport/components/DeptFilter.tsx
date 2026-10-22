import * as React from 'react';
import { Callout, DirectionalHint } from '@fluentui/react';
import { IDept } from '../lib/data';
import { FunnelGlyph } from './ui';
import { CategoryBar } from './CategoryBar';

/**
 * The Filter button on department tables. The popup holds the same Category >
 * Sub-category > Sub-group boxes as Department Insights (RAC Item 5, 22 Oct
 * 2026); Apply narrows the table. An empty selection means every department.
 */
export const DeptFilter: React.FC<{ depts: IDept[]; selected: string[]; onApply: (codes: string[]) => void }> =
  ({ depts, selected, onApply }) => {
    const [open, setOpen] = React.useState(false);
    const [draft, setDraft] = React.useState<string[]>([]);
    const btn = React.useRef<HTMLButtonElement>(null);
    const show = (): void => { setDraft(selected.slice()); setOpen(true); };
    const apply = (): void => { onApply(draft.length === depts.length ? [] : draft); setOpen(false); };
    const reset = (): void => { onApply([]); setOpen(false); };

    return (
      <>
        <button type="button" ref={btn} className={'fBtn' + (selected.length ? ' on' : '')} aria-haspopup="true" aria-expanded={open}
          onClick={() => (open ? setOpen(false) : show())}>
          <FunnelGlyph />Filter{selected.length ? ` (${selected.length})` : ''}
        </button>
        {open && (
          <Callout target={btn} onDismiss={() => setOpen(false)} directionalHint={DirectionalHint.bottomRightEdge} gapSpace={6} setInitialFocus role="dialog" ariaLabel="Filter departments"
            // A box's own list opens in a separate layer; choosing from it must not close the popup.
            preventDismissOnEvent={ev => !!(ev.target instanceof Element && ev.target.closest('.ms-Layer'))}>
            <div className="fPop">
              <div className="fHead">Filter Department / Office / RM / RO</div>
              <CategoryBar depts={depts} codes={draft} onChange={setDraft} vertical />
              <div className="fBtns">
                <button type="button" className="btn" onClick={reset}>Reset</button>
                <button type="button" className="btn primary" onClick={apply}>Apply</button>
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
