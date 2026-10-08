// Shows the EDRMS report inside a container element. Kept free of SharePoint
// imports so the same code the web part runs can be tested in a plain browser
// page (see test/host-test.js).

export type Dashboard = 'bw' | 'dp';
export type Sizing = 'content' | 'window' | 'fixed';
export type TextSize = 'standard' | 'large' | 'xlarge';

export interface IReportOptions {
  dashboard: Dashboard;
  showSidebar: boolean;
  sizing: Sizing;
  height: number;
  textSize: TextSize;
  // Colour the report's sidebar and SharePoint's site header in the BPMSD
  // site's blue, without a tenant theme.
  adbBlue: boolean;
}

// The blue of the BPMSD SharePoint site, sampled from it.
const ADB_BLUE: string = '#194F8E';
const ADB_BLUE_HI: string = '#2A62A3';

// The report is laid out on a fixed canvas and scaled to the width it is
// given, as the Floot app does it. 1920px is the approved monitor view; a
// narrower canvas makes everything larger once scaled, for readers who need
// bigger text. The layout was checked at all three widths.
const CANVAS: { [k in TextSize]: number } = { standard: 1920, large: 1536, xlarge: 1280 };
// Remembered per browser: whether the reader last closed the sidebar.
const SIDEBAR_KEY: string = 'edrms-sidebar-closed';

export class ReportHost {
  private readonly _box: HTMLDivElement;
  private readonly _frame: HTMLIFrameElement;
  private _options: IReportOptions;
  private _observer: ResizeObserver | undefined;
  private _innerObserver: ResizeObserver | undefined;
  private _shown: Dashboard | undefined;
  private readonly _onResize = (): void => { this.fit(); };
  private readonly _onScroll = (): void => { /* sidebar stays put (1.0.11) */ };

  public constructor(
    private readonly _container: HTMLElement,
    private readonly _base: string,
    html: string,
    private readonly _scripts: string[],
    options: IReportOptions,
    private readonly _version: string,
    boxClass: string,
    frameClass: string,
    title: string
  ) {
    this._options = options;
    this._box = document.createElement('div');
    this._box.className = boxClass;
    this._frame = document.createElement('iframe');
    this._frame.className = frameClass;
    this._frame.title = title;
    this._frame.setAttribute('scrolling', 'no');
    // Every load, not just the first: SharePoint moves web parts while it lays
    // out the page, and moving an iframe reloads it without the scripts.
    this._frame.addEventListener('load', () => this._onLoad());
    this._frame.srcdoc = html.split('__EDRMS_BASE__').join(_base);
    this._box.appendChild(this._frame);
    _container.innerHTML = '';
    _container.appendChild(this._box);

    if (typeof ResizeObserver !== 'undefined') {
      this._observer = new ResizeObserver(() => this.fit());
      this._observer.observe(_container);
    }
    window.addEventListener('resize', this._onResize);
    // SharePoint scrolls its page inside a div, so listen in the capture
    // phase to hear scrolls of any element, not just the window.
    document.addEventListener('scroll', this._onScroll, true);
    this.fit();
  }

  public update(options: IReportOptions): void {
    this._options = options;
    this._applyStyle();
    this._showDashboard();
    this._addMenuButton();
    this._relayout();
    this.fit();
  }

  public dispose(): void {
    if (this._observer) this._observer.disconnect();
    if (this._innerObserver) this._innerObserver.disconnect();
    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('scroll', this._onScroll, true);
    const headerStyle: HTMLElement | null = document.getElementById('edrms-site-header-blue');
    if (headerStyle) headerStyle.remove();
  }

  private _doc(): Document | null {
    const d: Document | null = this._frame.contentDocument;
    return d && d.getElementById('view') ? d : null;
  }

  private _onLoad(): void {
    const doc: Document | null = this._doc();
    if (!doc || !doc.body) return;
    const root: HTMLElement = doc.documentElement;
    if (root.getAttribute('data-edrms-loaded') === '1') return;
    root.setAttribute('data-edrms-loaded', '1');
    this._shown = undefined;
    this._applyStyle();

    // SharePoint's policy carries 'strict-dynamic': a <script src> in the
    // markup is refused, but a script element added by trusted code runs.
    // async=false keeps them executing in the order they are appended.
    const problems: string[] = [];
    doc.addEventListener('securitypolicyviolation', (e: SecurityPolicyViolationEvent) => {
      problems.push('Blocked by the security policy (' + e.violatedDirective + '): ' + (e.blockedURI || 'inline code'));
    });
    this._scripts.forEach((file: string) => {
      const s: HTMLScriptElement = doc.createElement('script');
      s.src = this._base + file;
      s.async = false;
      s.onerror = () => { problems.push('Could not load ' + this._base + file); };
      doc.body.appendChild(s);
    });

    // The report's own size changes as dashboards and breakdowns open, so
    // follow it from inside the frame.
    const win: (Window & typeof globalThis) | null = this._frame.contentWindow as (Window & typeof globalThis) | null;
    if (win && typeof win.ResizeObserver !== 'undefined') {
      if (this._innerObserver) this._innerObserver.disconnect();
      this._innerObserver = new win.ResizeObserver(() => this.fit());
      this._innerObserver.observe(doc.body);
    }

    // Open the chosen dashboard once the report has drawn its first one.
    let tries: number = 0;
    const wait: number = window.setInterval(() => {
      tries++;
      if (this._frame.contentDocument !== doc) { window.clearInterval(wait); return; }
      if (doc.querySelector('#view .kpi')) {
        window.clearInterval(wait);
        this._showDashboard(); this._addMenuButton(); this._relayout();
        // Opening a dashboard redraws the title band, so put the moved
        // controls back whenever the view changes.
        const view: HTMLElement | null = doc.getElementById('view');
        const win2: (Window & typeof globalThis) | null = this._frame.contentWindow as (Window & typeof globalThis) | null;
        if (view && win2) new win2.MutationObserver(() => this._relayout()).observe(view, { childList: true });
        // The report adds its Export button to the header shortly after it
        // starts; pick it up when it appears.
        window.setTimeout(() => this._relayout(), 600);
        window.setTimeout(() => this._relayout(), 1600);
        this.fit();
        return;
      }
      if (tries === 40) {
        window.clearInterval(wait);
        const note: HTMLDivElement = doc.createElement('div');
        note.setAttribute('role', 'alert');
        note.style.cssText = 'position:fixed;left:24px;right:24px;top:24px;z-index:99999;padding:16px 18px;' +
          'background:#fff4f4;border:2px solid #c62828;border-radius:10px;font:15px/1.5 Segoe UI,Arial,sans-serif;color:#5b1111';
        const lines: string[] = problems.length ? problems.slice(0, 8) : ['No error was reported, but the dashboards did not draw.'];
        note.textContent = 'EDRMS web part ' + this._version + ': the report did not start. ' + lines.join(' | ') + ' | Assets: ' + this._base;
        doc.body.appendChild(note);
        this.fit();
      }
    }, 200);
  }

  // Page-level rules the report gets inside SharePoint.
  private _applyStyle(): void {
    const doc: Document | null = this._doc();
    if (!doc || !doc.head) return;
    let style: HTMLStyleElement | null = doc.getElementById('edrms-sharepoint') as HTMLStyleElement | null;
    if (!style) {
      style = doc.createElement('style');
      style.id = 'edrms-sharepoint';
      doc.head.appendChild(style);
    }
    // 1.0.22: option A of mockups/sidebar-toggle-options.png. A Fluent
    // subtle button with the Navigation icon at the top of the sidebar it
    // controls; closing leaves a 56px rail of the page icons, never nothing.
    let css: string = '.edrms-menu{display:flex;align-items:center;justify-content:center;flex:0 0 auto;width:36px;height:36px;' +
      'margin:0 0 8px 14px;padding:0;border:0;border-radius:4px;background:transparent;color:#fff;cursor:pointer}' +
      '.edrms-menu:hover{background:rgba(255,255,255,.14)}' +
      '.edrms-menu:focus-visible{outline:2px solid #fff;outline-offset:1px}' +
      '.edrms-menu svg{width:20px;height:20px;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;fill:none}' +
      'html.edrms-side-closed #side{width:56px!important;min-width:56px!important;max-width:56px!important;flex:0 0 56px!important;padding-left:0!important;padding-right:0!important;overflow:hidden!important}' +
      'html.edrms-side-closed .edrms-menu{margin:0 auto 8px!important}' +
      // 1.0.24: option A of mockups/sidebar-header-options.png, the button
      // beside the report's name; closed, the name hides and the button stays.
      '#side .brand{display:grid!important;grid-template-columns:36px minmax(0,1fr);column-gap:10px;align-items:start}' +
      '#side .brand>.edrms-menu{grid-row:1/3;grid-column:1;margin:0!important}' +
      '#side .brand>.t1{grid-column:2;font-size:17px!important;line-height:1.25!important;padding-top:7px}' +
      '#side .brand>.t2{grid-column:2;letter-spacing:.08em!important;white-space:nowrap}' +
      'html.edrms-side-closed #side .brand{display:flex!important;justify-content:center!important;padding-left:0!important;padding-right:0!important}' +
      'html.edrms-side-closed #side .brand>.t1,html.edrms-side-closed #side .brand>.t2{display:none!important}' +
      'html.edrms-side-closed #nav .grp{font-size:0!important;line-height:0!important;padding:0!important;margin:8px 10px 6px!important;border-top:1px solid rgba(255,255,255,.22)!important;height:0;overflow:visible}' +
      'html.edrms-side-closed #nav a{font-size:0!important;justify-content:center!important;padding:10px 0!important;gap:0!important;margin:0!important;text-align:center!important}' +
      'html.edrms-side-closed #nav a .ic{font-size:17px!important;margin:0!important;width:auto!important}';
    // No top header strip: its Export to PDF and "EDRMS Reporting Suite"
    // card sit on the right of the dashboard's title band instead, and the
    // menu button on its left (see _relayout).
    css += 'header{display:none!important}' +
      '#view .band.edrms-top{position:relative;min-height:60px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;padding-right:440px!important}' +
      '.edrms-tools{position:absolute;right:18px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:10px}' +
      '.edrms-tools .dx-btn{position:static!important;transform:none!important;right:auto!important}' +
      '.edrms-tools .crumb{position:relative!important;top:auto!important;right:auto!important;left:auto!important;transform:none!important;margin:0!important;' +
      'max-width:none!important;min-width:0!important;width:auto!important;white-space:nowrap!important;flex:0 0 auto}' +
      '.edrms-tools .crumb *{white-space:nowrap!important}';
    // Compact layout (1.0.9): a smaller Export button and suite card, shorter
    // cards and table rows, so the first table shows in full on first view.
    css += '#view .band.edrms-top{padding-top:8px!important;padding-bottom:8px!important;margin-bottom:12px!important}' +
      '#view .band.edrms-top h2{font-size:17px!important}' +
      '#view .band.edrms-top .bd{font-size:12.5px!important;margin-top:2px!important}' +
      '.edrms-tools .dx-btn{height:32px!important;padding:0 12px!important;font-size:12.5px!important;border-radius:8px!important;gap:6px!important}' +
      '.edrms-tools .dx-btn svg{width:14px!important;height:14px!important}' +
      '.edrms-tools .crumb{padding:6px 12px 6px 38px!important;font-size:12.5px!important;min-height:0!important}' +
      '.edrms-tools .crumb .snapshot-date{font-size:11px!important;margin-top:1px!important}' +
      '.kpi{padding:10px 14px!important;min-height:0!important}' +
      '.kpi .lab{font-size:12.5px!important;margin:0!important;line-height:1.3!important}' +
      '.kpi .val{font-size:26px!important;line-height:1.15!important;margin:3px 0 0!important}' +
      '.kpi .kpi-helper,.kpi .kpi-sub{font-size:11.5px!important;min-height:0!important;margin-top:2px!important;line-height:1.3!important}' +
      '.kpi .tap{margin-top:5px!important;font-size:12px!important}' +
      '.dash-bw .kpis,.dash-dp .kpis{margin-bottom:12px!important}' +
      '.dash-bw .drow,.dash-dp .drow{padding-top:5px!important;padding-bottom:5px!important;min-height:0!important}' +
      '.dash-bw .hbar{margin:4px 0!important}' +
      '.kpi .lab{min-height:0!important}' +
      '.kpi .tap{padding-top:0!important;margin-top:4px!important}' +
      '.kpi .val{font-size:24px!important}' +
      '.dash-bw .drow,.dash-dp .drow{row-gap:2px!important}' +
      '.dash-bw .dn .dcx,.dash-dp .dn .dcx{padding:0!important;line-height:1.25!important}' +
      '.dash-bw .hbar,.dash-dp .hbar{row-gap:3px!important}' +
      '.dash-bw .hbar .hl,.dash-dp .hbar .hl{line-height:1.25!important}' +
      '.sites-split .sites-table .drow,.sites-split .sites-rank .hbar{height:42px!important}' +
      '.sites-split .sites-rank .ht{height:18px!important}' +
      '#view .panel{margin-bottom:14px!important}' +
      '.dash-dp .dp-strip{margin:0 0 10px!important}' +
      '.dash-dp .dp-chip{padding:7px 14px!important}' +
      '.dash-dp .dp-ic{width:30px!important;height:30px!important}' +
      '.dash-dp .kpigrp{margin-bottom:4px!important}' +
      '.dash-dp .kpigrp .gh{margin-bottom:6px!important}' +
      '.dash-dp .toolbar{margin-bottom:10px!important}' +
      '.so3-bar{padding:8px 14px!important;margin-top:8px!important}' +
      '.dash-dp .ptitle+.psub{margin-bottom:8px!important}' +
      '.sites-rank .psub,.sites-rank p{margin-bottom:6px!important}.dash-bw .drow .dcx,.dash-dp .drow .dcx,.sites-rank .dcx{flex-direction:row!important;align-items:baseline!important;justify-content:flex-start!important;gap:8px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}' +
      '.sites-split .sites-table .drow,.sites-split .sites-rank .hbar{height:34px!important}' +
      '.sites-split .sites-rank .ht{height:16px!important}' +
      '.kpi{position:relative!important}' +
      // 1.0.11: the label gets the card's full width so names show whole;
      // "View breakdown" sits on its own line at the foot of the card.
      '.kpi{display:flex!important;flex-direction:column!important}' +
      '.kpi .tap{position:static!important;margin:auto 0 0!important;padding-top:6px!important}' +
      '.kpi .lab{padding-right:0!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important;display:block!important;word-break:normal!important}';
    // 1.0.13: the physical counterparts table fits its panel (its share
    // column showed only after scrolling sideways), and the libraries table
    // gives Library and Site the room the number columns were taking.
    css += '#bw-phys{min-width:0!important;--dc:minmax(0,1.5fr) repeat(3,minmax(0,1fr))!important}#bw-phys .hd{white-space:normal!important;line-height:1.25!important}#dp-libs-tab th:nth-child(2){width:26%!important}#dp-libs-tab th:nth-child(3){width:92px!important}#dp-libs-tab th:nth-child(4){width:76px!important}#dp-libs-tab th:nth-child(5){width:122px!important}#dp-libs-tab th:nth-child(6){width:72px!important}#dp-libs-tab th:nth-child(n+5){white-space:normal!important;line-height:1.2!important;word-break:normal!important;overflow-wrap:normal!important}';
    // 1.0.15: library names wrap rather than being cut short.
    css += '#dp-libs-tab th:nth-child(2){width:22%!important}#dp-libs-tab th:nth-child(3){width:86px!important}#dp-libs-tab th:nth-child(4){width:70px!important}#dp-libs-tab td.so-name{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:1.25!important;padding-top:6px!important;padding-bottom:6px!important}';
    // 1.0.20: first-screen spacing (mockups/bankwide-first-screen.png). The
    // title band on one line, cards with View breakdown beside the name and
    // the value beside its description, and no white panel round the first
    // two tables, so the first table and its pager show without scrolling.
    css += '#view>section{padding-top:10px!important}#view .band.edrms-top{min-height:46px!important;flex-direction:row!important;align-items:baseline!important;justify-content:flex-start!important;gap:14px;padding-top:7px!important;padding-bottom:7px!important;margin-bottom:8px!important}#view .band.edrms-top h2{white-space:nowrap}#view .band.edrms-top .bd{margin-top:0!important;min-width:0}#view .kpigrp{margin-bottom:8px!important}#view .kpis{margin-bottom:0!important}#view .dash-bw .kpi{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto;grid-template-rows:auto auto;column-gap:10px;align-items:baseline;padding:8px 14px!important}#view .dash-bw .kpi .lab{grid-column:1/3;grid-row:1;white-space:normal!important;min-width:0}#view .dash-bw .kpi .tap{grid-column:3;grid-row:1;margin:0!important;padding:0!important;white-space:nowrap}#view .dash-bw .kpi .val{grid-column:1;grid-row:2;margin:2px 0 0!important;white-space:nowrap}#view .dash-bw .kpi .kpi-helper,#view .dash-bw .kpi .kpi-sub{grid-column:2/4;grid-row:2;margin:0!important}#view .panel:has(>.sites-split){background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}#view .sites-split .ptitle{margin-bottom:6px!important}#view .sites-split .psub{margin-bottom:8px!important}#view .sites-rank,#view .sites-table{padding-top:12px!important;padding-bottom:12px!important}';
    // 1.0.21: Data as of beside Export to PDF, which keeps its white style
    // (mockups/header-cards-redesign.png, as chosen by the requester).
    css += '.edrms-tools{gap:16px!important}.edrms-tools .crumb{order:-1;display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;font-family:inherit!important;line-height:1.2!important;align-items:center!important;gap:8px!important;height:28px!important;min-height:0!important;padding:0 16px 0 0!important;background:none!important;border:0!important;border-right:1px solid #dfe6ee!important;border-radius:0!important;box-shadow:none!important;font-size:13px!important;font-weight:400!important;color:#5b6b7d!important}.edrms-tools .crumb:before{content:none!important;display:none!important}.edrms-tools .crumb b{display:inline!important;font-family:inherit!important;font-size:13px!important;font-weight:600!important;line-height:1.2!important;color:#0b2545!important;margin:0!important}.edrms-tools .edrms-dot{display:inline-block!important;position:static!important;width:8px;height:8px;border-radius:50%;background:#43a047;box-shadow:0 0 0 3px #e3f3e4;flex:0 0 auto}';
    // 1.0.23: SharePoint's own font (Fluent's Segoe UI stack) everywhere,
    // titles included, in place of the report's serif headings.
    css += 'html,body,body *:not(.ic){font-family:\"Segoe UI Web (West European)\",\"Segoe UI\",-apple-system,BlinkMacSystemFont,Roboto,\"Helvetica Neue\",sans-serif!important}#view h1,#view h2,#view h3,#view .ptitle,#side .t1,#view .so2-t,#view .dh-t{font-weight:600!important;letter-spacing:0!important}';
    // A more readable sidebar: white menu text a size up, light labels, and
    // the future-release items still dimmed but legible.
    css += '#side .t2{color:#DCE8F6!important;font-size:11.5px!important}' +
      '#nav .grp,#nav .future-release-group{color:#DCE8F6!important;font-size:12px!important;opacity:1!important}' +
      '#nav a{color:#FFFFFF!important;font-size:15.5px!important}' +
      '#nav .future-release-group a{color:#E8F0FA!important;opacity:.72!important;font-size:14.5px!important}' +
      '#nav a.on{background:rgba(255,255,255,.18)!important}';
    if (this._options.adbBlue) {
      css += ':root{--nav:' + ADB_BLUE + '!important;--nav-hi:' + ADB_BLUE_HI + '!important}' +
        '#side{background:' + ADB_BLUE + '!important}';
    }
    if (!this._options.showSidebar) {
      // SharePoint's own navigation takes over from the report's sidebar.
      css += '#side{display:none!important}';
    }
    if (this._options.sizing === 'content') {
      // Let the report take its natural height: the page scrolls, not the
      // frame. The sidebar stops being tied to the window's height, or the
      // report could grow but never shrink back.
      css += 'html,body{height:auto!important;min-height:0!important;overflow:hidden!important}' +
        '#side{height:auto!important;position:relative!important;top:auto!important}' +
        'header{position:relative!important}' +
        // The page, not the report, scrolls, so the sidebar's own sticky
        // positioning cannot work. Its contents are moved down by script
        // instead (see _stickSidebar), so the menu stays in view.
        // The menu is set to stretch to the sidebar's full height; let it
        // keep its own height so there is room to move it.
        // 1.0.11: the sidebar no longer follows the scroll. Moving it by
        // script always trailed the page by a frame and looked shaky.
        '#side>*{flex-grow:0!important}';
    }
    style.textContent = css;
    this._colourSiteHeader();
  }

  // SharePoint's own site header (site name and menu) in the same blue. Its
  // colour normally comes from the site theme, which needs a tenant admin to
  // add a custom one; this style lives only on pages carrying the web part.
  private _colourSiteHeader(): void {
    const id: string = 'edrms-site-header-blue';
    let style: HTMLStyleElement | null = document.getElementById(id) as HTMLStyleElement | null;
    if (!this._options.adbBlue) {
      if (style) style.remove();
      return;
    }
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    const h: string = '#spSiteHeader,[data-automationid="SiteHeader"]';
    // Hide SharePoint's site footer on this page (by its own ids only: 1.0.17
    // hid every footer element, which took the Save button off SharePoint's
    // Change the look panel), so the report runs to the
    // bottom of the page instead of stopping above a coloured bar.
    style.textContent =
      '[data-automationid="SiteFooter"],[data-automation-id="SiteFooter"],#spSiteFooter{display:none!important}' +
      h.split(',').map((x: string) => x + ',' + x + ' div').join(',') + '{background-color:' + ADB_BLUE + '!important;border-color:' + ADB_BLUE_HI + '!important}' +
      h.split(',').map((x: string) => x + ' a,' + x + ' span,' + x + ' button,' + x + ' i').join(',') + '{color:#fff!important}';
  }

  private _tools: HTMLElement | undefined;
  private _menu: HTMLButtonElement | undefined;
  private _toolsDoc: Document | undefined;

  // Move the header's Export to PDF button and "EDRMS Reporting Suite" card
  // onto the right of the dashboard's title band, and the menu button onto
  // its left. The elements are kept and moved, not copied, so they keep
  // their behaviour; when the band is redrawn they are put on the new one.
  private _relayout(): void {
    const doc: Document | null = this._doc();
    if (!doc) return;
    const band: HTMLElement | null = doc.querySelector('#view .band');
    if (!band) return;
    if (this._toolsDoc !== doc) { this._tools = undefined; this._menu = undefined; this._toolsDoc = doc; }
    if (!this._tools) {
      this._tools = doc.createElement('div');
      this._tools.className = 'edrms-tools';
    }
    const tools: HTMLElement = this._tools;
    const dx: HTMLElement | null = tools.querySelector('.dx-btn') || doc.querySelector('header .dx-btn');
    const crumb: HTMLElement | null = tools.querySelector('.crumb') || doc.querySelector('.crumb');
    if (dx && dx.parentElement !== tools) tools.insertBefore(dx, tools.firstChild);
    if (crumb && crumb.parentElement !== tools) tools.appendChild(crumb);
    // 1.0.21: the "EDRMS Reporting Suite / As of Sep 2026" card becomes a
    // quiet "Data as of Sep 2026" beside Export to PDF. The date is still
    // read from the report's own text, so it moves when the report's does.
    if (crumb && !crumb.hasAttribute('data-edrms-asof')) {
      const sd: Element | null = crumb.querySelector('.snapshot-date');
      const when: string = (sd ? sd.textContent || '' : '').replace(/^\s*as of\s*/i, '').trim();
      if (when) {
        crumb.setAttribute('data-edrms-asof', '1');
        crumb.innerHTML = '<span class="edrms-dot" aria-hidden="true"></span>Data as of <b></b>';
        (crumb.querySelector('b') as HTMLElement).textContent = when;
      }
    }
    band.classList.add('edrms-top');
    if (tools.parentElement !== band) band.appendChild(tools);
    // Held by reference: when the band is redrawn the button goes with the old
    // band, so it cannot be found in the page again.
    const menu: HTMLButtonElement | undefined = this._menu;
    const side: HTMLElement | null = doc.getElementById('side');
    band.classList.remove('edrms-has-menu');
    const brand: HTMLElement | null = side ? side.querySelector('.brand') : null;
    const home: HTMLElement | null = brand || side;
    if (menu && this._options.showSidebar && home && menu.parentElement !== home) home.insertBefore(menu, home.firstChild);
    // In the icon rail the names are hidden, so each link carries its name
    // as a tooltip.
    doc.querySelectorAll('#nav a').forEach((a: Element): void => {
      if (!a.getAttribute('title')) a.setAttribute('title', (a.textContent || '').replace(/^[^A-Za-z]+/, '').trim());
    });
  }

  // The menu (hamburger) button at the left of the report's header opens and
  // closes the report's sidebar. Added by this code rather than the report,
  // so it exists only inside SharePoint.
  private _addMenuButton(): void {
    const doc: Document | null = this._doc();
    if (!doc) return;
    const header: HTMLElement | null = doc.querySelector('header');
    if (this._toolsDoc !== doc) { this._tools = undefined; this._menu = undefined; this._toolsDoc = doc; }
    let btn: HTMLButtonElement | null = this._menu || doc.querySelector('.edrms-menu');
    if (!this._options.showSidebar) {
      if (btn) btn.remove();
      this._menu = undefined;
      doc.documentElement.classList.remove('edrms-side-closed');
      return;
    }
    if (btn) { this._syncMenu(); this._relayout(); return; }
    btn = doc.createElement('button');
    this._menu = btn;
    btn.type = 'button';
    btn.className = 'edrms-menu';
    btn.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5.5h14M3 10h14M3 14.5h14"/></svg>';
    btn.addEventListener('click', () => {
      const closed: boolean = !doc.documentElement.classList.contains('edrms-side-closed');
      try { window.localStorage.setItem(SIDEBAR_KEY, closed ? '1' : '0'); } catch { /* storage blocked: this visit only */ }
      this._syncMenu(closed);
    });
    (header || doc.body).insertBefore(btn, (header || doc.body).firstChild);
    this._syncMenu();
    this._relayout();
  }

  private _syncMenu(closed?: boolean): void {
    const doc: Document | null = this._doc();
    if (!doc) return;
    if (closed === undefined) {
      try { closed = window.localStorage.getItem(SIDEBAR_KEY) === '1'; } catch { closed = false; }
    }
    doc.documentElement.classList.toggle('edrms-side-closed', closed);
    const btn: HTMLElement | null = this._menu || doc.querySelector('.edrms-menu');
    if (btn) {
      btn.title = closed ? 'Open navigation' : 'Close navigation';
      btn.setAttribute('aria-label', btn.title);
      btn.setAttribute('aria-expanded', closed ? 'false' : 'true');
    }
    this.fit();
  }

  private _showDashboard(): void {
    const doc: Document | null = this._doc();
    const win: { switchTo?: (key: string) => void } | null =
      this._frame.contentWindow as unknown as { switchTo?: (key: string) => void } | null;
    if (!doc || !win || typeof win.switchTo !== 'function' || !doc.querySelector('#view .kpi')) return;
    if (this._shown === this._options.dashboard) return;
    win.switchTo(this._options.dashboard);
    this._shown = this._options.dashboard;
  }

  // Keep the sidebar's menu in view while SharePoint's page scrolls past the
  // report: shift it down by however much of the report has scrolled out of
  // sight at the top, but never past the bottom of the report.
  private _stickSidebar(): void {
    const doc: Document | null = this._doc();
    if (!doc) return;
    const root: HTMLElement = doc.documentElement;
    const side: HTMLElement | null = doc.getElementById('side');
    if (this._options.sizing !== 'content' || !side || !this._options.showSidebar || root.classList.contains('edrms-side-closed')) {
      root.style.removeProperty('--edrms-stick');
      return;
    }
    const scale: number = this._scale || 1;
    const box: DOMRect = this._box.getBoundingClientRect();
    // Top of the visible area: the top of SharePoint's scrolling region.
    let scroller: HTMLElement | null = this._container.parentElement;
    while (scroller && scroller !== document.body) {
      const oy: string = getComputedStyle(scroller).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && scroller.scrollHeight > scroller.clientHeight) break;
      scroller = scroller.parentElement;
    }
    const visibleTop: number = scroller && scroller !== document.body ? Math.max(0, scroller.getBoundingClientRect().top) : 0;
    let natural: number = 0;
    for (let i: number = 0; i < side.children.length; i++) {
      const c: HTMLElement = side.children[i] as HTMLElement;
      natural = Math.max(natural, c.offsetTop + c.offsetHeight);
    }
    const room: number = Math.max(0, side.offsetHeight - natural);
    const offset: number = Math.min(room, Math.max(0, (visibleTop - box.top) / scale));
    root.style.setProperty('--edrms-stick', Math.round(offset) + 'px');
  }

  private _scale: number = 1;

  public fit(): void {
    // Always exactly the width SharePoint gives the web part. (The Floot app
    // also enlarges the report with browser zoom; inside SharePoint the page
    // already narrows the web part when zooming, so doing both made the
    // report overflow to the right in 1.0.3.)
    const design: number = CANVAS[this._options.textSize] || CANVAS.large;
    const width: number = this._container.clientWidth || design;
    const scale: number = width / design;
    this._scale = scale;
    let inner: number;
    if (this._options.sizing === 'content') {
      const doc: Document | null = this._doc();
      inner = doc && doc.body ? Math.ceil(doc.body.getBoundingClientRect().height) : 1080;
      if (inner < 200) inner = 1080;
    } else {
      const outer: number = this._options.sizing === 'fixed'
        ? Math.max(400, this._options.height || 900)
        : this._windowHeight();
      inner = outer / scale;
    }
    this._frame.style.width = design + 'px';
    this._frame.style.height = inner + 'px';
    this._frame.style.transform = 'scale(' + scale + ')';
    this._box.style.height = Math.ceil(inner * scale) + 'px';
    this._box.style.overflowX = 'hidden';
  }

  // From where the report starts on the page to the bottom of the window,
  // measured as if the page were scrolled to the top.
  private _windowHeight(): number {
    let scroller: HTMLElement | null = this._container.parentElement;
    while (scroller && scroller !== document.body) {
      const oy: string = getComputedStyle(scroller).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && scroller.scrollHeight > scroller.clientHeight) break;
      scroller = scroller.parentElement;
    }
    const scrolled: number = scroller && scroller !== document.body ? scroller.scrollTop : window.scrollY;
    const top: number = this._container.getBoundingClientRect().top + scrolled;
    return Math.max(500, Math.round(window.innerHeight - top - 16));
  }
}
