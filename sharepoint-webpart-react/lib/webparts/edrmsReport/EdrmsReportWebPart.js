import { __extends } from "tslib";
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { PropertyPaneDropdown, PropertyPaneToggle } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPPermission } from '@microsoft/sp-page-context';
import { createManualStore } from './lib/manualStore';
import * as strings from 'EdrmsReportWebPartStrings';
import { ReportApp } from './components/ReportApp';
var EdrmsReportWebPart = /** @class */ (function (_super) {
    __extends(EdrmsReportWebPart, _super);
    function EdrmsReportWebPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EdrmsReportWebPart.prototype.render = function () {
        var web = this.context.pageContext.web;
        if (!this._store)
            this._store = createManualStore(this.context.spHttpClient, web.absoluteUrl, web.serverRelativeUrl);
        // Import data is offered only to people who can manage this site: Owners
        // (Full Control) and site collection admins. Members and Visitors never see it,
        // and the data library refuses their writes anyway (lib/manualStore.ts).
        var canImport = !!web.permissions && web.permissions.hasPermission(SPPermission.manageWeb);
        var isAdmin = !!this.context.pageContext.legacyPageContext && !!this.context.pageContext.legacyPageContext.isSiteAdmin;
        var element = React.createElement(ReportApp, {
            dashboard: this.properties.dashboard || 'bw',
            showSidebar: this.properties.showSidebar !== false,
            textSize: this.properties.textSize || 'large',
            store: this._store,
            canImport: canImport,
            userName: this.context.pageContext.user.displayName,
            roleLabel: isAdmin ? 'Site collection admin' : 'Site owner (Full control)'
        });
        ReactDom.render(element, this.domElement);
    };
    EdrmsReportWebPart.prototype.onDispose = function () {
        ReactDom.unmountComponentAtNode(this.domElement);
    };
    Object.defineProperty(EdrmsReportWebPart.prototype, "dataVersion", {
        get: function () {
            return Version.parse('1.0');
        },
        enumerable: false,
        configurable: true
    });
    EdrmsReportWebPart.prototype.getPropertyPaneConfiguration = function () {
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
    };
    return EdrmsReportWebPart;
}(BaseClientSideWebPart));
export default EdrmsReportWebPart;
//# sourceMappingURL=EdrmsReportWebPart.js.map