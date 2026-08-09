# Project context

**Read `STATUS.md` first.** It is where the EDRMS Utilization Report actually
stands: what is buildable today, what is blocked and on whom, the evidence
gathered from the test tenant, the key identifiers, and what to do next. It is
the file that changes every session.

Then read **`BACKGROUND.md`** for the durable context: what ADB and the EDRMS
Utilization Report are, the tech stack, the data model, the deliverable's
internal structure, the ADB palette and the hard rules (including no em dashes in
visible text), and how to run and verify. It is still correct on all of that, but
it was written on 4 August 2026 and predates the database design work and the
test tenant investigation. Where the two disagree, `STATUS.md` wins.

There is also a skill at **`.claude/skills/edrms-utilization-report/`** that
covers how to build, extend, and verify the dashboard suite. It should trigger on
its own for any work on the Reporting Suite. It bundles a verification script,
the workbook generators, and reference files on the design system, the data
sources, and what each dashboard currently contains.

## Current deliverables

| File | What it is |
| --- | --- |
| `index.html` | The prototype. One self contained file, 5 dashboards plus a Data Design page |
| `utilizationdb.md` | The database design, two tables and 58 columns, in the client's workbook format |
| `EDRMS_Utilization_Report_Source_Data_v4.xlsx` | The working document. Every element mapped to its source, plus gaps, actions and 25 findings |

v1 to v3 of the workbook are kept for the audit trail. **v4 is current, and a v5
is warranted** for the reason given in `STATUS.md` section 9.
