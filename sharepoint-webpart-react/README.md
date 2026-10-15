# EDRMS Utilization Report: SharePoint web part (React + Fluent UI)

The approved EDRMS Utilization Report (Bank-wide Oversight and Department
Insights) rebuilt as an SPFx 1.23 web part in **React 17 with Fluent UI 8**,
so it can be maintained as normal components rather than one HTML file.

It matches the approved version screen for screen. Every colour, font size
and spacing value in `Report.module.scss` was measured from the approved web
part as it renders in SharePoint, and it shows the same sample figures, so
any difference can be checked number for number.

## Install (no build needed)

1. Upload `sharepoint/solution/edrms-utilization-report-react.sppkg` to the
   App Catalog and choose **Enable this app and add it to all sites**.
2. Edit a page, add a **Full-width section**, add **EDRMS Utilization Report
   (React)**, then Republish.
3. Web part settings: **Dashboard on this page**, **Show the report's own
   sidebar**, **Text size** (Large by default, as readers are often older).

It has its own solution and web part IDs, so it can sit beside the existing
"Util sample" web part while the two are compared.

## Build

Node 22 (22.14 or later).

```
npm ci
npm run build
```

Output: `sharepoint/solution/edrms-utilization-report-react.sppkg`.
Bump `version` in `config/package-solution.json` before uploading over an
earlier build.

## Where things are

```
src/webparts/edrmsReport/
  EdrmsReportWebPart.ts        web part entry and property pane
  components/
    ReportApp.tsx              sidebar, dashboard switching, Export to PDF
    Report.module.scss         the whole look (measured from the approved version)
    ui.tsx                     band, panel, KPI cards, (i) tooltips, search,
                               segmented buttons, pager, Export table button
    DataTable.tsx              sortable, paged table used everywhere
    DeptFilter.tsx             the Filter button (department checklist, Apply/Reset)
    charts.tsx                 bar list, column chart, column + running total
                               chart, donut (plain SVG)
  dashboards/
    BankWide.tsx               Bank-wide Oversight: 4 cards and their breakdowns,
                               physical counterparts, comparison, declaration trend
    DepartmentInsights.tsx     Department Insights: department and site pickers,
                               5 cards and their breakdowns, library usage
  lib/
    data.ts                    data types, loadReportData(), derived figures
    exporters.ts               Excel (xlsx-js-style) and PDF (html2canvas + jsPDF)
    format.ts                  number formatting, axis rounding
  data/sampleData.json         the approved prototype's sample figures
```

## Connecting the real data

Everything on screen is read through `IReportData` in `lib/data.ts`.
Today `loadReportData()` returns `data/sampleData.json`. To connect the
reporting database, replace that function with a call to the API that
returns the same shapes (`IDept`, `ISite`, `ILibrary`, `ITrend`, `ITotals`).
No component needs to change.

A few figures are **sample formulas** in `lib/data.ts` until a source exists:
training completion, internal/external visitor split, site created date,
library folders and active users, and the monthly documents history. Each
is one function to replace.

## Why the charts are SVG rather than Fluent UI charts

Fluent UI is used for the controls (drop-downs, tooltips, the filter
pop-up, check boxes). The charts are small SVG components because Fluent
UI's chart package cannot reproduce the approved charts exactly: the
records trend uses bars with a running total on a second axis, the Top 10
lists select rows in the table beside them, and the comparison uses two
independently scaled bar columns. Each chart is one component in
`charts.tsx` (about 40 lines each) and maps to a native Power BI visual.

## Checks run before release

- `npm run build`: lint and TypeScript clean.
- Browser test (Playwright, Chromium): both dashboards and all nine
  breakdowns draw with no script errors; search, Filter, paging, sorting,
  department links into Department Insights, the site picker, chart
  selection and "+N more" ties, Year/Month drill-downs, Export table (.xlsx)
  and Export to PDF all work.
- Figures checked against the approved version: 1,032 sites, 11,800
  headcount, 9,420 active, 2,380 no access, 9,405 trained (80.0%),
  3.47M documents, 1,562,850 new documents, 1,188 GB, 21,646 records,
  0.62% declaration rate, 3,186 declaring users, 3,830 counterparts (17.7%),
  17,240 visitors (15,742 internal), 1,600 libraries, 82,006 folders.

Not yet checked inside a SharePoint tenant.
