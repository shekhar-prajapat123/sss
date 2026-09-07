import React, { useState, useMemo } from 'react';
import { Department, Employee } from '../types';
import { DepartmentCreationData } from '../api';

type DepartmentFormProps = {
    managers: Employee[];
    onSave: (data: DepartmentCreationData | Partial<DepartmentCreationData>) => void;
    onCancel: () => void;
    department?: Department;
};

const DepartmentForm: React.FC<DepartmentFormProps> = ({ managers, onSave, onCancel, department }) => {
    const [formData, setFormData] = useState({
        name: department?.name || '',
        managerId: department?.managerId || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.managerId) {
            alert('Department name and designated manager are required.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="form-container">
            <h3>{department ? 'Update Department' : 'Create Department'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-row"><label>Name</label><input name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div className="form-row"><label>Manager</label><select name="managerId" value={formData.managerId} onChange={e => setFormData({ ...formData, managerId: e.target.value })} required><option value="" disabled>Select Manager</option>{managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                <div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>Cancel</button><button type="submit" className="primary">Save</button></div>
            </form>
        </div>
    );
};

type DepartmentManagementProps = {
    departments: Department[];
    employees: Employee[];
    onCreate: (data: DepartmentCreationData) => void;
    onUpdate: (id: string, data: Partial<DepartmentCreationData>) => void;
    onDelete: (id: string) => void;
};

const DepartmentManagement: React.FC<DepartmentManagementProps> = ({ departments, employees, onCreate, onUpdate, onDelete }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [editingDeptId, setEditingDeptId] = useState<string | null>(null);

    const managers = useMemo(() => employees.filter(e => e.role === 'Manager'), [employees]);
    const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e.name])), [employees]);

    const handleSave = (data: DepartmentCreationData | Partial<DepartmentCreationData>) => {
        if (editingDeptId) {
            onUpdate(editingDeptId, data);
        } else {
            onCreate(data as DepartmentCreationData);
        }
        setIsCreating(false);
        setEditingDeptId(null);
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingDeptId(null);
    };

    const editingDepartment = departments.find(d => d.id === editingDeptId);

    return (
        <section className="management-section">
            <h2>Manage Departments</h2>
            {!isCreating && !editingDeptId && <button className="primary" onClick={() => setIsCreating(true)}>Create Department</button>}
            {(isCreating || editingDeptId) && <DepartmentForm managers={managers} onSave={handleSave} onCancel={handleCancel} department={editingDepartment} />}
            <table>
                <thead><tr><th>Department Name</th><th>Designated Manager</th><th>Actions</th></tr></thead>
                <tbody>
                    {departments.map(dept => (
                        <tr key={dept.id}>
                            <td>{dept.name}</td>
                            <td>{employeeMap.get(dept.managerId) || 'Not Assigned'}</td>
                            <td className="table-actions">
                                <button className="secondary" onClick={() => setEditingDeptId(dept.id)}>Update</button>
                                <button className="danger" onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete the "${dept.name}" department?`)) {
                                        onDelete(dept.id);
                                    }
                                }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default DepartmentManagement;
