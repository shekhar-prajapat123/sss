'use strict';

// In-memory data store seeded with example records
const data = {
    employees: new Map([
        ['emp-101', { id: 'emp-101', name: 'Alice Admin', email: 'alice@example.com', role: 'Admin', departmentId: 'HR-001', status: 'active' }],
        ['emp-102', { id: 'emp-102', name: 'Bob Manager', email: 'bob@example.com', role: 'Manager', departmentId: 'HR-001', status: 'active' }],
        ['emp-103', { id: 'emp-103', name: 'Charlie Manager', email: 'charlie@example.com', role: 'Manager', departmentId: 'ENG-002', status: 'active' }],
        ['emp-104', { id: 'emp-104', name: 'Diana Developer', email: 'diana@example.com', role: 'Employee', departmentId: 'ENG-002', status: 'active' }]
    ]),
    departments: new Map([
        ['HR-001', { id: 'HR-001', name: 'Human Resources', managerId: 'emp-102' }],
        ['ENG-002', { id: 'ENG-002', name: 'Engineering', managerId: 'emp-103' }]
    ])
};

// --- Helper Functions ---

function createResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // For simplified testing
        },
        body: body ? JSON.stringify(body) : ''
    };
}

function isValidManager(employeeId) {
    if (!employeeId) return false;
    const employee = data.employees.get(employeeId);
    return employee && employee.role === 'Manager' && employee.status === 'active';
}

// --- Main Lambda Handler ---

exports.handler = async (event) => {
    const method = event.httpMethod;
    const path = event.path;
    const body = event.body ? JSON.parse(event.body) : null;
    const pathParams = event.pathParameters || {};

    try {
        // --- Employee Routes (FR-015, FR-016, FR-017) ---

        // POST /employees (Create Employee)
        if (method === 'POST' && path === '/employees') {
            const { name, email, role, departmentId } = body;
            if (!name || !email || !role || !departmentId) {
                return createResponse(400, { message: 'Missing required fields: name, email, role, departmentId' });
            }
            if (!data.departments.has(departmentId)) {
                return createResponse(400, { message: `Department with id ${departmentId} does not exist.` });
            }
            const newId = `emp-${Date.now()}`;
            const newEmployee = { id: newId, name, email, role, departmentId, status: 'active' };
            data.employees.set(newId, newEmployee);
            return createResponse(201, newEmployee);
        }

        // PUT /employees/{employeeId} (Update Employee)
        if (method === 'PUT' && path.startsWith('/employees/')) {
            const { employeeId } = pathParams;
            if (!data.employees.has(employeeId)) {
                return createResponse(404, { message: `Employee with id ${employeeId} not found.` });
            }
            const employee = data.employees.get(employeeId);
            const { departmentId } = body;

            if (departmentId && !data.departments.has(departmentId)) {
                return createResponse(400, { message: `Department with id ${departmentId} does not exist.` });
            }
            const updatedEmployee = { ...employee, ...body };
            data.employees.set(employeeId, updatedEmployee);
            return createResponse(200, updatedEmployee);
        }

        // DELETE /employees/{employeeId} (Deactivate Employee)
        if (method === 'DELETE' && path.startsWith('/employees/')) {
            const { employeeId } = pathParams;
            if (!data.employees.has(employeeId)) {
                return createResponse(404, { message: `Employee with id ${employeeId} not found.` });
            }
            const employee = data.employees.get(employeeId);
            employee.status = 'inactive';
            data.employees.set(employeeId, employee);
            return createResponse(200, { message: `Employee ${employeeId} deactivated.`, employee });
        }

        // --- Department Routes (FR-018) ---

        // POST /departments (Create Department)
        if (method === 'POST' && path === '/departments') {
            const { id, name, managerId } = body;
            if (!id || !name || !managerId) {
                return createResponse(400, { message: 'Missing required fields: id, name, managerId' });
            }
            if (data.departments.has(id)) {
                return createResponse(409, { message: `Department with id ${id} already exists.` });
            }
            if (!isValidManager(managerId)) {
                return createResponse(400, { message: `Manager with id ${managerId} is not a valid manager.` });
            }
            const newDepartment = { id, name, managerId };
            data.departments.set(id, newDepartment);
            return createResponse(201, newDepartment);
        }

        // PUT /departments/{departmentId} (Update Department)
        if (method === 'PUT' && path.startsWith('/departments/')) {
            const { departmentId } = pathParams;
            if (!data.departments.has(departmentId)) {
                return createResponse(404, { message: `Department with id ${departmentId} not found.` });
            }
            const { managerId } = body;
            if (managerId && !isValidManager(managerId)) {
                return createResponse(400, { message: `Manager with id ${managerId} is not a valid manager.` });
            }
            const department = data.departments.get(departmentId);
            const updatedDepartment = { ...department, ...body };
            data.departments.set(departmentId, updatedDepartment);
            return createResponse(200, updatedDepartment);
        }

        // DELETE /departments/{departmentId} (Delete Department)
        if (method === 'DELETE' && path.startsWith('/departments/')) {
            const { departmentId } = pathParams;
            if (!data.departments.has(departmentId)) {
                return createResponse(404, { message: `Department with id ${departmentId} not found.` });
            }
            const employeesInDept = [...data.employees.values()].some(emp => emp.departmentId === departmentId);
            if (employeesInDept) {
                return createResponse(409, { message: `Cannot delete department ${departmentId} as it still has employees assigned.` });
            }
            data.departments.delete(departmentId);
            return createResponse(204, null);
        }

        // --- Not Found ---
        return createResponse(404, { message: `Route not found: ${method} ${path}` });

    } catch (error) {
        console.error('Error processing request:', error);
        return createResponse(500, { message: 'Internal Server Error', error: error.message });
    }
};