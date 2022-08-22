import { useContext } from 'react';
import {useStyletron} from 'styletron-react'; 
import {Button} from 'antd';
import {useRouter} from 'next/router'
import {supabase} from '../utils/supabase'
import {ROUTES} from '../constants/routes'; 
import { UserContext } from '../data/contexts/user';

export default function NavBar() { 
  const [css] = useStyletron(); 
  const router = useRouter(); 
  const {user} = useContext(UserContext); 

  async function logout() {
    const a = await supabase.auth.signOut(); 
    router.push(ROUTES.HOME)
  }

  return (
    <div className={css({
      width: '100%', 
      display: 'flex', 
      justifyContent: 'flex-end', 
      alignItems: 'center', 
      marginBottom: '48px', 
    })}>
      <div className={css({
        color: 'lightgray',
        marginRight: '10px', 
      })}>Logged in as {user?.email}</div>
      <Button type="default" onClick={logout}>Logout</Button>
    </div>
  );
} 
