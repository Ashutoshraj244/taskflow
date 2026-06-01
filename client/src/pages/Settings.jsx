import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../api';
import useAuthStore from '../context/authStore';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import { timeAgo } from '../utils';

const Settings = () => {
  const { user, updateProfile } = useAuthStore();
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile } = useForm({
    defaultValues: { name: user?.name, avatar: user?.avatar },
  });
  const { register: regPw, handleSubmit: handlePw, reset: resetPw } = useForm();

  const onProfileSave = async (data) => {
    setProfileLoading(true);
    try {
      await updateProfile(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordChange = async ({ currentPassword, newPassword }) => {
    setPwLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      resetPw();
      toast.success('Password changed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Change failed');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-6 space-y-5">
      <h1 className="text-sm font-semibold text-zinc-100">Account settings</h1>

      {/* profile */}
      <section className="card p-5">
        <h2 className="text-xs font-semibold text-zinc-300 mb-4">Profile</h2>
        <div className="flex items-center gap-4 mb-4">
          <Avatar name={user?.name} size="lg" />
          <div>
            <p className="text-sm font-medium text-zinc-200">{user?.name}</p>
            <p className="text-xs text-muted">{user?.email}</p>
            {user?.lastLogin && (
              <p className="text-2xs text-zinc-700 mt-0.5">
                Last login {timeAgo(user.lastLogin)}
              </p>
            )}
          </div>
        </div>
        <form onSubmit={handleProfile(onProfileSave)} className="space-y-3">
          <div>
            <label className="label">Display name</label>
            <input className="input" {...regProfile('name', { required: true })} />
          </div>
          <div>
            <label className="label">Avatar URL</label>
            <input
              className="input"
              placeholder="https://..."
              {...regProfile('avatar')}
            />
            <p className="text-2xs text-muted mt-1">Leave blank to use initials avatar</p>
          </div>
          <button type="submit" className="btn-primary" disabled={profileLoading}>
            {profileLoading ? <Spinner size={4} /> : 'Save profile'}
          </button>
        </form>
      </section>

      {/* password */}
      <section className="card p-5">
        <h2 className="text-xs font-semibold text-zinc-300 mb-4">Change password</h2>
        <form onSubmit={handlePw(onPasswordChange)} className="space-y-3">
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              className="input"
              {...regPw('currentPassword', { required: true })}
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input"
              {...regPw('newPassword', {
                required: true,
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={pwLoading}>
            {pwLoading ? <Spinner size={4} /> : 'Update password'}
          </button>
        </form>
      </section>

      {/* account info */}
      <section className="card p-5">
        <h2 className="text-xs font-semibold text-zinc-300 mb-3">Account info</h2>
        <div className="space-y-2 text-xs">
          <Row label="Email" value={user?.email} />
          <Row label="Member since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'} />
          <Row label="Workspaces" value={user?.joinedWorkspaces?.length || 0} />
        </div>
      </section>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-muted">{label}</span>
    <span className="text-zinc-300">{value}</span>
  </div>
);

export default Settings;
