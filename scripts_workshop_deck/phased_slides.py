"""Slides 12-15: Retention & Disposal, and Records & Archive Holdings.

Both carry a scope boundary rather than a data gap, so they get their own
layout: a two-track split showing what this release covers against what is
deferred, then a Now/Future roadmap carrying the proposal.
"""

CONTENT = {
    "retention": dict(
        title="Retention & Disposal",
        purpose="Retention is reportable today. Disposal is not yet a capability of the platform.",
        now_head="Retention — in this release",
        now_body="The platform holds retention policy, so retention position is readable now.",
        now_items=[
            "Retention labels applied across the estate",
            "Records approaching the end of their term",
            "Coverage: what carries a label and what does not",
            "Retention terms as they sit in the file plan",
        ],
        later_head="Disposal — not yet built",
        later_body="Disposal is a release in its own right, not a missing report.",
        later_items=[
            "Disposal approver and approval routing",
            "Approved, declined and extended outcomes",
            "Records actually disposed, over time",
            "Disposal completion and overdue actions",
        ],
        why_head="Why disposal cannot be reported yet",
        why_body=("The disposal requirements assume a review and confirmation step — someone approves, "
                  "declines or extends, and the outcome is recorded. No system in place today performs "
                  "or records that step, so there is nothing for the report to read."),
        prop_head="What we propose",
        prop_body=("Build the retention reporting now, on the policy the platform already holds. "
                   "Treat disposal reporting as a defined future increment, taken up once a disposal "
                   "capability is released."),
        phases=[
            ("THIS RELEASE", "Retention reporting",
             "Position, coverage and terms, from retention policy as it stands today."),
            ("FUTURE RELEASE", "Disposal capability",
             "The approval workflow itself is delivered as a product release."),
            ("FOLLOWS IT", "Disposal reporting",
             "Once disposal events exist and are recorded, these requirements are added to this page."),
        ],
        questions=[
            ("Does the split work for you",
             "Are you content to confirm retention reporting now and hold disposal reporting for a later increment?"),
            ("Who approves a disposal",
             "When the capability arrives, who holds the decision — and should the report show the approver by name?"),
            ("What must be evidenced",
             "Does your audit position require a record of every disposal decision, including declines and extensions?"),
        ],
    ),
    "archive": dict(
        title="Records & Archive Holdings",
        purpose="A separate system of record is needed before these requirements can be sourced.",
        now_head="What the requirement asks for",
        now_body="A full picture of holdings, physical and digital, wherever they are kept.",
        now_items=[
            "Holdings by location and by custodian",
            "Physical counterparts identified and tracked",
            "Condition and storage position",
            "Retrieval and movement of holdings",
        ],
        later_head="Where we stand today",
        later_body="We have not identified a system that holds this information.",
        later_items=[
            "No source system identified for holdings",
            "Physical custody events are not systematically recorded",
            "Location and condition are not held anywhere we can read",
            "This is a domain in its own right, not a report gap",
        ],
        why_head="Why this is a separate release",
        why_body=("Archive holdings management is a system, not a view. It needs a place where holdings are "
                  "registered, custody is transferred and condition is recorded. Until that exists, there is "
                  "no data for a report to draw on, however the page is designed."),
        prop_head="What we propose",
        prop_body=("Confirm the requirement as valid and keep the design on file. Take it up as a reporting "
                   "increment once a system of record for archive holdings is established and is "
                   "recording custody."),
        phases=[
            ("THIS RELEASE", "Requirement confirmed",
             "We agree the requirement and keep the intended design, without committing to a build date."),
            ("FUTURE RELEASE", "System of record established",
             "A system registers holdings and records custody and condition."),
            ("FOLLOWS IT", "Holdings reporting",
             "With a source in place, these requirements are built into the report."),
        ],
        questions=[
            ("Does a source already exist",
             "Is there a register, database or spreadsheet holding archive information that we have not been shown?"),
            ("Who owns the archive",
             "Which team is accountable for physical holdings today, and how do they currently track them?"),
            ("Is the phasing acceptable",
             "Are you content to confirm the requirement now and schedule the build once a source exists?"),
        ],
    ),
}


def register_all(register, B, M, CW):
    def two_track(d):
        x = B.title(d["title"])
        x += B.subtitle(d["purpose"])

        colw = (CW - 0.34) / 2

        # left: what we can do
        x += B.panel(M, 1.14, colw, 2.30, fill="EAF7F4", line=B.TEAL)
        x += B.shape(M, 1.14, colw, 0.055, fill=B.TEAL)
        x += B.text(M + 0.18, 1.28, colw - 0.36, 0.26, d["now_head"],
                    size=1250, color=B.NAVY, bold=True)
        x += B.text(M + 0.18, 1.56, colw - 0.36, 0.34, d["now_body"],
                    size=950, color=B.INK, anchor="t", line_spc="92000")
        x += B.bullet_rows(M + 0.18, 1.98, colw - 0.36, d["now_items"],
                           gap=0.30, size=930, color=B.TEAL)

        # right: what is deferred
        rx = M + colw + 0.34
        x += B.panel(rx, 1.14, colw, 2.30, fill="F7F8F9", line="C9D2D7")
        x += B.shape(rx, 1.14, colw, 0.055, fill="9AA7AE")
        x += B.text(rx + 0.18, 1.28, colw - 0.36, 0.26, d["later_head"],
                    size=1250, color="5A6B75", bold=True)
        x += B.text(rx + 0.18, 1.56, colw - 0.36, 0.34, d["later_body"],
                    size=950, color=B.MUTE, anchor="t", line_spc="92000")
        x += B.bullet_rows(rx + 0.18, 1.98, colw - 0.36, d["later_items"],
                           gap=0.30, size=930, color="9AA7AE")

        # the explanation
        x += B.panel(M, 3.62, CW, 1.32, fill=B.PANEL, line=B.BORDER)
        x += B.shape(M, 3.62, 0.055, 1.32, fill="E67C3B")
        x += B.text(M + 0.24, 3.76, 6.0, 0.24, d["why_head"].upper(),
                    size=1000, color="E67C3B", bold=True, spc=105)
        x += B.text(M + 0.24, 4.04, CW - 0.5, 0.80, d["why_body"],
                    size=1000, color=B.INK, anchor="t", line_spc="94000")
        return B.wrap_slide(x, d["title"])

    def roadmap(d):
        x = B.title(d["title"])
        x += B.subtitle("Our proposal, and what we need you to confirm.")

        # proposal band
        x += B.panel(M, 1.10, CW, 0.86, fill=B.BAND, line=B.BANDLN)
        x += B.shape(M, 1.10, 0.055, 0.86, fill=B.TEAL)
        x += B.text(M + 0.24, 1.20, 4.0, 0.22, d["prop_head"].upper(),
                    size=1000, color=B.NAVY, bold=True, spc=105)
        x += B.text(M + 0.24, 1.44, CW - 0.5, 0.46, d["prop_body"],
                    size=1000, color=B.INK, anchor="t", line_spc="92000")

        # three-phase track
        pw = (CW - 2 * 0.30) / 3
        for i, (tag, head, body) in enumerate(d["phases"]):
            px = M + i * (pw + 0.30)
            active = i == 0
            accent = B.TEAL if active else "9AA7AE"
            x += B.shape(px, 2.20, pw, 0.05, fill=accent)
            x += B.chip(px, 2.33, 1.32, 0.22, tag,
                        fill=accent if active else "E7EBED",
                        color=B.WHITE if active else "5A6B75", size=800)
            x += B.text(px, 2.64, pw, 0.26, head, size=1150,
                        color=B.NAVY if active else "5A6B75", bold=True)
            x += B.text(px, 2.94, pw - 0.12, 0.62, body, size=930,
                        color=B.INK if active else B.MUTE,
                        anchor="t", line_spc="92000")
            if i < 2:
                x += B.text(px + pw + 0.03, 2.60, 0.24, 0.28, "\u2192",
                            size=1200, color="9AA7AE", bold=True, align="ctr")

        # questions
        x += B.caps(M, 3.74, 5.0, "WHAT WE NEED YOU TO CONFIRM")
        qw = (CW - 2 * 0.30) / 3
        for i, (h, b) in enumerate(d["questions"]):
            qx = M + i * (qw + 0.30)
            x += B.numbered(qx, 4.04, qw, i + 1, h, b, head_size=1100,
                            body_size=930, body_h=0.86)
        return B.wrap_slide(x, d["title"] + " — proposal")

    register(12, lambda: two_track(CONTENT["retention"]))
    register(13, lambda: roadmap(CONTENT["retention"]))
    register(14, lambda: two_track(CONTENT["archive"]))
    register(15, lambda: roadmap(CONTENT["archive"]))
