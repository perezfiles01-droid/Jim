#!/usr/bin/env python3
"""Derive the Bank-wide base figures from the two tenant exports.

Run it and read the block it prints. Every figure it emits is a count or a sum
over a named column in a named file, so a figure in index.html can be checked
against the evidence rather than trusted.

    python3 derive_bankwide.py

What it deliberately does NOT emit: documents, records, visitors or page views
per department. The Cloud Governance export carries URL and no Site Id; the
SharePoint usage export carries Site Id and a BLANK Site URL on all 2,575 rows,
because it was taken with concealed names switched on. The two share no key, so
any per-department document figure derived from this pair would be invented.
Re-export the usage report with Microsoft 365 admin centre, Settings, Org
settings, Reports, and clear "Display concealed user, group, and site names in
all reports". Then Site URL populates and the join to URL works.

Multi-department sites: 240 of the 1,030 EDRMS sites with a Department carry
several, semicolon separated. The first listed is taken as primary, RAC's
decision of 21 September 2026, so every site counts exactly once and the
department rows total the bank-wide figure.
"""
import csv, collections, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CG = os.path.join(HERE, 'evidence_CloudGovernance_WorkspaceReport_2026-08-14.csv')
SU = os.path.join(HERE, 'evidence_SharePointSiteUsageDetail_2026-08-12.csv')

def read(path):
    with open(path, encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))

def num(v):
    try:    return float(v)
    except (TypeError, ValueError): return 0.0

def derive():
    cg, su = read(CG), read(SU)
    edrms = [r for r in cg if (r.get('EDRMS Site Type') or '').strip()]
    withdept = [r for r in edrms if (r.get('Department') or '').strip()]
    multi = [r for r in withdept if ';' in r['Department']]
    primary = collections.Counter(r['Department'].split(';')[0].strip() for r in withdept)

    # The join both sources would need, tested rather than assumed.
    su_urls = sum(1 for r in su if (r.get('Site URL') or '').strip())
    joinable = su_urls > 0 and 'Site Id' in (cg[0] if cg else {})

    return {
        'SITES_CREATED':      len(edrms),
        'SITES_LIFECYCLE_ACTIVE': sum(1 for r in edrms if (r.get('Status') or '').strip() == 'Active'),
        'SITES_WITH_DEPARTMENT':  len(withdept),
        'SITES_MULTI_DEPARTMENT': len(multi),
        'SITES_WITH_OWNER':   sum(1 for r in edrms if (r.get('Primary Business Owner') or '').strip()),
        'SITES_WITH_LAST_ACTIVE': sum(1 for r in edrms if (r.get('Last Active Time') or '').strip()),
        'STORAGE_GB':         round(sum(num(r.get('Storage Used (GB)')) for r in edrms), 2),
        'DEPARTMENTS_PRIMARY': dict(primary.most_common()),
        'TENANT_WORKSPACES':  len(cg),
        'USAGE_ROWS':         len(su),
        'USAGE_FILE_COUNT_TENANT': sum(int(num(r.get('File Count'))) for r in su),
        'USAGE_SITE_URL_POPULATED': su_urls,
        'SOURCES_JOINABLE':   joinable,
    }

if __name__ == '__main__':
    d = derive()
    print(json.dumps(d, indent=2))
    if not d['SOURCES_JOINABLE']:
        print('\nNOT JOINABLE: the usage export carries no Site URL '
              f"({d['USAGE_SITE_URL_POPULATED']} of {d['USAGE_ROWS']} rows populated) "
              'and the Cloud Governance export carries no Site Id. Per-department '
              'documents, storage from usage, visitors and page views cannot be '
              'derived from this pair.', file=sys.stderr)
