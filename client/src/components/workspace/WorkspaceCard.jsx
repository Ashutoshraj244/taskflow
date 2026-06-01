import { Link } from 'react-router-dom';

const WorkspaceCard = ({ workspace }) => {
  const memberCount = workspace.members?.length || 0;

  return (
    <Link
      to={`/workspace/${workspace._id}`}
      className="block card p-4 hover:border-zinc-600 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: workspace.themeColor + '20', color: workspace.themeColor }}
        >
          {workspace.name[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-200 group-hover:text-white truncate transition-colors">
            {workspace.name}
          </p>
          {workspace.description && (
            <p className="text-xs text-muted mt-0.5 line-clamp-1">{workspace.description}</p>
          )}
          <p className="text-2xs text-zinc-700 mt-1.5">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default WorkspaceCard;
