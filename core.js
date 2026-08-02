/* ===================================================================
   Shared helpers. Only the helpers that were byte identical in both
   source prototypes live here. Anything that differed (pager, the
   deptOptions builders, the date range readers) stays inside its own
   dashboard closure so each keeps its original behaviour.
   =================================================================== */
const F=n=>Number(Math.round(n)).toLocaleString();
function wirePager(scope,onGo){document.querySelectorAll(scope+" .pager button[data-pg]").forEach(b=>b.onclick=()=>onGo(b.dataset.pg));}

const DASHBOARDS={};

