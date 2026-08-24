/* Pull the Records and Archive Holdings figures out of the live prototype.
   The workbook must carry what the dashboard renders, not what a plan said it
   would render, so every number below is computed in the page by the page's
   own split, weights and DATA. */
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'assert') errors.push(m.text()); });
  await page.goto('file://' + process.argv[2]);
  await page.evaluate(() => switchTo('ra'));

  const out = await page.evaluate(() => {
    const split = splitTotal;
    const LOCATIONS = ["Archives Room", "Records Center", "Offsite Storage"];
    const W = {
      storeReq: weights(3,41), boxes: weights(3,42), folders: weights(3,43),
      reqDepts: weights(3,44), reqRms: weights(3,45),
      retrReq: weights(3,46), retrBoxes: weights(3,47), retrFolders: weights(3,48),
      retrPeople: weights(3,49), dispBoxes: weights(3,50), dispFolders: weights(3,51)
    };
    const storeReqL = split(DATA.RA_STORE_REQUESTS, W.storeReq);
    const boxesL = split(DATA.RA_BOXES_STORED, W.boxes);
    const foldersL = split(DATA.RA_FOLDERS_STORED, W.folders);
    const reqDeptsL = split(DATA.RA_REQUESTORS_DEPTS, W.reqDepts);
    const reqRmsL = split(DATA.RA_REQUESTORS_RMS, W.reqRms);
    const retrReqL = split(DATA.RA_RETR_REQUESTS, W.retrReq);
    const retrBoxesL = split(DATA.RA_BOXES_RETRIEVED, W.retrBoxes);
    const retrFoldL = split(DATA.RA_FOLDERS_RETRIEVED, W.retrFolders);
    const retrPeopleL = split(DATA.RA_STAFF, W.retrPeople);
    const dispBoxesL = split(DATA.RA_BOXES_DISPOSED, W.dispBoxes);
    const dispFoldL = split(DATA.RA_FOLDERS_DISPOSED, W.dispFolders);

    const storage = LOCATIONS.map((loc,i)=>({
      location: loc, requests: storeReqL[i], requestors_depts: reqDeptsL[i],
      requestors_rms: reqRmsL[i], boxes: boxesL[i], folders: foldersL[i],
      remarks: ["Active, regular access","High volume transfers","Specialised holdings"][i]
    }));
    const STATUSES = ["Loan","Return to owner","For Disposal"];
    const retrieval = LOCATIONS.map((loc,i)=>{
      const mix = split(retrReqL[i], weights(3, 52+i));
      return { location: loc, requests: retrReqL[i], requestors: retrPeopleL[i],
        boxes_retrieved: retrBoxesL[i], folders_retrieved: retrFoldL[i],
        mix, status: STATUSES.map((s,n)=>`${s} ${mix[n]}`).join(", "),
        boxes_disposed: dispBoxesL[i], folders_disposed: dispFoldL[i],
        remarks: ["Short term use","Completed project","Approved for disposal"][i] };
    });

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthly = (t,s) => split(t, weights(12,s));
    const M = {
      storeReq: monthly(DATA.RA_STORE_REQUESTS,60), retrReq: monthly(DATA.RA_RETR_REQUESTS,61),
      boxesStored: monthly(DATA.RA_BOXES_STORED,62), foldStored: monthly(DATA.RA_FOLDERS_STORED,63),
      boxesRetr: monthly(DATA.RA_BOXES_RETRIEVED,64), foldRetr: monthly(DATA.RA_FOLDERS_RETRIEVED,65)
    };
    const deptOf = (t,s) => split(t, weightsLike(DATA.DEPTS.map(d=>d.rec), s));
    const depts = DATA.DEPTS.map(d=>({code:d.code, name:d.name||""}));
    const storageByDept = deptOf(DATA.RA_BOXES_STORED,66);
    const retrievalByDept = deptOf(DATA.RA_BOXES_RETRIEVED,67);

    const K = ["RA_YEAR","RA_REQUESTS","RA_STORE_ACTS","RA_BOXES_STORED","RA_FOLDERS_STORED",
      "RA_STAFF","RA_RETR_ACTS","RA_ARCHIVED_RETRIEVED","RA_RECORDS_RETRIEVED",
      "RA_STORE_REQUESTS","RA_RETR_REQUESTS","RA_REQUESTORS_DEPTS","RA_REQUESTORS_RMS",
      "RA_BOXES_RETRIEVED","RA_FOLDERS_RETRIEVED","RA_BOXES_DISPOSED","RA_FOLDERS_DISPOSED",
      "RA_PENDING_STORE","RA_PENDING_RETR","RA_AWAITING_TRANSFER","WITH_PHYSICAL"];
    const totals = {}; K.forEach(k => totals[k] = DATA[k]);

    /* The headings as rendered, so the workbook cannot drift from the screen. */
    const headings = [...document.querySelectorAll('.dash-ra .ptitle, .dash-ra .band h2')]
      .map(e => e.textContent.trim());

    return { totals, storage, retrieval, MONTHS, M, depts, storageByDept, retrievalByDept, headings };
  });

  out.errors = errors;
  fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
  console.log(errors.length ? 'ERRORS: ' + errors.join('\n') : 'clean');
  await browser.close();
})();
