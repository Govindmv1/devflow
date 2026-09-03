/**
 * Shared TypeScript types for the DevFlow frontend.
 * Mirrors backend types but without server-side fields like password_hash.
 */

// ============ ENUMS ============

export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  DEVELOPER = 'DEVELOPER',
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  BLOCKED = 'BLOCKED',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  PROJECT_ADDED = 'PROJECT_ADDED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  TASK_OVERDUE = 'TASK_OVERDUE',
}

// ============ DATA MODELS ============

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string;
  deadline?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  task_count?: number;
  completed_task_count?: number;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  user?: User;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  assigned_to?: string;
  created_by: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  estimated_hours?: number;
  created_at: string;
  updated_at: string;
  assignee?: User;
  creator?: User;
  project?: Project;
  tags?: Tag[];
  comment_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface ActivityLog {
  id: string;
  project_id: string;
  task_id?: string;
  user_id: string;
  action: string;
  details?: Record<string, unknown>;
  created_at: string;
  user?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

// ============ API TYPES ============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ============ DASHBOARD TYPES ============

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  myTasks: number;
}

export interface ProjectAnalytics {
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  tasksByDeveloper: { name: string; count: number; completed: number }[];
  completionOverTime: { date: string; completed: number }[];
  completionRate: number;
  overdueCount: number;
  avgCompletionHours: number;
}
