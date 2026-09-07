/**
 * Generic API error structure for client-side consumption.
 */
export interface IApiError {
  statusCode: number;
  message: string;
  error?: string; // e.g., 'Bad Request', 'Unauthorized'
  details?: Record<string, any>; // For validation errors
}

/**
 * Defines the types of reports that can be generated.
 * Corresponds to FR-021.
 */
export enum ReportType {
  DEPARTMENT_LEAVE = 'DEPARTMENT_LEAVE',
  MONTHLY_LEAVE = 'MONTHLY_LEAVE',
  EMPLOYEE_LEAVE = 'EMPLOYEE_LEAVE',
}

/**
 * Defines the available export formats for the reports.
 * Corresponds to FR-022 and FR-023.
 */
export enum ExportFormat {
  EXCEL = 'EXCEL',
  CSV = 'CSV',
}

/**
 * Represents the query parameters for the report generation API endpoint.
 * GET /reports?type={reportType}&format={format}...
 */
export interface IReportGenerationRequestParams {
  /**
   * The type of report to generate.
   */
  type: ReportType;

  /**
   * The desired file format for the export.
   */
  format: ExportFormat;

  /**
   * The ID of the employee. Required when type is 'EMPLOYEE_LEAVE'.
   */
  employeeId?: string;

  /**
   * The ID of the department. Required when type is 'DEPARTMENT_LEAVE'.
   */
  departmentId?: string;

  /**
   * The month for the report (1-12). Required when type is 'MONTHLY_LEAVE'.
   */
  month?: number;

  /**
   * The year for the report. Required when type is 'MONTHLY_LEAVE'.
   */
  year?: number;
}
