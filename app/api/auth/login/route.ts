import {body,db,fail,invalid} from '@/lib/server';
import {createSession,normalizeUsername,sessionCookie,verifyPassword} from '@/lib/auth';

const DUMMY_SALT='YRwwwynU8equZ+NlM8WCjA==';
const DUMMY_HASH='/HPTQONGOQQe/+sRvLpxxMkUKWHDqxdDLyHX8BG0yt8=';

export async function POST(req:Request){try{
 const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)throw new Response('Origem não autorizada.',{status:403});
 const b=await body(req),username=normalizeUsername(String(b.username||'')),password=String(b.password||''),remember=Boolean(b.remember);
 if(!/^[a-z0-9._-]{3,60}$/.test(username)||password.length<1||password.length>128)invalid('Informe usuário e senha.');
 const d=db();const row:any=await d.prepare('SELECT id,username,display_name,password_hash,password_salt,password_iterations,active,failed_attempts,locked_until,must_change_password FROM users WHERE username=? LIMIT 1').bind(username).first();
 if(!row){await verifyPassword(password,DUMMY_SALT,DUMMY_HASH,150000);return Response.json({error:'Usuário ou senha inválidos.'},{status:401,headers:{'Cache-Control':'no-store'}})}
 if(!row.active)return Response.json({error:'Usuário ou senha inválidos.'},{status:401,headers:{'Cache-Control':'no-store'}});
 const now=new Date();if(row.locked_until&&new Date(row.locked_until)>now)return Response.json({error:'Acesso temporariamente bloqueado. Tente novamente em alguns minutos.'},{status:429,headers:{'Cache-Control':'no-store'}});
 const ok=await verifyPassword(password,row.password_salt,row.password_hash,Number(row.password_iterations)||150000);
 if(!ok){const attempts=Number(row.failed_attempts||0)+1,lock=attempts>=5?new Date(now.getTime()+15*60*1000).toISOString():null;await d.prepare('UPDATE users SET failed_attempts=?,locked_until=?,updated=? WHERE id=?').bind(attempts>=5?0:attempts,lock,now.toISOString(),row.id).run();return Response.json({error:lock?'Muitas tentativas. Acesso bloqueado por 15 minutos.':'Usuário ou senha inválidos.'},{status:lock?429:401,headers:{'Cache-Control':'no-store'}})}
 await d.prepare('UPDATE users SET failed_attempts=0,locked_until=NULL,updated=? WHERE id=?').bind(now.toISOString(),row.id).run();
 const s=await createSession(row.id,remember),secure=new URL(req.url).protocol==='https:';
 return Response.json({ok:true,mustChangePassword:Boolean(row.must_change_password)},{headers:{'Cache-Control':'no-store','Set-Cookie':sessionCookie(s.token,s.maxAge,secure)}});
 }catch(e){return fail(e)}}
