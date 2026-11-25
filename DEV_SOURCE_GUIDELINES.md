# Building on the developers' source code

Set by the requester, 25 Nov 2026. Read this before porting the report into the
developers' source code, or changing it once it is there.

The developers' source code (the version uploaded to the sandpit environment and
shown to the client) was received on 25 Nov 2026. It is kept in the requester's
Google Drive (perezfiles01@gmail.com), as `UtilizationReport 1.zip`, Drive file id
`1nl_cqrO09NCSSFDz79nOyDpwXWTQOkQ5`.

- **Never commit it to this repository.** The repository is public.
- To fetch it, use the Drive connector. For a large file, ask the requester for a
  read-only Drive token through the secure credential form, then download it with
  the Drive API (`alt=media`) and unpack it without `node_modules`.

Treat it as the reference for structure and style. The plan for porting the
current design into it is **`PORT_PLAN.md`**.

## Rules

1. **Match their structure exactly.** Use the same folders, file names, layering,
   naming conventions, import style and component patterns as the developers'
   source. Do not bring in the Floot or web part 1.0.x structure.
2. **Match their code formatting.** Use their indentation, quotes, semicolons and
   line length, and their linter or Prettier config if one is included. The result
   should read as if the developers wrote it.
3. **Use Fluent UI for charts and tables where it can be done.** Prefer Fluent UI
   components (for example DetailsList for tables, and Fluent UI charting for
   charts) over hand-drawn SVG or HTML tables. Use custom drawing only where Fluent
   UI cannot produce the required visual, and say so.
4. **Reuse components.** Before writing a new component, check whether theirs, or
   one already written, can be reused. If a pattern repeats (cards, filters, tree
   tables, breadcrumb), make it one shared component and reuse it.
5. **Keep all mock data in one file.** The entire report draws every sample figure
   from a single mock data file. Do not scatter sample values across components.
6. **Keep the ADB branding.** Follow `BRANDING.md` for colours, fonts and icons.
7. **Leave no trace of AI.** Comments, file notes, commit text and hand-over
   notes in the developers' code read as the developers' own work. They contain
   no mention of AI or of any assistant, and no generated-by footers.
8. **Ask before changing anything,** per the requester's standing instruction, and
   show a mockup or before/after when the change is visual.

## Features to carry over from the current design (Bank-wide Oversight)

`STATUS.md` and the commit history hold the details. In summary:
- the slim header
- the five KPI cards with full numbers
- the overview filters and the graph that fits the screen
- the breakdowns: tree tables, a breadcrumb back to the overview, and titles that
  match the cards
- the department tree filter with Select all
- the address that carries the view and filters (shareable links)
- the segmented Import data panel
- the smooth sidebar, the one-screen layout and proportional scaling


## Picking up the work in a new session

The working copy lives only in a session's scratch space, so a new session starts
from the latest delivered zip.

1. **Latest version:** 1.0.0.18. It is in the requester's Google Drive as
   `UtilizationReport-src.zip` (Drive file id `1jcRXwbUPPm5y6C01eB1W0XeA-6FHe-es`).
   The built package is `edrms-utilization-report.sppkg` (id `1ekaWtzaSsUpCz6kECUlXzrUa_JqoMtKf`).
   Older copies are titled "(old)".
2. **Fetch it:** download it with the Drive connector. If that is too large, ask the
   requester for a read-only Drive token through the secure credential form (OAuth
   Playground, scope `drive.readonly`) and download with the Drive API (`alt=media`).
3. **Install:** the lock file points at AvePoint's private registry, which is not
   reachable from here. Install with
   `npm install --package-lock=false --registry=https://registry.npmjs.org/`.
   Do not edit their lock file.
4. **Build:** `npm run build` must give 0 errors and no more than 316 lint warnings
   (all 316 are in the developers' original code).
5. **Formatting:** match the developers' formatting exactly.
   - All files use Windows (CRLF) line endings.
   - Components and SCSS: Prettier with `--single-quote --end-of-line crlf`.
   - Some files use `--end-of-line crlf --trailing-comma es5` instead. Check which
     style the original file already passes and keep it.
   - Never rewrite a file through a tool that turns CRLF into LF.
6. **Browser check:** render it in a browser before delivering. The scripts are in
   `tools/report-harness/` (see `REPORT_HANDOFF.txt`, B4). Bundle `lib/` with
   esbuild, with these settings:
   - Point `*.module.scss` imports at their compiled `.css` and load them as local CSS.
   - Alias `@fluentui/react-charting` to its `lib-commonjs` build.
   - Use `mainFields` browser, module, main.

   Render `EdrmsUtilizationReport` with `MockReportService`, and check every card,
   every breakdown, shareable links and the sidebar.
7. **Deliver:**
   - Raise the solution version in `config/package-solution.json`.
   - Update `CHANGES.md`.
   - Zip without `node_modules`, the build folders or `.git`.
   - Upload both files to Drive, rename the previous ones "(old)", and send them to
     the requester.
8. **No trace of AI,** and ask before changing anything.
