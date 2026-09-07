export type ReportTypeValue = 'Department Leave Report' | 'Monthly Leave Report' | 'Employee Leave Report';

export type ReportTypeApiValue = 'department-leave' | 'monthly-leave' | 'employee-leave';

export type ReportFormat = 'excel' | 'csv';

export const REPORT_TYPES: readonly { label: ReportTypeValue; value: ReportTypeApiValue }[] = [
    { label: 'Department Leave Report', value: 'department-leave' },
    { label: 'Monthly Leave Report', value: 'monthly-leave' },
    { label: 'Employee Leave Report', value: 'employee-leave' },
];
