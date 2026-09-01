-- ===================================================================
-- Probe 1: the declared record figures
--
-- Six queries against drm-npr, schema public. Run them in order.
-- Together they make the "Total declared records" card real and tell
-- you the true column names for everything else in the report.
--
-- Time: about ten minutes.
-- Needs: read access to drm-npr. Nothing else.
--
-- Query 1 is first for a reason. Every design document is a proposal;
-- only the database is authoritative. Use the names query 1 returns in
-- place of the <angle bracket> placeholders below.
-- ===================================================================


-- -------------------------------------------------------------------
-- QUERY 1. What is actually in the table
--
-- Look for: the soft delete flag, the physical counterpart flag, the
-- declared-by column, and confirmation that ListId and ItemId are both
-- NOT NULL.
-- -------------------------------------------------------------------
SELECT ordinal_position AS pos,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'Records'
ORDER BY ordinal_position;


-- -------------------------------------------------------------------
-- QUERY 2. Total declared records. THE NUMBER ON THE CARD.
--
-- row_count      what COUNT(*) would give you, and it is wrong
-- distinct_items what the card should show
--
-- The gap between them is documents declared more than once. In UAT
-- this was 1,990 rows against 1,984 distinct documents.
--
-- Add "WHERE <soft delete flag> IS NOT TRUE" once query 1 tells you
-- what that column is called.
-- -------------------------------------------------------------------
SELECT COUNT(*)                                                    AS row_count,
       COUNT(DISTINCT ("ListId"::text || ':' || "ItemId"::text))   AS distinct_items,
       COUNT(*) - COUNT(DISTINCT ("ListId"::text || ':' || "ItemId"::text))
                                                                   AS declared_twice
FROM public."Records";


-- -------------------------------------------------------------------
-- QUERY 3. Declared records with a physical counterpart
--
-- The second half of the "declared vs physical" card.
-- Replace <physical flag> with the column query 1 found.
--
-- If this returns zero, the physical counterpart is not being captured
-- and that card has no source.
-- -------------------------------------------------------------------
-- SELECT COUNT(DISTINCT ("ListId"::text || ':' || "ItemId"::text))    AS declared,
--        COUNT(DISTINCT ("ListId"::text || ':' || "ItemId"::text))
--          FILTER (WHERE <physical flag> IS TRUE)                     AS with_physical
-- FROM public."Records";


-- -------------------------------------------------------------------
-- QUERY 4. Is CreatedDate really the declaration date
--
-- Expect the earliest date to sit near the first department go live,
-- not years earlier. If it starts long before EDRMS existed, this
-- column is the file's creation date and every date on the report is
-- measuring the wrong thing.
-- -------------------------------------------------------------------
SELECT MIN("CreatedDate") AS earliest,
       MAX("CreatedDate") AS latest,
       COUNT(*)           AS rows
FROM public."Records";

-- Declarations per month, which is the "records declared this month"
-- card and the by-year chart in one query.
SELECT date_trunc('month', "CreatedDate")::date                    AS month,
       COUNT(DISTINCT ("ListId"::text || ':' || "ItemId"::text))    AS records_declared
FROM public."Records"
GROUP BY 1
ORDER BY 1;


-- -------------------------------------------------------------------
-- QUERY 5. Distinct declarers. THE FREE ANSWER TO "EDRMS USERS".
--
-- The "Total number of EDRMS users" card cannot be produced correctly
-- from the Microsoft usage reports, see KPI_ROW_BUILD.md card 4.
-- But if a declared-by column exists, this is a defensible measure of
-- EDRMS adoption and it costs nothing.
--
-- Replace <declared by column> with whatever query 1 found, likely
-- something like DeclaredByUpn or CreatedBy.
-- -------------------------------------------------------------------
-- SELECT COUNT(DISTINCT <declared by column>) AS distinct_declarers_30d
-- FROM public."Records"
-- WHERE "CreatedDate" >= NOW() - INTERVAL '30 days';

-- And the trend, which is more useful than the single number
-- SELECT date_trunc('month', "CreatedDate")::date AS month,
--        COUNT(DISTINCT <declared by column>)     AS distinct_declarers
-- FROM public."Records"
-- GROUP BY 1 ORDER BY 1;


-- -------------------------------------------------------------------
-- QUERY 6. Is ADBMeta really empty
--
-- Two minutes, and it can change the whole plan. If the department key
-- turns out to be populated, four metrics move from blocked to
-- available and the site mapping list stops being the critical path.
--
-- Expected result: dept_populated is zero.
-- -------------------------------------------------------------------
-- what keys exist at all
SELECT k AS key, COUNT(*) AS rows_with_key
FROM public."Records", LATERAL jsonb_object_keys("ADBMeta") AS k
GROUP BY k
ORDER BY rows_with_key DESC;

-- how many rows actually carry a department
SELECT COUNT(*)                                                                    AS total_rows,
       COUNT(*) FILTER (WHERE COALESCE("ADBMeta"->>'ADBDepartmentOwner','') <> '') AS dept_populated
FROM public."Records";

-- the same check for classification, which silently decides two panels
-- on the Records management and Security dashboards. Substitute the
-- real key name from the first query in this block.
-- SELECT COUNT(*) FILTER (WHERE COALESCE("ADBMeta"->>'<classification key>','') <> '')
-- FROM public."Records";


-- -------------------------------------------------------------------
-- QUERY 7. Libraries holding declared records
--
-- Gives you the denominator side of "libraries with no declared
-- records", and the join key list for the scan. ListId matches
-- SharePoint's own list GUID, which was verified in the test tenant.
-- -------------------------------------------------------------------
SELECT "ListId",
       COUNT(DISTINCT ("ListId"::text || ':' || "ItemId"::text)) AS declared_records,
       MIN("CreatedDate")                                        AS first_declaration,
       MAX("CreatedDate")                                        AS last_declaration
FROM public."Records"
GROUP BY "ListId"
ORDER BY declared_records DESC;


-- -------------------------------------------------------------------
-- QUERY 8. The declaration rate, once you have scan output
--
-- Do NOT compute this as total_records / total_documents. The Records
-- table holds declarations from every site that ever declared
-- anything, including sites the scan will never cover, so the obvious
-- division puts records in the numerator that the denominator never
-- saw.
--
-- Intersect on ListId so both sides describe the same libraries.
-- Replace <scan_output> with wherever the scan lands.
-- -------------------------------------------------------------------
-- WITH scanned AS (
--   SELECT DISTINCT list_id
--   FROM <scan_output>
--   WHERE site_is_compliant
-- )
-- SELECT
--   (SELECT COUNT(DISTINCT ("ListId"::text||':'||"ItemId"::text))
--      FROM public."Records"
--     WHERE "ListId"::text IN (SELECT list_id::text FROM scanned))          AS declared_in_scope,
--   (SELECT COUNT(*) FROM <scan_output>
--     WHERE is_file AND site_is_compliant)                                  AS documents_in_scope,
--   ROUND(
--     (SELECT COUNT(DISTINCT ("ListId"::text||':'||"ItemId"::text))
--        FROM public."Records"
--       WHERE "ListId"::text IN (SELECT list_id::text FROM scanned))::numeric
--     / NULLIF((SELECT COUNT(*) FROM <scan_output>
--                WHERE is_file AND site_is_compliant), 0) * 100, 1)         AS declaration_rate_pct;

-- Useful by-product: declared records living OUTSIDE the scan scope.
-- Either a scope bug or a real population of records in non-compliant
-- or archived sites. Either way you want the number.
-- WITH scanned AS (SELECT DISTINCT list_id FROM <scan_output>)
-- SELECT COUNT(DISTINCT ("ListId"::text||':'||"ItemId"::text)) AS declared_outside_scan
-- FROM public."Records"
-- WHERE "ListId"::text NOT IN (SELECT list_id::text FROM scanned);
