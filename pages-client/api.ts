const LOCAL_KEY='matos_auth_token';
const SESSION_KEY='matos_auth_token_session';
let nativeFetch:typeof window.fetch|null=null;

declare global{interface Window{__MATOS_API_URL__?:string}}

export function apiBase(){return (window.__MATOS_API_URL__||'').trim()}
export function apiUrl(){const base=apiBase();if(!base)throw new Error('O Apps Script do portal ainda não foi configurado.');return base}
export function getToken(){return sessionStorage.getItem(SESSION_KEY)||localStorage.getItem(LOCAL_KEY)||''}
export function saveToken(token:string,remember:boolean){clearToken();(remember?localStorage:sessionStorage).setItem(remember?LOCAL_KEY:SESSION_KEY,token)}
export function clearToken(){localStorage.removeItem(LOCAL_KEY);sessionStorage.removeItem(SESSION_KEY)}

function pathAction(path:string,method:string){
 const clean=path.split('?')[0];
 if(clean==='/api/auth/login')return 'auth.login';
 if(clean==='/api/auth/session')return 'auth.session';
 if(clean==='/api/auth/logout')return 'auth.logout';
 if(clean==='/api/auth/password')return 'auth.password';
 if(clean==='/api/records')return method==='POST'?'records.save':'records.list';
 if(clean==='/api/settings')return 'settings.save';
 if(clean==='/api/files')return method==='POST'?'files.upload':method==='DELETE'?'files.delete':'files.get';
 throw new Error('Rota não reconhecida: '+clean);
}

function queryData(path:string){const i=path.indexOf('?');if(i<0)return {};return Object.fromEntries(new URLSearchParams(path.slice(i+1)).entries())}

async function bodyData(body:BodyInit|null|undefined){
 if(!body)return {};
 if(typeof body==='string'){try{return JSON.parse(body)}catch{return {value:body}}}
 if(body instanceof Blob){const buffer=await body.arrayBuffer(),bytes=new Uint8Array(buffer);let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return {base64:btoa(binary),mimeType:body.type||'application/octet-stream'};}
 return {};
}

function base64Bytes(value:string){const binary=atob(value),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes}

export async function apiFetch(path:string,init:RequestInit={}){
 const method=(init.method||'GET').toUpperCase(),action=pathAction(path,method),token=getToken();
 const payload={action,token,...queryData(path),...(await bodyData(init.body))};
 if(action==='records.save'&&payload.kind)Object.assign(payload,{record:{kind:payload.kind,id:payload.id,version:payload.version,data:payload.data}});
 if(action==='settings.save')Object.assign(payload,{settings:{name:payload.name,oab:payload.oab,document:payload.document,email:payload.email,phone:payload.phone,address:payload.address}});
 const fn=nativeFetch||window.fetch.bind(window);
 let response:Response;
 try{
  const raw=await fn(apiUrl(),{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
  const text=await raw.text();let data:any={};try{data=JSON.parse(text)}catch{throw new Error('Resposta inválida do Apps Script. Verifique a implantação do Web App.')}
  if(!data.ok){response=new Response(JSON.stringify({error:data.error||'Não foi possível concluir.'}),{status:data.error?.toLowerCase().includes('sessão')?401:400,headers:{'Content-Type':'application/json'}})}
  else if(action==='files.get'&&data.base64){response=new Response(base64Bytes(data.base64),{status:200,headers:{'Content-Type':data.mimeType||'application/octet-stream','X-Matos-Filename':encodeURIComponent(data.name||'documento')}})}
  else{const {ok,...rest}=data;response=new Response(JSON.stringify(rest),{status:200,headers:{'Content-Type':'application/json'}})}
 }catch(err){response=new Response(JSON.stringify({error:(err as Error).message||'Falha de comunicação com o Google Apps Script.'}),{status:503,headers:{'Content-Type':'application/json'}})}
 if(response.status===401&&!path.includes('/auth/login')){clearToken();window.dispatchEvent(new CustomEvent('matos-auth-expired'))}
 return response;
}

export function installApiBridge(){
 if(nativeFetch)return;nativeFetch=window.fetch.bind(window);
 window.fetch=(input:RequestInfo|URL,init?:RequestInit)=>{
  const raw=typeof input==='string'?input:input instanceof URL?input.toString():input.url;
  if(raw.startsWith('/api/'))return apiFetch(raw,init);
  return nativeFetch!(input,init);
 };
}

export async function readJson(response:Response){const text=await response.text();let data:any={};try{data=JSON.parse(text)}catch{}if(!response.ok)throw new Error(data.error||text||'Não foi possível concluir.');return data}
