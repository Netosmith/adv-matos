const LOCAL_KEY='matos_auth_token';
const SESSION_KEY='matos_auth_token_session';
let nativeFetch:typeof window.fetch|null=null;

declare global{interface Window{__MATOS_API_URL__?:string}}

export function apiBase(){return (window.__MATOS_API_URL__||'').trim().replace(/\/$/,'')}
export function apiUrl(path:string){const base=apiBase();if(!base)throw new Error('A API do portal ainda não foi configurada.');return base+(path.startsWith('/')?path:'/'+path)}
export function getToken(){return sessionStorage.getItem(SESSION_KEY)||localStorage.getItem(LOCAL_KEY)||''}
export function saveToken(token:string,remember:boolean){clearToken();(remember?localStorage:sessionStorage).setItem(remember?LOCAL_KEY:SESSION_KEY,token)}
export function clearToken(){localStorage.removeItem(LOCAL_KEY);sessionStorage.removeItem(SESSION_KEY)}

function withAuth(init:RequestInit={}){
 const headers=new Headers(init.headers||{}),token=getToken();if(token)headers.set('Authorization','Bearer '+token);return {...init,headers};
}

export async function apiFetch(path:string,init:RequestInit={}){
 const fn=nativeFetch||window.fetch.bind(window),response=await fn(apiUrl(path),withAuth(init));
 if(response.status===401&& !path.includes('/auth/login')){clearToken();window.dispatchEvent(new CustomEvent('matos-auth-expired'))}
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
