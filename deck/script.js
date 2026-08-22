/* Word-for-word narration for the workshop script. Keyed by "dashboard|slide
   title" so it stays attached to the slide even if the deck is reordered.
   Written to be read aloud: short sentences, no jargon, no acronym the client
   has not used themselves. */
module.exports={
"Bank-wide Oversight|The ten headline figures":{
 does:"This strip of ten boxes is the top of the whole report. Six of them are counts — sites, people, documents, records declared, paper counterparts, and records coming up for disposal. Two of them tell you how many project sites exist, split sovereign and nonsovereign. The last two are not numbers at all: they are doors. Clicking them takes you to another dashboard.",
 say:"This is your slide 34, built. Every figure you drew is here, in the same order you drew it. If you click any one of these boxes, the table underneath the strip changes to show you what sits behind that number — so you are never looking at a total you cannot break apart. Two of them behave differently: Retention and Disposal insights, and Institutional File Plan insights. Those two are navigation. They take you somewhere else rather than opening a table.",
 flag:"Two labels are not word for word what you wrote, and I would rather point that out now than have you spot it later. Where you wrote total number of EDRMS users, the screen says users with recorded activity in the last 180 days. And where you wrote records due for disposal, it says due within twelve months. I will explain both when we get to those screens.",
 q:"Why did you change my labels?",
 a:"Because the original label would have been a promise the number cannot keep. We can see everyone who has used EDRMS. We cannot see everyone who has been given access but never opened it. Calling that total users would overstate it, and someone would eventually notice. The label says exactly what the number is."},

"Bank-wide Oversight|Sites, department by department":{
 does:"One row per department, office or resident mission, with how many sites it has and what those sites hold. The four small figures on the right are your indicators: sites created, sites deleted, sites archived, and sites that have had no activity for ninety days.",
 say:"This is the table behind the first box. Every department, every office, every resident mission, one row each. And every one of these names is clickable — click a department name and the whole report jumps to that department's own dashboard, already filtered. That is the drill-down you asked for on slide 35.",
 flag:"The inactive-site indicator is worth pausing on. A site with no activity for ninety days is either finished, or forgotten. This tells you which ones to go and ask about.",
 q:"Can we change ninety days to something else?",
 a:"Yes, easily. It is a setting, not a rebuild. If sixty days or a hundred and eighty is more useful to you, say so and we will change it."},

"Bank-wide Oversight|Project sites, sovereign and nonsovereign":{
 does:"Two lists, one for sovereign projects and one for nonsovereign, each with the project number, the project name, and what its sites hold. The last row is the total for that whole facility type.",
 say:"Slides 36 and 37, both here, with your column names word for word. Click any project row and you land in Project Insights for that project. The bottom row is the total for all sovereign projects — not just the ones named above it — because your own slide ends the list with the word Etc.",
 flag:"The figures on this screen are illustrative. That is the Project Insights problem and I will come to it properly in view three.",
 q:"Where did these project numbers come from?",
 a:"They are real project numbers, but the site counts against them are made up, because nothing today tells us which SharePoint site belongs to which project. That is the single question I most need answered today."},

"Bank-wide Oversight|Users":{
 does:"How many people are actually using EDRMS, and how engaged they are. Three indicators: what share are active, how many have never opened it, and how many have not been in for ninety days.",
 say:"Here is where the report is strongest and weakest at the same time. We can see activity very well. We can tell you who used EDRMS this month, who has not been in since March, and who has never opened it at all. What we cannot do is tell you anything about who those people are.",
 flag:"Six of the ten things you asked for on this screen are red. Staff, contractors and consultants as separate counts. Training completion. Who joined since go-live. Which department each person belongs to. All six need the same thing: a list that says what kind of person each user is.",
 q:"Surely the system knows who is staff and who is a consultant?",
 a:"SharePoint knows there is an account. It does not know what that account is contractually. That distinction lives in HR, or in a directory, and nobody has yet pointed us at it. It is one line of information per person and it would unblock six items on this screen alone."},

"Bank-wide Oversight|Documents":{
 does:"How many documents are in EDRMS and how much space they take up, across the whole bank.",
 say:"Document counts and storage size, both real, both coming from live data. This is one of the more solid screens in the report.",
 flag:"What is missing here is history. We can tell you where you are today. We cannot tell you where you were last month, because nothing is keeping a monthly record. The good news is this one we can fix ourselves — we just need your agreement to start taking a monthly snapshot. The catch is that the history only starts building from the day we switch it on, so the sooner that is agreed, the sooner the trend lines become useful.",
 q:"How far back can you go if we start now?",
 a:"Nowhere, honestly. Month one gives you a number. Month three starts to give you a trend. That is why starting early matters more than getting it perfect."},

"Bank-wide Oversight|Records declared":{
 does:"How many records have been formally declared, how many people are doing the declaring, and the declaration rate — declared records as a share of documents held.",
 say:"This is the number your programme is judged on, so it gets its own screen. Records declared, people declaring, and the rate. The rate is the one to watch: it tells you whether people are filing properly or just storing files.",
 flag:"Departments that have declared nothing at all are flagged separately, so you have a list to go and chase rather than a number to worry about.",
 q:"What is a good declaration rate?",
 a:"That is genuinely your call, not ours. The report will show you the number and rank departments against each other. Whether seventy per cent is good or bad is a policy question."},

"Bank-wide Oversight|Physical counterparts":{
 does:"A physical counterpart is a declared record that also exists on paper. This screen counts them and shows what share of declared records have one.",
 say:"This is the bridge between the digital report and the physical archive. Every record here is one that exists both in EDRMS and as paper somewhere.",
 flag:"What we cannot show is whether that paper ever reached RAC. The system records that a paper copy exists. Nothing records that it was handed over. Your slide 42 asked for a turned-over-to-RAC completion rate, and that is why it is red.",
 q:"Does RAC not keep a record of what it receives?",
 a:"Very likely it does — but we have never seen it, and we do not know whether it can be matched back to the record in EDRMS. That is a question for the physical records conversation later in this deck."},

"Bank-wide Oversight|Records due for disposal":{
 does:"Everything with a retention period that is running out. What is due, when the next due date falls, and whether there is paper alongside it.",
 say:"Everything on the left of this screen works. We can tell you what is due for disposal, when, and whether there is a paper copy to deal with as well. That is real, and it comes from the retention labels that are already being applied.",
 flag:"Everything about what happened next does not work, and it is not because we did not look. Disposal is not built in EDRMS yet. There is no screen where anyone approves a disposal and no field where the outcome gets written down. Seven of the eleven items here are waiting on that, and I have a slide on it later.",
 q:"So how do disposals happen today?",
 a:"That is exactly what I need to understand. If it is happening by email or in a meeting, that is fine — it just means the report cannot see it until the Disposal release gives it somewhere to live."},

"Bank-wide Oversight|Trends and comparisons":{
 does:"A curve showing records declared building up over time, and a panel that ranks departments against each other on three ratios.",
 say:"Two things here. The curve is cumulative, so the last point is your running total to date, not this month's figure. You can drag the date range and the two summary figures underneath follow. And above it, the comparison panel ranks departments on three named ratios so you can see who is ahead and who needs a nudge.",
 flag:"This whole screen is built and sourced. Nothing red.",
 q:"Can we export this?",
 a:"In the finished Power BI version, yes — export is standard. This prototype is a specification of what to build, so it does not have it wired up."},

"Department Insights|The department profile":{
 does:"The same headline figures as bank-wide, but for one department at a time. Pick a department at the top and everything on the screen follows it.",
 say:"This is bank-wide narrowed to one unit. Choose a department from the picker at the top and every figure, every table and every chart below changes to match. Seven headline figures, all clickable, all opening a breakdown underneath.",
 flag:"Two things you asked for are not on the profile. One is the approved naming convention — whether this department's sites and libraries follow the standard. The other is the go-live date. We would need both from you.",
 q:"Why do you need the naming convention written down?",
 a:"Because to tell you whether a site follows the rule, we have to know the rule. If it is documented anywhere, we can check all 1,032 sites against it automatically in one pass."},

"Department Insights|Users and activity":{
 does:"Who in this department is using EDRMS: active in the last 180 days, gone quiet, or never opened it.",
 say:"Three groups: used it recently, used it once but not lately, and never touched it. That third group is usually the interesting one for a department head.",
 flag:"Same gap as bank-wide. We can count them, we cannot say what kind of person each one is. And training completion is asked for here too.",
 q:"Can we see individual names?",
 a:"Technically yes, and the underlying data has them. Whether the report should show individuals or only counts is a decision for you — there are privacy implications and we would rather you set that line than us."},

"Department Insights|This department’s sites":{
 does:"Every site the department owns, who owns each one, and what each holds.",
 say:"Every site in the department, with a named owner against each. All six columns you drew are here.",
 flag:"Nothing red on this screen. It is complete.",
 q:"Where does the site owner come from?",
 a:"From SharePoint itself — it is the recorded owner of the site. If those are out of date, the report will faithfully show you out-of-date owners, which is arguably useful in itself."},

"Department Insights|Site visitors":{
 does:"How much each site is actually being looked at. Page views, how many different pages were opened, and quick buttons for the last seven, thirty, ninety or a hundred and eighty days — or pick any month and year.",
 say:"This tells you whether a site is being used or just exists. Page views and unique pages visited, per site. The buttons across the top give you quick windows, and if you want a specific month you can pick one.",
 flag:"Four items here are red, and they are all the same underlying problem: we cannot tell an ADB person from an outside visitor. So internal versus external, and access requests granted versus denied, cannot be built yet.",
 q:"Do outsiders really access these sites?",
 a:"We honestly do not know, and that is part of why you asked for the split. Until we can tell the two apart, neither of us can answer that with confidence."},

"Department Insights|Documents":{
 does:"How many documents this department has created or uploaded, and how much space they take, broken down site by site.",
 say:"Counts and storage, per site, so you can see which sites are doing the work and which are quiet.",
 flag:"One red item: how many people are creating documents. We can count documents easily; counting the distinct people behind them needs a different kind of report than the one we have access to today.",
 q:"Is that a big change?",
 a:"Probably a change request rather than a quick fix. Worth flagging now so it is not a surprise later."},

"Department Insights|Records declaration":{
 does:"Records declared by this department, how many people are declaring, the total size of what has been declared, and which sites have gone quiet.",
 say:"Records declared, people declaring, and total declared size. Sites that have not declared anything in a hundred and eighty days are called out separately.",
 flag:"Only the two per-division items are missing, and division is one problem that shows up on six different screens. I will cover it once, on the questions slide.",
 q:"What counts as a site going quiet?",
 a:"No new declaration in a hundred and eighty days. Same as the user threshold, and equally adjustable if you want a different number."},

"Department Insights|Physical counterparts":{
 does:"Which of this department's sites hold records that also exist on paper, and what share that is.",
 say:"Which sites in this department are generating paper as well as digital records. Useful for knowing who to talk to about transfers.",
 flag:"Same handover gap as bank-wide: we can see the paper is supposed to exist, not that it was moved.",
 q:"",
 a:""},

"Department Insights|Disposal":{
 does:"What this department has coming up for disposal, in three windows: three months, six months and twelve months.",
 say:"Three windows rather than one, because a department head plans differently for next quarter than for next year. Next due date and whether there is paper alongside are both here.",
 flag:"Six of the twelve items are red and every one of them is about what happened after the disposal was due. Same reason as bank-wide. This is the release-sequencing conversation.",
 q:"",
 a:""},

"Department Insights|Library usage":{
 does:"Which libraries the department has, and what each one holds.",
 say:"You drew this as six screens, one per file plan category. We have the library table, with documents, records and counterparts against each library.",
 flag:"What we cannot do is group them into your six categories, because nothing today says which category a library belongs to. That is the file plan problem, and it is the next dashboard.",
 q:"Can you not tell from the library name?",
 a:"Sometimes, maybe. But a rule that works most of the time produces a report that is wrong some of the time, and you would never know which rows. If there is a real mapping somewhere we would much rather use it."},

"Project Insights|The project list":{
 does:"All the projects, split sovereign and nonsovereign, with what their sites hold. Click any project to open it.",
 say:"Switch between sovereign and nonsovereign with the picker. Click any project row and its full profile opens below. And the totals hold together — the projects named here sit inside the facility total, which sits inside your bank-wide total. Those checks run automatically every time the screen draws.",
 flag:"Every figure on this dashboard is illustrative. The layout is right. The numbers are invented. I will explain why in a moment.",
 q:"",
 a:""},

"Project Insights|The project profile and its seven figures":{
 does:"Eight facts about the project — facility type, number, modality, country, status, effectivity and closing dates — then seven figures, each of which opens a site-by-site table.",
 say:"All eight details you drew on slide 38, in the order you drew them. Then the seven figures across the top, and every single one of them opens a table underneath showing you site by site. And the site rows always add back up to the project total — a site can never show more records declared than documents held, because the report checks that itself.",
 flag:"Those eight details clearly live in an ADB project system. In all this work, nobody has ever told us which one. That is the second of my two questions on this dashboard.",
 q:"",
 a:""},

"Project Insights|The three charts":{
 does:"Three pictures: how the project's users split between staff, consultants and contractors; how declarations have built up over time; and how each site compares on documents against records declared.",
 say:"The user mix uses your own three-way split. The curve is cumulative, so it ends at the project's declared total. And the bottom chart is the interesting one — it shows you why one site on a project declares almost everything and another declares almost nothing. That difference is the thing worth acting on.",
 flag:"You drew the declaration rate on a second axis. We have printed it as a percentage alongside instead, because a dual axis is supported in Power BI but reads badly at this width. If you would rather have the second axis, say so.",
 q:"",
 a:""},

"Institutional File Plan|The five categories":{
 does:"Your five file plan categories and a total row, with how many terms each has and what sits under them.",
 say:"Five categories and a total, with your column names. The total row is checked against the bank-wide figures automatically, so this screen cannot quietly disagree with the rest of the report.",
 flag:"One column is honest but weak: departments provisioned. We have assigned each department to a category by hand. It is not measured, and that is the whole problem with this dashboard.",
 q:"Why is there an Other category?",
 a:"Because your slide 47 has one, and your slide 29 does not. We followed the detailed screen. If Other should not exist, that is easy to remove."},

"Institutional File Plan|Inside one category":{
 does:"Every top-level term inside a category, with five summary figures above and two charts below showing most-used and least-used terms.",
 say:"You drew five separate screens, one per category. We built one screen with a picker, because the only thing that changes between your five slides is which category is in view. Everything else is identical.",
 flag:"The per-term department column is drawn but empty — it prints the word illustrative on every row. We can assign departments to a category. We cannot assign them to an individual term, because nothing links a term to anything.",
 q:"Would five separate screens be better?",
 a:"For a Power BI build, one screen with a picker is less to maintain and behaves identically for the user. But if your users expect five tabs, we can do five tabs."},

"Institutional File Plan|Unused terms":{
 does:"Terms nobody is using, with how many times each has been used, when it was last touched, and why it has been flagged.",
 say:"This is the list you would work from if you were tidying up the file plan. Terms with almost no use, and when they were last touched.",
 flag:"Illustrative until we can measure real usage.",
 q:"",
 a:""},

"Institutional File Plan|Libraries created outside convention":{
 does:"Libraries that do not follow the standard naming or structure.",
 say:"Libraries that look like somebody went off-script. Name, office, category, document count and when it was created.",
 flag:"To make this real we need the convention itself, which is the same thing I asked for on Department Insights.",
 q:"",
 a:""},

"Institutional File Plan|Requests waiting for a decision":{
 does:"Requests for a new library, a new term, or the deletion of either — all in one place, with who asked and what state it is in.",
 say:"Four kinds of request in one table: new library, new term, library deletion, term deletion. Requestor, status and date submitted on each.",
 flag:"The last two rows on the checklist are not about this screen. They are the two gaps that govern this entire dashboard, and I am going to spend a minute on them on the next slide.",
 q:"",
 a:""},

"Retention and Disposal|Permanent against temporary":{
 does:"Six figures splitting the estate into what must be kept forever and what has an end date: sites, libraries and records for each.",
 say:"Permanent and temporary, side by side. Sites, libraries and records for each. This comes from retention labels that are genuinely being applied today, so it is real.",
 flag:"Your slide 44 had a summary table across the top with six columns. It was taken out, because most of its columns repeat what the screens below already show. I want your view on whether to put it back.",
 q:"",
 a:""},

"Retention and Disposal|Permanent retention":{
 does:"Everything that must be kept indefinitely, listed by department, with sites, libraries, records and paper counterparts.",
 say:"Everything that must be kept indefinitely, department by department. All five of your columns are here.",
 flag:"One column is missing: the file plan term. Same reason as the file plan dashboard — nothing links a record to a term.",
 q:"",
 a:""},

"Retention and Disposal|Temporary retention":{
 does:"The same view for records that have an end date, with a filter so you can look at just the three-year records, or just the ten-year.",
 say:"Same shape, for records that will eventually expire. The filter across the top lets you isolate a single retention period — just the seven-year records, for instance.",
 flag:"What is not here is anything already disposed of. That is the release conversation, coming up.",
 q:"",
 a:""},

"Retention and Disposal|Retention labels":{
 does:"Every declared record grouped by the retention label actually applied to it.",
 say:"This is one of the most solid panels in the whole report, because it comes straight from the labels in the system. It is also a good check on yourselves: if a label shows up here that nobody expected, that is worth knowing.",
 flag:"",
 q:"",
 a:""},

"Records and Archive Holdings|What we can and cannot see":{
 does:"The top of the physical archive dashboard. One figure is real; the rest are placeholders.",
 say:"I want to be straight with you about this dashboard before we look at it. One figure here is real — how many declared records are marked as having a paper copy. Everything else you are about to see is invented.",
 flag:"I am not showing it to impress you. I am showing it so you can tell me whether the layout is right, because when the physical sources exist, this is what we would build.",
 q:"",
 a:""},

"Records and Archive Holdings|Storage":{
 does:"What is held at each storage location: requests, requestors, boxes, folders and remarks. Below it, how much was stored each month and how full each room is.",
 say:"All seven columns from your slide 68, with your own wording. Three locations: Archives Room, Records Center, Offsite Storage. Underneath, storage activity by department over six months, and a bar showing how full each room is.",
 flag:"Every number is illustrative. And some of them are worse than illustrative — six figures on this dashboard are redrawn every time the page loads, so if I refresh right now they will change. Please do not quote any figure from this screen.",
 q:"",
 a:""},

"Records and Archive Holdings|Retrieval":{
 does:"What is being taken out of the archive: requests, requestors, boxes and folders retrieved, and what happens to them.",
 say:"All seven columns from your slide 69, and your own three status words: Loan, Return to owner, For Disposal.",
 flag:"Your slide 67 says retrieval is processed from eServe. We have never reached eServe, so every row here is invented.",
 q:"",
 a:""},

"Records and Archive Holdings|Activity, disposal and capacity":{
 does:"Retrieval by department over time, what was disposed of, and how much storage that freed.",
 say:"This answers the last of your indicators: retrieval month on month, boxes and folders disposed, and the capacity that freed up.",
 flag:"The layout answers everything you asked for. None of it is measured. That is the conversation on the next slide.",
 q:"",
 a:""}
};
