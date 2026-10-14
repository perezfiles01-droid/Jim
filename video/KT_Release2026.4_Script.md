# EDRMS Utilization Report, Release 2026.4: Knowledge Transfer Video Script

Draft 2, 14 October 2026. For narration in ElevenLabs.

**Audience:** colleagues who will use, support or present the report and have not seen it before.
**Length:** about 10 minutes of narration (roughly 1,450 words at 145 words a minute).
**Scope:** Release 2026.4 is the MVP and has two dashboards, Bank-wide Oversight and Department Insights. The other four are future releases.
**Source:** `EDRMS_R2026.4_Requirements_Reconfirmation_v2.pptx` and the Release 2026.4 mockup PDF of 12 October.

**How to use this script**
- Only the text under **Narration** goes into ElevenLabs. **On screen** is for whoever records the screen.
- Acronyms are written with spaces (E D R M S, A D B, R A C, G B) so the voice reads them letter by letter. Keep that spacing when you paste.
- Generate one scene at a time. Short clips keep retakes cheap and are easier to line up with the screen recording.
- A blank line in the narration gives a natural pause. For a longer pause, add `<break time="1.0s" />` if your ElevenLabs model supports it.
- Lines marked **[TO CONFIRM]** describe items RAC has not settled yet. Keep or cut them once the reconfirmation session is done (see the end of this file).

---

## Scene 1. Opening (about 50 seconds)

**On screen:** Title card, "EDRMS Utilization Report, Release 2026.4". Then the report opening on Bank-wide Oversight.

**Narration:**

Welcome. In the next ten minutes, you'll learn what the E D R M S Utilization Report is, what is in Release 2026.4, and how to read every part of it with confidence.

First, the why. A D B manages its records in E D R M S, which runs on SharePoint. Setting up sites is the easy part. The real question is whether people use them. Are documents going in? Are records being declared? And which units are leading, and which need support?

This report answers those questions, for R A C, for I T D, and for anyone tracking adoption across the Bank.

Release 2026.4 brings two dashboards. Bank-wide Oversight, the view across the whole Bank. And Department Insights, the view of one unit at a time.

---

## Scene 2. Three words to know first (about 45 seconds)

**On screen:** A simple slide with three terms: Document, Record declared, Physical counterpart.

**Narration:**

Before any numbers, three words you'll hear throughout.

A document is any file saved in an E D R M S site.

A record is a document that has been formally declared. Declaring it locks it as the Bank's official version, under a retention rule.

And a physical counterpart is a declared record that also exists on paper.

One more term. A unit means a department, an office, a resident mission, or a regional office. On screen, you'll see it written as Department, Office, R M, R O.

---

## Scene 3. Bank-wide Oversight: the four headline cards (about 1 minute 40 seconds)

**On screen:** Bank-wide Oversight. Highlight the four cards in turn. Open the EDRMS users card to show its breakdown.

**Narration:**

This is Bank-wide Oversight. One question drives this page. How far has E D R M S been adopted across the Bank?

At the top are four headline cards.

Active E D R M S sites. The sites marked as E D R M S in Cloud Governance.

E D R M S users. This is the approximate headcount of each unit, rounded and provided by R A C. It gives context. It is not a live count.

Open this card, and you see who is actually using the system. Users active in the last 180 days, taken from the Purview audit log. Users with no access in that time, which is the headcount minus the active users. And how many people have completed E D R M S training, with the training percentage.

Documents in E D R M S. Every file on those sites, and the storage they use.

And records declared. The figure that matters most for recordkeeping. Its breakdown also shows the declaration rate, which is records declared divided by documents, and how many different people are declaring.

Remember this. Every card is clickable. Click it, and its breakdown opens right below. Click it again, and it closes.

---

## Scene 4. Bank-wide Oversight: sites, documents and paper (about 1 minute)

**On screen:** Open the Active sites card: top ten chart, then the table. Open the Documents card. Scroll to the physical counterparts panel: tiles, donut, table.

**Narration:**

Open the sites card, and you see where those sites are. The chart ranks the top ten units by number of sites. The table lists every unit, and you can search it and sort any column.

The documents card shows documents and storage used, in G B, for every unit, with the history over time.

Further down is the physical counterparts panel. It counts the declared records that also exist on paper, and shows what share of all records that is. The donut gives you the share at a glance. The table shows it unit by unit, so the units that still rely most on paper stand out.

---

## Scene 5. Bank-wide Oversight: comparison and trend (about 1 minute 15 seconds)

**On screen:** The Comparison panel: switch between documents and records. Then the Records Declaration Trend: a preset, a custom range, then month and year.

**Narration:**

Raw totals can mislead. A large department will always hold more documents than a small office. So the comparison panel asks a fairer question.

Choose documents or records declared. Each unit's figure appears beside its approximate headcount, each on its own scale. Now you can see whether a unit's use of the system matches its size.

The last panel is the Records Declaration Trend. Choose a preset, such as the last three, six or twelve months, year to date, or all time. Or set your own date range.

The bars show the records declared each month, by declaration date in Manila time. The line is the running total. When it climbs steadily, adoption is taking hold. When it flattens, that's a conversation worth having.

---

## Scene 6. Department Insights: the profile and filters (about 1 minute)

**On screen:** Switch to Department Insights. Open the department picker and choose a unit. Point to the Go-Live date and site convention link. Then open the Site filter.

**Narration:**

Now let's zoom in. Department Insights tells the same story, one unit at a time.

Start with the department picker. Choose a department, office, R M or R O, and the whole dashboard changes to that unit.

The profile shows when the unit went live on E D R M S, and a link to its approved site naming convention.

Beside the picker is the Site filter. It lists only the sites in the units you chose, and narrows the dashboard to the sites you pick. [TO CONFIRM]

---

## Scene 7. Department Insights: the five cards (about 1 minute 30 seconds)

**On screen:** Highlight the five cards. Open Sites (table, chart, click a year), then Site visitors (internal and external split, top ten most visited).

**Narration:**

Below the profile are five cards. Sites, site visitors, documents, records declared, and physical counterparts. As before, click any card, and its breakdown opens below, site by site.

The sites breakdown lists every site with its owner and the date it was created. So if you need to know who looks after a site, the answer is here. Filter it by year or by a date range. The chart shows sites created each year. Click a year, and it opens into months.

Site visitors counts the different people who opened each site in the last 180 days. It separates A D B staff from external guests, shows each site's type, and ranks the ten most visited sites.

Documents shows the files and storage on each site. Records declared shows the records, and the people declaring them, per site. And physical counterparts shows the paper share, per site.

---

## Scene 8. Department Insights: library usage (about 45 seconds)

**On screen:** Scroll to Library usage: summary figures, the table, the largest libraries chart.

**Narration:**

Finally, library usage goes one level deeper, into the document libraries inside each site.

For every library, you'll see its documents, records declared, physical counterparts, and active users, meaning the people who opened or edited files there. The chart shows the largest libraries.

The table is planned to show each site by its name rather than its web address, and to add the number of folders in each library. [TO CONFIRM]

This is where you spot which libraries are truly used for recordkeeping, and which are sitting quietly.

---

## Scene 9. Taking it with you: export (about 40 seconds)

**On screen:** Click Export on a table, show the Excel file. Then Export to PDF at the top right, show the PDF.

**Narration:**

You can take the report into a meeting. [TO CONFIRM]

Every table has an export button beside its search box. It saves all the rows to Excel, not just the page on screen, with your current sort and filter applied.

And at the top right of each dashboard, Export to PDF saves the dashboard exactly as you see it, including any breakdown you have open.

---

## Scene 10. Reading the numbers honestly (about 1 minute)

**On screen:** The "data as of" date in the corner. Then a slide: Agreed, To confirm, Input needed.

**Narration:**

Now, an important point before you quote any figure.

Check the data as of date in the corner. The report is refreshed on a schedule, weekly, so you always know how fresh the numbers are. [TO CONFIRM: refresh frequency, and whether records declared update in real time]

Every item in this release is in one of three states. Agreed, meaning it is settled. To confirm, meaning a decision is still open. And input needed, meaning a list or figure must come from R A C.

The inputs still needed are the approximate headcount per unit, the training completion list, and the Go-Live dates and site convention links for each department.

Until production data is loaded, the numbers you see are sample data. They show how the report works, not the Bank's actual usage.

---

## Scene 11. Wrap up (about 40 seconds)

**On screen:** Back to Bank-wide Oversight. End card with the report link and a contact.

**Narration:**

Let's recap. Bank-wide Oversight shows adoption across the whole Bank. Department Insights shows it one unit at a time. Every card is clickable. Every table can be exported. And always check the data as of date.

Project Insights, the Institutional File Plan, Retention and Disposal, and Records and Archive Holdings will follow in future releases.

Thank you for watching. Open the report, choose your own unit, and explore.

---

## Before recording: what to settle

The **[TO CONFIRM]** lines come from items RAC has not yet decided in the reconfirmation deck. After the session, keep each line if agreed and delete it if not:

| Scene | Item | Deck item |
| --- | --- | --- |
| 6 | Site filter beside the department picker | 9 |
| 8 | Site name instead of URL; folder count per library | 10, 11 |
| 9 | Excel and PDF export | 8 |
| 10 | Weekly refresh; records declared in real time | 12 |
| 11 | How future dashboards appear: greyed out (Option A) or hidden (Option B). If greyed out, add "You'll see them in the menu, greyed out." | 6 |

Also tell me:
1. **Where viewers open the report** (the SharePoint Utilization Report site?), so the link goes in Scene 11 and the end card.
2. **A contact name** for the end card.
3. **Whether the audience is users or the team taking over development.** For developers, Scene 10 should become a walk through the data sources and how the report is built.
