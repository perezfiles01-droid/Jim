import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneSlider
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import styles from './EdrmsUtilizationReportWebPart.module.scss';
import * as strings from 'EdrmsUtilizationReportWebPartStrings';
import { REPORT_HTML } from './reportTemplate';

export interface IEdrmsUtilizationReportWebPartProps {
  height: number;
}

// The report is laid out on a fixed 1920px canvas, the approved monitor view,
// and scaled to the width of the web part, exactly as the Floot app does it.
// A laptop and a monitor show the same layout, only larger or smaller.
const DESIGN_WIDTH: number = 1920;

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
      const base: string = this.context.manifest.loaderConfig.internalModuleBaseUrls[0];
      const html: string = REPORT_HTML.split('__EDRMS_BASE__').join(base);

      this.domElement.innerHTML = '';
      const box: HTMLDivElement = document.createElement('div');
      box.className = styles.edrmsUtilizationReport;
      const frame: HTMLIFrameElement = document.createElement('iframe');
      frame.className = styles.frame;
      frame.title = strings.FrameTitle;
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
