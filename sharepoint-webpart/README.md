# EDRMS Utilization Report: SharePoint web part

A SharePoint Framework (SPFx 1.23) web part that shows the EDRMS Utilization
Report on a SharePoint page, looking and working exactly as the Floot app and
GitHub Pages do: both dashboards, every drill-down, Export table (Excel) and
Export to PDF.

It packages the report rather than redrawing it. `build-report.js` takes the
repo's `index.html` (the GitHub Pages file, synced from the Floot app) and
moves every inline script, the three export libraries and the ADB logo into
files shipped inside the package, and the web part adds those scripts to the
report itself once its markup has loaded. SharePoint Online's Content Security
Policy blocks script written inside a page and, with `strict-dynamic`, also
any `<script src>` the page's own markup asks for; only scripts added by
already trusted code run. Version 1.0.0.0 used `<script src>` tags and showed
an empty report in the test tenant for that reason.
Nothing is loaded from outside the tenant.

## Install it (no build needed)

The ready package is `EDRMS_Utilization_Report_SharePoint_<date>.sppkg` at the
repo root.

1. **App Catalog.** A SharePoint admin opens the tenant App Catalog
   (SharePoint admin centre, More features, Apps, Open), clicks
   **Upload** and picks the `.sppkg`. On the dialog, tick
   **Enable this app and add it to all sites** if offered, then **Enable**.
   Without tenant admin rights, a site collection app catalog works the same
   way for one site.
2. **Add it to the site** (if it was not added to all sites): on your site,
   gear icon, **Add an app**, choose **EDRMS Utilization Report**.
3. **Put it on a page:** edit the page, add a **Full-width section**, click
   **+**, search for **EDRMS Utilization Report**, add it, then **Republish**.
4. **Height:** edit the web part (pencil icon) and use the slider to set how
   tall it is on the page. Default 900 pixels; the report scrolls inside it.

## Rebuild it after the report changes

Requires Node 22 (22.14 or later).

```
cd sharepoint-webpart
npm ci
npm run build
```

The package is written to `sharepoint/solution/edrms-utilization-report.sppkg`.
Bump `version` in `config/package-solution.json` before uploading a new
build over an old one (currently 1.0.1.0). To build from a different copy of the report, set
`REPORT_SOURCE=/path/to/index.html`.

`build-report.js` refuses to build if any inline script, cdnjs reference or
`floot-assets/` path survives, and it writes every file as plain ASCII so the
page reads the same whatever character set SharePoint serves it with.
