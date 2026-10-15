import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'EdrmsReportWebPartStrings';
import { ReportApp, IReportAppProps, Dashboard, TextSize } from './components/ReportApp';

export interface IEdrmsReportWebPartProps {
  dashboard: Dashboard;
  showSidebar: boolean;
  textSize: TextSize;
}

export default class EdrmsReportWebPart extends BaseClientSideWebPart<IEdrmsReportWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IReportAppProps> = React.createElement(ReportApp, {
      dashboard: this.properties.dashboard || 'bw',
      showSidebar: this.properties.showSidebar !== false,
      textSize: this.properties.textSize || 'large'
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        header: { description: strings.PropertyPaneDescription },
        groups: [{
          groupName: strings.SettingsGroupName,
          groupFields: [
            PropertyPaneDropdown('dashboard', {
              label: strings.DashboardLabel,
              options: [
                { key: 'bw', text: 'Bank-wide Oversight' },
                { key: 'dp', text: 'Department Insights' }
              ]
            }),
            PropertyPaneToggle('showSidebar', { label: strings.SidebarLabel, onText: 'Shown', offText: 'Hidden' }),
            PropertyPaneDropdown('textSize', {
              label: strings.TextSizeLabel,
              options: [
                { key: 'standard', text: 'Standard (as designed)' },
                { key: 'large', text: 'Large (25% larger)' },
                { key: 'xlarge', text: 'Extra large (50% larger)' }
              ]
            })
          ]
        }]
      }]
    };
  }
}
