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
7. **Ask before changing anything,** per the requester's standing instruction, and
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
