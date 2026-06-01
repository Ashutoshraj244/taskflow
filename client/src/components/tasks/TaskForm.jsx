import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['backlog', 'in-progress', 'review', 'completed'];

const TaskForm = ({ open, onClose, onSubmit, defaultValues = {}, members = [], loading }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(defaultValues.tags || []);

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      setTags(defaultValues.tags || []);
    }
  }, [open]);

  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val && !tags.includes(val) && tags.length < 5) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const submit = (data) => {
    onSubmit({ ...data, tags });
  };

  return (
    <Modal open={open} onClose={onClose} title={defaultValues._id ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input
            className="input"
            placeholder="What needs to be done?"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Optional details..."
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Priority</label>
            <select className="input" {...register('priority')}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" {...register('status')}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input" {...register('dueDate')} />
          </div>
          <div>
            <label className="label">Est. Hours</label>
            <input
              type="number"
              className="input"
              min="0"
              step="0.5"
              placeholder="e.g. 4"
              {...register('estimatedHours')}
            />
          </div>
        </div>

        <div>
          <label className="label">Assign To</label>
          <select className="input" {...register('assignedTo')}>
            <option value="">— Unassigned —</option>
            {members.map((m) => (
              <option key={m.user._id} value={m.user._id}>
                {m.user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="badge bg-surface-3 text-zinc-400 cursor-pointer hover:bg-red-500/10 hover:text-red-400"
                onClick={() => removeTag(tag)}
              >
                {tag} ×
              </span>
            ))}
          </div>
          <input
            className="input"
            placeholder="Type tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
          />
          <p className="text-2xs text-muted mt-1">Up to 5 tags. Press Enter to add.</p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Spinner size={4} /> : defaultValues._id ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
