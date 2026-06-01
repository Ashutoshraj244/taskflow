import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { workspaceApi } from '../api';
import useWorkspaceStore from '../context/workspaceStore';
import Spinner from '../components/ui/Spinner';

const JoinWorkspace = () => {
  const navigate = useNavigate();
  const { addWorkspace } = useWorkspaceStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ inviteCode }) => {
    setLoading(true);
    try {
      const res = await workspaceApi.join(inviteCode.trim().toUpperCase());
      addWorkspace(res.data.workspace);
      toast.success(`Joined "${res.data.workspace.name}"`);
      navigate(`/workspace/${res.data.workspace._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid invite code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-5 py-8">
      <div className="mb-6">
        <h1 className="text-base font-semibold text-zinc-100 mb-1">Join a workspace</h1>
        <p className="text-xs text-muted">Enter the invite code shared by your team.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Invite code</label>
          <input
            className="input font-mono tracking-widest uppercase"
            placeholder="e.g. A3F8C2"
            maxLength={8}
            {...register('inviteCode', { required: 'Invite code is required' })}
          />
          {errors.inviteCode && (
            <p className="text-xs text-red-400 mt-1">{errors.inviteCode.message}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Spinner size={4} /> : 'Join workspace'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JoinWorkspace;
