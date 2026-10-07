// Shows the EDRMS report inside a container element. Kept free of SharePoint
// imports so the same code the web part runs can be tested in a plain browser
// page (see test/host-test.js).

export type Dashboard = 'bw' | 'dp';
export type Sizing = 'content' | 'window' | 'fixed';

export interface IReportOptions {
  dashboard: Dashboard;
  showSidebar: boolean;
  sizing: Sizing;
  height: number;
}

// The report is laid out on a fixed 1920px canvas, the approved monitor view,
// and scaled to the width it is given, exactly as the Floot app does it.
const DESIGN_WIDTH: number = 1920;

export class ReportHost {
  private readonly _box: HTMLDivElement;
  private readonly _frame: HTMLIFrameElement;
  private _options: IReportOptions;
  private _observer: ResizeObserver | undefined;
  private _innerObserver: ResizeObserver | undefined;
  private _shown: Dashboard | undefined;
  private readonly _onResize = (): void => { this.fit(); };

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
    this.fit();
  }

  public update(options: IReportOptions): void {
    this._options = options;
    this._applyStyle();
    this._showDashboard();
    this.fit();
  }

  public dispose(): void {
    if (this._observer) this._observer.disconnect();
    if (this._innerObserver) this._innerObserver.disconnect();
    window.removeEventListener('resize', this._onResize);
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
      if (doc.querySelector('#view .kpi')) { window.clearInterval(wait); this._showDashboard(); this.fit(); return; }
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
    let css: string = '';
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
        'header{position:relative!important}';
    }
    style.textContent = css;
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

  public fit(): void {
    // Always exactly the width SharePoint gives the web part. (The Floot app
    // also enlarges the report with browser zoom; inside SharePoint the page
    // already narrows the web part when zooming, so doing both made the
    // report overflow to the right in 1.0.3.)
    const width: number = this._container.clientWidth || DESIGN_WIDTH;
    const scale: number = width / DESIGN_WIDTH;
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
    this._frame.style.width = DESIGN_WIDTH + 'px';
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
