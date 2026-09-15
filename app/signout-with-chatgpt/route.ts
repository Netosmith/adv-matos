import {clearSessionCookie,destroySession} from '@/lib/auth';

export async function GET(req:Request){
 try{await destroySession(req)}catch{}
 const url=new URL(req.url),secure=url.protocol==='https:';
 return new Response(null,{status:303,headers:{Location:'/', 'Cache-Control':'no-store','Set-Cookie':clearSessionCookie(secure)}});
}
