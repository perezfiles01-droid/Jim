# Design system

Contents:
1. Colour tokens
2. Typography and spacing
3. Shared shell components
4. Per-dashboard components (and the collision list)
5. Component to Power BI visual mapping
6. Adding a new visual

---

## 1. Colour tokens

Declared once in `:root`. Use the variable, never a raw hex, except where an
existing rule already hardcodes one.

| Token | Hex | Used for |
| --- | --- | --- |
| `--ink` | `#10243E` | primary text, dark navy |
| `--ink2` | `#33475F` | secondary text |
| `--blue` | `#0072BC` | ADB blue, primary series, active controls, links |
| `--blue-d` | `#005A96` | blue hover |
| `--teal` | `#00A5A8` | second series (with physical counterpart, declared) |
| `--green` | `#5CA943` | active nav marker, site visit bars |
| `--orange` | `#E8763C` | documents series on Records Management |
| `--greyblue` | `#9DB8D2` | third series (without physical counterpart, not declared) |
| `--deepblue` | `#1B5E82` | unique viewers series |
| `--bg` | `#EEF2F6` | page background |
| `--card` | `#fff` | panel and card background |
| `--line` | `#D9E1EA` | borders and rules |
| `--mut` | `#6B7A8C` | muted labels, captions |
| `--nav` | `#0E1F35` | sidebar background |
| `--nav-hi` | `#16304F` | sidebar active row |

Supporting values that appear inline: `#F3F7FB` and `#EEF3F8` for empty bar
tracks, `#CFE0F2` for light data-bar fills and highlighted tile borders,
`#E9F0F7` / `#DAE5F0` for the section band, `#F6F9FC` / `#E4EBF3` for stat
tiles, `#FDF7F0` / `#EAD9C8` for the date range chip, and
`#FDF9EF` / `#EFE0BD` / `#E8A317` for the amber note.

Treemap shading interpolates a single hue from `rgb(156,195,236)` (fewest) to
`rgb(8,52,90)` (most). Text flips to dark below 42 percent of the scale so it
stays readable on pale blocks.

## 2. Typography and spacing

- Body font: `"Segoe UI", system-ui, -apple-system, Arial, sans-serif`
- Headings, panel titles, breadcrumb: `Georgia, serif`
- Base size 14px. KPI value 30px bold. Panel title 16px. Captions 11 to 12.5px.
- Numbers use `font-variant-numeric: tabular-nums` so columns align.
- Panels: 12px radius, 1px `--line` border, soft two-layer shadow, 18px by 20px
  padding, 26px bottom margin.
- Bars and rows are 26px tall throughout. Keep new bars at 26px.

## 3. Shared shell components

Global, used by every dashboard. Do not scope these and do not redefine them.

| Class | What it is |
| --- | --- |
| `#side`, `.brand`, `nav`, `.grp` | left sidebar and nav groups |
| `nav a`, `nav a.on`, `nav a.dis` | nav rows: live, active, not yet built |
| `header`, `.crumb`, `.spacer`, `#asof` | top bar, breadcrumb, data-as-of line |
| `section` | 20px 22px 46px page padding |
| `.band`, `.band h2`, `.band .bd` | pale blue section introduction block |
| `.kpi`, `.lab`, `.val`, `.tap` | KPI card, its label, number, and hint line |
| `.panel`, `.ptitle`, `.psub` | white content panel with title and subtitle |
| `.pager`, `.pinfo`, `.pbtns` | pagination row |
| `.muted` | italic grey caption |

## 4. Per-dashboard components, and the collision list

**These class names exist in more than one dashboard with different values.
Always define them inside a `.dash-<key>` block, never globally:**

`.kpis` (column widths and breakpoint differ), `.drange` and its date inputs
(display and padding differ), `.resetbtn` (padding differs), `.legend` (gap and
margin differ), `.toolbar` (gap and margin differ), `select` (padding differs),
and above all `.sbar`, whose grid columns differ *and* whose `.seg.e` / `.seg.p`
colours are inverted between Sites and Libraries and Records Management.

Component inventory by dashboard:

**Sites and Libraries (`.dash-sl`)**
- `.tilesrow` wrapping `.tiles` (left) and `.stfilter` (right): the summary tile
  pair with the date range pushed to the panel's right edge
- `.tile`, `.tile.hi`: summary tiles, `.hi` for the in-range one
- `.sortwrap`, `.sortctl`, `.segctl`, `.dirbtn`: sort field picker plus a
  highest/lowest toggle
- `.sbar` with `.seg.e` teal (declared) over `.seg.p` grey-blue (not declared)
- `.sbar .single`: single blue bar for storage
- `.tmlegend`: the fewer-to-more treemap scale
- SVG treemap drawn by a squarified layout, 900 by 400 viewBox

**Records Management (`.dash-rm`)**
- `.drill`: clickable breadcrumb across department, division, site, library
- `.daterow`: breadcrumb left, date range and Reset right
- `.subtotal`: range summary, shown only while a range is applied
- `.sbar` with `.seg.e` grey-blue (without physical) and `.seg.p` teal (with
  physical), values printed inside the segments
- `.cbar`, `.cbar.act`, `.colhead`: single-bar rows with an optional third
  column, plus a column header strip
- `.dayf`: 7 / 30 / 90 day window buttons
- `.statrow`, `.stat`: small stat tiles
- `.note`: amber callout for a caveat

**Format and Storage (`.dash-fs`)**
- `.ftab` holding `.fhead`, `.frow`, `.ftot`, sharing one `--fc` column template
- `.fcell` with an absolutely positioned `.fbar` behind a right-aligned number:
  an in-cell data bar scaled to that column's own maximum
- `.fhead .num.on`: the column matching the active sort, highlighted blue
- `.rbar`: label, track, value with count and share

## 5. Component to Power BI visual mapping

The prototype is a specification for Power BI, so every visual needs a native
equivalent. Use this table before designing anything new. If a proposed visual
has no entry here and no obvious native equivalent, propose the closest native
visual rather than building something Power BI cannot deliver.

| Prototype component | Power BI equivalent |
| --- | --- |
| KPI card (`.kpi`) | Card visual, or Multi-row card for a group |
| Summary tile (`.tile`, `.stat`) | Card visual |
| Stacked two-series bar (`.sbar`) | Stacked bar chart |
| Single bar row (`.cbar`, `.rbar`) | Clustered bar chart |
| Treemap | Treemap visual |
| Table with in-cell data bars (`.ftab`) | Table or Matrix with conditional formatting, Data bars |
| Totals row (`.ftot`) | Table visual totals row |
| Column header highlight on active sort | Table sort state, native |
| Drill from department to division to site to library | Hierarchy on the axis with drill-down, or drill-through pages |
| Breadcrumb (`.drill`) | Native drill header, or a card bound to selected values |
| Date range with two inputs (`.drange`) | Between date slicer |
| Reset filter button | Bookmark with Clear all slicers |
| Sort field picker (`.segctl`) | Field parameter, or a bookmark set |
| Highest / lowest toggle (`.dirbtn`) | Sort direction, or a field parameter plus bookmarks |
| 7 / 30 / 90 day buttons (`.dayf`) | Single-select slicer, or a field parameter |
| Pagination at 10 rows (`.pager`) | Table visual scrolling, or a Top N filter |
| Left nav (`#side nav`) | Page navigator visual, or bookmark navigator |
| Amber caveat (`.note`) | Text box |
| Section band (`.band`) | Text box, or a shape with a title |

Two things Power BI does *not* do the way the prototype does, worth calling out
when a stakeholder asks: the treemap cannot be paginated (use a Top N filter
instead of pages), and in-cell data bars scale per column automatically rather
than being set explicitly.

## 6. Adding a new visual

1. Find its row in the mapping table. If absent, find the nearest native Power
   BI visual and design toward that.
2. Reuse an existing class if the behaviour matches. A new dashboard that is
   "the same as the others" should mostly be assembling existing components.
3. If you need a new class, define it inside the dashboard's `.dash-<key>` block
   even if nothing else currently uses that name. Scoping costs nothing and
   prevents a future collision.
4. Keep bar and row heights at 26px, radii at 5 to 8px, and transitions in the
   0.5 to 0.6s ease range so motion matches the rest of the suite.
5. Take colours from the token table. If you need another step in a scale, tint
   an existing token rather than introducing a hue.
