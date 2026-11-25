import * as React from 'react';
import * as ReactDom from 'react-dom';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import EdrmsUtilizationReport from 'APP/webparts/edrmsUtilizationReport/components/EdrmsUtilizationReport';
import { MockReportService } from 'APP/webparts/edrmsUtilizationReport/services/MockReportService';
import { DEFAULT_OPTIONS } from 'APP/webparts/edrmsUtilizationReport/models/ReportTypes';
initializeIcons();
const ctx = { pageContext: { user: { displayName: 'Test User', email: 't@x' }, web: { absoluteUrl: 'https://x', serverRelativeUrl: '/' } } };
ReactDom.render(React.createElement(EdrmsUtilizationReport, { context: ctx, options: { ...DEFAULT_OPTIONS, canImport: true }, service: {}, reportService: new MockReportService() }), document.getElementById('r'));
