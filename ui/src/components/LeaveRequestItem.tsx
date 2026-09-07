import { useState } from 'react';
import { LeaveRequest } from '../types';
import { approveLeaveRequest, rejectLeaveRequest } from '../api';

interface LeaveRequestItemProps {
  request: LeaveRequest;
  onDecision: (request: LeaveRequest, decision: 'Approved' | 'Rejected') => void;
}

function LeaveRequestItem({ request, onDecision }: LeaveRequestItemProps) {
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const updatedRequest = await approveLeaveRequest(request.id, comments);
      onDecision(updatedRequest, 'Approved');
    } catch (err: any) {
      setError(err.message || 'Failed to approve request.');
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (comments.trim() === '') {
      setError('Comments are required to reject a request.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const updatedRequest = await rejectLeaveRequest(request.id, comments);
      onDecision(updatedRequest, 'Rejected');
    } catch (err: any) {
      setError(err.message || 'Failed to reject request.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="leave-request-item">
      <h3 className="request-header">{request.directReportName}</h3>
      <div className="request-details">
        <p><strong>From:</strong> {request.startDate}</p>
        <p><strong>To:</strong> {request.endDate}</p>
        <p><strong>Status:</strong> {request.status}</p>
      </div>
      {request.requestComments && (
        <div className="request-comments">
          <p><strong>Comments from Direct Report:</strong></p>
          <p>{request.requestComments}</p>
        </div>
      )}
      <div className="decision-section">
        <label htmlFor={`comments-${request.id}`}>Add Comments (optional for approval)</label>
        <textarea
          id={`comments-${request.id}`}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Provide a reason for your decision..."
          disabled={isSubmitting}
        />
        <div className="decision-actions">
          <button onClick={handleApprove} className="decision-button approve-button" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Approve'}
          </button>
          <button onClick={handleReject} className="decision-button reject-button" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Reject'}
          </button>
        </div>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    </div>
  );
}

export default LeaveRequestItem;
