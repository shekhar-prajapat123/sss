import { useState } from 'react';
import { User } from '../types';
import { api } from '../api';

interface DashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
}

type Message = {
  type: 'success' | 'error';
  content: string;
}

function Dashboard({ user, token, onLogout }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const handleFetch = async (fetcher: (token: string) => Promise<Response>) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetcher(token);
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', content: JSON.stringify(data, null, 2) });
      } else {
        setMessage({ type: 'error', content: `[HTTP ${response.status} ${response.statusText}] ${data.message || 'An error occurred.'}` });
      }
    } catch (err) {
      const error = err as Error;
      setMessage({ type: 'error', content: `Request Failed: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePublicFetch = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await api.getPublicData(); // This one does not need a token
      const data = await response.json();
      setMessage({ type: 'success', content: JSON.stringify(data, null, 2) });
    } catch (err) {
        const error = err as Error;
        setMessage({ type: 'error', content: `Request Failed: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="dashboard">
      <h2>Role-Based Access Control Panel</h2>
      <div className="user-info">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Assigned Role:</strong> {user.role}</p>
      </div>
      <p>Use the buttons below to test access to different API endpoints based on your role. Unauthorized (401) and Forbidden (403) access attempts will be logged here.</p>
      
      <div className="actions">
        <button onClick={handlePublicFetch} disabled={isLoading}>
          Fetch Public Data
        </button>
        <button onClick={() => handleFetch(api.getProtectedData)} disabled={isLoading}>
          Fetch Protected Data (User Role Required)
        </button>
        {user.role === 'admin' && (
          <button onClick={() => handleFetch(api.getAdminData)} disabled={isLoading}>
            Fetch Admin Data (Admin Role Required)
          </button>
        )}
      </div>

      {isLoading && <p>Fetching data...</p>}

      {message && (
        <div className={`message-box ${message.type}`}>
          <h3>API Response:</h3>
          <pre>{message.content}</pre>
        </div>
      )}

      <button onClick={onLogout} className="secondary">Log Out</button>
    </div>
  );
}

export default Dashboard;
