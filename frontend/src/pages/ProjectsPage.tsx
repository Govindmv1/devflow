import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import { Project, ProjectStatus, ProjectPriority, UserRole } from '../types';
import {
  Plus,
  Search,
  Calendar,
  Users,
  Edit2,
  Trash2,
  Briefcase
} from 'lucide-react';
import { Button, Input, Card, Modal, Badge, EmptyState } from '../components/ui';
import { getPriorityVariant } from '../components/ui/Badge';
import toast from 'react-hot-toast';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, fetchProjects, createProject, updateProject, deleteProject, isLoading } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: ProjectStatus.PLANNING,
    priority: ProjectPriority.MEDIUM,
    start_date: '',
    deadline: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      status: ProjectStatus.PLANNING,
      priority: ProjectPriority.MEDIUM,
      start_date: '',
      deadline: '',
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Project name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createProject(formData);
      toast.success('Project created successfully!');
      setIsCreateOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedProject) return;
    try {
      await updateProject(selectedProject.id, formData);
      toast.success('Project updated successfully!');
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update project');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? All associated tasks, comments, and members will be lost.')) {
      try {
        await deleteProject(id);
        toast.success('Project deleted successfully!');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete project');
      }
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || p.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Check role to add project
  const canManageProjects = user?.role === UserRole.ADMIN || user?.role === UserRole.PROJECT_MANAGER;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Projects</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your team's development workspaces.</p>
        </div>
        {canManageProjects && (
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
            <Plus size={18} /> Create Project
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <div className="md:col-span-2 relative">
          <Search size={18} className="absolute left-3 top-3 text-surface-400" />
          <input
            type="text"
            placeholder="Search projects..."
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
            <option value={ProjectStatus.PLANNING} style={{ backgroundColor: 'var(--bg-primary)' }}>Planning</option>
            <option value={ProjectStatus.ACTIVE} style={{ backgroundColor: 'var(--bg-primary)' }}>Active</option>
            <option value={ProjectStatus.ON_HOLD} style={{ backgroundColor: 'var(--bg-primary)' }}>On Hold</option>
            <option value={ProjectStatus.COMPLETED} style={{ backgroundColor: 'var(--bg-primary)' }}>Completed</option>
            <option value={ProjectStatus.ARCHIVED} style={{ backgroundColor: 'var(--bg-primary)' }}>Archived</option>
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
            <option value={ProjectPriority.LOW} style={{ backgroundColor: 'var(--bg-primary)' }}>Low</option>
            <option value={ProjectPriority.MEDIUM} style={{ backgroundColor: 'var(--bg-primary)' }}>Medium</option>
            <option value={ProjectPriority.HIGH} style={{ backgroundColor: 'var(--bg-primary)' }}>High</option>
            <option value={ProjectPriority.CRITICAL} style={{ backgroundColor: 'var(--bg-primary)' }}>Critical</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading && projects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse h-48">
              <div />
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={48} />}
          title="No projects found"
          description={searchTerm ? "Try adjusting your search or filters." : "Create your first project to get started!"}
          action={canManageProjects ? <Button onClick={handleOpenCreate}><Plus size={16} /> Create Project</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const totalTasks = project.task_count || 0;
            const completedTasks = project.completed_task_count || 0;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <Card
                key={project.id}
                className="group relative flex flex-col justify-between hover:shadow-lg hover:border-surface-400 dark:hover:border-surface-700 transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/projects/${project.id}/tasks`)}
              >
                {/* Visual Gradient Border Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-4">
                  {/* Title & Actions */}
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold line-clamp-1 group-hover:text-primary-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityVariant(project.priority)}>
                        {project.priority.toLowerCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      <span>Progress</span>
                      <span>{progress}% ({completedTasks}/{totalTasks} tasks)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-surface-200 dark:bg-surface-800">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{project.member_count || 1}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No date'}</span>
                    </div>
                  </div>

                  {canManageProjects && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenEdit(project, e)}
                        className="p-1 hover:text-primary-500 rounded-md transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="p-1 hover:text-red-500 rounded-md transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Mobile App Redesign"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              className="w-full p-3 border rounded-xl text-sm bg-transparent outline-none focus:border-primary-500 transition-colors min-h-[100px]"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              placeholder="Provide a detailed overview of the project objectives..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Priority</label>
              <select
                className="w-full p-2.5 border rounded-xl text-sm bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectPriority })}
              >
                <option value={ProjectPriority.LOW}>Low</option>
                <option value={ProjectPriority.MEDIUM}>Medium</option>
                <option value={ProjectPriority.HIGH}>High</option>
                <option value={ProjectPriority.CRITICAL}>Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <select
                className="w-full p-2.5 border rounded-xl text-sm bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              >
                <option value={ProjectStatus.PLANNING}>Planning</option>
                <option value={ProjectStatus.ACTIVE}>Active</option>
                <option value={ProjectStatus.ON_HOLD}>On Hold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
            <Input
              label="Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Create Project</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Project">
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Mobile App Redesign"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              className="w-full p-3 border rounded-xl text-sm bg-transparent outline-none focus:border-primary-500 transition-colors min-h-[100px]"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              placeholder="Provide a detailed overview of the project objectives..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Priority</label>
              <select
                className="w-full p-2.5 border rounded-xl text-sm bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectPriority })}
              >
                <option value={ProjectPriority.LOW}>Low</option>
                <option value={ProjectPriority.MEDIUM}>Medium</option>
                <option value={ProjectPriority.HIGH}>High</option>
                <option value={ProjectPriority.CRITICAL}>Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <select
                className="w-full p-2.5 border rounded-xl text-sm bg-transparent outline-none cursor-pointer focus:border-primary-500 transition-colors"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              >
                <option value={ProjectStatus.PLANNING}>Planning</option>
                <option value={ProjectStatus.ACTIVE}>Active</option>
                <option value={ProjectStatus.ON_HOLD}>On Hold</option>
                <option value={ProjectStatus.COMPLETED}>Completed</option>
                <option value={ProjectStatus.ARCHIVED}>Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
            <Input
              label="Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
