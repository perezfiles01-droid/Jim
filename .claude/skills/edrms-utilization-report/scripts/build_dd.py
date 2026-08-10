import json
d=json.load(open('gen_out.js'))

def arr(rows, ind=4):
    pad=' '*ind
    body=',\n'.join(pad+'['+','.join(json.dumps(c) for c in r)+']' for r in rows)
    return '[\n'+body+'\n'+' '*(ind-2)+']'

mod = '''DASHBOARDS.dd=(function(){
  /* Every array below is generated from utilizationdb.md, so the page and the
     document cannot disagree. Columns keep the names they already have in the
     EDRMS database: CreatedDate stays CreatedDate, ListId stays ListId. JSON
     keys inside FileMeta, EDRMSMeta and ADBMeta become real columns keeping the
     key name exactly. */
  const TABLES=[
    {n:"Utilization Report Table", db:"utilization_report",
     g:"One row per document held in an EDRMS compliant site, declared or not",
     v:"About 3.47 million rows, replaced in full at each weekly refresh",
     c:''' + arr(d['c1'],6) + '''},
    {n:"Site Activity Table", db:"utilization_site_activity",
     g:"One row per SharePoint site",
     v:"About 1,057 rows, one for every compliant site",
     c:''' + arr(d['c2'],6) + '''},
    {n:"User Activity Table", db:"utilization_user_activity",
     g:"One row per person who used SharePoint in the window",
     v:"About 9,400 rows. Exists because people cannot be counted from a table of sites",
     c:''' + arr(d['c3'],6) + '''}
  ];

  /* [column, which figure it produces, status, where it is today, how to
     source it], in the same order as the tables above. */
  const USES=[
   {t:"Utilization Report Table", r:''' + arr(d['u1'],5) + '''},
   {t:"Site Activity Table", r:''' + arr(d['u2'],5) + '''},
   {t:"User Activity Table", r:''' + arr(d['u3'],5) + '''}
  ];
  const UBADGE={
    have:['g-ok','In the database'],
    derived:['g-ok','Derived at load'],
    new:['g-part','New column'],
    planned:['g-part','Designed, not built'],
    gap:['g-gap','Missing, blocks a figure']
  };

  /* [dashboard, figure, table, how the number is produced, status]. The same
     information as USES read from the other direction, figure first. */
  const TRACE=PLACEHOLDER_TRACE;
  const TBADGE={ok:["g-ok","Ready today"],scan:["g-part","Needs the scan"],
                usage:["g-part","Needs the usage feed"],gap:["g-gap","Blocked"]};

  const SOURCES=[
   ["EDRMS database","<code>drm-npr</code>, schema <code>public</code>, table <code>Records</code>","24 of the 37 columns, for the 21,646 declared records only"],
   ["Microsoft Graph, weekly scan","A scheduled job walking every document library in every compliant site","The same columns for the other 3.45 million documents, plus <code>size</code> and <code>lastModifiedDateTime</code>. <b>The single biggest missing piece. It unlocks Total Documents, the declaration rate and every storage figure</b>"],
   ["SharePoint admin centre","Active sites view, exportable to CSV","Site created date, storage used, primary admin, last activity"],
   ["Microsoft 365 usage reports","Admin centre, Reports, Usage, SharePoint site usage. Or the Graph reports API","Site visits and unique viewers at 7, 30 and 90 days"],
   ["AvePoint Cloud Governance","The provisioning records for EDRMS sites","Department per site, and the provisioning date. <b>Check this before anyone starts mapping sites by hand</b>"],
   ["Retention Label Mapping list","<code>app_edrms_data_uat</code>, the list you already maintain","Library Type, Retention Label, Retention Duration, Physical Counterpart, all per library"]
  ];

  const html=`<section class="dash-dd">
    <div class="band">
      <h2>The database behind the report</h2>
      <div class="bd">What has to exist in the database for the Utilization Report to work, written the way a SharePoint list is written. Every column keeps the name it already has in the EDRMS database, so it can be traced back to where it came from. Every figure on every dashboard is traced back to a column here.</div>
    </div>

    <div class="panel">
      <h3>Can it be one table only?</h3>
      <p>Almost. One table gets you about nine tenths of the report. Three things break.</p>
      <p><b>A site with no documents in it disappears.</b> Sites and Libraries reports 1,057 compliant sites created. If sites are counted from a table of documents, a site is only counted once it holds at least one document, so a site created last month that nobody has uploaded to yet is invisible and the count comes out low. It gets worse over time, because the newest sites are the emptiest ones.</p>
      <p><b>Site visits and unique viewers are measured per site, not per document.</b> If a site had 4,812 visits last month and holds 6,000 documents, putting 4,812 on all 6,000 rows means any total that adds the column up returns 28 million visits. There is no way to put a per site figure on a per document table and have it stay correct when summed.</p>
      <p><b>People cannot be counted from a table of sites.</b> Total EDRMS Users asks how many people used EDRMS. Someone who works in three sites appears in three site rows, so adding up the per site viewer counts counts that person three times. Only a row per person answers it.</p>
      <p>Everything else fits in one table. So the answer is <b>three tables, one per grain</b>: one row per document, one row per site, one row per person. The second and third are small, about 1,057 and 9,400 rows, and each exists only because its grain cannot be reached from the others.</p>
    </div>

    <div class="panel">
      <h3>Naming rule</h3>
      <p><b>Where a column already exists in the EDRMS database, it keeps the exact same name.</b> <code>CreatedDate</code> stays <code>CreatedDate</code>, not "Declared Date". <code>ListId</code> stays <code>ListId</code>, not "Library ID". Renaming makes a column impossible to trace back to where it came from.</p>
      <p><b>JSON keys become real columns, keeping the key name.</b> <code>FileMeta</code>, <code>EDRMSMeta</code> and <code>ADBMeta</code> each hold several values inside one JSON field. A reporting table cannot filter or total a value buried inside JSON efficiently, so each key becomes its own column: <code>FileMeta</code> key <code>FileType</code> becomes a column called <code>FileType</code>.</p>
      <p><b>Two names had to be invented because the existing name means something else.</b> <code>ModifiedDate</code> in <code>Records</code> is when the record row changed, not when the file changed, so the file's own date is <code>FileModifiedDate</code>. And <code>CreatedDate</code> already means the declaration date, which is why the file's own creation date stays <code>FileCreatedDate</code>.</p>
    </div>

    <div class="panel">
      <h3>What one row means</h3>
      <p>One row is <b>one SharePoint item</b>, identified by <code>ListId</code> plus <code>ItemId</code> together. Not by <code>DocumentId</code>.</p>
      <p><code>DocumentId</code> looks like the natural identifier and it is nullable, so it cannot carry that job on its own. A check against UAT returned <b>1,990 rows against 1,984 distinct DocumentId</b>, a gap of six. Whether those six are documents declared twice or rows with no <code>DocumentId</code> at all, the conclusion is the same: <code>ListId</code> and <code>ItemId</code> are both mandatory in <code>Records</code> and together they locate exactly one item in exactly one library.</p>
      <p>This matters for one figure. <b>Total Declared Records counts distinct items, not rows</b>, so a document declared twice is one record and not two. On the UAT data that is a difference of six in 1,990, which changes nothing visually and everything about whether two people building two reports arrive at the same number. It is a definition RAC should sign off once, in writing.</p>
    </div>

    <div class="panel">
      <h3>The three tables</h3>
      <div class="lead">Names in <b style="color:var(--deepblue)">blue</b> are ones the report cannot function without. Names in <b style="color:#9C4A16">amber</b> do not exist today and block a figure.</div>
      <div id="dd-tables"></div>
    </div>

    <div class="panel">
      <h3>Which figure each column produces, and how to source it</h3>
      <div class="lead"><b>Read this first, or the table will mislead you:</b> <code>Records</code> holds declared records only, about 21,646 of them, while the Utilization Report Table holds every document, about 3.47 million. So where a row says a column exists in <code>Records</code>, it exists <b>for the declared 21,646</b>. For the other 3.45 million the same column comes from the weekly SharePoint scan, which is one piece of work covering most of the table in one go, not twenty separate problems.</div>
      <div class="lead">Where it is today cites <code>Database_Design_12.03_2.xlsx</code> by sheet and actual spreadsheet row, and the live <code>drm-npr</code> database. All Records references are to the <b>2026.1 block, rows 56 to 82</b>, not the older 1.3 block above it. <code>ADBMaster</code>, <code>Library</code>, <code>PhysicalRecords</code> and <code>favoritelocations</code> are in the workbook but were never built.</div>
      <div id="dd-uses"></div>
      <div class="tally" id="dd-tally"></div>
    </div>

    <div class="panel">
      <h3>Where every figure comes from</h3>
      <div class="lead">The same information read from the other direction: every number in the prototype and how it is produced. If a figure is not on this list, it has no source.</div>
      <div class="scroll"><table id="dd-trace"></table></div>
    </div>

    <div class="panel">
      <h3>Where to go for each source</h3>
      <div class="lead">Six systems supply everything. This is the practical answer to where do I get this.</div>
      <div class="scroll"><table id="dd-src"></table></div>
      <p style="margin-top:12px">Two things are not in any system and have to be <b>decided</b> rather than found: <code>IsEdrmsCompliant</code>, which is a RAC definition, and the extension to format group mapping behind <code>FormatGroup</code>, which is a short list RAC signs off once.</p>
    </div>

    <div class="panel">
      <h3>The remaining gaps</h3>
      <p><b>1. Nothing records which department owns a site.</b> The only gap left that needs a person rather than code. <code>ADBDepartmentOwner</code> exists as a SharePoint column and is empty on every row, which is why <code>ADBMeta</code> is empty. The term store holds the vocabulary, but a list of valid answers is not the answer. Attach department to the <b>site</b>, in the Site Activity Table, and let every document inherit it through <code>SiteUrl</code>, which every row already carries: about 1,057 values instead of 3.47 million, working for existing documents as well as new ones with no migration. Confirmed feasible by the development team on 10 August 2026. Check AvePoint Cloud Governance first, since it may already hold it from provisioning.</p>
      <p><b>2. File size is not captured.</b> Blocks the 46.7 GB headline, storage by format, average file size and Largest Libraries. The smallest of the three, and it has two independent routes: Microsoft Graph returns <code>size</code> on every item so the weekly scan solves the library and format figures on its own, and adding a <code>FileSize</code> key to the existing <code>FileMeta</code> JSON solves per record storage without a migration. One warning that came with it: folders are returned with a <b>cumulative</b> size, so the scan must filter to files only or storage is double counted.</p>
      <p><b>3. Which sites are EDRMS compliant.</b> No longer a decision. A site is compliant when it has the Declare as Record button, and that button comes from an installed app, Product ID <code>{B255A2AF-7F63-4A30-966A-5D5FD99F97D7}</code>. It is visible per site in Site Contents, listed separately from the app catalog, so the rule is mechanical rather than a maintained list. What remains is a question for the development team: which call returns that row across 1,057 sites rather than one at a time.</p>
      <p>Site created date is closed: Microsoft Graph returns <code>createdDateTime</code> on every site.</p>
    </div>
  </section>`;

  function init(){
    document.getElementById("dd-tables").innerHTML=TABLES.map(t=>
      `<div class="tc">
        <div class="th"><b>${t.n}<em>${t.db}</em></b><small>${t.g}. ${t.v}</small></div>
        <div class="wrap"><table>
          <tr><th>#</th><th>Column</th><th>Type</th><th>What it holds</th></tr>
          ${t.c.map(([col,typ,desc,flag],i)=>
            `<tr class="${flag}"><td class="n">${i+1}</td><td class="c"><b>${col}</b></td>
             <td class="t">${typ}</td><td class="d">${desc}</td></tr>`).join("")}
        </table></div>
        <div class="cnt">${t.c.length} columns</div>
      </div>`).join("");

    document.getElementById("dd-uses").innerHTML=USES.map(u=>
      `<div class="tc">
        <div class="th"><b>${u.t}</b><small>${u.r.length} columns</small></div>
        <div class="wrap scroll"><table class="ut">
          <tr><th style="width:34px">#</th><th style="width:150px">Column</th><th style="width:25%">Which figure it produces</th><th style="width:120px">Status</th><th style="width:22%">Where it is today</th><th>How to source it</th></tr>
          ${u.r.map(([col,fig,st,now,how],i)=>
            `<tr class="${st==='gap'||st==='planned'?'gap':''}">
              <td class="n">${i+1}</td><td class="c"><b>${col}</b></td><td class="d">${fig}</td>
              <td><span class="dtag ${UBADGE[st][0]}">${UBADGE[st][1]}</span></td>
              <td class="d">${now}</td><td class="d">${how}</td></tr>`).join("")}
        </table></div>
      </div>`).join("");

    /* Counted from the data at render time, so the tally can never claim a
       number the table above it does not show. */
    const tally={}; let n=0;
    USES.forEach(u=>u.r.forEach(r=>{tally[r[2]]=(tally[r[2]]||0)+1;n++;}));
    document.getElementById("dd-tally").innerHTML=
      Object.entries(UBADGE).filter(([k])=>tally[k]).map(([k,[cls,lbl]])=>
        `<span class="ti"><b>${tally[k]}</b> <span class="dtag ${cls}">${lbl}</span></span>`).join("")+
      `<span class="ti tot"><b>${n}</b> columns across the three tables</span>`;

    document.getElementById("dd-trace").innerHTML=
      `<tr><th style="width:15%">Dashboard</th><th style="width:22%">Figure</th><th style="width:16%">Table</th><th>How the number is produced</th><th style="width:14%">Ready?</th></tr>`+
      TRACE.map(([dash,fig,tbl,how,st])=>
        `<tr><td>${dash}</td><td>${fig}</td><td>${tbl}</td><td class="d">${how}</td>
         <td><span class="dtag ${TBADGE[st][0]}">${TBADGE[st][1]}</span></td></tr>`).join("");

    document.getElementById("dd-src").innerHTML=
      `<tr><th style="width:20%">Source</th><th style="width:30%">What to open</th><th>What it gives you</th></tr>`+
      SOURCES.map(([s,o,g])=>`<tr><td><b>${s}</b></td><td class="d">${o}</td><td class="d">${g}</td></tr>`).join("");
  }

  return {
    ver:"Reporting Database Design",
    crumb:"Data Design",
    /* Documentation, not a dashboard. verify.js reads this so it does not
       demand a KPI card from a page that correctly has none. */
    kind:"reference",
    asof:"Design reference. Full detail in utilizationdb.md",
    html,init
  };
})();
'''
mod=mod.replace('PLACEHOLDER_TRACE', arr(d['tr'],4))
open('dd_new.js','w').write(mod)
print(len(mod),'bytes')
