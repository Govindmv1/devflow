import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { TaskStatus, TaskPriority } from '../types';
import {
  CheckSquare,
  Search,
  Calendar,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { Badge, Card, EmptyState } from '../components/ui';
import toast from 'react-hot-toast';

const MyTasksPage: React.FC = () => {
  const { tasks, fetchUserTasks, moveTaskStatus, isLoading } = useTaskStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    fetchUserTasks();
  }, [fetchUserTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await moveTaskStatus(taskId, newStatus);
      toast.success('Task status updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task status');
    }
  };

  const getTaskPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.CRITICAL: return <Badge variant="danger">critical</Badge>;
      case TaskPriority.HIGH: return <Badge variant="warning">high</Badge>;
      case TaskPriority.MEDIUM: return <Badge variant="info">medium</Badge>;
      case TaskPriority.LOW: return <Badge variant="default">low</Badge>;
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>My Tasks</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>View and update all tasks assigned directly to you.</p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-surface-400" />
          <input
            type="text"
            placeholder="Search my tasks..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-transparent outline-none focus:border-primary-500 transition-colors"
            style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full py-2 px-3 border rounded-lg text-sm bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
            style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all" style={{ backgroundColor: 'var(--bg-primary)' }}>All Statuses</option>
            <option value={TaskStatus.TODO} style={{ backgroundColor: 'var(--bg-primary)' }}>To Do</option>
            <option value={TaskStatus.IN_PROGRESS} style={{ backgroundColor: 'var(--bg-primary)' }}>In Progress</option>
            <option value={TaskStatus.IN_REVIEW} style={{ backgroundColor: 'var(--bg-primary)' }}>In Review</option>
            <option value={TaskStatus.BLOCKED} style={{ backgroundColor: 'var(--bg-primary)' }}>Blocked</option>
            <option value={TaskStatus.DONE} style={{ backgroundColor: 'var(--bg-primary)' }}>Done</option>
          </select>
        </div>
        <div>
          <select
            className="w-full py-2 px-3 border rounded-lg text-sm bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
            style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all" style={{ backgroundColor: 'var(--bg-primary)' }}>All Priorities</option>
            <option value={TaskPriority.LOW} style={{ backgroundColor: 'var(--bg-primary)' }}>Low</option>
            <option value={TaskPriority.MEDIUM} style={{ backgroundColor: 'var(--bg-primary)' }}>Medium</option>
            <option value={TaskPriority.HIGH} style={{ backgroundColor: 'var(--bg-primary)' }}>High</option>
            <option value={TaskPriority.CRITICAL} style={{ backgroundColor: 'var(--bg-primary)' }}>Critical</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {isLoading && tasks.length === 0 ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse h-16">
              <div />
            </Card>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={48} />}
          title="No tasks assigned"
          description={searchTerm ? "Try adjusting your search criteria." : "You have no pending tasks assigned. Sit back and relax!"}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border shadow-sm gap-4 transition-all duration-200"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center gap-3">
                {task.status === TaskStatus.DONE ? (
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-dashed shrink-0" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">{task.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {task.description || 'No description provided.'}
                  </p>
                  {task.project && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      <Briefcase size={10} />
                      <span>{task.project.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                {getTaskPriorityBadge(task.priority)}
                <div className="flex items-center gap-1">
                  <Calendar size={14} style={{ color: 'var(--text-tertiary)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Status:</span>
                  <select
                    className="p-1.5 border rounded-lg text-xs bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
                    style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                  >
                    <option value={TaskStatus.TODO} style={{ backgroundColor: 'var(--bg-primary)' }}>To Do</option>
                    <option value={TaskStatus.IN_PROGRESS} style={{ backgroundColor: 'var(--bg-primary)' }}>In Progress</option>
                    <option value={TaskStatus.IN_REVIEW} style={{ backgroundColor: 'var(--bg-primary)' }}>In Review</option>
                    <option value={TaskStatus.BLOCKED} style={{ backgroundColor: 'var(--bg-primary)' }}>Blocked</option>
                    <option value={TaskStatus.DONE} style={{ backgroundColor: 'var(--bg-primary)' }}>Done</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
