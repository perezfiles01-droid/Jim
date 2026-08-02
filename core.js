/* Shared shell styles for the EDRMS Reporting Suite.
   Tokens, sidebar, header, band, KPI card, panel, pager.
   Anything that differs between dashboards lives in that dashboard's
   own folder instead, because the source prototypes reuse class names
   with different values and inverted series colours. */
  /* ===== shared shell tokens (union of both dashboards) ===== */
  :root{--ink:#10243E;--ink2:#33475F;--blue:#0072BC;--blue-d:#005A96;--teal:#00A5A8;--green:#5CA943;--orange:#E8763C;--greyblue:#9DB8D2;--deepblue:#1B5E82;--bg:#EEF2F6;--card:#fff;--line:#D9E1EA;--mut:#6B7A8C;--nav:#0E1F35;--nav-hi:#16304F;--sans:"Segoe UI",system-ui,-apple-system,Arial,sans-serif;--serif:Georgia,serif;--shadow:0 1px 2px rgba(16,36,62,.06),0 4px 14px rgba(16,36,62,.06)}
  *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}
  body{font-family:var(--sans);background:var(--bg);color:var(--ink);font-size:14px;display:flex}
  #side{width:236px;min-width:236px;background:var(--nav);color:#C7D3E0;display:flex;flex-direction:column;height:100vh;position:sticky;top:0}
  #side .brand{padding:18px;border-bottom:1px solid rgba(255,255,255,.08)}
  #side .t1{font-family:var(--serif);font-size:18px;color:#fff;line-height:1.25}
  #side .t2{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7FA8CC;margin-top:4px}
  #side .ver{font-size:10px;color:#5E748C;margin-top:6px}
  nav{flex:1;padding:8px 0}
  .grp{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#5E748C;padding:12px 18px 6px}
  nav a{display:flex;align-items:center;gap:10px;padding:8px 18px;color:#C7D3E0;font-size:13.5px;border-left:3px solid transparent;text-decoration:none}
  nav a[data-d]{cursor:pointer}
  nav a[data-d]:hover{background:var(--nav-hi);color:#fff}
  nav a .ic{width:18px;text-align:center;opacity:.85}
  nav a.on{background:var(--nav-hi);color:#fff;border-left-color:var(--green);font-weight:600}
  nav a.dis{color:#4C6079;cursor:default}nav a.dis .ic{opacity:.5}
  #main{flex:1;min-width:0;display:flex;flex-direction:column}
  header{background:var(--card);border-bottom:1px solid var(--line);padding:12px 22px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;position:sticky;top:0;z-index:20}
  .crumb{font-size:12px;color:var(--mut)}.crumb b{color:var(--ink);font-size:15px;font-family:var(--serif);display:block}
  .spacer{flex:1}
  #asof{font-size:11.5px;color:var(--mut)}
  section{padding:20px 22px 46px}
  .band{background:#E9F0F7;border:1px solid #DAE5F0;border-radius:12px;padding:16px 18px;margin-bottom:16px}
  .band h2{font-family:var(--serif);font-size:17px;color:var(--ink);line-height:1.3}
  .band .bd{font-size:12.5px;color:var(--ink2);margin-top:6px;max-width:900px}
  .kpi{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px;box-shadow:var(--shadow);cursor:pointer;transition:transform .1s,box-shadow .1s;border-left:4px solid transparent}
  .kpi:hover{transform:translateY(-2px)}
  .kpi.on{border-left-color:var(--blue);box-shadow:0 0 0 2px rgba(0,114,188,.22),var(--shadow)}
  .kpi .lab{font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--mut);line-height:1.3}
  .kpi .val{font-size:30px;font-weight:700;margin-top:8px;font-variant-numeric:tabular-nums;line-height:1.1}
  .kpi .tap{font-size:11px;color:var(--blue);margin-top:8px;font-weight:600}
  .panel{background:var(--card);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);padding:18px 20px;margin-bottom:26px}
  .ptitle{font-size:16px;font-weight:700;font-family:var(--serif);margin-bottom:3px}
  .psub{font-size:12px;color:var(--mut);margin-bottom:14px;max-width:900px}
  .muted{color:var(--mut);font-style:italic;font-size:12px}
  .pager{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:12px}
  .pager .pinfo{font-size:12px;color:var(--mut)}
  .pager .pbtns{display:flex;align-items:center;gap:6px}
  .pager button{font:inherit;font-size:12px;font-weight:600;border:1px solid #cfd8e3;background:#fff;color:var(--ink2);border-radius:6px;padding:5px 10px;cursor:pointer}
  .pager button:hover:not(:disabled){border-color:var(--blue);color:var(--blue)}
  .pager button.on{background:var(--blue);border-color:var(--blue);color:#fff}
  .pager button:disabled{opacity:.45;cursor:default}

