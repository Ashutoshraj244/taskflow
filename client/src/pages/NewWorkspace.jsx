import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { workspaceApi } from '../api';
import useWorkspaceStore from '../context/workspaceStore';
import Spinner from '../components/ui/Spinner';

const THEME_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16',
];

const NewWorkspace = () => {
  const navigate = useNavigate();
  const { addWorkspace } = useWorkspaceStore();
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState(THEME_COLORS[0]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ name, description }) => {
    setLoading(true);
    try {
      const res = await workspaceApi.create({ name, description, themeColor: color });
      addWorkspace(res.data.workspace);
      toast.success('Workspace created');
      navigate(`/workspace/${res.data.workspace._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-8">
      <div className="mb-6">
        <h1 className="text-base font-semibold text-zinc-100 mb-1">New workspace</h1>
        <p className="text-xs text-muted">Workspaces group tasks and team members together.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Name *</label>
          <input
            className="input"
            placeholder="e.g. Backend API, Mobile App..."
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="What is this workspace for?"
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
                className={`w-7 h-7 rounded-full transition-all ${
                  color === c ? 'ring-2 ring-offset-2 ring-offset-surface-0 ring-white scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* preview */}
        <div className="card p-3 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: color + '20', color }}
          >
            W
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-300">Preview</p>
            <p className="text-2xs text-muted">How your workspace will appear</p>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Spinner size={4} /> : 'Create workspace'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewWorkspace;
