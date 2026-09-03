import { create } from 'zustand';
import api from '../lib/api';
import { Project, ProjectStatus, ProjectPriority } from '../types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  projectMembers: any[];
  isLoading: boolean;
  error: string | null;
  
  fetchProjects: (filters?: { status?: ProjectStatus; priority?: ProjectPriority }) => Promise<void>;
  fetchProjectById: (id: string) => Promise<Project>;
  createProject: (projectData: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  
  fetchProjectMembers: (projectId: string) => Promise<void>;
  addProjectMember: (projectId: string, userId: string, role?: string) => Promise<void>;
  removeProjectMember: (projectId: string, userId: string) => Promise<void>;
  fetchProjectActivity: (projectId: string) => Promise<any[]>;
  
  clearCurrentProject: () => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  projectMembers: [],
  isLoading: false,
  error: null,

  fetchProjects: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/projects', { params: filters });
      set({ projects: response.data.data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch projects', isLoading: false });
    }
  },

  fetchProjectById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/projects/${id}`);
      const project = response.data.data;
      set({ currentProject: project, isLoading: false });
      return project;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch project';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/projects', projectData);
      const newProject = response.data.data;
      set((state) => ({
        projects: [newProject, ...state.projects],
        isLoading: false
      }));
      return newProject;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to create project';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  updateProject: async (id, projectData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/projects/${id}`, projectData);
      const updatedProject = response.data.data;
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
        currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
        isLoading: false
      }));
      return updatedProject;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to update project';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/projects/${id}`);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false
      }));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to delete project';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  fetchProjectMembers: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/projects/${projectId}/members`);
      set({ projectMembers: response.data.data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch members', isLoading: false });
    }
  },

  addProjectMember: async (projectId, userId, role) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/projects/${projectId}/members`, { userId, role });
      await get().fetchProjectMembers(projectId);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to add project member';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  removeProjectMember: async (projectId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      set((state) => ({
        projectMembers: state.projectMembers.filter((m) => m.user_id !== userId),
        isLoading: false
      }));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to remove project member';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  fetchProjectActivity: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/activity`);
      return response.data.data || [];
    } catch (err: any) {
      console.error('Failed to fetch project activity', err);
      return [];
    }
  },

  clearCurrentProject: () => set({ currentProject: null, projectMembers: [] }),
  clearError: () => set({ error: null })
}));
