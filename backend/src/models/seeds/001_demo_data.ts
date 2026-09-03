import { Knex } from 'knex';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

/**
 * Seed: Creates demo users, projects, tasks, and sample data.
 * Passwords are properly hashed using bcrypt.
 */
export async function seed(knex: Knex): Promise<void> {
  // Clear existing data (order matters due to foreign keys)
  await knex('notifications').del();
  await knex('activity_logs').del();
  await knex('comments').del();
  await knex('task_tags').del();
  await knex('tags').del();
  await knex('tasks').del();
  await knex('project_members').del();
  await knex('projects').del();
  await knex('refresh_tokens').del();
  await knex('users').del();

  const salt = await bcrypt.genSalt(12);

  // ============ USERS ============
  const adminId = uuid();
  const pmId = uuid();
  const dev1Id = uuid();
  const dev2Id = uuid();
  const dev3Id = uuid();

  await knex('users').insert([
    { id: adminId, email: 'admin@devflow.com', password_hash: await bcrypt.hash('Admin123!', salt), first_name: 'Alex', last_name: 'Admin', role: 'ADMIN' },
    { id: pmId, email: 'pm@devflow.com', password_hash: await bcrypt.hash('Manager123!', salt), first_name: 'Patricia', last_name: 'Manager', role: 'PROJECT_MANAGER' },
    { id: dev1Id, email: 'dev@devflow.com', password_hash: await bcrypt.hash('Developer123!', salt), first_name: 'David', last_name: 'Developer', role: 'DEVELOPER' },
    { id: dev2Id, email: 'sarah@devflow.com', password_hash: await bcrypt.hash('Developer123!', salt), first_name: 'Sarah', last_name: 'Chen', role: 'DEVELOPER' },
    { id: dev3Id, email: 'mike@devflow.com', password_hash: await bcrypt.hash('Developer123!', salt), first_name: 'Mike', last_name: 'Johnson', role: 'DEVELOPER' },
  ]);

  // ============ PROJECTS ============
  const proj1Id = uuid();
  const proj2Id = uuid();
  const proj3Id = uuid();

  await knex('projects').insert([
    { id: proj1Id, name: 'DevFlow Platform', description: 'Building the DevFlow project management platform with AI features.', status: 'ACTIVE', priority: 'HIGH', start_date: '2024-01-15', deadline: '2024-06-30', created_by: pmId },
    { id: proj2Id, name: 'Mobile App Redesign', description: 'Complete redesign of the mobile application with new UI/UX.', status: 'PLANNING', priority: 'MEDIUM', start_date: '2024-03-01', deadline: '2024-09-30', created_by: pmId },
    { id: proj3Id, name: 'API Gateway Migration', description: 'Migrating from monolith to microservices API gateway architecture.', status: 'ACTIVE', priority: 'CRITICAL', start_date: '2024-02-01', deadline: '2024-05-31', created_by: adminId },
  ]);

  // ============ PROJECT MEMBERS ============
  await knex('project_members').insert([
    { id: uuid(), project_id: proj1Id, user_id: pmId, role: 'PROJECT_MANAGER' },
    { id: uuid(), project_id: proj1Id, user_id: dev1Id, role: 'DEVELOPER' },
    { id: uuid(), project_id: proj1Id, user_id: dev2Id, role: 'DEVELOPER' },
    { id: uuid(), project_id: proj2Id, user_id: pmId, role: 'PROJECT_MANAGER' },
    { id: uuid(), project_id: proj2Id, user_id: dev3Id, role: 'DEVELOPER' },
    { id: uuid(), project_id: proj3Id, user_id: adminId, role: 'ADMIN' },
    { id: uuid(), project_id: proj3Id, user_id: dev1Id, role: 'DEVELOPER' },
    { id: uuid(), project_id: proj3Id, user_id: dev3Id, role: 'DEVELOPER' },
  ]);

  // ============ TAGS ============
  const tagBugId = uuid(), tagFeatureId = uuid(), tagUiId = uuid(), tagApiId = uuid(), tagDbId = uuid();
  await knex('tags').insert([
    { id: tagBugId, name: 'bug', color: '#ef4444' },
    { id: tagFeatureId, name: 'feature', color: '#3b82f6' },
    { id: tagUiId, name: 'ui', color: '#8b5cf6' },
    { id: tagApiId, name: 'api', color: '#10b981' },
    { id: tagDbId, name: 'database', color: '#f59e0b' },
  ]);

  // ============ TASKS ============
  const tasks = [
    { id: uuid(), title: 'Setup project architecture', project_id: proj1Id, assigned_to: dev1Id, created_by: pmId, priority: 'HIGH', status: 'DONE', due_date: '2024-02-01', estimated_hours: 8 },
    { id: uuid(), title: 'Design database schema', project_id: proj1Id, assigned_to: dev1Id, created_by: pmId, priority: 'HIGH', status: 'DONE', due_date: '2024-02-15', estimated_hours: 12 },
    { id: uuid(), title: 'Implement authentication', project_id: proj1Id, assigned_to: dev2Id, created_by: pmId, priority: 'CRITICAL', status: 'IN_PROGRESS', due_date: '2024-03-01', estimated_hours: 20 },
    { id: uuid(), title: 'Build Kanban board', project_id: proj1Id, assigned_to: dev1Id, created_by: pmId, priority: 'HIGH', status: 'TODO', due_date: '2024-04-15', estimated_hours: 24 },
    { id: uuid(), title: 'Add AI task suggestions', project_id: proj1Id, assigned_to: dev2Id, created_by: pmId, priority: 'MEDIUM', status: 'TODO', due_date: '2024-05-01', estimated_hours: 16 },
    { id: uuid(), title: 'Create analytics dashboard', project_id: proj1Id, assigned_to: null, created_by: pmId, priority: 'MEDIUM', status: 'TODO', due_date: '2024-05-15', estimated_hours: 20 },
    { id: uuid(), title: 'Fix login redirect bug', project_id: proj1Id, assigned_to: dev1Id, created_by: dev2Id, priority: 'HIGH', status: 'IN_REVIEW', due_date: '2024-03-10', estimated_hours: 3 },
    { id: uuid(), title: 'User research for mobile app', project_id: proj2Id, assigned_to: dev3Id, created_by: pmId, priority: 'HIGH', status: 'IN_PROGRESS', due_date: '2024-04-01', estimated_hours: 40 },
    { id: uuid(), title: 'Wireframe new navigation', project_id: proj2Id, assigned_to: dev3Id, created_by: pmId, priority: 'MEDIUM', status: 'TODO', due_date: '2024-04-15', estimated_hours: 16 },
    { id: uuid(), title: 'Setup API gateway infrastructure', project_id: proj3Id, assigned_to: dev1Id, created_by: adminId, priority: 'CRITICAL', status: 'IN_PROGRESS', due_date: '2024-03-15', estimated_hours: 32 },
    { id: uuid(), title: 'Migrate user service', project_id: proj3Id, assigned_to: dev3Id, created_by: adminId, priority: 'HIGH', status: 'BLOCKED', due_date: '2024-04-01', estimated_hours: 24 },
    { id: uuid(), title: 'Write API documentation', project_id: proj3Id, assigned_to: dev1Id, created_by: adminId, priority: 'LOW', status: 'TODO', due_date: '2024-05-01', estimated_hours: 8 },
  ];
  await knex('tasks').insert(tasks);

  // ============ COMMENTS ============
  await knex('comments').insert([
    { id: uuid(), task_id: tasks[2].id, user_id: dev2Id, content: 'Started working on JWT implementation. Using bcrypt for password hashing.' },
    { id: uuid(), task_id: tasks[2].id, user_id: pmId, content: 'Make sure to implement refresh token rotation as well.' },
    { id: uuid(), task_id: tasks[6].id, user_id: dev1Id, content: 'Found the issue - the redirect URL was not being preserved across the auth flow.' },
    { id: uuid(), task_id: tasks[9].id, user_id: dev1Id, content: 'Infrastructure setup is 60% complete. Working on load balancer configuration.' },
  ]);

  // ============ ACTIVITY LOGS ============
  await knex('activity_logs').insert([
    { id: uuid(), project_id: proj1Id, user_id: pmId, action: 'PROJECT_CREATED', details: JSON.stringify({ name: 'DevFlow Platform' }) },
    { id: uuid(), project_id: proj1Id, task_id: tasks[0].id, user_id: pmId, action: 'TASK_CREATED', details: JSON.stringify({ title: tasks[0].title }) },
    { id: uuid(), project_id: proj1Id, task_id: tasks[0].id, user_id: dev1Id, action: 'TASK_STATUS_CHANGED', details: JSON.stringify({ from: 'TODO', to: 'DONE' }) },
    { id: uuid(), project_id: proj1Id, task_id: tasks[2].id, user_id: dev2Id, action: 'TASK_STATUS_CHANGED', details: JSON.stringify({ from: 'TODO', to: 'IN_PROGRESS' }) },
  ]);

  // ============ NOTIFICATIONS ============
  await knex('notifications').insert([
    { id: uuid(), user_id: dev1Id, type: 'TASK_ASSIGNED', title: 'New Task Assigned', message: 'You have been assigned "Build Kanban board"', reference_id: tasks[3].id },
    { id: uuid(), user_id: dev2Id, type: 'TASK_ASSIGNED', title: 'New Task Assigned', message: 'You have been assigned "Implement authentication"', reference_id: tasks[2].id },
    { id: uuid(), user_id: dev1Id, type: 'COMMENT_ADDED', title: 'New Comment', message: 'Patricia Manager commented on "Fix login redirect bug"', reference_id: tasks[6].id, is_read: true },
  ]);
}
