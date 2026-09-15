import {db,json,identity,fail,body,invalid} from '@/lib/server';
import {settingsSchema} from '@/lib/validation';
export async function POST(req:Request){try{const u=await identity(req);const r=settingsSchema.safeParse(await body(req));if(!r.success)invalid('Confira os dados do escritório.');await db().prepare('INSERT INTO settings (owner,data) VALUES (?,?) ON CONFLICT(owner) DO UPDATE SET data=excluded.data').bind(u.userId,JSON.stringify(r.data)).run();return json({ok:true})}catch(e){return fail(e)}}
