import React, { useState } from 'react';
import { Employee, Department, Role, Status } from '../types';
import { EmployeeCreationData } from '../api';

type EmployeeFormProps = {
    departments: Department[];
    onSave: (data: EmployeeCreationData | Partial<Omit<Employee, 'id'>>) => void;
    onCancel: () => void;
    employee?: Employee;
};

const EmployeeForm: React.FC<EmployeeFormProps> = ({ departments, onSave, onCancel, employee }) => {
    const [formData, setFormData] = useState({
        name: employee?.name || '',
        email: employee?.email || '',
        role: employee?.role || 'Employee',
        departmentId: employee?.departmentId || '',
        status: employee?.status || 'Active',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.departmentId) {
            alert('Please fill all required fields.');
            return;
        }
        if (employee) {
            onSave({ 
                name: formData.name, 
                email: formData.email, 
                role: formData.role as Role,
                departmentId: formData.departmentId,
                status: formData.status as Status 
            });
        } else {
            onSave({ 
                name: formData.name, 
                email: formData.email, 
                role: formData.role as Role,
                departmentId: formData.departmentId
            });
        }
    };

    return (
        <div className="form-container">
            <h3>{employee ? 'Update Employee Account' : 'Create New Employee Account'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-row"><label>Name</label><input name="name" value={formData.name} onChange={handleChange} required /></div>
                <div className="form-row"><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required /></div>
                <div className="form-row"><label>Role</label><select name="role" value={formData.role} onChange={handleChange}><option>Employee</option><option>Manager</option><option>Admin</option></select></div>
                <div className="form-row"><label>Department</label><select name="departmentId" value={formData.departmentId} onChange={handleChange} required><option value="" disabled>Select Department</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                {employee && <div className="form-row"><label>Status</label><select name="status" value={formData.status} onChange={handleChange}><option>Active</option><option>Deactivated</option></select></div>}
                <div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>Cancel</button><button type="submit" className="primary">Save</button></div>
            </form>
        </div>
    );
};

type EmployeeManagementProps = {
    employees: Employee[];
    departments: Department[];
    onCreate: (data: EmployeeCreationData) => void;
    onUpdate: (id: string, data: Partial<Omit<Employee, 'id'>>) => void;
    onDeactivate: (id: string) => void;
};

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ employees, departments, onCreate, onUpdate, onDeactivate }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

    const departmentMap = new Map(departments.map(d => [d.id, d.name]));

    const handleSave = (data: EmployeeCreationData | Partial<Omit<Employee, 'id'>>) => {
        if (editingEmployeeId) {
            onUpdate(editingEmployeeId, data as Partial<Omit<Employee, 'id'>>);
        } else {
            onCreate(data as EmployeeCreationData);
        }
        setIsCreating(false);
        setEditingEmployeeId(null);
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingEmployeeId(null);
    };

    const editingEmployee = employees.find(e => e.id === editingEmployeeId);

    return (
        <section className="management-section">
            <h2>Manage Employee Accounts</h2>
            {!isCreating && !editingEmployeeId && <button className="primary" onClick={() => setIsCreating(true)}>Create New Employee Account</button>}
            {(isCreating || editingEmployeeId) && <EmployeeForm departments={departments} onSave={handleSave} onCancel={handleCancel} employee={editingEmployee} />}
            <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                    {employees.map(employee => (
                        <tr key={employee.id}>
                            <td>{employee.name}</td>
                            <td>{employee.email}</td>
                            <td>{employee.role}</td>
                            <td>{departmentMap.get(employee.departmentId) || 'N/A'}</td>
                            <td>{employee.status}</td>
                            <td className="table-actions">
                                <button className="secondary" onClick={() => setEditingEmployeeId(employee.id)}>Update</button>
                                {employee.status === 'Active' && <button className="danger" onClick={() => onDeactivate(employee.id)}>Deactivate</button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default EmployeeManagement;
