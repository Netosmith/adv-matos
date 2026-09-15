import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';

export const SESSION_COOKIE='matos_session';
export const PASSWORD_ITERATIONS=150000;

type SessionRow={
 accountId:string;
 workspaceId:string;
 username:string;
 displayName:string;
 email:string;
 role:string;
 mustChangePassword:number;
 dataOwner:string;
 expires:string;
};

export type SessionUser={
 userId:string;
 accountId:string;
 workspaceId:string;
 username:string;
 displayName:string;
 email:string;
 role:string;
 mustChangePassword:boolean;
};

function authDb(){const d=(env as unknown as {DB:D1Database}).DB;if(!d)throw new Error('Database unavailable');return d;}

function toBase64(bytes:Uint8Array){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s)}
function fromBase64(value:string){const s=atob(value);const out=new Uint8Array(s.length);for(let i=0;i<s.length;i++)out[i]=s.charCodeAt(i);return out}
function randomToken(){const bytes=crypto.getRandomValues(new Uint8Array(32));return toBase64(bytes).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function safeEqual(a:Uint8Array,b:Uint8Array){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0}

export function normalizeUsername(value:string){return value.trim().toLowerCase().replace(/\s+/g,'')}

export async function hashPassword(password:string,saltBase64?:string,iterations=PASSWORD_ITERATIONS){
 const salt=saltBase64?fromBase64(saltBase64):crypto.getRandomValues(new Uint8Array(16));
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations},key,256);
 return {hash:toBase64(new Uint8Array(bits)),salt:toBase64(salt),iterations};
}

export async function verifyPassword(password:string,salt:string,expectedHash:string,iterations:number){
 const actual=await hashPassword(password,salt,iterations);
 return safeEqual(fromBase64(actual.hash),fromBase64(expectedHash));
}

async function tokenHash(token:string){
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
 return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}

function cookieValue(header:string,name:string){
 const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const m=header.match(new RegExp('(?:^|;\\s*)'+escaped+'=([^;]*)'));
 return m?decodeURIComponent(m[1]):'';
}

async function userFromToken(token:string):Promise<SessionUser|null>{
 if(!token)return null;const id=await tokenHash(token),now=new Date().toISOString();
 const row=await authDb().prepare(`SELECT u.id AS accountId,u.workspace_id AS workspaceId,u.username AS username,u.display_name AS displayName,COALESCE(u.email,'') AS email,u.role AS role,u.must_change_password AS mustChangePassword,w.data_owner AS dataOwner,s.expires AS expires FROM sessions s JOIN users u ON u.id=s.user_id JOIN workspaces w ON w.id=u.workspace_id WHERE s.id=? AND s.expires>? AND u.active=1`).bind(id,now).first<SessionRow>();
 if(!row)return null;
 return {userId:row.dataOwner,accountId:row.accountId,workspaceId:row.workspaceId,username:row.username,displayName:row.displayName,email:row.email||row.username,role:row.role,mustChangePassword:Boolean(row.mustChangePassword)};
}

export async function getRequestUser(req:Request){return userFromToken(cookieValue(req.headers.get('cookie')||'',SESSION_COOKIE))}
export async function getCurrentUser(){const jar=await cookies();return userFromToken(jar.get(SESSION_COOKIE)?.value||'')}

export async function createSession(accountId:string,remember:boolean){
 const token=randomToken(),id=await tokenHash(token),created=new Date(),days=remember?30:1,expires=new Date(created.getTime()+days*24*60*60*1000);
 const d=authDb();await d.batch([d.prepare('DELETE FROM sessions WHERE expires<=?').bind(created.toISOString()),d.prepare('INSERT INTO sessions (id,user_id,expires,created) VALUES (?,?,?,?)').bind(id,accountId,expires.toISOString(),created.toISOString())]);
 return {token,maxAge:remember?30*24*60*60:undefined};
}

export async function destroySession(req:Request){
 const token=cookieValue(req.headers.get('cookie')||'',SESSION_COOKIE);if(!token)return;await authDb().prepare('DELETE FROM sessions WHERE id=?').bind(await tokenHash(token)).run();
}

export function sessionCookie(token:string,maxAge:number|undefined,secure=true){
 const parts=[`${SESSION_COOKIE}=${encodeURIComponent(token)}`,'Path=/','HttpOnly','SameSite=Lax'];if(secure)parts.push('Secure');if(maxAge)parts.push(`Max-Age=${maxAge}`);return parts.join('; ');
}
export function clearSessionCookie(secure=true){const parts=[`${SESSION_COOKIE}=`,'Path=/','HttpOnly','SameSite=Lax','Max-Age=0'];if(secure)parts.push('Secure');return parts.join('; ')}
