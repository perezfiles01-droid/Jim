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
}

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
  private readonly _onScroll = (): void => { this._stickSidebar(); };

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
    this.fit();
  }

  public dispose(): void {
    if (this._observer) this._observer.disconnect();
    if (this._innerObserver) this._innerObserver.disconnect();
    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('scroll', this._onScroll, true);
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
      if (doc.querySelector('#view .kpi')) { window.clearInterval(wait); this._showDashboard(); this._addMenuButton(); this.fit(); return; }
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
    let css: string = '.edrms-menu{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:44px;height:44px;' +
      'margin-right:14px;border:1px solid #cfd8e3;border-radius:10px;background:#fff;color:#0b2545;cursor:pointer}' +
      '.edrms-menu:hover{background:#e8f3fb;border-color:#9fc3e2}' +
      '.edrms-menu svg{width:22px;height:22px;stroke:currentColor;stroke-width:2;stroke-linecap:round;fill:none}' +
      'html.edrms-side-closed #side{display:none!important}';
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
        '#side>*{flex-grow:0!important;transform:translateY(var(--edrms-stick,0px));will-change:transform}';
    }
    style.textContent = css;
  }

  // The menu (hamburger) button at the left of the report's header opens and
  // closes the report's sidebar. Added by this code rather than the report,
  // so it exists only inside SharePoint.
  private _addMenuButton(): void {
    const doc: Document | null = this._doc();
    if (!doc) return;
    const header: HTMLElement | null = doc.querySelector('header');
    let btn: HTMLButtonElement | null = doc.querySelector('.edrms-menu');
    if (!this._options.showSidebar) {
      if (btn) btn.remove();
      doc.documentElement.classList.remove('edrms-side-closed');
      return;
    }
    if (!header || btn) { this._syncMenu(); return; }
    btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'edrms-menu';
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    btn.addEventListener('click', () => {
      const closed: boolean = !doc.documentElement.classList.contains('edrms-side-closed');
      try { window.localStorage.setItem(SIDEBAR_KEY, closed ? '1' : '0'); } catch { /* storage blocked: this visit only */ }
      this._syncMenu(closed);
    });
    header.insertBefore(btn, header.firstChild);
    this._syncMenu();
  }

  private _syncMenu(closed?: boolean): void {
    const doc: Document | null = this._doc();
    if (!doc) return;
    if (closed === undefined) {
      try { closed = window.localStorage.getItem(SIDEBAR_KEY) === '1'; } catch { closed = false; }
    }
    doc.documentElement.classList.toggle('edrms-side-closed', closed);
    const btn: HTMLElement | null = doc.querySelector('.edrms-menu');
    if (btn) {
      btn.title = closed ? 'Show the menu' : 'Hide the menu';
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
    this._stickSidebar();
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
