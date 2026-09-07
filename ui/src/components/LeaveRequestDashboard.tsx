import { useState, useEffect } from 'react';
import { LeaveRequest } from '../types';
import { getPendingLeaveRequests } from '../api';
import LeaveRequestItem from './LeaveRequestItem';

interface LeaveRequestDashboardProps {
  managerId: string;
  onDecision: (request: LeaveRequest, decision: 'Approved' | 'Rejected') => void;
  onInitialLoad: (count: number) => void;
}

function LeaveRequestDashboard({ managerId, onDecision, onInitialLoad }: LeaveRequestDashboardProps) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const requests = await getPendingLeaveRequests(managerId);
        setLeaveRequests(requests);
        onInitialLoad(requests.length);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch leave requests.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [managerId, onInitialLoad]);

  const handleDecision = (processedRequest: LeaveRequest, decision: 'Approved' | 'Rejected') => {
    setLeaveRequests(currentRequests => 
      currentRequests.filter(req => req.id !== processedRequest.id)
    );
    onDecision(processedRequest, decision);
  };

  if (isLoading) {
    return <div className="dashboard-loading">Loading pending requests...</div>;
  }

  if (error) {
    return <div className="dashboard-error">Error: {error}</div>;
  }

  return (
    <div>
      <h2>Pending Leave Requests</h2>
      {leaveRequests.length > 0 ? (
        <div className="leave-request-list">
          {leaveRequests.map(request => (
            <LeaveRequestItem key={request.id} request={request} onDecision={handleDecision} />
          ))}
        </div>
      ) : (
        <p>There are no pending leave requests from your direct reports.</p>
      )}
    </div>
  );
}

export default LeaveRequestDashboard;
