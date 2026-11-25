# Plan: Bank-wide Oversight in the developers' source code

Status: **approved 25 Nov 2026. Phase 1 done (their code builds, 0 errors, 316 existing lint warnings, no tests). Phase 2 done (colour tokens and Arial; SectionBand compact; Breadcrumb; DepartmentTreeFilter; useLinkedState; Table tree mode, fixed body height and hidden footer; DropdownField tickAll). Phase 3 done (all mock data in services/mock/reportMockData.ts; report renders pixel-identical). Phase 4 done (overview with filters, results and Fluent grouped bar chart; five cards with full numbers; breadcrumb breakdowns with tree tables, tree filter, result tiles and totals that reconcile with the cards; Comparison, Trend and Physical sections removed from the overview; shareable links). Phase 5 done (fits the window below the host header with proportional scaling at any size, no page scroll; chart and tables fill the remaining space; solid sidebar icons, labels do not wrap; light blue department list; Import data segmented with People and training, shown to site owners only). Phase 6 done: version 1.0.0.4, full build passes (0 errors, 316 existing warnings), 24 browser checks pass, CHANGES.md added. Delivered to Drive: UtilizationReport-src.zip (id 1DuWfciVw18nE-FWMzte_JkgciSIfbJeB) and edrms-utilization-report.sppkg (id 1xjZt497GKJSrvHRDI3Oqj1EKEn5nTcbS). Work copy and a harness live in the session scratchpad only.**

Decisions (the recommendations, accepted by the requester):
1. The Physical counterparts section is removed from the overview, to match the
   current design.
2. The tree tables extend the developers' own `Table`.
3. The mock data is kept in full, in the one file.
4. Their SPFx 1.24 and React 18 are kept.
5. Hand-over is a zip and the `.sppkg`, with a list of the changes.

**Authorship rule (the requester's):** the result must read as the developers' own
work. Comments, file notes, commit text, change lists and generated files carry
no mention of AI or of any assistant, and no generated-by footers. Code comments
follow the developers' existing style.

Read `DEV_SOURCE_GUIDELINES.md` (the rules) and `BRANDING.md` (colours, fonts and
icons) alongside this.

## 1. The developers' code, as received

- **Where it is:** Google Drive of perezfiles01@gmail.com, file
  `UtilizationReport 1.zip` (274 MB with `node_modules`). Drive file id
  `1nl_cqrO09NCSSFDz79nOyDpwXWTQOkQ5`.
  - It is **not** in this GitHub repository, because the repository is public.
  - Unpacked without `node_modules` and the build folders, it is 198 files,
    5.4 MB.
- **Stack:**
  - SharePoint Framework 1.24 (rc) and Heft
  - React 18.3, TypeScript 5.8
  - ESLint 9 with the SPFx React profile, and no Prettier config
  - Node 22.19
- **Fluent UI is already in use:**
  - `@fluentui/react` v8: Callout, Panel, TooltipHost
  - `@fluentui/react-charting`: DonutChart, bar charts in `shared/charts/ValueBar`
    and the trend section
  - `@fluentui/react-icons`
  - `@fluentui/react-components` v9 is installed
- **Layout of `src/webparts/edrmsUtilizationReport/`:**

| Folder | Holds |
| --- | --- |
| `EdrmsUtilizationReportWebPart.ts`, `components/EdrmsUtilizationReport.tsx` | Entry point and the report shell |
| `components/layout/` | `ReportSidebar`, `MainContent` |
| `components/dashboards/BankWide/` | `BankWideContent`, `logic/createBankWideEngine`, and `components/` (KPI cards, the drilldowns for Sites, Users, Documents and Records, the drill panel, the unit table, comparison, trend, physical counterparts) |
| `components/dashboards/Department/` | Department Insights |
| `components/sections/BankWide/` | The page sections: Overview (band, KPI cards and drilldown), Comparison, Declaration Trend, Physical Counterparts |
| `components/shared/` | `SectionBand`, `Table`, `DropdownField`, `SegmentedControl`, `ImportPanel`, `charts/`, `behavior/` (DOM helpers such as PDF and table export and the custom select), `ReportErrorBoundary` |
| `hooks/` | `useReportData`, `useSidebarState`, `useReportTools`, `useReportBehavior`, `useReportCanvas` |
| `services/` | `MockReportService` (behind `IReportService`), `BankWideReportService`, `ReportServiceError`, `mock/` |
| `IOC/` | `ReportContainer` (swaps the mock for a real API service), `createDashboardEngine` |
| `models/` | `IBankWideData`, `IBaseData`, `IReportService`, `IDashboardEngine`, `ReportTypes` |
| `constants/` | `BankWideEnum` (the card keys) |
| `styles/` | 28 numbered partials, `_00-shell-shared` to `_27-sharepoint-layout` |
| `utils/` | `baMath`, `downloadFile`, `syncReportBreakpoints`, `createReportEnvironment` |

  There is also `src/Common/` (fetch service, config, message component) and
  `src/Services/` (a base service for the Bank-wide API).
- **Mock data today is spread across 9 files:**
  - `createBaseMock` (781 lines)
  - `createBankWideMock` (541)
  - `createDepartmentMock` (579)
  - `departmentProfileFilterData` (9,301)
  - six `generators/`
- **Code style to copy:**
  - two-space indent, single quotes in components, semicolons, trailing commas
  - `I`-prefixed interfaces
  - a folder per component with `index.ts` and `*.module.scss`
  - JSDoc one-line summaries
  - `React.memo` for content components

## 2. What changes: current design → their code

Each line keeps their folder and naming. "Reuse" means their existing component is
kept and extended rather than replaced.

| # | Feature in the approved design (web part 1.0.80 / Floot) | Where it goes in their code | How |
| --- | --- | --- | --- |
| 1 | Slim header: title with an (i) for the description, Data as of, Import data, Export | `shared/SectionBand` | Reuse. Add a `slim` prop and move the description into a Fluent `TooltipHost`. |
| 2 | Five KPI cards with full numbers (no "54k"); compact row while a breakdown is open | `dashboards/BankWide/components/BankWideKpiCards` | Reuse. Format with full thousands; add the compact state. |
| 3 | Breadcrumb "Bank-wide Overview › {card}" as the only way back; clicking the open card no longer goes back | New `shared/Breadcrumb` (reusable), used in `BankWideDrillPanel` | New shared component. Remove the toggle-back in `BankWideContent.handleSelectKpi`. |
| 4 | Breakdown titles match the card names | `BankWideDrillPanel` and the drilldowns | Titles taken from one map in `constants/BankWideEnum`. |
| 5 | Tree tables: Department → office → site (Sites, Documents, Records, Physical); Department → office (Users) | `shared/Table` | Reuse. Add an optional tree mode (expandable rows, level indent, totals row) so every drilldown uses one table. If their `Table` cannot carry it cleanly, use Fluent `DetailsList` with groups instead (to decide in phase 2). |
| 6 | Department tree filter: dark department bars, office bars, light site rows, search, Select all that unticks everything, chips for part-ticked departments | New `shared/DepartmentTreeFilter` (reusable) on Fluent `Callout`, the same base as their `DropdownField` | New shared component, used by all five breakdowns. |
| 7 | Overview department filter with Select all, same colours, departments only | `shared/DropdownField` | Reuse. Add multi-select with Select all. |
| 8 | Overview filters (Display, Show # Months, Count by, View, Report type) and the graph that fills the rest of the screen | `sections/BankWide/BankWideOverviewSection` with `shared/SegmentedControl`; chart in `shared/charts` | Reuse SegmentedControl. Chart on `@fluentui/react-charting` (GroupedVerticalBarChart), height fitted to the space left. |
| 9 | Removed sections: Comparison, Records declaration trend, the bar charts beside the tables, "Sites by department / office / RM / RO" | `BankWideContent` | Stop rendering them. The files are kept, unused, as in the current design, so they can come back. |
| 10 | Physical counterparts section | `BankWideContent` | **To confirm:** the current design has no separate physical section on the overview (Physical is a card and breakdown). |
| 11 | One-screen layout: the report fills the screen below the SharePoint header, scales with the window (laptop proportions on any monitor), no page scroll, tables scroll inside their box | `hooks/useReportCanvas` with `utils/syncReportBreakpoints` | Reuse their canvas hook; add the fit logic (start position, zoom by height and width, refit after SharePoint lays out). |
| 12 | Smooth sidebar: labels fade, no wrap, no text highlight, one refit at the end | `layout/ReportSidebar`, `hooks/useSidebarState` | Reuse. |
| 13 | Solid sidebar icons | `layout/ReportSidebar` | Use Fluent `@fluentui/react-icons` Filled icons where one matches (Target, Grid, ChartMultiple, TextBulletList, Clock, Archive); else the current SVGs. |
| 14 | Shareable links: the address holds the open view and every filter; an invalid link opens the default view | New `hooks/useLinkedState` (reusable) | New hook, used in place of `useState` for each filter. |
| 15 | Import data, segmented, with one section "People and training"; Owners only; no sign-in | `shared/ImportPanel` (Fluent `Panel`) | Reuse. Add sections and the People and training template, check and history. Permission check from the web part context. |
| 16 | ADB branding: ADB Blue sidebar, Medium Blue panels and headers, Pale Blue background, Arial, blue status dot; yellow selected highlight and orange Records kept | `styles/_00-shell-shared.scss` and the partials | One set of SCSS variables (colour tokens) at the top of `_00-shell-shared`, used everywhere. No hex values scattered in components. |
| 17 | Labels: "Active Users", "Inactive Users" (180 days only in the (i)) | Users drilldown | Text change. |
| 18 | Site list (73 sites with Department → Division → Site, Location 1 and 2, as `Utilization_Report_Dropdown.xlsx`) | Mock data (section 3) | Data. |

## 3. Mock data: one file

As instructed, every sample figure for the whole report goes in **one file**:
`services/mock/reportMockData.ts`.
- **What it absorbs:** today's `createBaseMock`, `createBankWideMock`,
  `createDepartmentMock`, `departmentProfileFilterData` and the six generators.
  Plain data and any small generator functions sit together in it.
- **Who reads it:** only `MockReportService`. Components never import it, so
  swapping in the real API service in `IOC/ReportContainer` stays a one-line
  change.
- **The 9,301-line department profile data:** it moves in as it is, unless the
  requester agrees to trim it. See open question 3.

## 4. Order of work

Each phase ends with a working build and a screenshot for the requester, and
nothing moves to the next phase without approval.

1. **Set up.**
   - Unpack and install their dependencies.
   - Confirm `heft build` and `heft test` pass unchanged, as the baseline.
2. **Shared pieces.**
   - Colour tokens and Arial.
   - The new shared components: `Breadcrumb`, `DepartmentTreeFilter`,
     `useLinkedState`.
   - Extend `Table` (tree mode), `SectionBand` (slim) and `DropdownField`
     (Select all).
3. **Mock data.** Merge into `reportMockData.ts`; the report renders as before.
4. **Bank-wide Oversight.** Features 1 to 17, one breakdown at a time: Sites,
   Users, Documents, Records, Physical.
5. **Layout and polish.** One-screen fit, sidebar, icons, Import data.
6. **Checks.**
   - Lint clean, `heft build` and `heft test` pass.
   - A browser test of every card, breakdown, filter, link and the sidebar,
     with no errors.
   - Screenshots against the current design.
   - Package the `.sppkg`.

**Department Insights is not in scope.** The client has not given mockups or the
exact layout and information they want. It stays as the developers have it.

## 5. Delivery

- The ported code is delivered as a zip (and the built `.sppkg`) to the
  requester's Google Drive. It is **not** pushed to the public GitHub repository.
- This plan and the guidelines live in the repository. They contain no
  developer code.

## 6. Open questions for the requester

1. **Physical counterparts section** (feature 10): remove it from the overview to
   match the current design, or keep it?
2. **Tree table** (feature 5): extend their own `Table` (recommended, keeps one
   table everywhere), or switch the breakdowns to Fluent `DetailsList`?
3. **Mock data size:** the department profile data is 9,301 lines. Keep it all in
   the single file, or trim it to the 73 sites the report uses?
4. **Version line:** keep their SPFx 1.24 rc and React 18 (recommended, it is
   their code), rather than our 1.23 and React 17.
5. **Hand-over:** do the developers want the result as a zip, or as a patch
   against their code, so they can see each change?

- 1.0.0.7 (25 Nov 2026): no blank strip below the Bank-wide chart and tables when fitted to the screen.
- 1.0.0.8 (25 Nov 2026): report fits with the space SharePoint shows below it, so the page does not scroll; chart keeps room for its legend so department names are not cut off.
- 1.0.0.9 (25 Nov 2026): when fitted to the window on a site page, the report hides what SharePoint shows below it (other sections, footer, margins) and fills to the bottom of the screen. Chosen by the requester: always, on any page. Restored while editing.
- 1.0.0.10 (25 Nov 2026): Bank-wide cards match the prototype (bold title, figure, View breakdown on its own line); (i) descriptions open below the icon via new shared InfoTip.
- 1.0.0.11 (25 Nov 2026): Bank-wide filter bar matches the prototype (labels beside controls, yellow selection, Report type as multi-select buttons).
- 1.0.0.12 (25 Nov 2026): filter bar keeps its layout when the department list opens; Report type multi-select only when Show # Months is 1; filter text not selectable.
- 1.0.0.13 (25 Nov 2026): at 1 month only Documents, Records and Physical combine; Sites and Users alone; longer periods one type.
- 1.0.0.14 (25 Nov 2026): Filtered results match the prototype (title above, five even boxes, (i) descriptions).
- 1.0.0.15 (25 Nov 2026): chart matches the prototype (legend by title, description, axis titles, round steps, no bar figures); department labels kept straight at the requester's request.
- 1.0.0.16 (25 Nov 2026): cards in the breakdown view match the prototype (title left, figure and (i) right, open card yellow). Drive keeps only the current pair plus the previous version as "(old)"; older ones go to the bin (requester, 25 Nov 2026).
