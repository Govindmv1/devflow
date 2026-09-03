import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import {
  TaskStatus,
  TaskPriority,
  UserRole,
  Task,
  User
} from '../types';
import {
  LayoutGrid,
  List,
  Users,
  BarChart3,
  Sparkles,
  Plus,
  Search,
  Calendar,
  ChevronRight,
  Clock,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Edit
} from 'lucide-react';
import { Button, Input, Card, Modal, Badge, EmptyState } from '../components/ui';
import { getPriorityVariant, getStatusVariant } from '../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import api from '../lib/api';
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
      className={`rounded-xl border p-4 flex flex-col space-y-4 min-h-[500px] transition-all duration-200 ${
        isOver ? 'ring-2 ring-primary-500 border-primary-500' : ''
      }`}
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <Badge variant={getStatusVariant(status)}>{count}</Badge>
      </div>

      <div className="flex flex-col space-y-3 overflow-y-auto max-h-[600px] scrollbar-thin flex-1">
        {children}
      </div>
    </div>
  );
};

interface KanbanCardItemProps {
  task: Task;
  status: TaskStatus;
  onTaskClick: (task: Task) => void;
  moveTaskStatus: (id: string, status: TaskStatus) => void;
}

const KanbanCardItem: React.FC<KanbanCardItemProps> = ({ task, status, onTaskClick, moveTaskStatus }) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing hover:border-surface-400 dark:hover:border-surface-600 transition-all duration-200 relative group flex flex-col space-y-3 touch-none"
      onClick={() => onTaskClick(task)}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold line-clamp-2" style={{ color: 'var(--text-primary)' }}>
          {task.title}
        </span>
        <Badge variant={getPriorityVariant(task.priority)}>{task.priority.toLowerCase()}</Badge>
      </div>

      <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
        {task.description || 'No description.'}
      </p>

      <div className="flex justify-between items-center pt-2 border-t text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {task.assignee && (
            <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-[10px] font-bold text-white uppercase" title={`${task.assignee.first_name} ${task.assignee.last_name}`}>
              {task.assignee.first_name[0]}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1 justify-end pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {status !== TaskStatus.TODO && (
          <button
            onClick={(e) => { e.stopPropagation(); moveTaskStatus(task.id, TaskStatus.TODO); }}
            className="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[10px] hover:text-primary-500 cursor-pointer"
            title="Move to To Do"
          >
            Todo
          </button>
        )}
        {status !== TaskStatus.IN_PROGRESS && (
          <button
            onClick={(e) => { e.stopPropagation(); moveTaskStatus(task.id, TaskStatus.IN_PROGRESS); }}
            className="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[10px] hover:text-primary-500 cursor-pointer"
            title="Move to In Progress"
          >
            Work
          </button>
        )}
        {status !== TaskStatus.DONE && (
          <button
            onClick={(e) => { e.stopPropagation(); moveTaskStatus(task.id, TaskStatus.DONE); }}
            className="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[10px] hover:text-emerald-500 cursor-pointer"
            title="Mark Done"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthStore();
  const { currentProject, fetchProjectById, fetchProjectMembers, projectMembers, addProjectMember, removeProjectMember } = useProjectStore();
  const { tasks, fetchProjectTasks, createTask, updateTask, deleteTask, moveTaskStatus, generateAIDescription, generateAIProjectSummary } = useTaskStore();

  const [activeTab, setActiveTab] = useState<'board' | 'list' | 'members' | 'analytics' | 'ai'>('board');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Modals state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  
  // Selected items state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Task form state
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    assigned_to: '',
    due_date: '',
    estimated_hours: '',
  });

  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState('');

  // AI Assistant states
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Analytics states
  const [analytics, setAnalytics] = useState<any>(null);

  // Available users (for member assign and task assign)
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberRole, setMemberRole] = useState('DEVELOPER');

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      fetchProjectTasks(projectId);
      fetchProjectMembers(projectId);
      fetchUsers();
      fetchAnalytics();
    }
  }, [projectId, fetchProjectById, fetchProjectTasks, fetchProjectMembers]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setAvailableUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    if (!projectId) return;
    try {
      const res = await api.get(`/analytics/projects/${projectId}`);
      setAnalytics(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTaskComments = async (taskId: string) => {
    try {
      const res = await api.get(`/tasks/${taskId}/comments`);
      setComments(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !commentInput.trim()) return;
    try {
      const res = await api.post(`/tasks/${selectedTask.id}/comments`, { content: commentInput });
      setComments([...comments, { ...res.data.data, user }]);
      setCommentInput('');
      toast.success('Comment added');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments(comments.filter(c => c.id !== id));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleOpenCreateTask = () => {
    setTaskFormData({
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigned_to: '',
      due_date: '',
      estimated_hours: '',
    });
    setIsCreateTaskOpen(true);
  };

  const handleOpenEditTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assigned_to: task.assigned_to || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      estimated_hours: task.estimated_hours ? String(task.estimated_hours) : '',
    });
    setIsEditTaskOpen(true);
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !taskFormData.title.trim()) return;
    try {
      const data = {
        ...taskFormData,
        estimated_hours: taskFormData.estimated_hours ? Number(taskFormData.estimated_hours) : undefined,
        assigned_to: taskFormData.assigned_to || undefined
      };
      await createTask(projectId, data);
      toast.success('Task created successfully');
      setIsCreateTaskOpen(false);
      fetchAnalytics();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task');
    }
  };

  const handleEditTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !taskFormData.title.trim()) return;
    try {
      const data = {
        ...taskFormData,
        estimated_hours: taskFormData.estimated_hours ? Number(taskFormData.estimated_hours) : undefined,
        assigned_to: taskFormData.assigned_to || undefined
      };
      await updateTask(selectedTask.id, data);
      toast.success('Task updated successfully');
      setIsEditTaskOpen(false);
      fetchAnalytics();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this task?')) {
      try {
        await deleteTask(id);
        toast.success('Task deleted');
        fetchAnalytics();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete task');
      }
    }
  };

  const handleOpenTaskDetail = async (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
    fetchTaskComments(task.id);
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !selectedMemberId) return;
    try {
      await addProjectMember(projectId, selectedMemberId, memberRole);
      toast.success('Member added successfully');
      setIsAddMemberOpen(false);
      setSelectedMemberId('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!projectId) return;
    if (window.confirm('Remove this member from the project?')) {
      try {
        await removeProjectMember(projectId, userId);
        toast.success('Member removed');
      } catch (err: any) {
        toast.error(err.message || 'Failed to remove member');
      }
    }
  };

  // AI Description Generator helper
  const handleAIDescription = async () => {
    if (!taskFormData.title.trim()) {
      toast.error('Please enter a task title first');
      return;
    }
    setAiLoading(true);
    try {
      const result = await generateAIDescription(taskFormData.title, taskFormData.description);
      setTaskFormData(prev => ({ ...prev, description: result }));
      toast.success('AI description generated!');
    } catch (err: any) {
      toast.error(err.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  // AI Project Summary helper
  const handleAIProjectSummary = async () => {
    if (!projectId || !currentProject) return;
    setAiLoading(true);
    try {
      const result = await generateAIProjectSummary(projectId, currentProject.name);
      setAiSummary(result);
      toast.success('AI summary generated!');
    } catch (err: any) {
      toast.error(err.message || 'AI summary failed');
    } finally {
      setAiLoading(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id) {
      const taskId = String(active.id);
      const targetStatus = over.id as TaskStatus;
      const currentTaskObj = tasks.find((t) => t.id === taskId);
      if (currentTaskObj && currentTaskObj.status !== targetStatus) {
        moveTaskStatus(taskId, targetStatus);
        toast.success(`Task moved to ${getStatusLabel(targetStatus)}`);
      }
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || t.assigned_to === assigneeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 'To Do';
      case TaskStatus.IN_PROGRESS: return 'In Progress';
      case TaskStatus.IN_REVIEW: return 'In Review';
      case TaskStatus.BLOCKED: return 'Blocked';
      case TaskStatus.DONE: return 'Done';
    }
  };

  const canManageProject = user?.role === UserRole.ADMIN || user?.role === UserRole.PROJECT_MANAGER;

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
        <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading project details...</p>
      </div>
    );
  }

  // Pre-calculate task metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Back to Projects */}
      <div className="flex items-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <Link to="/projects" className="hover:text-primary-500 transition-colors">Projects</Link>
        <ChevronRight size={12} className="mx-1" />
        <span className="font-semibold text-surface-400">{currentProject.name}</span>
      </div>

      {/* Project Meta Info */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{currentProject.name}</h1>
            <Badge variant={getStatusVariant(currentProject.status)}>{currentProject.status.toLowerCase()}</Badge>
            <Badge variant={getPriorityVariant(currentProject.priority)}>{currentProject.priority.toLowerCase()}</Badge>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {currentProject.description || 'No project description added yet.'}
          </p>
        </div>

        {/* Progress Card */}
        <div className="w-full lg:w-72 space-y-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex justify-between items-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            <span>Tasks Completion</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-surface-200 dark:bg-surface-800">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>{completedTasks} / {totalTasks} Tasks Completed</span>
            <span>{currentProject.deadline ? `Deadline: ${new Date(currentProject.deadline).toLocaleDateString()}` : 'No deadline'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('board')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-medium transition-colors ${
            activeTab === 'board' ? 'border-primary-500 text-primary-500' : 'border-transparent text-surface-400 hover:text-white'
          }`}
        >
          <LayoutGrid size={16} /> Kanban Board
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-medium transition-colors ${
            activeTab === 'list' ? 'border-primary-500 text-primary-500' : 'border-transparent text-surface-400 hover:text-white'
          }`}
        >
          <List size={16} /> Tasks List
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-medium transition-colors ${
            activeTab === 'members' ? 'border-primary-500 text-primary-500' : 'border-transparent text-surface-400 hover:text-white'
          }`}
        >
          <Users size={16} /> Members ({projectMembers.length})
        </button>
        <button
          onClick={() => { setActiveTab('analytics'); fetchAnalytics(); }}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-medium transition-colors ${
            activeTab === 'analytics' ? 'border-primary-500 text-primary-500' : 'border-transparent text-surface-400 hover:text-white'
          }`}
        >
          <BarChart3 size={16} /> Analytics
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-medium transition-colors ${
            activeTab === 'ai' ? 'border-primary-500 text-primary-500' : 'border-transparent text-surface-400 hover:text-white'
          }`}
        >
          <Sparkles size={16} /> AI Standup
        </button>
      </div>

      {/* Dynamic Tab Contents */}

      {/* 1. KANBAN BOARD */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="pl-9 pr-3 py-1.5 border rounded-lg text-xs bg-transparent outline-none focus:border-primary-500"
                  style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="py-1.5 px-3 border rounded-lg text-xs bg-transparent outline-none cursor-pointer"
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
              <select
                className="py-1.5 px-3 border rounded-lg text-xs bg-transparent outline-none cursor-pointer"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
              >
                <option value="all" style={{ backgroundColor: 'var(--bg-primary)' }}>All Assignees</option>
                {projectMembers.map((m) => (
                  <option key={m.user_id} value={m.user_id} style={{ backgroundColor: 'var(--bg-primary)' }}>
                    {m.first_name} {m.last_name}
                  </option>
                ))}
              </select>
            </div>
            {canManageProject && (
              <Button size="sm" onClick={handleOpenCreateTask}>
                <Plus size={16} /> Add Task
              </Button>
            )}
          </div>

          {/* Kanban Columns */}
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto pb-4 scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start min-w-[1100px]">
              {[TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW, TaskStatus.BLOCKED, TaskStatus.DONE].map((status) => {
                const columnTasks = filteredTasks.filter(t => t.status === status);

                return (
                  <KanbanColumnContainer key={status} status={status} label={getStatusLabel(status)} count={columnTasks.length}>
                    {columnTasks.length === 0 ? (
                      <div className="text-center py-8 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        No tasks
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <KanbanCardItem
                          key={task.id}
                          task={task}
                          status={status}
                          onTaskClick={handleOpenTaskDetail}
                          moveTaskStatus={moveTaskStatus}
                        />
                      ))
                    )}
                  </KanbanColumnContainer>
                );
              })}
            </div>
          </div>
        </DndContext>

        </div>
      )}

      {/* 2. DETAILED LIST VIEW */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Header & filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="pl-9 pr-3 py-1.5 border rounded-lg text-xs bg-transparent outline-none focus:border-primary-500"
                  style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="py-1.5 px-3 border rounded-lg text-xs bg-transparent outline-none cursor-pointer"
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
              <select
                className="py-1.5 px-3 border rounded-lg text-xs bg-transparent outline-none cursor-pointer"
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
            {canManageProject && (
              <Button size="sm" onClick={handleOpenCreateTask}>
                <Plus size={16} /> Add Task
              </Button>
            )}
          </div>

          {/* List Table/Row Cards */}
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <EmptyState icon={<List size={48} />} title="No tasks found" description="Try adjusting search queries." />
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleOpenTaskDetail(task)}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border hover:border-surface-400 dark:hover:border-surface-700 transition-all duration-200 cursor-pointer gap-4"
                  style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-center gap-3">
                    {task.status === TaskStatus.DONE ? (
                      <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full border border-dashed shrink-0" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{task.title}</h4>
                      <p className="text-xs line-clamp-1" style={{ color: 'var(--text-tertiary)' }}>{task.description || 'No description'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <Badge variant={getPriorityVariant(task.priority)}>{task.priority.toLowerCase()}</Badge>
                    <Badge variant={getStatusVariant(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                    <div className="flex items-center gap-1 font-medium">
                      <Clock size={12} />
                      <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.assignee ? (
                        <div className="px-2 py-1 rounded bg-surface-100 dark:bg-surface-800 text-[10px] font-bold">
                          Assigned: {task.assignee.first_name}
                        </div>
                      ) : (
                        <div className="px-2 py-1 rounded bg-surface-100 dark:bg-surface-800 text-[10px] text-surface-400">
                          Unassigned
                        </div>
                      )}
                    </div>

                    {canManageProject && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleOpenEditTask(task, e)}
                          className="p-1 hover:text-primary-500 rounded-md"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTask(task.id, e)}
                          className="p-1 hover:text-red-500 rounded-md"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. MEMBERS MANAGEMENT */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Project Members</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Manage developer access roles.</p>
            </div>
            {canManageProject && (
              <Button size="sm" onClick={() => setIsAddMemberOpen(true)}>
                <Plus size={16} /> Add Member
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectMembers.map((member) => (
              <Card
                key={member.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold text-white uppercase">
                    {member.first_name[0]}{member.last_name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {member.first_name} {member.last_name}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{member.email}</p>
                    <div className="mt-1">
                      <Badge variant={member.role === UserRole.ADMIN ? 'danger' : member.role === UserRole.PROJECT_MANAGER ? 'warning' : 'info'}>
                        {member.role.replace('_', ' ').toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {canManageProject && member.user_id !== user?.id && (
                  <button
                    onClick={() => handleRemoveMember(member.user_id)}
                    className="p-1.5 text-surface-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Remove Member"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 4. ANALYTICS TABS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analytics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Status distribution */}
              <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Tasks by Status</h3>
                <div className="h-64 flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.tasksByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                        label={(props: any) => `${getStatusLabel(props.status)}: ${props.count}`}
                      >
                        {analytics.tasksByStatus.map((_: any, index: number) => {
                          const colors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar distribution by Dev */}
              <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Developer Workload</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.tasksByDeveloper}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" name="Total Assigned" radius={[4, 4, 0, 0]}>
                        {analytics.tasksByDeveloper.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill="#3b82f6" />
                        ))}
                      </Bar>
                      <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
              No analytics data compiled yet. Create and assign tasks to see statistics!
            </div>
          )}
        </div>
      )}

      {/* 5. AI STANDUP ASSISTANT */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AI Standup Assistant</h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Generate an intelligent daily sprint status report based on current project board state.</p>
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={handleAIProjectSummary} isLoading={aiLoading} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none">
                <Sparkles size={16} /> Generate Sprint Standup Summary
              </Button>
            </div>

            {aiSummary && (
              <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/[0.02] text-sm whitespace-pre-wrap leading-relaxed animate-fade-in" style={{ color: 'var(--text-primary)' }}>
                {aiSummary}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      <Modal isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} title="Create Task">
        <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Implement User Authentication"
            value={taskFormData.title}
            onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
            required
          />

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Description</label>
              <button
                type="button"
                onClick={handleAIDescription}
                disabled={aiLoading}
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold disabled:opacity-50"
              >
                <Sparkles size={12} /> Generate Description
              </button>
            </div>
            <textarea
              className="w-full p-3 border rounded-xl text-sm bg-transparent outline-none focus:border-primary-500 transition-colors min-h-[100px]"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              placeholder="Describe the task criteria, dependencies, or edge cases..."
              value={taskFormData.description}
              onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <select
                className="w-full p-2.5 border rounded-xl text-sm bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                value={taskFormData.status}
                onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value as TaskStatus })}
              >
                <option value={TaskStatus.TODO}>To Do</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.IN_REVIEW}>In Review</option>
                <option value={TaskStatus.BLOCKED}>Blocked</option>
                <option value={TaskStatus.DONE}>Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Priority</label>
              <select
                className="w-full p-2.5 border rounded-xl text-sm bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                value={taskFormData.priority}
                onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as TaskPriority })}
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.CRITICAL}>Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Assign Dev</label>
              <select
                className="w-full p-2.5 border rounded-xl text-sm bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                value={taskFormData.assigned_to}
                onChange={(e) => setTaskFormData({ ...taskFormData, assigned_to: e.target.value })}
              >
                <option value="">Unassigned</option>
                {projectMembers.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.first_name} {m.last_name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Estimate (Hours)"
              type="number"
              placeholder="e.g. 8"
              value={taskFormData.estimated_hours}
              onChange={(e) => setTaskFormData({ ...taskFormData, estimated_hours: e.target.value })}
            />
          </div>

          <Input
            label="Due Date"
            type="date"
            value={taskFormData.due_date}
            onChange={(e) => setTaskFormData({ ...taskFormData, due_date: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <Button variant="outline" type="button" onClick={() => setIsCreateTaskOpen(false)}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>

      {/* EDIT TASK MODAL */}
      <Modal isOpen={isEditTaskOpen} onClose={() => setIsEditTaskOpen(false)} title="Edit Task">
        <form onSubmit={handleEditTaskSubmit} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Implement User Authentication"
            value={taskFormData.title}
            onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              className="w-full p-3 border rounded-xl text-sm bg-transparent outline-none focus:border-primary-500 transition-colors min-h-[100px]"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              placeholder="Provide clear descriptions..."
              value={taskFormData.description}
              onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <select
                className="w-full p-2.5 border rounded-xl text-sm bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                value={taskFormData.status}
                onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value as TaskStatus })}
              >
                <option value={TaskStatus.TODO}>To Do</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.IN_REVIEW}>In Review</option>
                <option value={TaskStatus.BLOCKED}>Blocked</option>
                <option value={TaskStatus.DONE}>Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Priority</label>
              <select
                className="w-full p-2.5 border rounded-xl text-sm bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                value={taskFormData.priority}
                onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as TaskPriority })}
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.CRITICAL}>Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Assign Dev</label>
              <select
                className="w-full p-2.5 border rounded-xl text-sm bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                value={taskFormData.assigned_to}
                onChange={(e) => setTaskFormData({ ...taskFormData, assigned_to: e.target.value })}
              >
                <option value="">Unassigned</option>
                {projectMembers.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.first_name} {m.last_name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Estimate (Hours)"
              type="number"
              value={taskFormData.estimated_hours}
              onChange={(e) => setTaskFormData({ ...taskFormData, estimated_hours: e.target.value })}
            />
          </div>

          <Input
            label="Due Date"
            type="date"
            value={taskFormData.due_date}
            onChange={(e) => setTaskFormData({ ...taskFormData, due_date: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <Button variant="outline" type="button" onClick={() => setIsEditTaskOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* TASK DETAIL & COMMENT MODAL */}
      <Modal isOpen={isTaskDetailOpen} onClose={() => setIsTaskDetailOpen(false)} title={selectedTask?.title || 'Task Details'}>
        {selectedTask && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-xs border-b pb-4" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
              <div>
                <span className="font-semibold block uppercase">Status</span>
                <span className="mt-1 block text-white font-bold">{getStatusLabel(selectedTask.status)}</span>
              </div>
              <div>
                <span className="font-semibold block uppercase">Priority</span>
                <div className="mt-1">
                  <Badge variant={getPriorityVariant(selectedTask.priority)}>{selectedTask.priority.toLowerCase()}</Badge>
                </div>
              </div>
              <div>
                <span className="font-semibold block uppercase">Assignee</span>
                <span className="mt-1 block text-white font-bold">
                  {selectedTask.assignee ? `${selectedTask.assignee.first_name} ${selectedTask.assignee.last_name}` : 'Unassigned'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Description</h4>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {selectedTask.description || 'No description provided.'}
              </p>
            </div>

            {/* Task comments */}
            <div className="space-y-4 border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
              <h4 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <MessageSquare size={16} /> Comments ({comments.length})
              </h4>
              
              {/* Comments Feed */}
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No comments yet. Start the conversation!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-3 rounded-xl border flex flex-col space-y-1.5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">
                          {comment.first_name} {comment.last_name}
                        </span>
                        <span style={{ color: 'var(--text-tertiary)' }}>{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{comment.content}</p>
                      
                      {(comment.user_id === user?.id || user?.role === UserRole.ADMIN) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-[10px] text-red-500 hover:underline self-end"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="flex-1 py-2 px-3 border rounded-xl text-xs bg-transparent outline-none focus:border-primary-500"
                  style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                />
                <Button size="sm" type="submit">Send</Button>
              </form>
            </div>

            <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <Button variant="outline" onClick={() => setIsTaskDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ADD MEMBER MODAL */}
      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Add Team Member">
        <form onSubmit={handleAddMemberSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Select Developer</label>
            <select
              className="w-full p-2.5 border rounded-xl text-sm bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              required
            >
              <option value="">Choose User...</option>
              {availableUsers
                .filter(u => !projectMembers.some(m => m.user_id === u.id)) // Hide users already in project
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name} {u.last_name} ({u.email})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Project Role</label>
            <select
              className="w-full p-2.5 border rounded-xl text-sm bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
            >
              <option value="DEVELOPER">Developer</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <Button variant="outline" type="button" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
            <Button type="submit">Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetailsPage;
