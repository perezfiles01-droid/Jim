/*
 * RAC Item 5 (22 Oct 2026): dynamic categories. Each department code carries a
 * Main, Sub and Sub Sub Category, read from the merged site file (columns G to
 * I, filled by the BA team). The filter is built from whatever values are here,
 * so regrouping needs no change to the report, and the labels can be renamed.
 *
 * SAMPLE VALUES until the team's file arrives, in the agreed pattern:
 * Main = HQ / RM / RO, Sub = the department, Sub Sub = the resident mission.
 */
export var CATEGORY_LABELS = ['Category', 'Sub-category', 'Sub-group'];
var C = {
    ITD: ['HQ', 'ITD'], SARD: ['HQ', 'SARD'], OSFG: ['HQ', 'OSFG'], FIN: ['HQ', 'FIN'], PARD: ['HQ', 'PARD'],
    HRD: ['HQ', 'HRD'], SERD: ['HQ', 'SERD'], EARD: ['HQ', 'EARD'], CWRD: ['HQ', 'CWRD'], OGC: ['HQ', 'OGC'], SPD: ['HQ', 'SPD'],
    SLRM: ['RM', 'SARD', 'SLRM'], INRM: ['RM', 'SARD', 'INRM'], PRCM: ['RM', 'EARD', 'PRCM'],
    NARO: ['RO', 'NARO'], ERO: ['RO', 'ERO']
};
/** A department's categories; one with no row sits under "Uncategorised". */
export function categoryOf(code) {
    var c = C[code];
    return c ? { main: c[0], sub: c[1], subSub: c[2] } : { main: 'Uncategorised', sub: code };
}
/** Main Category values in the order the list gives them (the file's own order). */
export function mainOrder() {
    var seen = [];
    Object.keys(C).forEach(function (k) { if (seen.indexOf(C[k][0]) < 0)
        seen.push(C[k][0]); });
    return seen;
}
//# sourceMappingURL=categories.js.map