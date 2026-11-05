import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPPermission } from '@microsoft/sp-page-context';
import { createManualStore, IManualStore } from './lib/manualStore';
import * as strings from 'EdrmsReportWebPartStrings';
import { ReportApp, IReportAppProps, Dashboard, TextSize } from './components/ReportApp';

export interface IEdrmsReportWebPartProps {
  dashboard: Dashboard;
  showSidebar: boolean;
  textSize: TextSize;
}

export default class EdrmsReportWebPart extends BaseClientSideWebPart<IEdrmsReportWebPartProps> {
  private _store: IManualStore | undefined;

  public render(): void {
    const web = this.context.pageContext.web;
    if (!this._store) this._store = createManualStore(this.context.spHttpClient, web.absoluteUrl, web.serverRelativeUrl);
    // Import data is offered only to people who can manage this site: Owners
    // (Full Control) and site collection admins. Members and Visitors never see it,
    // and the data library refuses their writes anyway (lib/manualStore.ts).
    const canImport = !!web.permissions && web.permissions.hasPermission(SPPermission.manageWeb);
    const isAdmin = !!this.context.pageContext.legacyPageContext && !!this.context.pageContext.legacyPageContext.isSiteAdmin;
    const element: React.ReactElement<IReportAppProps> = React.createElement(ReportApp, {
      dashboard: this.properties.dashboard || 'bw',
      showSidebar: this.properties.showSidebar !== false,
      textSize: this.properties.textSize || 'large',
      store: this._store,
      canImport,
      userName: this.context.pageContext.user.displayName,
      roleLabel: isAdmin ? 'Site collection admin' : 'Site owner (Full control)'
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
