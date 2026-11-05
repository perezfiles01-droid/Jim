import * as React from 'react';
import { IManualStore } from '../lib/manualStore';
export type Dashboard = 'bw' | 'dp';
export type TextSize = 'standard' | 'large' | 'xlarge';
export interface IReportAppProps {
    dashboard: Dashboard;
    showSidebar: boolean;
    textSize: TextSize;
    /** Where imported manual data is read from and saved to. */
    store?: IManualStore;
    /** True only for people who can manage the site (Owners, site collection admins). */
    canImport?: boolean;
    userName?: string;
    roleLabel?: string;
}
export declare const ReportApp: React.FC<IReportAppProps>;
//# sourceMappingURL=ReportApp.d.ts.map