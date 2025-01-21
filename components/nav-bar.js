import { useContext } from 'react';
import {Button} from 'antd';
import {useRouter} from 'next/router'
import {supabase} from '../utils/supabase'
import {ROUTES} from '../constants/routes'; 
import { UserContext } from '../data/contexts/user';

export default function NavBar() { 
  const router = useRouter(); 
  const {user} = useContext(UserContext); 

  async function logout() {
    const a = await supabase.auth.signOut(); 
    router.push(ROUTES.HOME)
  }

  return (
    <div className='w-full flex justify-end items-center mb-12'>
      <div className='text-gray-300 mr-4'>Logged in as {user?.email}</div>
      <Button type="default" onClick={logout}>Logout</Button>
    </div>
  );
} 
