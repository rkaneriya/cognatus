import {useState} from 'react'; 
import {useStyletron} from 'styletron-react'; 
import {Alert, Button, Input} from 'antd'; 
import {ArrowRightOutlined} from '@ant-design/icons'; 
import {useRouter} from 'next/router'
import {supabase} from '../utils/supabase'
import {Title, Subtitle} from '../components/typography'; 
import {ROUTES} from '../constants/routes'; 

const {Search} = Input; 

function ContentWrapper({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center'
    })}>
      {children}
    </div>
  ); 
}

function Footer() {
  const [css] = useStyletron(); 
  return (
    <div className={css({
      color: 'lightgray',
      position: 'absolute', 
      bottom: '10px', 
      width: '100%', 
      textAlign: 'center', 
    })}>
      © 2021 Rishi Kaneriya 
    </div>
  ); 
}

function Content({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      display: 'flex',
      flexDirection: 'column', 
      alignItems: 'center', 
    })}>
      {children}
    </div>
  ); 
}

function Login() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(''); 
  const [css] = useStyletron(); 

  const handleLogin = async (email) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signIn({ email })
      if (error) throw error
      setMessage('Check your email for the login link!'); 
    } catch (error) {
      setMessage(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={css({marginTop: '20px'})}>
      <Search
        allowClear
        placeholder="Enter e-mail address"
        loading={loading} 
        enterButton="Sign in via magic link"
        onSearch={(email) => handleLogin(email)}
      />
      {message && <Alert style={{ marginTop: '20px' }} message={message} type='warning' />} 
    </div>
  )
}

export default function Home() {
  const router = useRouter(); 
  const user = supabase.auth.user(); 
  const session = supabase.auth.session(); 

  return (
    <>
      <ContentWrapper>
        <Content>
          <Title>COGNATUS</Title>
          <Subtitle>Stay connected to your family</Subtitle>
          {
            session 
              ? <Button style={{ marginTop: '20px' }} type="primary" onClick={() => router.push(ROUTES.ADMIN)}>View your trees <ArrowRightOutlined /></Button>
              : <Login />
          }
        </Content>
      </ContentWrapper>
      <Footer /> 
    </>
  ); 
}
