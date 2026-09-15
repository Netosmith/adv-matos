import {db,json,identity,fail,body,invalid,reference} from '@/lib/server';
import {schemas} from '@/lib/validation';
export async function GET(req:Request){try{
 const u=await identity(req);const d=db();const r=await d.batch([
 d.prepare('SELECT * FROM records WHERE owner=? ORDER BY updated DESC').bind(u.userId),
 d.prepare('SELECT * FROM files WHERE owner=? ORDER BY created DESC').bind(u.userId),
 d.prepare('SELECT * FROM activity WHERE owner=? ORDER BY created DESC LIMIT 80').bind(u.userId),
 d.prepare('SELECT data FROM settings WHERE owner=?').bind(u.userId)]);
 return json({records:r[0].results.map((v:any)=>({...v,data:JSON.parse(v.data),owner:undefined})),files:r[1].results.map((v:any)=>({...v,owner:undefined})),activity:r[2].results.map((v:any)=>({...v,owner:undefined})),settings:r[3].results[0]?JSON.parse((r[3].results[0] as any).data as string):null});
 }catch(e){return fail(e)}}
export async function POST(req:Request){try{
 const u=await identity(req);const b=await body(req);const kind=b.kind as keyof typeof schemas;if(!schemas[kind])invalid('Categoria inválida.');
 const result=schemas[kind].safeParse(b.data);if(!result.success)invalid('Confira os campos obrigatórios e os formatos informados.');const data=result.data as any;
 if(data.clientId)await reference(u.userId,data.clientId,'clients');if(data.processId)await reference(u.userId,data.processId,'processes');
 if(data.processId){const p:any=await db().prepare('SELECT data FROM records WHERE owner=? AND id=?').bind(u.userId,data.processId).first();if(JSON.parse(p.data).clientId!==data.clientId)invalid('O processo deve pertencer ao cliente selecionado.');}
 const now=new Date().toISOString(),id=typeof b.id==='string'?b.id:crypto.randomUUID(),d=db();
 const version=Number(b.version||0);if(b.id){const old:any=await d.prepare('SELECT version FROM records WHERE id=? AND owner=? AND kind=?').bind(id,u.userId,kind).first();if(!old)return json({error:'Registro não encontrado.'},404);if(old.version!==version)return json({error:'Este registro foi alterado em outra sessão. Copie suas alterações e reabra o registro atualizado.'},409)}
 const statement=b.id?d.prepare('UPDATE records SET data=?,version=version+1,updated=? WHERE id=? AND owner=? AND version=?').bind(JSON.stringify(data),now,id,u.userId,version):d.prepare('INSERT INTO records (id,owner,kind,data,version,created,updated) VALUES (?,?,?,?,1,?,?)').bind(id,u.userId,kind,JSON.stringify(data),now,now);
 const out=await d.batch([statement,d.prepare('INSERT INTO activity (id,owner,actor,action,detail,created) SELECT ?,?,?,?,?,? WHERE changes() > 0').bind(crypto.randomUUID(),u.userId,u.displayName,b.id?'Registro atualizado':'Novo registro',data.name,now)]);
 if(!out[0].meta.changes)return json({error:'Registro alterado em outra sessão. Reabra para editar.'},409);
 return json({id,version:b.id?version+1:1,updated:now});
 }catch(e){return fail(e)}}
