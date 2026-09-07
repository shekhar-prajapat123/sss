const { handler } = require('../index');
const { Parser } = require('json2csv');
const XLSX = require('xlsx');

// Mock the external libraries to test error handling and to not rely on their internal implementation
jest.mock('json2csv');
jest.mock('xlsx');

describe('Leave Report API Handler', () => {
    let mockConsoleError;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Mock console.error to keep test output clean
        mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Provide mock implementations for the libraries
        const mockParser = {
            parse: jest.fn(data => {
                if (!Array.isArray(data) || data.length === 0) return '';
                const headers = Object.keys(data[0]).join(',');
                const rows = data.map(row => Object.values(row).join(','));
                return [headers, ...rows].join('\n');
            }),
        };
        Parser.mockImplementation(() => mockParser);

        XLSX.utils.json_to_sheet.mockReturnValue({ A1: { v: 'test' } }); // mock sheet
        XLSX.utils.book_new.mockReturnValue({ Sheets: {}, SheetNames: [] });
        XLSX.utils.book_append_sheet.mockImplementation((wb, ws, name) => {
            wb.Sheets[name] = ws;
            wb.SheetNames.push(name);
        });
        XLSX.write.mockReturnValue('mocked_base64_excel_data');
    });

    afterEach(() => {
        mockConsoleError.mockRestore();
    });

    describe('Happy Path', () => {
        it('should generate a department report in CSV format', async () => {
            const event = {
                httpMethod: 'GET',
                path: '/reports',
                queryStringParameters: {
                    type: 'department',
                    format: 'csv'
                }
            };

            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(response.headers['Content-Type']).toBe('text/csv');
            expect(response.headers['Content-Disposition']).toBe('attachment; filename="report-department.csv"');
            expect(response.body).toContain('department,totalLeaves');
            expect(response.body).toContain('Engineering,3');
            expect(response.body).toContain('HR,1');
        });

        it('should generate a monthly report in CSV format (case-insensitive)', async () => {
            const event = {
                httpMethod: 'GET',
                path: '/reports',
                queryStringParameters: {
                    type: 'MONTHLY',
                    format: 'CSV'
                }
            };

            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(response.headers['Content-Type']).toBe('text/csv');
            expect(response.headers['Content-Disposition']).toBe('attachment; filename="report-MONTHLY.csv"');
            expect(response.body).toContain('month,totalLeaves');
            expect(response.body).toContain('2023-10,1');
            expect(response.body).toContain('2023-11,3');
        });

        it('should generate an employee report in Excel format', async () => {
            const event = {
                httpMethod: 'GET',
                path: '/reports',
                queryStringParameters: {
                    type: 'employee',
                    format: 'excel'
                }
            };

            const response = await handler(event);

            expect(response.statusCode).toBe(200);
            expect(response.headers['Content-Type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            expect(response.headers['Content-Disposition']).toBe('attachment; filename="report-employee.xlsx"');
            expect(response.isBase64Encoded).toBe(true);
            expect(response.body).toBe('mocked_base64_excel_data');
            expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ employeeId: 'E101', totalLeaves: 2 }),
                expect.objectContaining({ employeeId: 'E102', totalLeaves: 1 }),
                expect.objectContaining({ employeeId: 'E201', totalLeaves: 1 })
            ]));
        });
    });

    describe('Error and Edge Cases', () => {
        it('should return 400 if query parameters are missing', async () => {
            const event = {
                httpMethod: 'GET',
                path: '/reports',
                queryStringParameters: {}
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(400);
            expect(body.message).toBe('Query parameters "type" and "format" are required.');
        });

        it('should return 400 if "type" query parameter is missing', async () => {
            const event = {
                httpMethod: 'GET',
                path: '/reports',
                queryStringParameters: { format: 'csv' }
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(400);
            expect(body.message).toBe('Query parameters "type" and "format" are required.');
        });

        it('should return 400 for an invalid report type', async () => {
            const invalidType = 'summary';
            const event = {
                httpMethod: 'GET',
                path: '/reports',
                queryStringParameters: {
                    type: invalidType,
                    format: 'csv'
                }
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(400);
            expect(body.message).toBe(`Invalid report type: '${invalidType}'. Valid types are department, monthly, employee.`);
        });

        it('should return 400 for an invalid format', async () => {
            const invalidFormat = 'pdf';
            const event = {
                httpMethod: 'GET',
                path: '/reports',
                queryStringParameters: {
                    type: 'department',
                    format: invalidFormat
                }
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(400);
            expect(body.message).toBe(`Invalid format: '${invalidFormat}'. Valid formats are csv, excel.`);
        });

        it('should return 404 for a non-existent path', async () => {
            const event = {
                httpMethod: 'GET',
                path: '/not-found',
                queryStringParameters: {}
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(404);
            expect(body.message).toBe('Not Found');
        });

        it('should return 404 for a wrong http method', async () => {
            const event = {
                httpMethod: 'POST',
                path: '/reports',
                queryStringParameters: {}
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(404);
            expect(body.message).toBe('Not Found');
        });

        it('should return 500 if CSV generation fails', async () => {
            // Override mock for this specific test
            const mockError = new Error('CSV generation failed');
            const mockParser = { parse: jest.fn().mockImplementation(() => { throw mockError; }) };
            Parser.mockImplementation(() => mockParser);

            const event = {
                httpMethod: 'GET',
                path: '/reports',
                queryStringParameters: {
                    type: 'department',
                    format: 'csv'
                }
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(500);
            expect(body.message).toBe('An internal error occurred while generating the report.');
            expect(console.error).toHaveBeenCalledWith('Failed to generate report file:', mockError);
        });

        it('should return 500 if Excel generation fails', async () => {
            // Override mock for this specific test
            const mockError = new Error('Excel generation failed');
            XLSX.write.mockImplementation(() => { throw mockError; });

            const event = {
                httpMethod: 'GET',
                path: '/reports',
                queryStringParameters: {
                    type: 'department',
                    format: 'excel'
                }
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(500);
            expect(body.message).toBe('An internal error occurred while generating the report.');
            expect(console.error).toHaveBeenCalledWith('Failed to generate report file:', mockError);
        });
    });
});
