# Project context

## Read `STATUS.md` first. Before anything else, every time.

It is the complete record of the EDRMS Utilization Report: what is built, what is
proven against the test tenant, what is assumed, what is blocked and on whom, the
decisions already settled, and the mistakes made and corrected so they are not
repeated.

**It is written to be read in one pass and answer most questions without opening
another file.** Do that before reading the prototype, the database design or the
workbooks, and before asking the user to re-explain anything. Almost everything
asked in a new session is already answered there.

Then read **`BACKGROUND.md`** for the durable context: what ADB and the EDRMS
Utilization Report are, the tech stack, the ADB palette and the hard rules. It is
still correct on those, but it was written on 4 August 2026 and predates the
database design, the test tenant investigation and the August revisions.
**Where the two disagree, `STATUS.md` wins.**

There is also a skill at **`.claude/skills/edrms-utilization-report/`** covering
how to build, extend and verify the dashboards. It should trigger on its own for
any work on the Reporting Suite.

## Current deliverables

| File | What it is |
| --- | --- |
| `index.html` | The prototype. One self contained file, 5 dashboards |
| `EDRMS_Utilization_Report_Database_Design_v1.xlsx` | The database design in the client's workbook format. 4 tables, 73 columns, with a verification tracker |
| `utilizationdb.md` | The same design as prose, no code |
| `evidence_*.csv` | Real tenant exports, kept so claims can be checked rather than trusted |
| `EDRMS_Utilization_Report_Source_Data_v4.xlsx` | Element to source mapping. **Stale**, predates the August cut |

## The habit that has caught every real error

Do not trust an expected column name, an assumed API window, or a plausible
figure. Export the real file and read it. `STATUS.md` section 8 lists eleven
errors found that way, several of which had survived for weeks looking correct.

When something cannot be verified, say so and leave the cell blank. An
expectation written into a source column is indistinguishable from a verified
fact three weeks later.
