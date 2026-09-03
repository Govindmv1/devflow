import React, { useEffect, useState } from 'react';
import { Columns3, Search, Calendar } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { useTaskStore } from '../store/taskStore';
import { Badge } from '../components/ui';
import { getPriorityVariant, getStatusVariant } from '../components/ui/Badge';
import toast from 'react-hot-toast';
import { DndContext, useDroppable, useDraggable, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  count: number;
  children: React.ReactNode;
}

const KanbanColumnContainer: React.FC<KanbanColumnProps> = ({ status, label, count, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-4 flex flex-col space-y-4 min-h-[550px] transition-all duration-200 ${
        isOver ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-500/5' : ''
      }`}
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </span>
        </div>
        <Badge variant={getStatusVariant(status)}>{count}</Badge>
      </div>

      <div className="flex flex-col space-y-3 overflow-y-auto max-h-[620px] scrollbar-thin flex-1">
        {children}
      </div>
    </div>
  );
};

interface KanbanCardItemProps {
  task: Task;
}

const KanbanCardItem: React.FC<KanbanCardItemProps> = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
    backgroundColor: 'var(--bg-primary)',
    borderColor: 'var(--border-color)',
  };

  const assigneeName = task.assignee?.first_name || '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-4 rounded-xl border shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-500/40 transition-all duration-200 flex flex-col space-y-3 touch-none group"
    >
      <div className="flex justify-between items-start gap-2">
        <span className="text-xs font-bold line-clamp-2 text-slate-100 group-hover:text-blue-400 transition-colors">
          {task.title}
        </span>
        <Badge variant={getPriorityVariant(task.priority)} size="sm">
          {task.priority}
        </Badge>
      </div>

      {task.description && (
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t pt-2.5" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-slate-500" />
          <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'}</span>
        </div>
        {assigneeName && (
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white text-[9px] font-bold uppercase">
            {assigneeName.charAt(0)}
          </div>
        )}
      </div>
    </div>
  );
};

const GlobalKanbanPage: React.FC = () => {
  const { tasks, fetchUserTasks, moveTaskStatus } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    fetchUserTasks();
  }, [fetchUserTasks]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask && targetTask.status !== newStatus) {
      try {
        await moveTaskStatus(taskId, newStatus);
        toast.success(`Task moved to ${getStatusLabel(newStatus)}`);
      } catch {
        toast.error('Failed to update task status');
      }
    }
  };

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.TODO: return 'To Do';
      case TaskStatus.IN_PROGRESS: return 'In Progress';
      case TaskStatus.IN_REVIEW: return 'In Review';
      case TaskStatus.BLOCKED: return 'Blocked';
      case TaskStatus.DONE: return 'Done';
      default: return status;
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6 animate-slide-up pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Columns3 size={24} className="text-blue-500" />
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Global Kanban Board
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Drag and drop tasks across workspaces to reassign statuses in real time.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value={TaskPriority.CRITICAL}>Critical</option>
            <option value={TaskPriority.HIGH}>High</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.LOW}>Low</option>
          </select>
        </div>
      </div>

      {/* Drag and Drop Kanban Board */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-4 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start min-w-[1100px]">
            {[TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW, TaskStatus.BLOCKED, TaskStatus.DONE].map((status) => {
              const columnTasks = filteredTasks.filter(t => t.status === status);

              return (
                <KanbanColumnContainer key={status} status={status} label={getStatusLabel(status)} count={columnTasks.length}>
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      No tasks in this column
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <KanbanCardItem key={task.id} task={task} />
                    ))
                  )}
                </KanbanColumnContainer>
              );
            })}
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default GlobalKanbanPage;
