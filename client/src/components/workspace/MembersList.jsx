import Avatar from '../ui/Avatar';

const ROLE_LABELS = { owner: 'Owner', admin: 'Admin', member: 'Member' };

const MembersList = ({ members = [] }) => (
  <div className="divide-y divide-border">
    {members.map(({ user, role, joinedAt }) => (
      <div key={user._id} className="flex items-center gap-3 py-2.5">
        <Avatar name={user.name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-zinc-300 truncate">{user.name}</p>
          <p className="text-2xs text-muted truncate">{user.email}</p>
        </div>
        <span className="text-2xs text-muted bg-surface-3 px-2 py-0.5 rounded">
          {ROLE_LABELS[role] || role}
        </span>
      </div>
    ))}
  </div>
);

export default MembersList;
