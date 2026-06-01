import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { workspaceApi } from '../api';
import useAuthStore from '../context/authStore';
import MembersList from '../components/workspace/MembersList';
import Spinner from '../components/ui/Spinner';

const THEME_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16',
];

const WorkspaceSettings = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [saveLoading, setSaveLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [color, setColor] = useState('');

  const { data: workspace, isLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceApi.getOne(workspaceId).then((r) => r.data.workspace),
    onSuccess: (ws) => {
      if (!color) setColor(ws.themeColor);
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm();

  const isOwner = workspace?.owner?._id === user?._id || workspace?.owner === user?._id;

  const onSave = async (data) => {
    setSaveLoading(true);
    try {
      await workspaceApi.update(workspaceId, { ...data, themeColor: color });
      qc.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Leave this workspace?')) return;
    setLeaveLoading(true);
    try {
      await workspaceApi.leave(workspaceId);
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      navigate('/dashboard');
      toast.success('Left workspace');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not leave');
      setLeaveLoading(false);
    }
  };

  const handleRegenInvite = async () => {
    setRegenLoading(true);
    try {
      const res = await workspaceApi.regenerateInvite(workspaceId);
      qc.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      toast.success('Invite code regenerated');
    } catch {
      toast.error('Failed to regenerate');
    } finally {
      setRegenLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size={5} /></div>;
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate(-1)} className="text-muted hover:text-zinc-300 text-xs">
          ← Back
        </button>
        <h1 className="text-sm font-semibold text-zinc-100">Workspace settings</h1>
      </div>

      {/* general settings — only owner/admin */}
      {isOwner && (
        <section className="card p-5">
          <h2 className="text-xs font-semibold text-zinc-300 mb-4">General</h2>
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                className="input"
                defaultValue={workspace?.name}
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input resize-none"
                rows={2}
                defaultValue={workspace?.description}
                {...register('description')}
              />
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex gap-2 flex-wrap">
                {THEME_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-all ${
                      (color || workspace?.themeColor) === c
                        ? 'ring-2 ring-offset-1 ring-offset-surface-1 ring-white'
                        : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={saveLoading}>
              {saveLoading ? <Spinner size={4} /> : 'Save changes'}
            </button>
          </form>
        </section>
      )}

      {/* invite code */}
      <section className="card p-5">
        <h2 className="text-xs font-semibold text-zinc-300 mb-3">Invite code</h2>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-sm font-mono tracking-widest text-zinc-200 bg-surface-2 px-3 py-2 rounded">
            {workspace?.inviteCode}
          </code>
          {isOwner && (
            <button className="btn-ghost text-xs" onClick={handleRegenInvite} disabled={regenLoading}>
              {regenLoading ? <Spinner size={3} /> : 'Regenerate'}
            </button>
          )}
        </div>
        <p className="text-2xs text-muted mt-2">Share this code to let others join</p>
      </section>

      {/* members */}
      <section className="card p-5">
        <h2 className="text-xs font-semibold text-zinc-300 mb-3">Members</h2>
        <MembersList members={workspace?.members || []} />
      </section>

      {/* danger zone */}
      {!isOwner && (
        <section className="card p-5 border-red-500/20">
          <h2 className="text-xs font-semibold text-red-400 mb-3">Danger zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">Leave workspace</p>
              <p className="text-2xs text-muted">You will lose access to all tasks</p>
            </div>
            <button className="btn-danger text-xs" onClick={handleLeave} disabled={leaveLoading}>
              {leaveLoading ? <Spinner size={3} /> : 'Leave'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default WorkspaceSettings;
