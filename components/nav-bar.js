import {useStyletron} from 'styletron-react'; 
import {Button} from 'antd';
import {ArrowLeftOutlined} from '@ant-design/icons'; 
import {useRouter} from 'next/router'
import {supabase} from '../utils/supabase'
import {ROUTES} from '../constants/routes'; 

export default function NavBar({backRoute}) { 
  const [css] = useStyletron(); 
  const router = useRouter(); 

  async function logout() {
    const a = await supabase.auth.signOut(); 
    router.push(ROUTES.HOME)
  }

  return (
    <div className={css({
      width: '100%', 
      display: 'flex', 
      justifyContent: 'space-between', 
    })}>
      <Button type="default" shape="circle" icon={<ArrowLeftOutlined />} size="large" onClick={() => router.push(backRoute)} /> 
      <Button type="default" onClick={logout}>Logout</Button>
    </div>
  );
} 
