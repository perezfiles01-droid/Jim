# Visitors Filtering Architecture: Monthly, Yearly & Snapshot-Based

**Status:** Design Phase (Pre-Implementation)  
**Scope:** Backend (PostgreSQL + API) and Frontend (Prototype)  
**Effort:** Medium (SQL + API templates, UI picker)  
**Timeline:** 2–3 sprints

---

## 1. SNAPSHOT RETENTION POLICY

### Refresh Cadence
- **Frequency:** Weekly (aligns with M365 usage report cadence)
- **Timing:** Every Monday 06:00 UTC
- **Per snapshot:** 1,057 EDRMS compliant sites (one row per site)
- **Rows per refresh:** 1,057
- **Rows per year:** ~54,964 (52 weeks × 1,057 sites)

### Data Retention
| Period | Snapshots | Total Rows | Use Case |
|--------|-----------|-----------|----------|
| Rolling 2 years | ~104 | ~110K | Year-over-year analysis, rolling trends |
| Rolling 3 years | ~156 | ~165K | Extended baseline comparison |
| Forever | Grows | Eventually slow | Not recommended (see performance note) |

**Recommendation: Rolling 2-year retention with auto-cleanup**
```sql
-- Run after each refresh (weekly)
DELETE FROM rpt.utilization_site_activity
WHERE SnapshotDate < (CURRENT_DATE - INTERVAL '730 days');
```

**Why 2 years:**
- Provides one full year of baseline + current year for YoY
- Sufficient for 52-week trending and seasonal analysis
- Keeps table under 200K rows (sub-millisecond queries)
- Can be extended to 3 years if strategic need justifies

---

## 2. SQL QUERY TEMPLATES BY FILTER TYPE

All queries use the same T2 table structure:
```
SnapshotDate (date), SiteUrl (text), UniqueViewersAllTime (int),
SiteVisits7 (int), SiteVisits30 (int), SiteVisits90 (int),
LastActivityDate (date), ReportRefreshDate (date), IsEdrmsCompliant (boolean)
```

### Query 1: Latest Snapshot (Default View)
**User selects:** Nothing (default load)  
**Returns:** Most recent snapshot regardless of date

```sql
-- Performance: O(1) with index on (IsEdrmsCompliant, SnapshotDate DESC)
SELECT 
  SiteUrl,
  UniqueViewersAllTime,
  SiteVisits7,
  SiteVisits30,
  SiteVisits90,
  LastActivityDate,
  SnapshotDate,
  ReportRefreshDate
FROM rpt.utilization_site_activity
WHERE IsEdrmsCompliant = true
  AND SnapshotDate = (
    SELECT MAX(SnapshotDate) 
    FROM rpt.utilization_site_activity 
    WHERE IsEdrmsCompliant = true
  )
ORDER BY UniqueViewersAllTime DESC;

-- Bank-wide total (for splitting across departments)
SELECT SUM(UniqueViewersAllTime) AS total_visitors
FROM rpt.utilization_site_activity
WHERE IsEdrmsCompliant = true
  AND SnapshotDate = (
    SELECT MAX(SnapshotDate) 
    FROM rpt.utilization_site_activity
  );
```

### Query 2: Specific Month Snapshot
**User selects:** "July 2026"  
**Returns:** All sites as they were at end of that month

```sql
-- Performance: O(n) where n = sites in month; fast with index
-- Assumes one snapshot per month (e.g., last Monday of each month)
SELECT 
  SiteUrl,
  UniqueViewersAllTime,
  SiteVisits7,
  LastActivityDate,
  SnapshotDate
FROM rpt.utilization_site_activity
WHERE IsEdrmsCompliant = true
  AND EXTRACT(YEAR FROM SnapshotDate) = 2026
  AND EXTRACT(MONTH FROM SnapshotDate) = 7
  AND SnapshotDate = (
    SELECT MAX(SnapshotDate)
    FROM rpt.utilization_site_activity t2
    WHERE EXTRACT(YEAR FROM t2.SnapshotDate) = 2026
      AND EXTRACT(MONTH FROM t2.SnapshotDate) = 7
      AND IsEdrmsCompliant = true
  )
ORDER BY UniqueViewersAllTime DESC;

-- Bank-wide total for July 2026
SELECT SUM(UniqueViewersAllTime) AS july_2026_visitors
FROM rpt.utilization_site_activity
WHERE IsEdrmsCompliant = true
  AND EXTRACT(YEAR FROM SnapshotDate) = 2026
  AND EXTRACT(MONTH FROM SnapshotDate) = 7
  AND SnapshotDate = (
    SELECT MAX(SnapshotDate)
    FROM rpt.utilization_site_activity
    WHERE EXTRACT(YEAR FROM SnapshotDate) = 2026
      AND EXTRACT(MONTH FROM SnapshotDate) = 7
  );
```

### Query 3: Month-over-Month Comparison
**User selects:** "June vs July 2026"  
**Returns:** Side-by-side comparison of two months

```sql
-- Performance: O(n) join; index on (SnapshotDate, SiteUrl)
SELECT 
  COALESCE(s1.SiteUrl, s2.SiteUrl) AS SiteUrl,
  s1.UniqueViewersAllTime AS june_visitors,
  s2.UniqueViewersAllTime AS july_visitors,
  (s2.UniqueViewersAllTime - s1.UniqueViewersAllTime) AS visitor_change,
  CASE 
    WHEN s1.UniqueViewersAllTime > 0 
      THEN ROUND(((s2.UniqueViewersAllTime - s1.UniqueViewersAllTime)::NUMERIC / s1.UniqueViewersAllTime * 100), 1)
    ELSE NULL 
  END AS pct_change
FROM (
  -- June snapshot
  SELECT SiteUrl, UniqueViewersAllTime
  FROM rpt.utilization_site_activity
  WHERE IsEdrmsCompliant = true
    AND SnapshotDate = (
      SELECT MAX(SnapshotDate)
      FROM rpt.utilization_site_activity
      WHERE EXTRACT(YEAR FROM SnapshotDate) = 2026
        AND EXTRACT(MONTH FROM SnapshotDate) = 6
    )
) s1
FULL OUTER JOIN (
  -- July snapshot
  SELECT SiteUrl, UniqueViewersAllTime
  FROM rpt.utilization_site_activity
  WHERE IsEdrmsCompliant = true
    AND SnapshotDate = (
      SELECT MAX(SnapshotDate)
      FROM rpt.utilization_site_activity
      WHERE EXTRACT(YEAR FROM SnapshotDate) = 2026
        AND EXTRACT(MONTH FROM SnapshotDate) = 7
    )
) s2 ON s1.SiteUrl = s2.SiteUrl
ORDER BY visitor_change DESC;
```

### Query 4: Year-to-Date (YTD) Sum
**User selects:** "YTD 2026" (Jan 1 – Jul 31)  
**Returns:** Cumulative visitors across all weeks in 2026 YTD

```sql
-- Performance: O(n×m) where n = sites, m = snapshots in period
-- Index on (IsEdrmsCompliant, SnapshotDate) essential
-- WARNING: Uses SiteVisits7 summed across weeks (do NOT use SiteVisits30/90/180)
-- Consecutive 7-day windows tile exactly; longer windows overlap and count days twice

SELECT 
  SiteUrl,
  SUM(SiteVisits7) AS total_visits_ytd_2026,
  COUNT(DISTINCT SnapshotDate) AS weeks_included,
  MAX(UniqueViewersAllTime) AS peak_unique_visitors,
  MAX(LastActivityDate) AS last_activity
FROM rpt.utilization_site_activity
WHERE IsEdrmsCompliant = true
  AND EXTRACT(YEAR FROM SnapshotDate) = 2026
  AND SnapshotDate <= '2026-07-31'  -- Up to selected end date
GROUP BY SiteUrl
HAVING SUM(SiteVisits7) > 0  -- Exclude dormant sites
ORDER BY total_visits_ytd_2026 DESC;

-- Bank-wide YTD total
SELECT SUM(SiteVisits7) AS total_page_views_ytd_2026
FROM rpt.utilization_site_activity
WHERE IsEdrmsCompliant = true
  AND EXTRACT(YEAR FROM SnapshotDate) = 2026
  AND SnapshotDate <= '2026-07-31';
```

### Query 5: Year-over-Year (YoY) Comparison
**User selects:** "2025 vs 2026"  
**Returns:** Annual comparison

```sql
-- Performance: O(n) with aggregation across years
-- Sums ALL visits for the entire calendar year
SELECT 
  EXTRACT(YEAR FROM SnapshotDate) AS year,
  SUM(SiteVisits7) AS total_page_views,
  SUM(UniqueViewersAllTime) AS unique_visitors_peak,
  COUNT(DISTINCT SiteUrl) AS active_sites,
  COUNT(DISTINCT SnapshotDate) AS snapshots_in_year
FROM rpt.utilization_site_activity
WHERE IsEdrmsCompliant = true
  AND EXTRACT(YEAR FROM SnapshotDate) IN (2025, 2026)
GROUP BY EXTRACT(YEAR FROM SnapshotDate)
ORDER BY year;

-- Detailed site-level comparison
SELECT 
  SiteUrl,
  SUM(CASE WHEN EXTRACT(YEAR FROM SnapshotDate) = 2025 THEN SiteVisits7 ELSE 0 END) AS visits_2025,
  SUM(CASE WHEN EXTRACT(YEAR FROM SnapshotDate) = 2026 THEN SiteVisits7 ELSE 0 END) AS visits_2026,
  SUM(CASE WHEN EXTRACT(YEAR FROM SnapshotDate) = 2026 THEN SiteVisits7 ELSE 0 END) -
  SUM(CASE WHEN EXTRACT(YEAR FROM SnapshotDate) = 2025 THEN SiteVisits7 ELSE 0 END) AS yoy_change
FROM rpt.utilization_site_activity
WHERE IsEdrmsCompliant = true
  AND EXTRACT(YEAR FROM SnapshotDate) IN (2025, 2026)
GROUP BY SiteUrl
ORDER BY yoy_change DESC;
```

### Query 6: 7/30/90/180-Day Windows (Existing Filter Types)
**User selects:** "Last 30 days"  
**Returns:** Sites active in last 30 days using ReportRefreshDate

```sql
-- Performance: O(n) index on ReportRefreshDate
-- ReportRefreshDate = Microsoft's measurement date, not job run date
-- This differs from SnapshotDate (when job ran, can be 2 days later)
SELECT 
  SiteUrl,
  UniqueViewersAllTime,
  SiteVisits30,
  LastActivityDate,
  ReportRefreshDate,
  SnapshotDate
FROM rpt.utilization_site_activity
WHERE IsEdrmsCompliant = true
  AND ReportRefreshDate >= (CURRENT_DATE - INTERVAL '30 days')
  AND ReportRefreshDate <= CURRENT_DATE
ORDER BY UniqueViewersAllTime DESC;

-- Bank-wide total for last 30 days
-- NOTE: This uses the LATEST snapshot's SiteVisits30 column
-- NOT a sum of SiteVisits7 across 4 weeks (those would overlap)
SELECT SUM(SiteVisits30) AS page_views_30_days
FROM rpt.utilization_site_activity
WHERE IsEdrmsCompliant = true
  AND SnapshotDate = (
    SELECT MAX(SnapshotDate)
    FROM rpt.utilization_site_activity
    WHERE IsEdrmsCompliant = true
  );
```

---

## 3. DATABASE INDEXES REQUIRED

These indexes make the queries above sub-millisecond:

```sql
-- Index 1: Latest snapshot lookups (Query 1, 2, 6)
CREATE INDEX idx_site_activity_compliance_date 
ON rpt.utilization_site_activity(IsEdrmsCompliant, SnapshotDate DESC);

-- Index 2: Site URL joins (Query 3, 5)
CREATE INDEX idx_site_activity_url_date 
ON rpt.utilization_site_activity(SiteUrl, SnapshotDate);

-- Index 3: Date range filtering (Query 6)
CREATE INDEX idx_site_activity_refresh_date 
ON rpt.utilization_site_activity(ReportRefreshDate);

-- Index 4: Year/month extraction (Query 4, 5)
CREATE INDEX idx_site_activity_year_month 
ON rpt.utilization_site_activity(
  (EXTRACT(YEAR FROM SnapshotDate)), 
  (EXTRACT(MONTH FROM SnapshotDate))
);
```

---

## 4. BACKEND API DESIGN

### Endpoint: GET /api/visitors/filtered

**Purpose:** Return filtered visitor data for a given filter type and parameters

**Request:**
```json
{
  "filter_type": "month",
  "year": 2026,
  "month": 7,
  "comparison_month": null,
  "format": "bank_wide"  // "bank_wide", "department", "site"
}
```

**Filter Types:**
| filter_type | Parameters | Query Template | Returns |
|---|---|---|---|
| `latest` | none | Query 1 | Latest snapshot, all sites |
| `month` | year, month | Query 2 | Month-end snapshot |
| `month_vs_month` | year, month, comparison_month | Query 3 | Side-by-side comparison |
| `ytd` | year, end_month | Query 4 | YTD sum with peak |
| `year_vs_year` | year, comparison_year | Query 5 | Annual comparison |
| `days_back` | days (7/30/90/180) | Query 6 | Recent window |

**Response (format: "bank_wide"):**
```json
{
  "filter_type": "month",
  "period": "July 2026",
  "snapshot_date": "2026-07-31",
  "report_refresh_date": "2026-08-10",
  "data": {
    "total_visitors": 17240,
    "total_page_views": 142880,
    "active_sites": 1032,
    "query_time_ms": 12
  }
}
```

**Response (format: "site"):**
```json
{
  "filter_type": "month",
  "period": "July 2026",
  "sites": [
    {
      "site_url": "https://adb.sharepoint.com/sites/edrms-itd",
      "unique_visitors": 412,
      "page_views": 2840,
      "last_activity": "2026-07-30"
    },
    ...
  ]
}
```

### Pseudocode: Backend Filter Logic

```python
def get_visitors_filtered(filter_type, **params):
    """
    Dynamically select SQL template based on filter_type,
    execute with params, return formatted result.
    """
    
    query_templates = {
        'latest': QUERY_1_LATEST_SNAPSHOT,
        'month': QUERY_2_SPECIFIC_MONTH,
        'month_vs_month': QUERY_3_MONTH_COMPARISON,
        'ytd': QUERY_4_YTD_SUM,
        'year_vs_year': QUERY_5_YOY_COMPARISON,
        'days_back': QUERY_6_DAYS_WINDOW,
    }
    
    template = query_templates[filter_type]
    query = template.format(**params)  # Inject year, month, etc.
    
    result = execute_sql(query)
    
    if not result:
        return error("No data for selected period")
    
    # Format result
    if params.get('format') == 'bank_wide':
        return {
            'total_visitors': result['total_visitors'],
            'total_page_views': result['total_page_views'],
            'snapshot_date': result['snapshot_date'],
        }
    elif params.get('format') == 'department':
        # Split by T2 data joined to department mapping (Gap 1 in STATUS.md)
        return split_by_department(result)
    elif params.get('format') == 'site':
        return result
```

---

## 5. PROTOTYPE INTEGRATION: How It Receives Filtered Data

### Current Flow (Demo Data)
```
Hardcoded VISITORS = 17,240
  ↓
Split across 16 departments using weights()
  ↓
Split across sites per department using weights()
  ↓
Rendered in drills
```

### New Flow (With Backend)
```
User selects: "July 2026"
  ↓
Prototype sends: GET /api/visitors/filtered?filter_type=month&year=2026&month=7
  ↓
Backend executes Query 2 (specific month snapshot)
  ↓
Backend returns: {"total_visitors": 16800}  ← Different from default 17,240
  ↓
Prototype receives 16,800 as new DATA.VISITORS value
  ↓
Split across departments (same logic, new input)
  ↓
Split across sites per department (same logic, new input)
  ↓
Rendered in drills with July-specific data
```

**Key insight:** Zero prototype logic changes. Just update the input constant and re-split.

### Prototype Code Pattern

```javascript
// Current (hardcoded)
const VISITORS = 17240;

// With backend (dynamic)
async function loadVisitors(filterType = 'latest', params = {}) {
  const response = await fetch('/api/visitors/filtered', {
    method: 'POST',
    body: JSON.stringify({
      filter_type: filterType,
      format: 'bank_wide',
      ...params
    })
  });
  
  const data = await response.json();
  DATA.VISITORS = data.total_visitors;  // ← Swap constant for API result
  DATA.PAGE_VIEWS = data.total_page_views;
  
  // Re-split and re-render all drills
  DEPTS = recalculate_departments(DATA.VISITORS);
  redraw_all_dashboards();
}

// User changes filter
document.getElementById('visitor-month-picker').onchange = (e) => {
  const [year, month] = e.target.value.split('-');
  loadVisitors('month', { year, month });
};
```

---

## 6. IMPLEMENTATION ROADMAP

### Phase 1: Backend (Sprint 1)
- [ ] Create T2 refresh job (weekly snapshots with SnapshotDate)
- [ ] Implement auto-cleanup (delete snapshots >730 days)
- [ ] Build SQL query templates (6 template types)
- [ ] Create database indexes (4 indexes)
- [ ] Build `/api/visitors/filtered` endpoint (template-based query builder)
- [ ] Add error handling (no data for period, invalid dates)
- [ ] Performance test (all 6 query types with 110K rows)

### Phase 2: Prototype UI (Sprint 2)
- [ ] Add filter picker: 7/30/90/180 + month + year dropdowns
- [ ] Add "Compare" toggle for month-vs-month / year-vs-year
- [ ] Hook up onClick → `loadVisitors(filter_type, params)`
- [ ] Display period label: "July 2026", "Last 30 days", "2025 vs 2026"
- [ ] Handle loading state (spinner while fetching)
- [ ] Cache results to avoid duplicate queries

### Phase 3: Testing & Validation (Sprint 3)
- [ ] Test all 6 filter combinations with real data
- [ ] Verify splits (sum of sites = department, sum of departments = bank-wide)
- [ ] Performance benchmark (response time, query time)
- [ ] User acceptance: test with sample scenarios
- [ ] Document filter behavior in STATUS.md

---

## 7. KEY DECISION POINTS AHEAD

### Decision 1: Snapshot Frequency
**Current plan:** Weekly (52 per year)  
**Alternative:** Monthly (12 per year) — simpler but less granular  
**Ask client:** Does weekly granularity matter, or is monthly enough?

### Decision 2: Retention Period
**Current plan:** Rolling 2 years (~110K rows)  
**Alternative:** 3 years (~165K rows) or forever (grows without bound)  
**Ask client:** What's the longest history you need for YoY trending?

### Decision 3: Department-Level Splitting
**Current plan:** Backend returns bank-wide total, prototype splits by weights()  
**Alternative:** Backend returns pre-split department totals  
**Tradeoff:** Option 1 = simpler backend, option 2 = no prototype calculation  
**Ask client:** Does the department breakdown matter for filtering, or just bank-wide?

### Decision 4: The 180-Day Window
**Problem:** M365 reports only offer 7/30/90-day windows, no 180-day  
**Options:**
- A) Remove 180-day filter (not available from source)
- B) Compute 180-day as manual sum of SiteVisits7 across 26 weeks (slow, complex)
- C) Store a T2.SiteVisits180 column (requires new ETL step)
- **Recommendation:** Option A (remove it) — honest about source limitations

---

## 8. NEXT STEPS

Once approved, in order:
1. Confirm snapshot frequency (weekly) and retention (2 years)
2. Confirm 180-day filter decision
3. Build refresh job + T2 population script
4. Implement query templates + API endpoint
5. Add prototype UI + integration
6. Validate against real tenant data

---

**Document Status:** Ready for sign-off  
**Questions:** See section 7 (Decision Points)  
**Owner:** Backend team (SQL/API), Frontend team (UI)  
**Timeline:** 6–8 weeks with parallel sprints
