/* ===================================================================
   data.js
   Sample data for the 2026.4 Reports Utilization prototype.

   Two rules govern this file.

   1. Nothing is a hard coded total. Every headline number is derived
      from the rows beneath it, so a department cannot be edited into
      a state where the executive summary disagrees with the
      department dashboard.
   2. Every dataset carries the tier that says where the real number
      would come from in the tenant. The tiers are defined in core.js
      and are the reason the DATA_SOURCES document and the dashboard
      cannot drift apart.

   These are illustrative figures shaped to look like ADB at this
   stage of rollout. They are not tenant extracts.
   =================================================================== */

/* ---------------------------------------------------------------
   Departments. The spine of the whole report.
   [code, name, goLive, sites, sitesActive, sitesInactive, libraries,
    docs, records, physical, users, visitors, storageGB]
   Orphaned sites are derived: sites - active - inactive.
   --------------------------------------------------------------- */
const DEPT_ROWS = [
  ["ITD",  "Information Technology",          "2024-03-04", 112, 89, 15, 742, 402100, 58420, 4180, 486, 1184, 2840.5],
  ["SARD", "South Asia Regional",             "2024-05-13",  98, 76, 14, 631, 331460, 41180, 3920, 412,  986, 2210.4],
  ["OSFG", "Sovereign Operations",            "2024-06-10",  92, 71, 13, 596, 308720, 36240, 3480, 368,  872, 2060.8],
  ["FIN",  "Finance",                         "2024-08-05",  86, 68, 11, 558, 291340, 39860, 3760, 352,  841, 1948.6],
  ["PARD", "Procurement and Administration",  "2024-09-16",  78, 60, 12, 502, 262880, 28310, 2810, 318,  762, 1642.2],
  ["HRD",  "Human Resources",                 "2024-11-04",  74, 58, 10, 476, 241600, 30450, 2340, 302,  718, 1510.9],
  ["SERD", "Southeast Asia Regional",         "2025-01-20",  71, 54, 11, 458, 232150, 25120, 2480, 288,  690, 1462.3],
  ["OGC",  "Office of the General Counsel",   "2025-02-17",  68, 55,  8, 441, 224900, 34980, 3640, 276,  662, 1408.7],
  ["EARD", "East Asia Regional",              "2025-03-24",  66, 50, 10, 428, 218300, 26740, 2610, 268,  641, 1362.5],
  ["BRM",  "Budget and Management Services",  "2025-05-12",  61, 47,  9, 394, 198400, 22190, 2180, 248,  592, 1240.1],
  ["CWRD", "Central and West Asia Regional",  "2025-06-23",  58, 44,  9, 373, 187600, 19860, 1940, 236,  564, 1174.6],
  ["PSOD", "Private Sector Operations",       "2025-08-11",  54, 41,  8, 348, 172300, 18420, 1620, 218,  518, 1078.4],
  ["SDCC", "Sustainable Development, Climate","2025-09-15",  51, 38,  8, 328, 156730, 15420, 1290, 208,  496,  978.5],
  ["SPD",  "Strategy, Policy and Partnerships","2025-11-03", 48, 35,  8, 310, 148900, 14730, 1180, 196,  468,  930.2],
  ["OAS",  "Administrative Services",         "2026-01-19",  40, 26,  8, 257,  95500,  9726,  982, 142,  338,  596.3]
];

const DEPTS = DEPT_ROWS.map(r => ({
  code:r[0], name:r[1], goLive:r[2],
  sites:r[3], sitesActive:r[4], sitesInactive:r[5], sitesOrphaned:r[3] - r[4] - r[5],
  libraries:r[6], docs:r[7], records:r[8], physical:r[9],
  users:r[10], visitors:r[11], storageGB:r[12],
  owner:"edrms.focal." + r[0].toLowerCase() + "@adb.org",
  get rate(){ return PCT(this.records, this.docs); },
  /* Density measures. Held as getters so a sort on the column sorts by the
     value the column actually prints, not by the underlying total. */
  get usersPerSite(){ return this.users / this.sites; },
  get visitorsPerSite(){ return this.visitors / this.sites; },
  get libsPerSite(){ return this.libraries / this.sites; }
}));
const DNAME = {};
DEPTS.forEach(d => DNAME[d.code] = d.name);

/* Bank wide totals, all derived. */
const sum = (arr, k) => arr.reduce((a, x) => a + (typeof k === "function" ? k(x) : x[k]), 0);
const T = {
  sites:          sum(DEPTS, "sites"),
  sitesActive:    sum(DEPTS, "sitesActive"),
  sitesInactive:  sum(DEPTS, "sitesInactive"),
  sitesOrphaned:  sum(DEPTS, "sitesOrphaned"),
  libraries:      sum(DEPTS, "libraries"),
  docs:           sum(DEPTS, "docs"),
  records:        sum(DEPTS, "records"),
  physical:       sum(DEPTS, "physical"),
  users:          sum(DEPTS, "users"),
  visitors:       sum(DEPTS, "visitors"),
  storageGB:      sum(DEPTS, "storageGB")
};
T.rate = PCT(T.records, T.docs);

/* ---------------------------------------------------------------
   Field offices. The requirement asks for the compliant site split
   by department AND by field office, so field offices are a second
   grouping of the same 1,057 sites, not an addition to them.
   [code, name, country, sites, active, inactive]
   --------------------------------------------------------------- */
const FIELD_ROWS = [
  ["HQ",   "Headquarters",              "Philippines", 612, 486, 78],
  ["INRM", "India Resident Mission",    "India",        62,  48,  9],
  ["PRCM", "PRC Resident Mission",      "PRC",          54,  42,  8],
  ["IRM",  "Indonesia Resident Mission","Indonesia",    48,  37,  7],
  ["VRM",  "Viet Nam Resident Mission", "Viet Nam",     44,  34,  6],
  ["BRMD", "Bangladesh Resident Mission","Bangladesh",  38,  29,  6],
  ["PRM",  "Pakistan Resident Mission", "Pakistan",     34,  25,  6],
  ["NRM",  "Nepal Resident Mission",    "Nepal",        28,  21,  4],
  ["SLRM", "Sri Lanka Resident Mission","Sri Lanka",    24,  18,  4],
  ["CARM", "Cambodia Resident Mission", "Cambodia",     21,  15,  4],
  ["UZRM", "Uzbekistan Resident Mission","Uzbekistan",  20,  14,  4],
  ["KARM", "Kazakhstan Resident Mission","Kazakhstan",  19,  13,  4],
  ["MNRM", "Mongolia Resident Mission", "Mongolia",     18,  12,  4],
  ["LRM",  "Lao PDR Resident Mission",  "Lao PDR",      18,  12,  4],
  ["OTH",  "Other field offices",       "Various",      17,  11,  4]
];
const FIELD = FIELD_ROWS.map(r => ({
  code:r[0], name:r[1], country:r[2],
  sites:r[3], active:r[4], inactive:r[5], orphaned:r[3] - r[4] - r[5]
}));

/* Sovereign and nonsovereign, a third grouping of the same sites. */
const PROJECT_SPLIT = [
  {k:"sov",   label:"Sovereign projects",     sites:0, active:0, inactive:0, orphaned:0,
   note:"Loans, grants and technical assistance to member governments"},
  {k:"nonsov",label:"Nonsovereign projects",  sites:0, active:0, inactive:0, orphaned:0,
   note:"Private sector operations, no sovereign guarantee"},
  {k:"corp",  label:"Corporate and administrative", sites:0, active:0, inactive:0, orphaned:0,
   note:"Sites not attached to a project, for example HR, budget, facilities"}
];
/* Fixed shares that reconcile to the site total exactly, remainder to corporate. */
(function(){
  const sov = {sites:498, active:392, inactive:64};
  const non = {sites:214, active:166, inactive:29};
  PROJECT_SPLIT[0].sites = sov.sites; PROJECT_SPLIT[0].active = sov.active; PROJECT_SPLIT[0].inactive = sov.inactive;
  PROJECT_SPLIT[1].sites = non.sites; PROJECT_SPLIT[1].active = non.active; PROJECT_SPLIT[1].inactive = non.inactive;
  PROJECT_SPLIT[2].sites = T.sites - sov.sites - non.sites;
  PROJECT_SPLIT[2].active = T.sitesActive - sov.active - non.active;
  PROJECT_SPLIT[2].inactive = T.sitesInactive - sov.inactive - non.inactive;
  PROJECT_SPLIT.forEach(p => p.orphaned = p.sites - p.active - p.inactive);
})();

/* ---------------------------------------------------------------
   Libraries. Used by every library level panel in the spec.
   [name, site, dept, docs, records, physical, storageGB,
    views, downloads, uploads, edits, users, lastActivityDays,
    hasOwner, retentionMapped]
   --------------------------------------------------------------- */
const LIB_ROWS = [
  ["Final Documents",       "ITD Records Site",        "ITD",  38420, 8420, 486, 412.6, 24810, 8420, 3120, 6240, 186,   3, 1, 1],
  ["Loan Agreements",       "FIN Treasury Site",       "FIN",  31280, 9860, 742, 386.4, 21460, 9210, 2480, 4820, 162,   1, 1, 1],
  ["Board Papers",          "OGC Legal Site",          "OGC",  26940, 8640, 618, 341.2, 19820, 7640, 1960, 3980, 148,   2, 1, 1],
  ["Country Reports",       "SARD Ops Site",           "SARD", 24180, 6420, 412, 298.7, 17240, 6180, 2240, 4120, 174,   4, 1, 1],
  ["Project Completion",    "OSFG Country Site",       "OSFG", 21460, 5840, 386, 412.9, 15680, 5420, 1840, 3240, 138,   6, 1, 1],
  ["Correspondence",        "PARD Procurement Site",   "PARD", 19820, 3210, 142, 186.3, 14210, 4120, 2680, 5140, 208,   1, 1, 1],
  ["Field Reports",         "SERD Ops Site",           "SERD", 18240, 4180, 298, 342.8, 12960, 4380, 1620, 2840, 126,   8, 1, 1],
  ["Case Files",            "OGC Compliance Site",     "OGC",  16420, 4620, 486, 214.6, 11840, 3920, 1240, 2160, 94,    5, 1, 1],
  ["Policies and Circulars","HRD People Site",         "HRD",  14860, 5240, 218, 128.4, 13420, 5680, 860,  1420, 342,   2, 1, 1],
  ["Procurement Notices",   "PARD Contracts Site",     "PARD", 13940, 2840, 96,  142.8, 9860,  3140, 1980, 3620, 118,  12, 1, 1],
  ["Minutes and Decisions", "BRM Budget Site",         "BRM",  12480, 4120, 186,  96.2, 8940,  2860, 1120, 2480, 108,   3, 1, 1],
  ["Legal Opinions",        "OGC Advisory Site",       "OGC",  11240, 3180, 264,  84.6, 7820,  2640, 740,  1320, 76,    9, 1, 1],
  ["Audit Reports",         "CWRD Ops Site",           "CWRD", 10680, 2460, 198, 112.4, 6940,  2180, 620,  1080, 68,   14, 1, 1],
  ["Investment Memoranda",  "PSOD Investments Site",   "PSOD",  9840, 2980, 176,  98.7, 6420,  2420, 840,  1460, 82,    7, 1, 1],
  ["Climate Briefs",        "SDCC Climate Site",       "SDCC",  8620, 1840, 84,   76.3, 5240,  1680, 720,  1240, 64,   21, 1, 1],
  ["Safeguards Documents",  "SDCC Safeguards Site",    "SDCC",  7940, 2140, 118,  88.9, 4820,  1520, 560,   980, 58,   16, 1, 1],
  ["Admin Records",         "OAS Facilities Site",     "OAS",   6820, 1420, 62,   52.4, 3860,  1140, 480,   860, 46,   34, 1, 1],
  ["Training Records",      "HRD Learning Site",       "HRD",   5940, 1680, 48,   41.8, 3240,   980, 420,   740, 92,   28, 1, 1],
  ["Consultant Reports",    "SPD Knowledge Site",      "SPD",   5240, 1240, 74,   63.2, 2840,   860, 380,   620, 41,   96, 1, 1],
  ["Mission Reports",       "EARD Ops Site",           "EARD",  4860, 1180, 92,   58.6, 2140,   680, 320,   540, 38,  128, 1, 1],
  ["Legacy Transfers 2019", "OAS Archive Site",        "OAS",   4180,     0,  0,   38.4,   240,    62,   0,     0,  6,  214, 0, 1],
  ["Shared Drive Migration","ITD Migration Site",      "ITD",   3860,     0,  0,   96.8,   180,    41,   0,     0,  4,  268, 0, 0],
  ["Working Files",         "SPD Strategy Site",       "SPD",   3240,     0,  0,   28.6,   620,   140,  86,   140, 18,  186, 1, 0],
  ["Scanned Backlog",       "PARD Records Site",       "PARD",  2940,     0,  0,   64.2,   320,    88,  42,    64,  9,  242, 0, 0]
];
const LIBS = LIB_ROWS.map(r => ({
  name:r[0], site:r[1], dept:r[2], docs:r[3], records:r[4], physical:r[5], storageGB:r[6],
  views:r[7], downloads:r[8], uploads:r[9], edits:r[10], users:r[11],
  lastActivityDays:r[12], hasOwner:!!r[13], retentionMapped:!!r[14],
  get activity(){ return this.views + this.downloads + this.uploads + this.edits; },
  get rate(){ return PCT(this.records, this.docs); }
}));

/* Library population counts. The 24 rows above are the visible sample;
   these are the bank wide counts the KPI cards report. */
const LIBSTATS = {
  total:            T.libraries,
  active90:         4218,
  active180:        5406,
  inactive90:       T.libraries - 4218,
  inactive180:      T.libraries - 5406,
  orphaned:          486,   /* no owner recorded */
  noDeclaredRecords: 1842,
  noRetentionMapping: 412,
  growthPriorTotal: 386420  /* records at the start of the period, for growth rate */
};
LIBSTATS.growthRate = PCT(T.records - LIBSTATS.growthPriorTotal, LIBSTATS.growthPriorTotal);

/* ---------------------------------------------------------------
   Monthly series. Twelve months to July 2026, then a partial August.
   --------------------------------------------------------------- */
const MONTHS = ["Sep 25","Oct 25","Nov 25","Dec 25","Jan 26","Feb 26","Mar 26","Apr 26","May 26","Jun 26","Jul 26","Aug 26"];
const SITES_CREATED  = [38, 42, 36, 24, 46, 51, 58, 44, 62, 55, 48, 21];
const SITES_ARCHIVED = [ 6,  8,  5,  4,  9,  7, 11,  8, 12, 10,  9,  4];
const SITE_ACTIVITY  = [612, 648, 631, 542, 686, 712, 748, 716, 782, 764, 738, 402]; /* sites with any activity */
const RECORDS_ACCESSED = [148620, 156240, 151480, 118240, 164820, 172640, 186240, 178420, 194860, 188240, 181620, 96420];

/* Records declared by year, summing to the record total. */
const RECORDS_BY_YEAR = [
  {x:"2022", y:42180}, {x:"2023", y:61240}, {x:"2024", y:88460},
  {x:"2025", y:121380}, {x:"2026", y:108386}
];
/* Records declared per month within 2026, summing to the 2026 year figure. */
const RECORDS_2026 = [
  {x:"Jan", y:11840}, {x:"Feb", y:12620}, {x:"Mar", y:13480}, {x:"Apr", y:12960},
  {x:"May", y:14210}, {x:"Jun", y:13890}, {x:"Jul", y:15420}, {x:"Aug", y:13966}
];
const RECORDS_THIS_MONTH = RECORDS_2026[RECORDS_2026.length - 1].y;

/* Classification. Doubles as the Security dashboard's classification split,
   which is why Restricted and Confidential are never typed twice. */
const CLASSIFICATION = [
  {label:"Internal",     value:268390, color:"var(--blue)"},
  {label:"Confidential", value:71240,  color:"var(--orange)"},
  {label:"Public",       value:62480,  color:"var(--teal)"},
  {label:"Restricted",   value:19536,  color:"var(--red)"}
];

/* Business process, aligned to the file plan top level terms. */
const BUSINESS_PROCESS = [
  {label:"Program and operation",   value:186240},
  {label:"Administration",          value:84320},
  {label:"People management",       value:62180},
  {label:"Compliance and oversight",value:58420},
  {label:"Risk management",         value:30486}
];

/* ---------------------------------------------------------------
   File plan. Managed metadata term store.
   --------------------------------------------------------------- */
const FILEPLAN = [
  {label:"Program and operation terms",   value:486, color:"var(--blue)"},
  {label:"Administration terms",          value:412, color:"var(--teal)"},
  {label:"People management terms",       value:268, color:"var(--green)"},
  {label:"Compliance and oversight terms",value:214, color:"var(--greyblue)"},
  {label:"Risk management terms",         value:106, color:"var(--orange)"}
];
const FILEPLAN_TOTAL = sum(FILEPLAN, "value");

/* ---------------------------------------------------------------
   Format and storage. The eight format groups are a decomposition of
   the declared record total, so they must sum to it. Asserted below.
   --------------------------------------------------------------- */
const FORMATS = [
  {label:"PDF",              files:178420, storageGB:4820.6},
  {label:"Word",             files:96310,  storageGB:1240.8},
  {label:"Excel",            files:54280,  storageGB:890.4},
  {label:"Email (.msg/.eml)",files:41870,  storageGB:620.5},
  {label:"PowerPoint",       files:28640,  storageGB:1680.2},
  {label:"Image files",      files:12940,  storageGB:1980.7},
  {label:"All other formats",files:6066,   storageGB:410.3},
  {label:"Video files",      files:3120,   storageGB:3420.9}
];
FORMATS.forEach(f => f.avgMB = f.storageGB * 1024 / f.files);
const FORMAT_FILES = sum(FORMATS, "files");
const FORMAT_GB = sum(FORMATS, "storageGB");

/* ---------------------------------------------------------------
   Physical records holdings. Opus is the system of record.
   --------------------------------------------------------------- */
const PHYSICAL_BY_LOCATION = [
  {label:"HQ Storage",     value:92410, color:"var(--blue)"},
  {label:"Field Offices",  value:34180, color:"var(--teal)"},
  {label:"Offsite Storage",value:16820, color:"var(--greyblue)"},
  {label:"Records Center", value:5210,  color:"var(--green)"}
];
const PHYSICAL_FILES = sum(PHYSICAL_BY_LOCATION, "value");
const PHYSICAL_LEGACY = 96240;
const PHYSICAL_CURRENT = PHYSICAL_FILES - PHYSICAL_LEGACY;
const PHYSICAL_BOXES = 18940;

const FACILITIES = [
  {name:"HQ Basement Vault B1",      loc:"HQ Storage",      files:48620, boxes:6180, capacity:7200, verified:"2026-05-18"},
  {name:"HQ Records Room 2F",        loc:"HQ Storage",      files:28940, boxes:3640, capacity:4000, verified:"2026-06-02"},
  {name:"HQ Annex Store",            loc:"HQ Storage",      files:14850, boxes:1920, capacity:2400, verified:"2026-04-11"},
  {name:"Iron Mountain Manila",      loc:"Offsite Storage", files:16820, boxes:2140, capacity:5000, verified:"2026-03-27"},
  {name:"ADB Records Center",        loc:"Records Center",  files:5210,  boxes:684,  capacity:1500, verified:"2026-06-20"},
  {name:"INRM Store, New Delhi",     loc:"Field Offices",   files:8940,  boxes:1180, capacity:1600, verified:"2026-02-14"},
  {name:"PRCM Store, Beijing",       loc:"Field Offices",   files:7420,  boxes:962,  capacity:1400, verified:"2026-01-30"},
  {name:"IRM Store, Jakarta",        loc:"Field Offices",   files:6180,  boxes:814,  capacity:1200, verified:"2025-12-08"},
  {name:"VRM Store, Ha Noi",         loc:"Field Offices",   files:5840,  boxes:748,  capacity:1100, verified:"2026-05-05"},
  {name:"Other field office stores", loc:"Field Offices",   files:5800,  boxes:672,  capacity:1000, verified:"2026-03-12"}
];

const INVENTORY = {
  unverified:      12340,
  missing:           486,
  dueForVerification:8920,
  scheduledTransfer: 4860,
  overdueTransfer:    892   /* physical records overdue for transfer, also a risk indicator */
};

/* ---------------------------------------------------------------
   Retention and disposition.
   --------------------------------------------------------------- */
const RETENTION = {
  dueForDisposition: 28410,
  dueWithin30:        3840,
  dueWithin90:        9620,
  awaitingApproval:   6280,
  completed:         14720,
  backlog:            8190,
  withSchedule:     398240,
  overdue:            4180,
  beyondRetention:    6940
};
RETENTION.withoutSchedule = T.records - RETENTION.withSchedule;
RETENTION.librariesUnmapped = LIBSTATS.noRetentionMapping;

/* ---------------------------------------------------------------
   Security and information classification.
   --------------------------------------------------------------- */
const SECURITY = {
  restricted:    CLASSIFICATION.find(c => c.label === "Restricted").value,
  confidential:  CLASSIFICATION.find(c => c.label === "Confidential").value,
  accessRequests:  1284,
  externalSharing:  386,
  permissionExceptions: 742,
  withLabels:    362180
};
SECURITY.withoutLabels = T.records - SECURITY.withLabels;

/* ---------------------------------------------------------------
   Search and usage analytics.
   --------------------------------------------------------------- */
const SEARCH = {
  performed:  184620,
  successful: 152310
};
SEARCH.successRate = PCT(SEARCH.successful, SEARCH.performed);
SEARCH.failed = SEARCH.performed - SEARCH.successful;

const SEARCH_CATEGORIES = [
  {label:"Loan and grant agreements",      value:28460},
  {label:"Board and management papers",    value:24180},
  {label:"Country partnership strategies", value:19840},
  {label:"Procurement and contracts",      value:17620},
  {label:"Consultant reports",             value:14280},
  {label:"HR policies and circulars",      value:12940},
  {label:"Safeguards documents",           value:10820},
  {label:"Audit and evaluation reports",   value:9640}
];

const TOP_RECORDS = [
  {title:"Country Partnership Strategy 2026 to 2030",    lib:"Country Reports",    site:"SARD Ops Site",      views:8420, downloads:3180},
  {title:"Procurement Policy Consolidated 2026",          lib:"Policies and Circulars", site:"HRD People Site",lib2:"", views:7240, downloads:4820},
  {title:"Board Paper, Capital Adequacy Framework",        lib:"Board Papers",       site:"OGC Legal Site",     views:6820, downloads:2140},
  {title:"Staff Regulations, 2026 revision",               lib:"Policies and Circulars", site:"HRD People Site",views:6180, downloads:5240},
  {title:"Annual Report 2025",                             lib:"Final Documents",    site:"ITD Records Site",   views:5940, downloads:4180},
  {title:"Standard Bidding Documents, Goods",              lib:"Procurement Notices",site:"PARD Contracts Site",views:5240, downloads:3860},
  {title:"Safeguard Policy Statement, update note",        lib:"Safeguards Documents",site:"SDCC Safeguards Site",views:4820,downloads:2640},
  {title:"Loan Agreement Template, sovereign",             lib:"Loan Agreements",    site:"FIN Treasury Site",  views:4180, downloads:3420},
  {title:"Travel and Expense Circular 2026",               lib:"Admin Records",      site:"OAS Facilities Site",views:3860, downloads:2180},
  {title:"Climate Finance Tracking Methodology",           lib:"Climate Briefs",     site:"SDCC Climate Site",  views:3240, downloads:1480}
];

/* ---------------------------------------------------------------
   Conventions and records management programme dates.
   A maintained reference list, not a system extract.
   --------------------------------------------------------------- */
const CONVENTIONS = {
  title:"EDRMS Naming, Filing and Declaration Convention",
  link:"https://adb.sharepoint.com/sites/RAC/EDRMS/Convention",
  approved:"2025-11-14",
  version:"3.2",
  updated:"2026-06-30",
  owner:"Records and Archives Committee (RAC)"
};
const PROGRAMME_DATES = [
  {label:"CSIS-IR audit of EDRMS", date:"2026-10-05", status:"Scheduled",
   note:"Internal audit fieldwork opens"},
  {label:"Convention review",      date:"2026-11-14", status:"Due",
   note:"Annual review of the naming and filing convention, one year from approval"},
  {label:"Refresher training due", date:"2026-09-30", status:"Due soon",
   note:"All departmental records focals, annual refresher"},
  {label:"Focals CoP schedule",    date:"2026-08-27", status:"Next session",
   note:"Community of practice, meets on the last Thursday of each month"}
];

/* ---------------------------------------------------------------
   Records quality.
   --------------------------------------------------------------- */
const QUALITY = {
  duplicates:   12480, /* same filename, same library, different item */
  orphaned:      3214, /* declared record whose library or site no longer resolves */
  declaredTwice: 1842  /* one item carrying two declaration rows */
};

/* ---------------------------------------------------------------
   Reconciliation guards. If a figure above is edited into an
   inconsistent state these fire in the console at load, which is
   cheaper than finding it in a steering committee.
   --------------------------------------------------------------- */
console.assert(FORMAT_FILES === T.records,
  "Format file counts must sum to total declared records", FORMAT_FILES, T.records);
console.assert(sum(CLASSIFICATION, "value") === T.records,
  "Classification must sum to total declared records");
console.assert(sum(BUSINESS_PROCESS, "value") === T.records,
  "Business process must sum to total declared records");
console.assert(sum(RECORDS_BY_YEAR, "y") === T.records,
  "Records by year must sum to total declared records");
console.assert(sum(RECORDS_2026, "y") === RECORDS_BY_YEAR[RECORDS_BY_YEAR.length - 1].y,
  "Monthly 2026 records must sum to the 2026 year figure");
console.assert(sum(FIELD, "sites") === T.sites,
  "Field office sites must sum to the compliant site total");
console.assert(sum(PROJECT_SPLIT, "sites") === T.sites,
  "Project split must sum to the compliant site total");
console.assert(sum(FACILITIES, "files") === PHYSICAL_FILES,
  "Facility file counts must sum to the physical file total");
console.assert(RETENTION.withSchedule + RETENTION.withoutSchedule === T.records,
  "Retention schedule split must sum to total declared records");
console.assert(SECURITY.withLabels + SECURITY.withoutLabels === T.records,
  "Sensitivity label split must sum to total declared records");

/* The as of line. Microsoft usage data runs about three days behind, so
   the report quotes the Microsoft refresh date, not the job run time. */
const ASOF = {
  edrms:"EDRMS data as of 10 Aug 2026",
  m365: "Microsoft 365 usage data as of 7 Aug 2026",
  opus: "Opus inventory as of 31 Jul 2026"
};
