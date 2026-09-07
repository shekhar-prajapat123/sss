const { Parser } = require('json2csv');
const XLSX = require('xlsx');

// In-memory data store for leave records
const leaveRecords = [
    {
        id: 1,
        employeeId: 'E101',
        employeeName: 'Alice Johnson',
        department: 'Engineering',
        startDate: '2023-10-05',
        endDate: '2023-10-07',
        leaveType: 'Annual',
        status: 'Approved'
    },
    {
        id: 2,
        employeeId: 'E102',
        employeeName: 'Bob Williams',
        department: 'Engineering',
        startDate: '2023-11-15',
        endDate: '2023-11-15',
        leaveType: 'Sick',
        status: 'Approved'
    },
    {
        id: 3,
        employeeId: 'E201',
        employeeName: 'Charlie Brown',
        department: 'HR',
        startDate: '2023-11-20',
        endDate: '2023-11-22',
        leaveType: 'Annual',
        status: 'Approved'
    },
    {
        id: 4,
        employeeId: 'E101',
        employeeName: 'Alice Johnson',
        department: 'Engineering',
        startDate: '2023-11-28',
        endDate: '2023-11-28',
        leaveType: 'Personal',
        status: 'Pending'
    }
];

/**
 * Generates a summary report grouped by department.
 */
const getDepartmentReport = () => {
    const summary = leaveRecords.reduce((acc, leave) => {
        acc[leave.department] = (acc[leave.department] || 0) + 1;
        return acc;
    }, {});
    return Object.keys(summary).map(department => ({
        department,
        totalLeaves: summary[department]
    }));
};

/**
 * Generates a summary report grouped by month.
 */
const getMonthlyReport = () => {
    const summary = leaveRecords.reduce((acc, leave) => {
        const month = leave.startDate.substring(0, 7); // Format YYYY-MM
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {});
    return Object.keys(summary).map(month => ({
        month,
        totalLeaves: summary[month]
    })).sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * Generates a summary report grouped by employee.
 */
const getEmployeeReport = () => {
    const summary = leaveRecords.reduce((acc, leave) => {
        if (!acc[leave.employeeId]) {
            acc[leave.employeeId] = {
                employeeId: leave.employeeId,
                employeeName: leave.employeeName,
                department: leave.department,
                totalLeaves: 0
            };
        }
        acc[leave.employeeId].totalLeaves += 1;
        return acc;
    }, {});
    return Object.values(summary);
};


exports.handler = async (event) => {
    if (event.httpMethod === 'GET' && event.path === '/reports') {
        const { type, format } = event.queryStringParameters || {};

        if (!type || !format) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Query parameters \"type\" and \"format\" are required.' })
            };
        }

        let reportData;
        switch (type.toLowerCase()) {
            case 'department':
                reportData = getDepartmentReport();
                break;
            case 'monthly':
                reportData = getMonthlyReport();
                break;
            case 'employee':
                reportData = getEmployeeReport();
                break;
            default:
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: `Invalid report type: '${type}'. Valid types are department, monthly, employee.` })
                };
        }

        try {
            switch (format.toLowerCase()) {
                case 'csv':
                    const parser = new Parser();
                    const csv = parser.parse(reportData);
                    return {
                        statusCode: 200,
                        headers: {
                            'Content-Type': 'text/csv',
                            'Content-Disposition': `attachment; filename=\"report-${type}.csv\"`
                        },
                        body: csv
                    };
                case 'excel':
                    const worksheet = XLSX.utils.json_to_sheet(reportData);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
                    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
                    return {
                        statusCode: 200,
                        headers: {
                            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            'Content-Disposition': `attachment; filename=\"report-${type}.xlsx\"`
                        },
                        body: excelBuffer,
                        isBase64Encoded: true
                    };
                default:
                    return {
                        statusCode: 400,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: `Invalid format: '${format}'. Valid formats are csv, excel.` })
                    };
            }
        } catch (error) {
            console.error('Failed to generate report file:', error);
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'An internal error occurred while generating the report.' })
            };
        }
    }

    return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Not Found' })
    };
};