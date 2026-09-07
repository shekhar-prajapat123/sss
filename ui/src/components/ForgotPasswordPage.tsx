import React, { useState } from 'react';
import { api } from '../api';

interface ForgotPasswordPageProps {
    onBackToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await api.forgotPassword(email);
            if (response.success) {
                setMessage(response.message);
            } else {
                setError(response.message || 'An error occurred.');
            }
        } catch(err) {
            setError('An unexpected error occurred.');
        }
    };

    return (
        <div className="container">
            <h2>Reset Password</h2>
            {message ? (
                 <>
                    <p className="success-message">{message}</p>
                    <div className="button-group-end">
                       <button type="button" onClick={onBackToLogin}>
                            Back to Login
                        </button>
                    </div>
                </>
            ) : (
                <form onSubmit={handleReset}>
                    <p>Enter your email to initiate the password reset process.</p>
                    <div className="form-group">
                        <label htmlFor="reset-email">Email</label>
                        <input
                            id="reset-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="button-group">
                        <button type="button" className="link-button" onClick={onBackToLogin}>
                            Back to Login
                        </button>
                        <button type="submit">Reset Password</button>
                    </div>
                </form>
            )}
        </div>
    );
};
