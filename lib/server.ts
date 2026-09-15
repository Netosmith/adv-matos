import { env } from 'cloudflare:workers';
import { getRequestUser } from '@/lib/auth';
export function db(){const d=(env as unknown as {DB:D1Database}).DB;if(!d)throw new Error('Database unavailable');return d;}
export function bucket(){const b=(env as unknown as {BUCKET:R2Bucket}).BUCKET;if(!b)throw new Error('Storage unavailable');return b;}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}
export async function identity(req:Request){
 const u=await getRequestUser(req);if(!u)throw new Response('Sessão expirada. Entre novamente.',{status:401});
 if(!['GET','HEAD'].includes(req.method)){
  const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)throw new Response('Origem não autorizada.',{status:403});
 }
 return u;
}
export function fail(e:unknown){if(e instanceof Response)return e;console.error('Matos API',e);return json({error:'Não foi possível concluir. Tente novamente; seus dados digitados foram preservados.'},503)}
export async function body(req:Request){const s=await req.text();if(s.length>250000)throw new Response('Conteúdo muito grande.',{status:413});try{return JSON.parse(s)}catch{throw new Response('Dados inválidos.',{status:400})}}
export function invalid(message:string):never{throw new Response(message,{status:400})}
export async function audit(owner:string,actor:string,action:string,detail:string){await db().prepare('INSERT INTO activity (id,owner,actor,action,detail,created) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),owner,actor,action,detail,new Date().toISOString()).run()}
export async function reference(owner:string,id:string,kind:string){if(!id)return;const row=await db().prepare('SELECT id FROM records WHERE owner=? AND id=? AND kind=?').bind(owner,id,kind).first();if(!row)invalid('O vínculo selecionado não está disponível. Atualize a lista.');}
