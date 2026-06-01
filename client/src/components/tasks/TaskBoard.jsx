import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { statusMeta } from '../../utils';

const COLUMNS = ['backlog', 'in-progress', 'review', 'completed'];

const TaskBoard = ({ tasks, onAddTask }) => {
  const grouped = COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {});

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 px-5 min-h-0">
      {COLUMNS.map((status) => {
        const meta = statusMeta[status];
        const col = grouped[status] || [];
        return (
          <div key={status} className="flex flex-col w-64 shrink-0">
            {/* column header */}
            <div className="flex items-center justify-between mb-2 px-0.5">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                <span className="text-xs font-medium text-zinc-300">{meta.label}</span>
                <span className="text-2xs text-muted bg-surface-3 px-1.5 py-0.5 rounded">
                  {col.length}
                </span>
              </div>
              <button
                onClick={() => onAddTask(status)}
                className="text-muted hover:text-zinc-300 transition-colors"
                title={`Add to ${meta.label}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col gap-2 flex-1 min-h-16 p-1.5 rounded transition-colors ${
                    snapshot.isDraggingOver ? 'bg-surface-2' : ''
                  }`}
                >
                  {col.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                        >
                          <TaskCard task={task} isDragging={snap.isDragging} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {col.length === 0 && !snapshot.isDraggingOver && (
                    <div className="text-2xs text-zinc-700 text-center py-4 border border-dashed border-zinc-800 rounded">
                      Drop here
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoard;
