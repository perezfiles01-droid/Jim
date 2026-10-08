import { DisplayMode, Version } from '@microsoft/sp-core-library';
import { SPPermission } from '@microsoft/sp-page-context';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneChoiceGroup,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import styles from './EdrmsUtilizationReportWebPart.module.scss';
import * as strings from 'EdrmsUtilizationReportWebPartStrings';
import { REPORT_HTML, REPORT_SCRIPTS } from './reportTemplate';
import { ReportHost, type Dashboard, type IReportOptions, type Sizing, type TextSize } from './ReportHost';

export interface IEdrmsUtilizationReportWebPartProps {
  // Which dashboard this page shows. One SharePoint page per dashboard, so
  // the site's own navigation moves between them.
  dashboard?: Dashboard;
  // The report's own dark sidebar, with a menu button that opens and closes
  // it. On by default (1.0.4 had it off, which readers missed).
  showSidebar?: boolean;
  // 'large' by default: readers include people who need bigger text.
  textSize?: TextSize;
  // The BPMSD site's blue for the report's sidebar and the site header. On
  // unless switched off.
  adbBlue?: boolean;
  // 'content' (default): the report is as tall as it is and scrolls with the
  // page. 'window': fills the window and scrolls inside. 'fixed': height below.
  sizing?: Sizing;
  height: number;
  // From 1.0.3; read only to keep a page saved then on its chosen height.
  fitWindow?: boolean;
}

// Shown in the on-page error note, so a screenshot says which build it was.
const VERSION: string = '1.0.28';

// Hide SharePoint's site bar and page command bar (1.0.16 to 1.0.18). Off.
const HIDE_CHROME: boolean = false;

export default class EdrmsUtilizationReportWebPart extends BaseClientSideWebPart<IEdrmsUtilizationReportWebPartProps> {

  private _host: ReportHost | undefined;

  private _options(): IReportOptions {
    const p: IEdrmsUtilizationReportWebPartProps = this.properties;
    return {
      dashboard: p.dashboard === 'dp' ? 'dp' : 'bw',
      showSidebar: p.showSidebar !== false,
      textSize: p.textSize || 'large',
      adbBlue: p.adbBlue !== false,
      sizing: p.sizing || (p.fitWindow === false ? 'fixed' : 'content'),
      height: p.height || 900
    };
  }

  public render(): void {
    if (!this._host) {
      // SharePoint may give this folder with or without a trailing slash (the
      // test tenant gives it without, which made 1.0.0 and 1.0.1 ask for
      // ".../<solution id>edrms-script01.js" and get 404 for every file).
      const rawBase: string = this.context.manifest.loaderConfig.internalModuleBaseUrls[0];
      const base: string = rawBase.endsWith('/') ? rawBase : rawBase + '/';
      this._host = new ReportHost(this.domElement, base, REPORT_HTML, REPORT_SCRIPTS, this._options(),
        VERSION, styles.edrmsUtilizationReport, styles.frame, strings.FrameTitle);
    } else {
      this._host.update(this._options());
    }
    this._chrome();
  }

  protected onDisplayModeChanged(oldDisplayMode: DisplayMode): void {
    this._chrome();
  }

  // 1.0.16: SharePoint's site bar (site name and its menu) and page command
  // bar (New, Page details, Preview, Analytics, Edit) are hidden while the
  // page is read, so the report starts at the top. People who can edit the
  // page get a small Edit page button instead; in edit mode both bars come
  // back so the page can be saved and published.
  private _chrome(): void {
    const id: string = 'edrms-hide-chrome';
    const btnId: string = 'edrms-edit-page';
    let style: HTMLStyleElement | null = document.getElementById(id) as HTMLStyleElement | null;
    let btn: HTMLAnchorElement | null = document.getElementById(btnId) as HTMLAnchorElement | null;
    // 1.0.19: the requester chose to keep SharePoint's bars showing, so the
    // page does not jump from SharePoint's frame to the report on load. Both
    // stay, and SharePoint's own Edit button is used; nothing is hidden.
    if (HIDE_CHROME === false || this.displayMode === DisplayMode.Edit) {
      if (style) style.remove();
      if (btn) btn.remove();
      return;
    }
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      style.textContent =
        '#spSiteHeader,[data-automationid="SiteHeader"],[data-automation-id="SiteHeader"],' +
        '#spCommandBar,[data-automation-id="pageCommandBar"],[data-automationid="pageCommandBar"],' +
        'div[class^="commandBarWrapper"],div[class*=" commandBarWrapper"]{display:none!important}' +
        '#' + btnId + '{position:fixed;right:20px;bottom:20px;z-index:1000;display:inline-flex;align-items:center;gap:6px;' +
        'padding:8px 14px;border-radius:8px;background:#194F8E;color:#fff!important;font:600 14px/1.2 "Segoe UI",Arial,sans-serif;' +
        'text-decoration:none!important;box-shadow:0 2px 8px rgba(0,0,0,.25);opacity:.85}' +
        '#' + btnId + ':hover{opacity:1}';
      document.head.appendChild(style);
    }
    let canEdit: boolean = false;
    try {
      canEdit = this.context.pageContext.web.permissions.hasPermission(SPPermission.addAndCustomizePages) ||
        this.context.pageContext.web.permissions.hasPermission(SPPermission.editListItems);
    } catch { canEdit = false; }
    if (canEdit && !btn) {
      btn = document.createElement('a');
      btn.id = btnId;
      const url: URL = new URL(window.location.href);
      url.searchParams.set('Mode', 'Edit');
      btn.href = url.toString();
      btn.textContent = '\u270E Edit page';
      // 1.0.17: SharePoint's page router swallows a plain link to the same
      // page (1.0.16's button did nothing). Press SharePoint's own Edit
      // button, which still works while hidden; failing that, load the page
      // in edit mode directly, which the router cannot intercept.
      btn.addEventListener('click', (ev: MouseEvent): void => {
        ev.preventDefault();
        ev.stopPropagation();
        const native: HTMLElement | null = document.querySelector(
          '[data-automation-id="pageCommandBarEditButton"],[data-automationid="pageCommandBarEditButton"],' +
          '#spCommandBar button[name="Edit"],#spCommandBar button[aria-label="Edit"],' +
          'div[class*="commandBarWrapper"] button[name="Edit"],div[class*="commandBarWrapper"] button[aria-label="Edit"]');
        if (native) { native.click(); return; }
        window.location.assign(url.toString());
      }, true);
      document.body.appendChild(btn);
    }
  }

  protected onDispose(): void {
    const style: HTMLElement | null = document.getElementById('edrms-hide-chrome');
    if (style) style.remove();
    const btn: HTMLElement | null = document.getElementById('edrms-edit-page');
    if (btn) btn.remove();
    if (this._host) this._host.dispose();
    super.onDispose();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const o: IReportOptions = this._options();
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.ContentGroupName,
              groupFields: [
                PropertyPaneDropdown('dashboard', {
                  label: strings.DashboardLabel,
                  options: [
                    { key: 'bw', text: strings.DashboardBankWide },
                    { key: 'dp', text: strings.DashboardDepartment }
                  ],
                  selectedKey: o.dashboard
                }),
                PropertyPaneToggle('adbBlue', {
                  label: strings.AdbBlueLabel,
                  onText: strings.AdbBlueOn,
                  offText: strings.AdbBlueOff,
                  checked: o.adbBlue
                }),
                PropertyPaneToggle('showSidebar', {
                  label: strings.ShowSidebarLabel,
                  onText: strings.ShowSidebarOn,
                  offText: strings.ShowSidebarOff,
                  checked: o.showSidebar
                })
              ]
            },
            {
              groupName: strings.LayoutGroupName,
              groupFields: [
                PropertyPaneChoiceGroup('textSize', {
                  label: strings.TextSizeLabel,
                  options: [
                    { key: 'standard', text: strings.TextSizeStandard, checked: o.textSize === 'standard' },
                    { key: 'large', text: strings.TextSizeLarge, checked: o.textSize === 'large' },
                    { key: 'xlarge', text: strings.TextSizeXLarge, checked: o.textSize === 'xlarge' }
                  ]
                }),
                PropertyPaneChoiceGroup('sizing', {
                  label: strings.SizingLabel,
                  options: [
                    { key: 'content', text: strings.SizingContent, checked: o.sizing === 'content' },
                    { key: 'window', text: strings.SizingWindow, checked: o.sizing === 'window' },
                    { key: 'fixed', text: strings.SizingFixed, checked: o.sizing === 'fixed' }
                  ]
                }),
                PropertyPaneSlider('height', {
                  label: strings.HeightFieldLabel,
                  disabled: o.sizing !== 'fixed',
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
