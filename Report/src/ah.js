/* ===================================================================
   Records and Archives Holdings

   Spec: 2026.4 Reports Utilization, section 6.
     Physical Records Holdings   total physical files, total legacy
                                 records, total boxes, total storage
                                 locations, records by office location,
                                 records by storage facility,
                                 records awaiting transfer
     Inventory Health            unverified physical files, missing
                                 files, files due for inventory
                                 verification, files scheduled for
                                 transfer
     Storage Location Dashboard  HQ storage, field offices, offsite
                                 storage, records center

   Every figure on this dashboard comes from Opus, the physical records
   inventory. None of it is in SharePoint and none of it can be derived
   from the EDRMS database.
   =================================================================== */
DASHBOARDS.ah = (function(){
  let facSort = "files", facDir = "desc";

  function holdingsBody(){
    return tiles([
      {tl:"Total physical files", tv:F(PHYSICAL_FILES), cls:"hi"},
      {tl:"Total legacy records", tv:F(PHYSICAL_LEGACY), tn:PCTS(PHYSICAL_LEGACY, PHYSICAL_FILES) + " of holdings"},
      {tl:"Total current records", tv:F(PHYSICAL_CURRENT), tn:"Registered since EDRMS go live"},
      {tl:"Total boxes", tv:F(PHYSICAL_BOXES)},
      {tl:"Total storage locations", tv:F(FACILITIES.length), tn:"Distinct physical facilities"},
      {tl:"Records awaiting transfer", tv:F(INVENTORY.scheduledTransfer), cls:"warn"}
    ]) +
    `<div class="ptitle" style="margin-top:6px">Records by office location</div>
     <div class="psub" style="margin-bottom:12px">The four location groups the physical estate is reported against.</div>` +
    donut(PHYSICAL_BY_LOCATION, {centre:F(PHYSICAL_FILES), centreLabel:"files"}) +
    note(`<b>Legacy and current are a split of the same total, not two totals.</b> Legacy records are those registered before the department went live on EDRMS and carry no digital counterpart. Current records are those registered since. ${F(PHYSICAL_LEGACY)} plus ${F(PHYSICAL_CURRENT)} equals ${F(PHYSICAL_FILES)}.`);
  }

  function facilitiesBody(){
    const rows = sortBy(FACILITIES, facSort, facDir);
    return table([
      {k:"name", t:"Storage facility", cell:r => `<b>${r.name}</b><small>${r.loc}</small>`},
      {k:"files", t:"Physical files", num:true, fmt:F},
      {k:"boxes", t:"Boxes", num:true, fmt:F},
      {k:"capacity", t:"Box capacity", num:true, fmt:F},
      {k:"util", t:"Utilisation", num:true, cell:r => {
        const u = PCT(r.boxes, r.capacity);
        const c = u >= 90 ? "bad" : u >= 75 ? "warn" : "ok";
        return `<span class="pill ${c}">${F1(u)}%</span>`;
      }},
      {k:"verified", t:"Last verified"}
    ], rows, {sortable:true, sort:facSort, dir:facDir}) +
    note(`<b>Utilisation is the number to watch, not the file count.</b> A facility above 90 per cent of box capacity cannot absorb the next transfer, which is what turns records awaiting transfer into records overdue for transfer. ${FACILITIES.filter(f => PCT(f.boxes, f.capacity) >= 90).length} of ${FACILITIES.length} facilities are already there.`);
  }

  function inventoryBody(){
    return tiles([
      {tl:"Unverified physical files", tv:F(INVENTORY.unverified),
       tn:PCTS(INVENTORY.unverified, PHYSICAL_FILES) + " of holdings", cls:"warn"},
      {tl:"Missing files", tv:F(INVENTORY.missing),
       tn:"Registered but not found at the last verification", cls:"bad"},
      {tl:"Files due for inventory verification", tv:F(INVENTORY.dueForVerification),
       tn:"Verification cycle has come round", cls:"warn"},
      {tl:"Files scheduled for transfer", tv:F(INVENTORY.scheduledTransfer),
       tn:"Transfer agreed, not yet moved"},
      {tl:"Physical records overdue for transfer", tv:F(INVENTORY.overdueTransfer),
       tn:"Past the agreed transfer date", cls:"bad"}
    ]) +
    barList([
      {label:"Verified and located", value:PHYSICAL_FILES - INVENTORY.unverified - INVENTORY.missing, color:"var(--green)"},
      {label:"Unverified", value:INVENTORY.unverified, color:"var(--amber)"},
      {label:"Missing", value:INVENTORY.missing, color:"var(--red)"}
    ], {max:PHYSICAL_FILES, showShare:true}) +
    note(`<b>Missing is a subset of what has been checked, not of what exists.</b> A file can only be declared missing if somebody looked for it, so the missing count rises as verification coverage rises. Read it alongside the unverified count: ${F(INVENTORY.missing)} missing out of ${F(PHYSICAL_FILES - INVENTORY.unverified)} verified is the honest ratio.`);
  }

  function locationsBody(){
    const rows = PHYSICAL_BY_LOCATION.map(l => {
      const fac = FACILITIES.filter(f => f.loc === l.label);
      return {
        label:l.label, files:l.value, color:l.color,
        facilities:fac.length,
        boxes:fac.reduce((a, f) => a + f.boxes, 0),
        capacity:fac.reduce((a, f) => a + f.capacity, 0)
      };
    });
    return table([
      {k:"label", t:"Location", cell:r => `<b>${r.label}</b><small>${r.facilities} facilit${r.facilities === 1 ? "y" : "ies"}</small>`},
      {k:"files", t:"Physical files", num:true, fmt:F},
      {k:"share", t:"Share of holdings", num:true, cell:r => PCTS(r.files, PHYSICAL_FILES)},
      {k:"boxes", t:"Boxes", num:true, fmt:F},
      {k:"capacity", t:"Box capacity", num:true, fmt:F},
      {k:"util", t:"Utilisation", num:true, cell:r => {
        const u = PCT(r.boxes, r.capacity);
        return `<span class="pill ${u >= 90 ? "bad" : u >= 75 ? "warn" : "ok"}">${F1(u)}%</span>`;
      }}
    ], rows) +
    barList(rows.map(r => ({label:r.label, sub:F(r.boxes) + " boxes of " + F(r.capacity), value:r.files, color:r.color})),
      {showShare:true});
  }

  const html = `<section class="dash-ah">
    ${band("Records and archives holdings", `The physical estate. Paper files, boxes and the buildings that hold them, plus the inventory health measures that say whether the register can be trusted. This dashboard has no SharePoint content in it at all: its system of record is Opus, and until Opus is connected every figure here is a placeholder.`)}
    <div id="ah-kpis"></div>
    <div id="ah-hold"></div>
    <div id="ah-fac"></div>
    <div id="ah-inv"></div>
    <div id="ah-loc"></div>
  </section>`;

  function init(){
    document.getElementById("ah-kpis").innerHTML = kpis([
      {lab:"Total physical files", val:F(PHYSICAL_FILES), tier:"opus"},
      {lab:"Total legacy records", val:F(PHYSICAL_LEGACY), tier:"opus"},
      {lab:"Total boxes", val:F(PHYSICAL_BOXES), tier:"opus"},
      {lab:"Total storage locations", val:F(FACILITIES.length), tier:"opus"},
      {lab:"Records awaiting transfer", val:F(INVENTORY.scheduledTransfer), tier:"opus"},
      {lab:"Missing files", val:F(INVENTORY.missing), tier:"opus"}
    ]);

    document.getElementById("ah-hold").outerHTML = panel({
      id:"ah-hold",
      title:"Physical records holdings",
      sub:"What the bank holds on paper, and where it sits.",
      tier:"opus", body:holdingsBody()
    });

    renderFac();

    document.getElementById("ah-inv").outerHTML = panel({
      id:"ah-inv",
      title:"Inventory health",
      sub:"Whether the physical register matches the physical shelf.",
      tier:"opus", body:inventoryBody()
    });

    document.getElementById("ah-loc").outerHTML = panel({
      id:"ah-loc",
      title:"Storage location dashboard",
      sub:"HQ storage, field offices, offsite storage and the records center, side by side.",
      tier:"opus", body:locationsBody()
    });
  }

  function renderFac(){
    document.getElementById("ah-fac").outerHTML = panel({
      id:"ah-fac",
      title:"Records by storage facility",
      sub:"Every facility, its holdings, and how close it is to full.",
      tier:"opus", body:facilitiesBody()
    });
    wireSort("#ah-fac", k => {
      if (facSort === k) facDir = facDir === "desc" ? "asc" : "desc"; else { facSort = k; facDir = "desc"; }
      renderFac();
    });
  }

  return {
    ver:"Archives holdings",
    crumb:"Records and archives holdings",
    asof:ASOF.opus,
    html, init
  };
})();
