import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
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
