import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', {
 id:text('id').primaryKey(), owner:text('owner').notNull(), kind:text('kind').notNull(),
 data:text('data').notNull(), version:integer('version').notNull().default(1),
 created:text('created').notNull(), updated:text('updated').notNull()
},t=>[index('records_owner_kind').on(t.owner,t.kind)]);
export const files=sqliteTable('files',{
 id:text('id').primaryKey(),owner:text('owner').notNull(),name:text('name').notNull(),
 category:text('category').notNull(),clientId:text('client_id').notNull().default(''),processId:text('process_id').notNull().default(''),
 size:integer('size').notNull(),mime:text('mime').notNull(),created:text('created').notNull()
},t=>[index('files_owner').on(t.owner)]);
export const activity=sqliteTable('activity',{
 id:text('id').primaryKey(),owner:text('owner').notNull(),actor:text('actor').notNull(),action:text('action').notNull(),detail:text('detail').notNull(),created:text('created').notNull()
},t=>[index('activity_owner_created').on(t.owner,t.created)]);
export const settings=sqliteTable('settings',{owner:text('owner').primaryKey(),data:text('data').notNull()});
export const workspaces=sqliteTable('workspaces',{
 id:text('id').primaryKey(),name:text('name').notNull(),dataOwner:text('data_owner').notNull()
});
export const users=sqliteTable('users',{
 id:text('id').primaryKey(),workspaceId:text('workspace_id').notNull(),username:text('username').notNull(),displayName:text('display_name').notNull(),email:text('email').notNull().default(''),
 passwordHash:text('password_hash').notNull(),passwordSalt:text('password_salt').notNull(),passwordIterations:integer('password_iterations').notNull().default(150000),
 role:text('role').notNull().default('USUARIO'),active:integer('active').notNull().default(1),failedAttempts:integer('failed_attempts').notNull().default(0),lockedUntil:text('locked_until'),mustChangePassword:integer('must_change_password').notNull().default(0),
 created:text('created').notNull(),updated:text('updated').notNull()
},t=>[uniqueIndex('users_username_unique').on(t.username),index('users_workspace').on(t.workspaceId)]);
export const sessions=sqliteTable('sessions',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),expires:text('expires').notNull(),created:text('created').notNull()
},t=>[index('sessions_user').on(t.userId),index('sessions_expires').on(t.expires)]);
