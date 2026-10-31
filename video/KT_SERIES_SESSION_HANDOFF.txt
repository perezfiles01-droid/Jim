EDRMS KNOWLEDGE TRANSFER (KT) VIDEO SERIES - SESSION HANDOFF
Paste this whole file into a new Claude Code session to continue the series.
Written 31 October 2026, after Part 1 was approved by the requester as
"perfect, and how I want all the series ... exactly the same way".

======================================================================
0. INSTRUCTIONS TO CLAUDE (READ FIRST, FOLLOW EXACTLY)
======================================================================
You are continuing a 5 part knowledge transfer video series for the ADB EDRMS
project. Part 1 is finished and approved. It is THE REFERENCE for every later
part: same look, same voice, same structure, same working method. Do not
redesign anything that Part 1 already does. Reuse its code.

Repository: perezfiles01-droid/Jim (cloned at /home/user/Jim).
Before anything else, read, in this order:
  1. /home/user/Jim/CLAUDE.md          (repo rules: merge every change to main)
  2. /home/user/Jim/video/KT_VIDEO_HANDOFF.md, section "0a. KT SERIES" first
  3. /home/user/Jim/video/part1/beats.json and part1/src/Part1.jsx (the reference build)
  4. /home/user/Jim/video/KT_Part1_Script_FINAL.txt (the approved Part 1 script)
  5. STATUS.md only when a part needs project facts (Parts 4 and 5).

Watch the approved Part 1 to calibrate: video/EDRMS_KT_Part1_Introduction.mp4.

Working rhythm, every part (never skip a gate):
  a. Gather the facts for the part (deck, STATUS.md, repo files). Never invent
     a figure, a date, a name or a button label. If unsure, ask or leave it out.
  b. Draft the FULL script. Show it inside ONE ```text block so it copies in one
     click. Under it, list what you assumed and ask only what is genuinely unclear.
  c. Revise until the requester says "use this as final". After any change, show
     the whole script again, not only the changed line, plus a short list of changes.
  d. If the requester will send screen recordings, wait for them, then rewrite the
     recording lines to match what is actually on screen (section 6).
  e. Build exactly like Part 1 (sections 5, 7, 8). Render stills, look at them,
     fix, then render the full video.
  f. Send the MP4 with SendUserFile (display: attach). Commit and merge to main.
  g. Update this file (and video/KT_VIDEO_HANDOFF.md) with every new ruling, then
     ALSO SEND THIS UPDATED HANDOFF FILE with SendUserFile right after EVERY
     generated video. Requester's standing rule, 31 Oct 2026.

Repo rule (CLAUDE.md): every change is committed, merged to main and pushed in
the same turn. Never ask whether to publish. A stop hook also blocks ending a
turn with uncommitted files, so commit work in progress as you go.
  git checkout main && git merge --no-edit <branch> && git push origin main && git checkout <branch>
Never put a model name in commits or files. No em dashes in visible text.

Talking to the requester: plain, short, simple sentences. Yes/No first when asked
a yes/no question. Give clickable links. Say plainly what was and was not checked.

======================================================================
1. THE SERIES
======================================================================
Part 1  Introduction                                      DONE, approved (v3, 31 Oct)
        ADB, EDRMS, declaring a record in 7 steps (with the requester's
        recording), RAC / ITD / AvePoint, the release journey.
        Files: video/part1/, video/EDRMS_KT_Part1_Introduction.mp4 (6:27)
Part 2  The release journey in detail                     NEXT
        Each release from 1.1 to today: what it does, why it matters, when it
        went live, then what comes next (2026.5 and the roadmap). Hotfixes
        1.1.1 and 2026.1.1 belong here (left out of Part 1).
Part 3  How a release is delivered                        TODO
        The lifecycle, step by step, with who does each step (section 3).
Part 4  Release 2026.4, the EDRMS Utilization Report      TODO
        Refresh of the first KT video (video/KT_Release2026.4_Script_FINAL.txt)
        in the new Part 1 style, with the LATEST web part screens.
Part 5  The files, tools and sites we use                 TODO
        Known: test tenant 7rkd12, SharePoint admin, the App Catalog link (see
        CLAUDE.md, send exactly that one), sample site EDRMSUtilsample, Cloud
        Governance Workspace report, Figma file, prototype site on GitHub Pages,
        ADO taskboard, PBL workbooks, workshop decks, checker workbooks,
        .sppkg and source zip. ASK the requester for the ADB-side sites and files.

Each part about 5 to 7 minutes. Each part stands alone (someone may watch only Part 3).

======================================================================
2. FACTS ALREADY SETTLED (do not re-ask)
======================================================================
Source deck: the requester's "EDRMS Project Update - October 2026" (80 slides).
It was uploaded to the first session only and is NOT in the repo. If you need it
again, ask the requester to upload it. python-pptx cannot open it; unzip it and
read ppt/slides/slideN.xml text runs (<a:t>) directly.

Releases (from that deck):
  1.1       Apr 2025  Site and library creation, records declaration, Cloud Governance setup
  1.1.1     May 2025  Hotfix: error message change
  1.2.1     Nov 2025  Multimedia records declaration; native retention label application disabled
  2026.1    Jan 2026  Multiple records declaration (+ 2026.1.1 hotfix, 23 Jan)
  2026.2    Mar 2026  Centralized (not-in-place) records declaration (SIT extended for one
                      critical bug; UAT rescheduled at RAC request)
  2026.3    Jun 2026  Email records declaration (alpha); slipped from April
  2026.3.1  ongoing   Email records enhancement
  2026.4    PROD 11 Dec 2026  EDRMS Utilization Report (UAT 24 Nov to 4 Dec)
  2026.5    TBC       Physical records management, on hold at ADB's request
  Roadmap: retention label mapping, event triggered declaration, records
  disposition, site renewal and disposition, MAS integration (high priority),
  manual and auto declaration in project sites (parked, SovOps / BIOC),
  classification and sensitivity labels, RCHI (on hold, awaiting Gustavo and RAC).
Release numbering switched from 1.x (2025) to year based (2026.x).
Project start date: unknown. Say "the first release went live in April 2025".

Groups: RAC = the records team at ADB, owns and confirms requirements.
ITD = ADB's IT department, supports the rollout; its TCS QA team tests every
release. AvePoint = the delivery team: BAs, developers, AvePoint QA.
Use ROLES in narration, not people's names (no ruling yet on names).

Declaring a record (Part 1 rulings, reuse wherever it comes up):
  7 steps, requester's wording: 1 Open the EDRMS compliant site, 2 Choose a
  library and/or folder, 3 Create or upload document, 4 Make sure the document
  has a sensitivity label (not needed for audiovisual files: images, videos,
  email files), 5 Physical counterpart, 6 Submit, 7 Check the records.
  Physical counterpart: Yes = a paper copy also exists; No = electronic only.
  Declared records show a lock: cannot be edited or deleted.
  Retention label depends on the library mapping: 5, 7, 10 years or permanent.
  Emails are classified as audiovisual, so their sensitivity label is blank.
  After declaration explain only the retention label and the sensitivity label.
  In the recording, "Jim Test 2" is a FOLDER inside a library, not a library.
  The library list is what the site's top menus drop down. Never call a
  breadcrumb item a library without checking.

======================================================================
3. PART 3 CONTENT: THE DELIVERY PROCESS (corrected against the deck)
======================================================================
 1 Initial requirements from the client (RAC)
 2 Dev feasibility assessment
 3 Requirement Gathering Workshop (a Discovery Workshop when there are no
   initial requirements)
 4 Dev assessment of what was gathered
 5 Client confirmation: Requirements Reconfirmation workshop, or by email
 6 Product Backlog (PBL), written as user stories in ADO (Azure DevOps)
 7 Effort estimation by dev
 8 PBL review and sign-off by the client
 9 Dev kickoff, then development
10 AvePoint internal QA testing and test case write-up
11 SIT by ADB TCS QA (client QA): defects logged in ADO, SIT sign-off before UAT
12 UAT by RAC: UAT briefing, UAT guide, bug fixing during UAT, UAT sign-off
13 UAT Completion Report
14 CAB preparation (Change Advisory Board approval before going live)
15 Production deployment
16 Production sanity testing by ADB TCS QA, QA sign-off
17 Hypercare (post-release monitoring)
Example timeline for 2026.4 from the deck: requirement gathering 10 Jul to
28 Aug, PBL refinement and sign-off 31 Aug to 11 Sep, development 14 Sep to
7 Oct, AvePoint QA 5 Oct to 28 Oct, SIT 4 Nov to 20 Nov, UAT 24 Nov to 4 Dec,
CAB 7 to 11 Dec, PROD 11 Dec 2026.

======================================================================
4. SCRIPT RULES (the requester's own corrections)
======================================================================
- Open with a HOOK. A calm, list-like intro was rejected as "too long and boring".
- Engaging and simple enough for someone with ZERO knowledge. Use analogies
  (library = filing cabinet, folder = drawer).
- Short paragraphs. One paragraph = one beat on screen.
- Say "department", never "unit". Say "users", never "staff".
- No vague phrases; say exactly what is meant.
- No em dashes. No "Thanks for watching".
- Never narrate a figure, date or name that is not in a source. Demo figures must
  never look like real ones on screen.
- Spell acronyms with spaces in the script text so the voice reads letters:
  E D R M S, A D B, R A C, I T D, T C S Q A, Q A, R M, R O, P B L, S I T, U A T,
  C A B, A D O, B A. Subtitles join them back (Subtitle in Part1.jsx; add any new
  acronym to its replace list).
- Write release numbers as words: "twenty twenty six point one". Subtitles convert.
- End each part by pointing to the next part.

======================================================================
5. VOICE: KOKORO am_michael, FREE AND LOCAL
======================================================================
The requester chose Kokoro voice "Michael" (am_michael). Not ElevenLabs.
Setup per new container (model is gitignored):
  pip install -q kokoro-onnx soundfile
  mkdir -p video/partN/tts && cd video/partN/tts
  curl -sL -o model_quantized.onnx https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/onnx/model_quantized.onnx
  curl -sL -o am_michael.bin https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/am_michael.bin
Voicing: python3 narrate_kokoro.py            (all beats, ~1 min per beat; run in background)
         python3 narrate_kokoro.py 0 1 2      (only those beats)

PRONUNCIATION IS MANDATORY: always voice through pronounce.py (copy it from part1).
Requester's rulings:
  ADB      = "Ey-DB": soft American Ey, D and B run together, no pause   IPA eɪdˈiːbiː
  RAC      = R-A-C, every letter (Kokoro otherwise says "RC")            ˈɑːɹ ˈeɪ sˈiː
  QA       = Q A, American "Ey"                                          kjˈuː ˈeɪ
  AvePoint = "Av-Point", never "Avi-point" or "Ah-vay-point"            ˈævpɔɪnt
  live     = "layv" (went live, goes live)                               lˈaɪv
Kokoro reads a lone capital A as a schwa. For every NEW acronym or name, check it
before voicing:  k.tokenizer.phonemize("P B L", "en-us")  and read the IPA. If a
letter A shows as ɐ, or a word looks wrong, add it to pronounce.py.
Before voicing a whole part with new words, voice a 20 second sample containing
them and send it (SendUserFile) for the requester to approve.

======================================================================
6. SCREEN RECORDINGS FROM THE REQUESTER
======================================================================
- They upload big files as GitHub release assets (the normal upload stops at
  25 MB). Give them: https://github.com/perezfiles01-droid/Jim/releases/new
  (any tag name, drag the file into "Attach binaries", Publish release).
- Download: curl -sL -o video/src_clips/<name>.mp4 <their releases/download/... link>
  (src_clips/ is gitignored). Part 1's clip: releases/download/scene5/scene.5.mp4
- Read it: frames every 2 s with the timestamp burned in, tiled 3x3; read every
  sheet; then 0.5 s frames around anything that flashes (Part 1's success
  message lasted under a second).
    ffmpeg -i clip.mp4 -vf "fps=1/2,scale=860:-1,drawtext=text='%{pts\:hms}':x=10:y=10:fontsize=28:fontcolor=yellow:box=1:boxcolor=black" f/o_%02d.png
    ffmpeg -i f/o_%02d.png -vf tile=3x3 f/sheet_%d.png
- Map every script line to source time ranges. Cut all dead time (loading,
  mouse wandering, file pickers).
- Check the LAST frames of every segment at 0.25 s steps. A segment must end
  before the next action starts: Part 1's step 1 ran 0.3 s too long, so a menu
  dropped open and froze on screen while the narration talked about the logo.
- Time each segment to the NARRATION, not to its raw length: give a "vid" a
  "w" list (share of the beat per segment, e.g. "w": [0.3, 0.7]). Without it,
  screen time follows raw clip length, and in Part 1 a long menu clip stayed up
  while the narration had already moved on to the physical counterpart question.
  Start a segment after any "Loading..." has finished, and time each highlight
  (a, b) to when the narration names it.
- Rewrite the script lines to match what is really on screen: real button
  names, real messages, real column names. If what is shown contradicts the
  narration, flag it and ask (Part 1: the "audiovisual" example was an email).
- Source pixel positions for highlights: source px = tile px x source width / tile width.

======================================================================
7. VISUAL STANDARD (exactly as Part 1)
======================================================================
1920x1080 landscape, 30 fps. Palette and icons from video/src/MG.jsx (INK
background, BLUE, TEAL, ADB, GREEN, PAPER, RED, AMBER #F2A900 for clicks).

Two kinds of scene:
A) Full screen motion graphic for story beats ("mg" key). Lively, not static:
   things fly in, slam, stamp, count, travel. Every element lands on the word
   that names it, via at('phrase'). Consecutive beats on the same topic keep
   the same graphic on screen and animate it (no blink in and out).
   Part 1 examples to reuse: hook intro (documents pour in, questions slam,
   collapse into EDRMS with a shockwave), globe with pins, conveyor with RECORD
   stamps, letters unfolding into words, groups with living icons, the release
   journey road with a travelling marker, DELIVERED stamps, year flip, and a
   mini animation per release showing what it does.
B) Recording beats ("vid" key). NEVER the recording alone, full screen:
   - recording on the left (1190 px wide), cut and zoomed with camera keyframes
     so the thing being named is large
   - an animated EXPLAINER panel on the right illustrating the narration
   - a STEP TRACKER across the top: current step lit, finished steps ticked
   - HIGHLIGHTS on everything named: amber ring plus click ripple on clicks,
     teal labelled box on things shown (uploaded file, message, icon), and a
     spotlight that dims the rest for a column being explained
Subtitles at the bottom on every beat. Quiet background music (looped).

Beat format (partN/beats.json):
  { "mg": "intro", "vid": null, "t": "<narration>" }
  { "mg": null, "vid": { "step": 3, "side": "upload",
      "segs": [[0.0, 2.0], [16.0, 20.5]],              source seconds to play
      "w": [0.3, 0.7],                                 share of the beat per segment
      "keys": [[0, 1300, 450, 1.6], [1, 800, 700, 1.3]],  [fraction, cx, cy, scale]
      "hl": [{ "a": 16.0, "b": 19.9, "box": [517, 814, 1099, 936],
               "kind": "box|ring|click|spot", "label": "Upload confirmed" }] },
    "t": "<narration>" }
Highlights show while the SOURCE time is inside [a, b], so they stay locked to
the recording however the clip is sped up or slowed.

======================================================================
8. BUILDING PART N (copy Part 1, change content only)
======================================================================
  cd /home/user/Jim/video && npm ci            (once per container)
  mkdir -p partN/src partN/public/vo partN/out
  cp part1/pronounce.py part1/narrate_kokoro.py partN/
  cp part1/src/index.jsx partN/src/            (rename Part1 -> PartN inside)
  cp part1/src/Part1.jsx partN/src/PartN.jsx   (keep shared pieces, write new scenes)
  cp public/music.mp3 partN/public/
  copy any recording to partN/public/<name>.mp4 (gitignore it like scene5.mp4)
  write partN/beats.json, voice it, then:
  HS=$(find /opt/pw-browsers -name chrome-headless-shell -type f | head -1)
  npx remotion still partN/src/index.jsx PartN partN/out/s.png --frame=1500 --public-dir=partN/public --browser-executable=$HS
  npx remotion render partN/src/index.jsx PartN partN/out/raw.mp4 --public-dir=partN/public --browser-executable=$HS --concurrency=4
  ffmpeg -i partN/out/raw.mp4 -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 128k -movflags +faststart EDRMS_KT_PartN_<Title>.mp4
Add partN/tts/, partN/out/ and the recording to video/.gitignore.
Long jobs (voicing, render ~15 min) go in the background. If the container
restarts, re-run them; check that the recording and node_modules are still there.

Checking before sending: render about 15 stills across every scene, tile them,
LOOK at them, and check: highlights land on the right element, labels are not
cut off or overlapping, no invented figure on screen, text readable. Then render.
After sending, say plainly that you checked sample frames, not every second.

======================================================================
9. WHAT TO DO FIRST IN THE NEW SESSION
======================================================================
1. Read the files in section 0.
2. Ask the requester which part to do next (default: Part 2) and whether they
   will send recordings for it.
3. Draft that part's full script in one ```text block, following sections 2 to 4.
