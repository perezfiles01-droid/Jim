import { Version } from '@microsoft/sp-core-library';
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
const VERSION: string = '1.0.13';

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
  }

  protected onDispose(): void {
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
