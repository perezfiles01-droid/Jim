import * as React from 'react';
export type Dashboard = 'bw' | 'dp';
export type TextSize = 'standard' | 'large' | 'xlarge';
export interface IReportAppProps {
    dashboard: Dashboard;
    showSidebar: boolean;
    textSize: TextSize;
}
export declare const ReportApp: React.FC<IReportAppProps>;
//# sourceMappingURL=ReportApp.d.ts.map