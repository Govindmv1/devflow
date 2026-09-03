import { Knex } from 'knex';

/**
 * Migration: Create all initial tables for DevFlow.
 * 
 * Schema Design Decisions:
 * - CHAR(36) for UUID primary keys (portable across PG / MySQL)
 * - Enum-style columns stored as VARCHAR
 * - Timestamps on all tables for audit trail
 * - Foreign keys with appropriate CASCADE behavior
 * - Indexes on frequently queried columns
 */
export async function up(knex: Knex): Promise<void> {
  // ============ USERS TABLE ============
  await knex.schema.createTable('users', (table) => {
    table.string('id', 36).primary();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('role', 20).notNullable().defaultTo('DEVELOPER');
    table.string('avatar_url', 500).nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true); // created_at, updated_at
  });

  // ============ REFRESH TOKENS TABLE ============
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.string('id', 36).primary();
    table.string('user_id', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token', 500).notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.timestamps(true, true);
    table.index('token');
    table.index('user_id');
  });

  // ============ PROJECTS TABLE ============
  await knex.schema.createTable('projects', (table) => {
    table.string('id', 36).primary();
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.string('status', 20).notNullable().defaultTo('PLANNING');
    table.string('priority', 20).notNullable().defaultTo('MEDIUM');
    table.date('start_date').nullable();
    table.date('deadline').nullable();
    table.string('created_by', 36).notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.timestamps(true, true);
    table.index('status');
    table.index('created_by');
  });

  // ============ PROJECT MEMBERS TABLE ============
  await knex.schema.createTable('project_members', (table) => {
    table.string('id', 36).primary();
    table.string('project_id', 36).notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.string('user_id', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('role', 20).notNullable().defaultTo('DEVELOPER');
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    table.unique(['project_id', 'user_id']); // No duplicate memberships
    table.index('project_id');
    table.index('user_id');
  });

  // ============ TASKS TABLE ============
  await knex.schema.createTable('tasks', (table) => {
    table.string('id', 36).primary();
    table.string('title', 500).notNullable();
    table.text('description').nullable();
    table.string('project_id', 36).notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.string('assigned_to', 36).nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('created_by', 36).notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.string('priority', 20).notNullable().defaultTo('MEDIUM');
    table.string('status', 20).notNullable().defaultTo('TODO');
    table.date('due_date').nullable();
    table.decimal('estimated_hours', 6, 2).nullable();
    table.timestamps(true, true);
    table.index('project_id');
    table.index('assigned_to');
    table.index('status');
    table.index('priority');
  });

  // ============ TAGS TABLE ============
  await knex.schema.createTable('tags', (table) => {
    table.string('id', 36).primary();
    table.string('name', 50).notNullable().unique();
    table.string('color', 7).notNullable().defaultTo('#3b82f6');
    table.timestamps(true, true);
  });

  // ============ TASK_TAGS (junction table) ============
  await knex.schema.createTable('task_tags', (table) => {
    table.string('task_id', 36).notNullable().references('id').inTable('tasks').onDelete('CASCADE');
    table.string('tag_id', 36).notNullable().references('id').inTable('tags').onDelete('CASCADE');
    table.primary(['task_id', 'tag_id']);
  });

  // ============ COMMENTS TABLE ============
  await knex.schema.createTable('comments', (table) => {
    table.string('id', 36).primary();
    table.string('task_id', 36).notNullable().references('id').inTable('tasks').onDelete('CASCADE');
    table.string('user_id', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('content').notNullable();
    table.timestamps(true, true);
    table.index('task_id');
  });

  // ============ ACTIVITY LOGS TABLE ============
  await knex.schema.createTable('activity_logs', (table) => {
    table.string('id', 36).primary();
    table.string('project_id', 36).notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.string('task_id', 36).nullable().references('id').inTable('tasks').onDelete('SET NULL');
    table.string('user_id', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('action', 50).notNullable();
    table.json('details').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('project_id');
    table.index(['project_id', 'created_at']);
  });

  // ============ NOTIFICATIONS TABLE ============
  await knex.schema.createTable('notifications', (table) => {
    table.string('id', 36).primary();
    table.string('user_id', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('type', 30).notNullable();
    table.string('title', 255).notNullable();
    table.text('message').notNullable();
    table.string('reference_id', 36).nullable();
    table.boolean('is_read').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index('user_id');
    table.index(['user_id', 'is_read']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('activity_logs');
  await knex.schema.dropTableIfExists('comments');
  await knex.schema.dropTableIfExists('task_tags');
  await knex.schema.dropTableIfExists('tags');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('project_members');
  await knex.schema.dropTableIfExists('projects');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
}
