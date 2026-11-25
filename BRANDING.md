# ADB branding: colours and fonts

Read this before any change to colours, fonts or styling of the EDRMS Utilization
Report (the SharePoint web part and the Floot app). Applied in web part 1.0.79,
25 Nov 2026. The two must stay identical.

Source: ADB Branding Toolkit, Section 05 (Color) and Section 08 (Digital Media,
Digital Presentations):
https://rksi.adb.org/wp-content/uploads/2023/11/Branding_Tool_Kit_FA_27_FEB_14_WEB.pdf

## What is verified and what is not

- **ADB Blue #002569, RGB(0, 37, 105)** is the official primary corporate colour.
  It is stated in the toolkit.
- The supporting palette below came from Copilot, which called it "a practical
  ADB-aligned palette". **It has not been checked against the PDF.** Confirm it
  against Section 05 before presenting it to the client as official ADB colours.

## Fonts

| Use | Toolkit | What the report uses |
| --- | --- | --- |
| Headlines, titles, headings | Trade Gothic LT Std (Bold, Condensed, Regular) | Arial |
| Long body text, print | ITC Garamond Std | Not used |
| Office and digital, when the corporate fonts are missing | Arial, Calibri | Arial |

Trade Gothic is a paid font and is not installed in SharePoint or on most ADB
machines. That is why the report uses Arial everywhere:
`Arial, "Helvetica Neue", Helvetica, sans-serif`.

## Palette

| Purpose | Hex | Status |
| --- | --- | --- |
| Primary Blue (ADB Blue) | #002569 | Official |
| Dark Blue | #001B4D | Unverified |
| Medium Blue | #004990 | Unverified |
| Light Blue | #5B8CC1 | Unverified |
| Pale Blue | #D9E6F5 | Unverified |
| White | #FFFFFF | |
| Dark Gray | #4D4D4D | Unverified |
| Light Gray | #E6E6E6 | Unverified |

Guidance from the same source:
- ADB Blue should be the dominant colour.
- Medium Blue is the accent.
- Use white backgrounds with generous whitespace.
- Use flat, monochrome blue icons.
- Use the blue palette for positive callouts, and avoid bright greens except in
  charts.
- Accent colours are allowed in charts and infographics.

## How the report maps it (from 1.0.79)

| Element | Colour |
| --- | --- |
| Sidebar | #002569 |
| Filter panels, "Filtered results" bar, breakdown table headers | #004990 |
| Department bars, Select all bar | #004990 |
| Office bars in the department filter, Select all hover | #002569 |
| Card and result-box borders (was #0E3A52) | #001B4D |
| Page background, site rows in the filters | #D9E6F5 |
| Row hover in the filters | #BFD3EC |
| "Data as of" status dot (was green) | #5B8CC1 |
| Documents series in the graph | #004990 |
| Records series in the graph (allowed chart accent) | Orange #ED7D31, kept |
| Selected card and selected buttons (cue for what is selected) | Yellow #FFC000, kept |
| Main text | #10243E, kept |

Kept on purpose, by the requester's choice of 25 Nov 2026:
- The yellow selected highlight. If the client wants blue only, the agreed
  alternative is a white card with a thick #002569 border.
- The orange Records series.

## Colours that were replaced

Do not reintroduce these:
- #194F8E, now #002569
- #185E85 and #1B5E80, now #004990
- #0E3A52, now #001B4D
- #C3E4F3, now #D9E6F5
- #A9D6EE, now #BFD3EC

## Where the colours live in the code

The same names apply in the web part source and in Floot.
- `floot/components/EdrmsReportApp.tsx`:
  - `SIDE_CSS` holds the Arial font, the sidebar colour and the status dot.
  - The root style sets the background.
- `EdrmsBankWide.tsx`, `EdrmsFilteredResults.tsx` and `EdrmsDocumentsView.tsx`
  hold the panels, tables, filters and chart series.
- `components/Report.module.scss` holds base styles that are still the older
  values. They are overridden by the components above, so check there too when
  changing a colour.

## Sidebar icons (1.0.80)

Solid, flat, single-colour icons (filled shapes, cut-outs by evenodd), as the requester's reference of 25 Nov 2026: target (Bank-wide Oversight), 2x2 tiles (Department Insights), stepped bars (Project Insights), indented list (Institutional File Plan), filled clock (Retention & Disposal), archive box (Records & Archive Holdings). Defined in `ICONS` in `floot/components/EdrmsReportApp.tsx`, same in Floot.
