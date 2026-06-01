const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && <div className="text-zinc-600 mb-3">{icon}</div>}
    <p className="text-sm font-medium text-zinc-400">{title}</p>
    {description && <p className="text-xs text-muted mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
