import React, { useState } from 'react';
import type { LeaveType, LeaveBalance, NewLeaveRequest, LeaveRequest } from '../types';

interface LeaveRequestFormProps {
    balances: LeaveBalance[];
    existingRequests: LeaveRequest[];
    onSubmit: (request: NewLeaveRequest) => void;
}

const LEAVE_TYPES: LeaveType[] = ["Vacation", "Sick Leave", "Personal Day"];

export function LeaveRequestForm({ balances, existingRequests, onSubmit }: LeaveRequestFormProps) {
    const [leaveType, setLeaveType] = useState<LeaveType>('Vacation');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    const calculateDays = (start: string, end: string): number => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = endDate.getTime() - startDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const validateRequest = (): boolean => {
        // VR-001: All mandatory fields are provided
        if (!leaveType || !startDate || !endDate || !reason) {
            setError('All fields are mandatory.');
            return false;
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // VR-008: Dates are valid
        if (start > end) {
            setError('Start date cannot be after end date.');
            return false;
        }
        if (start < today) {
            setError('Start date cannot be in the past.');
            return false;
        }

        // VR-010: Check balance
        const requestedDays = calculateDays(startDate, endDate);
        const availableBalance = balances.find(b => b.leaveType === leaveType)?.balance ?? 0;
        if (requestedDays > availableBalance) {
            setError(`Request exceeds available balance of ${availableBalance} days for ${leaveType}.`);
            return false;
        }

        // VR-009: Prevent overlapping leave requests
        const isOverlapping = existingRequests.some(req => {
            const existingStart = new Date(req.startDate);
            const existingEnd = new Date(req.endDate);
            return start <= existingEnd && end >= existingStart;
        });

        if (isOverlapping) {
            setError('The requested dates overlap with an existing leave request.');
            return false;
        }

        setError(null);
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateRequest()) {
            onSubmit({ leaveType, startDate, endDate, reason });
            // Reset form
            setLeaveType('Vacation');
            setStartDate('');
            setEndDate('');
            setReason('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-grid">
                <div className="form-field">
                    <label htmlFor="leaveType">Leave Type</label>
                    <select id="leaveType" value={leaveType} onChange={e => setLeaveType(e.target.value as LeaveType)}>
                        {LEAVE_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                 <div className="form-field">
                    {/* Placeholder for balance display */}
                </div>
                <div className="form-field">
                    <label htmlFor="startDate">Start Date</label>
                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="form-field">
                    <label htmlFor="endDate">End Date</label>
                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div className="form-field full-width">
                    <label htmlFor="reason">Reason</label>
                    <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} />
                </div>
                <div className="form-field full-width">
                    <button type="submit" className="submit-button">Submit Request</button>
                </div>
            </div>
            {error && <p className="error-message">{error}</p>}
        </form>
    );
}
