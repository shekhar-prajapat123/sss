import React from 'react';
import type { LeaveRequest } from '../types';

interface LeaveRequestListProps {
    requests: LeaveRequest[];
    onCancel: (id: number) => void;
}

export function LeaveRequestList({ requests, onCancel }: LeaveRequestListProps) {
    if (requests.length === 0) {
        return <p>You have no past or pending leave requests.</p>;
    }

    return (
        <table className="leave-table">
            <thead>
                <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {requests.map(request => (
                    <tr key={request.id}>
                        <td>{request.leaveType}</td>
                        <td>{request.startDate}</td>
                        <td>{request.endDate}</td>
                        <td>{request.reason}</td>
                        <td>
                            <span className={`status-${request.status}`}>{request.status}</span>
                        </td>
                        <td>
                            {request.status === 'Pending' && (
                                <button className="cancel-button" onClick={() => onCancel(request.id)}>
                                    Cancel
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
