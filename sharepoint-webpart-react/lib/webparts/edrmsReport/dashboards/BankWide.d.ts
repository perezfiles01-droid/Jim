import * as React from 'react';
import { IReportData } from '../lib/data';
export interface IDashboardProps {
    data: IReportData;
    /** Opens Department Insights for one department. */
    openDept: (code: string) => void;
    /** The "Data as of" and Export to PDF controls for the title band. */
    bandTools: React.ReactNode;
}
export declare const BankWide: React.FC<IDashboardProps>;
//# sourceMappingURL=BankWide.d.ts.map