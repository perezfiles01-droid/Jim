/* ===================================================================
   Security and Information Classification

   Spec: 2026.4 Reports Utilization, section 9.
     Access Management        restricted records, confidential records,
                              access requests, external sharing
                              instances, permission exceptions
     Information Classification
                              records with sensitivity labels, records
                              without, records by classification level

   Sensitivity labels, external sharing and permission changes are all
   Microsoft Purview and audit log data, not EDRMS data. That is a
   different connector and, in most tenants, a different owner.
   =================================================================== */
DASHBOARDS.sc = (function(){

  function accessBody(){
    const sensitive = SECURITY.restricted + SECURITY.confidential;
    return tiles([
      {tl:"Restricted records", tv:F(SECURITY.restricted),
       tn:PCTS(SECURITY.restricted, T.records) + " of declared records", cls:"bad"},
      {tl:"Confidential records", tv:F(SECURITY.confidential),
       tn:PCTS(SECURITY.confidential, T.records) + " of declared records", cls:"warn"},
      {tl:"Access requests", tv:F(SECURITY.accessRequests), tn:"Last 90 days"},
      {tl:"External sharing instances", tv:F(SECURITY.externalSharing),
       tn:"Links issued outside the bank", cls:"warn"},
      {tl:"Permission exceptions", tv:F(SECURITY.permissionExceptions),
       tn:"Broken inheritance on a library or item", cls:"bad"}
    ]) +
    `<div class="ptitle" style="margin-top:6px">Where the exposure sits</div>
     <div class="psub" style="margin-bottom:12px">External sharing and permission exceptions matter in proportion to how sensitive the content is. ${F(sensitive)} declared records are restricted or confidential, which is ${PCTS(sensitive, T.records)} of the estate.</div>` +
    barList([
      {label:"Restricted or confidential", sub:"Records needing controlled access", value:sensitive, color:"var(--red)"},
      {label:"Internal or public", sub:"Records with no special access control", value:T.records - sensitive, color:"var(--greyblue)"}
    ], {max:T.records, showShare:true}) +
    note(`<b>External sharing instances are links, not people.</b> One link shared with a consultancy can be opened by an entire team, and the audit log records the link once. Read this number as the count of doors opened, not the count of people who walked through. If the count of external viewers is what the committee wants, that is a separate audit log query and needs to be asked for explicitly.`);
  }

  function classificationBody(){
    return tiles([
      {tl:"Records with sensitivity labels", tv:F(SECURITY.withLabels),
       tn:PCTS(SECURITY.withLabels, T.records) + " of declared records", cls:"hi"},
      {tl:"Records without sensitivity labels", tv:F(SECURITY.withoutLabels),
       tn:PCTS(SECURITY.withoutLabels, T.records) + " of declared records", cls:"bad"}
    ]) +
    donut([
      {label:"Labelled", value:SECURITY.withLabels, color:"var(--green)"},
      {label:"Unlabelled", value:SECURITY.withoutLabels, color:"var(--red)"}
    ], {centre:PCTS(SECURITY.withLabels, T.records), centreLabel:"labelled"}) +
    `<div class="ptitle" style="margin-top:22px">Records by classification level</div>
     <div class="psub" style="margin-bottom:12px">The four levels, across all declared records. This is the same split the Records management dashboard reports under "records declared by classification", read from one place so the two cannot disagree.</div>` +
    barList(CLASSIFICATION.map(c => ({label:c.label, value:c.value, color:c.color})), {showShare:true, narrow:true}) +
    table([
      {k:"label", t:"Classification level"},
      {k:"value", t:"Declared records", num:true, fmt:F},
      {k:"share", t:"Share", num:true, cell:r => PCTS(r.value, T.records)},
      {k:"handling", t:"Handling", cell:r => ({
        "Restricted":  `<span class="pill bad">Named access only, no external sharing</span>`,
        "Confidential":`<span class="pill warn">Bank only, sharing on approval</span>`,
        "Internal":    `<span class="pill info">Bank wide</span>`,
        "Public":      `<span class="pill ok">Cleared for release</span>`
      })[r.label]}
    ], CLASSIFICATION) +
    note(`<b>A sensitivity label and a classification level are not the same field, and conflating them will produce a number nobody can defend.</b> The classification level is EDRMS metadata set at declaration. The sensitivity label is a Microsoft Purview label applied to the file, which can be set by policy, by the author, or automatically. A record can carry a classification of Confidential and no Purview label at all, and ${F(SECURITY.withoutLabels)} of them do. Agree which of the two the committee is asking about before this dashboard is signed off.`);
  }

  const html = `<section class="dash-sc">
    ${band("Security and information classification", `Who can reach the bank's records, and how well the records themselves say how sensitive they are. This is the one dashboard whose data does not come from the EDRMS at all: sensitivity labels, external sharing and permission changes live in Microsoft Purview and the unified audit log.`)}
    <div id="sc-kpis"></div>
    <div id="sc-access"></div>
    <div id="sc-class"></div>
  </section>`;

  function init(){
    document.getElementById("sc-kpis").innerHTML = kpis([
      {lab:"Restricted records", val:F(SECURITY.restricted), tier:"ready"},
      {lab:"Confidential records", val:F(SECURITY.confidential), tier:"ready"},
      {lab:"Access requests", val:F(SECURITY.accessRequests), tier:"purview", sub:"Last 90 days"},
      {lab:"External sharing instances", val:F(SECURITY.externalSharing), tier:"purview"},
      {lab:"Permission exceptions", val:F(SECURITY.permissionExceptions), tier:"purview"},
      {lab:"Records without sensitivity labels", val:F(SECURITY.withoutLabels), tier:"purview"}
    ]);
    document.getElementById("sc-access").outerHTML = panel({
      id:"sc-access",
      title:"Access management",
      sub:"The controlled population, and the events that widen access to it.",
      tier:"purview", body:accessBody()
    });
    document.getElementById("sc-class").outerHTML = panel({
      id:"sc-class",
      title:"Information classification",
      sub:"How much of the record estate declares its own sensitivity.",
      tier:"purview", body:classificationBody()
    });
  }

  return {
    ver:"Security and classification",
    crumb:"Security and information classification",
    asof:ASOF.edrms + " | Purview audit log as of 8 Aug 2026",
    html, init
  };
})();
