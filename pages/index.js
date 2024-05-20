import {useContext, useState} from 'react'; 
import {useStyletron} from 'styletron-react'; 
import {message, Button, Input, Tooltip, Divider, Menu} from 'antd'; 
import {ArrowRightOutlined, QuestionCircleOutlined} from '@ant-design/icons'; 
import {useRouter} from 'next/router'
import {supabase} from '../utils/supabase'
import {ROUTES} from '../constants/routes'; 
import {SITE_URLS} from '../constants/site-urls'; 
import Link from 'next/link'; 
import Image from 'next/image'
import Demos from '../components/demos'; 
import Head from 'next/head'; 
import { UserContext } from '../data/contexts/user';

const {Search} = Input; 

function Wrapper({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      flexDirection: 'column', 
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
      width: '100%', 
      alignItems: 'center', 
      display: 'flex',
      flexDirection: 'column',  
    })}>
      © 2024 Rishi Kaneriya 
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
  const [css] = useStyletron(); 

  const handleLogin = async (email) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signIn({ email }, {
        redirectTo: process.env.NODE_ENV === 'production' ? SITE_URLS.PROD : SITE_URLS.DEV, 
      })
      if (error) throw error
      message.success('Check your email for the login link!')
    } catch (error) {
      message.error(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={css({marginTop: '20px', display: 'flex', alignItems: 'center'})}>
      <Search
        size='large'
        allowClear
        placeholder="Enter e-mail address"
        loading={loading} 
        enterButton="Sign in via magic link"
        onSearch={(email) => handleLogin(email)}
      />
      <Tooltip placement="right" title={'All you need in order to use Cognatus is an e-mail address. No need for a password!'}>
        <QuestionCircleOutlined style={{ marginLeft: '10px' }} />
      </Tooltip>
    </div>
  )
}

function HoverEffectText({text}) { 
  const [css] = useStyletron(); 
  const chars = text.split(''); 
  return (
    <>
      {
        chars.map((c, i) => (
          <div key={i} className={css({
            textTransform: 'lowercase',
            textDecoration: 'underline', 
            textDecorationThickness: '15px', 
            ':hover': { 
              color: '#40a9ff', 
            }, 
          })}>
            {c}
          </div>
        ))
      }
    </>
  )
}

async function logout() {
  await supabase.auth.signOut(); 
}

export default function Home() {
  const [css] = useStyletron(); 
  const router = useRouter();
  const {user} = useContext(UserContext);  

  return (
    <>
      <Head>
        <title>Cognatus</title>
      </Head>
      <Wrapper>
        <Content>
          <div className={css({
            fontWeight: '500', 
            fontSize: '120px', 
            display: 'flex', 
          })}>
            <HoverEffectText text='cognatus' />
          </div>

          <div className={css({fontStyle: 'italic', fontSize: '24px'})}>
            Stay
            {' '}
            <Link href={ROUTES.ADMIN}>
              <a>connected</a>
            </Link> 
            {' '}
            to your family
          </div>
          {
            user 
              ? <>
                  <Button 
                    size='large'
                    style={{ margin: '20px 0px' }}
                    type="primary" 
                    onClick={() => router.push(ROUTES.ADMIN)}
                  >
                    View your family trees <ArrowRightOutlined />
                  </Button>
                  <div className={css({color: 'gray'})}>
                    Logged in as {user?.email}. (
                    <a onClick={logout}>
                      Logout
                    </a>
                    )
                  </div>
                </>
              : <Login />
          }
          <Button 
            size='large'
            style={{ marginTop: '20px'}}
            type='default'
            onClick={() => router.push(ROUTES.ABOUT)}
          >
            Learn more
          </Button>
          <Divider />
          <div className={css({fontStyle: 'italic', fontWeight: 300, fontSize: '18px'})}>
            Or, check out one of these demo trees:
          </div>
          <Demos />
        </Content>
        <Footer /> 
      </Wrapper>
    </>
  ); 
}

export async function getServerSideProps({ req }) {
  const { user } = await supabase.auth.api.getUserByCookie(req)
  if (!user) {
    return { props: {} }; 
  }
  return { props: { user } }
}