import { create } from 'zustand';
import api from '../lib/api';
import { Task, TaskStatus, TaskPriority, Comment, DashboardStats } from '../types';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  comments: Comment[];
  dashboardStats: DashboardStats | null;
  recentActivity: any[];
  notifications: any[];
  unreadNotificationsCount: number;
  isLoading: boolean;
  error: string | null;

  fetchProjectTasks: (projectId: string, filters?: { status?: TaskStatus; priority?: TaskPriority; assignee?: string; search?: string }) => Promise<void>;
  fetchUserTasks: (filters?: { status?: TaskStatus; priority?: TaskPriority; search?: string }) => Promise<void>;
  fetchTaskById: (id: string) => Promise<Task>;
  createTask: (projectId: string, taskData: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  
  // Kanban Drag and Drop Status Change
  moveTaskStatus: (id: string, newStatus: TaskStatus) => Promise<void>;

  // Comments
  fetchComments: (taskId: string) => Promise<void>;
  addComment: (taskId: string, content: string) => Promise<Comment>;
  deleteComment: (commentId: string) => Promise<void>;

  // Dashboard & Analytics
  fetchDashboardStats: () => Promise<void>;
  fetchProjectAnalytics: (projectId: string) => Promise<any>;

  // Notifications
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

  // AI Assistant Integrations
  generateAIDescription: (title: string, context?: string) => Promise<string>;
  generateAISubtasks: (title: string, description?: string) => Promise<string[]>;
  generateAIProjectSummary: (projectId: string, projectName: string) => Promise<string>;

  clearCurrentTask: () => void;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTask: null,
  comments: [],
  dashboardStats: null,
  recentActivity: [],
  notifications: [],
  unreadNotificationsCount: 0,
  isLoading: false,
  error: null,

  fetchProjectTasks: async (projectId, filters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/projects/${projectId}/tasks`, { params: filters });
      set({ tasks: response.data.data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch tasks', isLoading: false });
    }
  },

  fetchUserTasks: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/tasks/my', { params: filters });
      set({ tasks: response.data.data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch user tasks', isLoading: false });
    }
  },

  fetchTaskById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/tasks/${id}`);
      const task = response.data.data;
      set({ currentTask: task, isLoading: false });
      return task;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch task';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  createTask: async (projectId, taskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/projects/${projectId}/tasks`, taskData);
      const newTask = response.data.data;
      set((state) => ({
        tasks: [newTask, ...state.tasks],
        isLoading: false
      }));
      return newTask;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to create task';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  updateTask: async (id, taskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/tasks/${id}`, taskData);
      const updatedTask = response.data.data;
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updatedTask } : t)),
        currentTask: state.currentTask?.id === id ? { ...state.currentTask, ...updatedTask } : state.currentTask,
        isLoading: false
      }));
      return updatedTask;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to update task';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/tasks/${id}`);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
        isLoading: false
      }));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to delete task';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  moveTaskStatus: async (id, newStatus) => {
    // Optimistic update
    const previousTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    }));

    try {
      await api.patch(`/tasks/${id}`, { status: newStatus });
    } catch (err: any) {
      // Revert on failure
      set({ tasks: previousTasks, error: err.response?.data?.error || 'Failed to move task status' });
    }
  },

  fetchComments: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}/comments`);
      set({ comments: response.data.data || [] });
    } catch (err: any) {
      console.error('Failed to fetch comments', err);
    }
  },

  addComment: async (taskId, content) => {
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { content });
      const newComment = response.data.data;
      set((state) => ({
        comments: [...state.comments, newComment]
      }));
      return newComment;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to add comment';
      throw new Error(errorMsg);
    }
  },

  deleteComment: async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      set((state) => ({
        comments: state.comments.filter((c) => c.id !== commentId)
      }));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to delete comment';
      throw new Error(errorMsg);
    }
  },

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/tasks/dashboard/stats');
      const data = response.data.data;
      set({
        dashboardStats: {
          totalProjects: data.totalProjects,
          activeProjects: data.activeProjects,
          completedProjects: data.completedProjects,
          totalTasks: data.totalTasks,
          completedTasks: data.completedTasks,
          pendingTasks: data.pendingTasks,
          overdueTasks: data.overdueTasks,
          myTasks: data.myTasks,
        },
        recentActivity: data.recentActivity || [],
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch dashboard stats', isLoading: false });
    }
  },

  fetchProjectAnalytics: async (projectId) => {
    try {
      const response = await api.get(`/analytics/projects/${projectId}`);
      return response.data.data;
    } catch (err: any) {
      console.error('Failed to fetch project analytics', err);
      return null;
    }
  },

  fetchNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      const { notifications, unreadCount } = response.data.data;
      set({ notifications: notifications || [], unreadNotificationsCount: unreadCount || 0 });
    } catch (err: any) {
      console.error('Failed to fetch notifications', err);
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        unreadNotificationsCount: Math.max(0, state.unreadNotificationsCount - 1)
      }));
    } catch (err: any) {
      console.error('Failed to mark notification as read', err);
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadNotificationsCount: 0
      }));
    } catch (err: any) {
      console.error('Failed to mark all notifications as read', err);
    }
  },

  generateAIDescription: async (title, context) => {
    try {
      const response = await api.post('/ai/task-description', { title, context });
      return response.data.data.description;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to generate AI description');
    }
  },

  generateAISubtasks: async (title, description) => {
    try {
      const response = await api.post('/ai/subtasks', { title, description });
      return response.data.data.subtasks;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to generate AI subtasks');
    }
  },

  generateAIProjectSummary: async (projectId, projectName) => {
    try {
      const response = await api.post('/ai/project-summary', { projectId, projectName });
      return response.data.data.summary;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to generate project summary');
    }
  },

  clearCurrentTask: () => set({ currentTask: null, comments: [] }),
  clearError: () => set({ error: null })
}));
