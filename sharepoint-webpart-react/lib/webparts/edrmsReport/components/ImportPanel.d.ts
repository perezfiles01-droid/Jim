import * as React from 'react';
import { IManualData } from '../lib/importRules';
import { IManualStore } from '../lib/manualStore';
export interface IImportPanelProps {
    store: IManualStore;
    user: string;
    role: string;
    current: IManualData | null;
    knownUnits: string[];
    onClose: () => void;
    onLoaded: (d: IManualData) => void;
}
export declare const ImportPanel: React.FC<IImportPanelProps>;
//# sourceMappingURL=ImportPanel.d.ts.map