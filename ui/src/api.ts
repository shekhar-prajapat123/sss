import { ReportTypeApiValue, ReportFormat } from './types';

/**
 * Simulates calling the API `GET /reports?type={reportType}&format={format}`
 * and triggers a file download with the response.
 * In a real application, this would use `fetch` to make a network request to the relative API endpoint.
 * The simulation includes a delay to demonstrate the NFR-010 requirement.
 * 
 * @param type - The type of the report to generate.
 * @param format - The desired file format for the report.
 */
export const generateAndExportReport = async (
  type: ReportTypeApiValue,
  format: ReportFormat
): Promise<void> => {
  console.log(`Requesting report generation: type=${type}, format=${format}`)

  // Simulate network latency (NFR-010: reports generated within 10s)
  await new Promise(resolve => setTimeout(resolve, 750));

  // Simulate a successful API response containing a file blob
  const isExcel = format === 'excel';
  const mimeType = isExcel 
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    : 'text/csv;charset=utf-8;';
  const fileExtension = isExcel ? 'xlsx' : 'csv';
  const fileName = `${type}-report.${fileExtension}`;

  // Create dummy file content based on format
  const csvContent = 'Employee ID,Employee Name,Leave Type,Start Date,End Date\n101,John Doe,Annual,2023-10-01,2023-10-05\n102,Jane Smith,Sick,2023-10-03,2023-10-03';
  const excelContent = 'This is a placeholder for a binary Excel file.';
  const content = format === 'csv' ? csvContent : excelContent;

  const blob = new Blob([content], { type: mimeType });

  // Create a temporary link element and trigger the download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  // Clean up the temporary link and object URL
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
