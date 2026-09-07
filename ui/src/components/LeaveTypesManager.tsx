import React, { useState, useEffect } from 'react';
import { LeaveType } from '../types';
import { getLeaveTypes, addLeaveType } from '../api';

const LeaveTypesManager: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const types = await getLeaveTypes();
        setLeaveTypes(types);
        setError(null);
      } catch (err) {
        setError('Failed to fetch leave types.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleDefineType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    setSuccessMessage(null);
    setError(null);

    try {
      const newType = await addLeaveType(newTypeName);
      setLeaveTypes(prev => [...prev, newType]);
      setSuccessMessage(`Leave type "${newType.name}" defined successfully.`);
      setNewTypeName('');
    } catch (err) {
      setError('Failed to define new leave type. Please try again.');
      setSuccessMessage(null);
    }
  };

  return (
    <div className="card">
      <h2>Define and Manage Leave Types (FR-019)</h2>
      {isLoading && <p>Loading leave types...</p>}
      {error && <div className="message error">{error}</div>}
      
      <h3>Available Leave Types</h3>
      <ul>
        {leaveTypes.map((type) => (
          <li key={type.id}>{type.name}</li>
        ))}
      </ul>

      <form onSubmit={handleDefineType}>
        <div className="form-row">
            <div className="form-group">
                <label htmlFor="new-leave-type-name">New Leave Type Name</label>
                <input
                    id="new-leave-type-name"
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="e.g., Bereavement"
                    required
                />
            </div>
            <button type="submit" disabled={!newTypeName.trim()}>Define</button>
        </div>
      </form>
      {successMessage && <div className="message success">{successMessage}</div>}
    </div>
  );
};

export default LeaveTypesManager;
