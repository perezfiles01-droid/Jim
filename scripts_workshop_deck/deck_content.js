/* EDRMS Workshop deck content.
   Every figure and every question here is traceable to a cell in
   EDRMS_Util_Dashboard_Gap_Checker_2026-08-21.xlsx.
   Verified counts: 250 requirements, 193 built, 55 gaps, 2 blank.
   NOTE: the workbook's "Question to the client" column is empty on all six
   tabs. Questions below are derived from column G, "What it needs before it
   can be built", and column F, "Why it is not there" — not invented. */

const TOTALS = { reqs: 250, built: 193, gaps: 55, blank: 2 };

/* The six recurring dependencies. Counts are of requirement rows whose
   column G names that dependency. */
const DEPENDENCIES = [
  {
    n: 1,
    name: "User register with employment type",
    unblocks: 7,
    where: "Bank-wide, Department",
    quote: "No register of EDRMS users exists that carries employment type.",
    ask: "A register that flags each EDRMS user as staff, contractor or consultant.",
    owner: "HR / Identity management",
    fallback: "Report total users only. Drop the staff / contractor / consultant split."
  },
  {
    n: 2,
    name: "A definition and source for Division",
    unblocks: 7,
    where: "Bank-wide, Department",
    quote: "Division is currently not populated from any reports.",
    ask: "What Division means at ADB, and which system holds it per user or per site.",
    owner: "Records Management / HR",
    fallback: "Remove every per-division breakdown. Report at department level only."
  },
  {
    n: 3,
    name: "Training completion source",
    unblocks: 2,
    where: "Bank-wide, Department",
    quote: "No training system is connected to this project.",
    ask: "Where EDRMS training completion is recorded, and whether we can read it.",
    owner: "Learning & Development",
    fallback: "Drop training completion from both dashboards."
  },
  {
    n: 4,
    name: "Go-live date per site",
    unblocks: 2,
    where: "Bank-wide, Department",
    quote: "Needs both the user register and a go-live date per site.",
    ask: "A go-live date per site — or your agreement that site creation date stands in.",
    owner: "EDRMS rollout team",
    fallback: "Use site creation date as the proxy. Needs your sign-off."
  },
  {
    n: 5,
    name: "System of record for project attributes",
    unblocks: 20,
    where: "Project Insights",
    quote: "ASK. Which system holds project attributes, and who owns it.",
    ask: "Which system holds facility type, modality, country, status, effectivity and closing date — and who owns it.",
    owner: "Unknown — this is the key name we need",
    fallback: "Project Insights cannot be sourced. It stays a mockup."
  },
  {
    n: 6,
    name: "Site-to-project register",
    unblocks: 20,
    where: "Project Insights",
    quote: "ASK. A site to project register. Then SCAN.",
    ask: "A register mapping EDRMS sites to project IDs, so site activity can roll up to a project.",
    owner: "Records Management",
    fallback: "No link between sites and projects. Project Insights stays unsourced."
  }
];

const SLIDES = {
  bankwide: {
    title: "Bank-wide Oversight",
    reqs: 65, built: 44, gaps: 21,
    purpose: "Bank-wide counts of users, records declared, physical counterparts and records due for disposal.",
    builtNotes: [
      "Most built tiles were relabelled, not dropped",
      "\"Total EDRMS users\" → \"users with recorded activity, last 180 days\"",
      "\"Due for disposal\" → \"due within 30 / 90 days / 12 months\"",
      "Declaration rate built as \"share of documents declared as records\""
    ],
    gapClusters: [
      { label: "User composition", count: 5, dep: "Deps 1, 3, 4",
        detail: "Staff / contractor / consultant counts, training completion, onboarded since go-live" },
      { label: "Per-division breakdowns", count: 4, dep: "Dep 2",
        detail: "Records and users declaring, per division" },
      { label: "Disposal workflow", count: 7, dep: "No stated reason",
        detail: "Approver, status Approved / Declined / Extended, month-on-month, completion rate, overdue actions" },
      { label: "RAC physical custody", count: 1, dep: "None today",
        detail: "Turnover to RAC is a physical event no reachable system records" }
    ],
    questions: [
      { q: "Who owns the user register, and can we read employment type from it?",
        unblocks: "5 requirements", fallback: "Report total users only" },
      { q: "What is a Division at ADB, and which system holds it?",
        unblocks: "4 requirements", fallback: "Department-level reporting only" },
      { q: "Is site creation date acceptable as a stand-in for go-live?",
        unblocks: "1 requirement", fallback: "Drop onboarding metrics" },
      { q: "Why was the disposal workflow removed? Is it out of scope, or unsourced?",
        unblocks: "7 requirements", fallback: "We need your steer — no reason is recorded" },
      { q: "Is there any record of physical turnover to RAC we have not found?",
        unblocks: "1 requirement", fallback: "Confirmed dead end — drop it" }
    ]
  },

  department: {
    title: "Department Insights",
    reqs: 86, built: 59, gaps: 25,
    purpose: "The same measures as Bank-wide, cut by department, office and Records Management unit, with drill-down to site and library.",
    builtNotes: [
      "Largest tab: 86 requirements, 59 built",
      "\"Total site visitors\" → \"total site visits\" — visits, not unique people",
      "Disposal due dates rebuilt as 3 / 6 / 12 month bands",
      "Documents, size in GB and declaration counts all built"
    ],
    gapClusters: [
      { label: "User composition", count: 4, dep: "Deps 1, 3",
        detail: "Staff, contractor, consultant counts and training completion rate" },
      { label: "Per-division breakdowns", count: 4, dep: "Dep 2",
        detail: "Records declared, users declaring, per-library indicators by division" },
      { label: "Visitor split", count: 2, dep: "Source unidentified",
        detail: "Internal vs external visitors — which report shows this split?" },
      { label: "Access requests", count: 2, dep: "No stated reason",
        detail: "Requests granted and denied" },
      { label: "Disposal workflow", count: 7, dep: "No stated reason",
        detail: "Approver, statuses, records disposed per year and month, disposed size" },
      { label: "Site conventions & go-live", count: 2, dep: "Dep 4",
        detail: "Approved site / library / folder convention, go-live date" }
    ],
    questions: [
      { q: "Which report shows site visitors split by internal and external?",
        unblocks: "2 requirements", fallback: "Report total visits only, no split" },
      { q: "Is there an approved SharePoint site, library and folder convention we can measure against?",
        unblocks: "1 requirement", fallback: "Drop convention compliance" },
      { q: "Are access request grants and denials logged anywhere we can reach?",
        unblocks: "2 requirements", fallback: "Drop access request metrics" },
      { q: "Same user register and Division questions as Bank-wide — one answer settles both tabs",
        unblocks: "8 requirements", fallback: "See dependencies 1 and 2" },
      { q: "Does 'visits' rather than 'unique visitors' meet your need?",
        unblocks: "Confirms 2 built tiles", fallback: "Currently built as visits" }
    ]
  },

  project: {
    title: "Project Insights",
    reqs: 20, built: 20, gaps: 0,
    purpose: "Project attributes — facility type, modality, country, status, effectivity and closing date — against EDRMS site activity.",
    framing: "Every one of the 20 requirements is built in the prototype. Not one of them has a confirmed data source.",
    builtNotes: [
      "All 20 requirements present as working UI",
      "All 20 carry the same ASK in the workbook",
      "The dashboard is a mockup until a source is named"
    ],
    questions: [
      { q: "Which system holds project attributes — facility type, modality, country, status, dates?",
        unblocks: "All 20 requirements", fallback: "Project Insights stays a mockup" },
      { q: "Who owns that system, and can we get read access?",
        unblocks: "All 20 requirements", fallback: "No source, no dashboard" },
      { q: "Is there a register mapping EDRMS sites to project IDs?",
        unblocks: "Site-to-project rollup", fallback: "Site activity cannot roll up to a project" },
      { q: "If no register exists, can we derive the link by scanning site names?",
        unblocks: "Site-to-project rollup", fallback: "Workbook notes: \"The register. Then SCAN.\"" },
      { q: "Is project-level reporting in scope for this phase at all?",
        unblocks: "Scope decision", fallback: "Defer the whole tab to phase 2" }
    ]
  },

  filePlan: {
    title: "Institutional File Plan",
    reqs: 24, built: 24, gaps: 0,
    purpose: "The retention class hierarchy and how records map onto it.",
    status: "complete",
    questions: [
      { q: "We believe this tab is complete. Have we missed anything?",
        unblocks: "—", fallback: "Confirm and move on" },
      { q: "Does the file plan hierarchy shown match your current approved plan?",
        unblocks: "—", fallback: "Flag any structural changes now" }
    ]
  },

  retention: {
    title: "Retention and Disposal",
    reqs: 27, built: 18, gaps: 9,
    purpose: "Retention terms and disposal volumes across the bank.",
    flag: "All 9 gaps are marked only \"Removed.\" — no reason and no dependency is recorded in the workbook.",
    gapItems: [
      "Departments / Offices / RMs provisioned",
      "Number of libraries provisioned",
      "Number of records declared",
      "Number of physical counterparts",
      "Number of records due for disposal",
      "Number of records disposed  (appears twice)",
      "Term (Top level)  (appears twice)"
    ],
    questions: [
      { q: "These 9 items were removed with no reason recorded. Were they descoped deliberately?",
        unblocks: "9 requirements", fallback: "We need your decision before we can act" },
      { q: "Several duplicate measures already on Bank-wide. Is that the reason they were dropped?",
        unblocks: "Clarifies overlap", fallback: "Likely intentional de-duplication" },
      { q: "Is a top-level retention Term breakdown still wanted here?",
        unblocks: "2 requirements", fallback: "Drop the Term rows" }
    ]
  },

  archive: {
    title: "Records and Archive Holdings",
    reqs: 28, built: 28, gaps: 0,
    purpose: "Physical and digital archive holdings and their retention position.",
    status: "complete",
    questions: [
      { q: "We believe this tab is complete. Have we missed anything?",
        unblocks: "—", fallback: "Confirm and move on" },
      { q: "Does the holdings breakdown match how RAC actually reports its inventory?",
        unblocks: "—", fallback: "Flag discrepancies now" }
    ]
  }
};

module.exports = { TOTALS, DEPENDENCIES, SLIDES };
