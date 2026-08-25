/* Part C — the seven segments. Every dashboard segment uses the same blocks:
   ON SCREEN / SAY / SHOW / ASK / LISTEN FOR / WRITE, plus IF THEY SAY and a
   SWITCH NOW cue where the facilitator changes windows. */
const D = require("docx");
const { Paragraph, PageBreak, BorderStyle, ShadingType } = D;

function build(S) {
  const { p, block, switchCue, h1, h2, h3, table } = S;
  const out = [];
  const br = () => out.push(new Paragraph({ children: [new PageBreak()] }));

  const ON   = (t) => out.push(...block("On screen", S.NAVY, t));
  const SAY  = (t) => out.push(...block("Say", S.TEAL, t, { italics: true }));
  const SHOW = (t) => out.push(...block("Show", S.NAVY, t));
  const LIST = (t) => out.push(...block("Listen for", S.MUTE, t));
  const WRITE= (t) => out.push(...block("Write", S.ORANGE, t));

  function ASK(items) {
    out.push(new Paragraph({
      spacing: { before: 140, after: 40 }, keepNext: true,
      children: [new D.TextRun({ text: "Ask", bold: true, color: S.RED,
        size: 17, font: "Calibri", allCaps: true, characterSpacing: 30 })] }));
    items.forEach((q, i) => {
      out.push(new Paragraph({
        spacing: { before: 50, after: 20, line: 264 },
        indent: { left: D.convertInchesToTwip(0.18) },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: S.RED, space: 10 } },
        children: [
          new D.TextRun({ text: `Q${i + 1}.  `, bold: true, color: S.RED, size: 21, font: "Calibri" }),
          new D.TextRun({ text: q[0], bold: true, color: S.NAVY, size: 21, font: "Calibri" }),
        ] }));
      if (q[1]) out.push(new Paragraph({
        spacing: { before: 10, after: 40, line: 264 },
        indent: { left: D.convertInchesToTwip(0.42) },
        children: [new D.TextRun({ text: q[1], size: 20, font: "Calibri", color: S.MUTE, italics: true })] }));
    });
  }

  function IFSAY(rows) {
    out.push(h3("If they say…"));
    out.push(table([3400, 6248], ["They say", "You say"], rows));
  }

  /* ══════════════════ SEGMENT 1 ══════════════════ */
  out.push(h1("Part C — The Script"));
  out.push(p([{ t: "Seven segments. The blocks repeat in the same order every time: what is on screen, what to say, what to point at, what to ask, what a real answer sounds like, and what to write down." }]));

  out.push(h2("Segment 1 — Opening  (6 minutes)"));
  ON(["Deck, slide 1. Then slides 2 and 3."]);
  SAY([
    "Thank you for the time. This session has one job: to leave with your confirmation on what the Utilization Report will contain, and a decision on everything we could not build yet.",
    "We are not here to show you a finished product and ask if you like it. We are here to close open questions, and most of those questions are about where information lives.",
  ]);
  SHOW(["Move to slide 2, the agenda. Read the six dashboards aloud, quickly. Do not elaborate — they will see each one properly in a moment."]);
  SAY([
    "We will work through the six dashboards in that order. For each one I will spend two or three minutes on the deck explaining what the page is for, and then we will go into the requirements file itself and work through the actual items.",
    "The file is the real document today. The slides are just the map.",
  ]);
  SHOW(["Move to slide 3. Point at the three actions — Confirm, Change, Add. Then point at the colour key."]);
  SAY([
    "Three things we need from you: confirm what is right, mark up anything you want changed, and tell us what is missing.",
    "In the file you will see rows highlighted in different colours. Blue means we built it but changed the measure slightly, and we will need you to tell us the substitute is acceptable. Amber means it is built and waiting on your review. Red is the important one — red means we could not build it, because we could not find anywhere to get the information from.",
  ]);
  out.push(p([{ t: "Now state the rule. This is the most important thirty seconds of the session.", bold: true, color: S.NAVY }]));
  SAY([
    "For every red row, there are only two possible answers, and I am going to keep asking for one of them.",
    "Either you can tell me where we might get that information — a system, a report, a spreadsheet, or a person who would know. Or we agree together that it comes out of the report, because there is no practical source for it.",
    "Both of those are good outcomes. What does not help either of us is leaving it open, because then we build nothing and we are back here in a month.",
  ]);
  ASK([
    ["Does that way of working make sense before we start?",
     "You want a nod. If someone looks uneasy, ask what they would prefer — better to hear it now."],
    ["Is everyone here who needs to be, particularly for questions about where data lives?",
     "If the person who knows the user directory or the project system is absent, find out now so you can park those items deliberately rather than by accident."],
  ]);
  WRITE(["Note anyone missing, and which topics will need them. You will use this at the close."]);
  br();

  /* ══════════════════ SEGMENT 2 — BANK-WIDE ══════════════════ */
  out.push(h2("Segment 2 — Bank-wide Oversight  (17 minutes)"));
  ON(["Deck, slides 4 and 5."]);
  SAY([
    "This is the page someone opens first. It answers one question — how is EDRMS being used across the bank as a whole.",
    "Everything else in the report is a more detailed version of what is on this page. So if a measure is wrong here, it is wrong everywhere.",
  ]);
  SHOW(["Slide 4. Walk the four groups across the bottom — users and activity, records declared, physical counterparts, retention position. Roughly fifteen seconds each. Do not read every line."]);
  out.push(p([{ t: "Now raise the substitutions, before they find them in the file.", bold: true, color: S.NAVY },
    { t: " These are the changes most likely to be objected to later, and the objection is far cheaper now." }]));
  SAY([
    "Two things on this page we deliberately built differently from the original requirement, and I want to flag them rather than let you discover them.",
    "You asked for a total number of EDRMS users. We are reporting users with recorded activity in the last hundred and eighty days instead. The reason is that a raw user count includes people who were given a licence and never opened it, which makes adoption look better than it is.",
    "You also asked for records due for disposal. We are showing them banded — due within thirty days, ninety days, and twelve months — because a single total does not tell you whether something needs attention this week or next year.",
  ]);
  ASK([
    ["Are you content with activity-based user counts rather than a raw total?",
     "If they want both, that is easy and worth agreeing on the spot."],
    ["Do the disposal bands work, or would you rather see a single figure?", ""],
  ]);
  SHOW(["Slide 5. This is the ask slide. Read the four headings only — the detail belongs in the file."]);
  out.push(switchCue("Alt+Tab to the workbook. Open Tab 1, Bank-wide Oversight."));
  ON(["Workbook, Tab 1. Scroll so the red rows are visible."]);
  SAY([
    "These are the items on this page we could not build. Let us take them in groups, because they share a cause.",
  ]);

  out.push(h3("Group A — Division"));
  SAY([
    "The largest single blocker on this page is Division. Several rows here want a breakdown by division, and we cannot produce any of them, because nothing we can read tells us which division a person or a site belongs to.",
    "This is not a hard problem to solve. It is one list, and it unlocks everything you can see highlighted here.",
  ]);
  SHOW(["Point at each red Division row in turn as you say this. Seeing four rows light up from one cause is what makes the ask land."]);
  ASK([
    ["Where does the authoritative list of Divisions live today?",
     "A system name is the ideal answer. A spreadsheet owner is a perfectly good answer too."],
    ["Is a person assigned to a division, or is a site assigned to a division, or both?",
     "This matters — it changes whether we join on the user or on the site. Do not skip it."],
    ["Who owns that list, and can we be given a copy or read access?",
     "You need a name, not a department."],
  ]);
  LIST([
    "A good answer names a system or a file and a person. Write both.",
    "A weak answer is “HR would have that”. Push once: “Who in HR should we ask?”",
    "If genuinely nobody knows, that is Door 2 — propose dropping every per-division breakdown and reporting at department level. Get that agreed out loud.",
  ]);
  WRITE(["In the row's question column, type the source and the owner's name as they say it. Let them see you typing — it makes the commitment real."]);

  out.push(h3("Group B — Who the users are"));
  SAY([
    "The next group wants users split into staff, contractors and consultants. We could not build it because no register we can reach records employment type against an EDRMS user.",
  ]);
  ASK([
    ["Is there a register anywhere that flags a person as staff, contractor or consultant?", ""],
    ["If there is, can it be matched to an EDRMS account — same email, same identifier?",
     "A register that cannot be joined is no use, so ask this before celebrating."],
    ["If there is not, are you content that we report total active users only and drop the split?",
     "This is Door 2. Offer it plainly. Many clients take it."],
  ]);

  out.push(h3("Group C — Training and go-live"));
  SAY([
    "Two smaller ones. There is a requirement for training completion, and one for users onboarded since go-live.",
    "For training, no training system is connected to this project, so we have nothing to read. For go-live, we do not have a go-live date per site.",
  ]);
  ASK([
    ["Where is EDRMS training completion recorded, and could we read from it?", ""],
    ["Is there a go-live date per site anywhere — or would you accept the date the site was created as a stand-in?",
     "The stand-in is usually acceptable and saves a lot of effort. Offer it."],
  ]);

  out.push(h3("Group D — The disposal items"));
  SAY([
    "The last group on this page concerns disposal — who approved it, whether it was declined or extended, what has actually been disposed of.",
    "We will come to disposal properly later, because it affects two dashboards. For now I just want to note these are here, and we will resolve them together in that segment.",
  ]);
  WRITE(["Mark these rows to revisit in Segment 6. Do not debate them now or you will run over."]);
  IFSAY([
    ["Why did you remove this?", "We did not remove it from the requirement. We could not build it, because we could not find a source. That is exactly what today is for."],
    ["Can't you get it from SharePoint?", "SharePoint tells us what happened to a document. It does not tell us who a person is or which division they sit in. That has to come from a people system."],
    ["We told you this already.", "Then it is likely in a document we have. Tell me which one and I will check it against the file after this session."],
  ]);
  br();

  /* ══════════════════ SEGMENT 3 — DEPARTMENT ══════════════════ */
  out.push(h2("Segment 3 — Department Insights  (19 minutes)"));
  ON(["Deck, slides 6 and 7."]);
  SAY([
    "This is the page your Records Officers will actually live in. It is the same measures as the bank-wide page, but cut by department, office and Records Management unit, and you can drill from a department down to a site and then to a library.",
    "It is the biggest page in the report, and it is where most of the day-to-day questions get answered.",
  ]);
  SHOW(["Slide 6. Spend most of your time on the drill-down idea — department, then site, then library. That is the thing people find genuinely useful."]);
  out.push(p([{ t: "The substitution on this page needs care.", bold: true, color: S.NAVY },
    { t: " It is the one most likely to cause a problem months later if it goes unsaid." }]));
  SAY([
    "One important difference on this page. The requirement asked for the number of site visitors. We are reporting site visits.",
    "The difference matters. A visit is an occasion when someone opened the site. If one person opens it ten times, that is ten visits but one visitor. We report visits because that is what the underlying data actually gives us reliably.",
    "I want to be explicit about it now, because a number labelled visitors that is really counting visits would mislead you later.",
  ]);
  ASK([
    ["Is reporting visits rather than unique visitors acceptable?",
     "If they need unique people, say plainly that we would need to identify a source for it and add it as a red row now."],
    ["We also count only EDRMS-compliant sites rather than all sites created. Is that the right basis?",
     "This is a scope choice worth confirming aloud."],
  ]);
  out.push(switchCue("Alt+Tab to the workbook. Open Tab 2, Department Insights."));
  ON(["Workbook, Tab 2."]);
  SAY([
    "You will recognise most of these, because they are the same causes as the previous page.",
    "Division appears again here. Employment type appears again. Training appears again. If we solve them once, they resolve on both pages — that is the single most useful thing you can take away from today.",
  ]);
  ASK([
    ["Can we treat the Division answer from the last segment as covering this page too?",
     "Almost always yes. Confirming it aloud saves repeating the whole discussion."],
    ["Which report or system separates site visitors into internal and external?",
     "This one is specific to this page. We can count visits but cannot tell who is internal."],
    ["Is there an approved site, library and folder naming convention we could measure compliance against?",
     "If one exists as a document, we need the document. If it does not exist, this row comes out."],
    ["Are access requests — granted and denied — logged anywhere we can reach?", ""],
  ]);
  LIST([
    "For the internal and external split, listen for whether they are thinking of guest accounts. If so, that may be reachable and is worth chasing.",
    "For the naming convention, “it is in a policy document somewhere” is Door 1 only if someone names the document.",
  ]);
  WRITE(["Record answers row by row. Where an answer repeats the Bank-wide one, write “as Tab 1” so the file stays consistent."]);
  br();

  /* ══════════════════ SEGMENT 4 — PROJECT ══════════════════ */
  out.push(h2("Segment 4 — Project Insights  (12 minutes)"));
  ON(["Deck, slides 8 and 9."]);
  SAY([
    "This page is different from the others, and I want to be straightforward about why.",
    "Everything on this page is built. The layout, the fields, the drill-throughs — you can see exactly how it will look and behave. What it does not have is a confirmed place to get project information from.",
    "So this is not a design conversation. It is a single sourcing question, and the whole page depends on the answer.",
  ]);
  SHOW(["Slide 8. Point at the profile fields — facility type, modality, country, status, effectivity and closing date. These are the fields we need a home for."]);
  out.push(switchCue("Alt+Tab to the workbook. Open Tab 3, Project Insights."));
  ON(["Workbook, Tab 3. Every row here carries the same question."]);
  SAY([
    "You will notice every row on this tab asks the same thing. That is because they all depend on one answer.",
  ]);
  ASK([
    ["Which system holds project attributes — facility type, modality, country, status, effectivity and closing dates?",
     "This is the single most valuable answer in the whole workshop. Do not move on quickly."],
    ["Who owns that system?",
     "You need a person or a team, because we will need to approach them."],
    ["Could we be given read access, and how often would the information refresh?", ""],
    ["Separately — is there a register that maps an EDRMS site to a project?",
     "Without this we can show project attributes but cannot connect them to any activity."],
    ["If no such register exists, would you accept us matching sites to projects by reading the site names?",
     "Say plainly that this is approximate. Some sites will not match. Better they hear the limitation now."],
  ]);
  LIST([
    "If they name a system quickly and confidently, this page is unblocked and that is a very good outcome. Say so.",
    "If nobody knows, do not force it. Ask who would know, and get a name and a date.",
    "If it becomes clear that no such system exists, ask directly whether project-level reporting should stay in scope at all. That is a legitimate Door 2.",
  ]);
  WRITE(["Write the system name, the owner and the date they will confirm access. This one is worth reading back before you leave the segment."]);
  IFSAY([
    ["Can't you get projects from the site names?", "Sometimes. It depends on whether every site is named consistently. We can try, but it will be approximate and some projects will be missing."],
    ["Why did you build it if you have no data?", "So you could see it and tell us whether it is worth sourcing. It is much easier to decide that looking at the real thing."],
  ]);
  br();

  /* ══════════════════ SEGMENT 5 — FILE PLAN ══════════════════ */
  out.push(h2("Segment 5 — Institutional File Plan  (8 minutes)"));
  ON(["Deck, slides 10 and 11."]);
  SAY([
    "This page is the reference view. It shows your retention class hierarchy as it actually exists in the system, rather than as a document, and shows how much of what has been declared maps onto it.",
    "This is the one page where we are not asking you for a source. It is built. What we need here is confirmation that the structure is right.",
  ]);
  SHOW(["Slide 10. Point at the hierarchy and the coverage idea — where the plan is being used and where it is not."]);
  out.push(switchCue("Alt+Tab to the workbook. Open Tab 4, Institutional File Plan."));
  ON(["Workbook, Tab 4."]);
  SAY([
    "You will see this tab has no red rows. Everything asked for is built.",
    "So the questions here are different — they are about whether what we have matches what you actually use.",
  ]);
  ASK([
    ["Does the hierarchy shown match your current approved file plan, including the category names?",
     "Have the prototype ready to show if they want to see it."],
    ["Are there terms that are retired or deprecated but still present in the system?",
     "Then ask: should those be hidden, or shown so you can see they are still being used?"],
    ["How often does the file plan change, and who would send us the updated structure?", ""],
    ["Is anything you expected to see on this page absent?",
     "Ask this deliberately and then stay quiet for a few seconds. A silent page invites silent assumptions."],
  ]);
  WRITE(["Any structural change they describe goes in as a new row, marked as raised today."]);
  br();

  /* ══════════════════ SEGMENT 6 — RETENTION ══════════════════ */
  out.push(h2("Segment 6 — Retention and Disposal  (12 minutes)"));
  ON(["Deck, slides 12 and 13."]);
  out.push(p([{ t: "This segment is a proposal, not a sourcing exercise. ", bold: true, color: S.NAVY },
    { t: "Your goal is agreement to a split, and the disposal rows parked from Segment 2 get resolved here." }]));
  SAY([
    "This page needs a clear distinction that has caused confusion before, so I want to make it plainly.",
    "Retention and disposal are two different things. Retention is the rule — how long something must be kept. The platform holds retention policy today, so we can report on it now: what carries a label, what is approaching the end of its term, where coverage is missing.",
    "Disposal is the act of actually getting rid of something. And that is where the difficulty is.",
  ]);
  SHOW(["Slide 12. Point at the left column, then the right. The two-column split does most of the explaining for you."]);
  SAY([
    "The disposal requirements do not just ask what was disposed of. They ask who approved it, whether it was declined or extended, and when the decision was made.",
    "Those are the outputs of a workflow — a person reviews something and makes a decision that gets recorded. We do not have that capability in place today. Nothing performs that step, and nothing records it.",
    "So this is not a case of us not finding the data. There is no data, because the process that would create it does not exist yet in the system.",
  ]);
  SHOW(["Slide 13. Walk the three phases left to right."]);
  SAY([
    "What we propose is this. We build the retention reporting now, because the policy is already there and it is genuinely useful on its own.",
    "Disposal is a release in its own right — the approval workflow has to be built as a capability before anything can report on it. Once that exists and decisions are being recorded, the disposal reporting is added to this same page.",
    "That way you get the retention view immediately, rather than waiting for the whole thing.",
  ]);
  ASK([
    ["Are you content to confirm retention reporting now, and treat disposal reporting as a later increment?",
     "This is the decision the segment exists for. Get a clear yes or a clear objection."],
    ["When disposal does arrive, who holds the approval decision?",
     "Asking now shapes what we build later, and it tells you whether they have thought about it."],
    ["Does your audit position require every disposal decision evidenced, including declines and extensions?",
     "If yes, that is important and should be written down now."],
  ]);
  out.push(switchCue("Alt+Tab to the workbook. Open Tab 5, Retention and Disposal — and keep Tab 1 in mind."));
  ON(["Workbook, Tab 5. Then briefly back to the disposal rows on Tab 1 and Tab 2."]);
  SAY([
    "There are some rows on this tab that were removed without a reason recorded, and I would rather ask than guess.",
    "Several of them duplicate measures that already appear on the bank-wide page. My assumption is they were dropped as duplicates, but I do not want to assume.",
  ]);
  ASK([
    ["Were these dropped deliberately as duplicates, or should they be here?", ""],
    ["Do you still want a top-level retention term breakdown on this page?", ""],
    ["Can we mark the disposal rows we flagged earlier as deferred to the disposal release?",
     "This is where the Segment 2 parking gets closed. Do not leave without it."],
  ]);
  WRITE(["Mark every disposal row across all tabs consistently as deferred, with the same wording, so the file reads coherently afterwards."]);
  IFSAY([
    ["We need disposal reporting now.", "Then we need the disposal capability first — a report cannot show decisions nobody is recording. What we can do now is build the retention side so it is ready to receive it."],
    ["Isn't retention the same thing?", "Retention says how long to keep something. Disposal is the act of destroying it and recording who agreed. We have the first today, not the second."],
  ]);
  br();

  /* ══════════════════ SEGMENT 7 — ARCHIVE ══════════════════ */
  out.push(h2("Segment 7 — Records and Archive Holdings  (10 minutes)"));
  ON(["Deck, slides 14 and 15."]);
  SAY([
    "This last page is the one where I have the least to show you, and I would rather be direct about why.",
    "The requirement asks for a picture of holdings — where records physically are, who has custody of them, their condition, and how they move. It is a completely reasonable thing to want.",
    "The difficulty is that we have not been able to find any system that holds that information.",
  ]);
  SHOW(["Slide 14. Left column is what the requirement asks for; right column is where we stand. Let the contrast do the work."]);
  SAY([
    "Archive holdings management is a system, not a view. Somewhere, holdings need to be registered, custody needs to be transferred and recorded, and condition needs to be noted.",
    "Until something does that, there is nothing for a report to read, no matter how well we design the page.",
    "So we are not proposing to build this now, and we are not proposing to abandon it either.",
  ]);
  SHOW(["Slide 15. The three phases again — confirm the requirement now, a system of record established, then reporting follows."]);
  ASK([
    ["Before we go further — is there a register, database or even a spreadsheet holding archive information that we have not been shown?",
     "Ask this first and genuinely. It is the one answer that changes the recommendation entirely, and it is more common than you would expect."],
    ["Which team is accountable for physical holdings today, and how do they track them now?",
     "Even a manual process tells us what a future system would need to capture."],
    ["Are you content to confirm the requirement now and schedule the build once a source exists?", ""],
  ]);
  LIST([
    "If a spreadsheet exists, ask to see it before dismissing it. A maintained spreadsheet is a real source.",
    "If the honest answer is that nobody tracks this yet, say so plainly and record it. That is a finding worth having.",
  ]);
  WRITE(["If any source is named, write it prominently — it changes the recommendation and you will want to follow it up the same week."]);
  br();

  /* ══════════════════ SEGMENT 8 — CLOSE ══════════════════ */
  out.push(h2("Segment 8 — Closing  (6 minutes)"));
  ON(["Workbook. Scroll through the tabs as you read back."]);
  out.push(p([{ t: "Do not skip this. ", bold: true, color: S.NAVY },
    { t: "Reading decisions back is what stops them being reopened later, and it is where you discover the misunderstanding that would otherwise cost a second workshop." }]));
  SAY([
    "Before we finish, I am going to read back what we have agreed, so that if I have written anything down wrongly you can correct me now.",
  ]);
  SHOW(["Go tab by tab. For each, read only three things: what was sourced, what was dropped, and what is parked with a name against it."]);
  ASK([
    ["Have I recorded anything incorrectly?",
     "Then pause properly. Silence here is not agreement — give it a few seconds."],
    ["Is there anything we have not discussed that you expected to?", ""],
    ["Are you content for us to treat everything marked confirmed today as locked?",
     "This is the sentence that makes the session count. Ask it plainly and wait for an answer."],
  ]);
  SAY([
    "We will send the updated file back within two working days, with everything we agreed reflected in it, and the parked items listed with the owner and date against each.",
    "Anything marked as dropped will be shown struck through rather than deleted, so you can see what was decided and why.",
  ]);
  WRITE([
    "The list of parked items with owners and dates — this becomes your follow-up list.",
    "Anything raised today that was not in the file at all. These are new requirements and need adding.",
  ]);

  return out;
}

module.exports = { build };
