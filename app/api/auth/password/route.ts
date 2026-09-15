import {body,db,fail,identity,invalid} from '@/lib/server';
import {hashPassword} from '@/lib/auth';

export async function POST(req:Request){try{
 const u=await identity(req),b=await body(req),password=String(b.password||'');
 if(password.length<12||password.length>128)invalid('A nova senha deve ter entre 12 e 128 caracteres.');
 const upper=/[A-Z]/.test(password),lower=/[a-z]/.test(password),number=/\d/.test(password);if(!(upper&&lower&&number))invalid('Use ao menos uma letra maiúscula, uma minúscula e um número.');
 const p=await hashPassword(password),now=new Date().toISOString();
 await db().prepare('UPDATE users SET password_hash=?,password_salt=?,password_iterations=?,must_change_password=0,failed_attempts=0,locked_until=NULL,updated=? WHERE id=?').bind(p.hash,p.salt,p.iterations,now,u.accountId).run();
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return fail(e)}}
