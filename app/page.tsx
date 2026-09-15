import Portal from './portal';
import LoginForm,{ChangePasswordForm} from './login-form';
import {getCurrentUser} from '@/lib/auth';

export const dynamic='force-dynamic';

export default async function Home(){
 const user=await getCurrentUser();
 if(!user)return <LoginForm/>;
 if(user.mustChangePassword)return <ChangePasswordForm username={user.username}/>;
 return <Portal user={{name:user.displayName,email:user.email||user.username}}/>;
}
