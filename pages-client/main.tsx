import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowRight,Eye,EyeOff,LoaderCircle,LockKeyhole,ShieldCheck,UserRound,ServerCog} from 'lucide-react';
import Portal from '../app/portal';
import '../app/globals.css';
import '../app/login.css';
import './pages.css';
import {apiBase,apiFetch,clearToken,getToken,installApiBridge,readJson,saveToken} from './api';

type PortalUser={username:string;displayName:string;email:string;role:string;mustChangePassword:boolean};

installApiBridge();

function Brand(){return <div className="auth-brand"><img src="/adv-matos/logo.png" alt="Matos Advocacia"/></div>}

function Login({onLogin}:{onLogin:(u:PortalUser)=>void}){
 const [username,setUsername]=useState(''),[password,setPassword]=useState(''),[remember,setRemember]=useState(true),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(e:React.FormEvent){e.preventDefault();if(busy)return;setBusy(true);setError('');try{const data=await readJson(await apiFetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password,remember})}));saveToken(data.token,remember);onLogin(data.user)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <main className="auth-page"><div className="auth-shell"><Brand/><section className="auth-card"><span className="auth-eyebrow">PORTAL ADMINISTRATIVO</span><h1>Acesso ao Portal</h1><p className="auth-copy">Entre com seu usuário e senha para acessar os registros do escritório.</p><form onSubmit={submit} className="auth-form"><label><span>Usuário</span><div className="auth-input"><UserRound size={18}/><input value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Digite seu usuário" required/></div></label><label><span>Senha</span><div className="auth-input"><LockKeyhole size={18}/><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="Digite sua senha" required/><button type="button" className="auth-eye" onClick={()=>setShow(v=>!v)} aria-label={show?'Ocultar senha':'Mostrar senha'}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label><label className="auth-remember"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/><span>Lembrar meu acesso neste dispositivo</span></label>{error&&<div className="auth-error" role="alert">{error}</div>}<button className="auth-submit" disabled={busy}>{busy?<><LoaderCircle className="auth-spin" size={18}/>Entrando...</>:<>Entrar <ArrowRight size={18}/></>}</button></form><div className="auth-secure"><ShieldCheck size={16}/><span>Acesso privado e protegido</span></div></section><p className="auth-footer">Matos Advocacia · Portal de gestão</p></div></main>;
}

function ChangePassword({user,onDone}:{user:PortalUser;onDone:(u:PortalUser)=>void}){
 const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(e:React.FormEvent){e.preventDefault();setError('');if(password!==confirm){setError('As senhas não coincidem.');return}setBusy(true);try{await readJson(await apiFetch('/api/auth/password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})}));onDone({...user,mustChangePassword:false})}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <main className="auth-page"><div className="auth-shell"><Brand/><section className="auth-card"><span className="auth-eyebrow">PRIMEIRO ACESSO</span><h1>Crie sua nova senha</h1><p className="auth-copy">Você entrou como <strong>{user.username}</strong>. Por segurança, substitua a senha provisória antes de abrir o portal.</p><form onSubmit={submit} className="auth-form"><label><span>Nova senha</span><div className="auth-input"><LockKeyhole size={18}/><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" placeholder="Mínimo de 12 caracteres" required minLength={12}/><button type="button" className="auth-eye" onClick={()=>setShow(v=>!v)} aria-label={show?'Ocultar senha':'Mostrar senha'}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label><label><span>Confirme a nova senha</span><div className="auth-input"><LockKeyhole size={18}/><input type={show?'text':'password'} value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password" placeholder="Repita a nova senha" required minLength={12}/></div></label><p className="auth-rule">Use pelo menos 12 caracteres, com letra maiúscula, minúscula e número.</p>{error&&<div className="auth-error" role="alert">{error}</div>}<button className="auth-submit" disabled={busy}>{busy?<><LoaderCircle className="auth-spin" size={18}/>Salvando...</>:<>Salvar nova senha <ArrowRight size={18}/></>}</button></form><div className="auth-secure"><ShieldCheck size={16}/><span>A senha provisória deixa de valer após esta etapa.</span></div></section></div></main>;
}

function BackendMissing(){return <main className="auth-page"><div className="auth-shell"><Brand/><section className="auth-card"><span className="auth-eyebrow">CONFIGURAÇÃO DO PORTAL</span><h1>Backend em preparação</h1><p className="auth-copy">A interface do GitHub Pages está pronta. Falta vincular o endereço seguro da API do Matos Advocacia.</p><div className="backend-status"><ServerCog size={25}/><span>Frontend: <strong>GitHub Pages</strong><br/>API: aguardando configuração</span></div><div className="auth-secure"><ShieldCheck size={16}/><span>Nenhum dado do escritório é armazenado no GitHub Pages.</span></div></section></div></main>}

function StaticApp(){
 const [user,setUser]=useState<PortalUser|null>(null),[loading,setLoading]=useState(Boolean(apiBase()&&getToken()));
 useEffect(()=>{const expired=()=>{clearToken();setUser(null);setLoading(false)};window.addEventListener('matos-auth-expired',expired);return()=>window.removeEventListener('matos-auth-expired',expired)},[]);
 useEffect(()=>{if(!apiBase()||!getToken()){setLoading(false);return}void (async()=>{try{const data=await readJson(await apiFetch('/api/auth/session'));setUser(data.user)}catch{clearToken();setUser(null)}finally{setLoading(false)}})()},[]);
 useEffect(()=>{
  if(!user)return;
  const rewrite=()=>{document.querySelectorAll<HTMLImageElement>('img[src="/logo.png"]').forEach(img=>img.src='/adv-matos/logo.png');document.querySelectorAll<HTMLElement>('.settings-account small').forEach(el=>{if(el.textContent?.includes('ChatGPT'))el.textContent='Autenticação protegida do Portal Matos Advocacia.'})};
  rewrite();const observer=new MutationObserver(rewrite);observer.observe(document.body,{childList:true,subtree:true});
  const click=async(e:MouseEvent)=>{const target=e.target as Element|null,a=target?.closest?.('a') as HTMLAnchorElement|null;if(!a)return;const href=a.getAttribute('href')||'';
   if(href.startsWith('/signout-with-chatgpt')){e.preventDefault();try{await apiFetch('/api/auth/logout',{method:'POST'})}catch{}clearToken();setUser(null);return}
   if(href.startsWith('/api/files')){e.preventDefault();try{const r=await apiFetch(href);if(!r.ok)throw new Error(await r.text()||'Arquivo indisponível.');const blob=await r.blob(),url=URL.createObjectURL(blob),preview=new URLSearchParams(href.split('?')[1]||'').get('preview')==='1';if(preview){window.open(url,'_blank','noopener,noreferrer');setTimeout(()=>URL.revokeObjectURL(url),60000)}else{const down=document.createElement('a');down.href=url;down.download=(a.getAttribute('aria-label')||'Baixar documento').replace(/^Baixar\s+/,'')||'documento';document.body.appendChild(down);down.click();down.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}}catch(err){alert((err as Error).message)}}
  };
  document.addEventListener('click',click);return()=>{observer.disconnect();document.removeEventListener('click',click)};
 },[user]);
 if(!apiBase())return <BackendMissing/>;
 if(loading)return <main className="auth-page"><div className="portal-loader"><LoaderCircle className="auth-spin" size={28}/><span>Validando acesso...</span></div></main>;
 if(!user)return <Login onLogin={setUser}/>;
 if(user.mustChangePassword)return <ChangePassword user={user} onDone={setUser}/>;
 return <Portal user={{name:user.displayName,email:user.email||user.username}}/>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><StaticApp/></React.StrictMode>);
