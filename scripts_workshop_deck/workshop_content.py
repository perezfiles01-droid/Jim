"""Content for slides 4-15 of the Confirmation Workshop deck.

Grounded in EDRMS_Util_Dashboard_Gap_Checker_2026-08-21.xlsx columns F
("Why it is not there") and G ("What it needs before it can be built").
No counts or tallies appear anywhere, by request.
"""

DASHBOARDS = {}

# ---------------------------------------------------------------- Bank-wide
DASHBOARDS["bankwide"] = dict(
    title="Bank Wide Oversight",
    purpose="One page answering how EDRMS is being used across the whole of ADB.",
    cards=[
        ("The single view",
         "Every measure rolled up to bank level, so adoption and compliance can be read without opening a department."),
        ("The starting point",
         "This is the page an executive opens first. Everything else in the report drills down from what is shown here."),
        ("Trend, not snapshot",
         "Activity is measured over a rolling window rather than a single day, so a quiet week does not read as a decline."),
    ],
    groups=[
        ("Users and activity",
         ["EDRMS users with recorded activity", "Sites with no access in 90 days",
          "Departments, offices and RMs covered"]),
        ("Records declared",
         ["Records declared", "People who declared a record",
          "Share of documents declared as records"]),
        ("Physical counterparts",
         ["Physical counterparts recorded", "Share of records with a counterpart"]),
        ("Retention position",
         ["Records due within 30 and 90 days", "Records due within 12 months"]),
    ],
    questions=[
        ("The Division list",
         "Give us the authoritative list of Divisions, and tell us which system holds the Division for a user or a site.",
         "DIVISION"),
        ("The user register",
         "A register of EDRMS users that flags each one as staff, contractor or consultant. No register we can reach carries employment type today.",
         None),
        ("Training completion",
         "Where EDRMS training completion is recorded, and whether we may read from it. No training system is connected to this project.",
         None),
        ("Go-live date per site",
         "A go-live date for each site — or your agreement that we use the site creation date in its place.",
         None),
    ],
    division_sections=[
        "Records declared per division",
        "Users declaring records per division",
        "Physical counterparts per division",
        "Division breakdown on the user panel",
    ],
)

# ------------------------------------------------------------- Department
DASHBOARDS["department"] = dict(
    title="Department Insights",
    purpose="The same measures as Bank-wide, cut by department, office and Records Management unit.",
    cards=[
        ("Compare like with like",
         "Departments side by side on the same measures, so a strong or weak performer is visible without a separate report."),
        ("Drill down to the source",
         "From department to site to library, so a number can always be traced to the place the activity happened."),
        ("The working page",
         "This is where a Records Officer spends their time. It is the largest and most detailed page in the report."),
    ],
    groups=[
        ("Profile",
         ["EDRMS compliant sites created", "Users with recorded activity",
          "Site visits"]),
        ("Content",
         ["Total documents", "Total documents size",
          "Records declared and who declared them"]),
        ("Engagement",
         ["Sites with no declared record in 180 days", "Access activity per site"]),
        ("Retention position",
         ["Due within 3, 6 and 12 months", "Records with a physical counterpart"]),
    ],
    questions=[
        ("The Division list",
         "The same list Bank-wide needs. One answer settles both pages — this is the single highest-value thing you can give us.",
         "DIVISION"),
        ("Internal and external visitors",
         "Which report separates site visitors into internal and external. We can currently report visits, but not who made them.",
         None),
        ("Site naming convention",
         "Is there an approved site, library and folder convention we can measure compliance against?",
         None),
        ("Access requests",
         "Are access requests granted and denied logged anywhere we can reach?",
         None),
    ],
    division_sections=[
        "Records declared per division",
        "Users declaring records per division",
        "Physical counterparts per division",
        "Per-library indicators by division",
    ],
)

# ---------------------------------------------------------------- Project
DASHBOARDS["project"] = dict(
    title="Project Insights",
    purpose="Project attributes set against the EDRMS activity of the sites that belong to them.",
    cards=[
        ("Activity in project terms",
         "The same EDRMS activity, grouped the way the business thinks — by project rather than by department."),
        ("Built and ready",
         "Every field and tile on this page is built in the prototype. You can see exactly how it will look and behave."),
        ("Waiting on a source",
         "What it does not yet have is a confirmed system to read project attributes from. That is the whole of the ask."),
    ],
    groups=[
        ("Project profile",
         ["Facility type", "Modality", "Country"]),
        ("Project status",
         ["Status", "Effectivity date", "Closing date"]),
        ("Linked activity",
         ["Records declared for this project", "Sites belonging to the project"]),
        ("Drill-through",
         ["From project to its sites", "From a site to its libraries"]),
    ],
    questions=[
        ("The system of record",
         "Which system holds facility type, modality, country, status, effectivity and closing date — and who owns it?",
         None),
        ("Read access",
         "Once named, can we be granted read access to it, and how often would it refresh?",
         None),
        ("Site to project register",
         "Is there a register mapping EDRMS sites to project IDs? Without it, site activity cannot roll up to a project.",
         None),
        ("If no register exists",
         "Would you accept us deriving the link by scanning site names, with the accuracy that implies?",
         None),
    ],
)

# -------------------------------------------------------- Institutional plan
DASHBOARDS["fileplan"] = dict(
    title="Institutional File Plan",
    purpose="The retention class hierarchy, and how records sit against it.",
    cards=[
        ("The reference page",
         "The agreed structure of the file plan, shown as it exists in the term store rather than as a document."),
        ("Coverage at a glance",
         "How much of what has been declared actually maps onto the plan, and where the plan is not being used."),
        ("Complete as drawn",
         "This page is built end to end. What we need from you here is confirmation rather than new information."),
    ],
    groups=[
        ("The hierarchy",
         ["Five top-level categories", "Terms within each category"]),
        ("Rollup",
         ["Total terms per category", "One screen per category"]),
        ("Usage",
         ["Records mapped against each term", "Terms with nothing declared against them"]),
        ("Navigation",
         ["Category to term drill-down", "Term to declared records"]),
    ],
    questions=[
        ("Is the structure right",
         "Does the hierarchy shown match your current approved file plan, including the category names?",
         None),
        ("Retired terms",
         "Are there terms that are deprecated but still present? Should they show, or be suppressed?",
         None),
        ("Change cadence",
         "How often does the file plan change, and who should we expect the updated structure from?",
         None),
        ("Anything missing",
         "This page carries no open gaps on our side. If something you expected is absent, this is the moment to say so.",
         None),
    ],
)
