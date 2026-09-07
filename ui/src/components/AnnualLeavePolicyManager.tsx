import React, { useState, useEffect } from 'react';
import { AnnualLeavePolicy } from '../types';
import { getAnnualLeavePolicy, updateAnnualLeavePolicy } from '../api';

const AnnualLeavePolicyManager: React.FC = () => {
  const [policy, setPolicy] = useState<AnnualLeavePolicy>({ accrualRate: 0, maxCarryOver: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setIsLoading(true);
        const data = await getAnnualLeavePolicy();
        setPolicy(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch annual leave policy.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPolicy(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setError(null);
    try {
      await updateAnnualLeavePolicy(policy);
      setSuccessMessage('Annual leave policy configured successfully.');
    } catch (err) {
      setError('Failed to configure the policy. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <h2>Configure Annual Leave Policies (FR-020)</h2>
        <p>Loading policy...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Configure Annual Leave Policies (FR-020)</h2>
      {error && <div className="message error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="accrualRate">Annual Leave Accrual Rate (days)</label>
          <input
            id="accrualRate"
            name="accrualRate"
            type="number"
            step="0.1"
            min="0"
            value={policy.accrualRate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="maxCarryOver">Maximum Carry-Over (days)</label>
          <input
            id="maxCarryOver"
            name="maxCarryOver"
            type="number"
            step="1"
            min="0"
            value={policy.maxCarryOver}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Configure Policy</button>
      </form>
      {successMessage && <div className="message success">{successMessage}</div>}
    </div>
  );
};

export default AnnualLeavePolicyManager;
