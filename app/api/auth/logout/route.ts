import {clearSessionCookie,destroySession} from '@/lib/auth';

export async function POST(req:Request){
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return new Response('Origem não autorizada.',{status:403});
 try{await destroySession(req)}catch{}
 const secure=new URL(req.url).protocol==='https:';
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store','Set-Cookie':clearSessionCookie(secure)}});
}
