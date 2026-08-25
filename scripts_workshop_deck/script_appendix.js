/* Part D — appendices: workbook navigation, pushback handling, decision log. */
const D = require("docx");
const { Paragraph, PageBreak, BorderStyle, ShadingType } = D;

function build(S) {
  const { p, block, h1, h2, h3, table } = S;
  const out = [];
  const br = () => out.push(new Paragraph({ children: [new PageBreak()] }));

  br();
  out.push(h1("Part D — Appendices"));

  /* ── A1 ── */
  out.push(h2("A1 — Workbook navigation card"));
  out.push(p("Keep this open the first time you drive the file in front of people. After one segment you will not need it."));

  out.push(h3("Finding the items that need a decision"));
  out.push(table([2600, 7048],
    ["To do this", "Do this"],
    [
      ["Jump to a dashboard", "Click its tab along the bottom. The tabs are in the same order as the deck, so slide 4 is Tab 1."],
      ["Get to the top of a tab", "Ctrl+Home. Useful after scrolling, before you share your screen again."],
      ["See only what needs an answer", "Turn on a filter on the header row, then filter the “In the prototype?” column to No. Turn it off again before moving tabs."],
      ["Widen a column to read it", "Double-click the divider in the column header. Do this rather than scrolling sideways while sharing."],
      ["Read a long cell comfortably", "Click the cell and read the formula bar, or press Alt+Enter-free wrap. Do not resize rows mid-session."],
    ]));

  out.push(h3("What each column is telling you"));
  out.push(table([2600, 7048],
    ["Column", "What it means in the room"],
    [
      ["Requirement Items", "The thing that was asked for, in the client's own words. Read this aloud, not your paraphrase."],
      ["Type", "Whether it is a tile, a table column, a field or an indicator. Useful when they ask what it would look like."],
      ["In the prototype?", "Yes or No. No is what you are working through."],
      ["Slide", "Where it appears in the prototype. Use this if someone wants to see the thing rather than read about it."],
      ["Why it is not there", "Our reason. Read this before answering “why did you remove it?” — the answer is usually already written."],
      ["What it needs before it can be built", "The ask. This column is your agenda for the whole session."],
      ["Question to the client", "Empty at the start. This is where you type what they tell you."],
    ]));

  out.push(h3("What the highlighting means"));
  out.push(table([1500, 8148],
    ["Colour", "What it means, and what you do about it"],
    [
      ["No fill", "Built as asked. Nothing needed unless they want it changed."],
      ["Blue", "Built, but we changed the measure. Say it aloud and get an explicit yes. Silence here is the thing that comes back later."],
      ["Amber", "Built, pending their review. Invite comment, do not labour it."],
      ["Red", "Not built, no source. This is where the two doors apply."],
    ]));
  out.push(p([{ t: "Note on the shading: ", bold: true },
    { t: "there are two slightly different reds and two ambers in the file. They are an artefact of when the rows were edited, not different meanings. If anyone asks, say so plainly." }]));

  br();

  /* ── A2 ── */
  out.push(h2("A2 — Handling pushback"));
  out.push(p("These come up in most sessions. Having a prepared answer keeps the tone collaborative rather than defensive."));
  out.push(table([3200, 6448],
    ["If they say", "You say"],
    [
      ["“Why was this removed?”",
       "It has not been removed from the requirement. It is not in the build, because we could not find a source. Today is how it gets back in."],
      ["“You should already know where this data is.”",
       "For anything inside EDRMS we do. These items are outside it — people, projects, training — and those belong to systems your side owns."],
      ["“Can't you just pull it from SharePoint?”",
       "SharePoint tells us what happened to a document and who touched it. It does not tell us who that person is in your organisation. That has to come from a people system."],
      ["“We covered this in a previous session.”",
       "Then it is probably in a document we hold. Tell me which one and I will check it against the file and come back to you rather than take your time now."],
      ["“Just build it and we will sort the data later.”",
       "We can build the page. It would show empty until the source arrives, and an empty page tends to get read as a broken one. Better to agree the source first."],
      ["“Why is disposal not included?”",
       "Retention is a rule the platform already holds, so we can report it. Disposal is a decision someone makes and records, and that step does not exist in the system yet. There is nothing to read."],
      ["“How long will this take once we give you the data?”",
       "Do not guess. Say you will come back with a firm answer once you know the shape of the source."],
    ]));

  br();

  /* ── A3 ── */
  out.push(h2("A3 — What to capture, and where"));
  out.push(p("Everything goes into the workbook in the room, except the follow-up list. Typing while they watch is deliberate — it makes the commitment concrete and it lets them correct you immediately."));
  out.push(table([2600, 7048],
    ["When they", "You record"],
    [
      ["Name a source", "The system or file name, and the person who owns it, in the question column of that row."],
      ["Agree to drop something", "“Agreed out of scope” and the date, in the question column. Do not delete the row."],
      ["Say they will find out", "The person's name and a date. Put it in the row and on your follow-up list."],
      ["Accept a substituted measure", "“Substitute confirmed” against the blue row. This is the record that protects you later."],
      ["Raise something new", "A new row at the bottom of the tab, marked as raised in this session."],
    ]));

  out.push(h3("The follow-up list"));
  out.push(p("Keep this separately as you go. It is the only thing you need to act on immediately afterwards."));
  out.push(table([3000, 2400, 2000, 2248],
    ["Item", "Owner", "By when", "Tab"],
    [
      ["", "", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
    ]));

  br();

  /* ── A4 ── */
  out.push(h2("A4 — If things go wrong"));
  out.push(table([2800, 6848],
    ["Situation", "What to do"],
    [
      ["You are running over time",
       "Cut the walk-through of what is built, never the questions. What is built can be seen any time; the answers only exist while these people are here."],
      ["The person who knows is absent",
       "Do not guess on their behalf. Park the item with their name against it and move on. Note it at the close."],
      ["The room goes quiet on a question",
       "Wait. Count to five silently before rephrasing. Most useful answers arrive in the pause people are tempted to fill."],
      ["An argument starts about scope",
       "Take it out of the room: “Let me record both positions and we will resolve it outside this session.” Write both down and move on."],
      ["Screen sharing fails",
       "Keep talking through the deck from this script. The SAY lines work without the slides. Fix the share at the next segment break."],
      ["They want to change something already built",
       "Good — that is one of the three actions. Record it as a change request against the row rather than debating the design now."],
    ]));

  out.push(h2("A5 — After the session"));
  out.push(...block("Within two working days", S.TEAL, [
    "Update the workbook with everything agreed, so the file reflects the room rather than your memory of it.",
    "Show dropped items struck through rather than deleted, so the decision stays visible.",
    "Send it back with the follow-up list on top: item, owner, date.",
    "Check anything they said was covered in an earlier document, and come back on it either way.",
  ]));

  return out;
}

module.exports = { build };
