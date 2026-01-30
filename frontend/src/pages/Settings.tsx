import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { User, Lock, Bell, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const profileMutation = useMutation({
    mutationFn: (data: typeof profileData) => authApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: typeof passwordData) => authApi.updatePassword(data),
    onSuccess: () => {
      toast.success('Password updated successfully');
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    },
    onError: () => {
      toast.error('Failed to update password');
    },
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="card overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                profileMutation.mutate(profileData);
              }}
              className="space-y-6"
            >
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Role</label>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="capitalize font-medium">{user?.role}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={profileMutation.isPending}
                className="btn-primary"
              >
                {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                passwordMutation.mutate(passwordData);
              }}
              className="space-y-6"
            >
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  className="input"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={passwordMutation.isPending}
                className="btn-primary"
              >
                {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <p className="text-gray-500">
                Email notifications are sent automatically for:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <input type="checkbox" checked disabled className="rounded" />
                  <span>Mulkiya expiry alerts (30, 15, 7 days before)</span>
                </li>
                <li className="flex items-center gap-3">
                  <input type="checkbox" checked disabled className="rounded" />
                  <span>Visa expiry alerts (30, 15, 7 days before)</span>
                </li>
                <li className="flex items-center gap-3">
                  <input type="checkbox" checked disabled className="rounded" />
                  <span>License expiry alerts (30, 15, 7 days before)</span>
                </li>
                <li className="flex items-center gap-3">
                  <input type="checkbox" checked disabled className="rounded" />
                  <span>Insurance expiry alerts (30, 15, 7 days before)</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500">
                Configure email settings in the server environment (.env file).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
