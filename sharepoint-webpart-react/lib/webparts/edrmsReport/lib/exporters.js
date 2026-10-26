// Export table (Excel) and Export to PDF.
// Both libraries are bundled with the web part and loaded only when a reader
// first exports, so they never slow down the first view.
import { __awaiter, __generator, __spreadArray } from "tslib";
/** Writes an .xlsx in the house style: ADB blue header, banding, filters. */
export function exportTable(t) {
    return __awaiter(this, void 0, void 0, function () {
        var XLSX, aoa, ws, thin, box, nR, nC, r, c, a, x, hd, tot, wb;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, import(/* webpackChunkName: 'edrms-xlsx' */ 'xlsx-js-style')];
                case 1:
                    XLSX = _a.sent();
                    aoa = __spreadArray([t.head], t.rows, true);
                    if (t.total)
                        aoa.push(t.total);
                    ws = XLSX.utils.aoa_to_sheet(aoa);
                    thin = { style: 'thin', color: { rgb: 'D9E1EA' } };
                    box = { top: thin, bottom: thin, left: thin, right: thin };
                    nR = aoa.length, nC = t.head.length;
                    for (r = 0; r < nR; r++) {
                        for (c = 0; c < nC; c++) {
                            a = XLSX.utils.encode_cell({ r: r, c: c });
                            x = ws[a] || (ws[a] = { t: 's', v: '' });
                            hd = r === 0, tot = !!t.total && r === nR - 1;
                            x.s = {
                                font: { name: 'Segoe UI', sz: hd ? 11 : 10, bold: hd || tot, color: { rgb: hd ? 'FFFFFF' : '10243E' } },
                                fill: { patternType: 'solid', fgColor: { rgb: hd ? '194F8E' : tot ? 'DCEAF7' : r % 2 === 0 ? 'EAF3FB' : 'FFFFFF' } },
                                alignment: { vertical: 'center', horizontal: x.t === 'n' ? 'right' : 'left', wrapText: hd },
                                border: box
                            };
                        }
                    }
                    ws['!cols'] = t.head.map(function (h, c) { return ({
                        wch: Math.min(60, Math.max.apply(Math, __spreadArray([h.length + 2], aoa.map(function (row) { return String(row[c] === undefined ? '' : row[c]).length + 2; }), false)))
                    }); });
                    ws['!rows'] = [{ hpt: 26 }];
                    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: nR - 1 - (t.total ? 1 : 0), c: nC - 1 } }) };
                    wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, t.name.slice(0, 31));
                    XLSX.writeFile(wb, t.name + '.xlsx');
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * html2canvas draws neither placeholders, date fields nor a CSS background
 * icon, so in its copy each text, search and date box becomes a plain box
 * holding the same text and icon (22 Oct 2026).
 */
function flattenInputs(doc, clone) {
    var win = doc.defaultView;
    if (!win)
        return;
    Array.from(clone.querySelectorAll('input')).forEach(function (inp) {
        var t = (inp.type || 'text').toLowerCase();
        if (['text', 'search', 'date', ''].indexOf(t) < 0)
            return;
        var cs = win.getComputedStyle(inp);
        if (cs.display === 'none')
            return;
        var box = doc.createElement('div');
        ['width', 'height', 'boxSizing', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft', 'borderRadius', 'paddingTop', 'paddingBottom', 'paddingRight', 'backgroundColor',
            'fontSize', 'fontFamily', 'fontWeight', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'flex', 'minWidth', 'maxWidth'].forEach(function (k) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            box.style[k] = cs[k];
        });
        box.style.display = 'flex';
        box.style.alignItems = 'center';
        box.style.gap = '8px';
        box.style.whiteSpace = 'nowrap';
        box.style.overflow = 'hidden';
        box.style.paddingLeft = t === 'search' ? '11px' : cs.paddingLeft;
        // Icons drawn with borders, which html2canvas always paints (an image added here may not load in time).
        var glass = function () {
            var g = doc.createElement('span');
            g.style.cssText = 'position:relative;flex:none;width:14px;height:14px';
            var c = doc.createElement('span');
            c.style.cssText = 'position:absolute;left:1px;top:1px;width:8px;height:8px;border:2px solid #8A9AAB;border-radius:50%';
            var h = doc.createElement('span');
            h.style.cssText = 'position:absolute;left:10px;top:9px;width:2px;height:6px;background:#8A9AAB;border-radius:1px;transform:rotate(-45deg)';
            g.appendChild(c);
            g.appendChild(h);
            return g;
        };
        var cal = function () {
            var g = doc.createElement('span');
            g.style.cssText = 'position:relative;flex:none;width:14px;height:14px';
            var b = doc.createElement('span');
            b.style.cssText = 'position:absolute;left:1px;top:2px;width:10px;height:9px;border:1.5px solid #33475F;border-top-width:3px;border-radius:2px';
            g.appendChild(b);
            return g;
        };
        if (t === 'search')
            box.appendChild(glass());
        var txt = doc.createElement('span');
        var value = inp.value, empty = !value;
        if (t === 'date') {
            if (value) {
                var d = new Date(value + 'T00:00:00');
                value = ('0' + (d.getMonth() + 1)).slice(-2) + '/' + ('0' + d.getDate()).slice(-2) + '/' + d.getFullYear();
            }
            else {
                value = 'mm/dd/yyyy';
                empty = true;
            }
        }
        else if (!value)
            value = inp.placeholder || '';
        txt.textContent = value;
        txt.style.flex = '1 1 auto';
        txt.style.overflow = 'hidden';
        txt.style.color = empty ? '#8A9AAB' : cs.color;
        box.appendChild(txt);
        if (t === 'date')
            box.appendChild(cal());
        if (inp.parentNode)
            inp.parentNode.replaceChild(box, inp);
    });
}
/**
 * Draws the element as a picture and saves it as a landscape A4 PDF, page by
 * page. Pages break at the start of a section (a title band or panel), or else
 * between table rows, never through a panel or a row (22 Oct 2026).
 */
export function exportPdf(el, name) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, html2canvas, jsPDF, bands_1, starts_1, rows_1, spans_1, boxW_1, canvas, k_1, px, sSpans_1, clear, sBands, sStarts, sRows, pdf, pw, ph, m, w, scale, sliceH_1, y_1, page, end, within, whole, ok, part, ctx, fitK, dw;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        import(/* webpackChunkName: 'edrms-pdf' */ 'html2canvas'),
                        import(/* webpackChunkName: 'edrms-pdf' */ 'jspdf')
                    ])];
                case 1:
                    _a = _b.sent(), html2canvas = _a[0].default, jsPDF = _a[1].jsPDF;
                    el.classList.add('edrms-printing');
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, , 4, 5]);
                    bands_1 = [], starts_1 = [], rows_1 = [], spans_1 = [], boxW_1 = 0;
                    return [4 /*yield*/, html2canvas(el, {
                            scale: 1.5, backgroundColor: '#EEF2F6', useCORS: true, logging: false,
                            // Measured in html2canvas's own copy, which is what the picture shows.
                            onclone: function (doc, clone) {
                                flattenInputs(doc, clone);
                                var box = clone.getBoundingClientRect();
                                boxW_1 = box.width;
                                var at = function (q, edge) { return Array.from(clone.querySelectorAll(q))
                                    .map(function (x) { return x.getBoundingClientRect(); }).filter(function (r) { return r.height > 0; })
                                    .map(function (r) { return r[edge] - box.top; }).sort(function (x, y) { return x - y; }); };
                                // A section begins at its title band; a band left alone at a page foot is avoided by breaking above it.
                                bands_1 = at('.band', 'top').map(function (v) { return v - 8; });
                                starts_1 = at('section.panel, .kpis, .panel table, .chart, .split > *, .strip', 'top').map(function (v) { return v - 8; });
                                rows_1 = at('tbody tr, .hbar, .drow', 'bottom').map(function (v) { return v + 1; });
                                // A chart beside a table must not be cut by a break between the table's rows.
                                spans_1 = Array.from(clone.querySelectorAll('svg, .chart, canvas')).map(function (x) { return x.getBoundingClientRect(); })
                                    .filter(function (r) { return r.height > 20; }).map(function (r) { return [r.top - box.top - 4, r.bottom - box.top + 4]; });
                            }
                        })];
                case 3:
                    canvas = _b.sent();
                    k_1 = boxW_1 ? canvas.width / boxW_1 : 1.5, px = function (v) { return v.map(function (x) { return Math.round(x * k_1); }); };
                    sSpans_1 = spans_1.map(px);
                    clear = function (v) { return v.filter(function (b) { return !sSpans_1.some(function (sp) { return b > sp[0] && b < sp[1]; }); }); };
                    sBands = clear(px(bands_1)), sStarts = clear(px(starts_1)), sRows = clear(px(rows_1));
                    pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
                    pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight(), m = 20;
                    w = pw - m * 2, scale = w / canvas.width, sliceH_1 = Math.floor((ph - m * 2) / scale);
                    y_1 = 0, page = 0;
                    while (y_1 < canvas.height) {
                        end = Math.min(canvas.height, y_1 + sliceH_1);
                        if (end < canvas.height) {
                            within = function (list, lo, hi) { return list.filter(function (b) { return b > y_1 + sliceH_1 * lo && b <= y_1 + sliceH_1 * hi; }); };
                            whole = within(sBands, 0.7, 1.3).concat(canvas.height <= y_1 + sliceH_1 * 1.3 ? [canvas.height] : []);
                            ok = whole.length ? whole : within(sBands, 0.5, 1).length ? within(sBands, 0.5, 1) : within(sStarts, 0.7, 1).length ? within(sStarts, 0.7, 1)
                                : within(sRows, 0.35, 1).length ? within(sRows, 0.35, 1) : within(sBands.concat(sStarts), 0.35, 1).sort(function (x, z) { return x - z; });
                            if (ok.length)
                                end = whole.length ? whole.reduce(function (best, b) { return Math.abs(b - y_1 - sliceH_1) < Math.abs(best - y_1 - sliceH_1) ? b : best; }) : ok[ok.length - 1];
                        }
                        part = document.createElement('canvas');
                        part.width = canvas.width;
                        part.height = end - y_1;
                        ctx = part.getContext('2d');
                        if (!ctx)
                            break;
                        ctx.drawImage(canvas, 0, y_1, canvas.width, part.height, 0, 0, canvas.width, part.height);
                        if (page)
                            pdf.addPage();
                        fitK = Math.min(1, (ph - m * 2) / (part.height * scale)), dw = w * fitK;
                        pdf.addImage(part.toDataURL('image/jpeg', 0.88), 'JPEG', m + (w - dw) / 2, m, dw, part.height * scale * fitK);
                        y_1 = end;
                        page++;
                    }
                    pdf.save(name + '.pdf');
                    return [3 /*break*/, 5];
                case 4:
                    el.classList.remove('edrms-printing');
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/* Controls that do nothing on a slide are left out of the pictures. */
var PPT_HIDE = '.search,.fBtn,.xpBtn,.pager,.pbtns,.pinfo,.info,.infoWrap,input[type=search]{display:none!important}';
var wait = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
var clean = function (el) {
    if (!el)
        return '';
    var c = el.cloneNode(true);
    c.querySelectorAll('.info,.infoWrap,svg').forEach(function (x) { return x.remove(); });
    return (c.textContent || '').replace(/\s+/g, ' ').trim();
};
/**
 * Pictures one panel, and records where rows, charts and blocks end (in
 * canvas pixels) so a tall picture can be split there instead of through a row.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shoot(h2c, el, title, on) {
    return __awaiter(this, void 0, void 0, function () {
        var scale, breaks, blocks, tops, boxW, measure, canvas, k, px;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    scale = 2;
                    breaks = [], blocks = [], tops = [], boxW = 0;
                    measure = function (root) {
                        var box = root.getBoundingClientRect();
                        boxW = box.width;
                        var at = function (q, edge) { return Array.from(root.querySelectorAll(q))
                            .map(function (x) { return x.getBoundingClientRect(); })
                            .filter(function (r) { return r.height > 0; }).map(function (r) { return r[edge] - box.top; }).sort(function (x, y) { return x - y; }); };
                        // Rows are where a cut is allowed; blocks (a chart, a control bar) are where it is better;
                        // just above a table is best, so the header stays with its rows.
                        breaks = at('tbody tr, .hbar, .drow, .ctl, .chart, .split, .strip, .kpis, .note, .psub, h3, svg', 'bottom');
                        blocks = at('.ctl, .chart, .split, .strip, .kpis', 'bottom');
                        tops = at('table', 'top').map(function (v) { return v - 3; });
                    };
                    return [4 /*yield*/, h2c(el, {
                            scale: scale,
                            backgroundColor: '#FFFFFF', useCORS: true, logging: false,
                            onclone: function (doc, clone) {
                                var s = doc.createElement('style');
                                s.textContent = PPT_HIDE;
                                doc.head.appendChild(s);
                                if (clone) {
                                    flattenInputs(doc, clone);
                                    measure(clone);
                                }
                            }
                        })];
                case 1:
                    canvas = _a.sent();
                    k = boxW ? canvas.width / boxW : scale, px = function (v) { return v.map(function (x) { return Math.round(x * k); }); };
                    return [2 /*return*/, { title: title, on: on, canvas: canvas, breaks: px(breaks), blocks: px(blocks), tops: px(tops) }];
            }
        });
    });
}
/** Cuts a canvas into pieces no taller than maxH, each ending on a recorded break. */
function slices(c, breaks, blocks, tops, maxH) {
    var out = [];
    var y = 0;
    var _loop_1 = function () {
        var end = Math.min(c.height, y + maxH);
        if (end < c.height) {
            var fit_1 = function (list) { return list.filter(function (b) { return b > y + maxH * 0.4 && b <= end; }); };
            // Best: just above a table. Then: after a block. Last resort: after a row.
            var ok = fit_1(tops).length ? fit_1(tops) : fit_1(blocks).length ? fit_1(blocks) : fit_1(breaks);
            if (ok.length)
                end = ok[ok.length - 1] + 4;
        }
        var p = document.createElement('canvas');
        p.width = c.width;
        p.height = end - y;
        var ctx = p.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, p.width, p.height);
            ctx.drawImage(c, 0, y, c.width, p.height, 0, 0, c.width, p.height);
        }
        out.push(p);
        y = end;
    };
    while (y < c.height) {
        _loop_1();
    }
    return out;
}
/**
 * One slide per breakdown (every card, opened in turn) and per section below,
 * as on screen without the controls. A tall picture continues on a second
 * slide rather than being shrunk. Leaves the reader's open card as it was.
 */
export function exportPptx(dashEl, meta) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, html2canvas, pptxMod, PptxGenJS, cards, info, openIdx, drill, shots, i, d_1, _b, _c, after, n, title, _d, _e, P, kw, aw, d, stamp;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        import(/* webpackChunkName: 'edrms-pdf' */ 'html2canvas'),
                        import(/* webpackChunkName: 'edrms-pptx' */ 'pptxgenjs')
                    ])];
                case 1:
                    _a = _f.sent(), html2canvas = _a[0].default, pptxMod = _a[1];
                    PptxGenJS = pptxMod.default || pptxMod;
                    cards = Array.from(dashEl.querySelectorAll('.kpis .kpi'));
                    info = cards.map(function (c) { return ({ lab: clean(c.querySelector('.lab')), val: clean(c.querySelector('.val')) }); });
                    openIdx = Math.max(0, cards.findIndex(function (c) { return c.classList.contains('on'); }));
                    drill = function () {
                        var k = dashEl.querySelector('.kpis');
                        var host = (k && k.closest('section.panel')) || k;
                        var n = host ? host.nextElementSibling : null;
                        while (n && !n.matches('section.panel'))
                            n = n.nextElementSibling;
                        return n;
                    };
                    shots = [];
                    i = 0;
                    _f.label = 2;
                case 2:
                    if (!(i < cards.length)) return [3 /*break*/, 6];
                    (dashEl.querySelectorAll('.kpis .kpi')[i]).click();
                    return [4 /*yield*/, wait(450)];
                case 3:
                    _f.sent();
                    d_1 = drill();
                    if (!d_1) return [3 /*break*/, 5];
                    _c = (_b = shots).push;
                    return [4 /*yield*/, shoot(html2canvas, d_1, info[i].lab, i)];
                case 4:
                    _c.apply(_b, [_f.sent()]);
                    _f.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 2];
                case 6:
                    after = drill();
                    n = after ? after.nextElementSibling : null, title = '';
                    _f.label = 7;
                case 7:
                    if (!n) return [3 /*break*/, 11];
                    if (!n.classList.contains('band')) return [3 /*break*/, 8];
                    title = clean(n.querySelector('h2'));
                    return [3 /*break*/, 10];
                case 8:
                    if (!n.matches('section.panel')) return [3 /*break*/, 10];
                    _e = (_d = shots).push;
                    return [4 /*yield*/, shoot(html2canvas, n, title || clean(n.querySelector('h3')))];
                case 9:
                    _e.apply(_d, [_f.sent()]);
                    _f.label = 10;
                case 10:
                    n = n.nextElementSibling;
                    return [3 /*break*/, 7];
                case 11:
                    if (cards.length)
                        dashEl.querySelectorAll('.kpis .kpi')[openIdx].click();
                    P = new PptxGenJS();
                    P.layout = 'LAYOUT_WIDE';
                    P.theme = { headFontFace: 'Calibri', bodyFontFace: 'Calibri' };
                    P.title = 'EDRMS Utilization Report - ' + meta.name;
                    kw = 2.5, aw = 12.33 - kw - 0.3;
                    shots.forEach(function (sh) {
                        var top = sh.on !== undefined ? 2.55 : 1.45, ah = 6.85 - top;
                        // Split where the picture would otherwise shrink below 85% of the area's width.
                        var maxH = Math.round(sh.canvas.width * ah / (aw * 0.85));
                        slices(sh.canvas, sh.breaks, sh.blocks, sh.tops, maxH).forEach(function (part, pi) {
                            var s = P.addSlide();
                            s.background = { color: 'FFFFFF' };
                            s.addText(sh.title + (pi ? ' (continued)' : ''), { x: 0.5, y: 0.35, w: 7, h: 0.55, fontSize: 28, bold: true, color: '10243E', isTextBox: true, margin: 0 });
                            s.addText(meta.name + (meta.desc ? '  ·  ' + meta.desc : ''), { x: 0.5, y: 0.92, w: 8.6, h: 0.45, fontSize: 13, color: '33475F', valign: 'top', isTextBox: true, margin: 0 });
                            s.addText([{ text: 'Data as of ', options: { color: '33475F' } }, { text: meta.asOf, options: { bold: true, color: '10243E', breakLine: true } }, { text: meta.filter, options: { color: '6B7A8C' } }], { x: 7.6, y: 0.38, w: 5.23, h: 0.95, fontSize: 11, align: 'right', valign: 'top', isTextBox: true, margin: 0, fit: 'shrink' });
                            if (sh.on !== undefined) {
                                var gap_1 = 0.2, cw_1 = (12.33 - gap_1 * (info.length - 1)) / info.length;
                                info.forEach(function (k, i) {
                                    var x = 0.5 + i * (cw_1 + gap_1), on = i === sh.on;
                                    s.addShape(P.ShapeType.roundRect, { x: x, y: 1.45, w: cw_1, h: 0.9, rectRadius: 0.08, fill: { color: on ? 'EAF3FB' : 'FFFFFF' }, line: { color: on ? '0072BC' : 'D9E1EA', width: on ? 1.25 : 0.75 } });
                                    s.addText(k.lab, { x: x + 0.15, y: 1.55, w: cw_1 - 0.3, h: 0.3, fontSize: 11, color: '6B7A8C', isTextBox: true, margin: 0, fit: 'shrink' });
                                    s.addText(k.val, { x: x + 0.15, y: 1.85, w: cw_1 - 0.3, h: 0.42, fontSize: 22, bold: true, color: '10243E', isTextBox: true, margin: 0 });
                                });
                            }
                            var ratio = part.width / part.height;
                            var w = aw, h = w / ratio;
                            if (h > ah) {
                                h = ah;
                                w = h * ratio;
                            }
                            s.addImage({ data: part.toDataURL('image/png'), x: 0.5, y: top, w: w, h: h });
                            var kx = 12.83 - kw;
                            s.addShape(P.ShapeType.roundRect, { x: kx, y: top, w: kw, h: ah, rectRadius: 0.08, fill: { color: 'F5F8FC' }, line: { color: 'D9E1EA', width: 0.75 } });
                            s.addText('Key points', { x: kx + 0.18, y: top + 0.15, w: kw - 0.36, h: 0.35, fontSize: 14, bold: true, color: '10243E', isTextBox: true, margin: 0 });
                            s.addText([0, 1, 2].map(function (j) { return ({ text: 'Add a key point', options: { bullet: true, breakLine: j < 2 } }); }), { x: kx + 0.18, y: top + 0.6, w: kw - 0.36, h: 1.8, fontSize: 12, italic: true, color: '6B7A8C', valign: 'top', paraSpaceAfter: 6, isTextBox: true, margin: 0 });
                            s.addText('Asian Development Bank', { x: 0.5, y: 7.05, w: 6, h: 0.3, fontSize: 10, color: '6B7A8C', isTextBox: true, margin: 0 });
                            s.addNotes('Exported from the EDRMS Utilization Report, ' + meta.name + '. Data as of ' + meta.asOf + '. The chart or table is a picture; the title, cards and key points are editable. Editable figures are in the Excel export.');
                        });
                    });
                    d = new Date(), stamp = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
                    return [4 /*yield*/, P.writeFile({ fileName: 'EDRMS ' + meta.name + ' ' + stamp + '.pptx' })];
                case 12:
                    _f.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=exporters.js.map