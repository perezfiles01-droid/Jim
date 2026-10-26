import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { Dashboard, TextSize } from './components/ReportApp';
export interface IEdrmsReportWebPartProps {
    dashboard: Dashboard;
    showSidebar: boolean;
    textSize: TextSize;
}
export default class EdrmsReportWebPart extends BaseClientSideWebPart<IEdrmsReportWebPartProps> {
    render(): void;
    protected onDispose(): void;
    protected get dataVersion(): Version;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
//# sourceMappingURL=EdrmsReportWebPart.d.ts.map