# The prototype, as a Figma file

This folder is a Figma plugin. Run it once and it draws the whole EDRMS
Utilization Report prototype into whichever Figma file you have open: six
dashboards as frames, the ADB palette as colour styles, the type scale as text
styles, and the recurring pieces as components.

It runs **in your Figma, under your login**. Nothing is uploaded anywhere and no
credentials are needed by anyone but you.

## Why a plugin and not an API call

Figma's REST API reads files. It has no endpoint that creates a frame. Creating
frames is the Plugin API, and a plugin runs inside the Figma editor on the file
you have open. So this had to be something you run, not something run for you.

## How to run it, exactly

1. Download this whole `figma-plugin` folder to your machine.
2. Open the **Figma desktop app** (this does not work in the browser: importing a
   local plugin needs the desktop app). Open or create the file you want the
   design drawn into.
3. Menu → **Plugins** → **Development** → **Import plugin from manifest…**
4. Choose `figma-plugin/manifest.json`.
5. Menu → **Plugins** → **Development** → **ADB EDRMS Utilization Report**.
6. Wait. It draws about 850 frames and 1,300 text layers, which takes a few
   seconds. A message tells you what it made when it finishes.

You get two pages:

| Page | What is on it |
| --- | --- |
| **EDRMS Report, dashboards** | The six dashboards, left to right in the client's own nav order, each with the navigation rail and the correct row highlighted |
| **EDRMS Report, design system** | 15 colour styles, 17 text styles, 6 components, and a note saying where it all came from |

Running it a second time **replaces** those two pages rather than drawing a
second copy beside the first.

## What is faithful, and what is not

**Faithful.** Every box, fill, border, corner radius, shadow, text string, font
size, weight, colour and position is read off the live render at 1440 wide, not
transcribed by hand. The charts that are SVG in the prototype come through as
**real Figma vectors**, not images, because the plugin hands their markup to
`figma.createNodeFromSvg`.

**Worth knowing.**

- **Bar charts are boxes, because they are boxes in the prototype.** They come
  through as real rectangles, which is what you want, but they are not a Figma
  chart object and nothing recalculates if you drag one.
- **Paged tables show the page that was on screen.** The extractor reads what is
  rendered, and a pager only renders its current page. That is one page of rows
  per table, not all of them.
- **Drill downs and hover states are not there.** They exist only after a click,
  and the extractor captures the resting state of each dashboard.
- **Components are made from the first real instance of each piece**, cloned onto
  the system page. The occurrences on the dashboards are *not* instances of them,
  and that is deliberate: they carry different content and different widths, so
  making them instances would be a fiction.
- **Fonts.** The prototype uses Segoe UI and Georgia. Figma ships Inter, so the
  sans face maps to Inter at the matching weight. Georgia is used if your machine
  has it and falls back to Inter if not, so headings may sit a little differently
  from the live site.

## Regenerating after the prototype changes

The plugin is generated, not written, so it does not go stale by hand:

```bash
node figma-plugin/extract_design.js     # read the live prototype -> design.json
node figma-plugin/build_plugin.js       # design.json + runtime.js -> code.js
node figma-plugin/verify_plugin.js      # run it against a stubbed Figma API
```

Then run the plugin again in Figma. `verify_plugin.js` is not optional: it
executes the whole plugin against a stub that enforces the rules that actually
bite in Figma (fonts loaded before use, characters set after fontName, no
zero-size resize, pages loaded before traversal). A Figma plugin is the worst
place to find a runtime error, because it fails halfway through and leaves a
half drawn page behind.

## Files

| File | What it is |
| --- | --- |
| `manifest.json` | What you import into Figma |
| `code.js` | The plugin. Generated. `design.json` inlined, then `runtime.js` |
| `runtime.js` | The drawing logic, hand written. Edit this, not `code.js` |
| `design.json` | The extracted design: tokens, navigation, six layout trees |
| `extract_design.js` | Reads the rendered prototype into `design.json` |
| `build_plugin.js` | Assembles `code.js` and `manifest.json` |
| `verify_plugin.js` | Runs the plugin against a stubbed Figma API |
