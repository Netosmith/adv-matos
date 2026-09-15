'use client';
import {useEffect} from 'react';

export default function AuthBridge(){
 useEffect(()=>{
  const click=(e:MouseEvent)=>{const target=e.target as Element|null;const link=target?.closest?.('a[href^="/signout-with-chatgpt"]') as HTMLAnchorElement|null;if(!link)return;e.preventDefault();void fetch('/api/auth/logout',{method:'POST'}).finally(()=>location.replace('/'))};
  document.addEventListener('click',click);return()=>document.removeEventListener('click',click);
 },[]);
 return null;
}
