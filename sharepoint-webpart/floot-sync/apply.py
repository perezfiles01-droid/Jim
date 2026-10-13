# Brings the web part's report source up to date with the Floot app as of
# 13 Oct 2026. Called by pending-fixes.py on its output. Every replacement
# must land exactly once, otherwise the build stops.
import json, os, re
H = os.path.dirname(os.path.abspath(__file__))
def J(n): return json.load(open(os.path.join(H, n), encoding='utf-8'))
def T(n): return open(os.path.join(H, n), encoding='utf-8').read()

def once(s, a, b, what=''):
    c = s.count(a)
    assert c == 1, 'floot-sync: expected 1, found %d: %s %s' % (c, what, a[:90])
    return s.replace(a, b)

def apply(s):
    # Bank-wide navigation check: a click inside the dashboard is a newer navigation.
    s = once(s, '              new MutationObserver(schedule).observe(view, {childList:true,subtree:true});',
             '              view.addEventListener("click", () => { navigationSequence++; }, true);\n'
             '              new MutationObserver(schedule).observe(view, {childList:true,subtree:true});', 'watchdog')
    # Comparison panel: separate columns, sortable headers, search, filter, 20 per page.
    s, k = re.subn(r'  function drawCmp\(\)\{[\s\S]*?\n  \}', lambda m: T('compare-renderer.js.txt').rstrip('\n'), s, count=1)
    assert k == 1, 'floot-sync: drawCmp'
    s = once(s, 'by declaration date (Manila time).', 'by declaration date.', 'Manila')
    # Department filter on the Sites and Physical counterparts tables; cards follow it.
    s = once(s, 'const rows=allRows.filter(x=>(x.code+" "+x.name).toLowerCase().includes(searchTerm));',
             'window.__edrmsDepts=allRows;const rows=allRows.filter(x=>(x.code+" "+x.name).toLowerCase().includes(searchTerm)).filter(x=>{const s=(window.__edrmsSel||{}).sites;return !s||!s.length||s.includes(x.code);});', 'sites filter')
    s = once(s, '    const rows=sortedDepts.filter(d=>!physQ||',
             '    const physSel=(window.__edrmsSel||{}).phys||[];window.__edrmsDepts=window.__edrmsDepts||sortedDepts;\n'
             '    const physIn=sortedDepts.filter(d=>!physSel.length||physSel.includes(d.code));\n'
             '    if(physSel.length&&tiles.length>=3){const P=physIn.reduce((a,d)=>a+d.phys,0),R=physIn.reduce((a,d)=>a+d.rec,0);tiles[0]=[tiles[0][0],F(P)];tiles[1]=[tiles[1][0],F(R)];tiles[2]=[tiles[2][0],PCT(P,R).toFixed(1)+"%"];}\n'
             '    const rows=physIn.filter(d=>!physQ||', 'phys filter')
    s = once(s, 'const cards=[...view.querySelectorAll(".tile,.kpi")];',
             'const cards=[...scope.querySelectorAll(".tile"),...view.querySelectorAll(".tile,.kpi")];', 'donut')
    # Records declared over time: drill down, counts on bars, rolling months, date range.
    # (style-only steps are skipped: those styles are in styles.css)
    for a, b in J('trp.json'):
        if '#bw-trend-panel .tr' not in a: s = once(s, a, b, 'trend')
    s = once(s, '"<span><i class=\\"ln\\" style=\\"background:#0072bc\\"></i>Running total in range (right axis)</span>"',
             '"<span><i class=\\"ln\\" style=\\"background:#0072bc\\"></i>Running total in "+(drill||"range")+" (right axis)</span>"', 'legend')
    for a, b in J('trp2.json'):
        if '#bw-trend-panel .tr' not in a: s = once(s, a, b, 'trend2')
    s = once(s, '''    /* 13 Oct 2026: the pickers run up to today, in the reader's own time zone
       (the browser's clock), so Manila readers get Manila's date. Months with
       no data loaded yet simply show no bar. */
    const TD=new Date(), TODAY=TD.getFullYear()+"-"+String(TD.getMonth()+1).padStart(2,"0")+"-"+String(TD.getDate()).padStart(2,"0");
    from.min=DATA.RANGE_FROM; from.max=TODAY;
    to.min=DATA.RANGE_FROM; to.max=TODAY;''', '''    /* 13 Oct 2026: date fields run from the first month with figures up to
       today (the reader's own clock). Their calendar (EDRMS_DATEPICKER) lists
       only the years that have figures. */
    const MK=DATA.MONTH_KEYS, TODAY=DATA.RANGE_TO;
    from.min=DATA.RANGE_FROM; from.max=TODAY;
    to.min=DATA.RANGE_FROM; to.max=TODAY;''', 'trend init')
    s = once(s, '      if(!from.value) from.value=DATA.RANGE_FROM;', '      if(!from.value) from.value=MK[0];', 'trend from')
    for a, b in J('trp4.json'): s = once(s, a, b, 'months')
    # Library usage: each library sits on one of its department's own sites.
    a = 'const siteName=siteNames[Math.floor(i/25)%siteNames.length];'
    assert s.count(a) == 2, 'floot-sync: siteName'
    s = s.replace(a, 'const _ss=sitesFor(d.code), siteName=_ss.length?_ss[i%_ss.length].name:d.code;')
    # Department Insights: several departments at once.
    for a, b in J('mpp.json'): s = once(s, a, b, 'multi')
    s = once(s, "`<option value=\"${d.code}\" ${d.code===dept?\"selected\":\"\"}>${d.code} - ${d.name}</option>`).join(\"\");\n    libsSel.onchange=",
             "`<option value=\"${d.code}\" ${d.code===dept?\"selected\":\"\"}>${d.code} - ${d.name}</option>`).join(\"\")+(dept.indexOf(\",\")>0?`<option value=\"${dept}\" selected>${dept}</option>`:\"\");\n    libsSel.onchange=", 'libs multi')
    s = once(s, '''<span class="dp-tag">Entered by RAC</span></div>'+''', '''</div>'+''', 'tag1')
    s = once(s, '''<span class="dp-tag">Link from RAC</span></div>';''', '''</div>';''', 'tag2')
    # EDRMS sites panel: range up to today, footer, way back to all years.
    s = once(s, 'SO_MAX=new Date(2026,8,30)', 'SO_MAX=(function(){var d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate());})()', 'SO_MAX')
    a = 'max="2026-09-30"'
    assert s.count(a) == 2, 'floot-sync: so3 max'
    s = s.replace(a, 'max="\'+SO_MAX.getFullYear()+"-"+String(SO_MAX.getMonth()+1).padStart(2,"0")+"-"+String(SO_MAX.getDate()).padStart(2,"0")+\'"')
    s = once(s, '?" 2026 covers January to September.":"")',
             '?" "+SO_MAX.getFullYear()+" covers January to "+["January","February","March","April","May","June","July","August","September","October","November","December"][SO_MAX.getMonth()]+".":"")', 'footer')
    s = once(s, "    var back='';", "    var back=(!r.custom&&soYear!==\"all\")?'<span class=\"so3-crumb\"><a href=\"#\" id=\"so3-back\">All years</a> <span aria-hidden=\"true\">&#8250;</span> <b>'+soYear+'</b></span>':'';", 'back')
    s = once(s, 'var bk=document.getElementById("so3-back"); if(bk) bk.onclick=function(){soYear="all";',
             'var bk=document.getElementById("so3-back"); if(bk) bk.onclick=function(e){if(e)e.preventDefault();soYear="all";', 'bk')
    # Site filter.
    for a, b in J('sfp.json'): s = once(s, a, b, 'site filter')
    s = once(s, 'generateSampleLibraries(dept).map(',
             'generateSampleLibraries(dept).filter(function(l){var f=window.__dpSites;return !f||!f.length||f.indexOf(l.site)>=0;}).map(', 'libs site')
    s = once(s, '  function drawLibs(){\n    var libs=generateSampleLibraries(dept).filter(',
             '  function drawLibs(){\n    try{window.__dpSiteList=sitesFor(dept).map(function(s){return s.name;});var _f=window.__dpSites;if(_f&&_f.length)window.__dpSites=_f.filter(function(n){return window.__dpSiteList.indexOf(n)>=0;});}catch(e){}\n    var libs=generateSampleLibraries(dept).filter(', 'libs list')
    # Floot-only add-ons, appended as in the Floot app.
    add = '<style>\n' + T('styles.css') + '</style>\n' + T('table-filter.html') + T('datepicker.html') + T('dept-multiselect.html') + T('site-filter.html')
    i = s.rfind('</body>')
    return s[:i] + add + s[i:]
