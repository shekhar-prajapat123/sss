import React, { useState } from 'react';
import { api } from '../api';
import { Profile } from '../types';

interface DashboardPageProps {
    initialProfile: Profile;
    onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ initialProfile, onLogout }) => {
    const [profile, setProfile] = useState<Profile>(initialProfile);
    const [message, setMessage] = useState('');

    const handleLogout = async () => {
        await api.logout();
        onLogout();
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await api.updateProfile(profile);
            if (response.success && response.profile) {
                setProfile(response.profile);
                setMessage('Profile updated successfully!');
            } else {
                setMessage(response.message || 'Failed to update profile.');
            }
        } catch (err) {
             setMessage('An unexpected error occurred during update.');
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage('');
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    }

    return (
        <div className="container">
            <div className="dashboard-header">
                <h2>My Dashboard</h2>
                <button onClick={handleLogout}>Log Out</button>
            </div>
            
            <h3>Manage Personal Information</h3>
            <form onSubmit={handleUpdate}>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={profile.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="contactDetails">Contact Details</label>
                    <input
                        id="contactDetails"
                        name="contactDetails"
                        type="text"
                        value={profile.contactDetails}
                        onChange={handleChange}
                        required
                    />
                </div>
                {message && <p className={message.includes('successfully') ? 'success-message' : 'error-message'}>{message}</p>}
                <div className="button-group-end">
                    <button type="submit">Save Changes</button>
                </div>
            </form>
        </div>
    );
};
