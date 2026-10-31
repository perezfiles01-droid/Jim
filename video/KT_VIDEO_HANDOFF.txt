# KT Video Handoff: how the Release 2026.4 knowledge transfer video was made

Written 14 October 2026. **Read this whole file before making another KT video.**
It records the format, the style, the requester's preferences and every command,
so the next video comes out the same way without re-asking anything.

Deliverable this was built for:
`video/EDRMS_Release2026.4_KT_Video.mp4` (3 min 57 s, 1920x1080, about 21.7 MB).
Final narration: `video/KT_Release2026.4_Script_FINAL.txt`.

---

## 0. Instructions to Claude (read first)

1. Read `CLAUDE.md`, `STATUS.md` and `SESSION_HANDOFF.txt` in the repo root as usual,
   then this file.
2. Work out **which release** the video is for. Do not assume "Release 1". The
   release scope lives in the latest requirements reconfirmation deck
   (for 2026.4 it was `EDRMS_R2026.4_Requirements_Reconfirmation_v2.pptx`).
   Extract its text with python-pptx and build the script from it.
3. Follow the **script rules** in section 2 exactly. They are the requester's own
   corrections, collected one by one.
4. Write the script first and get it approved **before** spending ElevenLabs credits.
   Show it inside a fenced ```text block so it can be copied in one click.
5. Every change is committed, merged to `main` and pushed in the same turn
   (CLAUDE.md rule). Send the finished video with SendUserFile.

## 0a. KT SERIES (from 31 October 2026). READ THIS BEFORE ANYTHING BELOW

Sections 1 onward describe the first (2026.4) video. Where they disagree with this
section, **this section wins**. It holds every ruling the requester has given for
the 5 part series.

### The series

| Part | Topic | State |
| --- | --- | --- |
| 1 | Introduction: ADB, EDRMS, declaring a record in 7 steps, RAC / ITD / AvePoint, releases | Built, `part1/`, `EDRMS_KT_Part1_Introduction.mp4` |
| 2 | The release journey, each release in detail, and what comes next | Next |
| 3 | How a release is delivered, requirements to hypercare (process below) | |
| 4 | Release 2026.4, the Utilization Report (update of the first KT video) | |
| 5 | Files, tools and sites we use | Requester to list the ADB-side sites |

Source for releases and process: the requester's deck "EDRMS Project Update,
October 2026" (80 slides; python-pptx cannot open it, read the slide XML from
the zip directly). Releases: 1.1 Apr 2025, 1.1.1 hotfix, 1.2.1 Nov 2025, 2026.1
Jan 2026 (+2026.1.1 hotfix), 2026.2 Mar 2026, 2026.3 Jun 2026, 2026.3.1 ongoing,
2026.4 Utilization Report PROD 11 Dec 2026, 2026.5 physical records on hold, then
the roadmap (retention label mapping, event triggered declaration, disposition,
site renewal, MAS, project sites parked, RCHI on hold).

Delivery process for Part 3, as corrected against the deck: initial requirements
(RAC) > dev feasibility > Requirement Gathering Workshop (a Discovery Workshop when
there are no initial requirements) > dev assessment > client confirmation
(Requirements Reconfirmation workshop or email) > Product Backlog as ADO user
stories > effort estimation > PBL sign-off > dev kickoff and development >
AvePoint QA and test case write-up > SIT by ADB TCS QA, SIT sign-off > UAT by RAC
(briefing, UAT guide, bug fixing), UAT sign-off > UAT Completion Report > CAB
preparation > PROD deployment > sanity testing by TCS QA > hypercare.

### Voice: Kokoro `am_michael`, free and local, with fixed pronunciations

- `part1/narrate_kokoro.py` voices every beat; `python3 narrate_kokoro.py 0 1 2`
  re-voices only those beats. About 1 minute per beat on CPU, so run it in the
  background. Model and voice come from Hugging Face into `part1/tts/`
  (gitignored): `onnx-community/Kokoro-82M-v1.0-ONNX`, files
  `onnx/model_quantized.onnx` and `voices/am_michael.bin`.
- **`part1/pronounce.py` is mandatory.** Kokoro reads the A in "A D B" and
  "R A C" as a schwa (RAC came out as "RC") and AvePoint as "Ah-vay-point". The
  file voices these from fixed IPA. Requester's rulings:
  - ADB = "Ey-DB": soft Ey, D and B run together, no pause
  - RAC = R-A-C, every letter. QA = Q A with an American "Ey"
  - AvePoint = "Av-Point", never "Avi-point"
  - live (went live / goes live) = "layv"
  Add any new acronym there, then check it with
  `k.tokenizer.phonemize(text, 'en-us')`: the IPA shows exactly what will be said.
  Send the requester a short sample before voicing a whole part.
- Keep acronyms spaced in the script text (`A D B`, `R A C`); the subtitles join them.

### Script rules added for the series

- No "Thanks for watching".
- Keep the opening short and start with a hook. The requester found a calm,
  list-like intro "too long and boring".
- Engaging and plain enough for someone with **zero** knowledge. Use analogies
  (library = filing cabinet, folder = drawer).
- Declaring a record is **7 steps**, in the requester's words: 1 Open the EDRMS
  compliant site, 2 Choose a library and/or folder, 3 Create or upload document,
  4 Make sure the document has a sensitivity label (not needed for audiovisual
  files: images, videos, email files), 5 Physical counterpart, 6 Submit,
  7 Check the records.
- After declaration, explain **only the retention label and the sensitivity
  label**. Retention label depends on the library mapping (5, 7, 10 years or
  permanent). Emails are classified as audiovisual, so their sensitivity label
  is blank, and that is expected. Declared records are locked: cannot be edited
  or deleted. Physical counterpart: Yes = a paper copy exists, No = electronic only.
- No need to blur names in the recordings.

### Screen recordings from the requester

- They upload them as **GitHub release assets** (normal upload caps at 25 MB):
  https://github.com/perezfiles01-droid/Jim/releases/new, any tag. Download with
  curl from `releases/download/<tag>/<file>` into `video/src_clips/` (gitignored).
- Take a frame every 2 s with the timestamp burned in, tile them 3x3, read every
  sheet, and map each script line to source time ranges. Check 0.5 s frames
  where a short message flashes (the success dialog lasted under a second).
- Cut all dead time (loading, mouse wandering, the Windows file picker).
- **Rewrite the script lines to match what is really on screen** (real button
  names, real messages). Flag anything that contradicts the narration rather
  than guess (the "audiovisual" example was an email, which the requester then
  explained).

### Visual rules for recordings (requester, 31 October 2026)

- **Never just play the recording full screen.** Layout for a step: the cut
  recording on the left (1190 px wide), an **animated explainer panel** on the
  right that illustrates what the narrator is saying, and a **7 step tracker**
  across the top with the current step lit and finished steps ticked.
- **Highlight everything the narration names**: a pulsing amber ring plus click
  ripple on what is clicked, a teal box with a label on what is shown (uploaded
  file, success message, lock icon), and a spotlight that dims everything else
  for a column being explained.
- Camera keyframes zoom in and out within a step so the named thing is large.
- Beat format in `part1/beats.json`: `vid: { step, side, segs, keys, hl }`.
  `segs` source time ranges in seconds. `keys` camera keyframes
  `[fraction of beat, centre x, centre y, scale]` in source pixels (1724 x 964).
  `hl` highlights `{ a, b, box: [x1, y1, x2, y2], kind: box | ring | click | spot,
  label }`, shown while the **source** time is between `a` and `b`, so they stay
  locked to the recording however the clip is sped up or slowed down.
  Box positions come from the frame sheets: source px = tile px x 1724 / tile width.
- The release section must not be plain: Part 1 uses a winding road with a
  travelling marker, DELIVERED stamps, a "2025 → 2026" flip, and a small
  animation per release showing what it does.

### Render

```bash
cd /home/user/Jim/video && npm ci        # once per container
HS=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npx remotion still part1/src/index.jsx Part1 part1/out/s.png --frame=1500 --public-dir=part1/public --browser-executable=$HS
npx remotion render part1/src/index.jsx Part1 part1/out/part1_raw.mp4 --public-dir=part1/public --browser-executable=$HS --concurrency=4
ffmpeg -i part1/out/part1_raw.mp4 -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 128k -movflags +faststart EDRMS_KT_Part1_Introduction.mp4
```
The browser path changes between containers: find it with
`find /opt/pw-browsers -name 'chrome-headless-shell'`. The recording must be at
`part1/public/scene5.mp4` (gitignored; re-download it from the `scene5` release).
Render stills first and look at them; a full render takes about 15 minutes.
Commit and merge to main after every step (CLAUDE.md rule, and a stop hook enforces it).

---

## 1. Workflow, in order

| Step | What | Output |
| --- | --- | --- |
| 1 | Read the release deck and STATUS.md for scope | Notes |
| 2 | Draft the script, about 550 words (4 minutes) | Chat, in a ```text block |
| 3 | Revise with the requester until they say "use this as final" | `video/KT_<Release>_Script_FINAL.txt` |
| 4 | Split the script into beats, one per line or paragraph | `video/beats.json` |
| 5 | Build the latest web part and screenshot it | `video/public/bw.png`, `dp.png`, `beats.rects.json` |
| 6 | Voice every beat with ElevenLabs | `video/public/vo/<n>.wav`, `src/beats.gen.json` |
| 7 | Background music | `video/public/music.mp3` |
| 8 | Render with Remotion, check frames, compress | `video/EDRMS_<Release>_KT_Video.mp4` |
| 9 | Commit, merge to main, SendUserFile | |

---

## 2. Script rules (the requester's preferences)

**Length and tone**
- **4 minutes at most.** About 550 words. The first 10 minute draft was rejected
  as too long: "maybe 4 minutes at most to explain simply everything".
- Plain, simple sentences. Explain, do not sell.
- Short paragraphs. Each paragraph becomes one beat on screen.

**Words to use and avoid**
- Say **"department"**, never "unit". Department Insights lets you choose one
  department, several or all of them, so never say "one department at a time".
  Say "for a closer look at the departments you choose".
- Say **"users"**, never "staff". For visitors: "internal users and external guests".
- No vague phrases. "Are documents going in?" was rejected as unclear.
  Say exactly what is meant: "Are users uploading documents to E D R M S sites?"
- No em dashes anywhere (project rule).

**Accuracy (from STATUS.md, do not get wrong)**
- Users upload documents to E D R M S SharePoint sites and declare them as records.
  Emails can be declared as records from Outlook and are saved in the E D R M S site
  the user chooses. Declared records are kept in the **E D R M S database**
  (PostgreSQL, drm-npr). Say "database", not "PostgreSQL", for a lay audience.
  The database holds **declared records only**. Documents are counted from SharePoint.
- Figures on screen are **demo data**. The script must say so. Final wording used:
  "Please note, the figures you see in this video are demo data. They show how the
  report works, not actual E D R M S usage."
- Do not narrate items RAC has not confirmed unless the requester keeps them.
  Flag them and let the requester decide.

**For the voice (ElevenLabs)**
- Spell acronyms with spaces so they are read letter by letter:
  `E D R M S`, `A D B`, `R A C`, `R M`, `R O`, `G B`. The subtitles join them back up
  automatically (see `Subtitle` in `src/Walkthrough.jsx`).
- No scene headings inside the text that gets voiced.

**Structure that was approved (2026.4)**
1. Welcome: what the video covers, in four minutes.
2. Context: what users do in E D R M S, and the three questions the report answers.
3. Scope: the dashboards in this release.
4. Three words to know: document, record, physical counterpart.
5. Bank-wide Oversight: four cards, clickable breakdowns, then each panel.
6. Department Insights: picker, profile, Site filter, five cards, library usage.
7. Export, and check the data as of date.
8. Demo data note.
9. Recap, then "Thanks for watching."

**How to present a script to the requester**
- Always the full text, inside one ```text block so it copies in one click.
- After any change, show the whole script again, not only the changed line.
- Briefly list what changed underneath.

---

## 3. Visual format and style

**Background screens must be the LATEST version.** The first render used the repo's
`index.html` and the requester rejected it as old. `index.html` (GitHub Pages) is only
synced on request. The latest is the Floot app and the SharePoint web part. Floot is
blocked by this container's proxy, so **build the web part and screenshot it**
(section 4, step 5). Check the screenshot shows the ADB blue sidebar, "For future
release" menu, Site filter and Folders column before going on.

**Two kinds of scene, both 1920x1080 at 30 fps**

1. **Full screen motion graphic** (beats with `"dash": null`). Dark navy radial
   background with drifting teal dots. Used for: intro, context, scope, terms, demo,
   outro.
2. **Dashboard scene** (beats with `"dash": "bw"` or `"dp"`). The dashboard sits in a
   framed screen on the left (scaled 0.68), the camera zooms to the element being
   described with a teal spotlight, and a **motion graphic panel** on the right
   illustrates the line. A section chip sits top left, subtitles at the bottom.

**Every line gets its own motion graphic.** Elements appear **on the word that names
them**: each scene receives `at(phrase)`, which returns the frame the voice reaches
that phrase, so timing follows the narration automatically.

**Lessons from the requester's review**
- Never show **blank placeholder shapes**. The first Bank-wide panel showed four empty
  white boxes as the "4 headline cards" and the requester asked what they were. Every
  card must carry its icon, label and value.
- Never let a graphic **appear and vanish in a blink**. If two consecutive beats talk
  about the same thing, keep the graphic on screen across both and animate it instead
  (the headline cards appear once, then each lights up as it is named, cards not yet
  named are dimmed, and Records declared gets a "★ Matters most" badge).
- Values shown in graphics are the same demo values as on the dashboard
  (1,032 sites, 11,800 users, 3.47M documents, 21,646 records, 17.7% paper).

**Palette** (in `src/MG.jsx`): INK `#10243E` background, BLUE `#0072BC`, TEAL `#00A5A8`
accent and highlights, ADB `#194F8E`, GREEN `#3E9B3A` records, PAPER `#C9A66B`
physical counterparts, RED `#C8102E` demo stamp and PDF. Font Segoe UI, Helvetica, Arial.

**Scene catalogue (2026.4)**, `mg` key in beats.json, component in `src/MG.jsx`:

| mg | Kind | What moves |
| --- | --- | --- |
| intro | full | Title builds, Release badge, 4 minute timer ring |
| context | full | Users → upload → SharePoint site → declared record lock → database; Outlook emails; three question pills |
| scope | full | Bank-wide tile, Department Insights tile with department chips being ticked |
| terms | full | Three cards flip in: Document, Record, Physical counterpart |
| bwIntro | side | Bank icon, four labelled headline cards enter |
| cards | side | Same four cards stay; each lights up as named; "Matters most" badge |
| click | side | Cursor clicks a card, breakdown bars open, Records ÷ Documents = Rate |
| physical | side | Donut fills to the paper share, per department bars |
| compare | side | Paired headcount and documents bars grow |
| trend | side | Bars rise, running total line draws, preset pills cycle |
| dpIntro | side | Magnifier over department chips being selected |
| profile | side | Picker ticks one, several, all; Go-Live, convention, Site filter rows |
| five | side | Five card icons, site by site list, internal / external / Top 10 tags |
| library | side | Department → Site → Library hierarchy, measure pills |
| export | side | XLSX and PDF files pop out, pulsing "Data as of" |
| demo | full | Red DEMO DATA stamp lands on a chart |
| outro | full | Recap pills, "Thanks for watching" |

For a new release, reuse these components where the content is the same and add new
ones in `MG.jsx` for new content, registered in `FULL` or `SIDE` at the bottom.

---

## 4. Commands (run from `/home/user/Jim/video` unless stated)

Chromium paths in this container:
`CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`,
headless shell `$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)`.

**Step 4, beats.json.** One object per script paragraph:
```json
{ "dash": "bw", "sec": "Headline cards", "sel": ".kpi", "n": 0, "until": 4, "mg": "cards", "t": "<exact narration>" }
```
- `dash`: `"bw"`, `"dp"` or `null` (full screen scene).
- `sec`: the section chip text. `mg`: the motion graphic key.
- `sel` (+ `n`, `until`, `skipTop`): CSS selector inside `#view` of the element the
  camera zooms to. Working selectors in web part 1.0.37: `.band.edrms-top`, `.kpi`,
  `.physical-split-main`, `#bw-cmp`, `.panel` with `n: -1, skipTop: 180` (trend),
  `.edrms-tools`, dp `.panel` with `n: 0` (profile), `.kpis`, `#dp-libs`.
- `t`: the narration, copied **exactly** from the final script, acronyms spaced.
- Full screen beats also take `title` and `sub`.

**Step 5, latest screens.** Build the web part (from the repo root), then shoot:
```bash
cd /home/user/Jim && python3 sharepoint-webpart/pending-fixes.py
cd sharepoint-webpart && (ls node_modules >/dev/null 2>&1 || npm ci) \
  && REPORT_SOURCE=/home/user/Jim/sp-src.tmp.html npm run build
rm /home/user/Jim/sp-src.tmp.html
cd /home/user/Jim/video && NODE_PATH=../node_modules CHROME=$CHROME node shoot-webpart.js
```
It must print `all beats located`. It also prints the page heights; copy them into
`PAGE_H` near the top of `src/Walkthrough.jsx` (2026.4: `bw: 3884, dp: 3020`).
Look at `public/bw.png` and `public/dp.png` before going on.
(`shoot.js` is the old version that reads `index.html`. Do not use it.)

**Step 6, voice.** Costs credits, so only after the script is final:
```bash
rm -f public/vo/*; python3 narrate_eleven.py            # default voice Matilda
python3 narrate_eleven.py <voice_id>                     # another voice
```
ElevenLabs is reached through the proxy, no key needed. Model `eleven_multilingual_v2`,
stability 0.5, similarity 0.75, style 0.15. Voice used: **Matilda,
`XrExE9yKIg1WjnnlVkGX`** (Knowledgeable, Professional, American female).
Others available: Alice `Xb7hH8MSUJpSbSDYk0k2` (British female educator),
Daniel `onwK4e9ZLuTAKqWW03F9` (British male broadcaster),
Eric `cjVigY5qzO86Huf0OWal` (American male, trustworthy).

If only beats.json selectors or `mg` keys change (not the text), **do not re-voice**.
Merge the new rects and keys into `src/beats.gen.json` instead:
```bash
python3 - <<'EOF'
import json
g=json.load(open('src/beats.gen.json')); b=json.load(open('beats.json')); r=json.load(open('public/beats.rects.json'))
for i,x in enumerate(b): x['seconds']=g[i]['seconds']; x['rect']=r[i]
json.dump(b,open('src/beats.gen.json','w'),indent=1)
EOF
```

**Credits.** Free plan, 10,000 characters a month. One 4 minute script is about
3,250 characters. Check what is left:
```bash
curl -sS https://api.elevenlabs.io/v1/user/subscription | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['character_limit']-d['character_count'],'left')"
```
On 14 October 2026: 5,135 left, resets 13 November 2026.

**Step 7, music.**
```bash
python3 music.py "$(python3 -c "import json;b=json.load(open('src/beats.gen.json'));print(int(sum(x['seconds'] for x in b))+len(b))")"
ffmpeg -v error -y -i public/music.wav -b:a 160k public/music.mp3 && rm public/music.wav
```

**Step 8, render.** Check single frames first (seconds each), then the full render
(over 10 minutes, so run it in the background):
```bash
(ls node_modules >/dev/null 2>&1 || npm ci)
HS=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)
npx remotion still src/index.jsx Walkthrough /tmp/f.png --frame=2500 --browser-executable=$HS
npx remotion render src/index.jsx Walkthrough out/edrms-walkthrough.mp4 --browser-executable=$HS --log=error
ffmpeg -v error -y -i out/edrms-walkthrough.mp4 -c:v libx264 -crf 28 -preset slow \
  -c:a aac -b:a 128k -movflags +faststart EDRMS_<Release>_KT_Video.mp4
```
- **SendUserFile limit is 30 MB.** The raw render is about 85 MB and crf 23 gave 45 MB,
  both too big. **crf 28** gives about 22 MB and still looks sharp.
- Contact sheet to check the whole video at a glance:
  `ffmpeg -i out/edrms-walkthrough.mp4 -vf "fps=1/8,scale=480:-1,tile=5x6" -frames:v 1 sheet.png`
- To find a beat's frames: each beat lasts `ceil(seconds*30) + 14` frames, plus 60
  for full screen beats.

---

## 5. Files

| File | Role |
| --- | --- |
| `KT_Release2026.4_Script_FINAL.txt` | The approved narration |
| `KT_Release2026.4_Script.md`, `KT_Release2026.4_Script_4min.txt` | Earlier drafts, history only |
| `beats.json` | Beats: text, selector, scene key |
| `shoot-webpart.js` | Screenshots the built web part and records element rectangles |
| `narrate_eleven.py` | ElevenLabs voice per beat, writes `src/beats.gen.json` |
| `music.py` | Generates the background music bed |
| `src/Walkthrough.jsx` | Timeline, camera, layout, subtitles, audio |
| `src/MG.jsx` | Every motion graphic scene and icon |
| `src/Root.jsx`, `src/index.jsx` | Remotion entry |
| `public/` | Screenshots, voice clips, music |
| `EDRMS_Release2026.4_KT_Video.mp4` | The delivered video |
| `narrate.py`, `shoot.js`, `build.sh`, `edrms-walkthrough.mp4` | The older Piper / index.html walkthrough. Not used for KT videos |

---

## 6. Gotchas met along the way

- **"React is not defined"** after a container restart: every `src/*.jsx` needs
  `import React from 'react';` as its first line. Already added.
- **Subtitles split "2026.4"** at the dot. Fixed in `Subtitle` with a regex that does
  not break on a dot followed by a digit. Keep it.
- The proxy blocks `edrms-reporting-suite.floot.app`, so screenshot the web part build.
- A render takes more than the 10 minute command limit. Run it in the background and
  commit the source first so the stop hook does not complain about uncommitted files.
- Phrases passed to `at()` must appear in the beat's text, case insensitive. A missing
  phrase silently falls back to the start of the beat, so the element pops in early.
- Known small flaw in the 2026.4 video: in the context scene, the dotted line from the
  Outlook envelope to the site barely shows.

---

## 7. Quick start for the next KT video

1. Get the release scope (deck plus STATUS.md). Draft a 4 minute script that follows
   section 2. Show it in a ```text block. Iterate until "final".
2. Save it as `video/KT_<Release>_Script_FINAL.txt`.
3. Rewrite `beats.json` from it, reusing `mg` scenes where possible and adding new
   scenes to `src/MG.jsx` where the content is new.
4. Build the web part, run `shoot-webpart.js`, update `PAGE_H`, look at the PNGs.
5. Check credits, then run `narrate_eleven.py`, `music.py`.
6. Render stills of the new scenes and look at them. Fix, then render in full,
   compress at crf 28, send, commit and merge to main.
