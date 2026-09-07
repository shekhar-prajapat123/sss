'use strict';

const { handler } = require('../index.js');

describe('Employee API Endpoints', () => {

    describe('POST /employees', () => {
        it('should create a new employee and return 201', async () => {
            const event = {
                httpMethod: 'POST',
                path: '/employees',
                body: JSON.stringify({
                    name: 'Zoe Zenith',
                    email: 'zoe@example.com',
                    role: 'Employee',
                    departmentId: 'ENG-002'
                })
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(201);
            expect(body.id).toMatch(/^emp-/);
            expect(body.name).toBe('Zoe Zenith');
            expect(body.status).toBe('active');
        });

        it('should return 400 if required fields are missing', async () => {
            const event = {
                httpMethod: 'POST',
                path: '/employees',
                body: JSON.stringify({ name: 'Incomplete' })
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(400);
            expect(body.message).toBe('Missing required fields: name, email, role, departmentId');
        });

        it('should return 400 if department does not exist', async () => {
            const event = {
                httpMethod: 'POST',
                path: '/employees',
                body: JSON.stringify({
                    name: 'Zoe Zenith',
                    email: 'zoe@example.com',
                    role: 'Employee',
                    departmentId: 'NON-EXISTENT-DEPT'
                })
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(400);
            expect(body.message).toBe('Department with id NON-EXISTENT-DEPT does not exist.');
        });
    });

    describe('PUT /employees/{employeeId}', () => {
        it('should update an existing employee and return 200', async () => {
            const event = {
                httpMethod: 'PUT',
                path: '/employees/emp-104',
                pathParameters: { employeeId: 'emp-104' },
                body: JSON.stringify({ role: 'Senior Developer' })
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(200);
            expect(body.id).toBe('emp-104');
            expect(body.role).toBe('Senior Developer');
        });

        it('should return 404 if employee does not exist', async () => {
            const event = {
                httpMethod: 'PUT',
                path: '/employees/emp-999',
                pathParameters: { employeeId: 'emp-999' },
                body: JSON.stringify({ name: 'Ghost' })
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(404);
            expect(body.message).toBe('Employee with id emp-999 not found.');
        });

        it('should return 400 when updating with a non-existent department', async () => {
            const event = {
                httpMethod: 'PUT',
                path: '/employees/emp-104',
                pathParameters: { employeeId: 'emp-104' },
                body: JSON.stringify({ departmentId: 'FAKE-DEPT-01' })
            };
            const response = await handler(event);
            expect(response.statusCode).toBe(400);
            expect(JSON.parse(response.body).message).toBe('Department with id FAKE-DEPT-01 does not exist.');
        });
    });

    describe('DELETE /employees/{employeeId}', () => {
        it('should deactivate an employee and return 200', async () => {
            const event = {
                httpMethod: 'DELETE',
                path: '/employees/emp-104',
                pathParameters: { employeeId: 'emp-104' }
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(200);
            expect(body.message).toBe('Employee emp-104 deactivated.');
            expect(body.employee.status).toBe('inactive');
        });

        it('should return 404 if employee to deactivate does not exist', async () => {
            const event = {
                httpMethod: 'DELETE',
                path: '/employees/emp-999',
                pathParameters: { employeeId: 'emp-999' }
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(404);
            expect(body.message).toBe('Employee with id emp-999 not found.');
        });
    });
});

describe('Department API Endpoints', () => {

    describe('POST /departments', () => {
        it('should create a new department and return 201', async () => {
            const event = {
                httpMethod: 'POST',
                path: '/departments',
                body: JSON.stringify({ id: 'FIN-003', name: 'Finance', managerId: 'emp-102' })
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(201);
            expect(body).toEqual({ id: 'FIN-003', name: 'Finance', managerId: 'emp-102' });
        });

        it('should return 409 if department ID already exists', async () => {
            const event = {
                httpMethod: 'POST',
                path: '/departments',
                body: JSON.stringify({ id: 'HR-001', name: 'Human Resources Clone', managerId: 'emp-102' })
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(409);
            expect(body.message).toBe('Department with id HR-001 already exists.');
        });

        it('should return 400 if managerId is not a valid manager', async () => {
            const event = {
                httpMethod: 'POST',
                path: '/departments',
                body: JSON.stringify({ id: 'QA-004', name: 'Quality Assurance', managerId: 'emp-104' })
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(400);
            expect(body.message).toBe('Manager with id emp-104 is not a valid manager.');
        });
    });

    describe('PUT /departments/{departmentId}', () => {
        it('should update an existing department and return 200', async () => {
            const event = {
                httpMethod: 'PUT',
                path: '/departments/ENG-002',
                pathParameters: { departmentId: 'ENG-002' },
                body: JSON.stringify({ name: 'Software Engineering' })
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(200);
            expect(body.name).toBe('Software Engineering');
        });

        it('should return 404 if department does not exist', async () => {
            const event = {
                httpMethod: 'PUT',
                path: '/departments/DEPT-999',
                pathParameters: { departmentId: 'DEPT-999' },
                body: JSON.stringify({ name: 'Ghost Department' })
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(404);
            expect(body.message).toBe('Department with id DEPT-999 not found.');
        });

        it('should return 400 if updating with an invalid managerId', async () => {
            const event = {
                httpMethod: 'PUT',
                path: '/departments/HR-001',
                pathParameters: { departmentId: 'HR-001' },
                body: JSON.stringify({ managerId: 'emp-101' })
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(400);
            expect(body.message).toBe('Manager with id emp-101 is not a valid manager.');
        });
    });

    describe('DELETE /departments/{departmentId}', () => {
        it('should delete an empty department and return 204', async () => {
            // First, create a department that can be deleted
            await handler({
                httpMethod: 'POST',
                path: '/departments',
                body: JSON.stringify({ id: 'EMPTY-DEPT', name: 'Empty Dept', managerId: 'emp-102' })
            });

            const event = {
                httpMethod: 'DELETE',
                path: '/departments/EMPTY-DEPT',
                pathParameters: { departmentId: 'EMPTY-DEPT' }
            };

            const response = await handler(event);

            expect(response.statusCode).toBe(204);
            expect(response.body).toBe('');
        });

        it('should return 409 if department still has employees', async () => {
            const event = {
                httpMethod: 'DELETE',
                path: '/departments/HR-001',
                pathParameters: { departmentId: 'HR-001' }
            };

            const response = await handler(event);
            const body = JSON.parse(response.body);

            expect(response.statusCode).toBe(409);
            expect(body.message).toBe('Cannot delete department HR-001 as it still has employees assigned.');
        });
    });
});

describe('General API Behavior', () => {
    it('should return 404 for a non-existent route', async () => {
        const event = { httpMethod: 'GET', path: '/nonexistent' };
        const response = await handler(event);
        const body = JSON.parse(response.body);
        expect(response.statusCode).toBe(404);
        expect(body.message).toBe('Route not found: GET /nonexistent');
    });

    it('should return 500 if the event body is malformed JSON', async () => {
        const event = {
            httpMethod: 'POST',
            path: '/employees',
            body: '{"name": "test" "email": "test@test.com"}' // Malformed JSON (missing comma)
        };
        const response = await handler(event);
        const body = JSON.parse(response.body);
        expect(response.statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
    });
});
