import React, { useState } from 'react';
import { generateAndExportReport } from './api';
import { REPORT_TYPES, ReportTypeApiValue, ReportFormat } from './types';

const ReportGenerator: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState<ReportTypeApiValue>(REPORT_TYPES[0].value);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: ReportFormat) => {
    setIsExporting(true);
    setError(null);
    try {
      await generateAndExportReport(selectedReportType, format);
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="report-generator">
      <h1>Administrator Generate and Export Comprehensive Leave Reports</h1>
      <p className="description">
        This story covers the reporting capabilities for administrators to gain insights into leave data and facilitate data sharing.
      </p>

      <div className="controls-container">
        <div className="form-group">
          <label htmlFor="report-type-select">Generate reports such as (FR-021):</label>
          <select
            id="report-type-select"
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value as ReportTypeApiValue)}
            disabled={isExporting}
          >
            {REPORT_TYPES.map((report) => (
              <option key={report.value} value={report.value}>
                {report.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="export-buttons">
          <button onClick={() => handleExport('excel')} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export to Excel (FR-022)'}
          </button>
          <button onClick={() => handleExport('csv')} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export to CSV (FR-023)'}
          </button>
        </div>
      </div>

      {isExporting && <div className="status-message">Generating your report within 10 seconds... (NFR-010)</div>}
      {error && <div className="status-message error">{error}</div>}
    </div>
  );
};

export default ReportGenerator;
