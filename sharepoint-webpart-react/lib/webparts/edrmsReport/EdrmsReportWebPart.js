import { __extends } from "tslib";
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { PropertyPaneDropdown, PropertyPaneToggle } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'EdrmsReportWebPartStrings';
import { ReportApp } from './components/ReportApp';
var EdrmsReportWebPart = /** @class */ (function (_super) {
    __extends(EdrmsReportWebPart, _super);
    function EdrmsReportWebPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EdrmsReportWebPart.prototype.render = function () {
        var element = React.createElement(ReportApp, {
            dashboard: this.properties.dashboard || 'bw',
            showSidebar: this.properties.showSidebar !== false,
            textSize: this.properties.textSize || 'large'
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