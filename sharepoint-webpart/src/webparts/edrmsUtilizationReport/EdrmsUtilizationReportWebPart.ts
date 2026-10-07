import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneSlider
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import styles from './EdrmsUtilizationReportWebPart.module.scss';
import * as strings from 'EdrmsUtilizationReportWebPartStrings';
import { REPORT_HTML, REPORT_SCRIPTS } from './reportTemplate';

export interface IEdrmsUtilizationReportWebPartProps {
  height: number;
}

// The report is laid out on a fixed 1920px canvas, the approved monitor view,
// and scaled to the width of the web part, exactly as the Floot app does it.
// A laptop and a monitor show the same layout, only larger or smaller.
const DESIGN_WIDTH: number = 1920;
// Shown in the on-page error note, so a screenshot says which build it was.
const VERSION: string = '1.0.2';

export default class EdrmsUtilizationReportWebPart extends BaseClientSideWebPart<IEdrmsUtilizationReportWebPartProps> {

  private _frame: HTMLIFrameElement | undefined;
  private _box: HTMLDivElement | undefined;
  private _observer: ResizeObserver | undefined;
  // The screen's scaling when the page opens counts as 100%, so browser zoom
  // after that enlarges or shrinks the report like any page (as in Floot).
  private readonly _baseDpr: number = window.devicePixelRatio || 1;

  public render(): void {
    if (!this._frame) {
      // The report's scripts are packaged with this web part as separate
      // files (see build-report.js), so SharePoint's Content Security Policy
      // allows them. Point the page at where SharePoint serves them from.
      // SharePoint may give this folder with or without a trailing slash (the
      // test tenant gives it without, which made 1.0.0 and 1.0.1 ask for
      // ".../<solution id>edrms-script01.js" and get 404 for every file).
      const rawBase: string = this.context.manifest.loaderConfig.internalModuleBaseUrls[0];
      const base: string = rawBase.endsWith('/') ? rawBase : rawBase + '/';
      const html: string = REPORT_HTML.split('__EDRMS_BASE__').join(base);

      this.domElement.innerHTML = '';
      const box: HTMLDivElement = document.createElement('div');
      box.className = styles.edrmsUtilizationReport;
      const frame: HTMLIFrameElement = document.createElement('iframe');
      frame.className = styles.frame;
      frame.title = strings.FrameTitle;
      // SharePoint's policy carries 'strict-dynamic': a <script src> in the
      // markup is refused, but a script element added by this (trusted) code
      // runs. So the page arrives without scripts and they are added here,
      // in page order, once its markup has loaded. async=false keeps them
      // executing in the order they are appended.
      //
      // This runs on EVERY load, not just the first: SharePoint moves web
      // parts around the page while it lays it out, and moving an iframe
      // reloads it, which brings back a fresh copy of the markup without
      // scripts. Version 1.0.1 only loaded them once and showed an empty
      // report for exactly that reason. A marker on each copy stops a copy
      // getting them twice.
      frame.addEventListener('load', () => this._loadScripts(frame, base));
      frame.srcdoc = html;
      box.appendChild(frame);
      this.domElement.appendChild(box);
      this._box = box;
      this._frame = frame;

      if (typeof ResizeObserver !== 'undefined') {
        this._observer = new ResizeObserver(() => this._fit());
        this._observer.observe(this.domElement);
      }
      window.addEventListener('resize', this._onResize);
    }
    this._fit();
  }

  private readonly _onResize = (): void => { this._fit(); };

  private _loadScripts(frame: HTMLIFrameElement, base: string): void {
    const doc: Document | null = frame.contentDocument;
    if (!doc || !doc.body || !doc.getElementById('view')) return;
    const root: HTMLElement = doc.documentElement;
    if (root.getAttribute('data-edrms-loaded') === '1') return;
    root.setAttribute('data-edrms-loaded', '1');

    const problems: string[] = [];
    doc.addEventListener('securitypolicyviolation', (e: SecurityPolicyViolationEvent) => {
      problems.push('Blocked by the security policy (' + e.violatedDirective + '): ' + (e.blockedURI || 'inline code'));
    });
    REPORT_SCRIPTS.forEach((file: string) => {
      const s: HTMLScriptElement = doc.createElement('script');
      s.src = base + file;
      s.async = false;
      s.onerror = () => { problems.push('Could not load ' + base + file); };
      doc.body.appendChild(s);
    });

    // If the dashboards have not drawn after a while, say why on the page
    // itself, so a failure can be read without the browser's developer tools.
    window.setTimeout(() => {
      if (frame.contentDocument !== doc || doc.querySelector('#view .kpi')) return;
      const note: HTMLDivElement = doc.createElement('div');
      note.setAttribute('role', 'alert');
      note.style.cssText = 'position:fixed;left:24px;right:24px;bottom:24px;z-index:99999;padding:16px 18px;' +
        'background:#fff4f4;border:2px solid #c62828;border-radius:10px;font:15px/1.5 Segoe UI,Arial,sans-serif;color:#5b1111';
      const lines: string[] = problems.length ? problems.slice(0, 8) : ['No error was reported, but the dashboards did not draw.'];
      note.textContent = 'EDRMS web part ' + VERSION + ': the report did not start. ' + lines.join(' | ') + ' | Assets: ' + base;
      doc.body.appendChild(note);
    }, 8000);
  }

  private _fit(): void {
    if (!this._frame || !this._box) return;
    const width: number = this.domElement.clientWidth || DESIGN_WIDTH;
    const zoom: number = (window.devicePixelRatio || 1) / this._baseDpr;
    const scale: number = (width * zoom) / DESIGN_WIDTH;
    const height: number = Math.max(400, this.properties.height || 900);
    this._box.style.height = height + 'px';
    this._box.style.overflowX = scale * DESIGN_WIDTH > width + 1 ? 'auto' : 'hidden';
    this._frame.style.width = DESIGN_WIDTH + 'px';
    this._frame.style.height = (height / scale) + 'px';
    this._frame.style.transform = 'scale(' + scale + ')';
  }

  protected onDispose(): void {
    if (this._observer) this._observer.disconnect();
    window.removeEventListener('resize', this._onResize);
    super.onDispose();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.LayoutGroupName,
              groupFields: [
                PropertyPaneSlider('height', {
                  label: strings.HeightFieldLabel,
                  min: 500,
                  max: 2400,
                  step: 50,
                  showValue: true
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
